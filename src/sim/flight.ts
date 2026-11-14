import { DEG, clamp, computeAggregates, liftCoefficient, rhoAt, wrapPi } from './aero';
import type { AircraftRuntime, Env, FlightInput, FlightState, StepInfo } from './types';

/** Pas de simulation fixe (60 Hz), indépendant du rendu. */
export const FIXED_DT = 1 / 60;

export function createState(x: number, groundY: number, gearHeight: number, fuel: number): FlightState {
  return {
    x,
    y: groundY + gearHeight,
    vx: 0,
    vy: 0,
    theta: 0,
    omega: 0,
    fuel,
    onGround: true,
    time: 0,
    alphaWing: 0,
    airspeed: 0,
    stalled: false,
    lift: 0,
    drag: 0,
    thrust: 0,
  };
}

/**
 * Un pas de simulation (docs/PHYSICS_AND_CONTROLS.md §3–4).
 * Modifie `s` en place. Ne connaît ni Phaser ni l'affichage : testable.
 */
export function stepPhysics(
  s: FlightState,
  ac: AircraftRuntime,
  env: Env,
  input: FlightInput,
  dt: number = FIXED_DT,
): StepInfo {
  const t = env.tuning;
  const def = ac.def;
  const agg = computeAggregates(def, s.fuel, t);
  const M = agg.mass;

  const wind = env.windAt(s.x, s.y, s.time);
  const vax = s.vx - wind.x;
  const vay = s.vy - wind.y;
  const V = Math.hypot(vax, vay);
  const rho = rhoAt(t, s.y - env.groundHeightAt(s.x));
  const q = 0.5 * rho * V * V;
  const qEff = Math.max(q, t.qMin);
  const moving = V > 0.5;
  const gamma = moving ? Math.atan2(vay, vax) : s.theta;
  const cos = Math.cos(s.theta);
  const sin = Math.sin(s.theta);

  let fx = 0;
  let fy = 0;
  let mz = 0;
  let inducedSum = 0;
  let liftTotal = 0;
  let alphaWing = 0;
  let stalled = false;

  // Portance de chaque surface, perpendiculaire au vent relatif.
  for (const surf of def.surfaces) {
    const alpha = wrapPi(s.theta - gamma + surf.incidenceDeg * DEG);
    const stall = surf.stallAngleDeg * DEG;
    const cl = moving ? liftCoefficient(alpha, surf.liftSlope, stall) : 0;
    const L = q * surf.area * cl;
    const lx = moving ? (-vay / V) * L : 0;
    const ly = moving ? (vax / V) * L : 0;
    fx += lx;
    fy += ly;
    const arm = surf.x - agg.xCG;
    mz += arm * (cos * ly - sin * lx);
    inducedSum += surf.area * cl * cl;
    liftTotal += L;
    if (surf.id === 'wing') {
      alphaWing = alpha;
      stalled = Math.abs(alpha) > stall && moving && V > 5;
    }
  }

  // Effet de sol : près du sol, la portance augmente et la descente est amortie (aide à l'arrondi).
  const height = s.y - def.gear.height - env.groundHeightAt(s.x);
  const ge = t.groundEffect;
  if (moving && height < ge.height && height > -0.5) {
    const k = (1 - Math.max(0, height) / ge.height) ** 2;
    fx += fx * ge.liftBoost * k;
    fy += fy * ge.liftBoost * k;
    if (s.vy < 0) fy += M * ge.cushion * -s.vy * k;
  }

  // Traînée, opposée au vent relatif.
  const drag = q * (def.drag.parasite + ac.extraDrag + def.drag.inducedK * inducedSum);
  if (moving) {
    fx -= (drag * vax) / V;
    fy -= (drag * vay) / V;
  }

  // Poussée dans l'axe, l'efficacité de l'hélice baisse avec la vitesse.
  const vForward = vax * cos + vay * sin;
  const eta = clamp(1 - vForward / def.engine.propVmax, 0, 1);
  const throttle = s.fuel > 0 ? clamp(input.throttle, 0, 1) : 0;
  const thrust = def.engine.thrustMax * throttle * eta;
  fx += thrust * cos;
  fy += thrust * sin;

  // Gravité et ascendances.
  fy -= M * t.gravity;
  fy += M * env.updraftAt(s.x, s.y);

  // Moments : commande + trim (en vol), amortissement, aide à la stabilisation.
  const pitchCmd = clamp(input.pitch, -1, 1);
  const trim = s.onGround ? 0 : ac.trimU;
  mz += (pitchCmd + trim) * def.pitch.authority * qEff;
  mz -= def.pitch.damping * s.omega * qEff;
  let mzAssist = 0;
  if (ac.stabilize && !s.onGround) {
    mzAssist -= t.assist.extraDamping * def.pitch.damping * s.omega * qEff;
    if (Math.abs(pitchCmd) < 0.05 && moving) {
      const wingInc = (def.surfaces.find((x) => x.id === 'wing')?.incidenceDeg ?? 0) * DEG;
      const target = ac.alphaTrim + wingInc;
      mzAssist += t.assist.alphaHoldGain * def.pitch.authority * (target - alphaWing) * qEff;
    }
  }
  mz += mzAssist;

  // Intégration semi-implicite.
  s.vx += (fx / M) * dt;
  s.vy += (fy / M) * dt;
  if (ac.arcade) {
    // Le moment aérodynamique (stabilité, défauts de construction) devient une « commande
    // équivalente » ajoutée à celle du joueur : l'avion garde sa personnalité sans inertie.
    const a = t.arcade;
    const aeroOnly = mz - mzAssist - (pitchCmd + trim) * def.pitch.authority * qEff + def.pitch.damping * s.omega * qEff;
    const natural = clamp((aeroOnly / (def.pitch.authority * qEff) + trim) * a.natural, -0.8, 0.8);
    const speedK = clamp(V / 20, 0.35, 1);
    const target = (pitchCmd + (s.onGround ? 0 : natural)) * a.pitchRateDeg * DEG * speedK * (ac.pitchRateScale ?? 1);
    s.omega += (target - s.omega) * Math.min(1, dt / a.response);
    // Grip : la trajectoire suit le nez (moins de « glisse » vers le haut ou le bas).
    if (!s.onGround && moving && !stalled) {
      const ref = s.theta - ac.alphaTrim;
      const nx = -Math.sin(ref);
      const ny = Math.cos(ref);
      const vperp = s.vx * nx + s.vy * ny;
      const k = Math.min(1, a.grip * dt * clamp(V / 25, 0, 1));
      s.vx -= vperp * nx * k;
      s.vy -= vperp * ny * k;
    }
  } else {
    s.omega += (mz / agg.inertia) * dt;
  }
  s.theta = wrapPi(s.theta + s.omega * dt);
  s.x += s.vx * dt;
  s.y += s.vy * dt;
  if (s.fuel > 0) s.fuel = Math.max(0, s.fuel - def.fuel.burnRate * throttle * dt);
  s.time += dt;

  // Contact avec le sol (le train touche).
  const info: StepInfo = { contact: false, impactSink: 0 };
  const groundY = env.groundHeightAt(s.x);
  const gearBottom = s.y - def.gear.height;
  if (gearBottom <= groundY) {
    info.contact = true;
    info.impactSink = Math.max(0, -s.vy);
    s.y = groundY + def.gear.height;
    if (s.vy < 0) s.vy = 0;
    // Au sol, l'assiette est contrainte par le train.
    if (s.theta < t.ground.pitchMin || s.theta > t.ground.pitchMax) {
      s.theta = clamp(s.theta, t.ground.pitchMin, t.ground.pitchMax);
      s.omega = 0;
    }
    // Frottement de roulement (+ freins après l'atterrissage).
    const props = env.surfaceProps(env.surfaceAt(s.x));
    const normal = Math.max(0, -fy);
    const mu = props.rolling + (input.brake ? props.brake : 0);
    const dv = ((mu * normal) / M) * dt;
    if (Math.abs(s.vx) <= dv) s.vx = 0;
    else s.vx -= Math.sign(s.vx) * dv;
    s.onGround = true;
  } else {
    s.onGround = gearBottom <= groundY + 0.05;
  }

  s.alphaWing = alphaWing;
  s.airspeed = V;
  s.stalled = stalled && !s.onGround;
  s.lift = liftTotal;
  s.drag = drag;
  s.thrust = thrust;
  return info;
}

/** Position monde d'un point de l'avion (coordonnées locales : x le long de l'axe, y vers le haut). */
export function bodyPoint(s: FlightState, lx: number, ly: number): { x: number; y: number } {
  const c = Math.cos(s.theta);
  const n = Math.sin(s.theta);
  return { x: s.x + lx * c - ly * n, y: s.y + lx * n + ly * c };
}
