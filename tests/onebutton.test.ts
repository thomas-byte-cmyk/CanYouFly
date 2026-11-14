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

  it('relâcher au-dessus de la piste suffit pour se poser en douceur (arrondi automatique)', () => {
    const s = session();
    placeInFlight(s, { x: 2150, alt: 14, vx: 30, vy: -3, thetaDeg: -3 });
    s.inApproach = true;
    s.deployFlaps();
    for (let i = 0; i < 60 * 30 && s.phase !== 'ended'; i++) s.step({ pitch: 0, press: false });
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
