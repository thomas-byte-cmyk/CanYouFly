import type { Env, SurfaceProps, SurfaceType, Tuning } from './types';

export interface GroundSegment {
  x0: number;
  x1: number;
  surface: SurfaceType;
}

export type ZoneKind = 'safe' | 'standard' | 'bold';

export interface LandingZone {
  id: string;
  name: string;
  x0: number;
  x1: number;
  kind: ZoneKind;
  /** facteurZone de la formule de gains (docs/PROGRESSION_SYSTEM.md §3.1). */
  zoneFactor: number;
  /** Fait partie de la zone d'arrivée de la destination (valide l'étape, décision D5). */
  arrival: boolean;
  /** Difficulté affichée (★ facile → ★★★ difficile). */
  difficulty: 1 | 2 | 3;
}

export type ObstacleType = 'tree' | 'fence' | 'lamppost' | 'building' | 'cathedral' | 'barn';

export interface Obstacle {
  type: ObstacleType;
  x: number;
  w: number;
  h: number;
}

export interface WindZone {
  x0: number;
  x1: number;
  wx: number;
  wy: number;
}

export interface UpdraftZone {
  x0: number;
  x1: number;
  strength: number;
  top: number;
}

export interface Ring {
  x: number;
  y: number;
  r: number;
}

export interface Level {
  id: string;
  from: string;
  to: string;
  /** Facteur d'échelle u → km affichés (distances arcade). */
  kmPerUnit: number;
  /** Valeur de référence R de l'étape (Boulons). */
  reward: number;
  startX: number;
  destinationX: number;
  approachStartX: number;
  worldStart: number;
  worldEnd: number;
  ground: GroundSegment[];
  zones: LandingZone[];
  obstacles: Obstacle[];
  wind: WindZone[];
  updrafts: UpdraftZone[];
  rings: Ring[];
  landmarks: { type: string; x: number; label?: string }[];
}

export function surfaceAt(level: Level, x: number): SurfaceType {
  for (const g of level.ground) if (x >= g.x0 && x < g.x1) return g.surface;
  return 'forest';
}

export function zoneAt(level: Level, x: number): LandingZone | undefined {
  return level.zones.find((z) => x >= z.x0 && x <= z.x1);
}

/** Obstacle qui contient le point (x, y), s'il y en a un. */
export function obstacleAt(level: Level, x: number, y: number): Obstacle | undefined {
  for (const o of level.obstacles) {
    if (x >= o.x && x <= o.x + o.w && y >= 0 && y <= o.h) return o;
  }
  return undefined;
}

export function createEnv(level: Level, tuning: Tuning, surfaces: Record<SurfaceType, SurfaceProps>): Env {
  return {
    tuning,
    windAt(x) {
      for (const w of level.wind) if (x >= w.x0 && x <= w.x1) return { x: w.wx, y: w.wy };
      return { x: 0, y: 0 };
    },
    updraftAt(x, y) {
      for (const u of level.updrafts) {
        if (x >= u.x0 && x <= u.x1 && y <= u.top) {
          // Profil en cloche : plus fort au centre de la colonne.
          const c = (u.x0 + u.x1) / 2;
          const half = (u.x1 - u.x0) / 2;
          const k = 1 - Math.abs(x - c) / half;
          return u.strength * (0.4 + 0.6 * k);
        }
      }
      return 0;
    },
    groundHeightAt() {
      return 0;
    },
    surfaceAt: (x) => surfaceAt(level, x),
    surfaceProps: (s) => surfaces[s],
  };
}
