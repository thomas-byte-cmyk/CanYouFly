import { describe, expect, it } from 'vitest';
import { computeAggregates, computeTrim } from '../src/sim/aero';
import { CONTENT } from '../src/sim/content';
import { computeHandling } from '../src/sim/handling';
import { FlightSession } from '../src/sim/session';

const T = CONTENT.tuning;
const H = (id: string) => computeHandling(CONTENT.aircraft[id], T);

/** Joueur « un doigt » simple : appuie sous la pente visée, pique s'il est trop haut. */
function flyTo(id: string, touchX: number) {
  const s = new FlightSession({
    def: CONTENT.aircraft[id], level: CONTENT.levels['paris-reims'], tuning: T, surfaces: CONTENT.surfaces,
    thresholds: CONTENT.landing, stabilize: true, autoThrottle: true, firstArrival: true, arcade: true,
  });
  for (let i = 0; i < 60 * 150 && s.phase !== 'ended'; i++) {
    const want = Math.min(60, (touchX - s.state.x) * 0.09);
    const press = s.phase === 'ground' ? true : s.altitude < want - 2;
    const dive = !press && s.phase === 'flying' && s.altitude > want + 6;
    s.step({ pitch: 0, press, dive });
  }
  return s.result!;
}

describe("le choix de l'avion change le pilotage (retour de test v0.4)", () => {
  it('tous les avions sont équilibrables (trim sans résidu) et stables', () => {
    for (const def of Object.values(CONTENT.aircraft)) {
      const h = computeHandling(def, T);
      const trim = computeTrim(def, def.fuel.capacity, T, h.cruiseSpeed);
      expect(Math.abs(trim.residual), def.name).toBeLessThan(0.01);
      expect(computeAggregates(def, def.fuel.capacity, T).staticMargin, def.name).toBeGreaterThan(0);
    }
  });

  it('la Fusée monte plus fort et va plus vite, mais atterrit plus vite et a moins d\'autonomie', () => {
    expect(H('fusee').climbDeg).toBeGreaterThan(H('coucou').climbDeg + 4);
    expect(H('fusee').maxSpeed).toBeGreaterThan(H('coucou').maxSpeed + 15);
    expect(H('fusee').approachSpeed).toBeGreaterThan(H('coucou').approachSpeed + 5);
    expect(H('fusee').rangeSeconds).toBeLessThan(H('coucou').rangeSeconds);
  });

  it("l'Albatros plane bien plus loin et se pose plus lentement", () => {
    expect(H('albatros').glideDeg).toBeLessThan(H('coucou').glideDeg - 2);
    expect(H('albatros').approachSpeed).toBeLessThan(H('coucou').approachSpeed - 4);
  });

  it('aucun avion n\'est meilleur sur toutes les barres', () => {
    const ids = Object.keys(CONTENT.aircraft);
    for (const a of ids) {
      for (const b of ids) {
        if (a === b) continue;
        const sa = H(a).stats;
        const sb = H(b).stats;
        const allBetterOrEqual = (Object.keys(sa) as (keyof typeof sa)[]).every((k) => sa[k] >= sb[k]);
        expect(allBetterOrEqual, `${a} domine ${b}`).toBe(false);
      }
    }
  });

  it('chaque avion peut réussir l\'étape Paris → Reims sur la piste (équité)', () => {
    for (const id of Object.keys(CONTENT.aircraft)) {
      const r = flyTo(id, 2260);
      expect(r.validated, id).toBe(true);
      expect(['PERFECT', 'GOOD', 'ROUGH'], id).toContain(r.grade);
    }
  });
});
