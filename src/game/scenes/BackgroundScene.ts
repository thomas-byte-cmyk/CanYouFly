import Phaser from 'phaser';
import { C } from '../style';

/** Ciel en dégradé et décor lointain en parallaxe, dessinés sous la scène de vol. */
export class BackgroundScene extends Phaser.Scene {
  private hills!: Phaser.GameObjects.TileSprite;
  private farHills!: Phaser.GameObjects.TileSprite;
  private clouds!: Phaser.GameObjects.TileSprite;

  constructor() {
    super('background');
  }

  create(): void {
    const w = this.scale.width;
    const h = this.scale.height;

    const sky = this.add.graphics();
    sky.fillGradientStyle(C.skyTop, C.skyTop, 0xcfe9f2, 0xcfe9f2, 1);
    sky.fillRect(0, 0, w, h);
    this.add.circle(w * 0.82, h * 0.2, 46, 0xfff1b8).setStrokeStyle(4, 0xf2c94c);

    this.makeTexture('far-hills', 1024, 220, (g) => {
      g.fillStyle(0x9fc9b8, 1);
      g.beginPath();
      g.moveTo(0, 220);
      for (let x = 0; x <= 1024; x += 32) g.lineTo(x, 120 + Math.sin(x / 90) * 30 + Math.sin(x / 37) * 10);
      g.lineTo(1024, 220);
      g.closePath();
      g.fillPath();
    });
    this.makeTexture('hills', 1024, 220, (g) => {
      g.fillStyle(0x86b86a, 1);
      g.beginPath();
      g.moveTo(0, 220);
      for (let x = 0; x <= 1024; x += 32) g.lineTo(x, 140 + Math.sin(x / 120 + 1) * 34 + Math.cos(x / 51) * 8);
      g.lineTo(1024, 220);
      g.closePath();
      g.fillPath();
      g.fillStyle(0x6aa13c, 1);
      for (let x = 40; x < 1024; x += 150) g.fillCircle(x, 150 + Math.sin(x / 120 + 1) * 34, 14);
    });
    this.makeTexture('clouds', 1024, 200, (g) => {
      g.fillStyle(0xffffff, 0.95);
      const puffs: [number, number][] = [[120, 70], [460, 120], [780, 50]];
      for (const [x, y] of puffs) {
        g.fillCircle(x, y, 30);
        g.fillCircle(x + 34, y - 12, 36);
        g.fillCircle(x + 72, y, 28);
        g.fillRoundedRect(x - 20, y, 120, 26, 13);
      }
    });

    this.clouds = this.add.tileSprite(0, 40, w, 200, 'clouds').setOrigin(0, 0);
    this.farHills = this.add.tileSprite(0, h - 300, w, 220, 'far-hills').setOrigin(0, 0);
    this.hills = this.add.tileSprite(0, h - 250, w, 220, 'hills').setOrigin(0, 0);

    // Le ciel est dessous ; la scène de vol démarre par-dessus.
    this.scene.launch('flight');
  }

  private makeTexture(key: string, w: number, h: number, draw: (g: Phaser.GameObjects.Graphics) => void): void {
    if (this.textures.exists(key)) return;
    const g = this.make.graphics({}, false);
    draw(g);
    g.generateTexture(key, w, h);
    g.destroy();
  }

  /** Appelé par la scène de vol avec la position de sa caméra. */
  follow(scrollX: number, scrollY: number): void {
    const h = this.scale.height;
    this.clouds.tilePositionX = scrollX * 0.08;
    this.farHills.tilePositionX = scrollX * 0.12;
    this.hills.tilePositionX = scrollX * 0.25;
    // Quand l'avion monte, le décor lointain descend un peu.
    const lift = Phaser.Math.Clamp(-scrollY * 0.08, 0, 160);
    this.farHills.y = h - 300 + lift;
    this.hills.y = h - 250 + lift * 1.4;
  }
}
