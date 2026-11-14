import Phaser from 'phaser';
import { BackgroundScene } from './game/scenes/BackgroundScene';
import { FlightScene } from './game/scenes/FlightScene';
import { HudScene } from './game/scenes/HudScene';
import { PauseScene } from './game/scenes/PauseScene';
import { ResultsScene } from './game/scenes/ResultsScene';
import { SelectScene } from './game/scenes/SelectScene';

// Jalon « Sensation de vol » : on démarre directement sur la piste (décision D2).
const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: 1280,
  height: 720,
  backgroundColor: '#87c9e8',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  input: { activePointers: 3 },
  // Pas de lissage du delta : la simulation reste en temps réel même sur un appareil lent.
  fps: { smoothStep: false },
  render: { antialias: true },
  disableContextMenu: true,
  scene: [BackgroundScene, FlightScene, HudScene, ResultsScene, PauseScene, SelectScene],
});

// Empêche le défilement de la page par les touches de jeu (exigence Poki).
window.addEventListener('keydown', (e) => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
});

// Accès de débogage depuis la console du navigateur.
(window as unknown as { game: Phaser.Game }).game = game;
