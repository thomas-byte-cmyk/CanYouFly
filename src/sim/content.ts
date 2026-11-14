import albatros from '../data/aircraft/albatros.json';
import coucou from '../data/aircraft/coucou.json';
import fusee from '../data/aircraft/fusee.json';
import landing from '../data/landing.json';
import parisReims from '../data/levels/paris-reims.json';
import surfaces from '../data/surfaces.json';
import tuning from '../data/tuning.json';
import type { LandingThresholds } from './landing';
import type { AircraftDef, SurfaceProps, SurfaceType, Tuning } from './types';
import type { Level } from './world';

/** Données de jeu (JSON éditables, docs/TECHNICAL_ARCHITECTURE.md). */
export const CONTENT = {
  aircraft: { coucou: coucou as AircraftDef, fusee: fusee as AircraftDef, albatros: albatros as AircraftDef } as Record<string, AircraftDef>,
  levels: { 'paris-reims': parisReims as unknown as Level },
  tuning: tuning as Tuning,
  surfaces: surfaces as Record<SurfaceType, SurfaceProps>,
  landing: landing as LandingThresholds,
};
