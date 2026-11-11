import Phaser from 'phaser';
import { AREAS } from '../content/campaign';
import type { Controller } from '../game/controller';
import type { ObjectDef } from '../game/types';
import { settings, walkStepMs } from '../ui/settings';
import { makeTextures, tileVariants } from './textures';

const T = 16;

/** Sprites that get a gentle breathing bob. */
const IDLE_PEOPLE = new Set([
  'bram', 'fen', 'moss', 'vex', 'wren', 'ghost',
  'sleeperGuard', 'sleeperBaker', 'sleeperButcher', 'sleeperLamp',
  'sleeperMayor', 'sleeperApprentice', 'prisoner',
  'sleeperShepherd', 'sleeperWasher', 'sleeperSmith', 'sleeperApothecary', 'sleeperMerchant', 'guardAwake', 'sergeant', 'recruit', 'ned', 'sheep', 'horse', 'dog', 'chicken', 'crows', 'wisp', 'goose', 'duck',
]);

/** Sprites with a flickering glow: which glow, where (pixels down), how bright, how fast. */
const IDLE_GLOWS: Record<string, { key: string; dy: number; lo: number; hi: number; ms: number }> = {
  sconce: { key: 'glow', dy: 4, lo: 0.35, hi: 0.7, ms: 420 },
  lamp: { key: 'glow', dy: 3, lo: 0.4, hi: 0.75, ms: 520 },
  candelabra: { key: 'glow', dy: 2, lo: 0.3, hi: 0.65, ms: 380 },
  altar: { key: 'glow', dy: 4, lo: 0.25, hi: 0.55, ms: 600 },
  fireplace: { key: 'glow', dy: 10, lo: 0.4, hi: 0.8, ms: 380 },
  mushrooms: { key: 'glowPurple', dy: 9, lo: 0.25, hi: 0.7, ms: 1400 },
  oven: { key: 'glow', dy: 12, lo: 0.35, hi: 0.7, ms: 450 },
  neonInn: { key: 'glowPink', dy: 8, lo: 0.55, hi: 0.95, ms: 900 },
  shrine: { key: 'glow', dy: 9, lo: 0.25, hi: 0.5, ms: 700 },
  forge: { key: 'glow', dy: 11, lo: 0.45, hi: 0.85, ms: 500 },
  wisp: { key: 'glow', dy: 7, lo: 0.2, hi: 0.6, ms: 1300 },
};

/** Draws the current area and turns clicks into object selection. */
export class MapScene extends Phaser.Scene {
  private layer!: Phaser.GameObjects.Container;
  private player!: Phaser.GameObjects.Image;
  /** Your party (Nyx, Grukk, Halden), trailing behind you. */
  private followers: Phaser.GameObjects.Image[] = [];
  /** Tiles you just walked through, most recent first. */
  private trail: { x: number; y: number }[] = [];
  private highlight!: Phaser.GameObjects.Rectangle;
  private drawnArea: string | null = null;
  /** Repeating timers for idle animations in the current room. */
  private idleTimers: Phaser.Time.TimerEvent[] = [];

  constructor(private ctl: Controller) {
    super('map');
  }

  create(): void {
    makeTextures(this);
    this.layer = this.add.container(0, 0);
    this.highlight = this.add.rectangle(0, 0, T, T).setStrokeStyle(1, 0xf7dc6f).setOrigin(0).setVisible(false);
    this.followers = ['char-priya', 'char-dan', 'char-jo'].map((k) => this.add.image(0, 0, k).setOrigin(0));
    this.player = this.add.image(0, 0, 'player').setOrigin(0);

    this.ctl.on('area', () => this.draw());
    this.ctl.on('move', () => this.walk());
    this.ctl.on('change', () => this.refresh());
    // Clicking empty floor walks there (and closes any dialog).
    this.input.on('pointerdown', (p: Phaser.Input.Pointer, over: Phaser.GameObjects.GameObject[]) => {
      if (!this.onCanvas(p)) return;
      if (over.length === 0) this.ctl.walkTo(Math.floor(p.worldX / T), Math.floor(p.worldY / T));
    });
    this.draw();
    // The sidebar shows sprites too, and they only exist from now on.
    this.ctl.refresh();
  }

  private draw(): void {
    const s = this.ctl.session;
    this.clearIdle();
    this.layer.removeAll(true);
    this.drawnArea = s?.area ?? null;
    if (!s) {
      this.player.setVisible(false);
      this.followers.forEach((f) => f.setVisible(false));
      this.highlight.setVisible(false);
      return;
    }

    const area = AREAS[s.area];
    const hiddenAt = new Set(this.ctl.visibleObjects(s.area).filter((o) => o.hidden).map((o) => `${o.x},${o.y}`));
    area.tiles.forEach((row, y) => {
      [...row].forEach((ch, x) => {
        const base = ch === '#' ? area.wall ?? 'wall'
          : ch === 'c' ? area.alt ?? 'plankLight'
          : ch === '.' ? area.floor
          : area.chars?.[ch] ?? area.wall ?? 'wall';
        this.layer.add(this.add.image(x * T, y * T, this.tileKey(base, x, y, hiddenAt.has(`${x},${y}`))).setOrigin(0));
      });
    });

    this.drawnAwake = this.awakeKey();
    this.drawnObjects = this.objectsKey();
    for (const obj of this.ctl.visibleObjects(s.area)) {
      // Hidden spots with no sprite are just an invisible clickable tile.
      // Someone you've woken gets their awake sprite (eyes open, no Z).
      const awakeKey = `${obj.sprite}Awake`;
      const key = obj.sprite && this.ctl.isAwake(obj.id) && this.textures.exists(awakeKey) ? awakeKey : obj.sprite;
      const img = key
        ? this.add.image(obj.x * T, obj.y * T, key).setOrigin(0)
        : this.add.zone(obj.x * T, obj.y * T, T, T).setOrigin(0);
      this.layer.add(img);
      if (obj.sprite === 'fireplace') {
        const flame = this.add.image(obj.x * T, obj.y * T, 'flame').setOrigin(0);
        this.layer.add(flame);
        this.tweens.add({ targets: flame, alpha: 0.55, duration: 380, yoyo: true, repeat: -1 });
      }
      if (img instanceof Phaser.GameObjects.Image) this.idle(obj, img, this.ctl.isAwake(obj.id));
      if (this.ctl.clickable(obj)) {
        // Hidden spots give no hint: no hand cursor, no highlight.
        img.setInteractive({ useHandCursor: !obj.hidden });
        if (!obj.hidden && img instanceof Phaser.GameObjects.Image) {
          img.on('pointerover', (p: Phaser.Input.Pointer) => this.onCanvas(p) && img.setTint(0xfff3b0));
          img.on('pointerout', () => img.clearTint());
        }
        img.on('pointerdown', (p: Phaser.Input.Pointer) => this.onCanvas(p) && this.ctl.select(obj.id));
      }
    }

    this.player.setVisible(true);
    this.followers.forEach((f) => {
      f.setVisible(true);
      this.children.bringToTop(f);
    });
    this.children.bringToTop(this.highlight);
    this.children.bringToTop(this.player);
    this.placePlayer();
    this.refresh();
  }

  private clearIdle(): void {
    this.tweens.killTweensOf(this.layer.list);
    this.idleTimers.forEach((t) => t.remove());
    this.idleTimers = [];
  }

  /** Small looping animations that make the room feel alive. */
  private idle(obj: ObjectDef, img: Phaser.GameObjects.Image, awake: boolean): void {
    if (settings.reduceMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const x0 = obj.x * T;
    const y0 = obj.y * T;
    const rnd = (a: number, b: number) => a + Math.random() * (b - a);
    const k = obj.sprite;

    // People breathe: a slow one-pixel bob, each at their own pace.
    if (IDLE_PEOPLE.has(k)) {
      this.tweens.add({ targets: img, y: y0 - 1, duration: rnd(1100, 1700), delay: rnd(0, 900), yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }
    // Exit arrows pulse gently, nudging toward the way out.
    if (k.startsWith('exit') && k.length > 4) {
      const dir = k.slice(4);
      const dx = dir === 'Right' ? 1 : dir === 'Left' ? -1 : 0;
      const dy = dir === 'Down' ? 1 : dir === 'Up' ? -1 : 0;
      img.setAlpha(0.85);
      this.tweens.add({ targets: img, alpha: 0.45, x: x0 + dx, y: y0 + dy, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }
    // The mill wheel turns.
    if (k === 'millWheel') {
      img.setOrigin(0.5).setPosition(x0 + 8, y0 + 8);
      this.tweens.add({ targets: img, angle: 360, duration: 7000, repeat: -1 });
    }
    // The moth swarm never sits still.
    if (k === 'mothSwarm') {
      this.tweens.add({ targets: img, x: x0 + 1, duration: 140, yoyo: true, repeat: -1, ease: 'Stepped' });
      this.tweens.add({ targets: img, y: y0 - 1, alpha: 0.75, duration: 230, yoyo: true, repeat: -1, ease: 'Stepped' });
    }
    // Sleepers drift little z's up from their heads (until you wake them).
    if (k.startsWith('sleeper') && !awake) {
      this.every(rnd(1800, 2600), () => {
        const z = this.add.image(x0 + 11, y0 + 1, 'zz').setOrigin(0);
        this.layer.add(z);
        this.tweens.add({ targets: z, x: x0 + 14, y: y0 - 7, alpha: 0, duration: 1600, onComplete: () => z.destroy() });
      });
    }
    // Flames and glowing things flicker.
    const glow = IDLE_GLOWS[k];
    if (glow) {
      const g = this.add.image(x0 + 8, y0 + glow.dy, glow.key).setBlendMode(Phaser.BlendModes.ADD).setAlpha(glow.lo);
      this.layer.add(g);
      this.tweens.add({ targets: g, alpha: glow.hi, duration: rnd(glow.ms * 0.7, glow.ms * 1.3), yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }
    if (k === 'well' || k === 'fountain') {
      const sp = this.add.image(x0, y0, 'sparkle').setOrigin(0).setAlpha(0);
      this.layer.add(sp);
      this.every(rnd(1400, 2400), () => {
        sp.setPosition(x0 + rnd(-4, 3), y0 + rnd(2, 4));
        this.tweens.add({ targets: sp, alpha: 1, duration: 220, yoyo: true });
      });
    }
    if (k === 'moth') {
      img.setOrigin(0.5).setPosition(x0 + 8, y0 + 8);
      this.tweens.add({ targets: img, scaleX: 0.8, duration: 650, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }
    if (k === 'cat') {
      img.setOrigin(0.5, 1).setPosition(x0 + 8, y0 + 16);
      this.tweens.add({ targets: img, scaleY: 1.07, duration: 1700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }
    if (k === 'rat') this.every(rnd(1500, 3500), () => img.toggleFlipX());
    // The chapel's stained glass glows softly.
    if (k === 'chapelFront') {
      for (const [dx, dy] of [[25, 49], [87, 49], [56, 36]]) {
        const g = this.add.image(x0 + dx, y0 + dy, 'glow').setBlendMode(Phaser.BlendModes.ADD).setAlpha(0.3).setScale(0.7);
        this.layer.add(g);
        this.tweens.add({ targets: g, alpha: 0.55, duration: rnd(1400, 2000), yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      }
    }
    // The neon sign stutters now and then, like neon does.
    if (k === 'neonInn') {
      this.every(rnd(2500, 4500), () => {
        this.tweens.add({ targets: img, alpha: 0.35, duration: 60, yoyo: true, repeat: Math.random() < 0.5 ? 1 : 2 });
      });
    }
    if (k === 'rope') {
      img.setOrigin(0.5, 0).setPosition(x0 + 8, y0).setAngle(-4);
      this.tweens.add({ targets: img, angle: 4, duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }
    if (k === 'tree') {
      img.setOrigin(0.5, 1).setPosition(x0 + 8, y0 + 16).setAngle(-1.5);
      this.tweens.add({ targets: img, angle: 1.5, duration: rnd(2200, 2800), yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }
  }

  /** A repeating timer that's cleaned up when the room is redrawn. */
  private every(ms: number, fn: () => void): void {
    this.idleTimers.push(this.time.addEvent({ delay: ms, loop: true, callback: fn }));
  }

  /**
   * Pick a tile texture. Hidden spots get their subtle "clue" tile. Elsewhere
   * about one tile in five gets a variant, in a fixed pattern per position.
   */
  private tileKey(base: string, x: number, y: number, hidden: boolean): string {
    if (hidden && this.textures.exists(`${base}Clue`)) return `${base}Clue`;
    const { count: n, rate } = tileVariants(base);
    if (!n) return base;
    // Integer hash so the scatter looks random but stays the same every visit.
    let h = Math.imul(x + 1, 374761393) + Math.imul(y + 1, 668265263) + base.length * 2246822519;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    h ^= h >>> 16;
    const roll = (h >>> 0) % 10;
    return roll < rate ? `${base}${(roll % n) + 1}` : base;
  }

  /** Redraw if objects appeared or vanished (e.g. Fen storms off). */
  /** Which objects are showing, so the map redraws when one appears, goes or swaps. */
  private drawnObjects = '';
  private objectsKey(): string {
    const s = this.ctl.session;
    return s ? this.ctl.visibleObjects(s.area).map((o) => o.id).join() : '';
  }

  /** Who's been woken tonight, so the map can redraw when that changes. */
  private drawnAwake = '';
  private awakeKey(): string {
    return [...(this.ctl.session?.flags ?? [])].filter((f) => f.startsWith('awake:')).sort().join();
  }

  private refresh(): void {
    const s = this.ctl.session;
    if (!s) return;
    if (s.area !== this.drawnArea) return this.draw();
    if (this.awakeKey() !== this.drawnAwake) return this.draw();
    if (this.objectsKey() !== this.drawnObjects) return this.draw();

    const id = s.dialog?.objectId ?? s.walk?.objectId;
    const sel = id ? this.ctl.visibleObjects(s.area).find((o) => o.id === id && !o.hidden) : undefined;
    this.highlight.setVisible(!!sel);
    if (sel) this.highlight.setPosition(sel.x * T, sel.y * T);
  }

  /**
   * The dialog, toasts and overlays sit on top of the canvas. Phaser still
   * hears clicks on them, so only act on events that hit the canvas itself.
   */
  private onCanvas(p: Phaser.Input.Pointer): boolean {
    return p.event?.target === this.game.canvas;
  }

  /** Snap the player to their tile (new area or new session); the party gathers nearby. */
  private placePlayer(): void {
    const s = this.ctl.session;
    if (!s) return;
    this.tweens.killTweensOf(this.player);
    this.player.setPosition(s.pos.x * T, s.pos.y * T);
    this.trail = this.ctl.nearbyFloor(this.followers.length);
    this.followers.forEach((f, i) => {
      this.tweens.killTweensOf(f);
      const t = this.trail[i] ?? s.pos;
      f.setPosition(t.x * T, t.y * T);
    });
  }

  /** Move each party member to their spot in the trail. */
  private moveFollowers(duration: number): void {
    this.followers.forEach((f, i) => {
      const t = this.trail[i];
      if (!t) return;
      this.tweens.killTweensOf(f);
      if (t.x * T !== f.x) f.setFlipX(t.x * T < f.x);
      if (duration === 0) f.setPosition(t.x * T, t.y * T);
      else this.tweens.add({ targets: f, x: t.x * T, y: t.y * T, duration });
    });
  }

  /**
   * Walk the current path one tile at a time. If a new walk replaces this
   * one mid-way, this one quietly stops and the new one carries on from
   * wherever the sprite is.
   */
  private walk(): void {
    const w = this.ctl.session?.walk;
    this.tweens.killTweensOf(this.player);
    if (!w) return;
    const stepMs = walkStepMs();
    if (stepMs === 0) {
      // Instant walking: jump to the end of the path.
      const end = w.path[w.path.length - 1];
      if (end) {
        // The party lands on the last few tiles of the path behind you.
        const behind = [this.ctl.session!.pos, ...w.path.slice(0, -1)].reverse();
        this.trail = [...behind, ...this.trail].slice(0, this.followers.length);
        this.player.setPosition(end.x * T, end.y * T);
        this.ctl.stepTo(end);
        this.moveFollowers(0);
      }
      this.ctl.arrive(w);
      return;
    }
    const steps = [...w.path];
    const next = (): void => {
      if (this.ctl.session?.walk !== w) return;
      const t = steps.shift();
      if (!t) return this.ctl.arrive(w);
      if (t.x * T !== this.player.x) this.player.setFlipX(t.x * T < this.player.x);
      // Everyone shuffles up one place behind you.
      const from = this.ctl.session!.pos;
      this.trail = [{ x: from.x, y: from.y }, ...this.trail].slice(0, this.followers.length);
      this.moveFollowers(stepMs);
      this.tweens.add({
        targets: this.player,
        x: t.x * T,
        y: t.y * T,
        duration: stepMs,
        onComplete: () => {
          this.ctl.stepTo(t);
          next();
        },
      });
    };
    next();
  }
}
