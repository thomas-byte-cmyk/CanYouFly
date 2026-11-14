// Outil de réglage : pour chaque commande et chaque avion, un pilote robot « un doigt »
// vise chaque zone d'arrivée et on garde la meilleure livraison.
// Usage : npx vite-node scripts/delivery-check.ts
import { CONTENT } from '../src/sim/content';
import { FlightSession } from '../src/sim/session';

function deliver(orderId: string, planeId: string, touchX: number, cruise = 45) {
  const order = CONTENT.orders.find((o) => o.id === orderId)!;
  const level = CONTENT.levels[order.levelId];
  const s = new FlightSession({
    def: CONTENT.aircraft[planeId], level, tuning: CONTENT.tuning, surfaces: CONTENT.surfaces, thresholds: CONTENT.landing,
    stabilize: true, autoThrottle: true, firstArrival: false, arcade: true, cargo: CONTENT.packages[order.packageId],
  });
  for (let i = 0; i < 60 * 150 && s.phase !== 'ended'; i++) {
    const clear = Math.max(0, ...level.obstacles.filter((o) => o.x + o.w > s.state.x && o.x < s.state.x + 30 && o.x < touchX).map((o) => o.h + 3));
    const want = Math.max(clear, Math.min(cruise, (touchX - s.state.x) * 0.09));
    const press = s.phase === 'ground' ? true : s.altitude < want - 2;
    const dive = !press && s.phase === 'flying' && s.altitude > want + 6;
    s.step({ pitch: 0, press, dive });
  }
  return s.result!;
}

const rank = { parfait: 5, intact: 4, cabosse: 3, miettes: 2, refuse: 1, plouf: 0 } as const;
{
  for (const order of CONTENT.orders) {
    const level = CONTENT.levels[order.levelId];
    for (const plane of Object.keys(CONTENT.aircraft)) {
      let best = '';
      let bestRank = -1;
      for (const z of level.zones.filter((z) => z.arrival)) {
        for (const off of [10, 25, 40]) {
          const r = deliver(order.id, plane, z.x0 + off);
          const d = r.delivery!;
          if (rank[d.outcome] > bestRank) {
            bestRank = rank[d.outcome];
            best = `${d.outcome} (${'★'.repeat(d.rating)}) ${r.zone?.name ?? '-'} ${d.total} Boulons`;
          }
        }
      }
      console.log(`${order.id} ${order.packageId.padEnd(7)} ${plane.padEnd(9)} → ${best}`);
    }
  }
}
