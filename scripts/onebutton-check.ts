// Outil de réglage : un joueur « un doigt » simple (appuie sous la ligne de descente visée,
// relâche au-dessus) tente de se poser sur chaque zone. Usage : npx vite-node scripts/onebutton-check.ts
import { CONTENT } from '../src/sim/content';
import { FlightSession } from '../src/sim/session';

function fly(touchX: number, slope: number, cruiseAlt: number) {
  const s = new FlightSession({
    def: CONTENT.aircraft[process.env.PLANE ?? 'coucou'], level: CONTENT.levels['paris-reims'], tuning: CONTENT.tuning,
    surfaces: CONTENT.surfaces, thresholds: CONTENT.landing, stabilize: true, autoThrottle: true, firstArrival: true, arcade: true,
  });
  const st = s.state;
  let presses = 0;
  let last = false;
  for (let i = 0; i < 60 * 150 && s.phase !== 'ended'; i++) {
    const glideLine = (touchX - st.x) * slope;
    const want = Math.min(cruiseAlt, glideLine);
    const press = s.phase === 'ground' ? true : s.altitude < want - 2;
    if (press && !last) presses++;
    last = press;
    // Pique (pouce gauche / ↓) si l'avion est nettement trop haut par rapport à la pente visée.
    const dive = !press && s.phase === 'flying' && s.altitude > want + 6;
    s.step({ pitch: 0, press, dive });
    if (process.env.TRACE && i % 60 === 0) console.log(`  t=${(i/60)|0} x=${st.x.toFixed(0)} alt=${s.altitude.toFixed(1)} vx=${st.vx.toFixed(1)} vy=${st.vy.toFixed(1)} θ=${(st.theta*57.3).toFixed(1)} press=${press} thr=${s.throttle.toFixed(2)} ${s.phase}`);
  }
  const r = s.result!;
  return `${r.grade} (${r.reason}) zone=${r.zone?.name ?? '-'} x=${r.endX.toFixed(0)} rv=${r.touchdown?.rv.toFixed(2)} durée=${r.duration.toFixed(0)}s appuis=${presses} boulons=${r.reward.total}`;
}

for (const [x, slope, alt] of [[1950, 0.09, 60], [2260, 0.09, 60], [2300, 0.12, 80], [2660, 0.2, 60], [1500, 0.09, 50]] as [number, number, number][]) {
  console.log(`vise x=${x} pente=${slope} croisière=${alt} → ${fly(x, slope, alt)}`);
}
