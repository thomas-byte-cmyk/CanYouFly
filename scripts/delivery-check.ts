// Outil de réglage : pour chaque commande et chaque avion, un pilote robot « un doigt »
// vise chaque zone d'arrivée et on garde la meilleure livraison.
// Usage : npx vite-node scripts/delivery-check.ts
import { CONTENT } from '../src/sim/content';
import { deliver } from '../tests/robot';

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
