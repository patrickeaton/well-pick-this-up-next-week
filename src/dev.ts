/**
 * Console shortcuts for testing quests (dev builds only). Type `dev.help()`
 * in the browser console. Nothing here is reachable in a production build.
 */
import type { Controller } from './game/controller';
import type { AreaId, Ctx } from './game/types';
import { AREAS, PAGES } from './content/campaign';
import { FRIEND_ORDER } from './content/cast';
import { audioState, unlock } from './audio/audio';

/** Where you arrive when you jump to an area. */
const ARRIVE: Record<AreaId, [number, number]> = {
  inn: [2, 2], cellar: [5, 2], mill: [8, 7], square: [3, 3], street: [10, 9], pond: [1, 5],
  bakery: [8, 7], guardhouse: [8, 7], hall: [8, 8], road: [16, 5], chapel: [8, 9],
  graveyard: [10, 9], gate: [4, 1], yard: [1, 5], market: [1, 5], smithy: [8, 7],
  apothecary: [8, 7], close: [1, 5], tower: [8, 9], stairs: [8, 9], belfry: [8, 9],
};

export function installDev(ctl: Controller): void {
  // Reach into the controller's internals: fine for a test helper.
  const inner = ctl as unknown as {
    ctx(first: boolean): Ctx;
    emit(evt: string): void;
    pendingRoll: unknown;
  };
  const session = () => {
    if (!ctl.session || ctl.session.ended) {
      ctl.toCupboard();
      ctl.startSession([ctl.pantry().items[0]]);
    }
    return ctl.session!;
  };
  const changed = () => inner.emit('change');

  const dev = {
    help() {
      console.log(`dev.start()            start a fresh session (with the first pantry item)
dev.go('pond')          jump to an area (also: dev.go('stairs', 8, 2))
dev.give('towerKey')    set flags (any number of them)
dev.take('salts')       clear flags
dev.flags()             list tonight's flags
dev.page('almanac')     add a page to your binder (dev.pages() for all of them)
dev.roll(20)            answer the dice prompt with this number
dev.energy(100)         set everyone's energy
dev.time()              the clock, in minutes since 7:00 PM
dev.audio()             what the music is doing right now
dev.reset()             wipe the save (pages, rolls, friends, achievements)
Areas: ${Object.keys(AREAS).join(', ')}`);
    },
    start() {
      ctl.toCupboard();
      ctl.startSession([ctl.pantry().items[0]]);
      return 'session ' + ctl.session!.number;
    },
    go(area: AreaId, x?: number, y?: number) {
      session();
      const [ax, ay] = ARRIVE[area];
      inner.ctx(false).goTo(area, x ?? ax, y ?? ay);
      changed();
      return AREAS[area].name;
    },
    give(...flags: string[]) {
      const s = session();
      for (const f of flags) s.flags.add(f);
      changed();
      return [...s.flags];
    },
    take(...flags: string[]) {
      const s = session();
      for (const f of flags) s.flags.delete(f);
      changed();
      return [...s.flags];
    },
    flags: () => [...session().flags],
    page(id: string) {
      session();
      inner.ctx(false).givePage(id);
      changed();
      return ctl.knowledge.pages;
    },
    pages() {
      session();
      for (const p of PAGES) if (!ctl.knowledge.pages.includes(p.id)) inner.ctx(false).givePage(p.id);
      changed();
      return ctl.knowledge.pages;
    },
    roll(n: number) {
      if (!inner.pendingRoll) return 'No roll waiting. Pick a roll action first.';
      ctl.resolveRoll(n);
      const log = ctl.session?.log ?? [];
      return log[log.length - 1]?.text;
    },
    energy(n: number) {
      const s = session();
      for (const id of FRIEND_ORDER) s.energy[id] = n;
      changed();
      return s.energy;
    },
    time: () => session().minutes,
    /** What the music is doing (and start the audio, as a click would). */
    audio() {
      unlock();
      return audioState();
    },
    reset() {
      ctl.resetCampaign();
      return 'Save wiped.';
    },
  };
  Object.assign(window, { dev });
  console.log('Dev shortcuts ready: type dev.help()');
}
