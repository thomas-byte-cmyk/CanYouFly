import { describe, expect, it } from 'vitest';
import { coucou, newSession, placeInFlight } from './helpers';
import { cloneDef } from './helpers';
import { moverPos } from '../src/sim/world';

describe('effet de sol', () => {
  it("amortit la descente près du sol (même avion, même commande)", () => {
    const run = (withGE: boolean) => {
      const s = newSession(cloneDef(coucou), { autoThrottle: false });
      if (!withGE) s.cfg.tuning.groundEffect = { ...s.cfg.tuning.groundEffect, liftBoost: 0, cushion: 0 };
      placeInFlight(s, { x: 1900, alt: 6, vx: 30, vy: -5, thetaDeg: 2 });
      let sink = 0;
      for (let i = 0; i < 120 && s.phase === 'flying'; i++) {
        s.step({ pitch: 0, manualThrottle: 0 });
        sink = -s.state.vy;
      }
      return sink;
    };
    const tuningBackup = JSON.stringify(newSession().cfg.tuning.groundEffect);
    const withGE = run(true);
    const without = run(false);
    newSession().cfg.tuning.groundEffect = JSON.parse(tuningBackup);
    expect(withGE).toBeLessThan(without);
  });
});

describe('événements de vol', () => {
  it('un anneau boost accélère et une série complète donne un bonus', () => {
    const s = newSession(coucou, { autoThrottle: false });
    const lvl = s.cfg.level;
    const boostIndex = lvl.rings.findIndex((r) => r.kind === 'boost');
    const ring = lvl.rings[boostIndex];
    placeInFlight(s, { x: ring.x - 1, alt: ring.y - 1.6, vx: 30, vy: 0, thetaDeg: 0 });
    // Les autres anneaux de la série sont déjà pris.
    lvl.rings.forEach((r, i) => {
      if (r.chain === ring.chain && i !== boostIndex) s.ringsTaken[i] = true;
    });
    s.step({ pitch: 0, manualThrottle: 0.5 });
    const ev = s.drainEvents();
    expect(ev.some((e) => e.type === 'ring' && e.boost)).toBe(true);
    expect(ev.some((e) => e.type === 'chain')).toBe(true);
    expect(s.state.vx).toBeGreaterThan(35);
  });

  it("heurter des oiseaux ralentit l'avion sans crash", () => {
    const s = newSession(coucou, { autoThrottle: false });
    const i = s.cfg.level.movers.findIndex((m) => m.type === 'birds');
    const m = s.cfg.level.movers[i];
    placeInFlight(s, { x: 0, alt: 0, vx: 40, vy: 0, thetaDeg: 0 });
    const p = moverPos(m, s.state.time);
    s.state.x = p.x;
    s.state.y = p.y;
    s.step({ pitch: 0, manualThrottle: 0.5 });
    const ev = s.drainEvents();
    expect(ev.some((e) => e.type === 'bird')).toBe(true);
    expect(s.phase).toBe('flying');
    expect(s.state.vx).toBeLessThan(36);
  });

  it('les Boulons ramassés comptent dans la récompense', () => {
    const s = newSession(coucou, { autoThrottle: false });
    const b = s.cfg.level.bolts[0];
    placeInFlight(s, { x: b.x, alt: b.y - 1.6, vx: 30, vy: 0, thetaDeg: 0 });
    s.step({ pitch: 0, manualThrottle: 0.5 });
    expect(s.boltsTaken.filter(Boolean).length).toBe(1);
  });
});
