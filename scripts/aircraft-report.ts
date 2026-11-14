// Outil de réglage : caractéristiques calculées de chaque avion (stabilité, trim, caractère de vol).
// Usage : npx vite-node scripts/aircraft-report.ts
import { computeAggregates, computeTrim } from '../src/sim/aero';
import { CONTENT } from '../src/sim/content';
import { computeHandling } from '../src/sim/handling';

for (const def of Object.values(CONTENT.aircraft)) {
  const agg = computeAggregates(def, def.fuel.capacity, CONTENT.tuning);
  const h = computeHandling(def, CONTENT.tuning);
  const trim = computeTrim(def, def.fuel.capacity, CONTENT.tuning, h.cruiseSpeed);
  const f = (n: number) => n.toFixed(1);
  console.log(`${def.name.padEnd(14)} masse=${f(agg.mass)} SM=${agg.staticMargin.toFixed(3)} trim=${trim.trimU.toFixed(2)} résidu=${trim.residual.toFixed(2)} | décroch=${f(h.stallSpeed)} appr=${f(h.approachSpeed)} crois=${f(h.cruiseSpeed)} max=${f(h.maxSpeed)} montée=${f(h.climbDeg)}° descente=${f(h.glideDeg)}° finesse=${f(h.glideRatio)} vivacité=${h.pitchRateScale.toFixed(2)} autonomie=${f(h.rangeSeconds)}s`);
  console.log(`   barres ${JSON.stringify(h.stats)}`);
}
