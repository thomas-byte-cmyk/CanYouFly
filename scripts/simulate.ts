// Outil de réglage : simule un vol sans affichage et imprime l'état chaque seconde.
// Usage : npx vite-node scripts/simulate.ts [hands-off|climb]
import { CONTENT } from '../src/sim/content';
import { FlightSession } from '../src/sim/session';
import { computeAggregates, computeTrim } from '../src/sim/aero';
const def = CONTENT.aircraft.coucou;
console.log(computeAggregates(def, 40, CONTENT.tuning), computeTrim(def, 40, CONTENT.tuning));
const ses = new FlightSession({ def, level: CONTENT.levels['paris-reims'], tuning: CONTENT.tuning, surfaces: CONTENT.surfaces, thresholds: CONTENT.landing, stabilize: true, autoThrottle: true, firstArrival: true });
const mode = process.argv[2] ?? 'hands-off';
for (let i = 0; i < 60*150 && ses.phase !== 'ended'; i++) {
  const s = ses.state;
  let pitch = 0;
  if (!ses.hasTakenOff && s.vx > 20) pitch = 1;
  if (mode==='climb' && ses.hasTakenOff && ses.altitude < 80) pitch = 0.3;
  if (i % 60 === 0) console.log(`t=${s.time.toFixed(0)} x=${s.x.toFixed(0)} alt=${ses.altitude.toFixed(1)} vx=${s.vx.toFixed(1)} vy=${s.vy.toFixed(1)} th=${(s.theta*57.3).toFixed(1)} a=${(s.alphaWing*57.3).toFixed(1)} thr=${ses.throttle.toFixed(2)} fuel=${s.fuel.toFixed(1)} ${ses.phase}`);
  ses.step({ pitch });
}
console.log(ses.result && { ...ses.result, touchdown: ses.result.touchdown, zone: ses.result.zone?.name });
