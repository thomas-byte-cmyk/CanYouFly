import { describe, expect, it } from 'vitest';
import { coucou, newSession, placeInFlight } from './helpers';

const session = () => newSession(coucou, { autoThrottle: true, stabilize: true, arcade: true });

describe('commande à un doigt (retour de test : « pas assez intuitif »)', () => {
  it('appuyer fait décoller puis monter ; relâcher fait redescendre', () => {
    const s = session();
    for (let i = 0; i < 60 * 14; i++) s.step({ pitch: 0, press: true });
    expect(s.hasTakenOff).toBe(true);
    expect(s.state.vy).toBeGreaterThan(2);
    const alt = s.altitude;
    for (let i = 0; i < 60 * 4; i++) s.step({ pitch: 0, press: false });
    expect(s.altitude).toBeLessThan(alt);
    expect(s.phase).toBe('flying');
  });

  it('sans appuyer, on ne décolle pas (le joueur garde le contrôle)', () => {
    const s = session();
    for (let i = 0; i < 60 * 8; i++) s.step({ pitch: 0, press: false });
    expect(s.hasTakenOff).toBe(false);
  });

  it('relâcher au-dessus de la piste puis freiner suffit pour se poser en douceur', () => {
    const s = session();
    placeInFlight(s, { x: 2150, alt: 14, vx: 30, vy: -3, thetaDeg: -3 });
    s.inApproach = true;
    s.deployFlaps();
    // Relâcher, puis freiner une fois au sol (doigt gauche / ↓).
    for (let i = 0; i < 60 * 30 && s.phase !== 'ended'; i++) s.step({ pitch: 0, press: false, dive: s.phase === 'rolling' });
    expect(['PERFECT', 'GOOD']).toContain(s.result?.grade);
    expect(s.result?.validated).toBe(true);
  });

  it('plonger vers le sol est puni (au mieux BRUTAL), le défi ne disparaît pas', () => {
    const s = session();
    placeInFlight(s, { x: 2250, alt: 12, vx: 40, vy: -16, thetaDeg: -22 });
    for (let i = 0; i < 60 * 10 && s.phase !== 'ended'; i++) s.step({ pitch: 0, press: false, dive: true });
    expect(['ROUGH', 'CRASH']).toContain(s.result?.grade);
  });
});

describe('freinage au sol (retour de test v0.6 : « il faut pouvoir freiner »)', () => {
  const roll = (brake: boolean) => {
    const s = session();
    placeInFlight(s, { x: 2210, alt: 0.3, vx: 30, vy: -0.5, thetaDeg: 3 });
    s.inApproach = true;
    s.deployFlaps();
    let touchX = 0;
    for (let i = 0; i < 60 * 30 && s.phase !== 'ended'; i++) {
      if (s.phase === 'rolling' && !touchX) touchX = s.state.x;
      s.step({ pitch: 0, press: false, dive: brake && s.phase === 'rolling' });
    }
    return { dist: s.state.x - touchX, r: s.result! };
  };
  it("freiner raccourcit nettement la distance d'arrêt", () => {
    const withBrake = roll(true);
    const without = roll(false);
    expect(withBrake.dist).toBeLessThan(without.dist * 0.6);
  });
  it('freiner évite de sortir de la piste', () => {
    expect(roll(true).r.zone?.id).toBe('piste');
  });
});
