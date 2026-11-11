import Phaser from 'phaser';
import { Controller } from './game/controller';
import { MapScene } from './scenes/MapScene';
import { mountUI } from './ui/ui';
import { playMusic, playSfx, setPaused, unlock } from './audio/audio';
import type { TrackId } from './audio/tracks';
import type { AreaId } from './game/types';
import './style.css';

const ctl = new Controller();

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: 18 * 16,
  height: 11 * 16,
  pixelArt: true,
  backgroundColor: '#0d0a0e',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [new MapScene(ctl)],
});

/** Sprite images for the dialog nameplate, taken from the game's textures. */
const spriteCache = new Map<string, string>();
function spriteUrl(key: string): string {
  if (!spriteCache.has(key)) {
    if (!game.textures.exists(key)) return '';
    spriteCache.set(key, game.textures.getBase64(key) as string);
  }
  return spriteCache.get(key)!;
}

mountUI(ctl, spriteUrl);

// ── Music: one track per kind of place, the title theme between sessions.
const AREA_TRACK: Record<AreaId, TrackId> = {
  inn: 'inn', mill: 'inn', bakery: 'inn', guardhouse: 'inn', hall: 'inn', smithy: 'inn', apothecary: 'inn',
  cellar: 'cellar',
  square: 'town', street: 'town', pond: 'town', road: 'town', gate: 'town', yard: 'town', market: 'town',
  chapel: 'chapel', graveyard: 'chapel',
  close: 'tower', tower: 'tower', stairs: 'tower',
  belfry: 'boss',
};
let heardLines = 0;
function syncAudio(): void {
  const s = ctl.session;
  const inGame = ctl.phase === 'playing' && s && !s.ended;
  playMusic(inGame ? AREA_TRACK[s.area] : 'title');
  // A chime for each new page or achievement.
  if (!s) return;
  if (s.log.length < heardLines) heardLines = 0;
  for (const l of s.log.slice(heardLines)) {
    if (l.icon === 'description') playSfx('page');
    else if (l.icon === 'emoji_events') playSfx('achieve');
  }
  heardLines = s.log.length;
}
ctl.on('change', syncAudio);
ctl.on('area', syncAudio);
syncAudio();
// Browsers only allow sound after a click or key press.
for (const evt of ['pointerdown', 'keydown'] as const) document.addEventListener(evt, unlock, { capture: true });
document.addEventListener('visibilitychange', () => setPaused(document.hidden));

// The map's box changes size with the layout (rotating a phone, the table
// moving beside or below it), not just with the window: keep the canvas fitted.
new ResizeObserver(() => game.scale.refresh()).observe(document.getElementById('game')!);

// Handy for poking at state from the browser console during development.
if (import.meta.env.DEV) {
  Object.assign(window, { ctl, game });
  void import('./dev').then(({ installDev }) => installDev(ctl));
}
