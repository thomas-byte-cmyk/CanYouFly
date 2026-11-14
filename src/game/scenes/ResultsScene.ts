import Phaser from 'phaser';
import { CONTENT, type Order } from '../../sim/content';
import type { FlightResult } from '../../sim/session';
import type { Level } from '../../sim/world';
import { drawPilot } from '../render/pilot';
import { C, CSS, textStyle } from '../style';
import { game, openOrder, startFlight } from '../state';
import { PILOT_LABEL } from '../texts';

const TITLE: Record<string, [string, string]> = {
  parfait: ['LIVRAISON PARFAITE !', '#3c9a3c'],
  intact: ['COLIS LIVRÉ', '#2f7fb8'],
  cabosse: ['LIVRÉ… CABOSSÉ', '#d98a1f'],
  miettes: ['LIVRÉ… EN MIETTES', '#d9573b'],
  plouf: ['PLOUF ! COLIS À LA MER', '#2f7fb8'],
  refuse: ['LIVRAISON REFUSÉE', '#d9573b'],
};

const CONDITION_LABEL: Record<string, string> = {
  intact: 'Intact',
  cabosse: 'Cabossé (payé −30 %)',
  miettes: 'En miettes (payé −70 %)',
};

const PIP_LINE: Record<string, string> = {
  parfait: '« Livré. Tu peux mettre 5 étoiles ? Sinon je dors dans l\'avion. »',
  intact: '« Livré dans les temps. Enfin, dans des temps. »',
  cabosse: '« Il était déjà comme ça. Sûrement. »',
  miettes: '« Techniquement, tout est là. En plusieurs morceaux. »',
  plouf: '« Le colis est imperméable. Moi, non. »',
  refuse: '« C\'est pas la bonne île ? Elles se ressemblent toutes, aussi. »',
};

/** Écran « Note client » (pivot D17) : étoiles, avis, état du colis, paiement. */
export class ResultsScene extends Phaser.Scene {
  constructor() {
    super('results');
  }

  create(data: { result: FlightResult; level: Level; order: Order }): void {
    const { result: r, order } = data;
    const d = r.delivery!;
    const pkg = CONTENT.packages[order.packageId];
    const W = this.scale.width;
    const H = this.scale.height;
    this.add.rectangle(0, 0, W, H, C.ink, 0.45).setOrigin(0);

    const card = this.add.container(W / 2, H / 2);
    const g = this.add.graphics();
    g.fillStyle(C.cream, 1).fillRoundedRect(-560, -335, 1120, 670, 28).lineStyle(6, C.ink, 1).strokeRoundedRect(-560, -335, 1120, 670, 28);
    card.add(g);

    const [titleText, titleColor] = TITLE[d.outcome];
    const title = this.add.text(0, -318, titleText, textStyle(50, titleColor, { stroke: CSS.ink, strokeThickness: 3 })).setOrigin(0.5, 0);
    card.add(title);
    this.tweens.add({ targets: title, scale: { from: 0.4, to: 1 }, duration: 450, ease: 'Back.easeOut' });

    // Note client sur 5 étoiles, qui apparaissent une à une.
    const sg = this.add.graphics();
    card.add(sg);
    for (let i = 0; i < 5; i++) {
      const filled = i < d.rating;
      this.time.delayedCall(250 + i * 140, () => drawStar(sg, (i - 2) * 58, -228, 24, filled ? C.yellow : 0xd8cbb5));
    }

    // Avis du client.
    card.add(this.add.text(0, -186, `« ${d.review} »`, textStyle(26, CSS.ink, { fontStyle: 'bold italic', wordWrap: { width: 1000 }, align: 'center' })).setOrigin(0.5, 0));
    card.add(this.add.text(0, -140, `— ${order.client}, ${data.level.to}`, textStyle(19, '#6b5a4e')).setOrigin(0.5, 0));

    // Pip dans son état réel, avec sa phrase.
    const pg = this.add.graphics();
    pg.fillStyle(0xe9d6b4, 1).fillRoundedRect(-520, -95, 230, 230, 20).lineStyle(4, C.ink, 1).strokeRoundedRect(-520, -95, 230, 230, 20);
    const expr = r.grade === 'PERFECT' || r.grade === 'GOOD' ? 'happy' : r.grade === 'ROUGH' ? 'calm' : 'dazed';
    drawPilot(pg, -400, 20, 64, expr, r.pilot);
    card.add(pg);
    card.add(this.add.text(-405, 142, `Pip : ${PILOT_LABEL[r.pilot]}`, textStyle(18)).setOrigin(0.5, 0));

    // Détails de la livraison.
    const rows: [string, string][] = [
      ['Colis', `${pkg.icon} ${pkg.name}`],
      ['État', d.status === 'livre' ? CONDITION_LABEL[d.condition!] : d.status === 'perdu' ? 'Au fond de l\'eau' : 'Pas livré (hors zone)'],
      ['Zone', r.zone ? `${'★'.repeat(r.zone.difficulty)} ${r.zone.name}` : 'Hors zone'],
      ['Atterrissage', { PERFECT: 'PARFAIT', GOOD: 'BON', ROUGH: 'BRUTAL', CRASH: 'CRASH', WATER: 'PLOUF' }[r.grade]],
      ['Durée', `${Math.floor(r.duration / 60)}:${Math.round(r.duration % 60).toString().padStart(2, '0')}`],
    ];
    rows.forEach(([k, v], i) => {
      card.add(this.add.text(-260, -95 + i * 36, k, textStyle(20, '#6b5a4e')));
      card.add(this.add.text(-110, -95 + i * 36, v, textStyle(20)));
    });

    // Paiement.
    const box = this.add.graphics();
    box.fillStyle(C.yellow, 1).fillRoundedRect(300, -100, 220, 200, 18).lineStyle(4, C.ink, 1).strokeRoundedRect(300, -100, 220, 200, 18);
    card.add(box);
    card.add(this.add.text(410, -88, 'BOULONS', textStyle(20)).setOrigin(0.5, 0));
    const total = this.add.text(410, -60, '+0', textStyle(52)).setOrigin(0.5, 0);
    card.add(total);
    const counter = { v: 0 };
    this.tweens.add({ targets: counter, v: d.total, duration: 900, delay: 700, onUpdate: () => total.setText(`+${Math.round(counter.v)}`) });
    const detail = [
      d.pay ? `livraison ${d.pay}` : '',
      d.tip ? `pourboire ${d.tip}` : '',
      d.consolation ? `consolation ${d.consolation}` : '',
      d.bonus ? `anneaux/boulons ${d.bonus}` : '',
    ]
      .filter(Boolean)
      .join(' · ');
    card.add(this.add.text(410, 6, detail, textStyle(14, '#5a4a40', { wordWrap: { width: 200 }, align: 'center' })).setOrigin(0.5, 0));
    card.add(this.add.text(410, 108, `Total : ${game.boulons}`, textStyle(16, '#5a4a40')).setOrigin(0.5, 0));

    card.add(this.add.text(0, 172, PIP_LINE[d.outcome], textStyle(20, CSS.teal, { wordWrap: { width: 980 }, align: 'center' })).setOrigin(0.5, 0));

    // Boutons : réessayer, commande suivante (si livré), changer d'avion.
    const hasNext = d.status === 'livre' && game.orderIndex + 1 < CONTENT.orders.length;
    const buttons: [string, string, () => void][] = [
      ['↻ RÉESSAYER', '#3a9e9a', () => startFlight(this)],
      ['✈ CHANGER D\'AVION', '#3a9e9a', () => this.toSelect()],
    ];
    if (hasNext) {
      buttons.push([
        'COMMANDE SUIVANTE ▶',
        '#d9573b',
        () => {
          game.orderIndex += 1;
          openOrder(this);
        },
      ]);
    } else if (d.status === 'livre') {
      buttons.push(['🏁 FIN DE LA v0.6', '#d9573b', () => openOrder(this)]);
    }
    const spacing = 360;
    buttons.forEach(([label, color, fn], i) => {
      const x = (i - (buttons.length - 1) / 2) * spacing;
      const b = this.add.text(x, 238, label, textStyle(26, CSS.cream, { backgroundColor: color, padding: { x: 20, y: 10 } })).setOrigin(0.5, 0).setInteractive({ useHandCursor: true });
      b.on('pointerdown', fn);
      card.add(b);
      if (i === buttons.length - 1) this.tweens.add({ targets: b, scale: { from: 1, to: 1.06 }, yoyo: true, repeat: -1, duration: 600 });
    });

    const kb = this.input.keyboard!;
    kb.once('keydown-R', () => startFlight(this));
    kb.once('keydown-C', () => this.toSelect());
    kb.once('keydown-ENTER', () => {
      if (hasNext) {
        game.orderIndex += 1;
        openOrder(this);
      } else startFlight(this);
    });

    card.setScale(0.85);
    this.tweens.add({ targets: card, scale: Math.min(1, (H - 16) / 670), duration: 300, ease: 'Back.easeOut' });
  }

  private toSelect(): void {
    this.scene.launch('select');
    this.scene.stop();
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
