// Outil de réglage : un « pilote robot » simple tente des approches pour vérifier
// qu'un atterrissage PERFECT / GOOD est atteignable avec l'avion de référence.
// Usage : npx vite-node scripts/landing-check.ts
import { CONTENT } from '../src/sim/content';
import { FlightSession } from '../src/sim/session';

function attempt(touchX: number, flareAlt: number, targetSink: number) {
  const s = new FlightSession({
    def: CONTENT.aircraft.coucou, level: CONTENT.levels['paris-reims'], tuning: CONTENT.tuning,
    surfaces: CONTENT.surfaces, thresholds: CONTENT.landing, stabilize: true, autoThrottle: true, firstArrival: true, arcade: process.env.SIM ? false : true,
  });
  const st = s.state;
  st.x = touchX - 500; st.y = 45 + 1.6; st.vx = 40; st.vy = 0; st.onGround = false;
  s.hasTakenOff = true; s.phase = 'flying'; s.inApproach = true; s.deployFlaps();
  for (let i = 0; i < 60 * 60 && s.phase !== 'ended'; i++) {
    const alt = s.altitude;
    let pitch = 0;
    if (s.phase === 'flying') {
      if (alt > flareAlt) {
        // Passe au-dessus des obstacles situés juste devant, puis suit la pente vers le point visé.
        const level = CONTENT.levels['paris-reims'];
        const clear = Math.max(0, ...level.obstacles.filter((o) => o.x + o.w > st.x && o.x < st.x + 25 && o.x < touchX).map((o) => o.h + 3));
        const wanted = Math.max(clear, (touchX - st.x) * 0.09);
        pitch = Math.max(-1, Math.min(1, (wanted - alt) * 0.08 - st.vy * 0.05));
      } else {
        pitch = Math.max(-1, Math.min(1, (-targetSink - st.vy) * 0.4));
      }
    }
    s.step({ pitch });
    if (process.env.TRACE && i % 30 === 0) console.log(`  x=${st.x.toFixed(0)} alt=${alt.toFixed(1)} vx=${st.vx.toFixed(1)} vy=${st.vy.toFixed(1)} th=${(st.theta*57.3).toFixed(1)} a=${(st.alphaWing*57.3).toFixed(1)} p=${pitch.toFixed(2)} thr=${s.throttle.toFixed(2)} ${s.phase}`);
  }
  return s.result!;
}

for (const [x, f, k] of (process.env.ONLY ? [[2665, 3, 1]] : process.env.NOFLARE ? [[2260, 0, 0], [2300, 0, 0], [1900, 0, 0]] : [[2260, 6, 1.5], [2260, 4, 1], [2300, 8, 2], [1900, 6, 1.5], [1950, 3, 1], [2660, 6, 1.5], [2665, 3, 1]]) as [number, number, number][]) {
  const r = attempt(x, f, k);
  console.log(`cible x=${x} arrondi=${f} sink=${k} → ${r.grade} (${r.reason}) zone=${r.zone?.name ?? '-'} rv=${r.touchdown?.rv.toFixed(2)} ra=${r.touchdown?.ra.toFixed(2)} rh=${r.touchdown?.rh.toFixed(2)}`);
}
