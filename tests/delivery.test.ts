import { describe, expect, it } from 'vitest';
import { computeAggregates } from '../src/sim/aero';
import { cargoX, withCargo } from '../src/sim/cargo';
import { CONTENT } from '../src/sim/content';
import { computeDelivery } from '../src/sim/delivery';
import { evaluateTouchdown } from '../src/sim/landing';
import { computeHandling } from '../src/sim/handling';
import { FlightSession } from '../src/sim/session';
import { deliver } from './robot';

const T = CONTENT.tuning;
const P = CONTENT.packages;
const coucou = CONTENT.aircraft.coucou;

describe('le colis modifie vraiment l\'avion (D17/D18)', () => {
  it('le colis ajoute sa masse et recule ou avance le centre de gravité', () => {
    const empty = computeAggregates(coucou, 40, T);
    const hens = computeAggregates(withCargo(coucou, P.poules), 40, T);
    expect(hens.mass).toBeCloseTo(empty.mass + P.poules.mass, 5);
    expect(hens.xCG).toBeLessThan(empty.xCG);
  });

  it('les barres changent quand le colis est chargé (moins de montée, solidité plus basse si fragile)', () => {
    const h0 = computeHandling(coucou, T);
    const hEggs = computeHandling(withCargo(coucou, P.oeufs), T);
    const hBox = computeHandling(withCargo(coucou, P.carton), T);
    expect(hBox.climbDeg).toBeLessThan(h0.climbDeg);
    expect(hEggs.stats.solidite).toBeLessThan(h0.stats.solidite);
  });

  it("un colis fragile rend le même contact plus brutal", () => {
    const run = (tol: number) =>
      evaluateTouchdown({ sink: 4, groundSpeed: 25, pitch: 0.05, surface: CONTENT.surfaces.dirt, gearTolerance: tol, gearVhMax: 40 }, CONTENT.landing).grade;
    expect(run(withCargo(coucou, P.carton).gear.tolerance)).toBe('GOOD');
    expect(run(withCargo(coucou, P.oeufs).gear.tolerance)).not.toBe('GOOD');
  });

  it('les poules font bouger le centre de gravité en vol', () => {
    expect(cargoX(P.poules, 0)).not.toBeCloseTo(cargoX(P.poules, P.poules.shifting!.period / 4), 1);
    expect(cargoX(P.carton, 3)).toBe(P.carton.slotX);
  });

  it('le colis est copié : l\'avion d\'origine n\'est jamais modifié', () => {
    const before = JSON.stringify(coucou);
    withCargo(coucou, P.poules);
    expect(JSON.stringify(coucou)).toBe(before);
  });
});

describe('résultat de livraison', () => {
  const base = { pkg: P.oeufs, progression: 1, bonus: 0, seed: 0 };
  it('PARFAIT = 5 étoiles, paiement plein et pourboire', () => {
    const d = computeDelivery({ ...base, grade: 'PERFECT', validated: true });
    expect(d.status).toBe('livre');
    expect(d.rating).toBe(5);
    expect(d.pay).toBe(P.oeufs.price);
    expect(d.tip).toBe(P.oeufs.tip);
  });
  it('colis abîmé = payé moins, mais livré (D18)', () => {
    const rough = computeDelivery({ ...base, grade: 'ROUGH', validated: true });
    const crash = computeDelivery({ ...base, grade: 'CRASH', validated: true });
    expect(rough.condition).toBe('cabosse');
    expect(crash.condition).toBe('miettes');
    expect(crash.pay).toBeLessThan(rough.pay);
    expect(crash.status).toBe('livre');
  });
  it('perdu en mer = échec, avec un petit lot de consolation', () => {
    const d = computeDelivery({ ...base, grade: 'WATER', validated: false });
    expect(d.status).toBe('perdu');
    expect(d.pay).toBe(0);
    expect(d.total).toBeGreaterThanOrEqual(10);
    expect(d.review.length).toBeGreaterThan(5);
  });
  it('posé hors zone = livraison refusée', () => {
    expect(computeDelivery({ ...base, grade: 'GOOD', validated: false }).status).toBe('refuse');
  });
});

describe('équité : chaque commande est réussissable avec au moins un avion', () => {
  for (const order of CONTENT.orders) {
    it(`${order.id} (${order.packageId})`, () => {
      const level = CONTENT.levels[order.levelId];
      let ok = false;
      for (const plane of Object.keys(CONTENT.aircraft)) {
        for (const z of level.zones.filter((z) => z.arrival)) {
          const r = deliver(order.id, plane, z.x0 + 25);
          if (r.delivery?.status === 'livre' && r.delivery.condition === 'intact') ok = true;
          if (ok) break;
        }
        if (ok) break;
      }
      expect(ok).toBe(true);
    });
  }

  it('le choix de l\'avion compte : pour les œufs, un avion livre intact et un autre les abîme', () => {
    const best = (plane: string) =>
      Math.max(
        ...CONTENT.levels.cocotte.zones
          .filter((z) => z.arrival)
          .map((z) => deliver('cmd-2', plane, z.x0 + 25).delivery!.rating),
      );
    expect(best('albatros')).toBeGreaterThanOrEqual(4);
    expect(best('fusee')).toBeLessThan(best('albatros'));
  });
});

describe('obstacles en vol (retour de test v0.6 : « il faut ajouter des obstacles »)', () => {
  it('chaque choc abîme un colis fragile ; un colis normal résiste à un choc', () => {
    const eggs = computeDelivery({ pkg: P.oeufs, grade: 'PERFECT', validated: true, progression: 1, bonus: 0, seed: 0, hits: 1 });
    const box = computeDelivery({ pkg: P.carton, grade: 'PERFECT', validated: true, progression: 1, bonus: 0, seed: 0, hits: 1 });
    expect(eggs.condition).toBe('cabosse');
    expect(eggs.tip).toBe(0);
    expect(box.condition).toBe('intact');
  });

  it("le jet de la baleine n'est actif qu'une partie du temps (prévisible)", async () => {
    const { geyserActive } = await import('../src/sim/world');
    const g = CONTENT.levels.cocotte.geysers![0];
    const samples = Array.from({ length: 90 }, (_, i) => geyserActive(g, (i / 90) * g.period));
    expect(samples.some((a) => a > 0.9)).toBe(true);
    expect(samples.filter((a) => a === 0).length).toBeGreaterThan(40);
  });

  it("un robot qui ne regarde pas devant lui ne livre pas les œufs intacts (les obstacles comptent)", () => {
    const order = CONTENT.orders.find((o) => o.id === 'cmd-2')!;
    const level = CONTENT.levels[order.levelId];
    const s = new FlightSession({
      def: CONTENT.aircraft.albatros, level, tuning: T, surfaces: CONTENT.surfaces, thresholds: CONTENT.landing,
      stabilize: true, autoThrottle: true, firstArrival: false, arcade: true, cargo: P.oeufs,
    });
    for (let i = 0; i < 60 * 150 && s.phase !== 'ended'; i++) {
      const want = Math.max(0, Math.min(45, (1925 - s.state.x) * 0.09));
      const press = s.phase === 'ground' ? true : s.altitude < want - 2;
      s.step({ pitch: 0, press, dive: s.phase === 'rolling' });
    }
    const d = s.result!.delivery!;
    expect(d.status === 'livre' && d.condition === 'intact').toBe(false);
  });
});
