import type { AircraftDef } from './types';

/**
 * Colis (pivot D17/D18) : il modifie réellement l'avion (masse, centre de gravité, traînée)
 * et la difficulté d'atterrir (fragilité). Données : src/data/packages/*.json.
 */
export interface PackageDef {
  id: string;
  name: string;
  /** Pictogramme affiché (emoji en attendant les dessins). */
  icon: string;
  mass: number;
  /** Position dans l'avion (u, positive vers le nez) : soute avant ≈ 1, arrière ≈ −2. */
  slotX: number;
  /** Traînée ajoutée (colis à l'extérieur). */
  drag: number;
  /** Multiplicateur de tolérance d'atterrissage : 1 = normal, 0,5 = deux fois plus exigeant. */
  fragility: number;
  /** Masse qui bouge en vol (poules) : amplitude (u) et période (s). */
  shifting?: { amp: number; period: number };
  /** Paiement de base et pourboire si livraison PARFAITE. */
  price: number;
  tip: number;
  /** Contraintes affichées en pictogrammes sur la commande. */
  tags: ('lourd' | 'fragile' | 'bouge' | 'encombrant' | 'urgent')[];
  /** Avis clients selon le résultat (une ligne chacun, tirés au hasard). */
  reviews: Record<DeliveryOutcome, string[]>;
}

export type DeliveryOutcome = 'parfait' | 'intact' | 'cabosse' | 'miettes' | 'plouf' | 'refuse';

/** Copie de l'avion avec le colis chargé : c'est cette copie qui vole et dont on calcule les barres. */
export function withCargo(def: AircraftDef, pkg?: PackageDef): AircraftDef {
  const copy = JSON.parse(JSON.stringify(def)) as AircraftDef;
  if (!pkg) return copy;
  copy.masses.push({ id: 'cargo', mass: pkg.mass, x: pkg.slotX });
  copy.drag.parasite += pkg.drag;
  copy.gear.tolerance *= pkg.fragility;
  return copy;
}

/** Position actuelle du colis qui bouge (poules qui courent dans la soute). */
export function cargoX(pkg: PackageDef, t: number): number {
  if (!pkg.shifting) return pkg.slotX;
  return pkg.slotX + pkg.shifting.amp * Math.sin((2 * Math.PI * t) / pkg.shifting.period);
}
