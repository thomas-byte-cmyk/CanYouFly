import { describe, expect, it } from 'vitest';
import { DEG } from '../src/sim/aero';
import { cloneDef, coucou, newSession, placeInFlight } from './helpers';

/** Tient « cabrer » 0,5 s puis relâche ; mesure ce qui continue après le relâchement. */
function pulse(arcade: boolean) {
  const s = newSession(coucou, { autoThrottle: false, stabilize: true, arcade });
  placeInFlight(s, { x: 600, alt: 150, vx: 32, vy: 0, thetaDeg: 0 });
  for (let i = 0; i < 60; i++) s.step({ pitch: 0, manualThrottle: 0.5 });
  for (let i = 0; i < 30; i++) s.step({ pitch: 1, manualThrottle: 0.5 });
  const thetaAtRelease = s.state.theta;
  let maxTheta = thetaAtRelease;
  let omegaAfter = 0;
  for (let i = 0; i < 60; i++) {
    s.step({ pitch: 0, manualThrottle: 0.5 });
    maxTheta = Math.max(maxTheta, s.state.theta);
    if (i === 15) omegaAfter = Math.abs(s.state.omega);
  }
  const gamma = Math.atan2(s.state.vy, s.state.vx);
  return { overshoot: (maxTheta - thetaAtRelease) / DEG, omegaAfter: omegaAfter / DEG, slip: (s.state.theta - gamma) / DEG, gained: thetaAtRelease / DEG };
}

describe('pilotage arcade (retour de test v0.2 : « trop d\'inertie »)', () => {
  it("le nez s'arrête presque immédiatement quand on relâche", () => {
    const arcade = pulse(true);
    // Reste seulement le léger retour naturel vers le vol stable (pas d'élan).
    expect(arcade.omegaAfter).toBeLessThan(6);
    // Après le relâchement, le nez ne continue que de quelques degrés (en mode simulation,
    // la rotation commençait seulement ~1 s après l'appui : c'était « l'inertie » ressentie).
    expect(arcade.overshoot).toBeLessThan(3.5);
  });

  it('une impulsion de 0,5 s fait vraiment lever le nez (réponse franche)', () => {
    expect(pulse(true).gained).toBeGreaterThan(10);
  });

  it('la trajectoire suit le nez (peu de glissement)', () => {
    expect(Math.abs(pulse(true).slip)).toBeLessThan(8);
  });

  it("un avion lourd de l'arrière cabre encore tout seul en mode arcade", () => {
    const tailHeavy = cloneDef();
    tailHeavy.masses.find((m) => m.id === 'pilot')!.x = -4;
    tailHeavy.masses.find((m) => m.id === 'pilot')!.mass = 45;
    const run = (def = coucou) => {
      const s = newSession(def, { autoThrottle: false, arcade: true });
      placeInFlight(s, { x: 600, alt: 150, vx: 42, vy: 0, thetaDeg: 0.3 });
      for (let i = 0; i < 90; i++) s.step({ pitch: 0, manualThrottle: 0.6 });
      return s.state.theta;
    };
    expect(run(tailHeavy) - run()).toBeGreaterThan(3 * DEG);
  });
});
