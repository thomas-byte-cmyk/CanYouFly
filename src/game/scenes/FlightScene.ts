import Phaser from 'phaser';
import { CONTENT } from '../../sim/content';
import { FIXED_DT } from '../../sim/flight';
import type { LandingGrade } from '../../sim/landing';
import { moverPos } from '../../sim/world';
import { type FlightResult, FlightSession } from '../../sim/session';
import { PlaneView } from '../render/plane';
import { currentOrder, game } from '../state';
import { drawMover, drawWorld } from '../render/world';
import { C, CSS, PX, textStyle } from '../style';
import type { BackgroundScene } from './BackgroundScene';
import type { HudScene } from './HudScene';

interface Particle {
  obj: Phaser.GameObjects.Shape;
  vx: number;
  vy: number;
  vr: number;
  life: number;
}

const OUTCOME_COLOR: Record<LandingGrade, number> = {
  PERFECT: 0x4caf50,
  GOOD: 0x4aa3df,
  ROUGH: 0xf2994a,
  CRASH: 0xd9573b,
  WATER: 0x2f7fb8,
};
const OUTCOME_LABEL: Record<LandingGrade, string> = {
  PERFECT: 'PARFAIT',
  GOOD: 'BON',
  ROUGH: 'BRUTAL',
  CRASH: 'CRASH !',
  WATER: 'PLOUF !',
};


/** Scène de vol : simulation à pas fixe, caméra, effets. */
export class FlightScene extends Phaser.Scene {
  private session!: FlightSession;
  private plane!: PlaneView;
  private hud!: HudScene;
  private bg!: BackgroundScene;
  private trajectory!: Phaser.GameObjects.Graphics;
  private rings: Phaser.GameObjects.Graphics[] = [];
  private updrafts: Phaser.GameObjects.Graphics[] = [];
  private bolts: Phaser.GameObjects.Graphics[] = [];
  private movers: Phaser.GameObjects.Container[] = [];
  private shadow!: Phaser.GameObjects.Ellipse;
  private outcomeText!: Phaser.GameObjects.Text;
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
    const order = currentOrder();
    const level = CONTENT.levels[order.levelId];
    const cargo = CONTENT.packages[order.packageId];
    this.session = new FlightSession({
      def: CONTENT.aircraft[game.aircraftId] ?? CONTENT.aircraft.coucou,
      cargo,
      level,
      tuning: CONTENT.tuning,
      surfaces: CONTENT.surfaces,
      thresholds: CONTENT.landing,
      stabilize: true,
      autoThrottle: true,
      arcade: true,
      firstArrival: false,
    });

    const world = drawWorld(this, level);
    this.rings = world.rings;
    this.updrafts = world.updrafts;
    this.bolts = world.bolts;
    this.movers = level.movers.map((m) => drawMover(this, m));
    this.shadow = this.add.ellipse(0, -4, 90, 14, C.ink, 0.45);
    this.trajectory = this.add.graphics();
    this.outcomeText = this.add.text(0, 0, '', textStyle(22, CSS.white, { stroke: CSS.ink, strokeThickness: 6 })).setOrigin(0.5, 1);
    this.plane = new PlaneView(this, this.session.cfg.def, cargo);

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
      const c = this.hud.controls;
      this.hud.showHint(
        c.scheme === 'onebutton'
          ? c.isTouch
            ? 'Garde le doigt appuyé à DROITE de l\'écran\npour décoller et monter'
            : 'Maintiens ESPACE (ou clic) pour décoller et monter'
          : c.isTouch
            ? 'Glisse ton pouce droit vers le HAUT\npour décoller'
            : 'Maintiens ↑ pour décoller',
      );
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
    this.scene.stop('select');
    this.scene.stop('order');
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
        if (controls.scheme === 'onebutton') s.step({ pitch: 0, press: controls.press, dive: controls.dive });
        else s.step({ pitch: controls.pitch, manualThrottle: controls.manualThrottle });
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

    // Ombre au sol : indique la hauteur (plus l'avion est bas, plus elle est nette).
    const alt = Math.max(0, s.altitude);
    const surfaceIsWater = s.env.surfaceAt(st.x) === 'water';
    this.shadow.setPosition(st.x * PX, surfaceIsWater ? 4 : -4);
    this.shadow.setScale(Math.max(0.35, 1 / (1 + alt / 40)), 1);
    this.shadow.setAlpha(Math.max(0.12, 0.55 - alt / 120));
    this.shadow.setVisible(!this.ended || s.result?.grade !== 'WATER');

    // Obstacles vivants (même horloge que la simulation : trajectoires prévisibles).
    this.cfgMovers(st.time);

    this.updateTrajectory();
    this.updateParticles(delta / 1000);
    this.updateCamera(delta / 1000);
    for (const u of this.updrafts) u.setAlpha(0.75 + Math.sin(this.time.now / 300) * 0.25);
  }

  private updateHints(): void {
    const s = this.session;
    if (this.hintStage === 0 && s.hasTakenOff) {
      this.hintStage = 1;
      this.time.delayedCall(4200, () => this.hud.showFlash('« Statut : partenaire indépendant. Casque : en option. »', 2600));
      const c = this.hud.controls;
      this.hud.showHint(
        c.scheme === 'onebutton'
          ? 'Bravo ! Appuie = monter, relâche = redescendre doucement'
          : c.isTouch
            ? 'Bravo ! Relâche pour voler droit.\nPouce vers le bas = descendre'
            : 'Bravo ! Relâche pour voler droit.\n↓ pour descendre',
      );
      this.time.delayedCall(4000, () => this.hintStage === 1 && this.hud.showHint(''));
    }
  }

  private onEvent(e: ReturnType<FlightSession['drainEvents']>[number]): void {
    switch (e.type) {
      case 'ring': {
        this.hud.showFlash(e.boost ? 'BOOST ! +3 Boulons' : 'Anneau ! +3 Boulons');
        const r = this.rings[e.index];
        this.tweens.add({ targets: r, alpha: 0, duration: 400 });
        if (e.boost) this.cameras.main.shake(200, 0.004);
        break;
      }
      case 'chain':
        this.hud.showFlash('Série complète ! +10 Boulons', 2000);
        break;
      case 'bolt': {
        const b = this.bolts[e.index];
        this.tweens.add({ targets: b, alpha: 0, y: b.y - 30, duration: 300 });
        break;
      }
      case 'bird':
        this.hud.showFlash('Oiseaux ! Pip est couvert de plumes', 1800);
        this.feathers(this.session.state.x, this.session.state.y);
        this.plane.setExpression('scared');
        break;
      case 'balloon':
        this.hud.showFlash('BOING ! Pardon, madame la montgolfière', 1800);
        this.cameras.main.shake(200, 0.006);
        break;
      case 'fuel-empty':
        this.hud.showFlash('Panne sèche ! Plane jusqu\'à une zone', 2500);
        break;
      case 'approach':
        this.hintStage = 2;
        this.hud.showHint(
          this.hud.controls.scheme === 'onebutton'
            ? `Approche de ${this.session.cfg.level.to} : relâche au-dessus d'une zone à drapeaux.\nL'avion se pose tout seul… le colis, lui, ça dépend de toi.`
            : `Approche de ${this.session.cfg.level.to} : choisis une zone à drapeaux\net descends doucement`,
        );
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
    const d = result.delivery;
    const order = currentOrder();
    game.flights += 1;
    game.boulons += d?.total ?? result.reward.total;
    if (d) {
      game.bestRating[order.id] = Math.max(game.bestRating[order.id] ?? 0, d.rating);
      if (d.status === 'livre') game.unlocked = Math.max(game.unlocked, game.orderIndex + 2);
    }
    if (result.grade === 'WATER') {
      // Le PLOUF devient un moment : le colis flotte, Pip a une phrase.
      const box = this.add.text(st.x * PX + 40, 10, this.session.cfg.cargo?.icon ?? '📦', { fontSize: '44px' }).setOrigin(0.5);
      this.tweens.add({ targets: box, y: 0, angle: 12, yoyo: true, repeat: -1, duration: 700, ease: 'Sine.easeInOut' });
      this.hud.showFlash('« Le colis est imperméable. Moi, non. »', 2500);
    }
    this.time.delayedCall(result.grade === 'CRASH' || result.grade === 'WATER' ? 1800 : 800, () => {
      this.scene.sleep('hud');
      this.scene.launch('results', { result, level: this.session.cfg.level, order });
    });
  }

  private cfgMovers(t: number): void {
    this.session.cfg.level.movers.forEach((m, i) => {
      const p = moverPos(m, t);
      const c = this.movers[i];
      c.setPosition(p.x * PX, -p.y * PX);
      if (m.type === 'birds') c.setScale(1, 1 + Math.sin(t * 12) * 0.25);
    });
  }

  /**
   * Trajectoire prévue en approche, avec le résultat annoncé au point d'impact
   * (« où viser » : retour de playtest v0.1).
   */
  private updateTrajectory(): void {
    const s = this.session;
    const g = this.trajectory;
    g.clear();
    this.outcomeText.setText('');
    if (this.ended || s.phase !== 'flying' || !s.inApproach) return;
    const { points, outcome } = s.predict(4, 6, this.hud.controls.scheme === 'onebutton');
    g.fillStyle(C.white, 0.9);
    for (const p of points) g.fillCircle(p.x * PX, -p.y * PX, 4);
    if (!outcome) return;
    const last = points[points.length - 1];
    const color = OUTCOME_COLOR[outcome.grade];
    g.lineStyle(4, C.ink, 1).fillStyle(color, 1);
    g.fillCircle(last.x * PX, -last.y * PX, 11).strokeCircle(last.x * PX, -last.y * PX, 11);
    this.outcomeText
      .setPosition(last.x * PX, -last.y * PX - 18)
      .setText(OUTCOME_LABEL[outcome.grade])
      .setColor(`#${color.toString(16).padStart(6, '0')}`);
  }

  private feathers(x: number, y: number): void {
    for (let i = 0; i < 12; i++) {
      const f = this.add.ellipse(x * PX, -y * PX, 10, 4, C.white, 1).setStrokeStyle(1, C.ink);
      this.particles.push({ obj: f, vx: Phaser.Math.Between(-120, 120), vy: Phaser.Math.Between(-200, -40), vr: Phaser.Math.FloatBetween(-6, 6), life: 1.5 });
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
      p.vy += (p.obj.type === 'Ellipse' ? 150 : 700) * dt;
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
