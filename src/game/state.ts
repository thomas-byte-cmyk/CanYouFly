import type Phaser from 'phaser';
import { CONTENT, type Order } from '../sim/content';

/**
 * État de la partie pendant la session (la sauvegarde viendra avec le hangar, issue #15).
 * Commandes débloquées une à une ; meilleure note client gardée par commande.
 */
export const game = {
  orderIndex: 0,
  unlocked: 1,
  aircraftId: 'coucou',
  boulons: 0,
  flights: 0,
  bestRating: {} as Record<string, number>,
};

export function currentOrder(): Order {
  return CONTENT.orders[game.orderIndex];
}

/** Lance (ou relance) le vol de la commande en cours, en fermant les écrans par-dessus. */
export function startFlight(from: Phaser.Scene): void {
  const sp = from.scene;
  for (const k of ['results', 'select', 'order', 'pause']) if (k !== from.scene.key && sp.isActive(k)) sp.stop(k);
  const flight = sp.get('flight');
  if (sp.isActive('flight') || sp.isPaused('flight') || sp.isSleeping('flight')) {
    // La scène de vol arrête elle-même son interface (HUD) en s'éteignant.
    flight.scene.restart();
  } else {
    sp.launch('flight');
  }
  if (from.scene.key !== 'flight') sp.stop();
}

/** Ouvre l'écran de commande (début de boucle). */
export function openOrder(from: Phaser.Scene): void {
  const sp = from.scene;
  for (const k of ['results', 'select', 'pause']) if (k !== from.scene.key && sp.isActive(k)) sp.stop(k);
  if (sp.isActive('hud')) sp.sleep('hud');
  sp.launch('order');
  if (from.scene.key !== 'flight' && from.scene.key !== 'background') sp.stop();
}
