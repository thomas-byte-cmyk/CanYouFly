import { DEG, clamp, computeAggregates } from './aero';
import type { AircraftDef, Tuning } from './types';

/**
 * Caractère de vol d'un avion, calculé à partir de ses pièces (retour de test v0.4 :
 * « fabriquer l'avion doit avoir un impact »). Utilisé par la commande à un doigt
 * et affiché au joueur sous forme de barres.
 */
export interface Handling {
  /** Vitesse de décrochage (pleine charge). */
  stallSpeed: number;
  /** Vitesse d'approche (volets) : plus la charge alaire est forte, plus on atterrit vite. */
  approachSpeed: number;
  /** Vitesse de croisière visée par les gaz automatiques. */
  cruiseSpeed: number;
  /** Vitesse max en palier, plein gaz. */
  maxSpeed: number;
  /** Angle de montée possible (moteur vs poids et traînée). */
  climbDeg: number;
  /** Angle de descente naturel quand on relâche (finesse). */
  glideDeg: number;
  /** Finesse (L/D) en approche. */
  glideRatio: number;
  /** Vivacité en tangage (1 = Le Coucou). */
  pitchRateScale: number;
  /** Autonomie à gaz moyens (s). */
  rangeSeconds: number;
  /** Barres de 0 à 5 pour l'interface. */
  stats: { vitesse: number; montee: number; plane: number; autonomie: number; stabilite: number; solidite: number };
}

const REFERENCE_PITCH = 2.0 / 1724;

export function computeHandling(def: AircraftDef, t: Tuning): Handling {
  const agg = computeAggregates(def, def.fuel.capacity, t);
  const W = agg.mass * t.gravity;
  let clMaxArea = 0;
  let area = 0;
  for (const s of def.surfaces) {
    clMaxArea += s.area * s.liftSlope * s.stallAngleDeg * DEG;
    area += s.area;
  }
  const stallSpeed = Math.sqrt((2 * W) / (t.rho * clMaxArea));
  const dragAt = (V: number) => {
    const q = 0.5 * t.rho * V * V;
    const cl = W / (q * area);
    return q * (def.drag.parasite + def.drag.inducedK * area * cl * cl);
  };
  const thrustAt = (V: number) => def.engine.thrustMax * clamp(1 - V / def.engine.propVmax, 0, 1);

  const vClimb = stallSpeed * 1.5;
  const climbDeg = clamp(Math.asin(clamp((thrustAt(vClimb) - dragAt(vClimb)) / W, -1, 1)) / DEG, 2, 20);

  const approachSpeed = stallSpeed * 1.45;
  const glideRatio = W / dragAt(approachSpeed);
  const glideDeg = clamp(Math.atan(1 / glideRatio) / DEG, 3, 14);

  let maxSpeed = stallSpeed;
  for (let v = stallSpeed; v < 150; v += 0.5) {
    if (thrustAt(v) >= dragAt(v)) maxSpeed = v;
    else break;
  }
  const cruiseSpeed = clamp(Math.max(t.trimSpeed, stallSpeed * 2.1), stallSpeed * 1.6, maxSpeed * 0.92);

  const pitchRateScale = clamp(def.pitch.authority / agg.inertia / REFERENCE_PITCH, 0.6, 1.5);
  const rangeSeconds = def.fuel.capacity / (def.fuel.burnRate * 0.65);

  const bar = (v: number, lo: number, hi: number) => Math.round(clamp(((v - lo) / (hi - lo)) * 5, 0, 5) * 2) / 2;
  const sm = agg.staticMargin;
  return {
    stallSpeed,
    approachSpeed,
    cruiseSpeed,
    maxSpeed,
    climbDeg,
    glideDeg,
    glideRatio,
    pitchRateScale,
    rangeSeconds,
    stats: {
      vitesse: bar(maxSpeed, 35, 85),
      montee: bar(climbDeg, 3, 20),
      plane: bar(glideRatio, 4, 14),
      autonomie: bar(rangeSeconds, 50, 160),
      stabilite: bar(sm < 0 ? 0 : 0.25 - Math.abs(sm - 0.1), 0, 0.25),
      solidite: bar(def.gear.tolerance, 4, 10),
    },
  };
}
