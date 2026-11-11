import type { Category } from '../content/cast';

export type FriendId = 'marcus' | 'priya' | 'dan' | 'jo';
export type Speaker = FriendId | 'dm' | 'you' | 'system';
export type AreaId =
  | 'inn' | 'cellar' | 'square' | 'street' | 'pond' | 'mill' | 'bakery' | 'guardhouse' | 'hall'
  | 'road' | 'chapel' | 'graveyard' | 'gate' | 'yard' | 'market' | 'smithy' | 'apothecary'
  | 'close' | 'tower' | 'stairs' | 'belfry';
export type EndingId = 'tpk' | 'bad' | 'good' | 'secret';
/** An id from the item pool in content/cast.ts. */
export type ItemId = string;

/** One range on a d20 result table, e.g. 6–12: "refused". */
export interface Band {
  from: number;
  to: number;
  id: string;
  label: string;
}

/** A single-roll encounter. Every check is one d20 against its table. */
export interface CheckDef {
  id: string;
  name: string;
  bands: Band[];
}

export type Damage = 'coffee' | 'torn' | 'scratched' | 'scribbled';

export interface PageDef {
  id: string;
  title: string;
  /** Trusted HTML from our own content files. */
  body: string;
  damage?: Damage;
  /** The back of the page: DM-only notes, tables and secrets. Click to flip. */
  back: string;
  /** Once you've read the back, these roll tables are fully known. */
  revealsTables?: string[];
}

/** What content code can see and do during a session. */
export interface Ctx {
  readonly firstAction: boolean;
  say(text: string, who?: Speaker): void;
  flag(name: string): boolean;
  setFlag(name: string): void;
  clearFlag(name: string): void;
  achieve(id: string): void;
  /** Learn what a number does on a roll (as if you'd seen it), without rolling. */
  learnRoll(checkId: string, value: number): void;
  /** Learn one of a friend's tastes. */
  learnTaste(friend: FriendId, category: Category): void;
  /** Give everyone at the table a little energy. */
  boostEnergy(amount: number): void;
  /** Forgive a few looks: the table's patience comes back. */
  calmTable(looks: number): void;
  hasPage(id: string): boolean;
  givePage(id: string): void;
  giveAmulet(): void;
  goTo(area: AreaId, x: number, y: number): void;
  endSession(reason: string): void;
  /** Finish the campaign with one of the endings. Lines are the ending's story. */
  ending(id: EndingId, lines: string[]): void;
}

export interface ActionDef {
  id: string;
  label: string;
  minutes: number;
  /** Inspecting or poking at things. Too many in one session annoy the table. */
  look?: boolean;
  /** Taking something that isn't yours (some friends love it, some hate it). */
  steal?: boolean;
  /** Conversations go faster when the DM is tired. */
  talk?: boolean;
  /** If set, the action is decided by one d20 roll on this check. */
  check?: string;
  when?(g: Ctx): boolean;
  run(g: Ctx, outcome?: string): void;
}

export interface ObjectDef {
  id: string;
  name: string;
  area: AreaId;
  x: number;
  y: number;
  sprite: string;
  /** Shown at the top of the dialog when you click the object. */
  blurb?: string;
  /** Shown instead of the blurb once you've woken them with smelling salts. */
  awakeBlurb?: string;
  /** Flat things like rugs: you can walk over them. */
  walkable?: boolean;
  /**
   * A secret spot: clickable, but with no highlight or hand cursor. With no
   * sprite it just looks like floor or wall. Page backs say where they are.
   */
  hidden?: boolean;
  visible?(g: Ctx): boolean;
  actions: ActionDef[];
}

export interface AreaDef {
  id: AreaId;
  name: string;
  /** What the DM says the first time you walk in each session. */
  intro?: string;
  /** Texture for '.' tiles. */
  floor: 'plank' | 'stone' | 'cobble' | 'dirt';
  /** Texture for 'c' tiles (e.g. the bedroom floor, the graveyard grass). */
  alt?: string;
  /** Texture for '#' tiles. */
  wall?: string;
  /**
   * Sleepy dust in the air: every action here drains the whole table,
   * unless you have the flag named here (e.g. smelling salts).
   */
  dust?: { protectedBy: string; drain: number };
  /** Extra tile letters for this area (e.g. roofs, building fronts). Not walkable. */
  chars?: Record<string, string>;
  /** '#' wall, '.' floor, 'c' alternate floor, plus any letters in `chars`. */
  tiles: string[];
}
