import Phaser from 'phaser';
import { type PackageDef, cargoX } from '../../sim/cargo';
import type { AircraftDef, FlightState } from '../../sim/types';
import { C, PX } from '../style';
import { type Expression, drawPilot } from './pilot';

/** Coordonnées locales de l'avion (u) → pixels (y vers le bas). */
const P = (x: number, y: number) => new Phaser.Math.Vector2(x * PX, -y * PX);

/** Avion dessiné avec des formes simples (placeholder « Atelier du Dimanche »), aux couleurs et proportions de sa définition. */
export class PlaneView {
  readonly root: Phaser.GameObjects.Container;
  private readonly prop: Phaser.GameObjects.Graphics;
  private readonly pilot: Phaser.GameObjects.Graphics;
  private propPhase = 0;
  private expression: Expression | null = null;
  private wobble = 0;
  private cargoView?: Phaser.GameObjects.Container;
  private readonly cargo?: PackageDef;

  constructor(scene: Phaser.Scene, def?: AircraftDef, cargo?: PackageDef) {
    this.root = scene.add.container(0, 0);
    this.cargo = cargo;
    const look = def?.look;
    const hex = (v: string | undefined, d: number) => (v ? parseInt(v, 16) : d);
    const bodyColor = hex(look?.body, C.paper);
    const wingColor = hex(look?.wing, C.yellow);
    const accent = hex(look?.accent, C.red);
    const wingK = look?.wingScale ?? 1;
    const es = look?.engineScale ?? 1;
    const body = scene.add.graphics();
    this.pilot = scene.add.graphics();
    this.prop = scene.add.graphics();
    const lw = 3;

    // Dérive (derrière le fuselage).
    body.fillStyle(C.teal, 1).lineStyle(lw, C.ink, 1);
    const fin = [P(-4.5, 0.7), P(-5.9, 2.7), P(-6.3, 2.6), P(-6.0, 0.5)];
    body.fillPoints(fin, true).strokePoints(fin, true);

    // Train d'atterrissage.
    body.lineStyle(lw, C.ink, 1);
    body.lineBetween(P(0.2, -0.6).x, P(0.2, -0.6).y, P(0.6, -1.15).x, P(0.6, -1.15).y);
    body.lineBetween(P(1.1, -0.6).x, P(1.1, -0.6).y, P(0.6, -1.15).x, P(0.6, -1.15).y);
    body.fillStyle(0x3b3431, 1).fillCircle(P(0.6, -1.15).x, P(0.6, -1.15).y, 0.48 * PX);
    body.fillStyle(C.stoneLight, 1).fillCircle(P(0.6, -1.15).x, P(0.6, -1.15).y, 0.2 * PX);
    // Béquille de queue.
    body.lineBetween(P(-5.2, 0).x, P(-5.2, 0).y, P(-5.6, -0.4).x, P(-5.6, -0.4).y);

    // Fuselage.
    const fus = [
      P(3.7, 0.85), P(1.2, 1.1), P(-1.2, 0.95), P(-5.7, 0.55), P(-5.9, 0.05),
      P(-1.2, -0.75), P(1.5, -0.85), P(3.7, -0.65),
    ];
    body.fillStyle(bodyColor, 1).fillPoints(fus, true);
    // Bande décorative.
    const stripe = [P(3.6, 0.1), P(-5.8, 0.25), P(-5.85, 0.0), P(3.6, -0.25)];
    body.fillStyle(accent, 1).fillPoints(stripe, true);
    body.lineStyle(lw, C.ink, 1).strokePoints(fus, true);
    // Capot moteur.
    const cowl = [P(3.6, 0.95 * es), P(3.6 + 0.7 * es, 0.7 * es), P(3.6 + 0.7 * es, -0.55 * es), P(3.6, -0.75 * es)];
    body.fillStyle(accent === C.ink ? C.stone : accent, 1).fillPoints(cowl, true).lineStyle(lw, C.ink, 1).strokePoints(cowl, true);
    // Pare-brise.
    const ws = [P(0.9, 1.05), P(1.5, 1.75), P(1.8, 1.7), P(1.5, 1.05)];
    body.fillStyle(0xbfe8f0, 0.9).fillPoints(ws, true).lineStyle(2, C.ink, 1).strokePoints(ws, true);

    // Empennage horizontal.
    const stab = [P(-4.3, 0.55), P(-6.2, 0.62), P(-6.3, 0.3), P(-4.4, 0.3)];
    body.fillStyle(C.teal, 1).fillPoints(stab, true).lineStyle(lw, C.ink, 1).strokePoints(stab, true);

    // Aile parasol + haubans.
    body.lineStyle(2.5, C.ink, 1);
    body.lineBetween(P(-0.2, 0.95).x, P(-0.2, 0.95).y, P(0.1, 2.3).x, P(0.1, 2.3).y);
    body.lineBetween(P(1.6, 1.0).x, P(1.6, 1.0).y, P(1.4, 2.3).x, P(1.4, 2.3).y);
    const wx = (x: number) => 0.75 + (x - 0.75) * wingK;
    const wing = [P(wx(2.5), 2.6), P(wx(1.7), 3.15), P(wx(-0.6), 3.05), P(wx(-1.0), 2.55), P(wx(2.5), 2.25)];
    body.fillStyle(wingColor, 1).fillPoints(wing, true).lineStyle(2.5, C.ink, 1).strokePoints(wing, true);
    // Reflet pour la lisibilité.
    body.lineStyle(2, C.white, 0.6).lineBetween(P(wx(1.6), 2.95).x, P(wx(1.6), 2.95).y, P(wx(-0.4), 2.85).x, P(wx(-0.4), 2.85).y);

    // Moyeu d'hélice.
    body.fillStyle(C.stoneLight, 1).fillCircle(P(4.45, 0.08).x, P(4.45, 0.08).y, 0.32 * PX);
    body.lineStyle(2, C.ink, 1).strokeCircle(P(4.45, 0.08).x, P(4.45, 0.08).y, 0.32 * PX);

    this.root.add([this.pilot, body, this.prop]);

    // Colis visible dans la soute (caisse en bois + pictogramme), à sa vraie position.
    if (cargo) {
      const crate = scene.add.graphics();
      crate.fillStyle(0xc89b5e, 1).fillRoundedRect(-13, -13, 26, 22, 4).lineStyle(2.5, C.ink, 1).strokeRoundedRect(-13, -13, 26, 22, 4);
      crate.lineStyle(1.5, 0x8a6a3a, 1).lineBetween(-13, -2, 13, -2);
      const icon = scene.add.text(0, -3, cargo.icon, { fontSize: '16px' }).setOrigin(0.5);
      this.cargoView = scene.add.container(this.cargoPx(cargo.slotX), -1.15 * PX, [crate, icon]);
      this.root.addAt(this.cargoView, 1);
    }
    this.setExpression('calm');
  }

  setExpression(e: Expression, state?: Parameters<typeof drawPilot>[5]): void {
    const key = (e + (state ?? '')) as Expression;
    if (key === this.expression) return;
    this.expression = key;
    this.pilot.clear();
    drawPilot(this.pilot, 0.15 * PX, -1.9 * PX, 1.0 * PX, e, state);
  }

  /** Met à jour position, rotation, hélice. */
  update(s: FlightState, throttle: number, engineOn: boolean, dtMs: number, shake: number): void {
    this.wobble += dtMs * 0.03;
    const jitter = shake > 0 ? Math.sin(this.wobble * 3.1) * shake : 0;
    this.root.setPosition(s.x * PX, -s.y * PX + jitter);
    if (this.cargo?.shifting && this.cargoView) {
      this.cargoView.x = this.cargoPx(cargoX(this.cargo, s.time));
      this.cargoView.angle = Math.sin(s.time * 9) * 8;
    }
    this.root.setRotation(-s.theta);

    const spin = engineOn ? 0.25 + throttle * 0.9 : s.airspeed > 5 ? 0.06 : 0;
    this.propPhase += spin * dtMs * 0.06;
    const k = Math.cos(this.propPhase);
    this.prop.clear();
    const hub = P(4.6, 0.08);
    const len = 1.9 * PX;
    this.prop.fillStyle(0x7a5a3a, 1).lineStyle(2, C.ink, 1);
    this.prop.fillEllipse(hub.x, hub.y - (len / 2) * k, 0.35 * PX, Math.abs(len * k) + 2);
    this.prop.fillEllipse(hub.x, hub.y + (len / 2) * k, 0.35 * PX, Math.abs(len * k) + 2);
    if (spin > 0.3) {
      this.prop.fillStyle(C.white, 0.18).fillEllipse(hub.x, hub.y, 0.5 * PX, len * 2);
    }
  }

  /** Le colis est dessiné derrière le cockpit, décalé selon sa position dans l'avion. */
  private cargoPx(slotX: number): number {
    return (slotX - 1.9) * PX;
  }

  setVisible(v: boolean): void {
    this.root.setVisible(v);
  }
}
