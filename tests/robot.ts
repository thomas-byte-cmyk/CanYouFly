import { CONTENT } from '../src/sim/content';
import { FlightSession } from '../src/sim/session';
import { moverPos } from '../src/sim/world';

/**
 * Pilote robot « un doigt » utilisé par les tests d'équité et les outils de réglage :
 * suit une pente vers le point visé, passe au-dessus des obstacles fixes, anticipe les
 * obstacles mobiles et les jets d'eau (comme un joueur attentif), freine une fois posé.
 */
export function deliver(orderId: string, planeId: string, touchX: number, maxAlt = 45) {
  const order = CONTENT.orders.find((o) => o.id === orderId)!;
  const level = CONTENT.levels[order.levelId];
  const s = new FlightSession({
    def: CONTENT.aircraft[planeId], level, tuning: CONTENT.tuning, surfaces: CONTENT.surfaces, thresholds: CONTENT.landing,
    stabilize: true, autoThrottle: true, firstArrival: false, arcade: true, cargo: CONTENT.packages[order.packageId],
  });
  for (let i = 0; i < 60 * 150 && s.phase !== 'ended'; i++) {
    const st = s.state;
    const clear = Math.max(0, ...level.obstacles.filter((o) => o.x + o.w > st.x - 5 && o.x < st.x + 40 && o.x < touchX).map((o) => o.h + 4));
    let want = Math.max(clear, Math.min(maxAlt, (touchX - st.x) * 0.09));
    const v = Math.max(15, st.vx);
    for (const m of level.movers) {
      const now = moverPos(m, st.time);
      const dx = now.x - st.x;
      if (dx < -10 || dx > 160) continue;
      const tau = Math.max(0, dx / (v - m.vx));
      const p = moverPos(m, st.time + tau);
      if (Math.abs(p.y - want) < m.r + 7) want = p.y + m.r + 9;
    }
    for (const g of level.geysers ?? []) {
      const dx = g.x - st.x;
      if (dx > -g.w && dx < 120) want = Math.max(want, g.h + 6);
    }
    const press = s.phase === 'ground' ? true : s.altitude < want - 2;
    const dive = s.phase === 'rolling' || (!press && s.phase === 'flying' && s.altitude > want + 6);
    s.step({ pitch: 0, press, dive });
  }
  return s.result!;
}
