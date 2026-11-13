import Phaser from 'phaser';

export type TouchScheme = 'stick' | 'buttons';

/**
 * Commandes clavier + tactile (docs/PHYSICS_AND_CONTROLS.md §6).
 * Clavier : ↑/W cabrer, ↓/S piquer, →/D plus de gaz, ←/A moins de gaz, Maj couper/remettre,
 * T gaz automatiques, Échap/P pause, R recommencer, G débogage.
 * Tactile : pouce droit = manche relatif (ou 2 boutons), pouce gauche = curseur des gaz.
 */
export class Controls {
  pitch = 0;
  /** Valeur manuelle des gaz si le joueur a pris la main, sinon undefined (gaz automatiques). */
  manualThrottle: number | undefined;
  stick: { ox: number; oy: number; x: number; y: number } | null = null;
  readonly isTouch: boolean;
  readonly scheme: TouchScheme;
  private readonly keys: Record<string, Phaser.Input.Keyboard.Key>;
  private stickPointer: number | null = null;
  private throttlePointer: number | null = null;
  private buttonPitch = 0;
  private lastThrottleBeforeCut = 0.7;
  private readonly listeners: Record<string, (() => void)[]> = {};

  /** Zone du curseur des gaz (coordonnées écran). */
  readonly slider = { x: 70, top: 250, bottom: 600, width: 70 };
  /** Boutons ▲▼ (schéma « buttons »). */
  readonly buttons = { x: 1170, up: 420, down: 580, r: 62 };

  constructor(scene: Phaser.Scene) {
    this.isTouch = scene.sys.game.device.input.touch;
    this.scheme = new URLSearchParams(window.location.search).get('touch') === 'buttons' ? 'buttons' : 'stick';
    const kb = scene.input.keyboard!;
    const K = Phaser.Input.Keyboard.KeyCodes;
    this.keys = kb.addKeys(
      { up: K.UP, w: K.W, z: K.Z, down: K.DOWN, s: K.S, right: K.RIGHT, d: K.D, left: K.LEFT, a: K.A, q: K.Q, shift: K.SHIFT, space: K.SPACE },
      true,
    ) as Record<string, Phaser.Input.Keyboard.Key>;
    const keyHandlers: [string, () => void][] = [
      ['keydown-T', () => this.setAuto()],
      ['keydown-SHIFT', () => this.toggleEngine()],
      ['keydown-ESC', () => this.emit('pause')],
      ['keydown-P', () => this.emit('pause')],
      ['keydown-R', () => this.emit('restart')],
      ['keydown-G', () => this.emit('debug')],
    ];
    const pointerHandlers: [string, (p: Phaser.Input.Pointer) => void][] = [
      ['pointerdown', (p) => this.onDown(p)],
      ['pointermove', (p) => this.onMove(p)],
      ['pointerup', (p) => this.onUp(p)],
      ['pointerupoutside', (p) => this.onUp(p)],
    ];
    for (const [e, fn] of keyHandlers) kb.on(e, fn);
    scene.input.addPointer(2);
    for (const [e, fn] of pointerHandlers) scene.input.on(e, fn);
    this.cleanup = () => {
      for (const [e, fn] of keyHandlers) kb.off(e, fn);
      for (const [e, fn] of pointerHandlers) scene.input.off(e, fn);
    };
  }

  on(event: 'pause' | 'restart' | 'debug' | 'auto', fn: () => void): void {
    (this.listeners[event] ??= []).push(fn);
  }

  private emit(event: string): void {
    for (const fn of this.listeners[event] ?? []) fn();
  }

  setAuto(): void {
    this.manualThrottle = undefined;
    this.emit('auto');
  }

  private toggleEngine(): void {
    if (this.manualThrottle !== undefined && this.manualThrottle === 0) {
      this.manualThrottle = this.lastThrottleBeforeCut;
    } else {
      this.lastThrottleBeforeCut = this.manualThrottle ?? 0.7;
      this.manualThrottle = 0;
    }
  }

  /** Appelé à chaque image. `currentThrottle` = gaz actuels (pour reprendre la main sans à-coup). */
  update(dt: number, currentThrottle: number): void {
    const k = this.keys;
    let p = 0;
    if (k.up.isDown || k.w.isDown || k.z.isDown) p += 1;
    if (k.down.isDown || k.s.isDown) p -= 1;
    if (this.stick) {
      p = Phaser.Math.Clamp((this.stick.oy - this.stick.y) / 60, -1, 1);
    }
    if (this.buttonPitch !== 0) p = this.buttonPitch;
    this.pitch = p;

    const up = k.right.isDown || k.d.isDown;
    const down = k.left.isDown || k.a.isDown || k.q.isDown;
    if (up || down) {
      const base = this.manualThrottle ?? currentThrottle;
      this.manualThrottle = Phaser.Math.Clamp(base + (up ? 1 : -1) * 0.8 * dt, 0, 1);
    }
  }

  private inSlider(p: Phaser.Input.Pointer): boolean {
    const s = this.slider;
    return p.x < s.x + s.width + 40 && p.y > s.top - 40 && p.y < s.bottom + 40;
  }

  private sliderValue(y: number): number {
    const s = this.slider;
    return Phaser.Math.Clamp(1 - (y - s.top) / (s.bottom - s.top), 0, 1);
  }

  private onDown(p: Phaser.Input.Pointer): void {
    if (!this.isTouch && !p.wasTouch) return;
    if (this.inSlider(p) && this.throttlePointer === null) {
      this.throttlePointer = p.id;
      this.manualThrottle = this.sliderValue(p.y);
      return;
    }
    if (this.scheme === 'buttons') {
      const b = this.buttons;
      if (Math.hypot(p.x - b.x, p.y - b.up) < b.r) this.buttonPitch = 1;
      else if (Math.hypot(p.x - b.x, p.y - b.down) < b.r) this.buttonPitch = -1;
      if (this.buttonPitch !== 0) this.stickPointer = p.id;
      return;
    }
    if (p.x > 380 && p.y > 90 && this.stickPointer === null) {
      this.stickPointer = p.id;
      this.stick = { ox: p.x, oy: p.y, x: p.x, y: p.y };
    }
  }

  private onMove(p: Phaser.Input.Pointer): void {
    if (p.id === this.throttlePointer) this.manualThrottle = this.sliderValue(p.y);
    if (p.id === this.stickPointer && this.stick) {
      this.stick.x = p.x;
      this.stick.y = p.y;
    }
  }

  private onUp(p: Phaser.Input.Pointer): void {
    if (p.id === this.throttlePointer) this.throttlePointer = null;
    if (p.id === this.stickPointer) {
      this.stickPointer = null;
      this.stick = null;
      this.buttonPitch = 0;
    }
  }

  private cleanup: () => void = () => {};

  destroy(): void {
    this.cleanup();
  }
}
