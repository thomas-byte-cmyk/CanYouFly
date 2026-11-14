import Phaser from 'phaser';
import { CONTENT } from '../../sim/content';
import { computeHandling } from '../../sim/handling';
import { PlaneView } from '../render/plane';
import { C, CSS, textStyle } from '../style';
import { withCargo } from '../../sim/cargo';
import { currentOrder, game, openOrder, startFlight } from '../state';

const STAT_LABELS: [keyof ReturnType<typeof computeHandling>['stats'], string][] = [
  ['vitesse', 'Vitesse'],
  ['montee', 'Montée'],
  ['plane', 'Plané'],
  ['autonomie', 'Autonomie'],
  ['stabilite', 'Stabilité'],
  ['solidite', 'Solidité'],
];

/**
 * Choix de l'avion (avant-goût du hangar, Phase 2b) : les barres sont calculées
 * à partir des pièces de chaque avion, et changent vraiment la façon de piloter.
 */
export class SelectScene extends Phaser.Scene {
  constructor() {
    super('select');
  }

  create(): void {
    // L'écran de choix passe devant tout ; l'interface de vol est mise en veille.
    if (this.scene.isActive('hud')) this.scene.sleep('hud');
    this.scene.bringToTop();
    const W = this.scale.width;
    const H = this.scale.height;
    this.add.rectangle(0, 0, W, H, C.ink, 0.6).setOrigin(0);
    const pkg = CONTENT.packages[currentOrder().packageId];
    this.add.text(W / 2, 24, 'ADAPTE TON AVION AU COLIS', textStyle(42, CSS.cream, { stroke: CSS.ink, strokeThickness: 8 })).setOrigin(0.5, 0);
    this.add.text(W / 2, 80, `Chargé : ${pkg.icon} ${pkg.name}${pkg.tags.length ? ` (${pkg.tags.join(', ')})` : ''} — les barres tiennent compte du colis.`, textStyle(20, CSS.cream)).setOrigin(0.5, 0);
    const back = this.add.text(30, 26, '◀ Commande', textStyle(22, CSS.cream, { backgroundColor: '#3a9e9a', padding: { x: 12, y: 6 } })).setInteractive({ useHandCursor: true });
    back.on('pointerdown', () => openOrder(this));

    const ids = ['albatros', 'coucou', 'fusee'];
    const difficulty: Record<string, string> = { albatros: 'Facile', coucou: 'Moyen', fusee: 'Difficile' };
    ids.forEach((id, i) => {
      const def = CONTENT.aircraft[id];
      // Les barres sont calculées AVEC le colis à bord : un même avion change selon la commande.
      const h = computeHandling(withCargo(def, pkg), CONTENT.tuning);
      const cx = W / 2 + (i - 1) * 410;
      const top = 130;
      const card = this.add.container(cx, top);
      const g = this.add.graphics();
      const selected = game.aircraftId === id;
      g.fillStyle(C.cream, 1).fillRoundedRect(-190, 0, 380, 560, 22);
      g.lineStyle(selected ? 8 : 4, selected ? C.orange : C.ink, 1).strokeRoundedRect(-190, 0, 380, 560, 22);
      card.add(g);
      card.add(this.add.text(0, 16, def.name, textStyle(30)).setOrigin(0.5, 0));
      const diffColor = id === 'albatros' ? CSS.green : id === 'coucou' ? CSS.blue : CSS.red;
      card.add(this.add.text(0, 54, difficulty[id], textStyle(18, diffColor)).setOrigin(0.5, 0));

      const preview = new PlaneView(this, def);
      preview.update({ ...previewState }, 0, false, 0, 0);
      preview.root.setPosition(cx + 6, top + 150).setScale(1.5);

      card.add(this.add.text(0, 205, def.description ?? '', textStyle(16, '#5a4a40', { wordWrap: { width: 330 }, align: 'center' })).setOrigin(0.5, 0));
      STAT_LABELS.forEach(([key, label], j) => {
        const y = 290 + j * 32;
        card.add(this.add.text(-160, y, label, textStyle(17, '#5a4a40')));
        const v = h.stats[key];
        const bg = this.add.graphics();
        for (let k = 0; k < 5; k++) {
          const fillK = Math.max(0, Math.min(1, v - k));
          bg.fillStyle(0xd8cbb5, 1).fillRoundedRect(-30 + k * 36, y + 2, 30, 18, 5);
          if (fillK > 0) bg.fillStyle(C.teal, 1).fillRoundedRect(-30 + k * 36, y + 2, 30 * fillK, 18, 5);
        }
        card.add(bg);
      });
      const btn = this.add
        .text(0, 498, selected ? 'LIVRER  ✈' : 'CHOISIR', textStyle(26, CSS.cream, { backgroundColor: selected ? '#d9573b' : '#3a9e9a', padding: { x: 28, y: 8 } }))
        .setOrigin(0.5, 0)
        .setInteractive({ useHandCursor: true });
      card.add(btn);
      const pick = () => this.choose(id);
      btn.on('pointerdown', pick);
      g.setInteractive(new Phaser.Geom.Rectangle(-190, 0, 380, 560), Phaser.Geom.Rectangle.Contains).on('pointerdown', pick);
    });

    const kb = this.input.keyboard!;
    kb.once('keydown-ONE', () => this.choose('albatros'));
    kb.once('keydown-TWO', () => this.choose('coucou'));
    kb.once('keydown-THREE', () => this.choose('fusee'));
    kb.once('keydown-ENTER', () => this.choose(game.aircraftId));
  }

  private choose(id: string): void {
    game.aircraftId = id;
    startFlight(this);
  }
}

const previewState = {
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  theta: 0.05,
  omega: 0,
  fuel: 1,
  onGround: true,
  time: 0,
  alphaWing: 0,
  airspeed: 0,
  stalled: false,
  lift: 0,
  drag: 0,
  thrust: 0,
};
