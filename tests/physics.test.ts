import { describe, expect, it } from 'vitest';
import { DEG, computeAggregates, computeTrim, liftCoefficient } from '../src/sim/aero';
import { createState, stepPhysics } from '../src/sim/flight';
import { cloneDef, coucou, newSession, placeInFlight, tuning } from './helpers';

describe('grandeurs agrégées de la construction', () => {
  it("l'avion de référence est stable (marge statique dans la plage idéale)", () => {
    const agg = computeAggregates(coucou, coucou.fuel.capacity, tuning);
    expect(agg.staticMargin).toBeGreaterThan(0.05);
    expect(agg.staticMargin).toBeLessThan(0.15);
    expect(agg.takeoffSpeed).toBeGreaterThan(18);
    expect(agg.takeoffSpeed).toBeLessThan(26);
  });

  it('déplacer une masse vers la queue recule le centre de gravité et réduit la marge statique', () => {
    const tailHeavy = cloneDef();
    tailHeavy.masses.find((m) => m.id === 'engine')!.x = -1;
    const a = computeAggregates(coucou, 40, tuning);
    const b = computeAggregates(tailHeavy, 40, tuning);
    expect(b.xCG).toBeLessThan(a.xCG);
    expect(b.staticMargin).toBeLessThan(a.staticMargin);
    expect(b.staticMargin).toBeLessThan(0);
  });

  it("le trim équilibre complètement l'avion de référence", () => {
    const trim = computeTrim(coucou, 40, tuning);
    expect(Math.abs(trim.trimU)).toBeLessThanOrEqual(tuning.trimLimit);
    expect(trim.residual).toBe(0);
  });
});

describe('portance et décrochage', () => {
  it('la portance est linéaire avant le décrochage puis chute', () => {
    const stall = 15 * DEG;
    expect(liftCoefficient(5 * DEG, 5, stall)).toBeCloseTo(5 * 5 * DEG, 6);
    const max = liftCoefficient(stall, 5, stall);
    const after = liftCoefficient(stall + 10 * DEG, 5, stall);
    expect(after).toBeLessThan(max * 0.75);
    expect(after).toBeGreaterThan(0);
    expect(liftCoefficient(-5 * DEG, 5, stall)).toBeLessThan(0);
  });

  it('un avion trop lent et trop cabré décroche', () => {
    const s = newSession(coucou, { autoThrottle: false });
    placeInFlight(s, { x: 600, alt: 150, vx: 18, vy: -6, thetaDeg: 20 });
    s.step({ pitch: 1, manualThrottle: 0 });
    expect(s.state.stalled).toBe(true);
  });
});

describe('vol', () => {
  it("décolle quand le joueur cabre après avoir pris de la vitesse", () => {
    const s = newSession();
    for (let i = 0; i < 60 * 15; i++) s.step({ pitch: s.state.vx > 20 ? 1 : 0 });
    expect(s.hasTakenOff).toBe(true);
    expect(s.altitude).toBeGreaterThan(20);
  });

  it("un avion lourd de l'arrière cabre tout seul (signature d'une mauvaise construction)", () => {
    const tailHeavy = cloneDef();
    tailHeavy.masses.find((m) => m.id === 'pilot')!.x = -4;
    tailHeavy.masses.find((m) => m.id === 'pilot')!.mass = 45;
    const run = (def = coucou) => {
      const s = newSession(def, { autoThrottle: false });
      placeInFlight(s, { x: 600, alt: 150, vx: 42, vy: 0, thetaDeg: 0.3 });
      for (let i = 0; i < 90; i++) s.step({ pitch: 0, manualThrottle: 0.6 });
      return s.state.theta;
    };
    expect(run(tailHeavy) - run()).toBeGreaterThan(5 * DEG);
  });

  it('sans carburant, l\'avion plane avec une finesse crédible (entre 5 et 12)', () => {
    const s = newSession(coucou, { autoThrottle: false, stabilize: true });
    placeInFlight(s, { x: 100, alt: 400, vx: 32, vy: -3, thetaDeg: 0, fuel: 0 });
    // Laisser l'avion se stabiliser en plané.
    for (let i = 0; i < 60 * 8; i++) s.step({ pitch: 0, manualThrottle: 0 });
    const x0 = s.state.x;
    const y0 = s.state.y;
    for (let i = 0; i < 60 * 10; i++) s.step({ pitch: 0, manualThrottle: 0 });
    const ratio = (s.state.x - x0) / (y0 - s.state.y);
    expect(ratio).toBeGreaterThan(5);
    expect(ratio).toBeLessThan(12);
  });

  it('la simulation est déterministe (mêmes entrées → même état)', () => {
    const run = () => {
      const s = newSession();
      for (let i = 0; i < 60 * 20; i++) s.step({ pitch: Math.sin(i / 50) * 0.6 + (s.state.vx > 20 ? 0.4 : 0) });
      return { ...s.state };
    };
    expect(run()).toEqual(run());
  });

  it('le pas physique ne dépend pas de Phaser (utilisable seul)', () => {
    const s = newSession();
    const st = createState(0, 0, coucou.gear.height, 10);
    const info = stepPhysics(st, s.runtime, s.env, { pitch: 0, throttle: 1, brake: false });
    expect(info.contact).toBe(true);
    expect(st.vx).toBeGreaterThan(0);
  });
});
