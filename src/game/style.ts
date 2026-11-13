// Palette « Atelier du Dimanche » (docs/ART_DIRECTION.md) — placeholders du prototype.
export const C = {
  ink: 0x2b2321,
  cream: 0xfdf3e1,
  paper: 0xf3e3c3,
  red: 0xd9573b,
  orange: 0xf2994a,
  yellow: 0xf2c94c,
  teal: 0x3a9e9a,
  blue: 0x4aa3df,
  deepBlue: 0x2f7fb8,
  sky: 0x87c9e8,
  skyTop: 0x5fb2df,
  grass: 0x8cc152,
  grassDark: 0x6aa13c,
  soil: 0xb5895a,
  soilDark: 0x8c6a45,
  wheat: 0xe0c65e,
  wheatDark: 0xc9ac44,
  forest: 0x3f7a3a,
  forestDark: 0x2e5e2b,
  asphalt: 0x5d5a58,
  stone: 0xa59d92,
  stoneLight: 0xd6cdbf,
  green: 0x5cb85c,
  white: 0xffffff,
};

export const CSS = {
  ink: '#2b2321',
  cream: '#fdf3e1',
  red: '#d9573b',
  orange: '#f2994a',
  yellow: '#f2c94c',
  teal: '#3a9e9a',
  green: '#4f9e3f',
  blue: '#2f7fb8',
  white: '#ffffff',
};

export const FONT = '"Trebuchet MS", "Segoe UI", system-ui, -apple-system, sans-serif';

/** Échelle d'affichage : pixels par unité de simulation. */
export const PX = 8;

export function textStyle(size: number, color = CSS.ink, extra: Partial<Phaser.Types.GameObjects.Text.TextStyle> = {}): Phaser.Types.GameObjects.Text.TextStyle {
  return { fontFamily: FONT, fontSize: `${size}px`, color, fontStyle: 'bold', ...extra };
}
