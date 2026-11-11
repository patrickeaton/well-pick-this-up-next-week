import Phaser from 'phaser';

/*
 * Placeholder pixel art, drawn in code so the prototype needs no asset files.
 * Every texture is 16×16.
 */

type G = Phaser.GameObjects.Graphics;

/** A soft round glow: rings of low alpha, brightest in the middle. */
function glow(scene: Phaser.Scene, key: string, color: number, size: number): void {
  const g = scene.make.graphics({}, false);
  const r = size / 2;
  for (let i = 4; i >= 1; i--) {
    g.fillStyle(color, 0.12);
    g.fillCircle(r, r, (r * i) / 4);
  }
  g.generateTexture(key, size, size);
  g.destroy();
}

/** Like make(), but for a texture bigger than one tile. */
function makeSized(scene: Phaser.Scene, key: string, w: number, h: number, draw: (g: G) => void): void {
  const g = scene.make.graphics({}, false);
  draw(g);
  g.generateTexture(key, w, h);
  g.destroy();
}

function make(scene: Phaser.Scene, key: string, draw: (g: G) => void): void {
  const g = scene.make.graphics({}, false);
  draw(g);
  g.generateTexture(key, 16, 16);
  g.destroy();
}

function rect(g: G, color: number, x: number, y: number, w: number, h: number): void {
  g.fillStyle(color, 1);
  g.fillRect(x, y, w, h);
}

/** Draw a sprite from text rows; '.' is transparent. */
function pixels(g: G, rows: string[], palette: Record<string, number>): void {
  rows.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      const color = palette[ch];
      if (color !== undefined) rect(g, color, x, y, 1, 1);
    });
  });
}

const PERSON = [
  '................',
  '.....KKKKKK.....',
  '....KHHHHHHK....',
  '....KHSSSSHK....',
  '....KSKSSKSK....',
  '....KSSSSSSK....',
  '.....KSSSSK.....',
  '.....KCCCCK.....',
  '....KCCCCCCK....',
  '....KSCCCCSK....',
  '....KSCCCCSK....',
  '.....KCCCCK.....',
  '.....KPKKPK.....',
  '.....KPKKPK.....',
  '.....KK..KK.....',
  '................',
]

const CHEST = [
  '................',
  '................',
  '................',
  '................',
  '..KKKKKKKKKKKK..',
  '.KWWWWWWWWWWWWK.',
  '.KWwwwwwwwwwwWK.',
  '.KGGGGGGGGGGGGK.',
  '.KWWWWWYYWWWWWK.',
  '.KwwwwwYYwwwwwK.',
  '.KwwwwwwwwwwwwK.',
  '.KwwwwwwwwwwwwK.',
  '.KGGGGGGGGGGGGK.',
  '.KKKKKKKKKKKKKK.',
  '................',
  '................',
];

const OUTLINE = 0x1a1214;

/** The base body with its eyes shut, for people asleep on their feet. */
const PERSON_ASLEEP = PERSON.map((row, y) => (y === 4 ? '....KSSSSSSK....' : y === 5 ? '....KKKSSKKK....' : row));

/** A townsperson asleep on their feet: eyes shut, a little "z". */
function sleeper(scene: Phaser.Scene, key: string, hair: number, skin: number, cloth: number, pants: number): void {
  const pal = { K: OUTLINE, H: hair, S: skin, C: cloth, P: pants };
  make(scene, key, (g) => {
    pixels(g, PERSON_ASLEEP, pal);
    rect(g, 0xffffff, 12, 0, 3, 1);
    rect(g, 0xffffff, 13, 1, 1, 1);
    rect(g, 0xffffff, 12, 2, 3, 1);
  });
  // Woken with smelling salts: eyes open, no Z.
  make(scene, `${key}Awake`, (g) => pixels(g, PERSON, pal));
}

function planks(g: G, base: number, dark: number, light: number): void {
  rect(g, base, 0, 0, 16, 16);
  for (let i = 0; i < 4; i++) {
    const y = i * 4;
    rect(g, light, 0, y, 16, 1);
    rect(g, dark, 0, y + 3, 16, 1);
    rect(g, dark, i % 2 ? 5 : 11, y, 1, 3);
  }
}


// ── Floor and wall tiles ───────────────────────────────────
/*
 * Each tile has a base look, a couple of variants scattered around rooms
 * (key1, key2), and sometimes a "clue" version (keyClue) drawn under hidden
 * spots: a subtle tell for players who know where to look.
 */
interface TileSet {
  base: (g: G) => void;
  variants: ((g: G) => void)[];
  /** How many tiles in ten get a variant (defaults to one per variant). */
  rate?: number;
  clue?: (g: G) => void;
}

const wallBase = (g: G): void => {
  rect(g, 0x2b2226, 0, 0, 16, 16);
  for (let r = 0; r < 4; r++) {
    const off = r % 2 ? 4 : 0;
    for (let x = -off; x < 16; x += 8) {
      rect(g, 0x4a3a3a, x + 1, r * 4 + 1, 6, 2);
      rect(g, 0x5c4848, x + 1, r * 4 + 1, 6, 1);
    }
  }
};
const stoneBase = (g: G): void => {
  rect(g, 0x4b4d57, 0, 0, 16, 16);
  rect(g, 0x3d3f48, 0, 7, 16, 1);
  rect(g, 0x3d3f48, 7, 0, 1, 7);
  rect(g, 0x3d3f48, 12, 8, 1, 8);
  rect(g, 0x5a5c66, 3, 3, 1, 1);
  rect(g, 0x5a5c66, 10, 12, 1, 1);
};
const darkStoneBase = (g: G): void => {
  rect(g, 0x3b3d46, 0, 0, 16, 16);
  rect(g, 0x30323a, 0, 7, 16, 1);
  rect(g, 0x30323a, 7, 0, 1, 7);
  rect(g, 0x30323a, 12, 8, 1, 8);
};
const cobbleBase = (g: G): void => {
  rect(g, 0x55505a, 0, 0, 16, 16);
  const stones: [number, number, number, number][] = [
    [1, 1, 6, 4], [8, 1, 7, 4], [1, 6, 4, 4], [6, 6, 6, 4], [13, 6, 3, 4], [1, 11, 7, 4], [9, 11, 6, 4],
  ];
  for (const [x, y, w, h] of stones) {
    rect(g, 0x6b6670, x, y, w, h);
    rect(g, 0x7a7580, x, y, w, 1);
  }
};
const grassBase = (g: G): void => {
  rect(g, 0x3d5a3a, 0, 0, 16, 16);
  for (const [x, y] of [[2, 3], [7, 1], [12, 5], [4, 10], [10, 12], [14, 9], [1, 14]]) {
    rect(g, 0x547a4c, x, y, 1, 2);
    rect(g, 0x547a4c, x + 1, y + 1, 1, 1);
  }
};
const facadeBase = (g: G): void => {
  rect(g, 0x5b4636, 0, 0, 16, 16);
  rect(g, 0x3a2a20, 0, 0, 16, 2);
  rect(g, 0x6e5644, 0, 7, 16, 1);
  rect(g, 0x4a3828, 7, 2, 1, 14);
  rect(g, 0x2b2226, 0, 14, 16, 2);
};

/** Rows of clay or slate roof tiles. */
const roof = (base: number, light: number, dark: number) => (g: G): void => {
  rect(g, base, 0, 0, 16, 16);
  for (let r = 0; r < 4; r++) {
    const off = r % 2 ? 4 : 0;
    for (let x = -off; x < 16; x += 8) {
      rect(g, light, x + 1, r * 4, 6, 1);
      rect(g, dark, x + 7, r * 4, 1, 3);
    }
    rect(g, dark, 0, r * 4 + 3, 16, 1);
  }
};
const roofRedBase = roof(0x8e3b2e, 0xa8503e, 0x6a2a22);
const roofOrangeBase = roof(0xa8582e, 0xc0703e, 0x7a3e22);
const roofSlateBase = roof(0x4a5266, 0x5e6880, 0x353a4a);

/** Timber-framed plaster (the inn). */
const tudorBase = (g: G): void => {
  rect(g, 0xe2d4b4, 0, 0, 16, 16);
  rect(g, 0x4a2e1a, 0, 0, 16, 2);
  rect(g, 0x4a2e1a, 0, 14, 16, 2);
  rect(g, 0x4a2e1a, 0, 0, 2, 16);
  rect(g, 0x4a2e1a, 8, 2, 1, 12);
  rect(g, 0x4a2e1a, 2, 7, 14, 1);
};
/** Plain cream plaster (the bakery). */
const plasterBase = (g: G): void => {
  rect(g, 0xd8c8a4, 0, 0, 16, 16);
  rect(g, 0xc4b490, 0, 0, 16, 2);
  rect(g, 0x8a7a64, 0, 13, 16, 3);
  rect(g, 0xe4d6b4, 3, 5, 2, 1);
};
/** Dressed stone blocks (town hall, guardhouse, tower). */
const stoneWallBase = (g: G): void => {
  rect(g, 0x5c5862, 0, 0, 16, 16);
  for (let r = 0; r < 4; r++) {
    const off = r % 2 ? 4 : 0;
    for (let x = -off; x < 16; x += 8) {
      rect(g, 0x7a7680, x + 1, r * 4 + 1, 6, 3);
      rect(g, 0x8a8690, x + 1, r * 4 + 1, 6, 1);
    }
  }
};
/** A warm lit window, for building fronts at night. */
const litWindow = (g: G, x: number, y: number, frame: number): void => {
  rect(g, frame, x - 1, y - 1, 7, 7);
  rect(g, 0xf2c45c, x, y, 5, 5);
  rect(g, 0xf7dc8f, x, y, 2, 2);
  rect(g, frame, x + 2, y, 1, 5);
  rect(g, frame, x, y + 2, 5, 1);
};

/** A small crack: a jagged dark line. */
const crack = (g: G, c: number, x: number, y: number): void => {
  rect(g, c, x, y, 2, 1);
  rect(g, c, x + 2, y + 1, 1, 1);
  rect(g, c, x + 3, y + 2, 2, 1);
  rect(g, c, x + 5, y + 3, 1, 1);
};

const dirtBase = (g: G): void => {
  rect(g, 0x7a5a3a, 0, 0, 16, 16);
  for (const [x, y] of [[2, 3], [9, 1], [13, 7], [5, 11], [11, 13], [1, 8]]) rect(g, 0x8a6a48, x, y, 2, 1);
  for (const [x, y] of [[6, 5], [12, 10], [3, 14]]) rect(g, 0x6a4a2e, x, y, 1, 1);
};

/**
 * Hedge: overlapping leaf clusters on a deep green, each lit from the top-left.
 * Clusters wrap around the tile edges, so hedges join up with no seams.
 */
const HEDGE_LEAVES: [number, number, number][] = [
  [1, 0, 0], [6, 1, 1], [11, 0, 0], [14, 4, 1], [3, 4, 1], [8, 5, 0],
  [0, 9, 0], [5, 9, 1], [11, 9, 0], [14, 12, 1], [2, 13, 0], [8, 13, 1],
];
const hedgeBase = (g: G): void => {
  rect(g, 0x1e3a24, 0, 0, 16, 16);
  const px = (x: number, y: number, c: number) => rect(g, c, ((x % 16) + 16) % 16, ((y % 16) + 16) % 16, 1, 1);
  const tones = [
    { shade: 0x24482a, mid: 0x2e6436, lit: 0x3f8048, hi: 0x5c9e5a },
    { shade: 0x24482a, mid: 0x356c38, lit: 0x4a8a48, hi: 0x6aa860 },
  ];
  for (const [x, y, k] of HEDGE_LEAVES) {
    const c = tones[k];
    // a rounded clump of leaves, 5 wide and 4 tall, shadow on the bottom-right
    for (const [dx, dy] of [[1, 0], [2, 0], [3, 0], [0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [1, 3], [2, 3], [3, 3]]) {
      px(x + dx, y + dy, c.mid);
    }
    for (const [dx, dy] of [[4, 2], [3, 3], [2, 3], [4, 1]]) px(x + dx, y + dy, c.shade);
    for (const [dx, dy] of [[1, 0], [2, 0], [0, 1], [1, 1]]) px(x + dx, y + dy, c.lit);
    px(x + 1, y, c.hi);
  }
};

const waterBase = (g: G): void => {
  rect(g, 0x2a5a8a, 0, 0, 16, 16);
  rect(g, 0x3a6e9e, 2, 3, 5, 1); rect(g, 0x3a6e9e, 9, 8, 5, 1); rect(g, 0x3a6e9e, 3, 13, 4, 1);
  rect(g, 0x5a8ec0, 3, 3, 2, 1); rect(g, 0x5a8ec0, 10, 8, 2, 1);
};

/** Cobbles with grass on one half (where a fence divides town from a green). */
const halfGround = (g: G, grass: 'E' | 'W' | null): void => {
  cobbleBase(g);
  if (!grass) return;
  const x0 = grass === 'E' ? 8 : 0;
  rect(g, 0x3d5a3a, x0, 0, 8, 16);
  for (const [x, y] of [[2, 2], [5, 8], [3, 13]]) { rect(g, 0x547a4c, x0 + x, y, 1, 2); rect(g, 0x547a4c, x0 + x + 1, y + 1, 1, 1); }
};
/** Iron railings running down the middle of the tile. */
const railing = (g: G, grass: 'E' | 'W'): void => {
  halfGround(g, grass);
  rect(g, 0x1a1418, 9, 0, 1, 16);
  rect(g, 0x1e1c24, 7, 0, 2, 16);
  for (const y of [1, 5, 9, 13]) {
    rect(g, 0x2e2c36, 6, y, 4, 2);
    rect(g, 0x8a8a96, 7, y, 1, 1);
  }
};
/** A stone pillar in a railing line (the gate posts). */
const railPillar = (g: G): void => {
  halfGround(g, 'E');
  rect(g, 0x1e1c24, 7, 0, 2, 16);
  rect(g, 0x3a3640, 2, 1, 12, 15);
  rect(g, 0x6e6a74, 3, 2, 10, 13);
  for (const y of [4, 8, 12]) rect(g, 0x5c5862, 3, y, 10, 1);
  rect(g, 0x8a8690, 2, 1, 12, 2);
  rect(g, 0xa8a4ae, 3, 1, 10, 1);
};
/** A wooden picket fence, with town on the west and garden on the east. */
const picket = (g: G): void => {
  halfGround(g, 'E');
  rect(g, 0x5a3a22, 9, 0, 1, 16);
  rect(g, 0x7a4b2a, 7, 0, 2, 16);
  for (const y of [1, 5, 9, 13]) {
    rect(g, 0xd8c8a0, 6, y, 4, 3);
    rect(g, 0xf0e4c0, 6, y, 4, 1);
    rect(g, 0x9a8a68, 6, y + 3, 4, 1);
  }
};
/** A low stone wall, cobbles either side. */
const lowWall = (g: G): void => {
  cobbleBase(g);
  rect(g, 0x3a3640, 3, 0, 10, 16);
  for (let r = 0; r < 4; r++) {
    const off = r % 2 ? 3 : 0;
    rect(g, 0x7a7680, 4 + off, r * 4 + 1, 5, 2);
    rect(g, 0x6e6a74, 4 + (off ? 0 : 6), r * 4 + 1, 3, 2);
  }
  rect(g, 0x9a96a0, 4, 0, 8, 1);
};

const TILES: Record<string, TileSet> = {
  railing: { base: (g) => railing(g, 'E'), variants: [] },
  railingW: { base: (g) => railing(g, 'W'), variants: [] },
  railPillar: {
    base: railPillar,
    variants: [],
    // the faint outline of a small door in the pillar
    clue: (g) => { railPillar(g); rect(g, 0x45414b, 5, 6, 1, 10); rect(g, 0x45414b, 10, 6, 1, 10); rect(g, 0x45414b, 5, 6, 6, 1); rect(g, 0x9a96a0, 9, 11, 1, 1); },
  },
  picket: { base: picket, variants: [] },
  lowWall: { base: lowWall, variants: [] },
  water: {
    base: waterBase,
    variants: [
      // a lily pad
      (g) => { waterBase(g); rect(g, 0x3d7a46, 5, 6, 5, 3); rect(g, 0x4a8a50, 6, 6, 3, 1); rect(g, 0x2a5a8a, 7, 7, 2, 1); rect(g, 0xe8a0c0, 9, 6, 1, 1); },
      // a sparkle
      (g) => { waterBase(g); rect(g, 0xd8ecff, 11, 2, 1, 1); rect(g, 0xa8d0f0, 10, 2, 3, 1); rect(g, 0xa8d0f0, 11, 1, 1, 3); },
    ],
    // the top edge of a wooden gate just under the surface
    clue: (g) => { waterBase(g); rect(g, 0x5a3a22, 2, 6, 12, 2); rect(g, 0x7a4b2a, 2, 6, 12, 1); rect(g, 0x3a2516, 7, 5, 2, 2); },
  },
  hedge: {
    base: hedgeBase,
    variants: [
      // red berries
      (g) => {
        hedgeBase(g);
        for (const [x, y] of [[5, 6], [6, 7], [11, 11], [12, 2], [2, 11]]) { rect(g, 0xc0392b, x, y, 1, 1); rect(g, 0xe8685a, x, y, 1, 1); }
        rect(g, 0x8e2b2b, 6, 7, 1, 1);
      },
      // little white flowers
      (g) => {
        hedgeBase(g);
        for (const [x, y] of [[4, 7], [11, 6], [8, 14], [14, 1]]) {
          rect(g, 0xf0e6f0, x - 1, y, 3, 1); rect(g, 0xf0e6f0, x, y - 1, 1, 3); rect(g, 0xf1c40f, x, y, 1, 1);
        }
      },
    ],
  },
  dirt: {
    base: dirtBase,
    variants: [
      (g) => { dirtBase(g); rect(g, 0x8a868c, 6, 6, 3, 2); rect(g, 0x9a96a0, 6, 6, 2, 1); },
      (g) => { dirtBase(g); rect(g, 0x5a3e26, 2, 4, 12, 1); rect(g, 0x5a3e26, 2, 11, 12, 1); },
    ],
  },
  plank: {
    base: (g) => planks(g, 0x8a5a33, 0x6b4226, 0x9c6b40),
    variants: [
      // a knot in the wood
      (g) => { planks(g, 0x8a5a33, 0x6b4226, 0x9c6b40); rect(g, 0x5a3a22, 9, 5, 2, 2); rect(g, 0x6b4226, 8, 5, 1, 2); },
      // nail heads and a darker board
      (g) => { planks(g, 0x8a5a33, 0x6b4226, 0x9c6b40); rect(g, 0x7d5030, 0, 8, 16, 3); rect(g, 0x2b2226, 2, 1, 1, 1); rect(g, 0x2b2226, 13, 9, 1, 1); },
    ],
    // one board sits a little proud: lighter top edge, shadow under it
    clue: (g) => { planks(g, 0x8a5a33, 0x6b4226, 0x9c6b40); rect(g, 0xa87848, 2, 4, 10, 1); rect(g, 0x4a2e1a, 2, 8, 10, 1); },
  },
  plankLight: {
    base: (g) => planks(g, 0x9e7048, 0x7d5232, 0xb08257),
    variants: [
      (g) => { planks(g, 0x9e7048, 0x7d5232, 0xb08257); rect(g, 0x6b4226, 4, 9, 2, 2); },
      (g) => { planks(g, 0x9e7048, 0x7d5232, 0xb08257); rect(g, 0x8a6040, 0, 4, 16, 3); },
    ],
  },
  wall: {
    base: wallBase,
    variants: [
      (g) => { wallBase(g); crack(g, 0x1a1214, 5, 4); },
      // a creeping patch of moss
      (g) => { wallBase(g); rect(g, 0x3d5a3a, 1, 12, 4, 2); rect(g, 0x4a6a44, 2, 11, 2, 1); },
    ],
    // one brick a slightly different color
    clue: (g) => { wallBase(g); rect(g, 0x6a4a40, 9, 5, 6, 2); rect(g, 0x7a5a4e, 9, 5, 6, 1); },
  },
  stone: {
    base: stoneBase,
    variants: [
      (g) => { stoneBase(g); crack(g, 0x34363e, 2, 9); },
      (g) => { stoneBase(g); rect(g, 0x5a5c66, 9, 2, 2, 2); rect(g, 0x666872, 9, 2, 1, 1); },
    ],
    // a flagstone with a crack all the way round it
    clue: (g) => { stoneBase(g); rect(g, 0x2e3038, 2, 2, 10, 1); rect(g, 0x2e3038, 2, 11, 10, 1); rect(g, 0x2e3038, 2, 2, 1, 10); rect(g, 0x2e3038, 11, 2, 1, 10); },
  },
  darkStone: {
    base: darkStoneBase,
    variants: [
      (g) => { darkStoneBase(g); crack(g, 0x26282e, 8, 10); },
      (g) => { darkStoneBase(g); rect(g, 0xb8b8c4, 0, 0, 4, 1); rect(g, 0xb8b8c4, 0, 0, 1, 4); rect(g, 0xb8b8c4, 1, 1, 1, 1); },
    ],
    // a shadowy hollow
    clue: (g) => { darkStoneBase(g); rect(g, 0x1e1f25, 5, 5, 6, 5); rect(g, 0x2a2c33, 5, 5, 6, 1); },
  },
  roofRed: { base: roofRedBase, variants: [(g) => { roofRedBase(g); rect(g, 0x5a5c66, 10, 1, 3, 4); rect(g, 0x6e7078, 10, 1, 3, 1); }] },
  roofOrange: { base: roofOrangeBase, variants: [(g) => { roofOrangeBase(g); rect(g, 0x5a5c66, 4, 2, 3, 4); rect(g, 0x6e7078, 4, 2, 3, 1); }] },
  roofSlate: { base: roofSlateBase, variants: [(g) => { roofSlateBase(g); rect(g, 0x3d7a46, 2, 9, 3, 2); }] },
  tudor: {
    rate: 5,
    base: tudorBase,
    variants: [
      (g) => { tudorBase(g); litWindow(g, 3, 3, 0x4a2e1a); },
      (g) => { tudorBase(g); litWindow(g, 10, 3, 0x4a2e1a); rect(g, 0x5a3a22, 9, 9, 6, 2); rect(g, 0xe74c8c, 10, 8, 1, 1); rect(g, 0xf1c40f, 12, 8, 1, 1); },
    ],
  },
  plaster: {
    rate: 5,
    base: plasterBase,
    variants: [
      (g) => { plasterBase(g); litWindow(g, 5, 4, 0x2e5a3a); rect(g, 0x3d7a46, 2, 3, 2, 7); rect(g, 0x3d7a46, 12, 3, 2, 7); },
      (g) => { plasterBase(g); rect(g, 0xb8a888, 9, 8, 1, 2); rect(g, 0xb8a888, 10, 10, 2, 1); },
    ],
  },
  // The town's outer wall: stone, no windows. townWallTop has battlements.
  townWall: {
    rate: 3,
    base: stoneWallBase,
    variants: [
      (g) => { stoneWallBase(g); rect(g, 0x3d7a46, 1, 0, 3, 9); rect(g, 0x4a8a50, 3, 5, 3, 6); rect(g, 0x2e5a34, 2, 10, 2, 4); },
      (g) => { stoneWallBase(g); crack(g, 0x45414b, 5, 6); },
    ],
  },
  townWallTop: {
    base: (g) => { stoneWallBase(g); rect(g, 0x2a2630, 0, 0, 16, 3); rect(g, 0x7a7680, 1, 0, 5, 3); rect(g, 0x7a7680, 9, 0, 5, 3); rect(g, 0x8a8690, 1, 0, 5, 1); rect(g, 0x8a8690, 9, 0, 5, 1); },
    variants: [],
  },
  stoneWall: {
    rate: 4,
    base: stoneWallBase,
    variants: [
      // an arched lit window
      (g) => { stoneWallBase(g); rect(g, 0x3a3640, 4, 3, 8, 9); rect(g, 0xf2c45c, 5, 5, 6, 6); rect(g, 0xf2c45c, 6, 4, 4, 1); rect(g, 0x3a3640, 7, 5, 2, 6); },
      // ivy
      (g) => { stoneWallBase(g); rect(g, 0x3d7a46, 1, 0, 3, 9); rect(g, 0x4a8a50, 3, 5, 3, 6); rect(g, 0x2e5a34, 2, 10, 2, 4); },
    ],
    // the faint outline of a small door
    clue: (g) => { stoneWallBase(g); rect(g, 0x45414b, 4, 3, 1, 13); rect(g, 0x45414b, 11, 3, 1, 13); rect(g, 0x45414b, 4, 3, 8, 1); rect(g, 0x9a96a0, 9, 9, 1, 1); },
  },
  cobble: {
    base: cobbleBase,
    variants: [
      // a weed between the stones
      (g) => { cobbleBase(g); rect(g, 0x547a4c, 5, 5, 1, 2); rect(g, 0x547a4c, 6, 4, 1, 2); rect(g, 0x547a4c, 7, 5, 1, 1); },
      // a missing stone
      (g) => { cobbleBase(g); rect(g, 0x5c5862, 6, 6, 6, 4); rect(g, 0x4c4852, 6, 6, 6, 1); },
    ],
  },
  grass: {
    base: grassBase,
    variants: [
      (g) => { grassBase(g); rect(g, 0xf0e6a0, 6, 7, 1, 1); rect(g, 0xe8d0f0, 11, 3, 1, 1); rect(g, 0xf0e6a0, 3, 12, 1, 1); },
      (g) => { grassBase(g); rect(g, 0x6e6a70, 8, 8, 3, 2); rect(g, 0x8a868c, 8, 8, 2, 1); },
    ],
  },
  facade: {
    base: facadeBase,
    variants: [
      // a small shuttered window
      (g) => { facadeBase(g); rect(g, 0x2b2226, 10, 3, 4, 3); rect(g, 0xf7dc6f, 11, 4, 2, 1); },
      (g) => { facadeBase(g); crack(g, 0x3a2a20, 2, 9); },
    ],
    // the faint outline of a small door
    clue: (g) => { facadeBase(g); rect(g, 0x4a3828, 3, 4, 1, 10); rect(g, 0x4a3828, 12, 4, 1, 10); rect(g, 0x4a3828, 3, 4, 10, 1); rect(g, 0x7a5e48, 10, 9, 1, 1); },
  },
};

function makeTiles(scene: Phaser.Scene): void {
  for (const [key, t] of Object.entries(TILES)) {
    make(scene, key, t.base);
    t.variants.forEach((draw, i) => make(scene, `${key}${i + 1}`, draw));
    if (t.clue) make(scene, `${key}Clue`, t.clue);
  }
}

/** How many variants a tile has, and how many tiles in ten should use one. */
export const tileVariants = (key: string): { count: number; rate: number } => {
  const t = TILES[key];
  return { count: t?.variants.length ?? 0, rate: t?.rate ?? t?.variants.length ?? 0 };
};


/**
 * A character: the base body with an overlay on top. In the overlay, '.'
 * keeps the base pixel, ' ' erases it, and any other letter is a palette key.
 */
function figure(scene: Phaser.Scene, key: string, pal: Record<string, number>, overlay: string[], base = PERSON): void {
  const rows = base.map((row, y) => [...row].map((ch, x) => {
    const o = overlay[y]?.[x] ?? '.';
    return o === '.' ? ch : o === ' ' ? '.' : o;
  }).join(''));
  make(scene, key, (g) => pixels(g, rows, { K: OUTLINE, ...pal }));
}

/** Head-and-shoulders portrait of a real person at the table. */
const FACE = [
  '................',
  '................',
  '.....HHHHHH.....',
  '....HHHHHHHH....',
  '....HSSSSSSH....',
  '....SSSSSSSS....',
  '....SKKSSKKS....',
  '....SSSSSSSS....',
  '....SSSSSSSS....',
  '.....SSMMSS.....',
  '......SSSS......',
  '.....CCCCCC.....',
  '...CCCCCCCCCC...',
  '..CCCCCCCCCCCC..',
  '..CCCCCCCCCCCC..',
  '..CCCCCCCCCCCC..',
];

function makeCharacters(scene: Phaser.Scene): void {
  // ── You: a bard ──
  figure(scene, 'player', { H: 0x8b5a2b, S: 0xf1c27d, C: 0x1f8a8a, P: 0x4a3a2a, R: 0xc0392b, Y: 0xf1c40f, A: 0xf1c40f, L: 0x9a6a3c, D: 0x5a3a22 }, [
    '..........Y.....',
    '.....RRRRRYY....',
    '...RRRRRRRRRR...',
    '................',
    '................',
    '................',
    '................',
    '................',
    '........A.......',
    '.......A..LL....',
    '......A..LLLL...',
    '.........LDLL...',
    '..........LL....',
  ]);

  // ── The party (as their players' characters) ──
  // Priya → Nyx the rogue: hood, mask, dagger
  figure(scene, 'char-priya', { H: 0x3a2a4a, S: 0xc68642, C: 0x3a2a4a, P: 0x1a1a24, M: 0xc8c8d0, A: 0x7a4a9a }, [
    '................',
    '....KHHHHHHK....',
    '...KHHHHHHHHK...',
    '...KH......HK...',
    '...KH......HK...',
    '....KAAAAAAK....',
    '................',
    '................',
    '................',
    '...........M....',
    '...........M....',
    '......AAAA.M....',
  ]);
  // Dan → Grukk the barbarian: horned helmet, fur, axe
  figure(scene, 'char-dan', { H: 0x8a8a96, S: 0xe0a080, C: 0x8a5a33, P: 0x5a3a22, W: 0xe8e0c8, F: 0x6b4a2a, M: 0xb0b0b8, L: 0x5a3a22 }, [
    '...W........W...',
    '...WWKKKKKKWW...',
    '....KHHHHHHK....',
    '................',
    '................',
    '................',
    '................',
    'MMMLFFFFFFFF....',
    '.M.LFCCCCCCF....',
    '...L............',
    '...L............',
    '...L............',
    '...L............',
  ]);
  // Jo → Halden the cleric: white robe, gold sun, mace
  figure(scene, 'char-jo', { H: 0x6b4226, S: 0x8d5524, C: 0xecf0f1, P: 0xd8dde0, Y: 0xf1c40f, M: 0xb0b0b8, L: 0x7a4b2a }, [
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '............M...',
    '...........MMM..',
    '.......YY...L...',
    '.......YY...L...',
    '............L...',
    '.....KCCCCK.....',
    '....KCCCCCCK....',
    '....KKKKKKKK....',
  ]);

  // ── People in Harrowmere ──
  // Bram: bald, big mustache, white apron
  figure(scene, 'bram', { H: 0xd4a373, S: 0xd4a373, C: 0x7a4b2a, P: 0x5a3a22, B: 0x5a4a3a, W: 0xecf0f1 }, [
    '................',
    '................',
    '................',
    '................',
    '................',
    '....KSBBBBSK....',
    '................',
    '................',
    '......WWWW......',
    '......WWWW......',
    '......WWWW......',
    '......WWWW......',
  ]);
  // Fen: long red hair, green tunic, a lute of their own
  figure(scene, 'fen', { H: 0xd35400, S: 0xf5cba7, C: 0x27ae60, P: 0x2c3e50, L: 0xc8a060, D: 0x7a4b2a }, [
    '................',
    '................',
    '...HKHHHHHHKH...',
    '...H........H...',
    '...H........H...',
    '...H........H...',
    '...HH......HH...',
    '................',
    '................',
    '..LL............',
    '.LLLL...........',
    '.LDLL...........',
    '..LL............',
  ]);
  // Old Moss: sailor cap, white beard, navy coat
  figure(scene, 'moss', { H: 0xe0e0e0, S: 0x8d5524, C: 0x34495e, P: 0x2c2c2c, R: 0x2c3e50, W: 0xe0e0e0, Y: 0xd4a017 }, [
    '................',
    '.....RRRRRR.....',
    '....RRRRRRRR....',
    '...RRRRRRRRRR...',
    '................',
    '....KWWWWWWK....',
    '.....WWWWWW.....',
    '......WWWW......',
    '.......Y........',
    '.......Y........',
  ]);
  // Vex: tall top hat, purple coat, thin mustache
  figure(scene, 'vex', { H: 0x1a1214, S: 0xe8d0c0, C: 0x6a3a7a, P: 0x2c2c2c, T: 0x1a1214, A: 0x8e2b2b, Y: 0xd4a017 }, [
    '.....TTTTTT.....',
    '.....TTTTTT.....',
    '.....TAAAAT.....',
    '...TTTTTTTTTT...',
    '................',
    '.....KKKKKK.....',
    '................',
    '................',
    '.......Y........',
  ]);
  // Sister Wren: veil with a white band
  figure(scene, 'wren', { H: 0x1f1f2a, S: 0xf1c27d, C: 0x2a2a3a, P: 0x2a2a3a, W: 0xecf0f1, Y: 0xd4a017 }, [
    '................',
    '....KHHHHHHK....',
    '...KWWWWWWWWK...',
    '...HH......HH...',
    '...HH......HH...',
    '...HH......HH...',
    '...HHH....HHH...',
    '................',
    '.......Y........',
    '......YYY.......',
    '.......Y........',
  ]);
  // G.: a pale, glowing adventurer
  figure(scene, 'ghost', { H: 0xd8e8f8, S: 0xc8d8f0, C: 0xa8c0e0, P: 0x90a8d0, K: 0x6080b0, R: 0xb8d0f0 }, [
    '................',
    '.....RRRRRR.....',
    '...RRRRRRRRRR...',
  ]);

  // ── Marcus, who has no character: a little DM screen ──
  make(scene, 'char-marcus', (g) => {
    rect(g, 0x5a3a22, 1, 4, 4, 10);
    rect(g, 0x7a4b2a, 5, 3, 6, 11);
    rect(g, 0x5a3a22, 11, 4, 4, 10);
    rect(g, 0xd4a017, 7, 6, 2, 2);
    rect(g, 0xf0ead6, 6, 9, 4, 3);
  });

  // ── The real people at the table ──
  // Marcus: dark hair, glasses, beard, flannel
  figure(scene, 'face-marcus', { H: 0x2a1f1a, S: 0xe8b890, C: 0xa83232, A: 0x3a1a1a, G: 0x1a1214, B: 0x3a2a20, M: 0x8a4a3a }, [
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '....GKKGGKKG....',
    '................',
    '....BSSSSSSB....',
    '.....BBMMBB.....',
    '......BBBB......',
    '................',
    '...CACCACCAC....',
    '..CACCACCACCA...',
    '..CACCACCACCA...',
    '..CACCACCACCA...',
  ], FACE);
  // Priya: long black hair, gold hoops, purple top
  figure(scene, 'face-priya', { H: 0x111018, S: 0xc68642, C: 0x7a4a9a, A: 0xf1c40f, M: 0x9a4a4a }, [
    '................',
    '................',
    '................',
    '................',
    '...HHSSSSSSHH...',
    '...HSSSSSSSSH...',
    '...H........H...',
    '...H........H...',
    '...A........A...',
    '...H........H...',
    '...HH......HH...',
    '...HHCCCCCCHH...',
  ], FACE);
  // Dan: buzz cut, huge grin, red hoodie
  figure(scene, 'face-dan', { H: 0x8a6a3a, S: 0xf0c090, C: 0xd04a3a, W: 0xffffff, M: 0x7a2a2a }, [
    '................',
    '................',
    '................',
    '....HSSSSSSH....',
    '................',
    '................',
    '................',
    '................',
    '................',
    '.....MWWWWM.....',
    '................',
    '................',
    '......W..W......',
    '......W..W......',
  ], FACE);
  // Jo: big curly hair, round glasses, green cardigan
  figure(scene, 'face-jo', { H: 0x3a2418, S: 0x8d5524, C: 0x3d7a46, G: 0xd4a017, W: 0xf0ead6, M: 0x5a2a2a }, [
    '................',
    '....HHHHHHHH....',
    '...HHHHHHHHHH...',
    '..HHHHHHHHHHHH..',
    '..HHSSSSSSSSHH..',
    '..HHSSSSSSSSHH..',
    '...HGKKGGKKGH...',
    '...H........H...',
    '................',
    '................',
    '................',
    '.....CWWWWC.....',
    '...CCCCWWCCCC...',
    '..CCCCCWWCCCCC..',
  ], FACE);
}

export function makeTextures(scene: Phaser.Scene): void {
  makeTiles(scene);

  // Furniture
  make(scene, 'bed', (g) => {
    rect(g, 0x5a3a22, 1, 1, 14, 14);
    rect(g, 0xe8e2d0, 3, 2, 10, 4);
    rect(g, 0x3f6db0, 2, 7, 12, 8);
    rect(g, 0x5c8bd1, 2, 7, 12, 1);
  });
  make(scene, 'board', (g) => {
    rect(g, 0x6b4a2b, 1, 2, 14, 11);
    rect(g, 0xb08850, 2, 3, 12, 9);
    rect(g, 0xf0ead6, 3, 4, 4, 5);
    rect(g, 0xf0ead6, 8, 5, 5, 4);
    rect(g, 0xc0392b, 4, 4, 1, 1);
    rect(g, 0xc0392b, 10, 5, 1, 1);
  });
  make(scene, 'fireplace', (g) => {
    rect(g, 0x6e6a70, 0, 1, 16, 15);
    rect(g, 0x5a3a22, 0, 1, 16, 2);
    rect(g, 0x1a1012, 3, 5, 10, 10);
    rect(g, 0x7a7478, 1, 4, 1, 1);
    rect(g, 0x7a7478, 14, 9, 1, 1);
    rect(g, 0x3a3034, 4, 12, 8, 3);
  });
  make(scene, 'flame', (g) => {
    rect(g, 0xe74c3c, 5, 9, 6, 5);
    rect(g, 0xf39c12, 6, 7, 4, 6);
    rect(g, 0xf7dc6f, 7, 10, 2, 3);
  });
  make(scene, 'counter', (g) => {
    rect(g, 0x5a3a22, 2, 0, 12, 16);
    rect(g, 0x9a6a3c, 3, 0, 10, 16);
    rect(g, 0xb8834f, 4, 0, 1, 16);
  });
  make(scene, 'table', (g) => {
    rect(g, 0x5a3a22, 2, 3, 12, 10);
    rect(g, 0x9a6a3c, 3, 3, 10, 8);
    rect(g, 0xd9d9d9, 5, 5, 2, 3);
    rect(g, 0xf1e3a0, 5, 5, 2, 1);
  });
  make(scene, 'barrel', (g) => {
    rect(g, 0x6b4226, 3, 2, 10, 13);
    rect(g, 0x8a5a33, 4, 2, 8, 2);
    rect(g, 0x3a3a3a, 3, 5, 10, 1);
    rect(g, 0x3a3a3a, 3, 11, 10, 1);
  });
  make(scene, 'trapdoor', (g) => {
    rect(g, 0x3a2516, 2, 2, 12, 12);
    rect(g, 0x7a4b2a, 3, 3, 10, 10);
    rect(g, 0x5a3a22, 3, 6, 10, 1);
    rect(g, 0x5a3a22, 3, 9, 10, 1);
    rect(g, 0xb0b0b0, 7, 10, 2, 2);
  });
  make(scene, 'stairs', (g) => {
    const shades = [0x9a9ca6, 0x868892, 0x72747e, 0x5e606a, 0x4b4d57];
    shades.forEach((c, i) => rect(g, c, 2, 1 + i * 3, 12, 3));
  });
  // A wooden crate: lighter top face, framed front, planks, a diagonal brace, nails.
  make(scene, 'crate', (g) => {
    rect(g, 0x2b1a10, 2, 1, 12, 15);
    rect(g, 0xc8955a, 3, 2, 10, 3);
    rect(g, 0xe0b070, 3, 2, 10, 1);
    rect(g, 0xa87a46, 3, 4, 10, 1);
    rect(g, 0x9a6a3c, 3, 5, 10, 9);
    rect(g, 0x80542e, 6, 7, 1, 5);
    rect(g, 0x80542e, 9, 7, 1, 5);
    rect(g, 0x6b4226, 3, 5, 10, 2);
    rect(g, 0x6b4226, 3, 12, 10, 2);
    rect(g, 0x6b4226, 3, 5, 2, 9);
    rect(g, 0x6b4226, 11, 5, 2, 9);
    rect(g, 0x8a5a33, 3, 5, 10, 1);
    for (let i = 0; i < 6; i++) rect(g, 0x6b4226, 5 + i, 11 - Math.floor(i * 0.8), 1, 1);
    for (const [x, y] of [[4, 6], [11, 6], [4, 12], [11, 12]]) rect(g, 0xd8d4c8, x, y, 1, 1);
    rect(g, 0x4a2e1a, 3, 13, 10, 1);
  });
  make(scene, 'chest', (g) =>
    pixels(g, CHEST, { K: 0x2a1a12, W: 0x9a6a3c, w: 0x7a4b2a, G: 0xd4a017, Y: 0xf1c40f }),
  );

  // Filler: inn
  make(scene, 'window', (g) => {
    rect(g, 0x5a3a22, 3, 2, 10, 10);
    rect(g, 0x1d2b4a, 4, 3, 8, 8);
    rect(g, 0xf7f1c8, 9, 4, 2, 2);
    rect(g, 0x5a3a22, 7, 3, 1, 8);
    rect(g, 0x5a3a22, 4, 7, 8, 1);
    rect(g, 0x7a4b2a, 2, 12, 12, 2);
  });
  make(scene, 'antlers', (g) => {
    rect(g, 0x5a3a22, 6, 6, 4, 5);
    rect(g, 0x8a6a3a, 7, 7, 2, 3);
    const bone = 0xd9c7a3;
    rect(g, bone, 3, 2, 1, 5); rect(g, bone, 4, 6, 2, 1); rect(g, bone, 2, 3, 1, 1); rect(g, bone, 4, 3, 1, 1);
    rect(g, bone, 12, 2, 1, 5); rect(g, bone, 10, 6, 2, 1); rect(g, bone, 13, 3, 1, 1); rect(g, bone, 11, 3, 1, 1);
  });
  make(scene, 'shelf', (g) => {
    rect(g, 0x5a3a22, 1, 6, 14, 2);
    rect(g, 0x5a3a22, 1, 12, 14, 2);
    rect(g, 0x2e7d4f, 3, 2, 2, 4);
    rect(g, 0x8e2b2b, 7, 1, 2, 5);
    rect(g, 0xc68a2a, 11, 3, 2, 3);
    rect(g, 0x2c5aa0, 4, 9, 2, 3);
    rect(g, 0xc68a2a, 9, 8, 3, 4);
  });
  make(scene, 'portrait', (g) => {
    rect(g, 0xb8892c, 3, 1, 10, 12);
    rect(g, 0x3b2a40, 4, 2, 8, 10);
    rect(g, 0x2a1a12, 6, 3, 4, 1);
    rect(g, 0xe0b48a, 6, 4, 4, 4);
    rect(g, 0x6b2a2a, 5, 8, 6, 4);
  });
  make(scene, 'dartboard', (g) => {
    rect(g, 0x1a1214, 4, 3, 8, 10);
    rect(g, 0x1a1214, 3, 4, 10, 8);
    rect(g, 0xe8e0c8, 5, 5, 6, 6);
    rect(g, 0xc0392b, 6, 6, 4, 4);
    rect(g, 0x2e7d4f, 7, 7, 2, 2);
    rect(g, 0xf1c40f, 11, 3, 3, 1);
  });
  make(scene, 'wardrobe', (g) => {
    rect(g, 0x4a2e1a, 2, 0, 12, 16);
    rect(g, 0x6b4226, 3, 1, 5, 14);
    rect(g, 0x6b4226, 8, 1, 5, 14);
    rect(g, 0xd4a017, 7, 8, 1, 1);
    rect(g, 0xd4a017, 8, 8, 1, 1);
  });
  make(scene, 'stool', (g) => {
    rect(g, 0x5a3a22, 4, 9, 1, 5);
    rect(g, 0x5a3a22, 11, 9, 1, 5);
    rect(g, 0x9a6a3c, 4, 5, 8, 4);
    rect(g, 0xb8834f, 4, 5, 8, 1);
  });
  make(scene, 'cat', (g) => {
    const fur = 0xd98a3a;
    rect(g, fur, 3, 8, 8, 6);
    rect(g, fur, 2, 13, 5, 1);
    rect(g, fur, 10, 6, 4, 4);
    rect(g, fur, 10, 5, 1, 1);
    rect(g, fur, 13, 5, 1, 1);
    rect(g, 0xa85f22, 5, 8, 1, 6);
    rect(g, 0xa85f22, 8, 8, 1, 6);
    rect(g, 0x1a1214, 11, 8, 2, 1);
  });
  make(scene, 'rug', (g) => {
    rect(g, 0x7a2e3a, 1, 3, 14, 10);
    rect(g, 0xc9a24a, 2, 4, 12, 8);
    rect(g, 0x7a2e3a, 3, 5, 10, 6);
    rect(g, 0xc9a24a, 7, 6, 2, 4);
  });
  make(scene, 'plant', (g) => {
    rect(g, 0x2e7d4f, 4, 4, 3, 6);
    rect(g, 0x2e7d4f, 9, 3, 3, 7);
    rect(g, 0x2e7d4f, 6, 2, 4, 8);
    rect(g, 0x4caf6a, 7, 3, 1, 5);
    rect(g, 0xa0522d, 5, 10, 6, 5);
    rect(g, 0xc0703d, 5, 10, 6, 1);
  });
  make(scene, 'broom', (g) => {
    rect(g, 0x9a6a3c, 7, 1, 2, 10);
    rect(g, 0xd9b45a, 5, 11, 6, 4);
    rect(g, 0x8e2b2b, 5, 11, 6, 1);
  });

  // Filler: cellar
  make(scene, 'wineRack', (g) => {
    rect(g, 0x4a2e1a, 1, 1, 14, 14);
    for (const x of [3, 7, 11]) for (const y of [3, 7, 11]) {
      rect(g, 0x24161a, x - 1, y - 1, 4, 4);
      if ((x + y) % 3 !== 0) rect(g, 0x5e1a2a, x, y, 2, 2);
    }
  });
  make(scene, 'cobweb', (g) => {
    const silk = 0xd8d8e0;
    for (let i = 0; i < 11; i++) rect(g, silk, i, i, 1, 1);
    rect(g, silk, 0, 0, 1, 12);
    rect(g, silk, 0, 0, 12, 1);
    rect(g, silk, 0, 5, 5, 1);
    rect(g, silk, 5, 0, 1, 5);
    rect(g, silk, 0, 9, 9, 1);
    rect(g, silk, 9, 0, 1, 9);
  });
  make(scene, 'rat', (g) => {
    rect(g, 0x6e6a70, 5, 9, 6, 4);
    rect(g, 0x6e6a70, 10, 10, 3, 2);
    rect(g, 0x9a8a90, 10, 8, 2, 2);
    rect(g, 0x1a1214, 12, 10, 1, 1);
    rect(g, 0xd49aa0, 1, 11, 4, 1);
  });
  make(scene, 'sack', (g) => {
    rect(g, 0xc9a86a, 4, 6, 8, 9);
    rect(g, 0xa8884a, 6, 4, 4, 2);
    rect(g, 0x6b4226, 6, 6, 4, 1);
    rect(g, 0xa8884a, 5, 10, 2, 1);
  });
  make(scene, 'mushrooms', (g) => {
    rect(g, 0xe8e0c8, 4, 10, 2, 4);
    rect(g, 0xe8e0c8, 10, 11, 2, 3);
    rect(g, 0x9b59b6, 2, 7, 6, 3);
    rect(g, 0x9b59b6, 8, 9, 6, 2);
    rect(g, 0xe8d0f0, 4, 8, 1, 1);
    rect(g, 0xe8d0f0, 11, 9, 1, 1);
  });
  make(scene, 'skeleton', (g) => {
    const bone = 0xe8e0c8;
    rect(g, bone, 3, 3, 4, 4);
    rect(g, 0x1a1214, 4, 4, 1, 1);
    rect(g, 0x1a1214, 6, 4, 1, 1);
    rect(g, bone, 4, 7, 1, 7);
    rect(g, bone, 4, 8, 6, 1);
    rect(g, bone, 4, 10, 6, 1);
    rect(g, bone, 4, 12, 6, 1);
    rect(g, bone, 8, 6, 4, 1);
    rect(g, bone, 9, 13, 5, 1);
    rect(g, 0xffffff, 12, 4, 3, 3);
    rect(g, 0x1a1214, 13, 5, 1, 1);
  });


  // ── Doors and exits ──────────────────────────────────────
  make(scene, 'door', (g) => {
    rect(g, 0x3a2516, 3, 1, 10, 15);
    rect(g, 0x7a4b2a, 4, 2, 8, 14);
    rect(g, 0x5a3a22, 7, 2, 1, 14);
    rect(g, 0xd4a017, 10, 9, 1, 1);
  });
  // The inn's double door, in two halves (left and right tile).
  make(scene, 'doorLeft', (g) => {
    rect(g, 0x2b1a10, 1, 0, 15, 16);
    rect(g, 0x3a2516, 1, 0, 15, 2);
    rect(g, 0x7a4b2a, 3, 2, 13, 14);
    rect(g, 0x5a3a22, 3, 6, 13, 1);
    rect(g, 0x5a3a22, 3, 11, 13, 1);
    rect(g, 0x8a5a33, 5, 3, 8, 2);
    rect(g, 0x2b2226, 4, 3, 1, 1); rect(g, 0x2b2226, 4, 8, 1, 1); rect(g, 0x2b2226, 4, 13, 1, 1);
    rect(g, 0xd4a017, 13, 8, 2, 2);
    rect(g, 0x3a2516, 15, 2, 1, 14);
  });
  make(scene, 'doorRight', (g) => {
    rect(g, 0x2b1a10, 0, 0, 15, 16);
    rect(g, 0x3a2516, 0, 0, 15, 2);
    rect(g, 0x7a4b2a, 0, 2, 13, 14);
    rect(g, 0x5a3a22, 0, 6, 13, 1);
    rect(g, 0x5a3a22, 0, 11, 13, 1);
    rect(g, 0x8a5a33, 3, 3, 8, 2);
    rect(g, 0x2b2226, 11, 3, 1, 1); rect(g, 0x2b2226, 11, 8, 1, 1); rect(g, 0x2b2226, 11, 13, 1, 1);
    rect(g, 0xd4a017, 1, 8, 2, 2);
    rect(g, 0x3a2516, 0, 2, 1, 14);
  });
  // Exits along a room's bottom wall: an opening cut into the wall (Zelda-style),
  // with steps leading out. L/R halves make a double-wide opening.
  const doorway = (jambLeft: boolean, jambRight: boolean) => (g: G): void => {
    rect(g, 0x120c0e, 0, 0, 16, 16);
    rect(g, 0x1e1619, 0, 6, 16, 4);
    rect(g, 0x2a2024, 0, 10, 16, 3);
    rect(g, 0x3a2e30, 0, 13, 16, 3);
    rect(g, 0x4a3a3c, 0, 10, 16, 1);
    rect(g, 0x5a4a4c, 0, 13, 16, 1);
    if (jambLeft) { rect(g, 0x3a2516, 0, 0, 2, 16); rect(g, 0x5a3a22, 2, 0, 1, 16); }
    if (jambRight) { rect(g, 0x3a2516, 14, 0, 2, 16); rect(g, 0x5a3a22, 13, 0, 1, 16); }
  };
  make(scene, 'doorway', doorway(true, true));
  make(scene, 'doorwayL', doorway(true, false));
  make(scene, 'doorwayR', doorway(false, true));
  // A doormat just inside an exit.
  make(scene, 'mat', (g) => {
    rect(g, 0x7a3a2e, 1, 4, 14, 9);
    rect(g, 0x9a5038, 2, 5, 12, 7);
    rect(g, 0x7a3a2e, 3, 7, 10, 3);
    for (let x = 2; x < 15; x += 2) { rect(g, 0xc8a870, x, 3, 1, 1); rect(g, 0xc8a870, x, 13, 1, 1); }
  });
  make(scene, 'gate', (g) => {
    rect(g, 0x2b2226, 2, 1, 12, 15);
    for (let x = 3; x < 13; x += 2) rect(g, 0x8a8a96, x, 2, 1, 14);
    rect(g, 0x8a8a96, 2, 5, 12, 1);
    rect(g, 0x8a8a96, 2, 11, 12, 1);
    rect(g, 0xd4a017, 8, 8, 2, 2);
  });
  // A plank gate in a hedge or alley.
  make(scene, 'backGate', (g) => {
    rect(g, 0x3a2516, 1, 2, 14, 14);
    for (let x = 2; x < 14; x += 3) { rect(g, 0x9a6a3c, x, 3, 2, 13); rect(g, 0xb8834f, x, 3, 1, 13); }
    rect(g, 0x7a4b2a, 2, 6, 12, 2); rect(g, 0x7a4b2a, 2, 12, 12, 2);
    rect(g, 0x55565e, 11, 9, 3, 1);
  });
  make(scene, 'signpost', (g) => {
    rect(g, 0x5a3a22, 7, 5, 2, 11);
    rect(g, 0x9a6a3c, 2, 3, 12, 4);
    rect(g, 0x7a4b2a, 2, 6, 12, 1);
    rect(g, 0x3a2516, 3, 4, 1, 2);
    rect(g, 0x3a2516, 2, 5, 1, 1);
  });
  make(scene, 'chute', (g) => {
    rect(g, 0x2b2226, 3, 4, 10, 9);
    rect(g, 0x5c5c66, 2, 3, 12, 2);
    rect(g, 0x111014, 4, 6, 8, 6);
    rect(g, 0x5c5c66, 4, 8, 8, 1);
  });

  // ── Town square ──────────────────────────────────────────
  make(scene, 'well', (g) => {
    rect(g, 0x5a3a22, 2, 1, 1, 8);
    rect(g, 0x5a3a22, 13, 1, 1, 8);
    rect(g, 0x7a4b2a, 1, 1, 14, 2);
    rect(g, 0x6e6a70, 2, 8, 12, 7);
    rect(g, 0x8a868c, 2, 8, 12, 1);
    rect(g, 0x1d2b4a, 4, 9, 8, 3);
    rect(g, 0x9a9ca6, 7, 3, 1, 5);
  });
  make(scene, 'stall', (g) => {
    for (let x = 0; x < 16; x += 4) {
      rect(g, 0x6a3a7a, x, 1, 2, 4);
      rect(g, 0xd8c7e8, x + 2, 1, 2, 4);
    }
    rect(g, 0x5a3a22, 1, 5, 1, 10);
    rect(g, 0x5a3a22, 14, 5, 1, 10);
    rect(g, 0x7a4b2a, 0, 10, 16, 4);
    rect(g, 0xd4a017, 3, 8, 2, 2);
    rect(g, 0xb0b0b0, 7, 8, 2, 2);
    rect(g, 0x8e2b2b, 11, 8, 2, 2);
  });
  make(scene, 'butcher', (g) => {
    rect(g, 0x5a3a22, 1, 2, 1, 13);
    rect(g, 0x5a3a22, 14, 2, 1, 13);
    rect(g, 0x7a4b2a, 1, 2, 14, 1);
    rect(g, 0xc76a5a, 4, 4, 4, 6);
    rect(g, 0xe8b0a0, 5, 5, 2, 2);
    rect(g, 0xe8e0c8, 5, 3, 2, 1);
    rect(g, 0x8a5a3a, 9, 4, 3, 4);
    rect(g, 0x7a4b2a, 0, 11, 16, 4);
  });
  make(scene, 'post', (g) => {
    rect(g, 0x5a3a22, 7, 2, 2, 14);
    rect(g, 0xf0ead6, 3, 3, 10, 7);
    rect(g, 0x8a7a6a, 4, 4, 8, 1);
    rect(g, 0x8a7a6a, 4, 6, 6, 1);
    rect(g, 0x8a7a6a, 4, 8, 7, 1);
    rect(g, 0xc0392b, 7, 3, 2, 1);
  });
  make(scene, 'clock', (g) => {
    rect(g, 0x3a2a20, 3, 1, 10, 12);
    rect(g, 0xf0ead6, 4, 2, 8, 8);
    rect(g, 0x2a1f1a, 8, 3, 1, 3);
    rect(g, 0x2a1f1a, 8, 6, 3, 1);
    rect(g, 0xd4a017, 6, 11, 4, 1);
  });
  make(scene, 'lamp', (g) => {
    rect(g, 0x2b2226, 7, 5, 2, 11);
    rect(g, 0x2b2226, 5, 1, 6, 1);
    rect(g, 0xf7dc6f, 6, 2, 4, 3);
    rect(g, 0x2b2226, 5, 5, 6, 1);
  });
  make(scene, 'bench', (g) => {
    rect(g, 0x7a4b2a, 1, 6, 14, 3);
    rect(g, 0x9a6a3c, 1, 6, 14, 1);
    rect(g, 0x5a3a22, 2, 9, 1, 5);
    rect(g, 0x5a3a22, 13, 9, 1, 5);
  });
  make(scene, 'tree', (g) => {
    rect(g, 0x5a3a22, 7, 10, 2, 6);
    rect(g, 0x2e5a34, 2, 2, 12, 9);
    rect(g, 0x3d7a46, 4, 1, 8, 4);
    rect(g, 0x24482a, 3, 8, 10, 2);
  });

  // ── Chapel ───────────────────────────────────────────────
  make(scene, 'altar', (g) => {
    rect(g, 0xd8d0c0, 1, 6, 14, 9);
    rect(g, 0xeee8da, 1, 6, 14, 1);
    rect(g, 0x8e2b2b, 5, 6, 6, 9);
    rect(g, 0xf7dc6f, 3, 3, 1, 3);
    rect(g, 0xf7dc6f, 12, 3, 1, 3);
    rect(g, 0xf3ead3, 3, 4, 1, 2);
    rect(g, 0xd4a017, 7, 1, 2, 5);
    rect(g, 0xd4a017, 6, 2, 4, 1);
  });
  make(scene, 'lectern', (g) => {
    rect(g, 0x5a3a22, 7, 7, 2, 8);
    rect(g, 0x5a3a22, 4, 14, 8, 2);
    rect(g, 0x7a4b2a, 3, 3, 10, 4);
    rect(g, 0xf0ead6, 4, 2, 4, 3);
    rect(g, 0xe0d8c4, 8, 2, 4, 3);
  });
  make(scene, 'pew', (g) => {
    rect(g, 0x5a3a22, 0, 4, 16, 3);
    rect(g, 0x7a4b2a, 0, 8, 16, 4);
    rect(g, 0x9a6a3c, 0, 8, 16, 1);
    rect(g, 0x3a2516, 1, 12, 2, 3);
    rect(g, 0x3a2516, 13, 12, 2, 3);
  });
  make(scene, 'grave', (g) => {
    rect(g, 0x6e6a70, 4, 3, 8, 11);
    rect(g, 0x6e6a70, 5, 2, 6, 1);
    rect(g, 0x8a868c, 5, 3, 1, 10);
    rect(g, 0x4a464e, 6, 6, 4, 1);
    rect(g, 0x4a464e, 6, 8, 3, 1);
    rect(g, 0x3d5a3a, 3, 14, 10, 2);
  });
  make(scene, 'gGrave', (g) => {
    rect(g, 0x6e6a70, 4, 2, 8, 8);
    rect(g, 0x8a868c, 5, 2, 1, 7);
    rect(g, 0x2b2226, 6, 4, 4, 4);
    rect(g, 0x6e6a70, 7, 5, 3, 2);
    rect(g, 0x2b2226, 8, 6, 2, 1);
    rect(g, 0x3a2516, 3, 10, 10, 6);
    rect(g, 0x24170e, 4, 11, 8, 4);
  });
  // An old, leaning headstone, cracked and mossy.
  make(scene, 'graveOld', (g) => {
    rect(g, 0x5e5a60, 5, 4, 7, 10); rect(g, 0x5e5a60, 6, 3, 6, 1); rect(g, 0x5e5a60, 7, 2, 4, 1);
    rect(g, 0x7a767c, 6, 4, 1, 9);
    rect(g, 0x3a363e, 9, 5, 1, 2); rect(g, 0x3a363e, 8, 7, 1, 2); rect(g, 0x3a363e, 9, 9, 1, 2);
    rect(g, 0x3d7a46, 5, 11, 3, 3); rect(g, 0x4a8a50, 10, 12, 2, 2);
    rect(g, 0x3d5a3a, 3, 14, 10, 2);
  });
  // A stone cross.
  make(scene, 'graveCross', (g) => {
    rect(g, 0x6e6a70, 7, 1, 3, 13); rect(g, 0x6e6a70, 4, 4, 9, 3);
    rect(g, 0x8a868c, 7, 1, 1, 12); rect(g, 0x8a868c, 4, 4, 8, 1);
    rect(g, 0x4a464e, 9, 7, 1, 7);
    rect(g, 0x3d5a3a, 4, 14, 9, 2);
  });
  // Crows on a broken headstone. Wide awake.
  make(scene, 'crows', (g) => {
    rect(g, 0x6e6a70, 3, 8, 10, 6); rect(g, 0x8a868c, 3, 8, 10, 1); rect(g, 0x4a464e, 8, 8, 2, 2);
    rect(g, 0x3d5a3a, 2, 14, 12, 2);
    for (const [x, y] of [[3, 3], [9, 2]]) {
      rect(g, 0x1a1418, x, y + 1, 4, 4); rect(g, 0x1a1418, x + 1, y, 2, 1);
      rect(g, 0x2c2836, x + 1, y + 2, 2, 2);
      rect(g, 0xd4a017, x - 1, y + 1, 1, 1);
      rect(g, 0xf7dc6f, x + 1, y + 1, 1, 1);
      rect(g, 0x1a1418, x + 3, y + 5, 2, 1);
    }
  });
  // A half-dug grave with a shovel standing in it.
  make(scene, 'shovelGrave', (g) => {
    rect(g, 0x3a2516, 2, 6, 12, 9); rect(g, 0x24170e, 3, 7, 10, 7);
    rect(g, 0x5a3e26, 1, 4, 14, 2); rect(g, 0x6b4a2e, 2, 4, 6, 1);
    rect(g, 0x7a4b2a, 11, 0, 1, 9); rect(g, 0x9a96a0, 10, 9, 3, 3); rect(g, 0x5a3a22, 10, 0, 3, 1);
  });
  // A will-o'-the-wisp: just a pale light (the glow is added in the scene).
  make(scene, 'wisp', (g) => {
    rect(g, 0xd8f0ff, 7, 6, 2, 2); rect(g, 0xa8d8f0, 6, 7, 1, 1); rect(g, 0xa8d8f0, 9, 6, 1, 1);
  });
  make(scene, 'crypt', (g) => {
    // pointed slate roof
    for (let y = 0; y < 5; y++) rect(g, y % 2 ? 0x3a4256 : 0x4a5266, 7 - y * 2, y, 2 + y * 4, 1);
    rect(g, 0x1e2230, 0, 4, 16, 1);
    // stone walls with corner pillars
    rect(g, 0x6e6a70, 1, 5, 14, 11); rect(g, 0x8a868c, 1, 5, 14, 1);
    rect(g, 0x8a868c, 1, 5, 2, 11); rect(g, 0x5a565c, 13, 5, 2, 11);
    // iron door with an arch, and a skull over it
    rect(g, 0x2b2226, 5, 8, 6, 8); rect(g, 0x2b2226, 6, 7, 4, 1);
    rect(g, 0x4a464e, 5, 11, 6, 1); rect(g, 0xb0b0b0, 9, 12, 1, 1);
    rect(g, 0xe0dcd0, 7, 5, 2, 2); rect(g, 0x2b2226, 7, 6, 1, 1);
  });

  // ── Bell tower ───────────────────────────────────────────
  make(scene, 'bellFrame', (g) => {
    rect(g, 0x5a3a22, 2, 1, 2, 15);
    rect(g, 0x5a3a22, 12, 1, 2, 15);
    rect(g, 0x7a4b2a, 1, 1, 14, 2);
    rect(g, 0x9a8a70, 7, 3, 2, 3);
  });
  make(scene, 'bellHung', (g) => {
    rect(g, 0x5a3a22, 2, 1, 2, 15);
    rect(g, 0x5a3a22, 12, 1, 2, 15);
    rect(g, 0x7a4b2a, 1, 1, 14, 2);
    rect(g, 0xc89b3c, 6, 4, 4, 3);
    rect(g, 0xc89b3c, 5, 7, 6, 4);
    rect(g, 0xe0b85a, 6, 5, 1, 5);
    rect(g, 0x8a6a20, 7, 11, 2, 1);
  });
  make(scene, 'moth', (g) => {
    const wing = 0x6a5a7a;
    rect(g, wing, 0, 3, 7, 7);
    rect(g, wing, 9, 3, 7, 7);
    rect(g, 0x55486a, 1, 9, 5, 4);
    rect(g, 0x55486a, 10, 9, 5, 4);
    rect(g, 0xe8d0f0, 2, 5, 2, 2);
    rect(g, 0xe8d0f0, 12, 5, 2, 2);
    rect(g, 0x1a1214, 3, 6, 1, 1);
    rect(g, 0x1a1214, 12, 6, 1, 1);
    rect(g, 0x3a3046, 7, 2, 2, 11);
    rect(g, 0xc0a0d0, 6, 1, 1, 2);
    rect(g, 0xc0a0d0, 9, 1, 1, 2);
  });
  make(scene, 'rope', (g) => {
    rect(g, 0xc8a870, 7, 0, 2, 14);
    rect(g, 0xa8885a, 7, 3, 2, 1);
    rect(g, 0xa8885a, 7, 8, 2, 1);
    rect(g, 0xc8a870, 6, 13, 4, 3);
  });

  // People
  // ── Decor (scenery you can't click) ──────────────────────
  make(scene, 'chair', (g) => {
    rect(g, 0x5a3a22, 4, 2, 8, 3);
    rect(g, 0x7a4b2a, 4, 2, 8, 1);
    rect(g, 0x9a6a3c, 4, 7, 8, 3);
    rect(g, 0x5a3a22, 4, 5, 1, 9);
    rect(g, 0x5a3a22, 11, 5, 1, 9);
  });
  make(scene, 'sconce', (g) => {
    rect(g, 0x5c5c66, 6, 8, 4, 2);
    rect(g, 0x5c5c66, 7, 10, 2, 2);
    rect(g, 0xf3ead3, 7, 5, 2, 3);
    rect(g, 0xf39c12, 7, 3, 2, 2);
    rect(g, 0xf7dc6f, 7, 4, 1, 1);
  });
  make(scene, 'banner', (g) => {
    rect(g, 0x5a3a22, 2, 1, 12, 1);
    rect(g, 0x8e2b2b, 3, 2, 10, 10);
    rect(g, 0x8e2b2b, 3, 12, 4, 2);
    rect(g, 0x8e2b2b, 9, 12, 4, 2);
    rect(g, 0xd4a017, 6, 5, 4, 4);
    rect(g, 0x8e2b2b, 7, 6, 2, 2);
  });
  make(scene, 'jars', (g) => {
    rect(g, 0x5a3a22, 1, 7, 14, 2);
    rect(g, 0x5a3a22, 1, 13, 14, 2);
    rect(g, 0xc89b3c, 2, 3, 3, 4); rect(g, 0xe8d0a0, 2, 3, 3, 1);
    rect(g, 0x7a9a4a, 6, 4, 3, 3); rect(g, 0xe8d0a0, 6, 4, 3, 1);
    rect(g, 0xa0522d, 10, 2, 4, 5); rect(g, 0xe8d0a0, 10, 2, 4, 1);
    rect(g, 0x8e2b2b, 3, 10, 3, 3); rect(g, 0xc89b3c, 8, 9, 4, 4);
  });
  make(scene, 'fruitStall', (g) => {
    for (let x = 0; x < 16; x += 4) {
      rect(g, 0x2e7d4f, x, 1, 2, 4);
      rect(g, 0xe8e0c8, x + 2, 1, 2, 4);
    }
    rect(g, 0x5a3a22, 1, 5, 1, 10);
    rect(g, 0x5a3a22, 14, 5, 1, 10);
    rect(g, 0x7a4b2a, 0, 10, 16, 4);
    rect(g, 0xc0392b, 2, 8, 2, 2); rect(g, 0xe67e22, 5, 8, 2, 2);
    rect(g, 0xf1c40f, 8, 8, 2, 2); rect(g, 0x7ab648, 11, 8, 2, 2);
  });
  make(scene, 'flowerCart', (g) => {
    rect(g, 0x7a4b2a, 1, 7, 13, 5);
    rect(g, 0x9a6a3c, 1, 7, 13, 1);
    rect(g, 0x3a2516, 3, 12, 3, 3); rect(g, 0x3a2516, 10, 12, 3, 3);
    rect(g, 0x5a3a22, 13, 5, 3, 1);
    rect(g, 0x2e7d4f, 2, 4, 11, 3);
    rect(g, 0xe74c8c, 3, 3, 2, 2); rect(g, 0xf1c40f, 6, 2, 2, 2);
    rect(g, 0xe8e0f0, 9, 3, 2, 2); rect(g, 0xc0392b, 11, 4, 2, 2);
  });
  make(scene, 'statue', (g) => {
    rect(g, 0x6e6a70, 3, 13, 10, 3);
    rect(g, 0x9a96a0, 6, 2, 4, 4);
    rect(g, 0x8a868c, 5, 6, 6, 7);
    rect(g, 0x9a96a0, 1, 4, 4, 6); rect(g, 0x9a96a0, 11, 4, 4, 6);
    rect(g, 0xb0acb6, 1, 4, 4, 1); rect(g, 0xb0acb6, 11, 4, 4, 1);
  });
  make(scene, 'candelabra', (g) => {
    rect(g, 0xb8892c, 7, 6, 2, 9);
    rect(g, 0xb8892c, 4, 14, 8, 1);
    rect(g, 0xb8892c, 3, 6, 10, 1);
    for (const x of [3, 7, 12]) {
      rect(g, 0xf3ead3, x, 3, 1, 3);
      rect(g, 0xf39c12, x, 1, 1, 2);
    }
  });
  make(scene, 'flowers', (g) => {
    for (const [x, y, c] of [[3, 9, 0xe74c8c], [7, 6, 0xf1c40f], [11, 10, 0xe8e0f0], [5, 12, 0xc0392b], [12, 5, 0xe74c8c]] as const) {
      rect(g, 0x3d7a46, x, y + 1, 1, 3);
      rect(g, c, x - 1, y, 3, 1);
      rect(g, c, x, y - 1, 1, 3);
    }
  });

  // ── Bakery, guardhouse and town hall ─────────────────────
  make(scene, 'oven', (g) => {
    rect(g, 0x8a4a3a, 1, 2, 14, 14);
    rect(g, 0xa85a46, 1, 2, 14, 1);
    for (let y = 4; y < 16; y += 3) rect(g, 0x6e3a2e, 1, y, 14, 1);
    rect(g, 0x1a1012, 4, 7, 8, 7);
    rect(g, 0xe67e22, 5, 11, 6, 2);
    rect(g, 0xf7dc6f, 6, 12, 4, 1);
  });
  make(scene, 'shopCounter', (g) => {
    rect(g, 0x5a3a22, 0, 4, 16, 11);
    rect(g, 0x9a6a3c, 0, 4, 16, 3);
    rect(g, 0xb8834f, 0, 4, 16, 1);
    rect(g, 0x7a4b2a, 0, 9, 16, 1);
    rect(g, 0xc8893c, 3, 2, 4, 2); rect(g, 0xe0a85a, 3, 2, 4, 1);
  });
  make(scene, 'breadRack', (g) => {
    rect(g, 0x5a3a22, 1, 2, 1, 14); rect(g, 0x5a3a22, 14, 2, 1, 14);
    for (const y of [5, 10, 15]) rect(g, 0x7a4b2a, 1, y, 14, 1);
    for (const [x, y] of [[3, 3], [7, 3], [11, 3], [4, 8], [9, 8], [3, 13], [8, 13], [12, 13]]) {
      rect(g, 0xc8893c, x, y, 3, 2);
      rect(g, 0xe0a85a, x, y, 3, 1);
    }
  });
  make(scene, 'weaponRack', (g) => {
    rect(g, 0x5a3a22, 1, 3, 14, 2);
    rect(g, 0x5a3a22, 1, 12, 14, 2);
    for (const x of [3, 7, 11]) {
      rect(g, 0x7a4b2a, x, 2, 1, 13);
      rect(g, 0xd8dce4, x - 1, 0, 3, 2);
    }
    rect(g, 0x8e2b2b, 12, 6, 3, 5);
    rect(g, 0xd4a017, 13, 8, 1, 1);
  });
  make(scene, 'keyRack', (g) => {
    rect(g, 0x5a3a22, 1, 4, 14, 3);
    rect(g, 0x7a4b2a, 1, 4, 14, 1);
    for (const x of [3, 6, 9, 12]) rect(g, 0x2b2226, x, 7, 1, 2);
    for (const x of [3, 6, 12]) { rect(g, 0xd4a017, x - 1, 9, 3, 2); rect(g, 0xd4a017, x, 11, 1, 3); }
    rect(g, 0xf0ead6, 8, 9, 3, 3);
  });
  make(scene, 'poster', (g) => {
    rect(g, 0xe8dcc0, 3, 2, 10, 12);
    rect(g, 0x8e2b2b, 4, 3, 8, 2);
    rect(g, 0x6a3a7a, 6, 6, 4, 4);
    rect(g, 0x1a1214, 6, 5, 4, 1);
    rect(g, 0x8a7a6a, 4, 11, 8, 1);
    rect(g, 0x2b2226, 7, 1, 2, 1);
  });
  make(scene, 'cellBars', (g) => {
    rect(g, 0x3a3a42, 0, 0, 16, 2);
    rect(g, 0x3a3a42, 0, 14, 16, 2);
    for (let x = 1; x < 16; x += 3) rect(g, 0x8a8a96, x, 0, 1, 16);
  });
  make(scene, 'bookshelf', (g) => {
    rect(g, 0x4a2e1a, 1, 1, 14, 15);
    for (const y of [5, 10, 15]) rect(g, 0x6b4226, 1, y, 14, 1);
    const colors = [0x8e2b2b, 0x2e5a8a, 0x2e7d4f, 0xc68a2a, 0x6a3a7a];
    for (const [i, y] of [[0, 2], [1, 7], [2, 12]]) {
      for (let x = 2; x < 14; x += 2) rect(g, colors[(x + i) % colors.length], x, y, 1, 3);
    }
  });
  make(scene, 'townMap', (g) => {
    rect(g, 0x5a3a22, 1, 2, 14, 12);
    rect(g, 0xe8dcc0, 2, 3, 12, 10);
    rect(g, 0x8a9a6a, 3, 4, 4, 3);
    rect(g, 0x6a8aaa, 9, 8, 4, 3);
    rect(g, 0x8a7a6a, 3, 9, 6, 1); rect(g, 0x8a7a6a, 8, 5, 1, 5);
    rect(g, 0xc0392b, 4, 10, 2, 2); rect(g, 0xc0392b, 11, 4, 2, 2);
  });
  make(scene, 'desk', (g) => {
    rect(g, 0x5a3a22, 0, 3, 16, 9);
    rect(g, 0x7a4b2a, 0, 3, 16, 2);
    rect(g, 0xf0ead6, 2, 4, 5, 3); rect(g, 0xe0d8c4, 9, 4, 4, 2); rect(g, 0xf0ead6, 10, 3, 4, 2);
    rect(g, 0x3a2516, 1, 12, 2, 4); rect(g, 0x3a2516, 13, 12, 2, 4);
  });

  // ── Chapel road, town gate, washing lane ─────────────────
  make(scene, 'shrine', (g) => {
    rect(g, 0x6e6a70, 4, 6, 8, 10);
    rect(g, 0x5c5862, 3, 4, 10, 3);
    rect(g, 0x4a464e, 2, 3, 12, 1);
    rect(g, 0x2b2226, 6, 8, 4, 4);
    rect(g, 0xf3ead3, 7, 9, 2, 3);
    rect(g, 0xf39c12, 7, 8, 2, 1);
  });
  make(scene, 'scarecrow', (g) => {
    rect(g, 0x7a4b2a, 7, 4, 2, 12);
    rect(g, 0x7a4b2a, 2, 6, 12, 2);
    rect(g, 0xd9b45a, 6, 1, 4, 4);
    rect(g, 0x5a3a22, 5, 0, 6, 2);
    rect(g, 0x5a6a8a, 5, 6, 6, 5);
    rect(g, 0xd9b45a, 1, 7, 2, 2); rect(g, 0xd9b45a, 13, 7, 2, 2);
    rect(g, 0x1a1214, 7, 2, 1, 1); rect(g, 0x1a1214, 9, 2, 1, 1);
  });
  make(scene, 'sheep', (g) => {
    rect(g, 0xe8e4dc, 3, 6, 10, 7);
    rect(g, 0xf4f0ea, 4, 5, 8, 2);
    rect(g, 0x3a3436, 11, 7, 4, 4);
    rect(g, 0x3a3436, 4, 13, 1, 2); rect(g, 0x3a3436, 10, 13, 1, 2);
    rect(g, 0xe8e4dc, 13, 8, 1, 1);
  });
  make(scene, 'milestone', (g) => {
    rect(g, 0x8a868c, 4, 4, 8, 12);
    rect(g, 0x9a96a0, 5, 3, 6, 1);
    rect(g, 0x5c5862, 6, 6, 4, 1); rect(g, 0x5c5862, 6, 8, 3, 1); rect(g, 0x5c5862, 6, 10, 4, 1);
    rect(g, 0x3d7a46, 3, 14, 10, 2);
  });
  make(scene, 'brokenCart', (g) => {
    rect(g, 0x7a4b2a, 1, 6, 12, 5);
    rect(g, 0x9a6a3c, 1, 6, 12, 1);
    rect(g, 0x3a2516, 3, 11, 4, 4); rect(g, 0x5a3a22, 4, 12, 2, 2);
    rect(g, 0x3a2516, 11, 13, 4, 2);
    rect(g, 0x5a3a22, 12, 4, 3, 2);
    rect(g, 0xd9b45a, 3, 4, 6, 2);
  });
  make(scene, 'hay', (g) => {
    rect(g, 0xc8a050, 2, 5, 12, 9);
    rect(g, 0xe0c070, 2, 5, 12, 2);
    rect(g, 0x9a7a3a, 2, 9, 12, 1);
    rect(g, 0xe0c070, 4, 3, 2, 2); rect(g, 0xe0c070, 10, 4, 1, 2);
  });
  make(scene, 'horse', (g) => {
    rect(g, 0x7a4b2a, 2, 6, 10, 6);
    rect(g, 0x7a4b2a, 11, 3, 3, 6);
    rect(g, 0x5a3a22, 12, 2, 2, 2);
    rect(g, 0x3a2516, 2, 6, 2, 3);
    rect(g, 0x5a3a22, 3, 12, 1, 4); rect(g, 0x5a3a22, 10, 12, 1, 4);
    rect(g, 0x1a1214, 12, 5, 1, 1);
  });
  // The town's main gate: two halves of a heavy barred gate.
  const townGate = (left: boolean) => (g: G): void => {
    rect(g, 0x3a2a20, 0, 0, 16, 16);
    rect(g, 0x5a3a22, left ? 2 : 0, 2, 14, 14);
    for (let x = left ? 3 : 1; x < (left ? 16 : 14); x += 3) rect(g, 0x7a4b2a, x, 2, 2, 14);
    rect(g, 0x3a3a42, left ? 2 : 0, 5, 14, 2);
    rect(g, 0x3a3a42, left ? 2 : 0, 11, 14, 2);
    rect(g, 0x8a8a96, left ? 14 : 0, 7, 2, 4);
  };
  make(scene, 'townGateL', townGate(true));
  make(scene, 'townGateR', townGate(false));
  make(scene, 'laundry', (g) => {
    rect(g, 0x5a3a22, 0, 2, 1, 14); rect(g, 0x5a3a22, 15, 2, 1, 14);
    rect(g, 0xd8d8d0, 0, 3, 16, 1);
    rect(g, 0xc0392b, 2, 4, 4, 6);
    rect(g, 0xecf0f1, 7, 4, 3, 8);
    rect(g, 0x2e86c1, 11, 4, 3, 5);
  });
  make(scene, 'coop', (g) => {
    rect(g, 0x8a5a33, 2, 6, 12, 9);
    rect(g, 0xa84a3a, 1, 3, 14, 4);
    rect(g, 0xc05a48, 1, 3, 14, 1);
    rect(g, 0x2b1a10, 6, 9, 4, 6);
    rect(g, 0xd9b45a, 3, 13, 3, 2);
  });
  make(scene, 'chicken', (g) => {
    rect(g, 0xf0ece4, 5, 8, 6, 5);
    rect(g, 0xf0ece4, 9, 6, 3, 3);
    rect(g, 0xc0392b, 10, 5, 1, 1);
    rect(g, 0xf39c12, 12, 7, 1, 1);
    rect(g, 0xf39c12, 6, 13, 1, 2); rect(g, 0xf39c12, 9, 13, 1, 2);
  });
  make(scene, 'dog', (g) => {
    rect(g, 0xb07a4a, 3, 9, 10, 5);
    rect(g, 0xb07a4a, 11, 7, 4, 4);
    rect(g, 0x7a4b2a, 11, 7, 1, 3);
    rect(g, 0x1a1214, 13, 9, 2, 1);
    rect(g, 0xb07a4a, 1, 11, 3, 1);
  });
  make(scene, 'outhouse', (g) => {
    rect(g, 0x7a4b2a, 3, 3, 10, 13);
    rect(g, 0x5a3a22, 2, 1, 12, 3);
    rect(g, 0x5a3a22, 7, 3, 1, 13);
    rect(g, 0xf1c40f, 9, 5, 2, 2);
    rect(g, 0x2b1a10, 9, 5, 1, 1);
  });
  make(scene, 'veggies', (g) => {
    rect(g, 0x5a3e26, 1, 2, 14, 12);
    for (const [x, y] of [[3, 4], [8, 4], [12, 4], [3, 9], [8, 9], [12, 9]]) {
      rect(g, 0x3d7a46, x, y, 2, 3);
      rect(g, 0xe67e22, x, y + 3, 2, 1);
    }
  });

  // ── The chapel's front, painted as one 7×4-tile illustration ──
  makeSized(scene, 'chapelFront', 112, 64, (g) => {
    const slate = 0x4a5266, slateLight = 0x6a7490, slateDark = 0x353a4a, slateShade = 0x3a4256;
    const stone = 0xb0a898, stoneLight = 0xc4bcac, mortar = 0x8a8478, stoneDark = 0x8a8072;
    const glass = [0xc0392b, 0x2e6fb0, 0xf1c40f, 0x3d9a56, 0x8e44ad];
    const blocks = (x: number, y: number, w: number, h: number, face: number, top: number) => {
      rect(g, mortar, x, y, w, h);
      for (let r = 0; r * 4 < h; r++) {
        const off = r % 2 ? 4 : 0;
        for (let bx = x - off; bx < x + w; bx += 8) {
          const x0 = Math.max(x, bx + 1);
          const x1 = Math.min(x + w, bx + 7);
          if (x1 > x0) {
            rect(g, face, x0, y + r * 4 + 1, x1 - x0, Math.min(3, h - r * 4 - 1));
            rect(g, top, x0, y + r * 4 + 1, x1 - x0, 1);
          }
        }
      }
    };
    const arch = (x: number, y: number, w: number, h: number) => {
      rect(g, 0x3a3434, x - 1, y + 1, w + 2, h);
      rect(g, 0x3a3434, x, y, w, 1);
    };

    // The long nave roof, running away from you up the screen: the left slope
    // catches the light, the right is in shade, a ridge down the middle.
    for (let y = 0; y < 40; y++) {
      const inset = Math.round((40 - y) * 0.08);
      const left = 4 + inset, right = 108 - inset;
      const joint = y % 4 === 3;
      rect(g, joint ? slate : slateLight, left, y, 56 - left, 1);
      rect(g, joint ? slateDark : slateShade, 56, y, right - 56, 1);
      if (!joint) {
        const off = (Math.floor(y / 4) % 2) * 3;
        for (let x = left + off; x < right; x += 6) rect(g, x < 56 ? slate : slateDark, x, y, 1, 1);
      }
      rect(g, 0x1e2230, left - 1, y, 1, 1);
      rect(g, 0x1e2230, right, y, 1, 1);
    }
    rect(g, 0x1e2230, 7, 0, 98, 1);
    rect(g, 0x2c3244, 55, 0, 2, 40);
    rect(g, 0x8a94aa, 55, 0, 1, 40);
    // A little moss on the roof.
    for (const [x, y] of [[18, 9], [19, 10], [84, 21], [85, 21], [30, 30], [72, 6]]) rect(g, 0x4a7a46, x, y, 2, 1);

    // The front gable end, with a slate verge.
    for (let y = 22; y <= 40; y++) {
      const half = Math.round((y - 22) * 2.9);
      rect(g, 0x1e2230, 56 - half - 2, y, half * 2 + 4, 1);
      if (half > 2) rect(g, slateDark, 56 - half, y, half * 2, 1);
      if (half > 5) rect(g, stone, 56 - half + 3, y, half * 2 - 6, 1);
    }
    // Nave front wall, with the eave line along the top.
    blocks(8, 40, 96, 24, stone, stoneLight);
    rect(g, slateDark, 4, 39, 104, 2);
    // Buttresses at the corners.
    for (const bx of [8, 100]) { rect(g, stoneDark, bx, 41, 4, 23); rect(g, stoneLight, bx, 41, 1, 23); }
    // Tall stained-glass windows either side.
    for (const wx of [20, 82]) {
      arch(wx, 44, 10, 16);
      let i = wx;
      for (let y = 46; y < 59; y += 3) {
        rect(g, glass[i++ % glass.length], wx, y, 4, 2);
        rect(g, glass[i++ % glass.length], wx + 5, y, 5, 2);
      }
      rect(g, 0x5a5048, wx + 4, 45, 1, 15);
    }
    // Small round windows high in the gable.
    for (const wx of [32, 74]) {
      rect(g, 0x3a3434, wx + 1, 31, 4, 6);
      rect(g, 0x3a3434, wx, 32, 6, 4);
      rect(g, glass[(wx / 2) % glass.length], wx + 1, 33, 4, 2);
      rect(g, glass[(wx / 2) % glass.length], wx + 2, 32, 2, 4);
    }

    // The bell tower, standing in front of the gable.
    blocks(44, 14, 24, 50, stoneLight, 0xd4ccbc);
    rect(g, stoneDark, 44, 14, 24, 2);
    rect(g, stoneDark, 44, 14, 1, 50);
    rect(g, stoneDark, 67, 14, 1, 50);
    // Spire and cross.
    for (let y = 4; y <= 14; y++) {
      const half = Math.round((y - 4) * 1.35);
      rect(g, 0x1e2230, 56 - half - 1, y, half * 2 + 2, 1);
      if (half > 0) rect(g, y % 3 === 0 ? 0x2c3244 : 0x3a4256, 56 - half, y, half * 2, 1);
    }
    rect(g, 0x5e6880, 56, 6, 1, 8);
    rect(g, 0xd4a017, 55, 0, 2, 6);
    rect(g, 0xd4a017, 53, 1, 6, 2);
    rect(g, 0xf7dc6f, 55, 1, 1, 1);
    // The empty bell arch (the bell is what you're looking for).
    rect(g, 0x1a1418, 51, 20, 10, 8);
    rect(g, 0x1a1418, 52, 18, 8, 2);
    rect(g, 0x1a1418, 54, 17, 4, 1);
    rect(g, 0x3a2e30, 52, 26, 8, 2);
    rect(g, stoneDark, 50, 28, 12, 1);
    // A little rose window.
    rect(g, 0x3a3434, 52, 32, 8, 8);
    rect(g, 0x3a3434, 51, 33, 10, 6);
    for (const [x, y, c] of [[53, 33, 0], [57, 33, 1], [52, 35, 2], [58, 35, 3], [53, 37, 1], [57, 37, 0]]) rect(g, glass[c], x, y, 2, 2);
    rect(g, 0xf7dc6f, 55, 35, 2, 2);
    // A doorstep at the tower's base (the door itself is drawn on top).
    rect(g, stoneDark, 46, 62, 20, 2);

    // Ivy creeping up the left corner.
    rect(g, 0x3d7a46, 9, 50, 3, 14); rect(g, 0x4a8a50, 11, 54, 3, 6); rect(g, 0x2e5a34, 8, 58, 2, 6);
  });
  // The bell tower, seen from the Close: 4×6 tiles, the double door drawn on top.
  makeSized(scene, 'towerFront', 64, 96, (g) => {
    const stone = 0xb0a898, stoneLight = 0xc4bcac, mortar = 0x8a8478, stoneDark = 0x7a7266;
    const blocks = (x: number, y: number, w: number, h: number) => {
      rect(g, mortar, x, y, w, h);
      for (let r = 0; r * 4 < h; r++) {
        const off = r % 2 ? 4 : 0;
        for (let bx = x - off; bx < x + w; bx += 8) {
          const x0 = Math.max(x, bx + 1);
          const x1 = Math.min(x + w, bx + 7);
          if (x1 > x0) {
            rect(g, stone, x0, y + r * 4 + 1, x1 - x0, Math.min(3, h - r * 4 - 1));
            rect(g, stoneLight, x0, y + r * 4 + 1, x1 - x0, 1);
          }
        }
      }
    };
    // Shaft, with darker corner quoins.
    blocks(8, 44, 48, 52);
    for (const qx of [8, 52]) for (let y = 44; y < 96; y += 8) rect(g, stoneDark, qx, y + 1, 4, 3);
    rect(g, 0x5a5048, 8, 44, 1, 52); rect(g, 0x5a5048, 55, 44, 1, 52);
    // Belfry, a little narrower, with a cornice under it.
    blocks(11, 22, 42, 22);
    rect(g, 0x5a5048, 11, 22, 1, 22); rect(g, 0x5a5048, 52, 22, 1, 22);
    rect(g, 0x353a4a, 6, 43, 52, 3); rect(g, 0x5e6880, 6, 43, 52, 1);
    // Two arched openings: no bell, just darkness, and something's eyes.
    for (const ox of [16, 36]) {
      rect(g, 0x1a1418, ox, 27, 12, 15);
      rect(g, 0x1a1418, ox + 1, 25, 10, 2);
      rect(g, 0x1a1418, ox + 3, 24, 6, 1);
      rect(g, stoneDark, ox - 1, 41, 14, 2);
    }
    for (const [ex, ey] of [[19, 31], [23, 30], [39, 33], [43, 31], [41, 36]]) {
      rect(g, 0xf7dc6f, ex, ey, 2, 1);
    }
    // Slate spire with an outline, and a gold weathervane.
    for (let y = 3; y <= 22; y++) {
      const half = Math.round((y - 3) * 1.25);
      rect(g, 0x1e2230, 32 - half - 1, y, half * 2 + 2, 1);
      if (half > 0) rect(g, y % 3 === 0 ? 0x2c3244 : 0x3a4256, 32 - half, y, half * 2, 1);
    }
    rect(g, 0x5e6880, 32, 6, 1, 15);
    rect(g, 0xd4a017, 31, 0, 2, 4); rect(g, 0xd4a017, 28, 1, 8, 1);
    // The clock, stopped at 11:52 like the one on Hall Street.
    rect(g, 0x3a3434, 26, 50, 12, 12); rect(g, 0x3a3434, 25, 51, 14, 10);
    rect(g, 0xf0e6c8, 27, 51, 10, 10); rect(g, 0xf0e6c8, 26, 52, 12, 8);
    rect(g, 0x1a1418, 31, 52, 2, 5); rect(g, 0x1a1418, 28, 55, 4, 1);
    rect(g, 0xd4a017, 31, 55, 2, 2);
    // Arrow-slit windows.
    for (const wx of [16, 46]) { rect(g, 0x1a1418, wx, 64, 2, 8); rect(g, 0x1a1418, wx - 1, 67, 4, 1); }
    // Arch over the double door.
    rect(g, 0x3a3434, 14, 78, 36, 2); rect(g, 0x3a3434, 17, 76, 30, 2); rect(g, 0x3a3434, 21, 75, 22, 1);
    rect(g, stoneDark, 14, 80, 2, 16); rect(g, stoneDark, 48, 80, 2, 16);
    // Ivy up the right side.
    rect(g, 0x3d7a46, 50, 70, 3, 26); rect(g, 0x4a8a50, 47, 76, 4, 6); rect(g, 0x2e5a34, 52, 64, 2, 8);
  });
  // The water mill: 4×3 tiles, timber and stone, the door drawn on top.
  makeSized(scene, 'millFront', 64, 48, (g) => {
    // roof
    for (let y = 0; y < 16; y++) {
      const half = 14 + y;
      rect(g, y % 3 === 2 ? 0x6b3a22 : 0x8a4a2a, 32 - half, y + 2, half * 2, 1);
    }
    rect(g, 0x4a2616, 2, 17, 60, 2);
    // walls: stone below, timber above
    rect(g, 0xe8dcc0, 4, 19, 56, 12);
    for (const bx of [4, 18, 32, 46, 58]) rect(g, 0x5a3a22, bx, 19, 2, 12);
    rect(g, 0x5a3a22, 4, 24, 56, 2);
    rect(g, 0x8a8478, 4, 31, 56, 17);
    for (let r = 0; r < 4; r++) for (let bx = (r % 2) * 4 + 4; bx < 60; bx += 8) rect(g, 0xa8a090, bx, 32 + r * 4, 7, 3);
    // windows with warm light, and a hoist beam
    for (const wx of [10, 46]) { rect(g, 0x3a2516, wx, 20, 8, 7); rect(g, 0xf1c40f, wx + 1, 21, 6, 5); rect(g, 0x3a2516, wx + 4, 21, 1, 5); }
    rect(g, 0x5a3a22, 28, 8, 8, 2); rect(g, 0x5a3a22, 34, 10, 1, 6); rect(g, 0xd8c8a0, 33, 15, 3, 3);
    // a flour sack by the door
    rect(g, 0xe0d4b4, 34, 40, 6, 8); rect(g, 0xc0b494, 34, 40, 6, 1);
  });
  // The mill wheel (it turns: see the scene).
  make(scene, 'millWheel', (g) => {
    g.fillStyle(0x5a3a22, 1); g.fillCircle(8, 8, 7);
    g.fillStyle(0x2a5a8a, 1); g.fillCircle(8, 8, 5);
    rect(g, 0x7a4b2a, 7, 1, 2, 14); rect(g, 0x7a4b2a, 1, 7, 14, 2);
    rect(g, 0x9a6a3c, 3, 3, 2, 2); rect(g, 0x9a6a3c, 11, 11, 2, 2); rect(g, 0x9a6a3c, 11, 3, 2, 2); rect(g, 0x9a6a3c, 3, 11, 2, 2);
    rect(g, 0x3a2516, 7, 7, 2, 2);
  });
  // The same wheel, stopped (it doesn't turn in the scene).
  make(scene, 'millWheelStill', (g) => {
    g.fillStyle(0x5a3a22, 1); g.fillCircle(8, 8, 7);
    g.fillStyle(0x2a5a8a, 1); g.fillCircle(8, 8, 5);
    rect(g, 0x7a4b2a, 7, 1, 2, 14); rect(g, 0x7a4b2a, 1, 7, 14, 2);
    rect(g, 0x9a6a3c, 3, 3, 2, 2); rect(g, 0x9a6a3c, 11, 11, 2, 2); rect(g, 0x9a6a3c, 11, 3, 2, 2); rect(g, 0x9a6a3c, 3, 11, 2, 2);
    rect(g, 0x3a2516, 7, 7, 2, 2);
    rect(g, 0xa8d0f0, 4, 14, 1, 2); rect(g, 0xa8d0f0, 12, 13, 1, 2);
  });
  // Millstones: two great round stones, one on the other.
  make(scene, 'millstone', (g) => {
    g.fillStyle(0x4a464e, 1); g.fillCircle(8, 9, 7);
    g.fillStyle(0x8a868c, 1); g.fillCircle(8, 8, 6);
    g.fillStyle(0x9a96a0, 1); g.fillCircle(7, 7, 4);
    rect(g, 0x3a3640, 7, 7, 2, 2);
    rect(g, 0xe8e0d0, 3, 12, 3, 1); rect(g, 0xe8e0d0, 11, 13, 2, 1);
  });
  // A goose. Wide awake. Hostile.
  make(scene, 'goose', (g) => {
    rect(g, 0x1a1214, 3, 6, 9, 7); rect(g, 0x1a1214, 9, 1, 4, 7);
    rect(g, 0xf4f0e8, 4, 7, 7, 5); rect(g, 0xf4f0e8, 10, 2, 2, 6);
    rect(g, 0xd8d0c0, 4, 10, 6, 2);
    rect(g, 0xf08a24, 12, 3, 3, 2); rect(g, 0x1a1214, 11, 2, 1, 1);
    rect(g, 0xf08a24, 6, 13, 1, 2); rect(g, 0xf08a24, 9, 13, 1, 2);
  });
  make(scene, 'duck', (g) => {
    rect(g, 0x6a4a2a, 4, 8, 8, 4); rect(g, 0x2e6a3a, 10, 5, 3, 4); rect(g, 0xf1c40f, 13, 6, 2, 1);
    rect(g, 0x8a6a4a, 5, 8, 5, 1); rect(g, 0x3a6e9e, 3, 12, 10, 1);
  });
  make(scene, 'reeds', (g) => {
    for (const [x, h] of [[3, 9], [6, 12], [9, 8], [12, 11]]) {
      rect(g, 0x4a7a3a, x, 16 - h, 1, h); rect(g, 0x6a4a2a, x, 16 - h, 1, 3);
    }
    rect(g, 0x5a8a4a, 4, 10, 2, 1); rect(g, 0x5a8a4a, 10, 9, 2, 1);
  });
  make(scene, 'rowboat', (g) => {
    rect(g, 0x3a2516, 2, 4, 12, 9); rect(g, 0x8a5a33, 3, 5, 10, 7); rect(g, 0x6b4226, 4, 6, 8, 5);
    rect(g, 0x8a5a33, 3, 8, 10, 1); rect(g, 0x9a6a3c, 1, 10, 14, 1);
  });
  // A whirling swarm of little moths.
  make(scene, 'mothSwarm', (g) => {
    for (const [x, y] of [[1, 2], [9, 0], [11, 6], [4, 7], [9, 11], [1, 12], [6, 3], [12, 13]]) {
      rect(g, 0x2a2030, x, y, 4, 3);
      rect(g, 0xece4fa, x, y, 1, 2); rect(g, 0xece4fa, x + 3, y, 1, 2);
      rect(g, 0xc8b8e0, x + 1, y + 1, 2, 1);
    }
    for (const [x, y] of [[6, 1], [0, 9], [14, 9], [8, 15], [15, 3], [7, 9]]) rect(g, 0xf7dc6f, x, y, 1, 1);
  });
  // A wall of tools in painted outlines, bolt cutters front and centre.
  make(scene, 'toolRack', (g) => {
    rect(g, 0x4a2e1a, 1, 1, 14, 14);
    rect(g, 0x7a4b2a, 2, 2, 12, 12);
    rect(g, 0x5a3a22, 2, 5, 12, 1); rect(g, 0x5a3a22, 2, 10, 12, 1);
    rect(g, 0x8a8a96, 3, 3, 1, 6); rect(g, 0x55565e, 2, 3, 3, 2);
    rect(g, 0x8a8a96, 12, 3, 1, 6); rect(g, 0x55565e, 11, 8, 3, 2);
    rect(g, 0x8a8a96, 7, 2, 2, 4);
    rect(g, 0x8a8a96, 6, 6, 1, 7); rect(g, 0x8a8a96, 9, 6, 1, 7);
    rect(g, 0xc0392b, 5, 10, 2, 4); rect(g, 0xc0392b, 9, 10, 2, 4);
  });

  // The chapel door: an arched double door, drawn over the tower's base.
  make(scene, 'chapelDoor', (g) => {
    rect(g, 0x3a3434, 2, 1, 12, 15);
    rect(g, 0x3a3434, 4, 0, 8, 1);
    rect(g, 0x6b3a22, 3, 2, 10, 14);
    rect(g, 0x6b3a22, 5, 1, 6, 1);
    rect(g, 0x8a5030, 3, 2, 10, 1);
    rect(g, 0x3a2516, 7, 1, 2, 15);
    rect(g, 0x3a3a42, 3, 6, 10, 1);
    rect(g, 0x3a3a42, 3, 11, 10, 1);
    rect(g, 0xd4a017, 6, 8, 1, 2); rect(g, 0xd4a017, 9, 8, 1, 2);
  });

  // ── Tower floors, market street, smithy, apothecary ──────
  // Stairs up, sealed with thick moth silk.
  make(scene, 'webbedStairs', (g) => {
    const shades = [0x9a9ca6, 0x868892, 0x72747e, 0x5e606a, 0x4b4d57];
    shades.forEach((c, i) => rect(g, c, 2, 1 + i * 3, 12, 3));
    const silk = 0xe8e4f0;
    for (let i = 0; i < 14; i++) { rect(g, silk, 1 + i, i, 1, 1); rect(g, silk, 14 - i, i, 1, 1); }
    rect(g, silk, 1, 5, 14, 1); rect(g, silk, 1, 10, 14, 1); rect(g, silk, 7, 0, 2, 16);
    rect(g, 0xd0c8e0, 4, 3, 8, 2); rect(g, 0xd0c8e0, 3, 8, 10, 2);
  });
  // A gap where the stair has rotted away.
  make(scene, 'pit', (g) => {
    rect(g, 0x0a0708, 0, 0, 16, 16);
    rect(g, 0x1a1214, 0, 0, 16, 2);
    rect(g, 0x3a2516, 0, 0, 3, 1); rect(g, 0x3a2516, 9, 0, 4, 1);
    rect(g, 0x3a2516, 2, 14, 5, 2); rect(g, 0x3a2516, 11, 15, 4, 1);
  });
  // The town clock's works, jammed with silk.
  make(scene, 'gears', (g) => {
    const gear = (cx: number, cy: number, r: number, c: number) => {
      g.fillStyle(c, 1); g.fillCircle(cx, cy, r);
      g.fillStyle(0x2a2630, 1); g.fillCircle(cx, cy, Math.max(1, r - 3));
      g.fillStyle(c, 1); g.fillCircle(cx, cy, 1);
    };
    gear(5, 6, 5, 0xb8892c); gear(11, 10, 4, 0x8a8a96); gear(4, 13, 3, 0xb8892c);
    rect(g, 0xe8e4f0, 1, 8, 14, 1); rect(g, 0xe8e4f0, 6, 2, 1, 12);
  });
  make(scene, 'forge', (g) => {
    rect(g, 0x5c5862, 1, 2, 14, 14);
    rect(g, 0x7a7680, 1, 2, 14, 1);
    rect(g, 0x2a2630, 3, 6, 10, 7);
    rect(g, 0xe74c3c, 4, 10, 8, 3);
    rect(g, 0xf39c12, 5, 10, 6, 2);
    rect(g, 0xf7dc6f, 7, 11, 2, 1);
    rect(g, 0x3a3640, 6, 0, 4, 2);
  });
  make(scene, 'anvil', (g) => {
    rect(g, 0x3a3a42, 2, 6, 12, 3);
    rect(g, 0x5c5c66, 2, 6, 12, 1);
    rect(g, 0x3a3a42, 0, 6, 3, 2);
    rect(g, 0x2a2a32, 5, 9, 6, 3);
    rect(g, 0x5a3a22, 3, 12, 10, 4);
  });
  make(scene, 'lumber', (g) => {
    for (let i = 0; i < 4; i++) {
      rect(g, 0x9a6a3c, 1, 4 + i * 3, 14, 2);
      rect(g, 0xb8834f, 1, 4 + i * 3, 14, 1);
      rect(g, 0x5a3a22, 1, 6 + i * 3, 14, 1);
    }
  });
  make(scene, 'saltsCounter', (g) => {
    rect(g, 0x5a3a22, 0, 6, 16, 9);
    rect(g, 0x9a6a3c, 0, 6, 16, 2);
    rect(g, 0x2e6fb0, 3, 2, 3, 4); rect(g, 0xecf0f1, 3, 1, 3, 1);
    rect(g, 0x3d9a56, 8, 3, 2, 3); rect(g, 0x8e44ad, 11, 2, 3, 4); rect(g, 0xecf0f1, 11, 1, 3, 1);
  });
  make(scene, 'fountain', (g) => {
    rect(g, 0x8a868c, 1, 6, 14, 8);
    rect(g, 0x9a96a0, 1, 6, 14, 1);
    rect(g, 0x2e6fb0, 3, 8, 10, 4);
    rect(g, 0x5a9ad0, 4, 8, 4, 1);
    rect(g, 0x9a96a0, 7, 1, 2, 7);
    rect(g, 0x9ac8f0, 6, 0, 4, 2);
  });
  make(scene, 'closedStall', (g) => {
    rect(g, 0x5a3a22, 1, 3, 1, 12); rect(g, 0x5a3a22, 14, 3, 1, 12);
    rect(g, 0x7a4b2a, 0, 9, 16, 5);
    rect(g, 0x8a7a6a, 1, 2, 14, 8);
    rect(g, 0x6a5a4a, 1, 5, 14, 1);
    rect(g, 0xf0ead6, 5, 6, 6, 3);
    rect(g, 0xc0392b, 6, 7, 4, 1);
  });

  // ── Hanging shop signs: an iron bracket and a painted board with an icon ──
  const shopSign = (key: string, icon: (g: G) => void) => make(scene, key, (g) => {
    rect(g, 0x2b2226, 0, 1, 15, 1);
    rect(g, 0x2b2226, 0, 0, 1, 3);
    rect(g, 0x5c5c66, 3, 2, 1, 2); rect(g, 0x5c5c66, 12, 2, 1, 2);
    rect(g, 0x4a2e1a, 2, 4, 12, 11);
    rect(g, 0x9a6a3c, 3, 5, 10, 9);
    rect(g, 0xb8834f, 3, 5, 10, 1);
    icon(g);
  });
  shopSign('signBakery', (g) => {
    rect(g, 0xc8893c, 4, 8, 8, 4);
    rect(g, 0xe0a85a, 5, 7, 6, 2);
    rect(g, 0x8a5a2a, 6, 8, 1, 2); rect(g, 0x8a5a2a, 8, 8, 1, 2); rect(g, 0x8a5a2a, 10, 8, 1, 2);
  });
  shopSign('signHall', (g) => {
    rect(g, 0x2e5a8a, 5, 6, 6, 5);
    rect(g, 0x2e5a8a, 6, 11, 4, 1); rect(g, 0x2e5a8a, 7, 12, 2, 1);
    rect(g, 0xd4a017, 7, 7, 2, 4); rect(g, 0xd4a017, 6, 8, 4, 1);
  });
  shopSign('signGuard', (g) => {
    rect(g, 0x8e2b2b, 4, 7, 5, 4); rect(g, 0x8e2b2b, 5, 11, 3, 1); rect(g, 0x8e2b2b, 6, 12, 1, 1);
    rect(g, 0xd4a017, 6, 8, 1, 2);
    rect(g, 0x5a3a22, 11, 6, 1, 8);
    rect(g, 0xd8dce4, 10, 5, 3, 2);
  });
  shopSign('signSmithy', (g) => {
    rect(g, 0x3a3a42, 5, 8, 7, 2);
    rect(g, 0x3a3a42, 3, 8, 3, 1);
    rect(g, 0x3a3a42, 7, 10, 3, 2);
    rect(g, 0x5c5c66, 5, 8, 7, 1);
    rect(g, 0x5a3a22, 9, 5, 1, 3); rect(g, 0x5c5c66, 8, 5, 3, 1);
  });
  shopSign('signApothecary', (g) => {
    rect(g, 0x3d9a56, 5, 9, 6, 4);
    rect(g, 0x3d9a56, 6, 8, 4, 1);
    rect(g, 0xb8e8c4, 6, 9, 2, 1);
    rect(g, 0xd8d4c8, 7, 6, 2, 2);
    rect(g, 0x8a5a33, 7, 5, 2, 1);
  });

  // ── Direction signs: a post with an arrow-shaped board ──
  const board = (g: G, x: number, y: number, w: number, point: 'L' | 'R') => {
    rect(g, 0x4a2e1a, x, y, w, 4);
    rect(g, 0xb8834f, x + 1, y + 1, w - 2, 2);
    if (point === 'R') { rect(g, 0x4a2e1a, x + w, y + 1, 1, 2); rect(g, 0xb8834f, x + w - 1, y + 1, 1, 2); }
    else { rect(g, 0x4a2e1a, x - 1, y + 1, 1, 2); rect(g, 0xb8834f, x, y + 1, 1, 2); }
  };
  const post = (g: G) => { rect(g, 0x5a3a22, 7, 4, 2, 12); rect(g, 0x3d7a46, 5, 15, 6, 1); };
  make(scene, 'signRight', (g) => { post(g); board(g, 3, 4, 10, 'R'); rect(g, 0x4a2e1a, 6, 6, 3, 1); });
  make(scene, 'signLeft', (g) => { post(g); board(g, 3, 4, 10, 'L'); rect(g, 0x4a2e1a, 7, 6, 3, 1); });
  make(scene, 'signUp', (g) => {
    post(g);
    rect(g, 0x4a2e1a, 4, 4, 8, 6); rect(g, 0xb8834f, 5, 5, 6, 4);
    rect(g, 0x4a2e1a, 7, 5, 2, 3); rect(g, 0x4a2e1a, 6, 6, 4, 1);
  });
  make(scene, 'signDown', (g) => {
    post(g);
    rect(g, 0x4a2e1a, 4, 4, 8, 6); rect(g, 0xb8834f, 5, 5, 6, 4);
    rect(g, 0x4a2e1a, 7, 6, 2, 3); rect(g, 0x4a2e1a, 6, 7, 4, 1);
  });
  // The crossroads signpost: arms pointing every which way.
  make(scene, 'signMulti', (g) => {
    rect(g, 0x5a3a22, 7, 1, 2, 15);
    rect(g, 0x3d7a46, 5, 15, 6, 1);
    board(g, 1, 2, 6, 'L');
    board(g, 9, 4, 6, 'R');
    board(g, 2, 8, 5, 'L');
    board(g, 9, 10, 5, 'R');
    rect(g, 0xd4a017, 7, 0, 2, 1);
  });

  // ── Road exits: a chevron arrow pointing toward the next area ──
  // Drawn pointing right, then rotated for the other directions.
  const chevron = (dir: 'Right' | 'Left' | 'Up' | 'Down') => (g: G): void => {
    const pts: [number, number][] = [];
    for (let i = 0; i < 5; i++) { pts.push([5 + i, 3 + i]); pts.push([5 + i, 12 - i]); }
    for (let i = 0; i < 5; i++) { pts.push([1 + i, 3 + i]); pts.push([1 + i, 12 - i]); }
    const map = ([x, y]: [number, number]): [number, number] =>
      dir === 'Right' ? [x + 2, y] : dir === 'Left' ? [13 - x, y] : dir === 'Down' ? [y, x + 2] : [y, 13 - x];
    for (const p of pts) { const [x, y] = map(p); rect(g, 0x7a5a32, x - 1, y, 3, 2); }
    for (const p of pts) { const [x, y] = map(p); rect(g, 0xfbe6a6, x, y, 1, 1); }
  };
  make(scene, 'exitRight', chevron('Right'));
  make(scene, 'exitLeft', chevron('Left'));
  make(scene, 'exitUp', chevron('Up'));
  make(scene, 'exitDown', chevron('Down'));

  // ── Effects for idle animations ──────────────────────────
  glow(scene, 'glow', 0xf7c95c, 32);
  glow(scene, 'glowPurple', 0xb07ae0, 32);
  glow(scene, 'glowPink', 0xff4fa8, 32);
  // A pink neon INN sign on the inn's front.
  make(scene, 'neonInn', (g) => {
    rect(g, 0x2b1a20, 0, 3, 16, 10);
    rect(g, 0x4a2e1a, 0, 3, 16, 1);
    const neon = 0xff5fb4;
    const core = 0xffd0ea;
    // I
    rect(g, neon, 2, 5, 1, 6);
    // N
    rect(g, neon, 5, 5, 1, 6); rect(g, neon, 8, 5, 1, 6); rect(g, neon, 6, 6, 1, 2); rect(g, neon, 7, 8, 1, 2);
    // N
    rect(g, neon, 10, 5, 1, 6); rect(g, neon, 13, 5, 1, 6); rect(g, neon, 11, 6, 1, 2); rect(g, neon, 12, 8, 1, 2);
    rect(g, core, 2, 7, 1, 1); rect(g, core, 5, 6, 1, 1); rect(g, core, 13, 9, 1, 1);
  });
  make(scene, 'sparkle', (g) => {
    rect(g, 0xffffff, 7, 6, 1, 3);
    rect(g, 0xffffff, 6, 7, 3, 1);
  });
  make(scene, 'zz', (g) => {
    rect(g, 0xffffff, 0, 0, 3, 1);
    rect(g, 0xffffff, 1, 1, 1, 1);
    rect(g, 0xffffff, 0, 2, 3, 1);
  });

  makeCharacters(scene);
  // Town guard, asleep at their post: helmet, plate armour, spear and shield.
  figure(scene, 'sleeperGuard', {
    H: 0x8a8a96, S: 0xd4a373, C: 0x9aa0aa, P: 0x55565e, W: 0xc8ccd4,
    M: 0xd8dce4, L: 0x7a4b2a, A: 0x8e2b2b, Y: 0xd4a017,
  }, [
    '............M...',
    '.....KKKKKKMMM..',
    '....KHHHHHHKL...',
    '....KHSSSSHKL...',
    '............L...',
    '............L...',
    '............L...',
    '......WW....L...',
    '..AAA.......L...',
    '..AYA.......L...',
    '..AAA.......L...',
    '...A........L...',
    '............L...',
    '............L...',
  ], PERSON_ASLEEP);
  sleeper(scene, 'sleeperBaker', 0xc0a080, 0xf5cba7, 0xe8e0d0, 0x5a3a22);
  sleeper(scene, 'sleeperButcher', 0x3a2a20, 0xd4a373, 0xc76a5a, 0x3a3a3a);
  sleeper(scene, 'sleeperLamp', 0x5a4a3a, 0xc68642, 0x6a5a3a, 0x2c2c2c);
  sleeper(scene, 'sleeperMayor', 0xb0b0b8, 0xf0c8a0, 0x2e4a7a, 0x2c2c2c);
  sleeper(scene, 'sleeperApprentice', 0xe8e0d0, 0xf5cba7, 0xecf0f1, 0x5a3a22);
  sleeper(scene, 'sleeperShepherd', 0x6a5a3a, 0xd4a373, 0x8a7a4a, 0x4a3a2a);
  sleeper(scene, 'sleeperWasher', 0xa0522d, 0xf1c27d, 0x7a9ab0, 0x4a4a52);
  sleeper(scene, 'sleeperSmith', 0x2a1f1a, 0xc68642, 0x5a3a22, 0x3a3a3a);
  sleeper(scene, 'sleeperApothecary', 0xe0e0e0, 0xf5cba7, 0x3d7a46, 0x2c2c2c);
  sleeper(scene, 'sleeperMerchant', 0x8a5a33, 0xd4a373, 0xc0703e, 0x4a3a2a);
  sleeper(scene, 'sleeperCrier', 0x6a4a2a, 0xf1c27d, 0xb03a2e, 0x2c2c3a);
  sleeper(scene, 'sleeperMiller', 0xf0f0f0, 0xe0ac69, 0xd8d0b8, 0x5a4a3a);
  sleeper(scene, 'sleeperFisher', 0x3a2a1a, 0xc68642, 0x3a6a5a, 0x4a4a52);
  sleeper(scene, 'sleeperRinger', 0xd8d8d8, 0xe0ac69, 0x6a4a8a, 0x3a3a3a);
  // Awake town guards on quarantine duty: open eyes, spear and shield.
  const awakeGuard = (key: string, cape: number) => figure(scene, key, {
    H: 0x8a8a96, S: 0xd4a373, C: 0x9aa0aa, P: 0x55565e, W: 0xc8ccd4,
    M: 0xd8dce4, L: 0x7a4b2a, A: cape, Y: 0xd4a017,
  }, [
    '............M...',
    '.....KKKKKKMMM..',
    '....KHHHHHHKL...',
    '....KHSSSSHKL...',
    '............L...',
    '............L...',
    '............L...',
    '......WW....L...',
    '..AAA.......L...',
    '..AYA.......L...',
    '..AAA.......L...',
    '...A........L...',
    '............L...',
    '............L...',
  ]);
  awakeGuard('guardAwake', 0x2e5a8a);
  // A sleeping guard you've woken looks like any other guard on duty.
  awakeGuard('sleeperGuardAwake', 0x2e5a8a);
  awakeGuard('sergeant', 0x8e2b2b);
  // A sleepwalking recruit: drilling with his sword, fast asleep.
  awakeGuard('recruit', 0x3d7a46);
  // Cousin Ned: Bram's cousin, awake, with a bandaged hand.
  figure(scene, 'ned', { H: 0x6b6b6b, S: 0xd4a373, C: 0x6a7a4a, P: 0x4a3a2a, W: 0xf0ece4, B: 0x8a7a6a }, [
    '................',
    '................',
    '....KSSSSSSK....',
    '................',
    '................',
    '....KSBBBBSK....',
    '................',
    '................',
    '................',
    '...KW......SK...',
    '...KWW.....SK...',
  ]);
  // Pip, awake behind bars: scruffy hair, striped prison shirt, bars in front.
  figure(scene, 'prisoner', { H: 0x6a4a2a, S: 0xe8b890, C: 0xd8d0c0, P: 0x5a5a62, A: 0x4a4a52, M: 0x8a8a96 }, [
    '................',
    '....HHHHHH......',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '.....AAAAAA.....',
    '................',
    '.....AAAAAA.....',
    '................',
    '................',
  ]);
}
