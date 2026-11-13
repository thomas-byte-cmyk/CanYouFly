import Phaser from 'phaser';
import type { LandingZone, Level, Mover, Obstacle } from '../../sim/world';
import { C, CSS, PX, textStyle } from '../style';

const DEPTH = 60 * PX;
const STAR_COLOR = { 1: 0x4f9e3f, 2: 0xf2c94c, 3: 0xd9573b } as const;

/** Dessine le décor statique de l'étape dans les coordonnées monde (y vers le bas, sol en y = 0). */
export function drawWorld(
  scene: Phaser.Scene,
  level: Level,
): { rings: Phaser.GameObjects.Graphics[]; updrafts: Phaser.GameObjects.Graphics[]; bolts: Phaser.GameObjects.Graphics[] } {
  const g = scene.add.graphics();

  // Sol et surfaces.
  for (const seg of level.ground) {
    const x0 = seg.x0 * PX;
    const w = (seg.x1 - seg.x0) * PX;
    switch (seg.surface) {
      case 'runway':
        g.fillStyle(C.soil, 1).fillRect(x0, 0, w, DEPTH);
        g.fillStyle(C.asphalt, 1).fillRect(x0, -2, w, 10);
        g.fillStyle(C.white, 1);
        for (let x = x0 + 10; x < x0 + w - 30; x += 60) g.fillRect(x, 1, 30, 3);
        g.fillStyle(C.grassDark, 1).fillRect(x0, 8, w, 6);
        break;
      case 'grass':
      case 'park':
        g.fillStyle(C.soil, 1).fillRect(x0, 0, w, DEPTH);
        g.fillStyle(seg.surface === 'park' ? 0x7dc46a : C.grass, 1).fillRect(x0, -2, w, 16);
        if (seg.surface === 'park') {
          g.fillStyle(0xe8d9b5, 1).fillRect(x0, 4, w, 4);
        }
        break;
      case 'field':
        g.fillStyle(C.soil, 1).fillRect(x0, 0, w, DEPTH);
        for (let x = x0; x < x0 + w; x += 24) {
          g.fillStyle(((x - x0) / 24) % 2 === 0 ? C.wheat : C.wheatDark, 1).fillRect(x, -3, Math.min(24, x0 + w - x), 14);
        }
        break;
      case 'vineyard':
        g.fillStyle(C.soilDark, 1).fillRect(x0, 0, w, DEPTH);
        g.fillStyle(0x9c7a4f, 1).fillRect(x0, -1, w, 12);
        g.fillStyle(0x5f9a3a, 1);
        for (let x = x0 + 6; x < x0 + w - 6; x += 22) g.fillRoundedRect(x, -14, 14, 14, 5);
        break;
      case 'water':
        g.fillStyle(C.soilDark, 1).fillRect(x0, 20, w, DEPTH);
        g.fillStyle(C.blue, 1).fillRect(x0, 4, w, 40);
        g.fillStyle(C.deepBlue, 1).fillRect(x0, 22, w, 22);
        g.lineStyle(2, C.white, 0.7);
        for (let x = x0 + 8; x < x0 + w - 20; x += 36) g.lineBetween(x, 9, x + 16, 9);
        break;
      case 'forest':
        g.fillStyle(C.soilDark, 1).fillRect(x0, 0, w, DEPTH);
        g.fillStyle(C.forestDark, 1).fillRect(x0, -4, w, 16);
        break;
      case 'city':
        g.fillStyle(C.stone, 1).fillRect(x0, 0, w, DEPTH);
        g.fillStyle(C.stoneLight, 1).fillRect(x0, -2, w, 8);
        break;
    }
  }
  // Ligne d'horizon du sol.
  g.lineStyle(3, C.ink, 0.6).lineBetween(level.worldStart * PX, 0, level.worldEnd * PX, 0);

  // Repères.
  for (const lm of level.landmarks) {
    const x = lm.x * PX;
    if (lm.type === 'eiffel') drawEiffel(g, x);
    if (lm.type === 'windsock') drawWindsock(g, x);
    if (lm.type === 'sign' && lm.label) {
      g.fillStyle(0x6e4630, 1).fillRect(x - 2, -60, 5, 60);
      g.fillStyle(C.cream, 1).lineStyle(3, C.ink, 1).fillRoundedRect(x - 70, -100, 140, 40, 6).strokeRoundedRect(x - 70, -100, 140, 40, 6);
      scene.add.text(x, -80, lm.label, textStyle(18)).setOrigin(0.5);
    }
  }

  // Obstacles.
  for (const o of level.obstacles) drawObstacle(g, o);

  // Zones balisées (drapeaux + nom + difficulté).
  for (const z of level.zones) drawZone(scene, g, z);

  // Panneau de la destination.
  const dx = level.destinationX * PX;
  scene.add.text(dx, -520, level.to.toUpperCase(), textStyle(64, CSS.cream, { stroke: CSS.ink, strokeThickness: 10 })).setOrigin(0.5).setAlpha(0.85);

  // Ascendances (visibles avant d'y entrer : règle d'équité).
  const updrafts = level.updrafts.map((u) => {
    const ug = scene.add.graphics();
    const x0 = u.x0 * PX;
    const w = (u.x1 - u.x0) * PX;
    ug.fillStyle(C.white, 0.13).fillRect(x0, -u.top * PX, w, u.top * PX);
    ug.lineStyle(4, C.white, 0.55);
    for (let y = 40; y < u.top * PX; y += 90) {
      for (let x = x0 + 30; x < x0 + w - 20; x += 70) {
        ug.lineBetween(x, -y, x, -y - 30);
        ug.lineBetween(x, -y - 30, x - 10, -y - 18);
        ug.lineBetween(x, -y - 30, x + 10, -y - 18);
      }
    }
    scene.add.text(x0 + w / 2, -u.top * PX - 24, 'Ascendance ↑', textStyle(20, CSS.white, { stroke: CSS.ink, strokeThickness: 5 })).setOrigin(0.5);
    return ug;
  });

  // Zones de vent (annoncées par des traînées et une étiquette).
  for (const w of level.wind) {
    const wg = scene.add.graphics();
    const x0 = w.x0 * PX;
    const x1 = w.x1 * PX;
    wg.lineStyle(3, C.white, 0.6);
    for (let y = 60; y < 1600; y += 110) {
      for (let x = x0 + ((y / 110) % 2) * 60; x < x1 - 60; x += 160) {
        if (w.gust) {
          wg.beginPath();
          for (let k = 0; k <= 8; k++) wg.lineTo(x + k * 8, -y + Math.sin(k) * 8);
          wg.strokePath();
        } else {
          wg.lineBetween(x, -y, x + 60, -y);
          wg.lineBetween(x + 60, -y, x + 48, -y - 8);
          wg.lineBetween(x + 60, -y, x + 48, -y + 8);
        }
      }
    }
    scene.tweens.add({ targets: wg, alpha: { from: 0.5, to: 1 }, yoyo: true, repeat: -1, duration: 700 });
    if (w.label) scene.add.text((x0 + x1) / 2, -260, w.label, textStyle(22, CSS.white, { stroke: CSS.ink, strokeThickness: 6 })).setOrigin(0.5);
  }

  // Anneaux (orange ; vert = boost).
  const rings = level.rings.map((r) => {
    const rg = scene.add.graphics();
    const color = r.kind === 'boost' ? C.green : C.orange;
    rg.lineStyle(9, C.ink, 1).strokeEllipse(r.x * PX, -r.y * PX, r.r * PX * 0.7, r.r * PX * 2);
    rg.lineStyle(6, color, 1).strokeEllipse(r.x * PX, -r.y * PX, r.r * PX * 0.7, r.r * PX * 2);
    if (r.kind === 'boost') {
      rg.fillStyle(C.green, 1);
      rg.fillTriangle(r.x * PX - 10, -r.y * PX - 12, r.x * PX + 14, -r.y * PX, r.x * PX - 10, -r.y * PX + 12);
    }
    return rg;
  });

  // Boulons à ramasser.
  const bolts = level.bolts.map((b) => {
    const bg = scene.add.graphics({ x: b.x * PX, y: -b.y * PX });
    const pts: Phaser.Math.Vector2[] = [];
    for (let i = 0; i < 6; i++) pts.push(new Phaser.Math.Vector2(Math.cos((i * Math.PI) / 3) * 11, Math.sin((i * Math.PI) / 3) * 11));
    bg.fillStyle(C.yellow, 1).fillPoints(pts, true).lineStyle(3, C.ink, 1).strokePoints(pts, true);
    bg.fillStyle(0x8a7a5a, 1).fillCircle(0, 0, 4);
    scene.tweens.add({ targets: bg, scaleX: { from: 1, to: 0.3 }, yoyo: true, repeat: -1, duration: 600 });
    return bg;
  });

  return { rings, updrafts, bolts };
}

function drawObstacle(g: Phaser.GameObjects.Graphics, o: Obstacle): void {
  const x = o.x * PX;
  const w = o.w * PX;
  const h = o.h * PX;
  g.lineStyle(3, C.ink, 1);
  switch (o.type) {
    case 'tree': {
      const tw = Math.max(6, w * 0.22);
      g.fillStyle(0x7a5232, 1).fillRect(x + w / 2 - tw / 2, -h * 0.45, tw, h * 0.45).strokeRect(x + w / 2 - tw / 2, -h * 0.45, tw, h * 0.45);
      g.fillStyle(0x3f8f4a, 1).fillEllipse(x + w / 2, -h * 0.65, w * 1.1, h * 0.75).strokeEllipse(x + w / 2, -h * 0.65, w * 1.1, h * 0.75);
      g.fillStyle(0x5aab5c, 1).fillEllipse(x + w / 2 - w * 0.15, -h * 0.75, w * 0.45, h * 0.3);
      break;
    }
    case 'barn': {
      g.fillStyle(C.red, 1).fillRect(x, -h * 0.7, w, h * 0.7).strokeRect(x, -h * 0.7, w, h * 0.7);
      g.fillStyle(0x8a3b2a, 1).fillTriangle(x - 6, -h * 0.7, x + w / 2, -h, x + w + 6, -h * 0.7).strokeTriangle(x - 6, -h * 0.7, x + w / 2, -h, x + w + 6, -h * 0.7);
      g.fillStyle(C.cream, 1).fillRect(x + w * 0.35, -h * 0.45, w * 0.3, h * 0.45);
      break;
    }
    case 'fence':
      g.fillStyle(0xa0774d, 1);
      g.fillRect(x, -h, w, h).strokeRect(x, -h, w, h);
      break;
    case 'lamppost':
      g.fillStyle(0x4b4b55, 1).fillRect(x, -h, w, h);
      g.fillStyle(C.yellow, 1).fillCircle(x + w / 2, -h, 7).strokeCircle(x + w / 2, -h, 7);
      break;
    case 'building': {
      const shade = [0xe7c9a0, 0xd9b48a, 0xf0dcc0][Math.floor(o.x) % 3];
      g.fillStyle(shade, 1).fillRect(x, -h, w, h).strokeRect(x, -h, w, h);
      g.fillStyle(0x6c88a6, 1);
      for (let yy = -h + 14; yy < -14; yy += 26) for (let xx = x + 10; xx < x + w - 16; xx += 24) g.fillRect(xx, yy, 10, 14);
      g.fillStyle(0x9b4a3a, 1).fillRect(x - 4, -h - 8, w + 8, 10).strokeRect(x - 4, -h - 8, w + 8, 10);
      break;
    }
    case 'cathedral': {
      g.fillStyle(0xd6c7a8, 1).fillRect(x, -h * 0.75, w, h * 0.75).strokeRect(x, -h * 0.75, w, h * 0.75);
      g.fillRect(x, -h, w * 0.28, h).strokeRect(x, -h, w * 0.28, h);
      g.fillRect(x + w * 0.72, -h, w * 0.28, h).strokeRect(x + w * 0.72, -h, w * 0.28, h);
      g.fillStyle(0x6c88a6, 1).fillCircle(x + w / 2, -h * 0.55, w * 0.14).strokeCircle(x + w / 2, -h * 0.55, w * 0.14);
      g.fillStyle(0x7a6a55, 1).fillTriangle(x + w * 0.4, -h * 0.25, x + w / 2, -h * 0.4, x + w * 0.6, -h * 0.25);
      break;
    }
  }
}

function drawZone(scene: Phaser.Scene, g: Phaser.GameObjects.Graphics, z: LandingZone): void {
  const x0 = z.x0 * PX;
  const x1 = z.x1 * PX;
  const color = STAR_COLOR[z.difficulty];
  // Balisage au sol.
  g.fillStyle(color, 0.9);
  for (let x = x0; x < x1; x += 28) g.fillRect(x, -6, 14, 4);
  // Drapeaux aux deux extrémités.
  for (const fx of [x0, x1]) {
    g.lineStyle(3, C.ink, 1).lineBetween(fx, 0, fx, -70);
    g.fillStyle(color, 1).fillTriangle(fx, -70, fx + (fx === x0 ? 30 : -30), -60, fx, -50);
    g.strokeTriangle(fx, -70, fx + (fx === x0 ? 30 : -30), -60, fx, -50);
  }
  const stars = '★'.repeat(z.difficulty);
  const label = z.arrival ? `${stars} ${z.name}` : `${stars} ${z.name} (hors Reims)`;
  scene.add
    .text((x0 + x1) / 2, -110, label, textStyle(20, CSS.ink, { backgroundColor: '#fdf3e1', padding: { x: 8, y: 4 } }))
    .setOrigin(0.5);
}

function drawEiffel(g: Phaser.GameObjects.Graphics, x: number): void {
  g.lineStyle(4, 0x6e5a4a, 1);
  const h = 300;
  g.lineBetween(x - 60, 0, x - 6, -h);
  g.lineBetween(x + 60, 0, x + 6, -h);
  g.lineBetween(x - 40, -80, x + 40, -80);
  g.lineBetween(x - 22, -170, x + 22, -170);
  g.lineBetween(x - 10, -240, x + 10, -240);
  g.lineStyle(3, 0x6e5a4a, 1);
  for (let y = 0; y > -h + 20; y -= 30) {
    const k = 60 - (-y / h) * 54;
    g.lineBetween(x - k, y, x + k * 0.6, y - 30);
  }
  g.lineBetween(x, -h, x, -h - 30);
}

function drawWindsock(g: Phaser.GameObjects.Graphics, x: number): void {
  g.lineStyle(3, C.ink, 1).lineBetween(x, 0, x, -60);
  g.fillStyle(C.orange, 1).fillTriangle(x, -60, x + 34, -54, x, -46);
  g.fillStyle(C.white, 1).fillTriangle(x + 10, -58.5, x + 20, -56.5, x + 10, -47.8);
  g.lineStyle(2, C.ink, 1).strokeTriangle(x, -60, x + 34, -54, x, -46);
}

/** Obstacle vivant (positionné à chaque image par la scène de vol). */
export function drawMover(scene: Phaser.Scene, m: Mover): Phaser.GameObjects.Container {
  const g = scene.add.graphics();
  if (m.type === 'balloon') {
    const r = m.r * PX * 0.9;
    g.lineStyle(3, C.ink, 1);
    g.lineBetween(-r * 0.5, r * 0.8, -r * 0.25, r * 1.5);
    g.lineBetween(r * 0.5, r * 0.8, r * 0.25, r * 1.5);
    g.fillStyle(C.red, 1).fillCircle(0, 0, r).strokeCircle(0, 0, r);
    g.fillStyle(C.yellow, 1).fillEllipse(0, 0, r * 0.9, r * 2).strokeEllipse(0, 0, r * 0.9, r * 2);
    g.fillStyle(0x8a5a3c, 1).fillRect(-r * 0.3, r * 1.5, r * 0.6, r * 0.45).strokeRect(-r * 0.3, r * 1.5, r * 0.6, r * 0.45);
  } else {
    g.lineStyle(4, C.ink, 1);
    const offs: [number, number][] = [[0, 0], [22, -14], [20, 16], [42, 2]];
    for (const [x, y] of offs) {
      g.beginPath();
      g.moveTo(x - 10, y - 6);
      g.lineTo(x, y);
      g.lineTo(x + 10, y - 6);
      g.strokePath();
    }
  }
  return scene.add.container(0, 0, [g]);
}
