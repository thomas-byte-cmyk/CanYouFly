import albatros from '../data/aircraft/albatros.json';
import coucou from '../data/aircraft/coucou.json';
import fusee from '../data/aircraft/fusee.json';
import landing from '../data/landing.json';
import depot from '../data/levels/depot.json';
import cocotte from '../data/levels/cocotte.json';
import orders from '../data/orders.json';
import carton from '../data/packages/carton.json';
import oeufs from '../data/packages/oeufs.json';
import poules from '../data/packages/poules.json';
import parisReims from '../data/levels/paris-reims.json';
import surfaces from '../data/surfaces.json';
import tuning from '../data/tuning.json';
import type { PackageDef } from './cargo';
import type { LandingThresholds } from './landing';
import type { AircraftDef, SurfaceProps, SurfaceType, Tuning } from './types';
import type { Level } from './world';

export interface Order {
  id: string;
  packageId: string;
  levelId: string;
  client: string;
  title: string;
  message: string;
}

/** Données de jeu (JSON éditables, docs/TECHNICAL_ARCHITECTURE.md). */
export const CONTENT = {
  aircraft: { coucou: coucou as AircraftDef, fusee: fusee as AircraftDef, albatros: albatros as AircraftDef } as Record<string, AircraftDef>,
  levels: {
    'paris-reims': parisReims as unknown as Level,
    depot: depot as unknown as Level,
    cocotte: cocotte as unknown as Level,
  } as Record<string, Level>,
  packages: { carton, oeufs, poules } as unknown as Record<string, PackageDef>,
  /** Commandes (pivot D17) : un colis, une île, un client, un message. */
  orders: orders as Order[],
  tuning: tuning as Tuning,
  surfaces: surfaces as Record<SurfaceType, SurfaceProps>,
  landing: landing as LandingThresholds,
};
