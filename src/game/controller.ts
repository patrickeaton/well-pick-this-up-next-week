import { AMULET_CHARGES, AREAS, CHECKS, ENDINGS, MISSION, OBJECTS, PAGES, START } from '../content/campaign';
import {
  ANNOY_LINES,
  CATEGORY_SHORT,
  FRIENDS,
  FRIEND_ORDER,
  GRUMBLES,
  ITEMS,
  PATIENCE_PER_LOOK,
  REPEAT_LINES,
  restlessDrain,
  stockPantry,
  tasteOf,
  type Category,
  type ItemDef,
  type Taste,
  energyFor,
  partakes,
  CATEGORIES,
  STYLE_ENERGY,
  STYLE_SHORT,
  styleOf,
  type Style,
  FRIENDSHIP_GAINS,
  MAX_HEARTS,
  POINTS_PER_HEART,
  RALLY_ENERGY,
  RALLY_HEARTS,
  REVEAL_AT_HEARTS,
  SNACK_BREAK_AT,
  SNACK_BREAK_GAP,
  STAMINA_PER_HEART,
  heartsFor,
  withArticle,
} from '../content/cast';
import { ACHIEVEMENTS } from '../content/achievements';
import { DIRS, search, type Grid, type Tile } from './path';
import { bandFor, knownSegments, type Segment } from './rolls';
import { clearKnowledge, freshKnowledge, loadKnowledge, saveKnowledge, type Knowledge } from './save';
import type { ActionDef, AreaId, Band, Ctx, EndingId, FriendId, ItemId, ObjectDef, Speaker } from './types';

export type Phase = 'title' | 'cupboard' | 'playing' | 'ending' | 'won';

export interface LogLine {
  who: Speaker;
  text: string;
  /** Minutes since 7:00 PM when it happened. */
  at: number;
  /** Optional Material Symbols icon shown before the line. */
  icon?: string;
}

/**
 * The open dialog box. It shows every log line since `from`, plus the
 * object's actions. objectId is null for pure narration (session intro,
 * walking down the stairs).
 */
export interface Dialog {
  objectId: string | null;
  from: number;
}

export interface Session {
  number: number;
  /** Minutes since 7:00 PM. */
  minutes: number;
  energy: Record<FriendId, number>;
  /** One-off energy loss at a set minute (caffeine crash). */
  crashes: { friend: FriendId; at: number; amount: number; label: string }[];
  /** Extra drain per minute during a window (food coma, drowsiness). */
  drains: { friend: FriendId; from: number; until: number; perMin: number; label?: string }[];
  /** Sugar: minute until which each friend is extra chatty. */
  chatty: Partial<Record<FriendId, number>>;
  /** The previous action and what it said, to catch quick repeats. */
  last: { key: string; text: string; /** Index of the last repeat reply used. */ repeats: number } | null;
  items: ItemId[];
  flags: Set<string>;
  area: AreaId;
  pos: { x: number; y: number };
  actionsTaken: number;
  /** Look actions taken this session; drives table annoyance. */
  looks: number;
  amulet: { held: boolean; charges: number };
  log: LogLine[];
  dialog: Dialog | null;
  /** Where the player is walking, and what to open on arrival. */
  walk: Walk | null;
  ended: boolean;
  yawned: Set<FriendId>;
  /** Friendship earned tonight, counted when the night ends. */
  friendGain: Record<FriendId, number>;
  /** How many times tonight each friend's play-style likes/dislikes counted. */
  styleCount: Record<string, number>;
  /** Friend+style reactions already said out loud tonight. */
  styleSaid: Set<string>;
  /** Places visited tonight (finding a new one counts as exploring). */
  visitedTonight: Set<AreaId>;
  /** Tiles walked since the clock last ticked for walking. */
  walkSteps: number;
  /** Friends who already rallied once tonight. */
  rallied: Set<FriendId>;
  /** Who brought each item (null = you). Items come out in this order. */
  broughtBy: Record<ItemId, FriendId | null>;
  /** Minute of the last snack break. */
  lastSnack: number;
}

/** How a friend's friendship changed over one night. */
export interface FriendshipChange {
  friend: FriendId;
  gain: number;
  heartsBefore: number;
  heartsAfter: number;
  /** A taste they let slip during the week, if they reached a reveal heart. */
  revealed?: { category: Category; taste: Taste };
}

export interface Walk {
  path: Tile[];
  objectId: string | null;
}

export interface PendingRoll {
  objectId: string;
  actionId: string;
  first: boolean;
}

type Listener = () => void;
type EventName = 'change' | 'area' | 'move';


/** Walking this many tiles takes one minute of game time. */
const WALK_TILES_PER_MINUTE = 5;
export class Controller {
  knowledge: Knowledge = loadKnowledge();
  phase: Phase = 'title';
  session: Session | null = null;
  pendingRoll: PendingRoll | null = null;
  endReason = '';
  /** Friendship changes from the night that just ended. */
  lastFriendship: FriendshipChange[] = [];
  /** The ending just reached, for the ending screen. */
  ending: { id: EndingId; lines: string[]; newPage: string | null; firstTime: boolean } | null = null;
  /** Set after an ending, so the next session's intro knows it's a rerun. */
  private justFinished = false;

  private listeners = new Map<EventName, Set<Listener>>();

  on(evt: EventName, fn: Listener): void {
    if (!this.listeners.has(evt)) this.listeners.set(evt, new Set());
    this.listeners.get(evt)!.add(fn);
  }

  private emit(evt: EventName): void {
    this.listeners.get(evt)?.forEach((fn) => fn());
  }

  /** Ask everything to redraw (e.g. once the sprites have been made). */
  refresh(): void {
    this.emit('change');
  }

  get sessionNumber(): number {
    return this.knowledge.sessionsPlayed + 1;
  }

  // ── Phases ────────────────────────────────────────────────

  toCupboard(): void {
    this.phase = 'cupboard';
    this.emit('change');
  }

  /** This week's cupboard. Same seed for the same week, so reloads don't reshuffle it. */
  pantry(): { items: ItemId[]; spoiled: ItemId[] } {
    const k = this.knowledge;
    return stockPantry(k.sessionsPlayed * 7919 + k.weeksPassed * 31 + 17, k.lastGap);
  }

  startSession(items: ItemId[]): void {
    const energy = {} as Record<FriendId, number>;
    FRIEND_ORDER.forEach((id) => (energy[id] = 100));
    this.session = {
      number: this.sessionNumber,
      minutes: 0,
      energy,
      crashes: [],
      drains: [],
      chatty: {},
      last: null,
      items: [...items],
      flags: new Set(),
      area: START.area,
      pos: { x: START.x, y: START.y },
      actionsTaken: 0,
      looks: 0,
      amulet: { held: false, charges: 0 },
      log: [],
      dialog: { objectId: null, from: 0 },
      walk: null,
      ended: false,
      yawned: new Set(),
      friendGain: { marcus: 0, priya: 0, dan: 0, jo: 0 },
      styleCount: {},
      styleSaid: new Set(),
      visitedTonight: new Set([START.area]),
      walkSteps: 0,
      rallied: new Set(),
      broughtBy: Object.fromEntries(items.map((i) => [i, null])),
      lastSnack: -Infinity,
    };
    this.friendsBringSnacks();
    this.pendingRoll = null;
    this.phase = 'playing';
    this.discover(START.area);

    const gap = this.knowledge.lastGap;
    if (this.knowledge.sessionsPlayed === 0) {
      this.log('Okay! Welcome to my campaign. Snacks on the table, phones away. Priya.', 'dm');
    } else if (this.justFinished) {
      this.justFinished = false;
      this.log(`It's been ${gap} weeks. Marcus: "Okay. Hear me out. I want to run it again. Same campaign. I have NOTES."`, 'dm');
      this.log("Again? …Fine. I'm bringing the good snacks this time.", 'priya');
    } else {
      this.log(`Okay, sorry, I know it's been ${gap} weeks. So, last time we… huh. Does anybody remember last session?`, 'dm');
      this.log('Nope.', 'dan');
      this.log('Cool. Great. Love that. From the top, then.', 'dm');
    }
    this.log('You\'re a wandering bard, travelling with Nyx the rogue, Grukk the barbarian and Halden the cleric. You wake up in a creaky bed at the Rusty Lantern Inn. Outside, the whole town of Harrowmere has fallen into a strange, deep sleep.', 'dm');
    this.log(MISSION, 'system');
    this.emit('area');
    this.emit('change');
  }

  /**
   * The very first game night is a cold open: four hours in, the party has
   * just reached the Night Warden at the top of the bell tower… and the table
   * gives up. The real game starts next week, and nobody remembers a thing.
   */
  startPrologue(): void {
    this.startSession([]);
    const s = this.session!;
    s.area = 'belfry';
    s.pos = { x: 8, y: 7 };
    s.minutes = 292; // 11:52 PM
    s.energy = { marcus: 34, priya: 14, dan: 4, jo: 21 };
    s.flags.add('prologue');
    s.visitedTonight = new Set(['belfry']);
    s.log = [];
    this.log("Okay. It's 11:52, we're four hours in, and you have FINALLY fought your way to the top of the bell tower.", 'dm');
    this.log('Above you, the Night Warden stirs and spreads its wings. Every eye on them opens at once.', 'dm');
    this.log('Oh no.', 'jo');
    this.log('Roll for initiative!', 'dm');
    s.dialog = { objectId: 'warden', from: 0 };
    this.emit('area');
    this.emit('change');
  }

  /**
   * Call it a night early. It ends like any other night: nothing from
   * tonight counts, and next week starts from the inn again.
   */
  callItANight(): void {
    const s = this.session;
    if (!s || s.ended || this.phase !== 'playing' || this.pendingRoll) return;
    this.log('You stretch, yawn, and call it for the night.', 'you');
    this.endSession('You call it early. Everyone packs up their dice, secretly a little relieved.');
  }

  resetCampaign(): void {
    clearKnowledge();
    this.knowledge = freshKnowledge();
    this.session = null;
    this.pendingRoll = null;
    this.phase = 'title';
    this.emit('change');
  }

  // ── Friendship ────────────────────────────────────────────

  friendPoints(id: FriendId): number {
    return this.knowledge.friendship[id] ?? FRIENDS[id].startFriendship;
  }

  hearts(id: FriendId): number {
    return heartsFor(this.friendPoints(id));
  }

  /** Friends at full hearts who will bring a snack of their own. */
  bringers(): FriendId[] {
    return FRIEND_ORDER.filter((id) => this.hearts(id) >= MAX_HEARTS);
  }

  /** Sleepy dust in this area drains the table on every action (unless protected). */
  private breatheDust(): void {
    const s = this.session!;
    const dust = AREAS[s.area].dust;
    if (!dust || s.ended || s.flags.has(dust.protectedBy)) return;
    for (const id of FRIEND_ORDER) s.energy[id] = Math.max(0, s.energy[id] - dust.drain);
    this.log(`The moth dust gets everywhere. Everyone at the table yawns (−${dust.drain} energy).`, 'system', 'bedtime');
  }

  /** What you know about how a friend likes to play (from the start, or seen). */
  knownStyle(id: FriendId, style: Style): 'like' | 'dislike' | 'neutral' | null {
    if (FRIENDS[id].play.knownFromStart.includes(style)) return styleOf(id, style);
    return this.knowledge.styles[id]?.[style] ?? null;
  }

  /**
   * You just played a certain way. Friends who love it gain friendship and a
   * little energy; friends who hate it lose a little. Each counts a few
   * times a night, and they say something the first time.
   */
  private playStyle(style: Style): void {
    const s = this.session;
    if (!s || s.ended) return;
    for (const id of FRIEND_ORDER) {
      const pref = styleOf(id, style);
      this.learnStyle(id, style, pref);
      if (pref === 'neutral') continue;
      const key = `${id}:${pref}`;
      if ((s.styleCount[key] ?? 0) >= FRIENDSHIP_GAINS.stylePerNight) continue;
      s.styleCount[key] = (s.styleCount[key] ?? 0) + 1;
      const liked = pref === 'like';
      this.befriend(id, liked ? FRIENDSHIP_GAINS.styleLiked : FRIENDSHIP_GAINS.styleDisliked);
      s.energy[id] = Math.max(0, Math.min(100, s.energy[id] + (liked ? STYLE_ENERGY : -STYLE_ENERGY)));
      const said = `${id}:${style}`;
      const line = FRIENDS[id].play.lines[style];
      if (line && !s.styleSaid.has(said)) {
        s.styleSaid.add(said);
        this.log(line, id);
      }
    }
  }

  /** Record a play-style feeling in the binder the first time you see it. */
  private learnStyle(id: FriendId, style: Style, pref: 'like' | 'dislike' | 'neutral'): void {
    if (this.knownStyle(id, style)) return;
    (this.knowledge.styles[id] ??= {})[style] = pref;
    saveKnowledge(this.knowledge);
    if (pref === 'neutral') return;
    this.log(`Noted in your binder: ${FRIENDS[id].name} ${pref === 'like' ? 'loves' : "doesn't like"} ${STYLE_SHORT[style]}.`, 'system', 'menu_book');
  }

  private befriend(id: FriendId, points: number): void {
    const s = this.session;
    if (s && !s.ended) s.friendGain[id] += points;
  }

  /** Maxed-out friends show up with a snack, usually one they love. */
  private friendsBringSnacks(): void {
    const s = this.session!;
    for (const id of this.bringers()) {
      const all = Object.values(ITEMS).filter((d) => !(d.id in s.broughtBy));
      const loved = all.filter((d) => tasteOf(id, d.category) === 'like');
      const from = loved.length ? loved : all;
      const d = from[Math.floor(Math.random() * from.length)];
      if (!d) continue;
      s.items.push(d.id);
      s.broughtBy[d.id] = id;
    }
  }

  /**
   * Count tonight's friendship. Crossing a reveal heart means they let a
   * taste slip during the week, which goes in the binder.
   */
  private commitFriendship(): void {
    const s = this.session!;
    const cap = MAX_HEARTS * POINTS_PER_HEART;
    this.lastFriendship = FRIEND_ORDER.map((friend) => {
      const before = this.friendPoints(friend);
      // Hearts are for keeps: you can lose progress toward the next one,
      // but never a heart you've already earned.
      const floor = heartsFor(before) * POINTS_PER_HEART;
      const after = Math.max(floor, Math.min(cap, before + s.friendGain[friend]));
      this.knowledge.friendship[friend] = after;
      const change: FriendshipChange = {
        friend,
        gain: after - before,
        heartsBefore: heartsFor(before),
        heartsAfter: heartsFor(after),
      };
      const crossed = REVEAL_AT_HEARTS.some((h) => change.heartsBefore < h && change.heartsAfter >= h);
      if (crossed) {
        // Prefer something they feel strongly about.
        const unknown = CATEGORIES.filter((c) => !this.knownTaste(friend, c));
        const strong = unknown.filter((c) => tasteOf(friend, c) !== 'neutral');
        const pick = (strong.length ? strong : unknown)[0];
        if (pick) {
          (this.knowledge.tastes[friend] ??= {})[pick] = tasteOf(friend, pick);
          change.revealed = { category: pick, taste: tasteOf(friend, pick) };
        }
      }
      return change;
    });
  }

  // ── Map ───────────────────────────────────────────────────

  private readCtx(): Ctx {
    return this.ctx(this.session?.actionsTaken === 0);
  }

  visibleObjects(area: AreaId): ObjectDef[] {
    const g = this.readCtx();
    return OBJECTS.filter((o) => o.area === area && (!o.visible || o.visible(g)));
  }

  clickable(obj: ObjectDef): boolean {
    return obj.actions.length > 0 || !!obj.blurb;
  }

  /** In the current area and not hidden (e.g. Fen after storming off). */
  isHere(obj: ObjectDef): boolean {
    const s = this.session;
    return !!s && obj.area === s.area && this.visibleObjects(s.area).includes(obj);
  }

  /** Woken with smelling salts tonight (they stay up for the rest of the night). */
  isAwake(id: string): boolean {
    return !!this.session?.flags.has(`awake:${id}`);
  }

  /** The description at the top of an object's dialog. */
  describe(obj: ObjectDef): string | undefined {
    return this.isAwake(obj.id) && obj.awakeBlurb ? obj.awakeBlurb : obj.blurb;
  }

  availableActions(obj: ObjectDef): ActionDef[] {
    const g = this.readCtx();
    // In the cold open, the only thing left to do is roll initiative.
    if (this.session?.flags.has('prologue')) return obj.actions.filter((a) => a.id === 'initiative');
    return obj.actions.filter((a) => !a.when || a.when(g));
  }

  /**
   * Clicking an object walks you over to it. Clicking is free: once you
   * arrive, the dialog opens with its description.
   */
  select(objectId: string): void {
    const s = this.session;
    if (!s || s.ended || this.pendingRoll) return;
    const obj = OBJECTS.find((o) => o.id === objectId);
    if (!obj || !this.isHere(obj) || !this.clickable(obj)) return;
    s.dialog = null;
    this.startWalk({ path: this.pathNextTo(obj), objectId });
  }

  /** Click on empty floor: walk there. */
  walkTo(x: number, y: number): void {
    const s = this.session;
    if (!s || s.ended || this.pendingRoll) return;
    s.dialog = null;
    const path = this.walkable(s.area, x, y) ? search(this.grid(s.area), s.pos).pathTo({ x, y }) : null;
    if (path) this.startWalk({ path, objectId: null });
    else this.emit('change');
  }

  /** The nearest free floor tiles around the player (where the party stands). */
  nearbyFloor(count: number): Tile[] {
    const s = this.session;
    if (!s) return [];
    return search(this.grid(s.area), s.pos).order.slice(1, count + 1);
  }

  /** The map scene reports each tile the player steps onto. */
  stepTo(tile: Tile): void {
    if (this.session) this.session.pos = tile;
  }

  /** The map scene finished animating this walk. */
  arrive(walk: Walk): void {
    const s = this.session;
    if (!s || s.walk !== walk) return;
    s.walk = null;
    // Walking takes time: a minute for every few tiles.
    s.walkSteps += walk.path.length;
    const minutes = Math.floor(s.walkSteps / WALK_TILES_PER_MINUTE);
    if (minutes > 0) {
      s.walkSteps -= minutes * WALK_TILES_PER_MINUTE;
      this.advance(minutes);
      if (s.ended) return this.emit('change');
    }
    const obj = walk.objectId ? OBJECTS.find((o) => o.id === walk.objectId) : undefined;
    if (obj && this.isHere(obj)) s.dialog = { objectId: obj.id, from: s.log.length };
    this.emit('change');
  }

  private startWalk(walk: Walk): void {
    const s = this.session!;
    s.walk = walk;
    if (walk.path.length === 0) return this.arrive(walk);
    this.emit('move');
    this.emit('change');
  }

  closeDialog(): void {
    const s = this.session;
    if (!s || !s.dialog || this.pendingRoll) return;
    s.dialog = null;
    this.emit('change');
  }

  private walkable(area: AreaId, x: number, y: number): boolean {
    const ch = AREAS[area].tiles[y]?.[x];
    if (ch !== '.' && ch !== 'c') return false;
    return !this.visibleObjects(area).some((o) => o.x === x && o.y === y && !o.walkable);
  }

  private grid(area: AreaId): Grid {
    const tiles = AREAS[area].tiles;
    return {
      width: tiles[0].length,
      height: tiles.length,
      walkable: (x, y) => this.walkable(area, x, y),
    };
  }

  /**
   * Shortest walk to a free tile beside the object. If nothing beside it can
   * be reached, get as close as possible.
   */
  private pathNextTo(obj: ObjectDef): Tile[] {
    const s = this.session!;
    const found = search(this.grid(s.area), s.pos);
    const beside = (t: Tile) => DIRS.some(([dx, dy]) => t.x + dx === obj.x && t.y + dy === obj.y);
    const dist = (t: Tile) => Math.abs(t.x - obj.x) + Math.abs(t.y - obj.y);
    // The search only returns tiles you can stand on, nearest first.
    const target =
      found.order.find(beside) ?? found.order.reduce((best, t) => (dist(t) < dist(best) ? t : best));
    return found.pathTo(target) ?? [];
  }

  // ── Actions and rolls ─────────────────────────────────────

  perform(objectId: string, actionId: string): void {
    const s = this.session;
    if (!s || s.ended || this.pendingRoll) return;
    const obj = OBJECTS.find((o) => o.id === objectId);
    const action = obj?.actions.find((a) => a.id === actionId);
    if (!obj || !action || !this.isHere(obj) || !this.availableActions(obj).includes(action)) return;

    const first = s.actionsTaken === 0;
    if (action.check) {
      this.pendingRoll = { objectId, actionId, first };
      this.emit('change');
      return;
    }
    this.finish(action, first, undefined, objectId);
  }

  /** Outcomes of a check you already know, from rolls you've seen or pages. */
  knownOutcomes(checkId: string): Band[] {
    const seen = new Set(this.segmentsFor(checkId).map((seg) => seg.band).filter(Boolean));
    return CHECKS[checkId].bands.filter((b) => seen.has(b));
  }

  /**
   * Amulet, unlimited: while you hold it, you can take any path you've
   * already seen for the pending roll.
   */
  canUseAmulet(): boolean {
    const s = this.session;
    const p = this.pendingRoll;
    if (!s || !p || !s.amulet.held) return false;
    const action = OBJECTS.find((o) => o.id === p.objectId)!.actions.find((a) => a.id === p.actionId)!;
    return this.knownOutcomes(action.check!).length > 0;
  }

  /** Amulet, once a night: choose the exact number you roll. */
  canChooseRoll(): boolean {
    const s = this.session;
    return !!s && !!this.pendingRoll && s.amulet.held && s.amulet.charges > 0;
  }

  /**
   * Spend the night's charge to pick the roll. It counts as a real roll, so
   * its outcome becomes a known path for every future run.
   */
  resolveChosen(value: number): void {
    const s = this.session;
    if (!s || !this.canChooseRoll() || value < 1 || value > 20) return;
    s.amulet.charges--;
    this.achieve('loaded');
    this.log(`The groundhog amulet bends your luck. You choose a ${value}.`, 'you', 'pets');
    this.resolveRoll(value);
  }

  /** Use the amulet: skip the die and take an outcome you already know. */
  resolveRemembered(bandId: string): void {
    const s = this.session;
    const pending = this.pendingRoll;
    if (!s || !pending || !this.canUseAmulet()) return;
    const obj = OBJECTS.find((o) => o.id === pending.objectId)!;
    const action = obj.actions.find((a) => a.id === pending.actionId)!;
    const band = this.knownOutcomes(action.check!).find((b) => b.id === bandId);
    if (!band) return;
    this.achieve('deja-vu');
    this.log(`The groundhog amulet glows. You've been down this road before: ${band.label}.`, 'you', 'pets');
    this.pendingRoll = null;
    this.finish(action, pending.first, band.id, pending.objectId);
  }

  resolveRoll(value: number): void {
    const s = this.session;
    const pending = this.pendingRoll;
    if (!s || !pending) return;
    const obj = OBJECTS.find((o) => o.id === pending.objectId)!;
    const action = obj.actions.find((a) => a.id === pending.actionId)!;
    const check = CHECKS[action.check!];
    const band = bandFor(check, value);

    this.knowledge.rolls.push({ check: check.id, value, session: s.number });
    saveKnowledge(this.knowledge);
    this.log(`${check.name}: ${value} — ${band.label}`, 'you', 'casino');
    if (value === 20) this.achieve('nat20');
    if (value === 1) this.achieve('nat1');
    if (check.id === 'chest' && band.id === 'charmed') this.achieve('thirteen');
    this.pendingRoll = null;
    this.finish(action, pending.first, band.id, pending.objectId);
  }

  /**
   * Adventure paths: remember that you did this (and how it went, and what
   * it unlocked) across every session.
   */
  private notePath(objectId: string, actionId: string, outcome: string | undefined, flagsBefore: Set<string>): void {
    const s = this.session!;
    // Two-tile things (gates, doors, roads) share one id: 'closeGate2' is 'closeGate'.
    const obj = OBJECTS.find((o) => o.id === objectId);
    const base = objectId.replace(/\d$/, '');
    const id = base !== objectId && OBJECTS.some((o) => o.id === base && o.name === obj?.name) ? base : objectId;
    const keys = [`${id}:${actionId}`];
    if (outcome) keys.push(`${id}:${actionId}:${outcome}`);
    for (const f of s.flags) if (!flagsBefore.has(f)) keys.push(`${id}:${actionId}>${f}`);
    this.notePaths(keys);
  }

  private notePaths(keys: string[]): void {
    const s = this.session;
    if (!s) return;
    let added = false;
    for (const k of keys) {
      if (this.knowledge.paths[k] === undefined) {
        this.knowledge.paths[k] = s.number;
        added = true;
      }
    }
    if (added) saveKnowledge(this.knowledge);
  }

  private finish(action: ActionDef, first: boolean, outcome?: string, objectId = ''): void {
    const s = this.session!;
    const before = s.log.length;
    const flagsBefore = new Set(s.flags);
    action.run(this.ctx(first), outcome);
    this.notePath(objectId, action.id, outcome, flagsBefore);
    this.catchRepeat(`${objectId}:${action.id}`, before);
    this.breatheDust();
    if (action.talk) this.playStyle('talk');
    if (action.check) this.playStyle('roll');
    if (action.look) this.playStyle('explore');
    if (action.steal) this.playStyle('steal');
    s.actionsTaken++;
    if (action.look && !s.ended) this.annoy();
    if (!s.ended) {
      let minutes = action.minutes;
      if (action.talk && s.energy.marcus < 30) {
        minutes = Math.ceil(minutes / 2);
        if (!s.flags.has('dmSkimming')) {
          s.flags.add('dmSkimming');
          this.log('(Marcus is skimming his notes now. Conversations go faster.)', 'system');
        }
      }
      this.chatter();
      this.advance(minutes);
    }
    this.emit('change');
  }

  /**
   * Doing the exact same thing twice in a row, and getting the exact same
   * answer, gets a canned reply from the DM instead.
   */
  private catchRepeat(key: string, before: number): void {
    const s = this.session!;
    const said = s.log.slice(before);
    const text = said.map((l) => `${l.who}|${l.text}`).join('\n');
    if (said.length && s.last && s.last.key === key && s.last.text === text) {
      s.log.splice(before);
      // Any reply except the one you just got.
      const options = REPEAT_LINES.filter((_, i) => i !== s.last!.repeats);
      const pick = options[Math.floor(Math.random() * options.length)];
      this.log(pick[1], pick[0]);
      s.last.repeats = REPEAT_LINES.indexOf(pick);
      this.achieve('repeat');
    } else {
      s.last = { key, text, repeats: -1 };
    }
  }

  /** 0–100: how much more poking around the table will put up with. */
  get patience(): number {
    return Math.max(0, 100 - (this.session?.looks ?? 0) * PATIENCE_PER_LOOK);
  }

  private annoy(): void {
    const s = this.session!;
    s.looks++;
    const reaction = ANNOY_LINES.find((l) => l.at === s.looks);
    if (s.looks >= 11) this.achieve('barrel');
    const drain = restlessDrain(s.looks);
    if (reaction) {
      this.log(reaction.text, reaction.who);
    } else if (drain > 0 && Math.random() < 0.5) {
      const g = GRUMBLES[Math.floor(Math.random() * GRUMBLES.length)];
      this.log(g.text, g.who);
    }
    if (drain > 0) {
      for (const id of FRIEND_ORDER) {
        s.energy[id] = Math.max(0, s.energy[id] - drain);
        this.befriend(id, FRIENDSHIP_GAINS.restlessLook);
      }
      if (!s.flags.has('restless')) {
        s.flags.add('restless');
        this.log('(The table is getting restless. Every extra look now drains everyone\'s energy.)', 'system');
      }
    }
  }

  private chatter(): void {
    const s = this.session!;
    const chatty = FRIEND_ORDER.filter((id) => (s.chatty[id] ?? -1) > s.minutes);
    if (Math.random() > (chatty.length ? 0.6 : 0.2)) return;
    const from = chatty.length ? chatty : FRIEND_ORDER;
    const id = from[Math.floor(Math.random() * from.length)];
    const lines = FRIENDS[id].chatter;
    this.log(lines[Math.floor(Math.random() * lines.length)], id);
  }

  private advance(minutes: number): void {
    const s = this.session!;
    for (let i = 0; i < minutes; i++) {
      s.minutes++;
      for (const id of FRIEND_ORDER) {
        const stamina = 1 - STAMINA_PER_HEART * this.hearts(id);
        s.energy[id] = Math.max(0, s.energy[id] - FRIENDS[id].drain(s.minutes) * stamina);
      }
      for (const d of s.drains) {
        if (s.minutes === d.from && d.label) this.log(`${FRIENDS[d.friend].name} ${d.label}`, 'system');
        if (s.minutes >= d.from && s.minutes < d.until) {
          s.energy[d.friend] = Math.max(0, s.energy[d.friend] - d.perMin);
        }
      }
      for (const c of s.crashes.filter((c) => c.at === s.minutes)) {
        s.energy[c.friend] = Math.max(0, s.energy[c.friend] - c.amount);
        this.log(`${FRIENDS[c.friend].name} crashes hard from the ${c.label}.`, 'system');
      }
      for (const id of FRIEND_ORDER) {
        if (s.energy[id] < 30 && !s.yawned.has(id)) {
          s.yawned.add(id);
          this.log(FRIENDS[id].yawn, 'system');
        }
      }
      this.maybeSnackBreak();
      if (s.minutes === 300) this.achieve('midnight');
      for (const id of FRIEND_ORDER) {
        if (s.energy[id] <= 0 && this.hearts(id) >= RALLY_HEARTS && !s.rallied.has(id)) {
          s.rallied.add(id);
          s.energy[id] = RALLY_ENERGY;
          this.log(FRIENDS[id].rally, id);
          this.achieve('rally');
          this.log(`(${FRIENDS[id].name} rallies. Good friends stay a little longer.)`, 'system');
        }
      }
      const sleeper = FRIEND_ORDER.find((id) => s.energy[id] <= 0);
      if (sleeper) {
        this.endSession(FRIENDS[sleeper].asleep);
        return;
      }
    }
  }

  // ── Snacks ────────────────────────────────────────────────

  /**
   * Snack break: the first time anyone starts to flag, the next item comes
   * out on its own. After that, again each time someone flags, with a gap.
   */
  private maybeSnackBreak(): void {
    const s = this.session!;
    if (!s.items.length || s.minutes - s.lastSnack < SNACK_BREAK_GAP) return;
    if (!FRIEND_ORDER.some((id) => s.energy[id] < SNACK_BREAK_AT)) return;
    this.serve(s.items[0]);
  }

  /** Put an item on the table. Everyone helps themselves (or doesn't). */
  private serve(id: ItemId): void {
    const s = this.session;
    const d = ITEMS[id];
    if (!s || s.ended || !d || !s.items.includes(id)) return;
    s.items.splice(s.items.indexOf(id), 1);
    s.lastSnack = s.minutes;
    const bringer = s.broughtBy[id];
    this.log(
      bringer
        ? `Snack break! ${FRIENDS[bringer].name} brought ${withArticle(d)}.`
        : `Snack break! You put out the ${d.name.toLowerCase()}.`,
      'system',
    );

    const verbs: Record<Taste, string> = {
      like: 'digs in happily',
      neutral: 'has a little',
      dislike: "won't touch it",
      refuses: 'passes',
    };
    const parts: string[] = [];
    let enjoyed = false;
    for (const fid of FRIEND_ORDER) {
      const taste = tasteOf(fid, d.category);
      parts.push(`${FRIENDS[fid].name} ${verbs[taste]}`);
      // People who don't like it just skip it.
      if (partakes(taste)) {
        this.consume(d, fid, taste);
        enjoyed = true;
      }
      // Friendship: only for what you brought, not what friends brought.
      if (!bringer && taste === 'like') this.befriend(fid, FRIENDSHIP_GAINS.lovedItem);
      if (!bringer && taste === 'dislike') this.befriend(fid, FRIENDSHIP_GAINS.dislikedItem);
    }
    this.log(`${parts.join('. ')}.`, 'system');
    if (enjoyed && d.calm) this.calm(d.calm);
    if (d.homemade && tasteOf('marcus', d.category) !== 'dislike') this.bribe();
    for (const fid of FRIEND_ORDER) this.learn(fid, d.category, tasteOf(fid, d.category));
  }

  /** Energy and side effects of one person eating or drinking something. */
  private consume(d: ItemDef, who: FriendId, taste: Taste): void {
    const s = this.session!;
    s.energy[who] = Math.min(100, s.energy[who] + energyFor(d, taste));
    const now = s.minutes;
    if (d.crash) s.crashes.push({ friend: who, at: now + 60, amount: d.crash, label: d.name.toLowerCase() });
    if (d.coma) s.drains.push({ friend: who, from: now + 60, until: now + 105, perMin: 0.3, label: 'is sinking into a food coma.' });
    if (d.drowsy) s.drains.push({ friend: who, from: now, until: Infinity, perMin: 0.06 });
    if (d.chatty) s.chatty[who] = now + 60;
  }

  /** Alcohol loosens the table up: it forgives a few looks. */
  private calm(looks: number): void {
    const s = this.session!;
    if (s.looks === 0) return;
    s.looks = Math.max(0, s.looks - looks);
    if (restlessDrain(s.looks) === 0) s.flags.delete('restless');
    this.log('(The table loosens up. Some patience comes back.)', 'system');
  }

  private bribe(): void {
    if (!this.knowledge.pages.includes('dmNotes')) {
      this.log('Marcus takes one. Then two. "…Fine. You can peek at ONE page of my notes."', 'dm');
      this.givePage('dmNotes');
    } else {
      this.log('"Bribery noted and appreciated. No more pages, though."', 'dm');
    }
  }

  /** What you know about a friend's taste: learned in play, or known from the start. */
  knownTaste(who: FriendId, c: Category): Taste | null {
    if (FRIENDS[who].knownFromStart.includes(c)) return tasteOf(who, c);
    return this.knowledge.tastes[who]?.[c] ?? null;
  }

  /**
   * Expected energy change for each friend if you use this item, as far as
   * you know. Unknown tastes come back as null.
   */
  preview(id: ItemId): { friend: FriendId; taste: Taste | null; energy: number | null }[] {
    const d = ITEMS[id];
    return FRIEND_ORDER.map((friend) => {
      const taste = this.knownTaste(friend, d.category);
      return { friend, taste, energy: taste ? energyFor(d, taste) : null };
    });
  }

  /** Record a friend's taste in the binder the first time you see it. */
  private learn(who: FriendId, c: Category, taste: Taste): void {
    if (this.knownTaste(who, c)) return;
    const known = (this.knowledge.tastes[who] ??= {});
    known[c] = taste;
    saveKnowledge(this.knowledge);
    const verb: Record<Taste, string> = {
      like: 'loves',
      neutral: "doesn't mind",
      dislike: "doesn't like",
      refuses: "won't have",
    };
    this.log(`Noted in your binder: ${FRIENDS[who].name} ${verb[taste]} ${CATEGORY_SHORT[c]}.`, 'system', 'menu_book');
    this.checkCollections();
  }

  // ── Knowledge ─────────────────────────────────────────────

  /** A roll table is fully known once you've read the back of a page that prints it. */
  fullyRevealed(checkId: string): boolean {
    return PAGES.some((p) => this.knowledge.flipped.includes(p.id) && p.revealsTables?.includes(checkId));
  }

  /** Flip a page over in the binder. The first flip of each page is remembered. */
  flipPage(id: string): void {
    if (!this.knowledge.pages.includes(id) || this.knowledge.flipped.includes(id)) return;
    this.knowledge.flipped.push(id);
    saveKnowledge(this.knowledge);
    this.achieve('flipped');
  }

  segmentsFor(checkId: string): Segment[] {
    const values = this.knowledge.rolls.filter((r) => r.check === checkId).map((r) => r.value);
    return knownSegments(CHECKS[checkId], values, this.fullyRevealed(checkId));
  }

  private givePage(id: string): void {
    if (this.knowledge.pages.includes(id)) {
      this.log('(You already have this page in your binder.)', 'system');
      return;
    }
    this.knowledge.pages.push(id);
    saveKnowledge(this.knowledge);
    const page = PAGES.find((p) => p.id === id)!;
    this.log(`New page for your binder: "${page.title}"`, 'system', 'description');
    if (this.knowledge.pages.length === 1) {
      this.log('(Tip: pages have a back too. Click one in your binder to flip it over.)', 'system');
    }
    this.checkCollections();
    this.playStyle('lore');
  }

  // ── Achievements ──────────────────────────────────────────

  /** Unlock an achievement (once, forever) and announce it. */
  achieve(id: string): void {
    const def = ACHIEVEMENTS.find((a) => a.id === id);
    if (!def || this.knowledge.achievements.includes(id)) return;
    this.knowledge.achievements.push(id);
    saveKnowledge(this.knowledge);
    if (this.session && !this.session.ended) this.log(`Achievement unlocked: ${def.name}`, 'system', 'emoji_events');
  }

  /**
   * Learn what a number does on a roll without rolling it: it goes in the
   * binder like a roll you'd seen, so the amulet can take that path too.
   */
  private learnRoll(checkId: string, value: number): void {
    const s = this.session;
    const check = CHECKS[checkId];
    if (!s || !check) return;
    if (this.knowledge.rolls.some((r) => r.check === checkId && r.value === value)) return;
    this.knowledge.rolls.push({ check: checkId, value, session: s.number });
    saveKnowledge(this.knowledge);
    this.log(`Noted in your binder: ${check.name}, ${value}: ${bandFor(check, value).label}.`, 'system', 'lightbulb');
  }

  /** Remember that you've been somewhere (for the binder's location tabs). */
  private discover(area: AreaId): void {
    if (this.knowledge.areasSeen.includes(area)) return;
    this.knowledge.areasSeen.push(area);
    saveKnowledge(this.knowledge);
    if (Object.keys(AREAS).every((a) => this.knowledge.areasSeen.includes(a as AreaId))) this.achieve('explorer');
  }

  /** Whether a location shows up by name in the binder. */
  hasSeen(area: AreaId): boolean {
    return this.knowledge.areasSeen.includes(area);
  }

  /** Achievements about collecting things across every playthrough. */
  private checkCollections(): void {
    if (PAGES.every((p) => this.knowledge.pages.includes(p.id))) this.achieve('all-pages');
    if (FRIEND_ORDER.some((f) => this.hearts(f) >= MAX_HEARTS)) this.achieve('best-friend');
    if (FRIEND_ORDER.some((f) => CATEGORIES.every((c) => this.knownTaste(f, c)))) this.achieve('know-them');
  }

  // ── Ending ────────────────────────────────────────────────

  private endSession(reason: string): void {
    const s = this.session;
    if (!s || s.ended) return;
    this.commitFriendship();
    s.ended = true;
    const weeks = 2 + Math.floor(Math.random() * 9);
    this.knowledge.sessionsPlayed++;
    this.knowledge.weeksPassed += weeks;
    this.knowledge.lastGap = weeks;
    if (weeks === 10) this.achieve('long-gap');
    this.checkCollections();
    saveKnowledge(this.knowledge);
    this.endReason = reason;
    this.phase = 'ending';
    this.emit('change');
  }

  /**
   * The campaign is over (for this run). The ending's page goes in the
   * binder, which opens new routes next time.
   */
  private finishCampaign(id: EndingId, lines: string[]): void {
    const s = this.session;
    if (!s || s.ended) return;
    for (const fid of FRIEND_ORDER) this.befriend(fid, FRIENDSHIP_GAINS.missionComplete);
    this.commitFriendship();
    s.ended = true;
    const def = ENDINGS[id];
    this.notePaths([`ending:${id}`]);
    const firstTime = !this.knowledge.endings.includes(id);
    if (firstTime) this.knowledge.endings.push(id);
    const newPage = def.page && !this.knowledge.pages.includes(def.page) ? def.page : null;
    if (newPage) this.knowledge.pages.push(newPage);
    const weeks = 2 + Math.floor(Math.random() * 9);
    this.knowledge.sessionsPlayed++;
    this.knowledge.weeksPassed += weeks;
    this.knowledge.lastGap = weeks;
    this.knowledge.won = true;
    this.justFinished = true;
    this.achieve(`end-${id}`);
    if (weeks === 10) this.achieve('long-gap');
    this.checkCollections();
    saveKnowledge(this.knowledge);
    this.ending = { id, lines, newPage, firstTime };
    this.phase = 'won';
    this.emit('change');
  }

  private log(text: string, who: Speaker = 'dm', icon?: string): void {
    const s = this.session;
    if (!s) return;
    s.log.push({ who, text, at: s.minutes, icon });
  }

  private ctx(first: boolean): Ctx {
    const s = this.session;
    return {
      firstAction: first,
      say: (text, who = 'dm') => this.log(text, who),
      flag: (n) => !!s?.flags.has(n),
      setFlag: (n) => void s?.flags.add(n),
      clearFlag: (n) => void s?.flags.delete(n),
      achieve: (id) => this.achieve(id),
      learnRoll: (checkId, value) => this.learnRoll(checkId, value),
      learnTaste: (friend, category) => this.learn(friend, category, tasteOf(friend, category)),
      boostEnergy: (amount) => {
        if (!s) return;
        for (const id of FRIEND_ORDER) s.energy[id] = Math.max(0, Math.min(100, s.energy[id] + amount));
        this.log(
          amount >= 0
            ? `Everyone at the table perks up a little (+${amount} energy).`
            : `Everyone at the table yawns (${amount} energy).`,
          'system',
          amount >= 0 ? 'bolt' : 'bedtime',
        );
      },
      calmTable: (looks) => this.calm(looks),
      hasPage: (id) => this.knowledge.pages.includes(id),
      givePage: (id) => this.givePage(id),
      giveAmulet: () => {
        if (!s) return;
        s.amulet = { held: true, charges: AMULET_CHARGES };
        this.achieve('snooze');
        this.log("You gained the Amulet of the Groundhog. Instead of rolling, you can always take a path you've already seen. And once tonight, you can choose the exact number you roll.", 'system');
      },
      goTo: (area, x, y) => {
        if (!s) return;
        s.area = area;
        s.pos = { x, y };
        s.walk = null;
        this.discover(area);
        const dust = AREAS[area].dust;
        if (dust && !s.flags.has(dust.protectedBy)) {
          this.log('Glittering moth dust hangs in the air up here. Just breathing it makes everyone at the table sleepy.', 'dm');
        } else if (dust) {
          this.log('You uncork the smelling salts. The moth dust can\'t touch you.', 'system', 'science');
        }
        if (!s.visitedTonight.has(area)) {
          s.visitedTonight.add(area);
          const intro = AREAS[area].intro;
          if (intro) this.log(`Marcus: "${intro}"`, 'dm');
          this.playStyle('explore');
        }
        // Keep showing what just happened, but as narration with no actions.
        s.dialog = { objectId: null, from: s.dialog?.from ?? s.log.length };
        this.emit('area');
      },
      endSession: (reason) => this.endSession(reason),
      ending: (id, lines) => this.finishCampaign(id, lines),
    };
  }
}
