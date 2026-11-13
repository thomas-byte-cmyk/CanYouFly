import type { AircraftDef, Aggregates, Tuning } from './types';

export const DEG = Math.PI / 180;

export function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

/** Ramène un angle dans ]−π, π]. */
export function wrapPi(a: number): number {
  let r = a % (2 * Math.PI);
  if (r > Math.PI) r -= 2 * Math.PI;
  if (r <= -Math.PI) r += 2 * Math.PI;
  return r;
}

/**
 * Coefficient de portance simplifié (docs/PHYSICS_AND_CONTROLS.md §3.1) :
 * linéaire jusqu'au décrochage, puis chute douce vers ~40 % du maximum (rattrapable),
 * et s'annule à 90° d'incidence.
 */
export function liftCoefficient(alpha: number, slope: number, stallRad: number): number {
  const a = Math.abs(alpha);
  if (a <= stallRad) return slope * alpha;
  const clMax = slope * stallRad;
  const post = clMax * (0.4 + 0.6 * Math.exp(-(a - stallRad) / 0.06));
  const fade = Math.sqrt(Math.max(0, Math.cos(a)));
  return Math.sign(alpha) * post * fade;
}

/** Densité de l'air « arcade » : constante puis décroissante (plafond doux). */
export function rhoAt(t: Tuning, altitude: number): number {
  if (altitude <= t.ceilingStart) return t.rho;
  const k = clamp((altitude - t.ceilingStart) / (t.ceilingEnd - t.ceilingStart), 0, 1);
  return t.rho * (1 - 0.75 * k);
}

/** Grandeurs agrégées de la construction (docs/PHYSICS_AND_CONTROLS.md §2). */
export function computeAggregates(def: AircraftDef, fuelMass: number, t: Tuning): Aggregates {
  let mass = fuelMass;
  let moment = fuelMass * def.fuel.x;
  for (const m of def.masses) {
    mass += m.mass;
    moment += m.mass * m.x;
  }
  const xCG = moment / mass;

  let aS = 0;
  let aSx = 0;
  let clMaxArea = 0;
  for (const s of def.surfaces) {
    aS += s.liftSlope * s.area;
    aSx += s.liftSlope * s.area * s.x;
    clMaxArea += s.area * s.liftSlope * s.stallAngleDeg * DEG;
  }
  const xNP = aSx / aS;

  let inertia = def.pitch.inertiaBase + fuelMass * (def.fuel.x - xCG) ** 2;
  for (const m of def.masses) inertia += m.mass * (m.x - xCG) ** 2;

  const wing = def.surfaces.find((s) => s.id === 'wing');
  const takeoffSpeed = Math.sqrt((2 * mass * t.gravity) / (t.rho * clMaxArea * 0.8));

  return {
    mass,
    xCG,
    xNP,
    staticMargin: (xCG - xNP) / def.refChord,
    inertia,
    wingArea: wing ? wing.area : 0,
    takeoffSpeed,
  };
}

/**
 * Trim automatique (§3.7) : commande qui équilibre l'avion en palier à la vitesse de référence,
 * limitée à ±trimLimit. Un avion trop déséquilibré garde une tendance résiduelle visible.
 */
export function computeTrim(
  def: AircraftDef,
  fuelMass: number,
  t: Tuning,
  speed: number = t.trimSpeed,
): { trimU: number; alphaTrim: number; residual: number } {
  const agg = computeAggregates(def, fuelMass, t);
  const q = 0.5 * t.rho * speed * speed;
  const weight = agg.mass * t.gravity;
  const liftAt = (alpha: number) => {
    let L = 0;
    for (const s of def.surfaces) {
      L += q * s.area * liftCoefficient(alpha + s.incidenceDeg * DEG, s.liftSlope, s.stallAngleDeg * DEG);
    }
    return L;
  };
  // Bisection sur l'angle d'attaque du fuselage.
  let lo = -0.3;
  let hi = 0.3;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (liftAt(mid) < weight) lo = mid;
    else hi = mid;
  }
  const alpha = (lo + hi) / 2;
  let moment = 0;
  for (const s of def.surfaces) {
    const L = q * s.area * liftCoefficient(alpha + s.incidenceDeg * DEG, s.liftSlope, s.stallAngleDeg * DEG);
    moment += (s.x - agg.xCG) * Math.cos(alpha) * L;
  }
  const needed = -moment / (def.pitch.authority * q);
  const trimU = clamp(needed, -t.trimLimit, t.trimLimit);
  return { trimU, alphaTrim: alpha, residual: needed - trimU };
}
