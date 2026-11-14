import Phaser from 'phaser';
import { CONTENT } from '../../sim/content';
import { C, CSS, textStyle } from '../style';
import { currentOrder, game, startFlight } from '../state';

/** Pictogrammes des contraintes d'un colis (lisibles sans lire). */
export const TAG_LABEL: Record<string, string> = {
  fragile: '🥚 FRAGILE : pose-toi tout doux',
  bouge: '🐔 ÇA BOUGE : l\'équilibre change en vol',
  lourd: '🏋️ LOURD : gros moteur et longue piste',
  encombrant: '🛶 ENCOMBRANT : ça freine',
  urgent: '⏱️ URGENT : vite !',
};

/**
 * Début de boucle (pivot D17) : lire la commande. Une icône, des pictos de contraintes,
 * une ligne drôle (facultative). Puis « Adapter l'avion » ou « Livrer » directement.
 */
export class OrderScene extends Phaser.Scene {
  constructor() {
    super('order');
  }

  create(): void {
    if (this.scene.isActive('hud')) this.scene.sleep('hud');
    this.scene.bringToTop();
    const W = this.scale.width;
    const H = this.scale.height;
    const order = currentOrder();
    const pkg = CONTENT.packages[order.packageId];
    const level = CONTENT.levels[order.levelId];
    const plane = CONTENT.aircraft[game.aircraftId];

    this.add.rectangle(0, 0, W, H, C.ink, 0.55).setOrigin(0);
    this.add.text(W / 2, 22, 'LivrÎle — Livré en 30 minutes ou presque', textStyle(22, CSS.cream, { fontStyle: 'bold italic' })).setOrigin(0.5, 0);

    const card = this.add.container(W / 2, 70);
    const g = this.add.graphics();
    g.fillStyle(C.cream, 1).fillRoundedRect(-500, 0, 1000, 560, 26).lineStyle(6, C.ink, 1).strokeRoundedRect(-500, 0, 1000, 560, 26);
    // Bandeau « bon de commande ».
    g.fillStyle(C.orange, 1).fillRoundedRect(-500, 0, 1000, 70, { tl: 26, tr: 26, bl: 0, br: 0 });
    card.add(g);
    card.add(this.add.text(-470, 14, `COMMANDE ${game.orderIndex + 1}/${CONTENT.orders.length} — ${order.title.toUpperCase()}`, textStyle(30, CSS.cream, { stroke: CSS.ink, strokeThickness: 5 })));

    // Le colis, en grand.
    card.add(this.add.text(-350, 210, pkg.icon, { fontSize: '120px' }).setOrigin(0.5));
    card.add(this.add.text(-350, 300, pkg.name, textStyle(22, CSS.ink, { wordWrap: { width: 260 }, align: 'center' })).setOrigin(0.5, 0));

    // Destination, client, message.
    card.add(this.add.text(-180, 100, `📍 ${level.to}`, textStyle(30)));
    card.add(this.add.text(-180, 146, `👤 ${order.client}`, textStyle(22, '#5a4a40')));
    card.add(this.add.text(-180, 190, `« ${order.message} »`, textStyle(22, CSS.ink, { fontStyle: 'bold italic', wordWrap: { width: 640 } })));

    // Contraintes (pictos d'abord : la commande se comprend sans lire).
    const tags = pkg.tags.length ? pkg.tags.map((t) => TAG_LABEL[t]) : ['✅ Aucune contrainte : c\'est le tutoriel !'];
    tags.forEach((t, i) => card.add(this.add.text(-180, 290 + i * 40, t, textStyle(24, pkg.tags.length ? CSS.red : CSS.green))));
    card.add(this.add.text(-180, 380, `💰 ${pkg.price} Boulons  (+${pkg.tip} de pourboire si PARFAIT)`, textStyle(20, '#5a4a40')));
    const best = game.bestRating[order.id];
    if (best) card.add(this.add.text(-180, 412, `Ta meilleure note : ${'★'.repeat(best)}${'☆'.repeat(5 - best)}`, textStyle(20, '#5a4a40')));

    // Boutons.
    const mk = (x: number, label: string, color: string, fn: () => void) => {
      const b = this.add.text(x, 470, label, textStyle(28, CSS.cream, { backgroundColor: color, padding: { x: 26, y: 12 } })).setOrigin(0.5, 0).setInteractive({ useHandCursor: true });
      b.on('pointerdown', fn);
      card.add(b);
      return b;
    };
    mk(-230, `✈ CHANGER D'AVION (${plane.name})`, '#3a9e9a', () => {
      this.scene.launch('select');
      this.scene.stop();
    });
    const go = mk(270, 'LIVRER ! ▶', '#d9573b', () => startFlight(this));
    this.tweens.add({ targets: go, scale: { from: 1, to: 1.06 }, yoyo: true, repeat: -1, duration: 600 });

    // Commandes débloquées : petites flèches pour rejouer une commande précédente.
    if (game.unlocked > 1) {
      const nav = (dx: number, label: string) => {
        const t = this.add.text(dx, 690, label, textStyle(22, CSS.cream)).setOrigin(0.5).setInteractive({ useHandCursor: true });
        t.on('pointerdown', () => {
          const next = Phaser.Math.Clamp(game.orderIndex + (dx < W / 2 ? -1 : 1), 0, Math.min(game.unlocked, CONTENT.orders.length) - 1);
          if (next !== game.orderIndex) {
            game.orderIndex = next;
            this.scene.restart();
          }
        });
      };
      nav(W / 2 - 300, '◀ commande précédente');
      nav(W / 2 + 300, 'commande suivante ▶');
    }

    const kb = this.input.keyboard!;
    kb.once('keydown-ENTER', () => startFlight(this));
    kb.once('keydown-SPACE', () => startFlight(this));
    kb.once('keydown-C', () => {
      this.scene.launch('select');
      this.scene.stop();
    });
    card.setScale(Math.min(1, (H - 80) / 580));
  }
}
