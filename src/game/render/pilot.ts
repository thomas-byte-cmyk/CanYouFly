import Phaser from 'phaser';
import type { PilotState } from '../../sim/session';
import { C } from '../style';

export type Expression = 'calm' | 'happy' | 'focused' | 'scared' | 'dazed';

/**
 * Dessine Pip en couches (docs/PILOT_CHARACTER.md) : tête, cosmétiques (casque, lunettes, écharpe),
 * puis effets temporaires superposés (suie, casque de travers, eau). Les cosmétiques ne sont jamais retirés.
 * (cx, cy) = centre de la tête, r = rayon de la tête en pixels.
 */
export function drawPilot(
  g: Phaser.GameObjects.Graphics,
  cx: number,
  cy: number,
  r: number,
  expr: Expression,
  state: PilotState = 'fresh',
): void {
  const lw = Math.max(1.5, r * 0.14);
  const tilt = state === 'dazed' ? -0.35 : state === 'shaken' ? -0.15 : 0;

  // Écharpe (derrière la tête).
  g.fillStyle(C.red, 1);
  g.lineStyle(lw, C.ink, 1);
  g.fillTriangle(cx - r * 0.4, cy + r * 0.75, cx - r * 2.1, cy + r * 0.45, cx - r * 1.9, cy + r * 1.05);
  g.strokeTriangle(cx - r * 0.4, cy + r * 0.75, cx - r * 2.1, cy + r * 0.45, cx - r * 1.9, cy + r * 1.05);

  // Visage.
  g.fillStyle(0xf6c9a0, 1);
  g.fillCircle(cx, cy, r);
  g.strokeCircle(cx, cy, r);

  // Suie (effet temporaire superposé).
  if (state === 'dazed') {
    g.fillStyle(0x3a3330, 0.55);
    g.fillCircle(cx + r * 0.35, cy + r * 0.35, r * 0.35);
    g.fillCircle(cx - r * 0.3, cy + r * 0.45, r * 0.25);
    g.fillCircle(cx + r * 0.6, cy - r * 0.05, r * 0.2);
  }

  // Casque en cuir (cosmétique), éventuellement de travers.
  const hx = cx + Math.sin(tilt) * r * 0.4;
  g.fillStyle(0x8a5a3c, 1);
  g.lineStyle(lw, C.ink, 1);
  g.beginPath();
  g.arc(hx, cy - r * 0.05, r * 1.05, Math.PI + tilt, Math.PI * 2 + tilt, false);
  g.closePath();
  g.fillPath();
  g.strokePath();
  // Oreillette.
  g.fillStyle(0x6e4630, 1);
  g.fillCircle(cx - r * 0.55, cy + r * 0.05, r * 0.28);
  g.strokeCircle(cx - r * 0.55, cy + r * 0.05, r * 0.28);

  // Yeux / lunettes.
  const ey = cy - r * 0.05;
  const ex = cx + r * 0.35;
  if (state === 'soaked' || expr === 'dazed') {
    // Yeux en spirale / croix.
    g.lineStyle(lw, C.ink, 1);
    g.lineBetween(ex - r * 0.18, ey - r * 0.18, ex + r * 0.18, ey + r * 0.18);
    g.lineBetween(ex - r * 0.18, ey + r * 0.18, ex + r * 0.18, ey - r * 0.18);
  } else {
    g.fillStyle(C.white, 1);
    const eyeR = expr === 'scared' ? r * 0.3 : r * 0.22;
    g.fillCircle(ex, ey, eyeR);
    g.lineStyle(lw * 0.8, C.ink, 1);
    g.strokeCircle(ex, ey, eyeR);
    g.fillStyle(C.ink, 1);
    g.fillCircle(ex + r * 0.06, ey, eyeR * 0.45);
  }
  // Lunettes d'aviateur relevées sur le casque (cosmétique).
  const gy = cy - r * 0.62;
  g.fillStyle(C.teal, 1);
  g.lineStyle(lw * 0.8, C.ink, 1);
  g.fillCircle(hx + r * 0.25, gy, r * 0.26);
  g.strokeCircle(hx + r * 0.25, gy, r * 0.26);
  g.fillStyle(0xbfe8f0, 1);
  g.fillCircle(hx + r * 0.25, gy, r * 0.14);

  // Bouche.
  g.lineStyle(lw, C.ink, 1);
  const mx = cx + r * 0.45;
  const my = cy + r * 0.45;
  if (expr === 'happy') {
    g.beginPath();
    g.arc(mx, my - r * 0.1, r * 0.22, 0.1, Math.PI - 0.1, false);
    g.strokePath();
  } else if (expr === 'scared') {
    g.fillStyle(C.ink, 1);
    g.fillEllipse(mx, my, r * 0.22, r * 0.32);
  } else if (expr === 'dazed') {
    g.beginPath();
    g.moveTo(mx - r * 0.2, my);
    g.lineTo(mx - r * 0.07, my - r * 0.08);
    g.lineTo(mx + r * 0.07, my + r * 0.06);
    g.lineTo(mx + r * 0.2, my - r * 0.04);
    g.strokePath();
  } else {
    g.lineBetween(mx - r * 0.15, my, mx + r * 0.15, my);
  }

  // Gouttes d'eau / étoiles autour de la tête.
  if (state === 'soaked') {
    g.fillStyle(C.blue, 1);
    g.fillCircle(cx - r * 0.9, cy - r * 1.2, r * 0.14);
    g.fillCircle(cx + r * 1.1, cy - r * 0.9, r * 0.12);
    g.fillCircle(cx + r * 1.3, cy + r * 0.2, r * 0.1);
  }
  if (state === 'dazed') {
    g.fillStyle(C.yellow, 1);
    for (let i = 0; i < 3; i++) {
      const a = -Math.PI / 2 + (i - 1) * 0.9;
      const sx = cx + Math.cos(a) * r * 1.5;
      const sy = cy - r * 0.6 + Math.sin(a) * r * 0.7;
      g.fillCircle(sx, sy, r * 0.13);
    }
  }
  if (state === 'ruffled' || state === 'shaken') {
    // Mèches décoiffées qui dépassent du casque.
    g.lineStyle(lw, 0x6b4a2a, 1);
    g.lineBetween(cx - r * 0.2, cy - r * 1.0, cx - r * 0.4, cy - r * 1.45);
    g.lineBetween(cx + r * 0.1, cy - r * 1.05, cx + r * 0.15, cy - r * 1.5);
    g.lineBetween(cx + r * 0.4, cy - r * 0.95, cx + r * 0.65, cy - r * 1.35);
  }
}
