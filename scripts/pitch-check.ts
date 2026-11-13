// Outil de réglage : mesure la réponse en tangage (impulsion de 0,5 s puis relâchement).
// Usage : npx vite-node scripts/pitch-check.ts
import { CONTENT } from '../src/sim/content';
import { FlightSession } from '../src/sim/session';

for (const arcade of [false, true]) {
  const s = new FlightSession({
    def: CONTENT.aircraft.coucou, level: CONTENT.levels['paris-reims'], tuning: CONTENT.tuning,
    surfaces: CONTENT.surfaces, thresholds: CONTENT.landing, stabilize: true, autoThrottle: false, firstArrival: true, arcade,
  });
  const st = s.state;
  st.x = 600; st.y = 150; st.vx = 32; st.vy = 0; st.onGround = false; s.hasTakenOff = true; s.phase = 'flying';
  const line: string[] = [];
  for (let i = 0; i < 60 * 3; i++) {
    const pitch = i >= 60 && i < 90 ? 1 : 0;
    s.step({ pitch, manualThrottle: 0.5 });
    if (i % 6 === 0 && i >= 54) line.push(`${(i / 60).toFixed(1)}s θ=${(st.theta * 57.3).toFixed(1)} ω=${(st.omega * 57.3).toFixed(0)} γ=${(Math.atan2(st.vy, st.vx) * 57.3).toFixed(1)}`);
  }
  console.log(arcade ? 'ARCADE' : 'SIMULATION');
  console.log(line.join('\n'));
}
