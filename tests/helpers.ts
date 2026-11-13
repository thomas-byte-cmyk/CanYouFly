import { CONTENT } from '../src/sim/content';
import { FlightSession } from '../src/sim/session';
import type { AircraftDef } from '../src/sim/types';

export const coucou = CONTENT.aircraft.coucou;
export const tuning = CONTENT.tuning;

export function cloneDef(def: AircraftDef = coucou): AircraftDef {
  return JSON.parse(JSON.stringify(def)) as AircraftDef;
}

export function newSession(def: AircraftDef = coucou, opts: { stabilize?: boolean; autoThrottle?: boolean } = {}) {
  return new FlightSession({
    def,
    level: CONTENT.levels['paris-reims'],
    tuning: CONTENT.tuning,
    surfaces: CONTENT.surfaces,
    thresholds: CONTENT.landing,
    stabilize: opts.stabilize ?? false,
    autoThrottle: opts.autoThrottle ?? true,
    firstArrival: true,
  });
}

/** Place l'avion en vol à une position donnée (pour tester l'atterrissage sans tout le vol). */
export function placeInFlight(
  s: FlightSession,
  p: { x: number; alt: number; vx: number; vy: number; thetaDeg: number; fuel?: number },
) {
  const st = s.state;
  st.x = p.x;
  st.y = p.alt + s.cfg.def.gear.height;
  st.vx = p.vx;
  st.vy = p.vy;
  st.theta = (p.thetaDeg * Math.PI) / 180;
  st.omega = 0;
  st.onGround = false;
  if (p.fuel !== undefined) st.fuel = p.fuel;
  s.hasTakenOff = true;
  s.phase = 'flying';
}

/** Fait avancer la session jusqu'à la fin (ou la limite de temps). */
export function runToEnd(s: FlightSession, pitch: (s: FlightSession) => number, manualThrottle?: number, maxSeconds = 120) {
  for (let i = 0; i < maxSeconds * 60 && s.phase !== 'ended'; i++) {
    s.step({ pitch: pitch(s), manualThrottle });
  }
  return s.result;
}
