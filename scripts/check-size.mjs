// Vérifie le budget de poids du build (docs/TECHNICAL_ARCHITECTURE.md) :
// chargement initial ≤ 4 Mo (Poki exige < 8 Mo). Échoue si le budget est dépassé.
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const BUDGET = 4 * 1024 * 1024;
const dir = 'dist';
let total = 0;
const walk = (d) => {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    const s = statSync(p);
    if (s.isDirectory()) walk(p);
    else total += s.size;
  }
};
walk(dir);
const mb = (n) => (n / 1024 / 1024).toFixed(2);
console.log(`Poids du build : ${mb(total)} Mo (budget ${mb(BUDGET)} Mo)`);
if (total > BUDGET) {
  console.error('Budget de poids dépassé !');
  process.exit(1);
}
