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

    // Archipel lointain (pivot D17) : îles en silhouette sur l'horizon marin.
    this.makeTexture('far-hills', 1024, 220, (g) => {
      g.fillStyle(0x8fc7c2, 1);
      for (const [x, w, h] of [[60, 180, 40], [380, 120, 26], [640, 220, 55], [930, 90, 20]] as const) {
        g.fillEllipse(x + w / 2, 160, w, h * 2);
      }
      g.fillStyle(0x6fb3b8, 1).fillRect(0, 158, 1024, 62);
    });
    this.makeTexture('hills', 1024, 220, (g) => {
      g.fillStyle(0x4aa3c4, 1).fillRect(0, 150, 1024, 70);
      g.lineStyle(3, 0xffffff, 0.5);
      for (let x = 20; x < 1024; x += 90) g.lineBetween(x, 170 + (x % 3) * 12, x + 30, 170 + (x % 3) * 12);
      g.fillStyle(0xe8c886, 1).fillEllipse(520, 152, 200, 26);
      g.lineStyle(5, 0x8a5a32, 1).lineBetween(520, 146, 528, 100);
      g.fillStyle(0x3f9a4a, 1);
      for (const a of [-2.6, -1.8, -1.0, -0.3]) g.fillTriangle(528, 100, 528 + Math.cos(a) * 34, 100 + Math.sin(a) * 18 + 14, 528 + Math.cos(a + 0.4) * 16, 100 + Math.sin(a + 0.4) * 10 + 8);
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
    this.scene.launch('order');
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
