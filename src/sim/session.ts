import { clamp, computeAggregates, computeTrim } from './aero';
import { FIXED_DT, bodyPoint, createState, stepPhysics } from './flight';
import { type LandingGrade, type LandingThresholds, type TouchdownResult, evaluateTouchdown, worstGrade } from './landing';
import { type Reward, computeReward, starsFor } from './rewards';
import type { AircraftDef, AircraftRuntime, Env, FlightState, SurfaceProps, SurfaceType, Tuning } from './types';
import { type LandingZone, type Level, createEnv, moverPos, obstacleAt, zoneAt } from './world';

export type Phase = 'ground' | 'flying' | 'rolling' | 'ended';

export type EndReason =
  | 'landed'
  | 'hard-landing'
  | 'nose-first'
  | 'obstacle'
  | 'terrain'
  | 'water'
  | 'takeoff-failed';

export type PilotState = 'fresh' | 'ruffled' | 'shaken' | 'dazed' | 'soaked';

export interface ControlInput {
  /** Commande de tangage désirée (−1 … +1), avant rampe (mode manche). */
  pitch: number;
  /** Si défini : le joueur règle les gaz à la main (0 … 1). */
  manualThrottle?: number;
  /**
   * Mode « un doigt » (par défaut en jeu) : si défini, remplace `pitch`.
   * true = appuyé (monter), false = relâché (descente douce + arrondi automatique).
   */
  press?: boolean;
  /** Mode un doigt : plonger (touche ↓, optionnel). */
  dive?: boolean;
}

export type SessionEvent =
  | { type: 'takeoff' }
  | { type: 'ring'; index: number; boost: boolean }
  | { type: 'chain'; chain: string }
  | { type: 'bolt'; index: number }
  | { type: 'bird'; index: number }
  | { type: 'balloon'; index: number }
  | { type: 'touchdown'; result: TouchdownResult }
  | { type: 'fuel-empty' }
  | { type: 'approach' }
  | { type: 'end'; result: FlightResult };

export interface FlightResult {
  grade: LandingGrade;
  reason: EndReason;
  touchdown?: TouchdownResult;
  zone?: LandingZone;
  surface: SurfaceType;
  validated: boolean;
  stars: 0 | 1 | 2 | 3;
  endX: number;
  distanceKm: number;
  remainingKm: number;
  duration: number;
  maxAltitude: number;
  maxSpeed: number;
  rings: number;
  ringsTotal: number;
  bolts: number;
  boltsTotal: number;
  chains: number;
  fuelEmpty: boolean;
  reward: Reward;
  pilot: PilotState;
}

export interface SessionConfig {
  def: AircraftDef;
  level: Level;
  tuning: Tuning;
  surfaces: Record<SurfaceType, SurfaceProps>;
  thresholds: LandingThresholds;
  stabilize: boolean;
  autoThrottle: boolean;
  firstArrival: boolean;
  /** Pilotage arcade (recommandé en jeu). */
  arcade?: boolean;
}

const PILOT_BY_GRADE: Record<LandingGrade, PilotState> = {
  PERFECT: 'fresh',
  GOOD: 'ruffled',
  ROUGH: 'shaken',
  CRASH: 'dazed',
  WATER: 'soaked',
};

/** Orchestration d'un vol : phases, gaz automatiques, collisions, atterrissage, résultat. */
export class FlightSession {
  readonly env: Env;
  readonly runtime: AircraftRuntime;
  readonly state: FlightState;
  phase: Phase = 'ground';
  autoThrottle: boolean;
  throttle = 0;
  pitch = 0;
  hasTakenOff = false;
  inApproach = false;
  flaps = false;
  /** Mode un doigt : le joueur appuie en ce moment. */
  pressing = false;
  /** La montée initiale est terminée (altitude de sécurité atteinte une fois). */
  private climbedOnce = false;
  ringsTaken: boolean[];
  boltsTaken: boolean[];
  chainsDone = new Set<string>();
  /** Temps jusqu'auquel un obstacle vivant ne peut plus être heurté (évite les doubles chocs). */
  private moverCooldown: number[];
  result?: FlightResult;
  private grade: LandingGrade = 'PERFECT';
  private touchdown?: TouchdownResult;
  private touchdownX = 0;
  private maxAltitude = 0;
  private maxSpeed = 0;
  private fuelEmptyNotified = false;
  private events: SessionEvent[] = [];

  constructor(readonly cfg: SessionConfig) {
    this.env = createEnv(cfg.level, cfg.tuning, cfg.surfaces);
    const trim = computeTrim(cfg.def, cfg.def.fuel.capacity, cfg.tuning);
    this.runtime = { def: cfg.def, trimU: trim.trimU, alphaTrim: trim.alphaTrim, stabilize: cfg.stabilize, extraDrag: 0, arcade: cfg.arcade ?? false };
    this.state = createState(cfg.level.startX, 0, cfg.def.gear.height, cfg.def.fuel.capacity);
    this.autoThrottle = cfg.autoThrottle;
    this.ringsTaken = cfg.level.rings.map(() => false);
    this.boltsTaken = cfg.level.bolts.map(() => false);
    this.moverCooldown = cfg.level.movers.map(() => 0);
  }

  get aggregates() {
    return computeAggregates(this.cfg.def, this.state.fuel, this.cfg.tuning);
  }

  get altitude(): number {
    return this.state.y - this.cfg.def.gear.height - this.env.groundHeightAt(this.state.x);
  }

  /** Événements produits depuis le dernier appel. */
  drainEvents(): SessionEvent[] {
    const e = this.events;
    this.events = [];
    return e;
  }

  step(input: ControlInput, dt: number = FIXED_DT): void {
    if (this.phase === 'ended') return;
    const s = this.state;
    const t = this.cfg.tuning;

    // Rampe de la commande de tangage (évite les à-coups).
    const rate = dt / t.pitchRampTime;
    this.pressing = !!input.press;
    const wanted = input.press !== undefined ? this.oneButtonPitch(input.press, !!input.dive) : input.pitch;
    const target = clamp(wanted, -1, 1);
    this.pitch += clamp(target - this.pitch, -rate, rate);

    if (input.manualThrottle !== undefined) {
      this.autoThrottle = false;
      this.throttle = clamp(input.manualThrottle, 0, 1);
    } else if (this.autoThrottle) {
      this.throttle = this.autoThrottleValue(dt);
    }

    // Volets + aérofreins automatiques : en approche, l'avion est ramené vers sa vitesse d'approche
    // (sinon il accélère en descente, « flotte » au ras du sol et sort de la zone).
    if (this.flaps) {
      const excess = Math.max(0, s.airspeed - t.approachSpeed);
      this.runtime.extraDrag = t.flapsDrag + 0.05 * excess;
    }
    const braking = this.phase === 'rolling' && this.throttle < 0.2;
    const info = stepPhysics(s, this.runtime, this.env, { pitch: this.pitch, throttle: this.throttle, brake: braking }, dt);

    const alt = this.altitude;
    this.maxAltitude = Math.max(this.maxAltitude, alt);
    this.maxSpeed = Math.max(this.maxSpeed, Math.hypot(s.vx, s.vy));

    if (s.fuel <= 0 && !this.fuelEmptyNotified) {
      this.fuelEmptyNotified = true;
      this.events.push({ type: 'fuel-empty' });
    }
    if (!this.inApproach && s.x >= this.cfg.level.approachStartX) {
      this.inApproach = true;
      this.deployFlaps();
      this.events.push({ type: 'approach' });
    }

    this.collectibles();

    // Collisions avec les obstacles (nez, queue, train, dessus du fuselage).
    const g = this.cfg.def.geometry;
    const pts = [
      bodyPoint(s, g.noseX, 0),
      bodyPoint(s, g.tailX, 0),
      bodyPoint(s, g.tailX + 0.5, g.topY),
      bodyPoint(s, this.cfg.def.gear.x, -this.cfg.def.gear.height),
      bodyPoint(s, 0, g.topY),
    ];
    for (const p of pts) {
      if (obstacleAt(this.cfg.level, p.x, p.y)) {
        const speed = Math.hypot(s.vx, s.vy);
        if (this.phase === 'rolling' && speed < this.cfg.thresholds.gentleObstacleSpeed) {
          this.grade = worstGrade(this.grade, 'ROUGH');
          s.vx = 0;
          s.vy = 0;
          this.finish('landed');
        } else {
          this.grade = 'CRASH';
          this.finish('obstacle');
        }
        return;
      }
    }

    // Nez qui pique dans le sol.
    const nose = bodyPoint(s, g.noseX, 0);
    if (nose.y < this.env.groundHeightAt(nose.x) - 0.2) {
      this.grade = 'CRASH';
      this.finish('nose-first');
      return;
    }

    const surfaceType = this.env.surfaceAt(s.x);
    const surface = this.env.surfaceProps(surfaceType);

    // Décollage.
    if (!this.hasTakenOff && alt > 2) {
      this.hasTakenOff = true;
      this.phase = 'flying';
      this.events.push({ type: 'takeoff' });
    }
    if (this.phase === 'rolling' && alt > 1.5) {
      // Rebond ou remise des gaz : on repart en vol, la pire note est conservée.
      this.phase = 'flying';
    }

    if (info.contact) {
      if (surfaceType === 'water') {
        this.grade = 'WATER';
        this.finish('water');
        return;
      }
      if (!this.hasTakenOff) {
        // Roulage avant décollage : sortie de piste dans un terrain impraticable.
        if (!surface.landable) {
          this.grade = 'CRASH';
          this.finish('takeoff-failed');
        }
        return;
      }
      if (this.phase === 'flying') {
        const td = evaluateTouchdown(
          {
            sink: info.impactSink,
            groundSpeed: s.vx,
            pitch: s.theta,
            surface,
            gearTolerance: this.cfg.def.gear.tolerance,
            gearVhMax: this.cfg.def.gear.vhMax,
          },
          this.cfg.thresholds,
        );
        // Hors zone désignée : au mieux ROUGH (docs/LANDING_AND_CRASH_SYSTEM.md §4.2).
        let grade = td.grade;
        if (!zoneAt(this.cfg.level, s.x) && (grade === 'PERFECT' || grade === 'GOOD')) grade = 'ROUGH';
        this.grade = worstGrade(this.touchdown ? this.grade : 'PERFECT', grade);
        this.touchdown = td;
        this.touchdownX = s.x;
        this.events.push({ type: 'touchdown', result: td });
        if (this.grade === 'CRASH') {
          this.finish(td.cause === 'nose' ? 'nose-first' : td.cause === 'terrain' ? 'terrain' : 'hard-landing');
          return;
        }
        this.phase = 'rolling';
      } else if (this.phase === 'rolling' && !surface.landable) {
        const speed = Math.abs(s.vx);
        this.grade = speed < this.cfg.thresholds.gentleObstacleSpeed ? worstGrade(this.grade, 'ROUGH') : 'CRASH';
        if (this.grade === 'CRASH') {
          this.finish('terrain');
          return;
        }
        s.vx = 0;
      }
    }

    // PERFECT exige de rester dans la zone pendant le roulage.
    if (this.phase === 'rolling' && this.grade === 'PERFECT') {
      const z = zoneAt(this.cfg.level, s.x);
      if (!z) this.grade = 'GOOD';
    }

    if (this.phase === 'rolling' && Math.abs(s.vx) < 0.3) {
      s.vx = 0;
      this.finish('landed');
    }
    if (s.x > this.cfg.level.worldEnd) {
      this.grade = 'CRASH';
      this.finish('terrain');
    }
  }

  /** Anneaux, séries, boosts, Boulons, obstacles vivants. */
  private collectibles(): void {
    const s = this.state;
    const lvl = this.cfg.level;
    lvl.rings.forEach((r, i) => {
      if (this.ringsTaken[i] || Math.hypot(s.x - r.x, s.y - r.y) > r.r) return;
      this.ringsTaken[i] = true;
      const boost = r.kind === 'boost';
      if (boost) {
        const v = Math.hypot(s.vx, s.vy) || 1;
        s.vx += (s.vx / v) * 9;
        s.vy += (s.vy / v) * 9;
      }
      this.events.push({ type: 'ring', index: i, boost });
      if (r.chain && !this.chainsDone.has(r.chain)) {
        const all = lvl.rings.every((o, j) => o.chain !== r.chain || this.ringsTaken[j]);
        if (all) {
          this.chainsDone.add(r.chain);
          this.events.push({ type: 'chain', chain: r.chain });
        }
      }
    });
    lvl.bolts.forEach((b, i) => {
      if (!this.boltsTaken[i] && Math.hypot(s.x - b.x, s.y - b.y) <= 4) {
        this.boltsTaken[i] = true;
        this.events.push({ type: 'bolt', index: i });
      }
    });
    lvl.movers.forEach((m, i) => {
      if (s.time < this.moverCooldown[i]) return;
      const p = moverPos(m, s.time);
      if (Math.hypot(s.x - p.x, s.y - p.y) > m.r) return;
      this.moverCooldown[i] = s.time + 2;
      if (m.type === 'birds') {
        // Oiseaux : l'avion est secoué et ralentit, sans crash (humour familial).
        s.vx *= 0.82;
        s.omega += 0.6;
        this.events.push({ type: 'bird', index: i });
      } else {
        // Montgolfière : rebond « boing ».
        s.vx *= 0.6;
        s.vy = 8;
        s.omega += 0.4;
        this.events.push({ type: 'balloon', index: i });
      }
    });
  }

  /** Volets automatiques : l'avion se recale sur une vitesse d'approche plus lente (aide arcade). */
  deployFlaps(): void {
    const t = this.cfg.tuning;
    const trim = computeTrim(this.cfg.def, this.state.fuel, t, t.approachSpeed);
    this.runtime.trimU = trim.trimU;
    this.runtime.alphaTrim = trim.alphaTrim;
    this.runtime.extraDrag = t.flapsDrag;
    this.flaps = true;
  }

  /**
   * Mode un doigt : transforme « appuyé / relâché » en commande de tangage.
   * L'avion vise un angle de montée (appuyé) ou de descente douce (relâché) ;
   * près du sol, au-dessus d'un terrain, il arrondit tout seul.
   */
  oneButtonPitch(press: boolean, dive: boolean, st: FlightState = this.state, phase: Phase = this.phase): number {
    const ob = this.cfg.tuning.oneButton;
    const DEG = Math.PI / 180;
    const alt = st.y - this.cfg.def.gear.height - this.env.groundHeightAt(st.x);
    if (phase === 'ground' || phase === 'rolling') {
      // Au sol : on cabre seulement une fois la vitesse de rotation atteinte.
      const vr = this.aggregates.takeoffSpeed * 0.95;
      return press && st.vx >= vr ? 1 : 0;
    }
    let gammaTarget = press ? ob.climbDeg : dive ? ob.diveDeg : ob.glideDeg;
    if (!press && !dive && alt < ob.flareHeight && st.vy < 0) {
      const k = Math.max(0, alt) / ob.flareHeight;
      gammaTarget = ob.flareDeg + (ob.glideDeg - ob.flareDeg) * k;
    }
    // Correction sur l'angle de trajectoire réel (la vitesse qui varie ne doit pas faire « flotter »).
    const gamma = Math.atan2(st.vy, Math.max(1, st.vx));
    const correction = clamp((gammaTarget * DEG - gamma) * 0.8, -8 * DEG, 8 * DEG);
    const thetaTarget = gammaTarget * DEG + this.runtime.alphaTrim + correction;
    return clamp((thetaTarget - st.theta) * ob.gain - st.omega * 0.15, -1, 1);
  }

  private autoThrottleValue(dt: number): number {
    const s = this.state;
    let target: number;
    if (this.phase === 'rolling') return 0;
    if (this.altitude > 35) this.climbedOnce = true;
    if (!this.hasTakenOff || this.pressing || !this.climbedOnce) target = 1;
    else {
      const wanted = this.inApproach ? this.cfg.tuning.approachSpeed : this.cfg.tuning.trimSpeed;
      target = clamp(0.55 + (wanted - s.airspeed) * 0.08, 0, 1);
    }
    const k = Math.min(1, dt * 2);
    return this.throttle + (target - this.throttle) * k;
  }

  private finish(reason: EndReason): void {
    const s = this.state;
    const level = this.cfg.level;
    const zone = zoneAt(level, s.x) ?? (this.touchdown ? zoneAt(level, this.touchdownX) : undefined);
    const landed = reason === 'landed';
    const grade = this.grade;
    const validated = !!zone && zone.arrival && grade !== 'WATER' && this.hasTakenOff;
    const rings = this.ringsTaken.filter(Boolean).length;
    const bolts = this.boltsTaken.filter(Boolean).length;
    const reward = computeReward({
      level,
      endX: s.x,
      grade,
      landed,
      zone: landed ? zone : undefined,
      rings,
      bolts,
      chains: this.chainsDone.size,
      validated,
      firstArrival: this.cfg.firstArrival,
    });
    this.phase = 'ended';
    this.result = {
      grade,
      reason,
      touchdown: this.touchdown,
      zone,
      surface: this.env.surfaceAt(s.x),
      validated,
      stars: starsFor(grade, validated),
      endX: s.x,
      distanceKm: Math.max(0, (s.x - level.startX) * level.kmPerUnit),
      remainingKm: Math.abs(level.destinationX - s.x) * level.kmPerUnit,
      duration: s.time,
      maxAltitude: this.maxAltitude,
      maxSpeed: this.maxSpeed,
      rings,
      ringsTotal: level.rings.length,
      bolts,
      boltsTotal: level.bolts.length,
      chains: this.chainsDone.size,
      fuelEmpty: s.fuel <= 0,
      reward,
      pilot: PILOT_BY_GRADE[grade],
    };
    this.events.push({ type: 'end', result: this.result });
  }

  /**
   * Trajectoire prévue (aide à l'approche) : même modèle physique, commandes neutres,
   * gaz actuels. Renvoie les points et, si l'avion touche dans l'horizon, le résultat prévu.
   */
  predict(
    seconds: number,
    every = 6,
    oneButton = false,
  ): { points: { x: number; y: number }[]; outcome?: { x: number; grade: LandingGrade } } {
    const s: FlightState = { ...this.state };
    const points: { x: number; y: number }[] = [];
    const n = Math.round(seconds / FIXED_DT);
    const gearH = this.cfg.def.gear.height;
    for (let i = 0; i < n; i++) {
      // En mode un doigt, on prévoit ce qui se passe si le joueur relâche maintenant.
      const pitch = oneButton ? this.oneButtonPitch(false, false, s, 'flying') : 0;
      const info = stepPhysics(s, this.runtime, this.env, { pitch, throttle: this.throttle, brake: false });
      if (i % every === 0) points.push({ x: s.x, y: s.y - gearH });
      if (obstacleAt(this.cfg.level, s.x, s.y - gearH) || obstacleAt(this.cfg.level, s.x, s.y)) {
        points.push({ x: s.x, y: s.y - gearH });
        return { points, outcome: { x: s.x, grade: 'CRASH' } };
      }
      if (info.contact) {
        points.push({ x: s.x, y: s.y - gearH });
        const surfaceType = this.env.surfaceAt(s.x);
        if (surfaceType === 'water') return { points, outcome: { x: s.x, grade: 'WATER' } };
        const td = evaluateTouchdown(
          {
            sink: info.impactSink,
            groundSpeed: s.vx,
            pitch: s.theta,
            surface: this.env.surfaceProps(surfaceType),
            gearTolerance: this.cfg.def.gear.tolerance,
            gearVhMax: this.cfg.def.gear.vhMax,
          },
          this.cfg.thresholds,
        );
        let grade = td.grade;
        if (!zoneAt(this.cfg.level, s.x) && (grade === 'PERFECT' || grade === 'GOOD')) grade = 'ROUGH';
        return { points, outcome: { x: s.x, grade } };
      }
    }
    return { points };
  }
}
