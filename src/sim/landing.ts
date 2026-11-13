import { DEG } from './aero';
import type { SurfaceProps } from './types';

/** docs/LANDING_AND_CRASH_SYSTEM.md §4. */
export type LandingGrade = 'PERFECT' | 'GOOD' | 'ROUGH' | 'CRASH' | 'WATER';

export const GRADE_ORDER: LandingGrade[] = ['PERFECT', 'GOOD', 'ROUGH', 'CRASH', 'WATER'];

export interface LandingThresholds {
  perfect: number;
  good: number;
  rough: number;
  /** Plage d'assiette idéale au contact (degrés). */
  pitchIdealMinDeg: number;
  pitchIdealMaxDeg: number;
  /** En dessous : nez en premier = crash. */
  noseFirstDeg: number;
  /** Poids de la vitesse horizontale dans l'indice. */
  horizontalWeight: number;
  /** Vitesse en dessous de laquelle heurter un obstacle au roulage n'est qu'un ROUGH. */
  gentleObstacleSpeed: number;
}

export interface TouchdownInput {
  sink: number;
  groundSpeed: number;
  pitch: number;
  surface: SurfaceProps;
  gearTolerance: number;
  gearVhMax: number;
}

export interface TouchdownResult {
  severity: number;
  rv: number;
  ra: number;
  rh: number;
  grade: LandingGrade;
  /** Cause principale, pour un conseil ciblé. */
  cause: 'sink' | 'pitch' | 'speed' | 'nose' | 'terrain' | 'none';
}

export function evaluateTouchdown(i: TouchdownInput, th: LandingThresholds): TouchdownResult {
  if (!i.surface.landable) {
    return { severity: Infinity, rv: 0, ra: 0, rh: 0, grade: 'CRASH', cause: 'terrain' };
  }
  const f = i.surface.tolerance;
  const pitchDeg = i.pitch / DEG;
  const rv = i.sink / (i.gearTolerance * f);
  let pitchOut = 0;
  if (pitchDeg < th.pitchIdealMinDeg) pitchOut = th.pitchIdealMinDeg - pitchDeg;
  else if (pitchDeg > th.pitchIdealMaxDeg) pitchOut = pitchDeg - th.pitchIdealMaxDeg;
  const ra = pitchOut / 10;
  const rh = Math.abs(i.groundSpeed) / (i.gearVhMax * f);
  const severity = Math.max(rv, ra, th.horizontalWeight * rh);

  if (pitchDeg < th.noseFirstDeg) {
    return { severity, rv, ra, rh, grade: 'CRASH', cause: 'nose' };
  }
  let grade: LandingGrade;
  if (severity <= th.perfect) grade = 'PERFECT';
  else if (severity <= th.good) grade = 'GOOD';
  else if (severity <= th.rough) grade = 'ROUGH';
  else grade = 'CRASH';

  let cause: TouchdownResult['cause'] = 'none';
  if (severity > th.perfect) {
    if (severity === rv) cause = 'sink';
    else if (severity === ra) cause = 'pitch';
    else cause = 'speed';
  }
  return { severity, rv, ra, rh, grade, cause };
}

/** La pire note l'emporte (contact puis roulage). */
export function worstGrade(a: LandingGrade, b: LandingGrade): LandingGrade {
  return GRADE_ORDER.indexOf(a) >= GRADE_ORDER.indexOf(b) ? a : b;
}
