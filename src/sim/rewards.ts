import type { LandingGrade } from './landing';
import type { LandingZone, Level } from './world';

/** docs/PROGRESSION_SYSTEM.md §3.1 — valeurs initiales, à équilibrer. */
export const QUALITY_BONUS: Record<LandingGrade, number> = {
  PERFECT: 0.4,
  GOOD: 0.25,
  ROUGH: 0.1,
  CRASH: 0,
  WATER: 0,
};

export const OFF_ZONE_FACTOR = 0.3;
export const RING_VALUE = 3;
export const BOLT_VALUE = 1;
export const CHAIN_BONUS = 10;
export const FLOOR = 10;

export interface RewardInput {
  level: Level;
  endX: number;
  grade: LandingGrade;
  landed: boolean;
  zone?: LandingZone;
  rings: number;
  bolts?: number;
  chains?: number;
  validated: boolean;
  firstArrival: boolean;
}

export interface Reward {
  distance: number;
  landing: number;
  rings: number;
  firstArrival: number;
  total: number;
  progression: number;
}

export function computeReward(i: RewardInput): Reward {
  const R = i.level.reward;
  const span = i.level.destinationX - i.level.startX;
  const progression = Math.min(1, Math.max(0, (i.endX - i.level.startX) / span));
  const distance = Math.round(0.6 * R * progression);
  const factor = i.zone ? i.zone.zoneFactor : OFF_ZONE_FACTOR;
  const landing = i.landed ? Math.round(R * QUALITY_BONUS[i.grade] * factor) : 0;
  const rings = i.rings * RING_VALUE + (i.bolts ?? 0) * BOLT_VALUE + (i.chains ?? 0) * CHAIN_BONUS;
  const firstArrival = i.validated && i.firstArrival ? R : 0;
  let total = distance + landing + rings + firstArrival;
  if (progression >= 0.05) total = Math.max(FLOOR, total);
  return { distance, landing, rings, firstArrival, total, progression };
}

/** Étoiles d'une étape validée (décision D5). */
export function starsFor(grade: LandingGrade, validated: boolean): 0 | 1 | 2 | 3 {
  if (!validated) return 0;
  if (grade === 'PERFECT') return 3;
  if (grade === 'GOOD' || grade === 'ROUGH') return 2;
  return 1;
}
