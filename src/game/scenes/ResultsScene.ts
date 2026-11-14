import Phaser from 'phaser';
import type { FlightResult } from '../../sim/session';
import type { Level } from '../../sim/world';
import { drawPilot } from '../render/pilot';
import { C, CSS, textStyle } from '../style';
import { GRADE_COLOR, GRADE_TITLE, PILOT_LABEL, PLANE_LABEL, advice, narrative, pickPhrase } from '../texts';
import { type FlightScene, sessionProgress } from './FlightScene';

/** Écran de résultats (version prototype de docs/GAME_DESIGN.md §7). */
export class ResultsScene extends Phaser.Scene {
  constructor() {
    super('results');
  }

  create(data: { result: FlightResult; level: Level }): void {
    const { result: r, level } = data;
    const W = this.scale.width;
    const H = this.scale.height;
    this.add.rectangle(0, 0, W, H, C.ink, 0.45).setOrigin(0);

    const card = this.add.container(W / 2, H / 2);
    const g = this.add.graphics();
    g.fillStyle(C.cream, 1).fillRoundedRect(-560, -335, 1120, 670, 28);
    g.lineStyle(6, C.ink, 1).strokeRoundedRect(-560, -335, 1120, 670, 28);
    card.add(g);

    const title = this.add.text(0, -318, GRADE_TITLE[r.grade], textStyle(54, GRADE_COLOR[r.grade], { stroke: CSS.ink, strokeThickness: 3 })).setOrigin(0.5, 0);
    card.add(title);
    this.tweens.add({ targets: title, scale: { from: 0.4, to: 1 }, duration: 450, ease: 'Back.easeOut' });

    // Étoiles ou étape non validée.
    if (r.validated) {
      const sg = this.add.graphics();
      for (let i = 0; i < 3; i++) drawStar(sg, (i - 1) * 64, -222, 26, i < r.stars ? C.yellow : 0xd8cbb5);
      card.add(sg);
    } else {
      card.add(this.add.text(0, -238, `Étape non validée : ${level.to} n'est pas atteinte`, textStyle(22, CSS.red)).setOrigin(0.5, 0));
    }

    card.add(this.add.text(0, -186, `« ${pickPhrase(r, sessionProgress.flights)} »`, textStyle(26, CSS.ink, { fontStyle: 'bold italic' })).setOrigin(0.5, 0));
    card.add(this.add.text(0, -146, narrative(r, level.from, level.to), textStyle(19, '#5a4a40', { wordWrap: { width: 980 }, align: 'center' })).setOrigin(0.5, 0));

    // Portrait du pilote dans son état réel (cosmétiques conservés).
    const pg = this.add.graphics();
    pg.fillStyle(0xe9d6b4, 1).fillRoundedRect(-520, -100, 240, 240, 20).lineStyle(4, C.ink, 1).strokeRoundedRect(-520, -100, 240, 240, 20);
    const expr = r.grade === 'PERFECT' || r.grade === 'GOOD' ? 'happy' : r.grade === 'ROUGH' ? 'calm' : 'dazed';
    drawPilot(pg, -385, 20, 66, expr, r.pilot);
    card.add(pg);
    card.add(this.add.text(-400, 148, `Pip : ${PILOT_LABEL[r.pilot]}`, textStyle(20)).setOrigin(0.5, 0));

    // Statistiques.
    const mins = Math.floor(r.duration / 60);
    const secs = Math.round(r.duration % 60).toString().padStart(2, '0');
    const rows: [string, string][] = [
      ['Distance parcourue', `${Math.round(r.distanceKm)} km`],
      ['Durée du vol', `${mins}:${secs}`],
      ['Altitude max', `${Math.round(r.maxAltitude * 10)} m`],
      ['Vitesse max', `${Math.round(r.maxSpeed * 4)} km/h`],
      ['Zone', r.zone ? `${'★'.repeat(r.zone.difficulty)} ${r.zone.name}` : 'Hors zone'],
      ['Avion', PLANE_LABEL[r.grade]],
      ['Anneaux', `${r.rings} / ${r.ringsTotal}`],
    ];
    rows.forEach(([k, v], i) => {
      card.add(this.add.text(-240, -100 + i * 34, k, textStyle(20, '#6b5a4e')));
      card.add(this.add.text(0, -100 + i * 34, v, textStyle(20)));
    });

    // Récompense.
    const rw = r.reward;
    const box = this.add.graphics();
    box.fillStyle(C.yellow, 1).fillRoundedRect(310, -100, 210, 190, 18).lineStyle(4, C.ink, 1).strokeRoundedRect(310, -100, 210, 190, 18);
    card.add(box);
    card.add(this.add.text(415, -88, 'BOULONS', textStyle(20)).setOrigin(0.5, 0));
    const total = this.add.text(415, -60, '+0', textStyle(52)).setOrigin(0.5, 0);
    card.add(total);
    const counter = { v: 0 };
    this.tweens.add({ targets: counter, v: rw.total, duration: 900, delay: 300, onUpdate: () => total.setText(`+${Math.round(counter.v)}`) });
    const detail = [`distance ${rw.distance}`, rw.landing ? `atterrissage ${rw.landing}` : '', rw.rings ? `anneaux ${rw.rings}` : '', rw.firstArrival ? `1re arrivée ${rw.firstArrival}` : '']
      .filter(Boolean)
      .join(' · ');
    card.add(this.add.text(415, 4, detail, textStyle(14, '#5a4a40', { wordWrap: { width: 190 }, align: 'center' })).setOrigin(0.5, 0));
    card.add(this.add.text(415, 100, `Total : ${sessionProgress.boulons}`, textStyle(16, '#5a4a40')).setOrigin(0.5, 0));

    card.add(this.add.text(0, 190, advice(r), textStyle(20, CSS.teal, { wordWrap: { width: 980 }, align: 'center' })).setOrigin(0.5, 0));

    // Bouton REVOLER (l'interstitiel Poki viendra ici, au clic, en Phase 3).
    const btn = this.add.text(-170, 252, 'REVOLER  ↻', textStyle(34, CSS.cream, { backgroundColor: '#d9573b', padding: { x: 36, y: 10 } })).setOrigin(0.5, 0).setInteractive({ useHandCursor: true });
    card.add(btn);
    this.tweens.add({ targets: btn, scale: { from: 1, to: 1.06 }, yoyo: true, repeat: -1, duration: 600 });
    const again = () => (this.scene.get('flight') as FlightScene).restart();
    const change = this.add
      .text(190, 258, 'CHANGER D\'AVION  ✈', textStyle(26, CSS.cream, { backgroundColor: '#3a9e9a', padding: { x: 22, y: 10 } }))
      .setOrigin(0.5, 0)
      .setInteractive({ useHandCursor: true });
    card.add(change);
    change.on('pointerdown', () => {
      this.scene.stop();
      this.scene.launch('select');
    });
    this.input.keyboard!.once('keydown-C', () => {
      this.scene.stop();
      this.scene.launch('select');
    });
    btn.on('pointerdown', again);
    const kb = this.input.keyboard!;
    kb.once('keydown-ENTER', again);
    kb.once('keydown-SPACE', again);
    kb.once('keydown-R', again);

    card.setScale(0.85);
    this.tweens.add({ targets: card, scale: Math.min(1, (H - 16) / 670), duration: 300, ease: 'Back.easeOut' });
  }
}

function drawStar(g: Phaser.GameObjects.Graphics, cx: number, cy: number, r: number, color: number): void {
  const pts: Phaser.Math.Vector2[] = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 === 0 ? r : r * 0.45;
    pts.push(new Phaser.Math.Vector2(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr));
  }
  g.fillStyle(color, 1).fillPoints(pts, true);
  g.lineStyle(4, C.ink, 1).strokePoints(pts, true);
}
