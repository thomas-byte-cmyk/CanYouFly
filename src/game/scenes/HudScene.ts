import Phaser from 'phaser';
import { DEG } from '../../sim/aero';
import type { FlightSession } from '../../sim/session';
import { Controls } from '../input/controls';
import { C, CSS, textStyle } from '../style';

/** Interface de vol (non zoomée) : commandes, jauges, messages. */
export class HudScene extends Phaser.Scene {
  controls!: Controls;
  /** Bus d'événements propre au HUD (pause, recommencer). */
  readonly bus = new Phaser.Events.EventEmitter();
  private session!: FlightSession;
  private g!: Phaser.GameObjects.Graphics;
  private remaining!: Phaser.GameObjects.Text;
  private gauges!: Phaser.GameObjects.Text;
  private throttleLabel!: Phaser.GameObjects.Text;
  private hint!: Phaser.GameObjects.Text;
  private flash!: Phaser.GameObjects.Text;
  private warning!: Phaser.GameObjects.Text;
  private sinkText!: Phaser.GameObjects.Text;
  private debug!: Phaser.GameObjects.Text;
  private zonesText!: Phaser.GameObjects.Text;
  private flare!: Phaser.GameObjects.Text;
  private autoButton!: Phaser.GameObjects.Text;
  private flashUntil = 0;
  private debugOn = false;

  constructor() {
    super('hud');
  }

  init(data: { session: FlightSession }): void {
    this.session = data.session;
  }

  create(): void {
    this.controls = new Controls(this);
    this.g = this.add.graphics();
    const lvl = this.session.cfg.level;
    this.add.text(24, 18, `${lvl.from.toUpperCase()}  →  ${lvl.to.toUpperCase()}`, textStyle(24));
    this.remaining = this.add.text(24, 76, '', textStyle(18));
    this.gauges = this.add.text(24, 660, '', textStyle(18, CSS.ink, { backgroundColor: '#fdf3e1cc', padding: { x: 8, y: 4 } }));
    this.throttleLabel = this.add.text(0, 0, '', textStyle(16)).setOrigin(0.5, 0);
    this.hint = this.add.text(640, 130, '', textStyle(28, CSS.cream, { stroke: CSS.ink, strokeThickness: 7, align: 'center' })).setOrigin(0.5);
    this.flash = this.add.text(640, 200, '', textStyle(34, CSS.yellow, { stroke: CSS.ink, strokeThickness: 8 })).setOrigin(0.5);
    this.warning = this.add.text(640, 260, '', textStyle(40, CSS.red, { stroke: CSS.cream, strokeThickness: 8 })).setOrigin(0.5);
    this.sinkText = this.add.text(1256, 110, '', textStyle(20, CSS.ink, { backgroundColor: '#fdf3e1', padding: { x: 10, y: 6 } })).setOrigin(1, 0);
    this.zonesText = this.add.text(1256, 160, '', textStyle(18, CSS.ink, { backgroundColor: '#fdf3e1e6', padding: { x: 10, y: 6 }, align: 'right' })).setOrigin(1, 0);
    this.flare = this.add.text(640, 330, '', textStyle(44, CSS.yellow, { stroke: CSS.ink, strokeThickness: 9 })).setOrigin(0.5);
    this.debug = this.add.text(1256, 300, '', textStyle(14, CSS.ink, { backgroundColor: '#ffffffcc', padding: { x: 6, y: 4 } })).setOrigin(1, 0).setVisible(false);

    // Bouton pause (toujours visible, exigence mobile).
    const pause = this.add.text(1240, 18, 'II', textStyle(30, CSS.cream, { backgroundColor: '#2b2321', padding: { x: 16, y: 6 } })).setOrigin(1, 0).setInteractive({ useHandCursor: true });
    pause.on('pointerdown', () => this.bus.emit('pause'));

    this.autoButton = this.add
      .text(this.controls.slider.x + this.controls.slider.width / 2, this.controls.slider.top - 70, 'AUTO', textStyle(16, CSS.cream, { backgroundColor: '#3a9e9a', padding: { x: 10, y: 6 } }))
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    this.autoButton.on('pointerdown', () => this.controls.setAuto());

    this.controls.on('pause', () => this.bus.emit('pause'));
    this.controls.on('restart', () => this.bus.emit('restart'));
    this.events.once('shutdown', () => this.controls.destroy());
    this.controls.on('debug', () => {
      this.debugOn = !this.debugOn;
      this.debug.setVisible(this.debugOn);
    });
  }

  showHint(text: string): void {
    this.hint.setText(text);
  }

  showFlash(text: string, ms = 1600): void {
    this.flash.setText(text);
    this.flashUntil = this.time.now + ms;
  }

  update(_t: number, delta: number): void {
    const s = this.session;
    const st = s.state;
    const lvl = s.cfg.level;
    this.controls.update(delta / 1000, s.throttle);

    const g = this.g;
    g.clear();

    // Progression du trajet.
    const prog = Phaser.Math.Clamp((st.x - lvl.startX) / (lvl.destinationX - lvl.startX), 0, 1);
    g.fillStyle(C.cream, 0.9).fillRoundedRect(24, 54, 300, 14, 7);
    g.fillStyle(C.teal, 1).fillRoundedRect(24, 54, 300 * prog, 14, 7);
    g.lineStyle(2, C.ink, 1).strokeRoundedRect(24, 54, 300, 14, 7);
    g.fillStyle(C.red, 1).fillCircle(24 + 300 * prog, 61, 8);
    const km = Math.max(0, Math.round((lvl.destinationX - st.x) * lvl.kmPerUnit));
    this.remaining.setText(st.x < lvl.destinationX ? `${lvl.to} : ${km} km` : `${lvl.to} : tu y es !`);

    // Jauges.
    const fuelPct = Math.round((st.fuel / s.cfg.def.fuel.capacity) * 100);
    this.gauges.setText(`ALT ${Math.max(0, Math.round(s.altitude * 10))} m   VIT ${Math.round(st.airspeed * 4)} km/h   CARBURANT ${fuelPct} %`);

    // Curseur des gaz (toujours affiché : il montre aussi l'état des gaz auto au clavier).
    const sl = this.controls.slider;
    const oneButton = this.controls.scheme === 'onebutton';
    const showSlider = this.controls.isTouch && !oneButton;
    const sx = showSlider ? sl.x : 24;
    const top = showSlider ? sl.top : 470;
    const bottom = showSlider ? sl.bottom : 640;
    const w = showSlider ? sl.width : 26;
    g.fillStyle(C.cream, 0.85).fillRoundedRect(sx, top, w, bottom - top, 10);
    const th = s.throttle;
    g.fillStyle(st.fuel > 0 ? C.orange : C.stone, 1).fillRoundedRect(sx, bottom - (bottom - top) * th, w, (bottom - top) * th, 10);
    g.lineStyle(3, C.ink, 1).strokeRoundedRect(sx, top, w, bottom - top, 10);
    this.throttleLabel.setPosition(sx + w / 2, bottom + 4).setText(st.fuel <= 0 ? 'PANNE' : s.autoThrottle ? 'GAZ AUTO' : `GAZ ${Math.round(th * 100)}%`);
    if (!showSlider) this.throttleLabel.setPosition(sx + w + 46, bottom - 20);
    this.autoButton.setVisible(!s.autoThrottle && !oneButton);
    if (!showSlider) this.autoButton.setPosition(sx + w + 46, top + 10).setText('AUTO (T)');

    // Manche tactile.
    if (this.controls.isTouch && !oneButton) {
      if (this.controls.scheme === 'buttons') {
        const b = this.controls.buttons;
        for (const [y, label] of [[b.up, '▲'], [b.down, '▼']] as const) {
          g.fillStyle(C.cream, 0.6).fillCircle(b.x, y, b.r);
          g.lineStyle(3, C.ink, 0.8).strokeCircle(b.x, y, b.r);
          g.fillStyle(C.ink, 0.8);
          if (label === '▲') g.fillTriangle(b.x - 22, y + 12, b.x + 22, y + 12, b.x, y - 18);
          else g.fillTriangle(b.x - 22, y - 12, b.x + 22, y - 12, b.x, y + 18);
        }
      } else if (this.controls.stick) {
        const k = this.controls.stick;
        g.fillStyle(C.cream, 0.35).fillCircle(k.ox, k.oy, 70);
        g.lineStyle(3, C.ink, 0.6).strokeCircle(k.ox, k.oy, 70);
        const dy = Phaser.Math.Clamp(k.y - k.oy, -60, 60);
        g.fillStyle(C.teal, 0.9).fillCircle(k.ox, k.oy + dy, 30);
      } else if (!s.hasTakenOff) {
        g.fillStyle(C.cream, 0.25).fillCircle(1050, 520, 70);
        g.lineStyle(3, C.ink, 0.4).strokeCircle(1050, 520, 70);
      }
    }

    // Approche : vitesse verticale avec code couleur (aide à l'atterrissage).
    if (s.inApproach && s.phase === 'flying') {
      const sink = Math.max(0, -st.vy);
      const tol = s.cfg.def.gear.tolerance;
      const color = sink <= tol * 0.5 ? CSS.green : sink <= tol ? CSS.blue : sink <= tol * 1.6 ? CSS.orange : CSS.red;
      const label = sink <= tol * 0.5 ? 'PARFAITE' : sink <= tol ? 'BONNE' : sink <= tol * 1.6 ? 'BRUTALE' : 'TROP RAPIDE';
      this.sinkText.setVisible(true).setColor(color).setText(`Descente : ${label}`);

      // Zones devant l'avion, avec la distance (« où viser »).
      const ahead = lvl.zones.filter((z) => z.arrival && z.x1 > st.x);
      this.zonesText
        .setVisible(ahead.length > 0)
        .setText(ahead.map((z) => `${'★'.repeat(z.difficulty)} ${z.name} : ${z.x0 > st.x ? `${((z.x0 - st.x) * lvl.kmPerUnit).toFixed(1).replace('.', ',')} km` : 'dessous !'}`).join('\n'));

      // Rappel d'arrondi : près du sol et descente trop rapide.
      // En mode un doigt, l'arrondi est automatique : pas de rappel.
      const needFlare = !oneButton && s.altitude < 8 && sink > tol * 0.55 && this.controls.pitch <= 0;
      this.flare.setText(needFlare && Math.floor(this.time.now / 200) % 2 === 0 ? (this.controls.isTouch ? '↑ RELÈVE LE NEZ (pouce vers le haut) !' : '↑ RELÈVE LE NEZ !') : '');
    } else {
      this.sinkText.setVisible(false);
      this.zonesText.setVisible(false);
      this.flare.setText('');
    }

    this.warning.setText(st.stalled && s.phase === 'flying' && Math.floor(this.time.now / 250) % 2 === 0 ? 'DÉCROCHAGE ! Pique pour reprendre de la vitesse' : '');
    this.warning.setFontSize(st.stalled ? 30 : 40);
    if (this.time.now > this.flashUntil) this.flash.setText('');

    if (this.debugOn) {
      const agg = s.aggregates;
      this.debug.setText(
        [
          `x ${st.x.toFixed(0)}  alt ${s.altitude.toFixed(1)}`,
          `V ${st.airspeed.toFixed(1)}  vx ${st.vx.toFixed(1)}  vy ${st.vy.toFixed(1)}`,
          `θ ${(st.theta / DEG).toFixed(1)}°  α ${(st.alphaWing / DEG).toFixed(1)}°`,
          `L ${st.lift.toFixed(0)}  D ${st.drag.toFixed(0)}  T ${st.thrust.toFixed(0)}`,
          `masse ${agg.mass.toFixed(0)}  SM ${agg.staticMargin.toFixed(3)}`,
          `trim ${s.runtime.trimU.toFixed(2)}  gaz ${s.throttle.toFixed(2)}`,
          `phase ${s.phase}  fps ${Math.round(this.game.loop.actualFps)}`,
        ].join('\n'),
      );
    }
  }
}
