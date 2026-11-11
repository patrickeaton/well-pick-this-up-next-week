import type { Category, Style, Taste } from '../content/cast';
import type { AreaId, EndingId, FriendId } from './types';

/** Everything that survives a reset: pages, dice knowledge and friends' tastes. */
export interface RollRecord {
  check: string;
  value: number;
  session: number;
}

export interface Knowledge {
  version: 1;
  pages: string[];
  rolls: RollRecord[];
  sessionsPlayed: number;
  weeksPassed: number;
  lastGap: number;
  won: boolean;
  /** Tastes you've seen in action, per friend. */
  tastes: Partial<Record<FriendId, Partial<Record<Category, Taste>>>>;
  /** Friends' play-style feelings you've seen, per friend. */
  styles: Partial<Record<FriendId, Partial<Record<Style, 'like' | 'dislike' | 'neutral'>>>>;
  /** Pages whose back you've read. */
  flipped: string[];
  /** Locations you've been to in any run. */
  areasSeen: AreaId[];
  /** Achievement ids unlocked. */
  achievements: string[];
  /** Endings you've reached, in the order you found them. */
  endings: EndingId[];
  /** Friendship points per friend. Missing means their starting value. */
  friendship: Partial<Record<FriendId, number>>;
  /**
   * Adventure paths: every action you've finished (and how it went), with
   * the session you first did it in. See content/quests.ts for the keys.
   */
  paths: Record<string, number>;
}

const KEY = 'pick-this-up:knowledge:v1';

export function freshKnowledge(): Knowledge {
  return {
    version: 1,
    pages: [],
    rolls: [],
    sessionsPlayed: 0,
    weeksPassed: 0,
    lastGap: 0,
    won: false,
    tastes: {},
    friendship: {},
    endings: [],
    achievements: [],
    areasSeen: [],
    flipped: [],
    styles: {},
    paths: {},
  };
}

export function loadKnowledge(): Knowledge {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return freshKnowledge();
    const data = JSON.parse(raw) as Partial<Knowledge>;
    if (data.version !== 1) return freshKnowledge();
    return { ...freshKnowledge(), ...data };
  } catch {
    return freshKnowledge();
  }
}

export function saveKnowledge(k: Knowledge): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(k));
  } catch {
    // Storage blocked: the run still works, it just won't persist.
  }
}

export function clearKnowledge(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
