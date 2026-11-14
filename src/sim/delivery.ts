import type { DeliveryOutcome, PackageDef } from './cargo';
import type { LandingGrade } from './landing';

/** Résultat de livraison (D18 : on livre uniquement en atterrissant). */
export interface Delivery {
  status: 'livre' | 'perdu' | 'refuse';
  /** État du colis à la livraison. */
  condition?: 'intact' | 'cabosse' | 'miettes';
  outcome: DeliveryOutcome;
  /** Note client de 0 à 5 étoiles. */
  rating: number;
  pay: number;
  tip: number;
  consolation: number;
  bonus: number;
  total: number;
  review: string;
}

const CONDITION_PAY = { intact: 1, cabosse: 0.7, miettes: 0.3 } as const;

export interface DeliveryInput {
  pkg: PackageDef;
  grade: LandingGrade;
  /** Arrêt dans une zone d'arrivée de l'île, hors de l'eau. */
  validated: boolean;
  /** Fraction du trajet parcourue (0 … 1). */
  progression: number;
  /** Boulons ramassés, anneaux, séries. */
  bonus: number;
  seed: number;
}

/**
 * Livré : l'état dépend de la note (la fragilité a déjà durci la note via la tolérance).
 * Perdu en mer : échec, mais quelques Boulons de consolation (jamais de « 0 » humiliant).
 */
export function computeDelivery(i: DeliveryInput): Delivery {
  const pick = (o: DeliveryOutcome) => {
    const list = i.pkg.reviews[o];
    return list[i.seed % list.length];
  };
  let d: Omit<Delivery, 'total' | 'review' | 'bonus'>;
  if (i.grade === 'WATER') {
    d = { status: 'perdu', outcome: 'plouf', rating: 1, pay: 0, tip: 0, consolation: Math.round(0.3 * i.pkg.price * i.progression) };
  } else if (!i.validated) {
    d = { status: 'refuse', outcome: 'refuse', rating: 1, pay: 0, tip: 0, consolation: Math.round(0.3 * i.pkg.price * i.progression) };
  } else {
    const condition = i.grade === 'PERFECT' || i.grade === 'GOOD' ? 'intact' : i.grade === 'ROUGH' ? 'cabosse' : 'miettes';
    const outcome: DeliveryOutcome = i.grade === 'PERFECT' ? 'parfait' : condition;
    const rating = i.grade === 'PERFECT' ? 5 : i.grade === 'GOOD' ? 4 : i.grade === 'ROUGH' ? 3 : 2;
    d = {
      status: 'livre',
      condition,
      outcome,
      rating,
      pay: Math.round(i.pkg.price * CONDITION_PAY[condition]),
      tip: i.grade === 'PERFECT' ? i.pkg.tip : 0,
      consolation: 0,
    };
  }
  let total = d.pay + d.tip + d.consolation + i.bonus;
  if (i.progression >= 0.05) total = Math.max(10, total);
  return { ...d, bonus: i.bonus, total, review: pick(d.outcome) };
}
