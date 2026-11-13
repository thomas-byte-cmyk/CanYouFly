import { describe, expect, it } from 'vitest';
import { DEG } from '../src/sim/aero';
import { CONTENT } from '../src/sim/content';
import { evaluateTouchdown, worstGrade } from '../src/sim/landing';
import { computeReward, starsFor } from '../src/sim/rewards';
import { coucou, newSession, placeInFlight, runToEnd } from './helpers';

const th = CONTENT.landing;
const runway = CONTENT.surfaces.runway;
const field = CONTENT.surfaces.field;

const td = (sink: number, pitchDeg = 4, groundSpeed = 28, surface = runway) =>
  evaluateTouchdown({ sink, groundSpeed, pitch: pitchDeg * DEG, surface, gearTolerance: 6, gearVhMax: 40 }, th);

describe('qualité du contact (docs/LANDING_AND_CRASH_SYSTEM.md §4)', () => {
  it('respecte les seuils sur piste avec un train de tolérance 6 (PERFECT ≤ 3, GOOD ≤ 6, ROUGH ≤ 9,6 u/s)', () => {
    expect(td(2.5).grade).toBe('PERFECT');
    expect(td(5).grade).toBe('GOOD');
    expect(td(9).grade).toBe('ROUGH');
    expect(td(11).grade).toBe('CRASH');
  });

  it('un champ est moins tolérant qu\'une piste', () => {
    expect(td(5.5, 4, 28, runway).grade).toBe('GOOD');
    expect(td(5.5, 4, 28, field).grade).toBe('ROUGH');
  });

  it('toucher nez en premier = CRASH', () => {
    const r = td(1, -18);
    expect(r.grade).toBe('CRASH');
    expect(r.cause).toBe('nose');
  });

  it('un terrain non atterrissable = CRASH', () => {
    expect(td(1, 4, 20, CONTENT.surfaces.forest).grade).toBe('CRASH');
  });

  it('la pire note l\'emporte', () => {
    expect(worstGrade('PERFECT', 'ROUGH')).toBe('ROUGH');
    expect(worstGrade('CRASH', 'GOOD')).toBe('CRASH');
  });
});

describe('fin de vol', () => {
  it("l'eau donne toujours un WATER CRASH", () => {
    const s = newSession(coucou, { autoThrottle: false });
    placeInFlight(s, { x: 1668, alt: 2, vx: 22, vy: -5, thetaDeg: -2 });
    const r = runToEnd(s, () => 0, 0);
    expect(r?.grade).toBe('WATER');
    expect(r?.validated).toBe(false);
  });

  it('un atterrissage doux sur la piste de Reims valide l\'étape', () => {
    const s = newSession(coucou, { autoThrottle: false });
    placeInFlight(s, { x: 2250, alt: 0.6, vx: 27, vy: -1.2, thetaDeg: 5 });
    const r = runToEnd(s, () => 0, 0);
    expect(['PERFECT', 'GOOD']).toContain(r?.grade);
    expect(r?.zone?.id).toBe('piste');
    expect(r?.validated).toBe(true);
    expect(r?.stars).toBeGreaterThanOrEqual(2);
  });

  it('heurter un arbre en vol = CRASH', () => {
    const s = newSession(coucou, { autoThrottle: false });
    placeInFlight(s, { x: 2140, alt: 8, vx: 30, vy: 0, thetaDeg: 0 });
    const r = runToEnd(s, () => 0, 0.5);
    expect(r?.grade).toBe('CRASH');
    expect(r?.reason).toBe('obstacle');
  });

  it('un crash dans la zone d\'arrivée valide quand même l\'étape (décision D5)', () => {
    const s = newSession(coucou, { autoThrottle: false });
    placeInFlight(s, { x: 1900, alt: 2, vx: 30, vy: -14, thetaDeg: 2 });
    const r = runToEnd(s, () => 0, 0);
    expect(r?.grade).toBe('CRASH');
    expect(r?.validated).toBe(true);
    expect(r?.stars).toBe(1);
  });
});

describe('récompenses (docs/PROGRESSION_SYSTEM.md §3.1)', () => {
  const level = CONTENT.levels['paris-reims'];
  it('un long vol terminé en crash rapporte plus qu\'un vol très court', () => {
    const longCrash = computeReward({ level, endX: 2000, grade: 'CRASH', landed: false, rings: 0, validated: false, firstArrival: false });
    const shortLanding = computeReward({ level, endX: 300, grade: 'PERFECT', landed: true, rings: 0, validated: false, firstArrival: false });
    expect(longCrash.total).toBeGreaterThan(shortLanding.total);
  });

  it('applique le plancher de 10 Boulons dès 5 % de progression', () => {
    const r = computeReward({ level, endX: 200, grade: 'CRASH', landed: false, rings: 0, validated: false, firstArrival: false });
    expect(r.total).toBe(10);
  });

  it('étoiles : CRASH 1, ROUGH/GOOD 2, PERFECT 3, non validé 0', () => {
    expect(starsFor('CRASH', true)).toBe(1);
    expect(starsFor('GOOD', true)).toBe(2);
    expect(starsFor('PERFECT', true)).toBe(3);
    expect(starsFor('PERFECT', false)).toBe(0);
  });
});
