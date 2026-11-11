import type { FriendId } from '../game/types';

export interface FriendDef {
  id: FriendId;
  name: string;
  role: string;
  vibe: string;
  /** The character they play in the campaign (Marcus runs it instead). */
  character: { name: string; title: string } | null;
  /** How you know them, shown on their profile. */
  howYouKnow: string;
  /** Tastes you already know before the first session (old friends). */
  knownFromStart: Category[];
  color: string;
  /** Hidden from the player until they see a reaction. */
  tastes: Partial<Record<Category, Taste>>;
  /** Spoken when you hand them something, by how they feel about it. */
  reactions: Record<Taste, string>;
  /** Energy lost per in-game minute at this point in the night. */
  drain(minute: number): number;
  chatter: string[];
  yawn: string;
  asleep: string;
  /** Said when friendship keeps them awake once more. */
  rally: string;
  /** Friendship points before the first session (how well you know them). */
  startFriendship: number;
  /** Something that earns friendship from this person in particular. */
  /** How they like the game to be played. Hidden until you see them react. */
  play: {
    likes: Style[];
    dislikes: Style[];
    /** Styles you already know their feelings about (old friends). */
    knownFromStart: Style[];
    /** What they say the first time each night you play (or don't) their way. */
    lines: Partial<Record<Style, string>>;
  };
}

/** Ways of playing the game that friends love or hate. */
export type Style = 'talk' | 'explore' | 'steal' | 'roll' | 'lore';
export const STYLES: Style[] = ['talk', 'explore', 'steal', 'roll', 'lore'];
export const STYLE_LABELS: Record<Style, string> = {
  talk: 'Role-playing (talking to people)',
  explore: 'Exploring and poking around',
  steal: 'Stealing things',
  roll: 'Rolling dice',
  lore: 'Finding lore and pages',
};
export const STYLE_SHORT: Record<Style, string> = {
  talk: 'role-playing', explore: 'exploring', steal: 'stealing', roll: 'rolling dice', lore: 'digging up lore',
};

export const FRIEND_ORDER: FriendId[] = ['marcus', 'priya', 'dan', 'jo'];

export const FRIENDS: Record<FriendId, FriendDef> = {
  marcus: {
    id: 'marcus',
    name: 'Marcus',
    role: 'DM',
    character: null,
    vibe: 'Over-prepared. Secretly loves bribes.',
    howYouKnow: "Your college roommate. You've played in his campaigns for ten years. He has never once finished one.",
    knownFromStart: ['caffeine', 'sweet', 'healthy'],
    tastes: { caffeine: 'like', sweet: 'like', healthy: 'dislike' },
    reactions: {
      like: 'Oh, you absolute legend.',
      neutral: 'Thanks. Okay, where were we.',
      dislike: '…Is this a test? DMs run on junk food.',
      refuses: 'No thanks.',
    },
    color: '#e0a458',
    drain: () => 0.38,
    chatter: [
      'Okay, okay. Focus, everyone.',
      'I spent four hours on this map, just so you know.',
      'Please stop trying to seduce the furniture.',
    ],
    yawn: 'Marcus rubs his eyes. "I might start… summarizing a bit."',
    asleep: 'Marcus falls asleep behind the DM screen.',
    rally: 'Marcus slaps his own cheeks. "No. No! I prepped this for WEEKS. Keep going."',
    startFriendship: 30,
    play: {
      likes: ['talk', 'lore'],
      dislikes: ['steal'],
      knownFromStart: ['talk', 'explore', 'steal', 'roll', 'lore'],
      lines: {
        talk: '*does a whole voice* I have been DYING to play this character.',
        lore: 'You found it! I wrote that!',
        steal: "Those are my NPCs' things…",
      },
    },
  },
  priya: {
    id: 'priya',
    name: 'Priya',
    role: 'Rogue',
    character: { name: 'Nyx', title: 'a hooded rogue who steals everything not nailed down' },
    vibe: 'Sharp. Gets bored fastest.',
    howYouKnow: "Dan's friend from climbing. This is only her third game night, so you barely know her.",
    knownFromStart: [],
    tastes: { sour: 'like', alcohol: 'like', hearty: 'dislike' },
    reactions: {
      like: 'Okay, you can stay.',
      neutral: 'Sure. Thanks.',
      dislike: "I'll pass. That's like a whole meal.",
      refuses: 'No thanks.',
    },
    color: '#c779d0',
    drain: () => 0.5,
    chatter: [
      'Can we skip to the stabbing part?',
      "I'm checking my phone but I'm listening. Mostly.",
      'I steal whatever that is.',
    ],
    yawn: 'Priya is scrolling her phone with her eyes half closed.',
    asleep: 'Priya is asleep, still holding her phone.',
    rally: 'Priya puts her phone face down. "Fine. FINE. I want to see how this ends."',
    startFriendship: 0,
    play: {
      likes: ['steal', 'roll'],
      dislikes: ['talk'],
      knownFromStart: [],
      lines: {
        steal: 'Yes. Take it. Take everything.',
        roll: 'Ooh, dice.',
        talk: '*sighs* Are we still talking to this guy?',
      },
    },
  },
  dan: {
    id: 'dan',
    name: 'Dan',
    role: 'Barbarian',
    character: { name: 'Grukk', title: 'a barbarian with a horned helmet and an axe named Steve' },
    vibe: 'Loud early, crashes hard.',
    howYouKnow: "Your coworker. He sits next to you. You've heard him eat chips through a headset.",
    knownFromStart: ['salty'],
    tastes: { salty: 'like', hearty: 'like', sour: 'dislike', healthy: 'dislike' },
    reactions: {
      like: 'YES. This is why we\'re friends.',
      neutral: 'Cool, cool.',
      dislike: '*makes a face* Why would you do this to me.',
      refuses: 'Nah.',
    },
    color: '#e5665c',
    drain: (m) => (m < 90 ? 0.3 : 0.7),
    chatter: [
      'I RAGE. …At what? Doesn\'t matter.',
      'Wait, are there more snacks?',
      'Can I punch it? I want to punch it.',
    ],
    yawn: 'Dan has gone very quiet and very horizontal.',
    asleep: 'Dan is asleep on the couch.',
    rally: 'Dan jolts upright. "I\'m up! I\'m up! One more scene!"',
    startFriendship: 10,
    play: {
      likes: ['roll', 'talk'],
      dislikes: ['explore'],
      knownFromStart: ['roll'],
      lines: {
        roll: 'ROLL IT. ROLL IT.',
        talk: 'Do the voice again, Marcus!',
        explore: 'Can we stop sightseeing and hit something?',
      },
    },
  },
  jo: {
    id: 'jo',
    name: 'Jo',
    role: 'Cleric',
    character: { name: 'Halden', title: 'a gentle cleric of the sun who heals everyone, including the cat' },
    vibe: 'Steady. Last to fall asleep.',
    howYouKnow: "Your sister's best friend. You've known her since you were kids.",
    knownFromStart: ['alcohol', 'soft'],
    tastes: { soft: 'like', healthy: 'like', caffeine: 'dislike', alcohol: 'refuses' },
    reactions: {
      like: 'Aw, you remembered!',
      neutral: 'Thank you!',
      dislike: "That'll keep me up till 4. Pass.",
      refuses: "I don't drink, but thank you!",
    },
    color: '#5fb49c',
    drain: () => 0.34,
    chatter: [
      'Has everyone had some water?',
      'I cast… um, "stay awake" on Dan.',
      'I think we should read the notice board. Just a hunch.',
    ],
    yawn: 'Jo stifles a yawn. Even Jo is fading.',
    asleep: 'Jo, somehow, is asleep.',
    rally: 'Jo blinks hard and sits up. "Sorry! I\'m here. I\'m here for you."',
    startFriendship: 20,
    play: {
      likes: ['talk', 'explore'],
      dislikes: ['steal'],
      knownFromStart: ['talk', 'steal'],
      lines: {
        talk: 'Aw, I love this character.',
        explore: "Ooh, what's over there?",
        steal: 'We should really give that back.',
      },
    },
  },
};

/*
 * Table patience. Every "look" action in a session uses some up.
 * After ANNOY_GRACE looks, each extra look makes the table restless and
 * drains everyone's energy a little, more each time.
 */
export const ANNOY_GRACE = 4;
export const PATIENCE_PER_LOOK = 6;
export const restlessDrain = (looks: number): number =>
  looks <= ANNOY_GRACE ? 0 : Math.min(looks - ANNOY_GRACE, 5);

/** Reactions when the look count hits each number. */
export const ANNOY_LINES: { at: number; who: FriendId; text: string }[] = [
  { at: 5, who: 'priya', text: 'Are we going to look at every single barrel in this inn?' },
  { at: 7, who: 'dan', text: "If you inspect one more thing I'm going on my phone." },
  { at: 9, who: 'jo', text: 'I love you. Please do something.' },
  { at: 11, who: 'marcus', text: "Okay. I'm declaring that you've seen everything. Everything is a barrel." },
  { at: 14, who: 'priya', text: '*has put her head down on the table*' },
];

/** Replies when you repeat the same thing back to back. Picked at random. */
export const REPEAT_LINES: [FriendId, string][] = [
  ['marcus', "C'mon, dude. I literally just told you that."],
  ['marcus', '…Same as thirty seconds ago.'],
  ['marcus', '*stares at you over the DM screen*'],
  ['priya', 'He JUST said.'],
  ['marcus', 'Still the same. Nothing has changed. It has been three minutes.'],
  ['dan', 'Is the game broken, or is it you?'],
  ['marcus', "I'm going to start charging you for this."],
  ['jo', 'Maybe try a different thing?'],
  ['marcus', 'Yep. Still that.'],
  ['priya', '*mouths the answer along with Marcus*'],
  ['marcus', 'Do you want me to write it down for you?'],
  ['dan', 'Bro.'],
];

export const GRUMBLES: { who: FriendId; text: string }[] = [
  { who: 'dan', text: '*sighs loudly*' },
  { who: 'priya', text: 'Wow. Riveting.' },
  { who: 'jo', text: '*checks the time*' },
  { who: 'marcus', text: "It's… it's just a normal one of those." },
];

// ── Friendship ─────────────────────────────────────────────
/*
 * Permanent, per friend. Points add up during a night and are counted when
 * it ends, win or lose. Every POINTS_PER_HEART points is a heart, up to
 * MAX_HEARTS.
 */
export const POINTS_PER_HEART = 10;
export const MAX_HEARTS = 5;
export const heartsFor = (points: number): number =>
  Math.min(MAX_HEARTS, Math.floor(Math.max(0, points) / POINTS_PER_HEART));

export const FRIENDSHIP_GAINS = {
  lovedItem: 3,
  dislikedItem: -2,
  restlessLook: -1,
  /** Playing the way they like / the way they don't. */
  styleLiked: 2,
  styleDisliked: -1,
  /** Each of those counts at most this many times a night, per friend. */
  stylePerNight: 3,
  missionComplete: 5,
};

/** Energy a friend gains (or loses) when you play their way (or not). */
export const STYLE_ENERGY = 2;

export const styleOf = (friend: FriendId, style: Style): 'like' | 'dislike' | 'neutral' =>
  FRIENDS[friend].play.likes.includes(style) ? 'like' : FRIENDS[friend].play.dislikes.includes(style) ? 'dislike' : 'neutral';

/** Each heart makes them tire this much slower (4% → 20% at five hearts). */
export const STAMINA_PER_HEART = 0.04;
/** From this many hearts, they rally once a night instead of falling asleep. */
export const RALLY_HEARTS = 3;
export const RALLY_ENERGY = 25;
/** Reaching these hearts, they let one of their tastes slip during the week. */
export const REVEAL_AT_HEARTS = [2, 4];


// ── Snacks and drinks ──────────────────────────────────────

export type Category =
  | 'salty'
  | 'sweet'
  | 'sour'
  | 'hearty'
  | 'healthy'
  | 'soft'
  | 'caffeine'
  | 'alcohol';

export type Taste = 'like' | 'neutral' | 'dislike' | 'refuses';

export const CATEGORIES: Category[] = ['salty', 'sweet', 'sour', 'hearty', 'healthy', 'soft', 'caffeine', 'alcohol'];

export const CATEGORY_LABELS: Record<Category, string> = {
  salty: 'Salty snack',
  sweet: 'Sweet snack',
  sour: 'Sour snack',
  hearty: 'Hearty food',
  healthy: 'Healthy',
  soft: 'Soft drink',
  caffeine: 'Caffeine',
  alcohol: 'Alcohol',
};

export const CATEGORY_SHORT: Record<Category, string> = {
  salty: 'salty snacks', sweet: 'sweet things', sour: 'sour candy', hearty: 'hearty food',
  healthy: 'healthy stuff', soft: 'soft drinks', caffeine: 'caffeine', alcohol: 'alcohol',
};

/** Whether someone at the table has some of an item, given their taste. */
export const partakes = (taste: Taste): boolean => taste === 'like' || taste === 'neutral';

/** Energy one person gets from an item on the table. */
export function energyFor(d: ItemDef, taste: Taste): number {
  if (!partakes(taste)) return 0;
  return taste === 'like' ? d.energy * 2 : d.energy;
}

export const tasteOf = (friend: FriendId, c: Category): Taste => FRIENDS[friend].tastes[c] ?? 'neutral';

export interface ItemDef {
  id: string;
  name: string;
  /** A Material Symbols icon name. */
  icon: string;
  category: Category;
  /**
   * Energy for each person at the table who has some. Everything goes on the
   * table: people who love it get double, people who don't like it skip it.
   */
  energy: number;
  blurb: string;
  /** Energy lost an hour later. */
  crash?: number;
  /** Heavy food: extra tiredness an hour later, for a while. */
  coma?: boolean;
  /** Alcohol: restores table patience (counts as N fewer looks). */
  calm?: number;
  /** Alcohol: slightly faster drain for the rest of the night. */
  drowsy?: boolean;
  /** Sugar: chattier for an hour. */
  chatty?: boolean;
  /** The DM can be bribed with it. Goes off after a long break. */
  homemade?: boolean;
}

/** Snack break: the next item comes out when anyone drops below this energy… */
export const SNACK_BREAK_AT = 60;
/** …but at least this many minutes after the last one. */
export const SNACK_BREAK_GAP = 30;

/** You can bring this many things to each game night. */
export const ITEM_SLOTS = 1;
/** Choices in the cupboard each week. */
export const PANTRY_SIZE = 3;
/** After a break this long, homemade things have gone off. */
export const SPOIL_WEEKS = 8;

const item = (d: ItemDef): ItemDef => d;

/** "a bag of chips", "some nachos": the item's name in a sentence. */
export function withArticle(d: ItemDef): string {
  const name = d.name.toLowerCase();
  if (!name.includes(' of ') && name.endsWith('s')) return `some ${name}`;
  return `${/^[aeiou]/.test(name) ? 'an' : 'a'} ${name}`;
}

export const ITEMS: Record<string, ItemDef> = Object.fromEntries(
  [
    item({ id: 'chips', name: 'Bag of chips', icon: 'tapas', category: 'salty', energy: 24, blurb: 'Family size. Somehow never enough.' }),
    item({ id: 'pretzels', name: 'Bag of pretzels', icon: 'bakery_dining', category: 'salty', energy: 24, blurb: 'Crunchy, salty, reliable.' }),
    item({ id: 'popcorn', name: 'Bowl of popcorn', icon: 'movie', category: 'salty', energy: 20, blurb: 'Kernels will end up in the dice tray.' }),
    item({ id: 'pizzaRolls', name: 'Tray of pizza rolls', icon: 'local_pizza', category: 'hearty', energy: 32, coma: true, blurb: 'Molten on the inside. Every single time.' }),
    item({ id: 'nachos', name: 'Nachos', icon: 'restaurant', category: 'hearty', energy: 28, coma: true, blurb: 'A whole tray, extra cheese.' }),
    item({ id: 'veggieTray', name: 'Veggie tray', icon: 'nutrition', category: 'healthy', energy: 22, blurb: 'Carrots, celery, ranch. Someone will be judgy.' }),
    item({ id: 'trailMix', name: 'Bowl of trail mix', icon: 'eco', category: 'healthy', energy: 24, blurb: 'Mostly raisins, honestly.' }),
    item({ id: 'cookies', name: 'Plate of homemade cookies', icon: 'cookie', category: 'sweet', energy: 22, homemade: true, blurb: 'Fresh from the oven. Some DMs can be bribed.' }),
    item({ id: 'brownies', name: 'Homemade brownies', icon: 'cake', category: 'sweet', energy: 24, homemade: true, blurb: 'A whole pan. Some DMs can be bribed.' }),
    item({ id: 'candy', name: 'Bowl of candy', icon: 'icecream', category: 'sweet', energy: 20, chatty: true, blurb: 'A big bowl of the good stuff.' }),
    item({ id: 'sourGummies', name: 'Bag of sour gummies', icon: 'bug_report', category: 'sour', energy: 24, blurb: 'Face-meltingly sour.' }),
    item({ id: 'sourStraws', name: 'Tub of sour straws', icon: 'texture', category: 'sour', energy: 20, blurb: 'Divisive.' }),
    item({ id: 'soda', name: 'Two-liter of soda', icon: 'local_drink', category: 'soft', energy: 20, chatty: true, blurb: "Off-brand, but who's counting." }),
    item({ id: 'sparklingWater', name: 'Case of sparkling water', icon: 'water_drop', category: 'soft', energy: 20, blurb: 'Water, but with ambition.' }),
    item({ id: 'lemonade', name: 'Jug of lemonade', icon: 'blender', category: 'soft', energy: 22, blurb: 'Homemade-ish.' }),
    item({ id: 'coffee', name: 'Pot of coffee', icon: 'coffee', category: 'caffeine', energy: 36, crash: 18, blurb: 'Strong enough to stand a spoon in.' }),
    item({ id: 'energyDrink', name: 'Pack of energy drinks', icon: 'bolt', category: 'caffeine', energy: 48, crash: 28, blurb: 'Neon green. Tastes like a battery.' }),
    item({ id: 'beer', name: 'Six-pack of beer', icon: 'sports_bar', category: 'alcohol', energy: 10, calm: 4, drowsy: true, blurb: 'Cold, cheap, a little fizzy.' }),
    item({ id: 'wine', name: 'Bottle of wine', icon: 'wine_bar', category: 'alcohol', energy: 8, calm: 6, drowsy: true, blurb: 'Red. Fancy. Probably.' }),
    item({ id: 'seltzer', name: 'Box of hard seltzers', icon: 'liquor', category: 'alcohol', energy: 12, calm: 4, drowsy: true, blurb: 'Fizzy, light, sneaky.' }),
  ].map((d) => [d.id, d]),
);

/** Small seeded random generator so a week's cupboard doesn't change on reload. */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const isDrink = (c: Category) => c === 'soft' || c === 'caffeine' || c === 'alcohol';

/**
 * This week's cupboard: PANTRY_SIZE choices, at least one drink and one
 * food, each a different type so the choice means something. After a long
 * break, homemade things have gone off and something else takes their place.
 */
export function stockPantry(seed: number, gapWeeks: number): { items: string[]; spoiled: string[] } {
  const rand = seededRandom(seed);
  const pool = Object.values(ITEMS)
    .map((i) => ({ i, r: rand() }))
    .sort((a, b) => a.r - b.r)
    .map((x) => x.i);
  const spoils = (d: ItemDef) => !!d.homemade && gapWeeks >= SPOIL_WEEKS;

  const chosen: ItemDef[] = [];
  const spoiled: ItemDef[] = [];
  const take = (want: (d: ItemDef) => boolean) => {
    for (const d of pool) {
      if (chosen.includes(d) || spoiled.includes(d) || !want(d)) continue;
      if (chosen.some((c) => c.category === d.category)) continue;
      if (spoils(d)) {
        // Show that it went off, then keep looking.
        if (spoiled.length === 0) spoiled.push(d);
        continue;
      }
      chosen.push(d);
      return;
    }
  };
  take((d) => isDrink(d.category));
  take((d) => !isDrink(d.category));
  while (chosen.length < PANTRY_SIZE) take(() => true);

  return { items: chosen.map((d) => d.id), spoiled: spoiled.map((d) => d.id) };
}
