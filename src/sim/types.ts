// Types partagés du simulateur de vol.
// Convention : x vers l'avant de l'étape (droite), y vers le haut, angles en radians,
// θ (theta) = assiette du nez, positive quand le nez monte.
// Unités « arcade » : u (longueur), u/s (vitesse), masse sans unité.

/** Surface portante (aile, canard, empennage horizontal). */
export interface LiftSurface {
  id: string;
  /** Position le long de l'axe de l'avion (positive vers le nez). */
  x: number;
  area: number;
  /** Pente de portance (par radian). */
  liftSlope: number;
  stallAngleDeg: number;
  incidenceDeg: number;
}

export interface MassItem {
  id: string;
  mass: number;
  x: number;
}

export interface AircraftDef {
  id: string;
  name: string;
  masses: MassItem[];
  fuel: { capacity: number; x: number; burnRate: number };
  engine: { thrustMax: number; propVmax: number };
  drag: { parasite: number; inducedK: number };
  surfaces: LiftSurface[];
  pitch: { authority: number; damping: number; inertiaBase: number };
  refChord: number;
  /** tolerance = G (vitesse verticale « GOOD » max sur piste), vhMax = vitesse horizontale de référence. */
  gear: { tolerance: number; vhMax: number; height: number; x: number };
  /** Géométrie pour les collisions et le dessin. */
  geometry: { noseX: number; tailX: number; topY: number };
}

export interface Aggregates {
  mass: number;
  xCG: number;
  xNP: number;
  staticMargin: number;
  inertia: number;
  wingArea: number;
  takeoffSpeed: number;
}

export interface Tuning {
  gravity: number;
  rho: number;
  /** Altitude à partir de laquelle l'air se raréfie (plafond doux). */
  ceilingStart: number;
  ceilingEnd: number;
  qMin: number;
  trimLimit: number;
  trimSpeed: number;
  /** Volets automatiques en approche : vitesse de référence et traînée ajoutée. */
  approachSpeed: number;
  flapsDrag: number;
  pitchRampTime: number;
  /** Effet de sol : coussin d'air près du sol qui adoucit la fin de descente. */
  groundEffect: { height: number; liftBoost: number; cushion: number };
  assist: { extraDamping: number; alphaHoldGain: number };
  ground: { pitchMin: number; pitchMax: number };
}

export type SurfaceType =
  | 'runway'
  | 'grass'
  | 'field'
  | 'vineyard'
  | 'park'
  | 'water'
  | 'forest'
  | 'city';

export interface SurfaceProps {
  /** Tolérance d'atterrissage (f_surface) ; 0 = non atterrissable. */
  tolerance: number;
  rolling: number;
  brake: number;
  landable: boolean;
  label: string;
}

export interface FlightInput {
  /** −1 (piquer) … +1 (cabrer). */
  pitch: number;
  /** 0 … 1. */
  throttle: number;
  brake: boolean;
}

export interface FlightState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  theta: number;
  omega: number;
  fuel: number;
  onGround: boolean;
  time: number;
  /** Diagnostic (calculés pendant le pas). */
  alphaWing: number;
  airspeed: number;
  stalled: boolean;
  lift: number;
  drag: number;
  thrust: number;
}

export interface Env {
  tuning: Tuning;
  /** Vent à la position (x, y) au temps t (les rafales varient dans le temps). */
  windAt(x: number, y: number, t: number): { x: number; y: number };
  /** Accélération verticale supplémentaire (ascendance > 0). */
  updraftAt(x: number, y: number): number;
  groundHeightAt(x: number): number;
  surfaceAt(x: number): SurfaceType;
  surfaceProps(s: SurfaceType): SurfaceProps;
}

export interface AircraftRuntime {
  def: AircraftDef;
  trimU: number;
  alphaTrim: number;
  stabilize: boolean;
  /** Traînée parasite supplémentaire (volets sortis). */
  extraDrag: number;
}

export interface StepInfo {
  /** L'avion touche le sol pendant ce pas. */
  contact: boolean;
  /** Vitesse verticale (positive vers le bas) au moment du contact. */
  impactSink: number;
}
