import Phaser from 'phaser';
import { CONTENT } from '../../sim/content';
import { FIXED_DT } from '../../sim/flight';
import { type FlightResult, FlightSession } from '../../sim/session';
import { PlaneView } from '../render/plane';
import { drawWorld } from '../render/world';
import { C, PX } from '../style';
import type { BackgroundScene } from './BackgroundScene';
import type { HudScene } from './HudScene';

interface Particle {
  obj: Phaser.GameObjects.Shape;
  vx: number;
  vy: number;
  vr: number;
  life: number;
}

/** Progression conservée pendant la session de jeu (la sauvegarde arrive avec l'issue #15). */
export const sessionProgress = { boulons: 0, bestStars: 0, flights: 0 };

/** Scène de vol : simulation à pas fixe, caméra, effets. */
export class FlightScene extends Phaser.Scene {
  private session!: FlightSession;
  private plane!: PlaneView;
  private hud!: HudScene;
  private bg!: BackgroundScene;
  private trajectory!: Phaser.GameObjects.Graphics;
  private rings: Phaser.GameObjects.Graphics[] = [];
  private updrafts: Phaser.GameObjects.Graphics[] = [];
  private particles: Particle[] = [];
  private acc = 0;
  private zoom = 1.2;
  private camX = 0;
  private camY = 0;
  private ended = false;
  private hintStage = 0;
  private shake = 0;

  constructor() {
    super('flight');
  }

  create(): void {
    this.ended = false;
    this.acc = 0;
    this.hintStage = 0;
    this.particles = [];
    const level = CONTENT.levels['paris-reims'];
    this.session = new FlightSession({
      def: CONTENT.aircraft.coucou,
      level,
      tuning: CONTENT.tuning,
      surfaces: CONTENT.surfaces,
      thresholds: CONTENT.landing,
      stabilize: true,
      autoThrottle: true,
      firstArrival: sessionProgress.bestStars === 0,
    });

    const world = drawWorld(this, level);
    this.rings = world.rings;
    this.updrafts = world.updrafts;
    this.trajectory = this.add.graphics();
    this.plane = new PlaneView(this);

    const cam = this.cameras.main;
    cam.setZoom(this.zoom);
    this.camX = this.session.state.x * PX + 300;
    this.camY = -240 / this.zoom;
    cam.centerOn(this.camX, this.camY);

    this.bg = this.scene.get('background') as BackgroundScene;
    this.scene.launch('hud', { session: this.session });
    this.hud = this.scene.get('hud') as HudScene;
    this.scene.bringToTop('hud');
    this.hud.events.once('create', () => {
      this.hud.showHint(this.hud.controls.isTouch ? 'Glisse ton pouce droit vers le HAUT\npour décoller' : 'Maintiens ↑ pour décoller');
      this.hud.bus.on('pause', () => this.pause());
      this.hud.bus.on('restart', () => this.restart());
    });

    this.events.once('shutdown', () => {
      this.hud.bus.removeAllListeners();
      this.scene.stop('hud');
    });
  }

  private pause(): void {
    if (this.ended) return;
    this.scene.pause();
    this.scene.pause('hud');
    this.scene.launch('pause');
  }

  restart(): void {
    this.scene.stop('results');
    this.scene.stop('pause');
    this.scene.stop('hud');
    this.scene.restart();
  }

  update(_time: number, delta: number): void {
    const s = this.session;
    const controls = this.hud?.controls;
    if (!controls) return;

    // Simulation à pas fixe (indépendante du nombre d'images par seconde).
    if (!this.ended) {
      this.acc += Math.min(delta, 100) / 1000;
      while (this.acc >= FIXED_DT) {
        s.step({ pitch: controls.pitch, manualThrottle: controls.manualThrottle });
        this.acc -= FIXED_DT;
        if (s.phase === 'ended') break;
      }
    }
    for (const e of s.drainEvents()) this.onEvent(e);
    this.updateHints();

    // Avion et pilote.
    const st = s.state;
    const sinkFast = -st.vy > s.cfg.def.gear.tolerance * 1.4 && s.altitude < 40;
    if (!this.ended) this.plane.setExpression(st.stalled || sinkFast ? 'scared' : s.inApproach ? 'focused' : 'calm');
    this.shake = st.stalled ? 1.5 : Math.max(0, this.shake - delta * 0.01);
    this.plane.update(st, s.throttle, st.fuel > 0 && !this.ended, delta, this.shake);

    this.updateTrajectory();
    this.updateParticles(delta / 1000);
    this.updateCamera(delta / 1000);
    for (const u of this.updrafts) u.setAlpha(0.75 + Math.sin(this.time.now / 300) * 0.25);
  }

  private updateHints(): void {
    const s = this.session;
    if (this.hintStage === 0 && s.hasTakenOff) {
      this.hintStage = 1;
      this.hud.showHint(this.hud.controls.isTouch ? 'Bravo ! Relâche pour voler droit.\nPouce vers le bas = descendre' : 'Bravo ! Relâche pour voler droit.\n↓ pour descendre');
      this.time.delayedCall(4000, () => this.hintStage === 1 && this.hud.showHint(''));
    }
  }

  private onEvent(e: ReturnType<FlightSession['drainEvents']>[number]): void {
    switch (e.type) {
      case 'ring': {
        this.hud.showFlash('Anneau ! +3 Boulons');
        const r = this.rings[e.index];
        this.tweens.add({ targets: r, alpha: 0, scale: 1.2, duration: 400 });
        break;
      }
      case 'fuel-empty':
        this.hud.showFlash('Panne sèche ! Plane jusqu\'à une zone', 2500);
        break;
      case 'approach':
        this.hintStage = 2;
        this.hud.showHint('Approche de Reims : choisis une zone à drapeaux\net descends doucement');
        this.hud.showFlash('Volets sortis : l\'avion ralentit', 2200);
        this.time.delayedCall(5000, () => this.hintStage === 2 && this.hud.showHint(''));
        break;
      case 'touchdown':
        this.dust(this.session.state.x, 10);
        if (e.result.grade === 'ROUGH') this.cameras.main.shake(250, 0.006);
        break;
      case 'end':
        this.onEnd(e.result);
        break;
      default:
        break;
    }
  }

  private onEnd(result: FlightResult): void {
    this.ended = true;
    this.hud.showHint('');
    this.trajectory.clear();
    const st = this.session.state;
    const expr = result.grade === 'PERFECT' || result.grade === 'GOOD' ? 'happy' : result.grade === 'ROUGH' ? 'calm' : 'dazed';
    this.plane.setExpression(expr, result.pilot);
    if (result.grade === 'WATER') {
      this.splash(st.x);
      this.tweens.add({ targets: this.plane.root, y: this.plane.root.y + 40, angle: 25, alpha: 0.4, duration: 900 });
    } else if (result.grade === 'CRASH') {
      this.cameras.main.shake(400, 0.012);
      this.debris(st.x, st.y);
      this.dust(st.x, 24);
      this.tweens.add({ targets: this.plane.root, angle: this.plane.root.angle + 160, y: -1.5 * PX, duration: 700, ease: 'Bounce.easeOut' });
    }
    sessionProgress.flights += 1;
    sessionProgress.boulons += result.reward.total;
    sessionProgress.bestStars = Math.max(sessionProgress.bestStars, result.stars);
    this.time.delayedCall(result.grade === 'CRASH' || result.grade === 'WATER' ? 1400 : 700, () => {
      this.scene.sleep('hud');
      this.scene.launch('results', { result, level: this.session.cfg.level });
    });
  }

  private updateTrajectory(): void {
    const s = this.session;
    const g = this.trajectory;
    g.clear();
    if (this.ended || s.phase !== 'flying' || !s.inApproach) return;
    const pts = s.predict(3);
    g.fillStyle(C.white, 0.9);
    for (const p of pts) g.fillCircle(p.x * PX, -p.y * PX, 4);
    const last = pts[pts.length - 1];
    if (last && last.y <= 0.5) {
      const surf = s.env.surfaceAt(last.x);
      const props = s.env.surfaceProps(surf);
      const color = surf === 'water' ? C.blue : props.landable ? C.green : C.red;
      g.lineStyle(4, C.ink, 1).fillStyle(color, 1);
      g.fillCircle(last.x * PX, -last.y * PX, 10).strokeCircle(last.x * PX, -last.y * PX, 10);
    }
  }

  private updateCamera(dt: number): void {
    const s = this.session;
    const cam = this.cameras.main;
    // En approche, la caméra dézoome pour montrer à la fois l'avion, le sol et les zones
    // (règle d'équité : on voit où l'on va se poser).
    const fit = this.scale.height / (Math.max(0, s.altitude) * PX + 300);
    const high = s.altitude > 120 ? 1.0 : 1.2;
    const targetZoom = this.ended ? 1.35 : s.inApproach ? Phaser.Math.Clamp(fit, 0.5, 1.0) : high;
    this.zoom += (targetZoom - this.zoom) * Math.min(1, dt * 1.5);
    cam.setZoom(this.zoom);

    const viewW = this.scale.width / this.zoom;
    const viewH = this.scale.height / this.zoom;
    const px = s.state.x * PX;
    const py = -s.state.y * PX;
    // L'avion est placé à ~22 % de la largeur : on voit loin devant (obstacles annoncés).
    const lookAhead = this.ended ? 0 : viewW * 0.28;
    const tx = px + lookAhead;
    // Le sol reste en bas de l'écran quand l'avion vole bas.
    const groundLimit = -(viewH / 2 - 130 / this.zoom);
    let ty = Math.min(py, groundLimit);
    if (s.inApproach && !this.ended) {
      // Sol en bas, avion au moins à 110 px du haut.
      ty = Math.min(groundLimit, py + viewH / 2 - 110 / this.zoom);
    }
    const k = Math.min(1, dt * 4);
    this.camX += (tx - this.camX) * k;
    this.camY += (ty - this.camY) * k;
    cam.centerOn(this.camX, this.camY);
    this.bg?.follow(cam.scrollX, cam.scrollY);
  }

  private dust(x: number, n: number): void {
    for (let i = 0; i < n; i++) {
      const c = this.add.circle(x * PX + Phaser.Math.Between(-20, 20), -4, Phaser.Math.Between(6, 14), 0xd8c8a8, 0.9);
      this.particles.push({ obj: c, vx: Phaser.Math.Between(-80, 80), vy: Phaser.Math.Between(-120, -30), vr: 0, life: 0.9 });
    }
  }

  private splash(x: number): void {
    for (let i = 0; i < 28; i++) {
      const c = this.add.circle(x * PX + Phaser.Math.Between(-30, 30), 0, Phaser.Math.Between(5, 11), i % 3 ? C.blue : C.white, 1);
      this.particles.push({ obj: c, vx: Phaser.Math.Between(-140, 140), vy: Phaser.Math.Between(-420, -180), vr: 0, life: 1.4 });
    }
  }

  private debris(x: number, y: number): void {
    const colors = [C.red, C.yellow, C.paper, C.teal, 0x7a5a3a];
    for (let i = 0; i < 10; i++) {
      const r = this.add.rectangle(x * PX, -y * PX, Phaser.Math.Between(8, 22), Phaser.Math.Between(5, 12), colors[i % colors.length]).setStrokeStyle(2, C.ink);
      this.particles.push({ obj: r, vx: Phaser.Math.Between(-220, 260), vy: Phaser.Math.Between(-420, -120), vr: Phaser.Math.FloatBetween(-8, 8), life: 1.6 });
    }
    const puff = this.add.circle(x * PX, -y * PX, 30, 0x55504c, 0.6);
    this.tweens.add({ targets: puff, scale: 3, alpha: 0, duration: 1200 });
  }

  private updateParticles(dt: number): void {
    for (const p of this.particles) {
      p.vy += 700 * dt;
      p.obj.x += p.vx * dt;
      p.obj.y = Math.min(p.obj.y + p.vy * dt, 0);
      p.obj.rotation += p.vr * dt;
      p.life -= dt;
      p.obj.setAlpha(Math.max(0, Math.min(1, p.life)));
    }
    this.particles = this.particles.filter((p) => {
      if (p.life > 0) return true;
      p.obj.destroy();
      return false;
    });
  }
}
