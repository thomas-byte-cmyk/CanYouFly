import Phaser from 'phaser';
import { C, CSS, textStyle } from '../style';
import type { FlightScene } from './FlightScene';

export class PauseScene extends Phaser.Scene {
  constructor() {
    super('pause');
  }

  create(): void {
    const W = this.scale.width;
    const H = this.scale.height;
    this.add.rectangle(0, 0, W, H, C.ink, 0.55).setOrigin(0);
    this.add.text(W / 2, H / 2 - 150, 'PAUSE', textStyle(64, CSS.cream, { stroke: CSS.ink, strokeThickness: 8 })).setOrigin(0.5);

    const resume = () => {
      this.scene.resume('flight');
      this.scene.resume('hud');
      this.scene.stop();
    };
    const restart = () => (this.scene.get('flight') as FlightScene).restart();

    const mk = (y: number, label: string, color: string, fn: () => void) => {
      const b = this.add.text(W / 2, y, label, textStyle(32, CSS.cream, { backgroundColor: color, padding: { x: 30, y: 10 } })).setOrigin(0.5).setInteractive({ useHandCursor: true });
      b.on('pointerdown', fn);
    };
    mk(H / 2 - 30, 'REPRENDRE', '#3a9e9a', resume);
    mk(H / 2 + 60, 'RECOMMENCER', '#d9573b', restart);

    this.add
      .text(
        W / 2,
        H / 2 + 170,
        'Clavier : ↑↓ (ou W/S) cabrer / piquer · ←→ (ou A/D) gaz · T gaz auto · Maj couper le moteur · R recommencer · G infos techniques\nTactile : pouce droit = manche (glisser haut/bas) · pouce gauche = curseur des gaz',
        textStyle(17, CSS.cream, { align: 'center', wordWrap: { width: 1100 } }),
      )
      .setOrigin(0.5, 0);

    const kb = this.input.keyboard!;
    kb.once('keydown-ESC', resume);
    kb.once('keydown-P', resume);
  }
}
