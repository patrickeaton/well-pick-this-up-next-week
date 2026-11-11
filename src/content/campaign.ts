import type { ActionDef, AreaDef, AreaId, CheckDef, Ctx, EndingId, ObjectDef, PageDef, Speaker } from '../game/types';

/*
 * The Long Sleep of Harrowmere.
 *
 * The whole town has fallen into a magical sleep. The Night Warden, a giant
 * moth, roosts in the bell tower. Ring the Bell of Harrowmere from the tower
 * to wake everyone.
 *
 * Every step has more than one way through, so a locked door or a bad roll
 * never leaves you stuck:
 *  - Into the cellar: the iron key (fireplace ashes), force the door, or the
 *    coal chute from the town square.
 *  - The bell from the mimic chest: an exact 13, the Groundhog amulet (once
 *    Old Moss's IOU has shown you the table), or toss it the butcher's ham.
 *  - Up the tower: Sister Wren's key (show her the bell), climb the wall, or
 *    Vex's key (once you know who he works for).
 *  - Bless the bell: Wren with well water, or pray at the altar.
 *
 * Endings (each one counts as finishing the campaign):
 *  - TPK: ring an unblessed bell while the Warden is there, or lose the fight.
 *  - Bad: sell the bell to Vex, or ring an unblessed bell after driving the
 *    Warden off (it cracks).
 *  - Good: ring the blessed bell.
 *  - Secret: bury G.'s d20 in his grave, meet him in the crypt, give him the
 *    bell. Needs Sister Wren's note, which you only get from the good ending.
 *
 * Each ending leaves a page in the binder that opens new routes next time.
 */

export const AMULET_CHARGES = 1;

export const MISSION =
  'Mission: ring the Bell of Harrowmere from the bell tower before everyone at the table falls asleep. Click things on the map to explore.';

export const AREAS: Record<AreaId, AreaDef> = {
  inn: {
    id: 'inn',
    name: 'The Rusty Lantern Inn',
    intro: 'Back in the Rusty Lantern. The fire\'s still going, and everyone\'s still asleep at their tables. Except Bram.',
    floor: 'plank',
    tiles: [
      '##################',
      '#ccccc#..........#',
      '#ccccc#..........#',
      '#ccccc#..........#',
      '#ccccc...........#',
      '#######..........#',
      '#................#',
      '#................#',
      '#................#',
      '#................#',
      '##################',
    ],
  },
  cellar: {
    id: 'cellar',
    name: 'The Cellar',
    intro: 'The cellar. Damp, dark, smells like old wine and older secrets. There is a chest in the corner that you get a bad feeling about.',
    floor: 'stone',
    tiles: [
      '##################',
      '##################',
      '####.........#####',
      '####.........#####',
      '####.........#####',
      '####.........#####',
      '####.........#####',
      '##################',
      '##################',
      '##################',
      '##################',
    ],
  },
  square: {
    id: 'square',
    name: 'Harrowmere Town Square',
    intro: 'Harrowmere town square. Shops all round, a well in the middle, and townsfolk asleep exactly where they stood. Streets lead off every which way.',
    floor: 'cobble',
    alt: 'grass',
    wall: 'facade',
    // r/o/s: red, orange and slate roofs. t: the inn's timber front.
    // p: the bakery's plaster. h: dressed stone (town hall, guardhouse, tower).
    chars: { r: 'roofRed', o: 'roofOrange', s: 'roofSlate', t: 'tudor', p: 'plaster', h: 'stoneWall', f: 'hedge', i: 'railing', q: 'railPillar' },
    tiles: [
      'rrrrrr.ooo..ss.rrr',
      'rrrrrr.ooo..ss.rrr',
      'tttttt.ppp..tt.hhh',
      'f................i',
      'f................q',
      '.......ccc........',
      '.......ccc........',
      'f......ccc.......q',
      'f................i',
      'f................i',
      'oooo..rrrrssss..ss',
    ],
  },
  street: {
    id: 'street',
    name: 'Hall Street',
    intro: 'Hall Street. The grand old town hall, a statue in the middle of the road, and somebody\'s put a nightcap on the statue.',
    floor: 'cobble',
    // The town hall in the middle, houses either side. The south side is the
    // backs of the inn and the bakery.
    chars: { r: 'roofRed', o: 'roofOrange', s: 'roofSlate', t: 'tudor', p: 'plaster', h: 'stoneWall', f: 'hedge', j: 'railingW' },
    tiles: [
      'rrrrrssssssssooooo',
      'rrrrrssssssssooooo',
      'ttttthhhhhhhhppppp',
      'j................f',
      'j................f',
      '..................',
      '..................',
      'j................f',
      'j................f',
      'j................f',
      'rrrrrrrooo..ssrrrr',
    ],
  },
  pond: {
    id: 'pond',
    name: 'The Mill Pond',
    intro: 'The mill pond. The wheel is still turning, ducks drifting about, and a goose. You feel the goose before you see it.',
    floor: 'dirt',
    alt: 'grass',
    // x: grass under the mill illustration. w: water. f: hedge.
    chars: { x: 'grass', w: 'water', f: 'hedge' },
    tiles: [
      'fffffffffffxxxxfff',
      'fccccccccccxxxxccf',
      'fccccccccccxxxxwcf',
      'fcccccccccccccwwcf',
      'fccccccccwwwwwwwcf',
      '.........wwwwwwwcf',
      '.........wwwwwwccf',
      'fccccccccwwwwwwccf',
      'fcccccccccwwwwcccf',
      'fccccccccccccccccf',
      'ffffffffffffffffff',
    ],
  },
  bakery: {
    id: 'bakery',
    name: 'The Bakery',
    intro: 'The bakery. Warm, golden, smells incredible. The bread is still somehow warm.',
    floor: 'plank',
    tiles: [
      '##################',
      '##################',
      '####.........#####',
      '####.........#####',
      '####.........#####',
      '####.........#####',
      '####.........#####',
      '####.........#####',
      '##################',
      '##################',
      '##################',
    ],
  },
  guardhouse: {
    id: 'guardhouse',
    name: 'The Guardhouse',
    intro: 'The guardhouse. Snoring, armour, and a recruit in the corner doing sword drills. In his sleep.',
    floor: 'stone',
    tiles: [
      '##################',
      '##################',
      '####.........#####',
      '####.........#####',
      '####.........#####',
      '####.........#####',
      '####.........#####',
      '####.........#####',
      '##################',
      '##################',
      '##################',
    ],
  },
  hall: {
    id: 'hall',
    name: 'Town Hall',
    intro: 'The town hall. Paperwork in drifts like snow. The mayor is asleep on the biggest drift.',
    floor: 'plank',
    tiles: [
      '##################',
      '##################',
      '###...........####',
      '###...........####',
      '###...........####',
      '###...........####',
      '###...........####',
      '###...........####',
      '###...........####',
      '##################',
      '##################',
    ],
  },
  road: {
    id: 'road',
    name: 'The Chapel Road',
    intro: 'The chapel road. Fields, sheep, a scarecrow, and the old chapel on your left. A lych-gate leads into the graveyard beside it.',
    floor: 'dirt',
    alt: 'grass',
    // x: grass you can't walk on, under the chapel illustration. f: hedge.
    chars: { x: 'grass', f: 'hedge' },
    tiles: [
      'xxxxxxxfff..ffffff',
      'xxxxxxxccc..cccccf',
      'xxxxxxxccc..cccccf',
      'xxxxxxxccc..cccccf',
      'fcc.cccccc..cccccf',
      'fcc...............',
      'fcc...............',
      'fccc..cccccccccccf',
      'fccc..cccccccccccf',
      'fccc..cccccccccccf',
      'ffff..ffffffffffff',
    ],
  },
  gate: {
    id: 'gate',
    name: 'The Town Gate',
    intro: 'The town gate, under the big town wall. And guards! Awake ones! They do not look happy to see you.',
    floor: 'cobble',
    // w: the town wall (W: its battlemented top row).
    chars: { r: 'roofRed', o: 'roofOrange', t: 'tudor', p: 'plaster', W: 'townWallTop', w: 'townWall', l: 'lowWall' },
    tiles: [
      'rrrr..rrrroooooooo',
      'rrrr..rrrroooooooo',
      'tttt..ttttpppppppp',
      'w................l',
      'w................l',
      'w.................',
      'w.................',
      'w................l',
      'WWWWWWWWWWWWWWWWWW',
      'wwwwwwwwwwwwwwwwww',
      'wwwwwwwwwwwwwwwwww',
    ],
  },
  yard: {
    id: 'yard',
    name: 'Washing Lane',
    intro: 'Washing Lane. Laundry lines, back gardens, chickens. A little wooden gate at the end of the alley, under the bell tower.',
    floor: 'dirt',
    alt: 'grass',
    chars: { s: 'roofSlate', r: 'roofRed', p: 'plaster', f: 'hedge', k: 'picket' },
    tiles: [
      'rrrrrrrsssssss..ss',
      'rrrrrrrsssssss..ss',
      'pppppppppppppp..pp',
      'kccccccccccccc.ccf',
      'kccccccccccccc.ccf',
      '...............ccf',
      '...............ccf',
      'kccccccccccccccccf',
      'kccccccccccccccccf',
      'kccccccccccccccccf',
      'ffffffffffffffffff',
    ],
  },
  stairs: {
    id: 'stairs',
    name: 'The Bell Tower: Winding Stair',
    intro: 'The winding stair. The clock works grind away in the wall. Watch your step: some of these landings have seen better centuries.',
    floor: 'stone',
    wall: 'darkStone',
    // g: where the stair has rotted away.
    chars: { g: 'pit' },
    tiles: [
      '##################',
      '######......######',
      '######......######',
      '######......######',
      '######gggggg######',
      '######......######',
      '######......######',
      '######......######',
      '######......######',
      '######......######',
      '##################',
    ],
  },
  belfry: {
    id: 'belfry',
    name: 'The Bell Tower: Belfry',
    intro: 'The belfry. Wind, dust, and something enormous in the rafters. It has a lot of eyes. Some of them are opening.',
    floor: 'stone',
    wall: 'darkStone',
    dust: { protectedBy: 'salts', drain: 4 },
    tiles: [
      '##################',
      '######......######',
      '######......######',
      '######......######',
      '######......######',
      '######......######',
      '######......######',
      '######......######',
      '######......######',
      '######......######',
      '##################',
    ],
  },
  market: {
    id: 'market',
    name: 'Market Street',
    intro: 'Market Street. Stalls shuttered, merchants asleep on their goods. The smithy and the apothecary are both open, if nobody minds you letting yourself in.',
    floor: 'cobble',
    // h: the smithy's stone. p: the apothecary's plaster. t: a timber house.
    chars: { r: 'roofRed', s: 'roofSlate', o: 'roofOrange', h: 'stoneWall', p: 'plaster', t: 'tudor', l: 'lowWall', k: 'picket' },
    tiles: [
      'ssss..rrrrrrrr..oo',
      'ssss..rrrrrrrr..oo',
      'hhhh..pppppppp..tt',
      'l................k',
      'l................k',
      '..................',
      '..................',
      'l................k',
      'l................k',
      'l................k',
      'oooooooorrrrrrssss',
    ],
  },
  mill: {
    id: 'mill',
    name: 'The Mill',
    intro: 'Inside the mill. Flour on every surface, the great millstones still grinding away at nothing, and a smell of warm dust. Somebody lives up here, sort of.',
    floor: 'plank',
    tiles: [
      '##################',
      '##################',
      '####.........#####',
      '####.........#####',
      '####.........#####',
      '####.........#####',
      '####.........#####',
      '####.........#####',
      '##################',
      '##################',
      '##################',
    ],
  },
  smithy: {
    id: 'smithy',
    name: 'The Smithy',
    intro: 'The smithy. The forge is still glowing. Tools on every wall, planks in the corner, and a smith asleep mid-swing.',
    floor: 'stone',
    tiles: [
      '##################',
      '##################',
      '####.........#####',
      '####.........#####',
      '####.........#####',
      '####.........#####',
      '####.........#####',
      '####.........#####',
      '##################',
      '##################',
      '##################',
    ],
  },
  apothecary: {
    id: 'apothecary',
    name: 'The Apothecary',
    intro: 'The apothecary. Shelves of bottles, bundles of herbs, and a counter crowded with remedies. Very helpful, for a shop with nobody awake in it.',
    floor: 'plank',
    tiles: [
      '##################',
      '##################',
      '####.........#####',
      '####.........#####',
      '####.........#####',
      '####.........#####',
      '####.........#####',
      '####.........#####',
      '##################',
      '##################',
      '##################',
    ],
  },
  chapel: {
    id: 'chapel',
    name: 'The Old Chapel',
    intro: 'The old chapel. Candles, pews, stained glass. Sister Wren is at the altar, and she is very much awake.',
    floor: 'stone',
    alt: 'grass',
    tiles: [
      '##################',
      '######......######',
      '######......######',
      '######......######',
      '######......######',
      '######......######',
      '######......######',
      '######......######',
      '######......######',
      '######......######',
      '##################',
    ],
  },
  graveyard: {
    id: 'graveyard',
    name: 'The Graveyard',
    intro: 'The graveyard. Old stones, yew trees, a crypt. Wisps drifting between the graves. And crows. Awake crows.',
    floor: 'dirt',
    alt: 'grass',
    // s: the chapel roof along the west side. f: hedge.
    chars: { s: 'roofSlate', f: 'hedge', j: 'railingW' },
    tiles: [
      'ssffffffffffffffff',
      'sscccccccccccccccj',
      'sscccccccccccc.ccj',
      'sscccccccccccc.ccj',
      'ssc..............j',
      'sscccccccc..cccc..',
      'sscccccccc..cccc..',
      'sscccccccc..cccccj',
      'sscccccccc..cccccj',
      'sscccccccc..cccccj',
      'ssffffffff..ffffff',
    ],
  },
  close: {
    id: 'close',
    name: 'The Tower Close',
    intro: 'The Tower Close. The bell tower looms right over you. Something is swarming around the door.',
    floor: 'dirt',
    alt: 'grass',
    // x: grass you can't walk on, under the tower illustration. f: hedge.
    chars: { x: 'grass', f: 'hedge', i: 'railing', q: 'railPillar' },
    tiles: [
      'fffffffxxxxfffffff',
      'iccccccxxxxccccccf',
      'iccccccxxxxccccccf',
      'iccccccxxxxccccccf',
      'qccccccxxxxccccccf',
      '.......xxxxccccccf',
      '..........cccccccf',
      'qccccccccccccccccf',
      'iccccccccccccccccf',
      'iccccccccccccccccf',
      'ffffffffffffff..ff',
    ],
  },
  tower: {
    id: 'tower',
    name: 'The Bell Tower: Base',
    intro: 'The base of the bell tower. Cold stone, old crates, and stairs going up into the dark, wrapped in silk.',
    floor: 'stone',
    wall: 'darkStone',
    tiles: [
      '##################',
      '######......######',
      '######......######',
      '######......######',
      '######......######',
      '######......######',
      '######......######',
      '######......######',
      '######......######',
      '######......######',
      '##################',
    ],
  },
};

export const START = { area: 'inn' as AreaId, x: 2, y: 2 };

export const CHECKS: Record<string, CheckDef> = {
  fenSing: {
    id: 'fenSing',
    name: 'Ask Fen to sing',
    bands: [
      { from: 1, to: 4, id: 'stormsOff', label: 'Fen storms off' },
      { from: 5, to: 13, id: 'shrug', label: 'Fen refuses' },
      { from: 14, to: 20, id: 'sings', label: 'Fen sings' },
    ],
  },
  goose: {
    id: 'goose',
    name: 'Fight the goose',
    bands: [
      { from: 1, to: 11, id: 'honked', label: 'The goose wins' },
      { from: 12, to: 19, id: 'shooed', label: 'You shoo it off' },
      { from: 20, to: 20, id: 'friend', label: 'The goose respects you' },
    ],
  },
  padlock: {
    id: 'padlock',
    name: 'Pick the Close padlock',
    bands: [
      { from: 1, to: 9, id: 'jammed', label: 'The pick snaps in the lock' },
      { from: 10, to: 20, id: 'click', label: 'Click' },
    ],
  },
  swarm: {
    id: 'swarm',
    name: 'Fight the moth swarm',
    bands: [
      { from: 1, to: 6, id: 'smothered', label: 'Smothered in dust' },
      { from: 7, to: 14, id: 'scattered', label: 'They scatter (and you get dusty)' },
      { from: 15, to: 20, id: 'routed', label: 'You rout them' },
    ],
  },
  recruit: {
    id: 'recruit',
    name: 'Tackle the sleepwalking recruit',
    bands: [
      { from: 1, to: 7, id: 'bonked', label: 'Bonked on the helmet' },
      { from: 8, to: 20, id: 'pinned', label: 'Pinned, gently' },
    ],
  },
  rats: {
    id: 'rats',
    name: 'Fight the cellar rat',
    bands: [
      { from: 1, to: 8, id: 'swarmed', label: 'It brought friends' },
      { from: 9, to: 20, id: 'routed', label: 'The rats flee' },
    ],
  },
  scarecrow: {
    id: 'scarecrow',
    name: 'Fight the scarecrow',
    bands: [
      { from: 1, to: 10, id: 'lost', label: 'The scarecrow wins' },
      { from: 11, to: 20, id: 'won', label: 'Off with its turnip' },
    ],
  },
  salts: {
    id: 'salts',
    name: 'Rummage for smelling salts',
    bands: [
      { from: 1, to: 7, id: 'one', label: 'One bottle' },
      { from: 8, to: 16, id: 'two', label: 'Two bottles' },
      { from: 17, to: 20, id: 'three', label: 'Three bottles' },
    ],
  },
  forceDoor: {
    id: 'forceDoor',
    name: 'Force the cellar door',
    bands: [
      { from: 1, to: 16, id: 'caught', label: 'Bram catches you' },
      { from: 17, to: 20, id: 'burst', label: 'The door bursts open' },
    ],
  },
  dice: {
    id: 'dice',
    name: 'Dice with Old Moss',
    bands: [
      { from: 1, to: 9, id: 'lose', label: 'Moss wins' },
      { from: 10, to: 20, id: 'win', label: 'You win' },
    ],
  },
  chest: {
    id: 'chest',
    name: 'Open the chest',
    bands: [
      { from: 1, to: 12, id: 'eaten', label: 'The mimic eats you' },
      { from: 13, to: 13, id: 'charmed', label: 'The mimic purrs open' },
      { from: 14, to: 20, id: 'snap', label: 'It snaps shut for the night' },
    ],
  },
  chute: {
    id: 'chute',
    name: 'Squeeze down the coal chute',
    bands: [
      { from: 1, to: 7, id: 'stuck', label: 'You get stuck' },
      { from: 8, to: 20, id: 'slide', label: 'You slide into the cellar' },
    ],
  },
  climb: {
    id: 'climb',
    name: 'Climb the tower wall',
    bands: [
      { from: 1, to: 11, id: 'fall', label: 'You fall into a hedge' },
      { from: 12, to: 20, id: 'up', label: 'You climb in a window' },
    ],
  },
  pray: {
    id: 'pray',
    name: 'Pray at the altar',
    bands: [
      { from: 1, to: 13, id: 'silence', label: 'Silence' },
      { from: 14, to: 20, id: 'blessed', label: 'The bell is blessed' },
    ],
  },
  bluff: {
    id: 'bluff',
    name: 'Talk your way past the gate',
    bands: [
      { from: 1, to: 12, id: 'refused', label: 'Holt says no' },
      { from: 13, to: 20, id: 'peek', label: 'Holt lets you look' },
    ],
  },
  web: {
    id: 'web',
    name: 'Hack through the moth silk',
    bands: [
      { from: 1, to: 12, id: 'tangled', label: 'You get tangled' },
      { from: 13, to: 20, id: 'through', label: 'You cut through' },
    ],
  },
  jump: {
    id: 'jump',
    name: 'Jump the gap',
    bands: [
      { from: 1, to: 9, id: 'fall', label: 'You fall' },
      { from: 10, to: 20, id: 'across', label: 'You make it across' },
    ],
  },
  warden: {
    id: 'warden',
    name: 'Fight the Night Warden',
    bands: [
      { from: 1, to: 15, id: 'tpk', label: 'Total party kill' },
      { from: 16, to: 20, id: 'driven', label: 'You drive it off' },
    ],
  },
  wardenLantern: {
    id: 'wardenLantern',
    name: 'Fight the Warden with a lantern',
    bands: [
      { from: 1, to: 5, id: 'tpk', label: 'Total party kill' },
      { from: 6, to: 20, id: 'driven', label: 'It flees the light' },
    ],
  },
};

export const PAGES: PageDef[] = [
  {
    id: 'notice',
    title: 'Notice Board Handout',
    back: `
      <h4>DM NOTE (don't read this out)</h4>
      <p>Bram keeps a spare cellar key under the loose floorboard by the bar.
      It doesn't sparkle. They'll have to actually click it.</p>
    `,
    damage: 'coffee',
    body: `
      <h4>REWARD</h4>
      <p>The cellar key of the Rusty Lantern has gone missing.
      Return it to Bram, no questions asked.</p>
      <p class="hand">Fen was by the fire all that night, singing about it. Ask nicely.</p>
      <p>Whatever is down in that cellar, do NOT <span class="stain">open the chest unless you</span> …</p>
    `,
  },
  {
    id: 'bedpost',
    title: 'Carving on the Bedpost',
    back: `
      <p>On the underside of the post, smaller:</p>
      <p class="carved">NIGHT 1</p>
      <p class="hand">This bed is the only place this town lets you rest. — G.</p>
    `,
    damage: 'scratched',
    body: `
      <p class="carved">SLEEP AGAIN<br/>WAKE LUCKIER</p>
      <p class="hand">only if it's the very first thing you do. — G.</p>
    `,
  },
  {
    id: 'songsheet',
    title: "Fen's Songsheet",
    back: `
      <p>Chord chart: G – C – G – D (repeat until someone throws a shoe)</p>
      <p class="hand">13th brick in Bram's cellar wall is loose. Don't tell Bram.</p>
    `,
    damage: 'torn',
    body: `
      <p class="verse">♪ Under the ashes the iron one sleeps,<br/>
      cold in the hearth where the old innkeep weeps ♪</p>
      <p class="verse">♪ The box in the dark has a mouth full of teeth,<br/>
      it only grows sweet for the <span class="torn-out">number of grief</span> ♪</p>
      <p class="hand">(key's in the fireplace, obviously)</p>
    `,
  },
  {
    id: 'iou',
    title: "Old Moss's IOU",
    back: `
      <h4>MOSS'S SUMS</h4>
      <p><b>Bram's chest:</b> 1–12 it eats you · 13 it purrs open · 14–20 it snaps shut.</p>
      <p class="hand">Lost three cousins working that out.</p>
    `,
    damage: 'scribbled',
    revealsTables: ['chest'],
    body: `
      <p>I, Old Moss, owe the bearer <s>three</s> <s>two</s> one silver.</p>
      <p class="hand">Free advice instead: Bram's chest ain't a chest.
      Thirteen. Exactly thirteen. Nothing else works on the thing.
      Well. Except food.</p>
    `,
  },
  {
    id: 'dmNotes',
    title: "DM's Notes (borrowed)",
    back: `
      <h4>ENCOUNTER MATH</h4>
      <p><b>Cellar door (force):</b> 1–16 caught · 17–20 opens.</p>
      <p><b>Dice w/ Moss:</b> 1–9 lose · 10–20 win.</p>
      <p class="hand">if they find G.'s grave I will actually cry</p>
    `,
    damage: 'coffee',
    revealsTables: ['forceDoor', 'dice'],
    body: `
      <h4>SECRETS — DO NOT SHOW PLAYERS</h4>
      <p><b>Amulet of the Groundhog:</b> if the PC goes back to sleep as their
      FIRST action, it's under the pillow. Any time: skip a roll and take an
      outcome they've already seen. Once a night: pick the number.</p>
      <p><b>Mimic chest:</b> <span class="stain">only on a 13, everything else is</span> bad.</p>
      <p class="hand">(numbers on the back)</p>
    `,
  },
  {
    id: 'curfew',
    title: 'Town Council Notice',
    back: `
      <h4>COUNCIL MINUTES</h4>
      <p><b>Item 4:</b> The old bell-ringer's service door, behind the bench on
      the square, to be bricked up.</p>
      <p><b>Item 5:</b> Nobody bricked it up.</p>
    `,
    damage: 'torn',
    body: `
      <h4>BY ORDER OF THE COUNCIL: THE LONG SLEEP</h4>
      <p>Since the Night Warden came to roost in our bell tower, Harrowmere
      sleeps. Any soul still awake: ring the Bell of Harrowmere from the tower
      and break the spell.</p>
      <p class="hand">The bell's at the Lantern. Grandma Bram hid it. — W.</p>
    `,
  },
  {
    id: 'prayerBook',
    title: 'The Rite of the Bell',
    back: `
      <p><b>Prayer odds</b> (we checked): 1–13 silence · 14–20 blessed.</p>
      <p class="hand">Emergency holy water kept under the stone just left of
      the altar. — Sr. W.</p>
    `,
    revealsTables: ['pray'],
    body: `
      <h4>FROM THE CHAPEL PRAYER BOOK</h4>
      <p>Bronze unblessed will crack at the first toll, and wake what sleeps
      in the rafters.</p>
      <p>Bless the bell with water from the town well, poured by a sister of
      this chapel. Or pray, if the gods are listening (they mostly aren't).</p>
    `,
  },
  {
    id: 'bestiary',
    title: "Bell-Ringer's Logbook",
    back: `
      <p class="hand">Spare lantern's in the wall niche on the ground floor.
      REMEMBER IT THIS TIME.</p>
      <p class="hand">Little moths swarm the door now. Same as the big one: they hate light.
      Watch chained the Close. Captain has the key, smith has cutters.</p>
      <p class="hand">Stair door's silked shut. Silk burns. 4th landing's rotten:
      bring a plank. And for pity's sake, bring salts for the dust.</p>
    `,
    damage: 'scratched',
    body: `
      <p><b>Day 1:</b> big moth in the rafters. Calling it the Warden.</p>
      <p><b>Day 2:</b> it HATES light. Waved my lantern and it fled.</p>
      <p><b>Day 3:</b> forgot the lantern.</p>
      <p class="hand">a blessed bell would drive it off for good, I reckon</p>
    `,
  },
  {
    id: 'vexPrices',
    title: "Vex's Price List",
    back: `
      <h4>CUSTOMER LEDGER</h4>
      <p>"The W." Paid in advance. Very large. Many eyes. Tips well.</p>
      <p class="hand">deliver to the tower, NOT the front gate</p>
    `,
    damage: 'coffee',
    body: `
      <h4>VEX'S CURIOS</h4>
      <p><b>Buying:</b> bells. Well, one bell. A specific bell.</p>
      <p><b>Paying:</b> more gold than you have ever seen.</p>
      <p><b>Questions:</b> please don't.</p>
    `,
  },
  {
    id: 'gJournal',
    title: "G.'s Journal",
    back: `
      <h4>ROUTES I TRIED</h4>
      <p>The key in the ashes. The coal chute (stuck 41 times). The service
      door behind the bench. A ham (worked!). Ringing it unblessed (never
      again).</p>
    `,
    damage: 'torn',
    body: `
      <p><b>Night 1:</b> The bell's in the inn cellar. The chest is a mimic. It wants a 13.</p>
      <p><b>Night 212:</b> Rolled a 12. Again.</p>
      <p><b>Night 400-something:</b> I've stopped counting. If anyone ever finds
      this: don't wait for the perfect roll. Bring a ham.</p>
      <p class="hand">Thank you for bringing my die home. — G.</p>
    `,
  },
  {
    id: 'tpkDebrief',
    title: "Marcus's Post-TPK Debrief",
    back: `
      <h4>THE NUMBERS (Marcus insisted)</h4>
      <p><b>Warden, no light:</b> 1–15 TPK · 16–20 drive it off.</p>
      <p><b>Warden, lantern:</b> 1–5 TPK · 6–20 it flees.</p>
    `,
    damage: 'scribbled',
    revealsTables: ['warden', 'wardenLantern'],
    body: `
      <p>(Written on a napkin while Marcus talks very fast.)</p>
      <p>"Okay so the Warden HATES light. Bram's lantern was RIGHT THERE.
      You could've just asked him for it! Also the logbook in the tower says
      so. I worked really hard on that logbook."</p>
      <p class="hand">→ ask Bram for his lantern next time</p>
    `,
  },
  {
    id: 'vexReceipt',
    title: "Vex's Receipt",
    back: `
      <p><b>Delivery instructions:</b> leave at the tower service door,
      behind the bench in the square. Knock twice.</p>
    `,
    damage: 'coffee',
    body: `
      <h4>RECEIPT</h4>
      <p>1 (one) Bell of Harrowmere. Purchased by V., on behalf of
      <b>THE NIGHT WARDEN</b>.</p>
      <p class="hand">P.S. keep the spare tower key safe for my employer. — V.</p>
    `,
  },
  {
    id: 'records',
    title: 'Town Records: The Bell',
    damage: 'scratched',
    revealsTables: ['chute'],
    back: `
      <h4>INCIDENT LOG: THE LANTERN'S COAL CHUTE</h4>
      <p>1–7: stuck (fire brigade called) · 8–20: straight into the cellar.</p>
      <p class="hand">Most recent offender: "G.", 41 times. Please stop.</p>
    `,
    body: `
      <p>The Bell of Harrowmere has woken this town from enchanted sleep twice
      before: once in 802, and once in 1102.</p>
      <p>In 1102 it was rung unblessed first, and cracked. It was recast,
      blessed, and rung again. The town woke at dawn.</p>
      <p class="hand">The Lantern family looks after it now.</p>
    `,
  },
  {
    id: 'quarantine',
    title: 'Quarantine Order',
    damage: 'coffee',
    revealsTables: ['climb'],
    back: `
      <h4>GUARD ROTA, SCRIBBLED</h4>
      <p><b>Bell tower wall:</b> 1–11 you end up in the hedge · 12–20 in through
      the east window. (Hendricks, 16. Pip, 12. Pip again, 11.)</p>
    `,
    body: `
      <h4>BY ORDER OF SGT. HOLT: QUARANTINE</h4>
      <p>Nobody in, nobody out, until the Long Sleep is lifted.</p>
      <p>Anyone still awake: stay indoors, stay awake, and for pity's sake
      somebody ring that bell.</p>
    `,
  },
  {
    id: 'almanac',
    title: "The Miller's Almanac",
    damage: 'coffee',
    revealsTables: ['goose', 'swarm'],
    back: `
      <h4>THINGS WHAT BITE, &amp; HOW TO WIN</h4>
      <p><b>Mrs. Honk (goose):</b> 1–11 she wins · 12–19 she wanders off ·
      a perfect 20 and she's yours for life. (Or bread. Always bread.)</p>
      <p><b>Moths at the tower door:</b> 1–6 you'll be asleep in the grass ·
      7–14 they scatter, dusty · 15–20 rout 'em. (Or a light. Always a light.)</p>
      <p class="hand">Spare mill key: on the wheel, third paddle. Shut the sluice
      first or you'll lose a hand. (Sluice crank's at the smithy, being mended.)</p>
    `,
    body: `
      <h4>ALMANAC, THIS YEAR</h4>
      <p><b>Spring:</b> wet. <b>Summer:</b> wetter. <b>Autumn:</b> moths.</p>
      <p>Worst moth year on record. A big one has took the bell tower. Little
      ones swarm the door like they're guarding it.</p>
      <p class="hand">The goose is not for sale. Stop asking. — Miller</p>
    `,
  },
  {
    id: 'millerNotes',
    title: "The Miller's Directions",
    damage: 'scribbled',
    revealsTables: ['chest', 'wardenLantern'],
    back: `
      <h4>AND AFTER THAT</h4>
      <p class="hand">There's a dead adventurer in the inn cellar. G. Take his d20
      and bury it in his empty grave in the churchyard. Then go down into the
      crypt and let the poor man finish what he started.</p>
      <p><b>The chest:</b> exactly 13, nothing else. <b>The big moth, with a
      lantern:</b> anything from 6 up.</p>
    `,
    body: `
      <h4>HOW TO RING THAT BELL, BY A MILLER</h4>
      <p>1. The bell's in the mimic chest in the Lantern's cellar. Thirteen,
      or feed it a ham.</p>
      <p>2. Bless it. Sister Wren, with water from the town well.</p>
      <p>3. The Close: the smith's cutters, the captain's key, or a good pick.</p>
      <p>4. Little moths and the big one both hate light. Carry a lantern.</p>
      <p>5. The tower: burn the silk, bring a plank for the fourth landing,
      salts for the dust.</p>
      <p>6. Ring it.</p>
      <p class="hand">You keep coming back. I can see it on you. Good luck. — M.</p>
    `,
  },
  {
    id: 'herbal',
    title: "The Apothecary's Herbal",
    damage: 'scratched',
    revealsTables: ['web', 'jump'],
    back: `
      <h4>NOTES FOR THE TOWER JOB</h4>
      <p><b>Moth silk, by blade:</b> 1–12 hopelessly tangled · 13–20 clean through.
      (By fire: always. Silk burns.)</p>
      <p><b>The gap on the stair:</b> 1–9 down you go · 10–20 across.
      (With a plank: no roll at all.)</p>
    `,
    body: `
      <h4>ON THE DUST OF GREAT MOTHS</h4>
      <p>The dust of a moth that size will put a grown ox to sleep. Smelling
      salts, held under the nose, keep the wits about you.</p>
      <p class="hand">Kept a bottle of salts on the counter, just in case. — Apothecary</p>
    `,
  },
  {
    id: 'grandmaLetter',
    title: "Grandma Bram's Letter",
    damage: 'torn',
    back: `
      <p class="hand">P.S. It ADORES ham. Don't ask me how I know.</p>
    `,
    body: `
      <p>My dearest Bram,</p>
      <p>The bell is safe in my old chest, down in the cellar. The chest bites.
      Feed it, don't fight it.</p>
      <p>And whatever you do, don't sell it to that man in the velvet coat.</p>
      <p class="hand">— Grandma</p>
    `,
  },
  {
    id: 'wrenNote',
    title: 'A Note from Sister Wren',
    back: `
      <p class="hand">P.S. His die is still down in the Lantern cellar, with
      what's left of him. Bring it to his grave.</p>
    `,
    body: `
      <p>Thank you, all of you. You aren't the first to try.</p>
      <p>Four hundred years ago a traveler named G. tried to ring the bell, and
      failed, night after night after night. His grave behind the chapel is
      empty. I don't think he ever found rest.</p>
      <p class="hand">He loved dice. I think he'd want his back.</p>
    `,
  },
];

export const ENDINGS: Record<EndingId, { title: string; page: string | null }> = {
  tpk: { title: 'Total Party Kill', page: 'tpkDebrief' },
  bad: { title: 'The Long Sleep', page: 'vexReceipt' },
  good: { title: 'Harrowmere Wakes', page: 'wrenNote' },
  secret: { title: "The Groundhog's Rest", page: null },
};

/** What you're carrying. `hint` is a gentle nudge about what it's for. */
export const INVENTORY: { flag: string; icon: string; name: string; hint: string; hideIf?: string }[] = [
  { flag: 'key', icon: 'key', name: 'Iron cellar key', hint: 'Heavy and old. There was a locked door behind the bar.' },
  { flag: 'ham', icon: 'kebab_dining', name: 'Stolen ham', hideIf: 'hamUsed', hint: "Something in the inn's cellar is very hungry." },
  { flag: 'wellWater', icon: 'water_drop', name: 'Flask of well water', hideIf: 'blessed', hint: 'Clean, cold, and the start of holy water. Someone at the chapel would know.' },
  { flag: 'bell', icon: 'notifications', name: 'Bell of Harrowmere', hideIf: 'blessed', hint: "It wants ringing from the tower. Unblessed, though, it won't end well." },
  { flag: 'blessed', icon: 'notifications_active', name: 'Bell of Harrowmere (blessed)', hint: 'Ready. Hang it in the belfry and ring it.' },
  { flag: 'gDie', icon: 'casino', name: "G.'s d20", hideIf: 'cryptOpen', hint: 'Worn smooth. It belongs with its owner, in the churchyard.' },
  { flag: 'towerKey', icon: 'vpn_key', name: 'Tower key', hint: 'Shaped like a little bell. It fits the bell tower door.' },
  { flag: 'lantern', icon: 'light', name: 'A lantern', hint: 'Moths, big and small, hate the light.' },
  { flag: 'coal', icon: 'local_fire_department', name: 'A hot coal in a tin', hint: 'Still glowing. Good for burning things, or scaring things off.' },
  { flag: 'candle', icon: 'flare', name: 'A chapel candle', hint: 'It never seems to go out. Silk burns, you know.' },
  { flag: 'plank', icon: 'carpenter', name: 'A sturdy plank', hideIf: 'gapBridged', hint: 'Long enough to bridge a gap. The tower stair has a rotten landing.' },
  { flag: 'bread', icon: 'bakery_dining', name: 'A loaf of bread', hint: 'Warm. Somebody at the mill pond is very fond of bread.' },
  { flag: 'crank', icon: 'construction', name: 'An iron crank', hideIf: 'wheelStopped', hint: 'Tagged MILL, SLUICE. It fits a square socket somewhere by the water.' },
  { flag: 'millKey', icon: 'key', name: 'The mill key', hideIf: 'millOpen', hint: 'Brass, on a bit of red string. The mill door, surely.' },
  { flag: 'revival', icon: 'science', name: "Miller's Revival", hint: 'For the deepest sleepers. One sniff. Who sleeps deepest of all?' },
  { flag: 'gooseFriend', icon: 'egg', name: 'A goose (yours now)', hint: 'Loyal, loud, and absolutely not afraid of moths.' },
  { flag: 'boltCutters', icon: 'content_cut', name: 'Bolt cutters', hideIf: 'closeOpen', hint: 'They would make short work of a chain.' },
  { flag: 'captainKey', icon: 'key', name: "Captain's key", hideIf: 'closeOpen', hint: 'Labelled CLOSE. For the chained gate on the square.' },
  { flag: 'salts', icon: 'science', name: 'Smelling salts', hideIf: 'salts2', hint: "Wakes any one sleeper tonight, and keeps the belfry's dust at bay." },
  { flag: 'salts2', icon: 'science', name: 'Smelling salts ×2', hideIf: 'salts3', hint: "Wakes any one sleeper tonight, and keeps the belfry's dust at bay." },
  { flag: 'salts3', icon: 'science', name: 'Smelling salts ×3', hint: "Wakes any one sleeper tonight, and keeps the belfry's dust at bay." },
];

const TPK_TAIL = [
  'Marcus, very quietly: "…That\'s a TPK."',
  'Dan: "Wait. Does that mean we FINISHED?"',
  'Marcus: "…Technically."',
];

/**
 * Smelling salts are counted with stacked flags: 'salts' (one or more),
 * 'salts2' (two or more), 'salts3' (three). Holding any keeps the belfry dust off.
 */
type FlagCtx = Pick<Ctx, 'flag' | 'setFlag' | 'clearFlag'>;
function giveSalts(g: FlagCtx, n: number): void {
  for (const f of ['salts', 'salts2', 'salts3'].slice(0, n)) g.setFlag(f);
}
function useSalt(g: FlagCtx): void {
  if (g.flag('salts3')) g.clearFlag('salts3');
  else if (g.flag('salts2')) g.clearFlag('salts2');
  else g.clearFlag('salts');
}

const notGone = (flag: string) => (g: { flag(n: string): boolean }) => !g.flag(flag);

/** A line of flavor text, from the DM unless a speaker is given. */
type Line = string | [Speaker, string];

/**
 * A closer-look line that's actually useful: a hint, a roll outcome, a taste,
 * some energy or patience. The reward happens once per session.
 */
type Reward = { line: Line; reward: (g: Ctx) => void };
type LookLine = Line | Reward;
const isReward = (l: LookLine): l is Reward => typeof l === 'object' && !Array.isArray(l);

/** Minutes for a quick inspect. Each one also tests the table's patience. */
export const LOOK_MINUTES = 3;

/**
 * Filler object. The first line is its free description, shown on click.
 * Any further lines come from "Take a closer look", one per use; once all
 * have been seen this session, the last one repeats.
 */
function look(
  id: string,
  name: string,
  area: AreaId,
  x: number,
  y: number,
  sprite: string,
  lines: [string, ...LookLine[]],
  label = 'Take a closer look',
): ObjectDef {
  const [blurb, ...more] = lines;
  return {
    id,
    name,
    area,
    x,
    y,
    sprite,
    blurb,
    actions: more.length === 0 ? [] : [
      {
        id: 'look',
        label,
        minutes: LOOK_MINUTES,
        look: true,
        run: (g) => {
          const next = more.findIndex((_, i) => !g.flag(`seen:${id}:${i}`));
          const idx = next < 0 ? more.length - 1 : next;
          g.setFlag(`seen:${id}:${idx}`);
          const entry = more[idx];
          const line = isReward(entry) ? entry.line : entry;
          if (typeof line === 'string') g.say(line);
          else g.say(line[1], line[0]);
          if (isReward(entry) && !g.flag(`reward:${id}:${idx}`)) {
            g.setFlag(`reward:${id}:${idx}`);
            entry.reward(g);
            g.achieve('curious');
          }
        },
      },
    ],
  };
}

/** A signpost or door that just takes you somewhere. */
function exit(
  id: string,
  name: string,
  area: AreaId,
  x: number,
  y: number,
  sprite: string,
  blurb: string,
  label: string,
  to: AreaId,
  tx: number,
  ty: number,
): ObjectDef {
  return {
    id, name, area, x, y, sprite, blurb,
    actions: [{ id: 'go', label, minutes: 5, run: (g) => g.goTo(to, tx, ty) }],
  };
}

/** Count fights won tonight; three earns Brawler. */
function fightWon(g: Ctx): void {
  const n = ['won1', 'won2', 'won3'].find((f) => !g.flag(f));
  if (n) g.setFlag(n);
  if (g.flag('won3')) g.achieve('brawler');
}

/**
 * The tower's double door in the Close. The moth swarm has to go first.
 * Then it needs the bell-shaped tower key, or you climb the wall to the east window.
 */
function towerDoors(): ObjectDef[] {
  const swarmed = (g: Ctx) => !g.flag('swarmGone');
  const actions: ActionDef[] = [
    {
      id: 'swarmed',
      label: 'Try to reach the door',
      minutes: 3,
      look: true,
      when: swarmed,
      run: (g) => g.say('The moth swarm whirls up between you and the door. You get a mouthful of dust and back off.', 'dm'),
    },
    {
      id: 'try',
      label: 'Try the door',
      minutes: 3,
      look: true,
      when: (g) => !swarmed(g) && !g.flag('towerKey'),
      run: (g) => g.say('Locked. The keyhole is shaped like a little bell.', 'dm'),
    },
    {
      id: 'unlock',
      label: 'Unlock the tower door',
      minutes: 5,
      when: (g) => !swarmed(g) && g.flag('towerKey'),
      run: (g) => {
        if (!g.flag('towerOpen')) g.say('The door swings open with a long, horror-movie creak.', 'dm');
        g.setFlag('towerOpen');
        g.goTo('tower', 8, 9);
      },
    },
    {
      id: 'climb',
      label: 'Climb the tower wall',
      minutes: 15,
      check: 'climb',
      when: (g) => !swarmed(g) && !g.flag('towerKey') && !g.flag('towerBarred'),
      run: (g, outcome) => {
        if (outcome === 'up') {
          g.say('Handhold by handhold, you climb up and squeeze in through the east window, high on the winding stair. Above the silk, above the gap.', 'dm');
          g.goTo('stairs', 8, 2);
        } else {
          g.say('You slip and land in a hedge. Loudly. Something in the tower rustles, and every window slams shut.', 'dm');
          g.setFlag('towerBarred');
        }
      },
    },
  ];
  return [[8, 'doorLeft'], [9, 'doorRight']].map(([x, sprite], i) => ({
    id: i === 0 ? 'towerDoor' : 'towerDoor2',
    name: 'Bell tower door',
    area: 'close' as AreaId,
    x: x as number, y: 5,
    sprite: sprite as string,
    blurb: 'The bell tower: a great stone finger with a slate spire. Up in the belfry, something with too many eyes is asleep.',
    actions,
  }));
}

/**
 * A wooden back gate between the Tower Close and Washing Lane. It's bolted on
 * the Close side, so it's a shortcut once you're in, never a way around the chain.
 */
function backGate(side: 'close' | 'yard'): ObjectDef[] {
  const inClose = side === 'close';
  const through = (g: Ctx) => (inClose ? g.goTo('yard', 14, 1) : g.goTo('close', 14, 9));
  const actions: ActionDef[] = inClose
    ? [
        {
          id: 'unbolt',
          label: 'Slide back the bolt',
          minutes: 3,
          when: (g) => !g.flag('backGateOpen'),
          run: (g) => {
            g.say('You slide back a rusty bolt. The little gate creaks open onto Washing Lane. A shortcut!', 'dm');
            g.setFlag('backGateOpen');
            through(g);
          },
        },
        { id: 'go', label: 'Go through to Washing Lane', minutes: 3, when: (g) => g.flag('backGateOpen'), run: through },
      ]
    : [
        {
          id: 'try',
          label: 'Try the gate',
          minutes: 3,
          look: true,
          when: (g) => !g.flag('backGateOpen'),
          run: (g) => g.say('Bolted from the other side. Through the gaps in the boards you can see the bell tower.', 'dm'),
        },
        { id: 'go', label: 'Go through to the Tower Close', minutes: 3, when: (g) => g.flag('backGateOpen'), run: through },
      ];
  const tiles = inClose ? [[14, 10], [15, 10]] : [[14, 0], [15, 0]];
  return tiles.map(([x, y], i) => ({
    id: `${side}BackGate${i ? 2 : ''}`,
    name: 'Back gate',
    area: side as AreaId,
    x, y,
    sprite: 'backGate',
    blurb: inClose
      ? 'A little wooden gate in the hedge, bolted on this side. Washing Lane is beyond it.'
      : 'A little wooden gate at the end of the alley. The bell tower looms over it.',
    actions,
  }));
}

/**
 * The iron gate across the street to the Tower Close: two tiles, one gate.
 * The Watch chained it shut. Cut the chain, use the captain's key, or pick the lock.
 */
function closeGate(): ObjectDef[] {
  const open = (g: Ctx, line: string) => {
    if (!g.flag('closeOpen')) g.say(line, 'dm');
    g.setFlag('closeOpen');
    g.goTo('close', 1, 5);
  };
  const actions: ActionDef[] = [
    {
      id: 'try',
      label: 'Try the gate',
      minutes: 3,
      look: true,
      when: (g) => !g.flag('closeOpen'),
      run: (g) => g.say('Chained shut. A notice hangs off the padlock: "TOWER CLOSE SEALED BY ORDER OF THE WATCH. Key with the Captain." Someone has scratched underneath: "or the smith\'s cutters lol".', 'dm'),
    },
    {
      id: 'cut',
      label: 'Cut the chain with the bolt cutters',
      minutes: 5,
      when: (g) => !g.flag('closeOpen') && g.flag('boltCutters'),
      run: (g) => open(g, 'Grukk takes the bolt cutters, says "allow me", and bites through the chain with one heroic grunt. It clatters to the cobbles.'),
    },
    {
      id: 'key',
      label: "Use the captain's key",
      minutes: 3,
      when: (g) => !g.flag('closeOpen') && g.flag('captainKey'),
      run: (g) => open(g, "The captain's key turns with a satisfying clunk. The chain slithers off the gate."),
    },
    {
      id: 'pick',
      label: 'Pick the padlock',
      minutes: 10,
      steal: true,
      check: 'padlock',
      when: (g) => !g.flag('closeOpen') && !g.flag('padlockJammed'),
      run: (g, outcome) => {
        if (outcome === 'click') {
          g.say('Nyx: two pins, a wiggle, a click.', 'dm');
          open(g, 'The padlock drops open in your hand. The chain slithers off the gate.');
        } else {
          g.say('Snap. Half your pick is now stuck in the padlock, which is now unpickable. Tonight, at least.', 'dm');
          g.say('That lock owes me a pick.', 'priya');
          g.setFlag('padlockJammed');
        }
      },
    },
    {
      id: 'go',
      label: 'Go into the Tower Close',
      minutes: 5,
      when: (g) => g.flag('closeOpen'),
      run: (g) => g.goTo('close', 1, 5),
    },
  ];
  return [[17, 5], [17, 6]].map(([x, y], i) => ({
    id: i === 0 ? 'closeGate' : 'closeGate2',
    name: 'Tower Close gate',
    area: 'square' as AreaId,
    x, y,
    sprite: 'gate',
    blurb: 'An iron gate across the street, wrapped in chain. Beyond it, the bell tower. High above, something huge shifts in its sleep.',
    actions,
  }));
}

/**
 * The end of a road or alley leading to another area. Every tile across the
 * road gets a clickable arrow (walkable, so it never blocks the way), and
 * clicking any of them takes you through.
 */
function roadExit(
  id: string,
  name: string,
  area: AreaId,
  tiles: [number, number][],
  dir: 'Left' | 'Right' | 'Up' | 'Down',
  blurb: string,
  label: string,
  to: AreaId,
  tx: number,
  ty: number,
): ObjectDef[] {
  return tiles.map(([x, y], i) => ({
    id: i === 0 ? id : `${id}${i + 1}`,
    name, area, x, y, blurb,
    sprite: `exit${dir}`,
    walkable: true,
    actions: [{ id: 'go', label, minutes: 5, run: (g) => g.goTo(to, tx, ty) }],
  }));
}

const BAR_LINES: [string, ...LookLine[]] = [
  'The bar is sticky in a way that suggests history.',
  'Someone has carved "BRAM SMELLS" into the wood. Then crossed it out. Then carved it again, bigger.',
];
const BARREL_LINES: [string, ...LookLine[]] = [
  'A barrel. You knock on it. It knocks back. …No, that was Dan knocking on the real table.',
  'Still a barrel.',
];
const TABLE_LINES: [string, ...LookLine[]] = [
  'A round table covered in mug rings. Someone has been doing math on it in chalk. The math is wrong.',
  ['dan', 'Can I flip the table?'],
  'Marcus: "You may not flip the table."',
];
const LAMP_LINES: [string, ...LookLine[]] = [
  'A street lamp, still burning. Somebody fell asleep halfway through lighting the street.',
];
const PEW_LINES: [string, ...LookLine[]] = [
  'A wooden pew, worn smooth by centuries of fidgeting.',
  ['dan', 'I lie down on the pew.'],
  ['jo', 'Dan, no. You will fall asleep. For real.'],
];


/** One half of the inn's double front door. Both halves lead outside. */
function frontDoor(id: string, x: number, sprite: string): ObjectDef {
  return {
    id,
    name: 'Front door',
    area: 'inn',
    x,
    y: 10,
    sprite,
    blurb: 'The way out to the street. Cold night air drifts in, and outside, everything is perfectly, eerily still.',
    actions: [
      {
        id: 'out',
        label: 'Step outside',
        minutes: 5,
        run: (g) => {
          if (!g.flag('seenTown')) {
            g.setFlag('seenTown');
            g.say('You step out into Harrowmere. Nobody is moving. A guard sleeps standing up. A baker is frozen mid-stride with a tray of bread.', 'dm');
            g.say("This is creepy. I love it.", 'priya');
          }
          g.goTo('square', 3, 3);
        },
      },
    ],
  };
}

/** Scenery: not clickable, just there to make the place feel lived in. */
function decor(area: AreaId, x: number, y: number, sprite: string, walkable = false): ObjectDef {
  return { id: `decor-${area}-${x}-${y}`, name: '', area, x, y, sprite, walkable, actions: [] };
}

/** Scenery for every area. Placed to keep doorways, routes and hidden spots clear. */
const DECOR: ObjectDef[] = [
  // Inn: chairs, another table, crates, sconces, a banner
  decor('inn', 8, 3, 'chair'),
  decor('inn', 10, 3, 'chair'),
  decor('inn', 3, 8, 'chair'),
  decor('inn', 10, 7, 'chair'),
  decor('inn', 7, 7, 'table'),
  decor('inn', 8, 7, 'chair'),
  decor('inn', 16, 6, 'crate'),
  decor('inn', 16, 7, 'crate'),
  decor('inn', 7, 0, 'sconce'),
  decor('inn', 12, 0, 'sconce'),
  decor('inn', 0, 3, 'sconce'),
  decor('inn', 2, 5, 'banner'),
  decor('inn', 8, 9, 'mat', true),
  decor('inn', 9, 9, 'mat', true),
  // Cellar: shelves and a candle
  decor('cellar', 5, 1, 'jars'),
  decor('cellar', 10, 1, 'sconce'),
  // Town square: guards at the tower gate, stalls, alley clutter
  decor('square', 9, 8, 'fruitStall'),
  decor('square', 6, 8, 'flowerCart'),
  decor('square', 7, 5, 'flowers', true),
  decor('square', 9, 7, 'flowers', true),
  decor('square', 6, 0, 'barrel'),
  decor('square', 14, 0, 'crate'),
  decor('square', 14, 1, 'barrel'),
  // Chapel road: trees, a broken cart, flowers, more sheep
  decor('road', 8, 1, 'tree'),
  decor('road', 12, 1, 'tree'),
  decor('road', 15, 2, 'tree'),
  decor('road', 1, 9, 'tree'),
  decor('road', 16, 9, 'tree'),
  decor('road', 10, 9, 'tree'),
  decor('road', 7, 9, 'sheep'),
  decor('road', 7, 8, 'sheep'),
  decor('road', 9, 7, 'flowers', true),
  decor('road', 2, 8, 'flowers', true),
  // Town gate: wagons, hay, crates
  decor('gate', 2, 5, 'brokenCart'),
  decor('gate', 3, 6, 'hay'),
  decor('gate', 15, 4, 'crate'),
  decor('gate', 16, 4, 'crate'),
  decor('gate', 16, 3, 'barrel'),
  decor('gate', 15, 7, 'hay'),
  // Washing lane: laundry, veggies, chickens, trees
  decor('yard', 2, 3, 'laundry'),
  decor('yard', 3, 3, 'laundry'),
  decor('yard', 2, 8, 'veggies', true),
  decor('yard', 3, 8, 'veggies', true),
  decor('yard', 2, 9, 'veggies', true),
  decor('yard', 3, 9, 'veggies', true),
  decor('yard', 15, 9, 'chicken'),
  decor('yard', 13, 9, 'chicken'),
  decor('yard', 1, 8, 'tree'),
  decor('yard', 11, 9, 'tree'),
  // Winding stair and belfry
  decor('stairs', 5, 2, 'sconce'),
  decor('stairs', 12, 6, 'sconce'),
  decor('belfry', 5, 3, 'sconce'),
  decor('belfry', 12, 3, 'sconce'),
  decor('belfry', 6, 8, 'crate'),
  // Market street: closed stalls, barrels, crates, a sleeping cat in the alley
  decor('market', 2, 4, 'closedStall'),
  decor('market', 4, 5, 'closedStall'),
  decor('market', 13, 3, 'closedStall'),
  decor('market', 16, 3, 'barrel'),
  decor('market', 15, 7, 'barrel'),
  decor('market', 11, 7, 'crate'),
  decor('market', 7, 8, 'crate'),
  // Smithy
  decor('smithy', 8, 4, 'anvil'),
  decor('smithy', 11, 1, 'weaponRack'),
  decor('smithy', 4, 7, 'barrel'),
  decor('smithy', 13, 3, 'sconce'),
  decor('smithy', 8, 7, 'mat', true),
  // Apothecary
  decor('apothecary', 5, 1, 'jars'),
  decor('apothecary', 11, 1, 'jars'),
  decor('apothecary', 12, 7, 'plant'),
  decor('apothecary', 3, 4, 'sconce'),
  decor('apothecary', 8, 7, 'mat', true),
  // Graveyard: rows of old stones, statues by the crypt, wisps, a lamp at the gate
  decor('graveyard', 13, 1, 'statue'),
  decor('graveyard', 15, 1, 'statue'),
  decor('graveyard', 6, 2, 'graveOld'),
  decor('graveyard', 10, 2, 'graveCross'),
  decor('graveyard', 6, 6, 'graveOld'),
  decor('graveyard', 4, 8, 'graveCross'),
  decor('graveyard', 8, 8, 'grave'),
  decor('graveyard', 16, 7, 'graveOld'),
  decor('graveyard', 2, 1, 'tree'),
  decor('graveyard', 9, 9, 'lamp'),
  decor('graveyard', 12, 9, 'signDown'),
  decor('graveyard', 5, 7, 'flowers', true),
  decor('graveyard', 14, 7, 'flowers', true),
  decor('graveyard', 7, 4, 'wisp', true),
  decor('graveyard', 13, 3, 'wisp', true),
  decor('graveyard', 3, 6, 'wisp', true),
  // Hall Street: lamps, benches, flowers round the statue
  decor('street', 7, 2, 'signHall'),
  decor('street', 4, 4, 'lamp'),
  decor('street', 14, 7, 'lamp'),
  decor('street', 5, 7, 'bench'),
  decor('street', 7, 5, 'flowers', true),
  decor('street', 9, 5, 'flowers', true),
  decor('street', 1, 4, 'signLeft'),
  decor('street', 16, 4, 'signRight'),
  decor('street', 12, 7, 'signDown'),
  decor('square', 12, 3, 'signUp'),
  decor('graveyard', 16, 3, 'signRight'),
  // Inside the mill: sacks and gears
  decor('mill', 4, 6, 'sack'),
  decor('mill', 5, 6, 'sack'),
  decor('mill', 12, 6, 'sack'),
  decor('mill', 12, 3, 'gears'),
  decor('mill', 8, 7, 'mat', true),
  // Mill pond: ducks, reeds, trees
  decor('pond', 11, 5, 'duck'),
  decor('pond', 14, 4, 'duck'),
  decor('pond', 10, 7, 'duck'),
  decor('pond', 8, 5, 'reeds', true),
  decor('pond', 9, 8, 'reeds'),
  decor('pond', 14, 8, 'reeds'),
  decor('pond', 2, 2, 'tree'),
  decor('pond', 3, 9, 'tree'),
  decor('pond', 16, 9, 'tree'),
  decor('pond', 1, 4, 'signLeft'),
  // Direction signs beside each road and alley
  decor('square', 16, 4, 'signRight'),
  decor('close', 1, 4, 'signLeft'),
  decor('close', 5, 4, 'lamp'),
  decor('close', 12, 4, 'lamp'),
  decor('close', 2, 8, 'tree'),
  decor('close', 16, 2, 'tree'),
  decor('close', 11, 8, 'flowers', true),
  decor('close', 6, 2, 'barrel'),
  decor('square', 1, 4, 'signLeft'),
  decor('square', 3, 8, 'signDown'),
  decor('road', 15, 4, 'signRight'),
  decor('road', 9, 1, 'signUp'),
  decor('road', 3, 8, 'signDown'),
  decor('gate', 3, 3, 'signUp'),
  decor('gate', 16, 7, 'signRight'),
  decor('market', 1, 4, 'signLeft'),
  decor('market', 16, 4, 'signRight'),
  decor('market', 6, 4, 'signUp'),
  decor('yard', 13, 3, 'signUp'),
  decor('yard', 1, 4, 'signLeft'),
  // Shop signs beside the doors
  decor('square', 9, 2, 'signBakery'),
  decor('square', 15, 2, 'signGuard'),
  decor('market', 3, 2, 'signSmithy'),
  decor('market', 9, 2, 'signApothecary'),
  // Chapel: more pews, candelabras, a stone angel, flowers, graves
  decor('chapel', 7, 4, 'pew'),
  decor('chapel', 9, 4, 'pew'),
  decor('chapel', 6, 1, 'candelabra'),
  decor('chapel', 9, 1, 'candelabra'),
  // Bakery
  decor('bakery', 10, 4, 'shopCounter'),
  decor('bakery', 11, 4, 'shopCounter'),
  decor('bakery', 4, 7, 'sack'),
  decor('bakery', 12, 7, 'sack'),
  decor('bakery', 9, 6, 'table'),
  decor('bakery', 13, 3, 'sconce'),
  decor('bakery', 8, 7, 'mat', true),
  // Guardhouse
  decor('guardhouse', 5, 1, 'weaponRack'),
  decor('guardhouse', 7, 3, 'table'),
  decor('guardhouse', 4, 2, 'bed'),
  decor('guardhouse', 12, 5, 'cellBars'),
  decor('guardhouse', 12, 7, 'cellBars'),
  decor('guardhouse', 3, 4, 'sconce'),
  decor('guardhouse', 8, 7, 'mat', true),
  // Town hall
  decor('hall', 4, 1, 'bookshelf'),
  decor('hall', 6, 1, 'bookshelf'),
  decor('hall', 11, 1, 'bookshelf'),
  decor('hall', 12, 1, 'bookshelf'),
  decor('hall', 8, 4, 'desk'),
  decor('hall', 2, 4, 'banner'),
  decor('hall', 8, 6, 'rug', true),
  decor('hall', 5, 6, 'chair'),
  decor('hall', 11, 6, 'chair'),
  decor('hall', 14, 3, 'sconce'),
  decor('hall', 8, 8, 'mat', true),
  // Tower: candles and clutter
  decor('tower', 5, 3, 'sconce'),
  decor('tower', 12, 3, 'sconce'),
  decor('tower', 5, 7, 'sconce'),
  decor('tower', 6, 2, 'crate'),
  decor('tower', 11, 9, 'crate'),
  decor('tower', 8, 9, 'mat', true),
];

export const OBJECTS: ObjectDef[] = [
  // ── The Inn ───────────────────────────────────────────────
  {
    id: 'bed',
    name: 'Your bed',
    area: 'inn',
    x: 1,
    y: 1,
    sprite: 'bed',
    blurb: 'Your bed at the Rusty Lantern. Still warm. Very tempting.',
    actions: [
      {
        id: 'sleep',
        label: 'Go back to sleep',
        minutes: 30,
        run: (g) => {
          if (g.firstAction) {
            g.say('Marcus stares at you. "…You go back to sleep. Fine."', 'dm');
            g.say('He flips a page and frowns. "Huh. Okay. When you wake up there\'s an amulet under your pillow. It\'s… shaped like a groundhog?"', 'dm');
            g.giveAmulet();
          } else {
            g.say('You nap. Nothing happens.', 'dm');
            g.say('*throws a pretzel at you*', 'priya');
          }
        },
      },
      {
        id: 'bedpost',
        label: 'Examine the bedpost',
        minutes: 5,
        look: true,
        run: (g) => {
          g.say('Someone has carved words into the bedpost.', 'dm');
          g.givePage('bedpost');
        },
      },
    ],
  },
  {
    id: 'board',
    name: 'Notice board',
    area: 'inn',
    x: 9,
    y: 0,
    sprite: 'board',
    blurb: 'A cork board crowded with notices, most of them about a lost goat.',
    actions: [
      {
        id: 'read',
        label: 'Read the notices',
        minutes: 10,
        run: (g) => {
          g.say('Marcus slides a slightly stained handout across the table.', 'dm');
          g.givePage('notice');
        },
      },
    ],
  },
  {
    id: 'fireplace',
    name: 'Fireplace',
    area: 'inn',
    x: 13,
    y: 0,
    sprite: 'fireplace',
    blurb: 'A crackling fire. The ashes at the back are thick and grey.',
    actions: [
      {
        id: 'warm',
        label: 'Warm your hands',
        minutes: 3,
        look: true,
        run: (g) => g.say('Toasty. The ashes at the back look like nobody has cleaned them in years.', 'dm'),
      },
      {
        id: 'ashes',
        label: 'Search the ashes',
        minutes: 15,
        when: (g) => (g.flag('heardAshes') || g.hasPage('songsheet')) && !g.flag('key'),
        run: (g) => {
          g.say('You dig through the ashes and find a soot-black iron key.', 'dm');
          g.setFlag('key');
        },
      },
    ],
  },
  look('counter1', 'Bar', 'inn', 15, 2, 'counter', BAR_LINES),
  look('counter2', 'Bar', 'inn', 15, 3, 'counter', BAR_LINES),
  look('counter3', 'Bar', 'inn', 15, 4, 'counter', BAR_LINES),
  look('shelf', 'Bottle shelf', 'inn', 16, 0, 'shelf', [
    'Bottles of every color. One is labelled "DO NOT". Just "DO NOT".',
    ['priya', 'I steal the DO NOT bottle.'],
    'Marcus: "Bram is literally looking right at you."',
  ]),
  look('stool1', 'Bar stool', 'inn', 14, 2, 'stool', [
    'A wobbly stool. One leg is shorter than the others, on purpose, to keep people from staying too long.',
  ]),
  look('stool2', 'Bar stool', 'inn', 14, 4, 'stool', [
    'This stool has a cushion. Someone sewed a tiny "RESERVED" on it.',
  ]),
  {
    id: 'bram',
    name: 'Bram the innkeeper',
    area: 'inn',
    x: 16,
    y: 3,
    sprite: 'bram',
    blurb: "Bram polishes the same mug he's been polishing since you walked in. He's the only one awake on this street.",
    actions: [
      {
        id: 'talk',
        label: 'Talk to Bram',
        minutes: 15,
        talk: true,
        run: (g) => {
          g.say('"Whole town\'s asleep. Just dropped, mid-step. Me? I\'ve had insomnia for thirty years, so." He shrugs. "Lost the cellar key too, while we\'re listing problems. Night it went missing, Fen was singing by the fire."', 'dm');
          g.setFlag('metBram');
        },
      },
      {
        id: 'fire',
        label: 'Ask about the fire',
        minutes: 10,
        talk: true,
        when: (g) => g.flag('metBram') && !g.flag('heardAshes'),
        run: (g) => {
          g.say('"Fire? Haven\'t cleaned the ashes since that night. Why?" He squints at you. "…Why?"', 'dm');
          g.setFlag('heardAshes');
        },
      },
      {
        id: 'cellar',
        label: 'Ask about the cellar',
        minutes: 10,
        talk: true,
        when: (g) => g.flag('metBram'),
        run: (g) => g.say('"Old junk down there. Grandma\'s things. And a chest I don\'t touch. It bit my cousin."', 'dm'),
      },
      {
        id: 'tower',
        label: 'Ask about the bell tower',
        minutes: 10,
        talk: true,
        when: (g) => g.flag('metBram'),
        run: (g) => g.say('"Big moth thing moved into the tower and everyone dropped where they stood. Sister Wren up at the chapel\'s still awake. She\'d know more. Holy people sleep weird."', 'dm'),
      },
      {
        id: 'lantern',
        label: "Borrow Bram's lantern",
        minutes: 5,
        talk: true,
        when: (g) => g.hasPage('tpkDebrief') && !g.flag('lantern'),
        run: (g) => {
          g.say('"My lantern? …Sure. Bring it back in one piece."', 'dm');
          g.say('Marcus mutters: "Oh, NOW you take the lantern."', 'dm');
          g.setFlag('lantern');
        },
      },
    ],
  },
  look('table1', 'Table', 'inn', 9, 3, 'table', TABLE_LINES),
  look('table2', 'Table', 'inn', 4, 8, 'table', [
    "Old Moss's table. There are dice scratches all over it, and one carved line: \"13 — UNLUCKY FOR SOME\".",
    {
      line: "Tally marks along the edge: Moss's wins and losses. He loses on anything under a 10. Every single time.",
      reward: (g) => { g.learnRoll('dice', 9); g.learnRoll('dice', 10); },
    },
  ]),
  look('table3', 'Table', 'inn', 11, 7, 'table', TABLE_LINES),
  look('window', 'Window', 'inn', 3, 0, 'window', [
    'A full moon over the hills. Very atmospheric.',
    'Marcus: "I described this window for, like, a full minute last time. Not that anyone remembers."',
  ]),
  look('wardrobe', 'Wardrobe', 'inn', 5, 1, 'wardrobe', [
    'You open the wardrobe. Inside: one sock, and a strong smell of mothballs.',
    'You check again. Still one sock. It is not a magic sock.',
    ['dan', 'I put on the sock.'],
    {
      line: 'Behind the sock: a forgotten bag of jerky. Dan takes this as a sign and fetches the real chips from the kitchen.',
      reward: (g) => g.boostEnergy(5),
    },
  ]),
  {
    ...look('rug', 'Rug', 'inn', 3, 3, 'rug', [
      'A threadbare rug. You lift the corner, looking for a trapdoor. Just dust.',
      "Marcus: \"There's no trapdoor under the rug. I'm not that kind of DM.\"",
    ]),
    walkable: true,
  },
  look('portrait', 'Portrait', 'inn', 6, 2, 'portrait', [
    'A stern woman in an oil painting. The brass plate says "GRANDMA BRAM".',
    'Her eyes follow you around the room. Marcus insists this is just good painting.',
    'You notice she\'s holding a small bronze bell in the painting.',
  ]),
  look('antlers', 'Mounted antlers', 'inn', 11, 0, 'antlers', [
    'Antlers mounted on a plaque. The plaque says "THE ONE THAT GOT AWAY".',
    'You look closer. So… it didn\'t get away? Bram has some explaining to do.',
  ]),
  look('cat', 'Sleeping cat', 'inn', 12, 1, 'cat', [
    'A ginger cat sleeps by the fire. It has achieved what everyone at the table wants.',
    { line: 'You pet the cat. It purrs without waking up. Everyone at the real table goes "awww".', reward: (g) => g.calmTable(3) },
    ['jo', 'I cast Bless on the cat.'],
    'The cat is blessed. It continues to sleep.',
  ], 'Pet the cat'),
  look('dartboard', 'Dartboard', 'inn', 0, 8, 'dartboard', [
    'A dartboard with one dart in it, nowhere near the bullseye. There are a lot of holes in the wall around it.',
    ['dan', 'I throw a dart.'],
    'Marcus: "You hit the cat." A pause. "You don\'t hit the cat. I\'m not doing that. You miss."',
  ]),
  look('plant', 'Potted plant', 'inn', 1, 9, 'plant', [
    'A potted fern, thriving against all odds.',
    'Someone has been watering it with ale. There is a snail in the pot wearing a tiny name tag: "GARY".',
  ]),
  look('broom', 'Broom', 'inn', 16, 9, 'broom', [
    'A broom. Judging by the floor, it is mostly decorative.',
    ['priya', 'Is it a magic broom?'],
    'Marcus: "It\'s a broom, Priya."',
  ]),
  {
    id: 'fen',
    name: 'Fen the bard',
    area: 'inn',
    x: 12,
    y: 8,
    sprite: 'fen',
    blurb: "Fen the bard, tuning a lute that's already in tune.",
    visible: notGone('fenGone'),
    actions: [
      {
        id: 'chat',
        label: 'Chat with Fen',
        minutes: 10,
        talk: true,
        run: (g) => g.say('Fen eyes your lute. "Another bard. Wonderful." They retune, pointedly. "I only sing for people who ask nicely. And mean it."', 'dm'),
      },
      {
        id: 'sing',
        label: 'Ask Fen to sing',
        minutes: 15,
        talk: true,
        check: 'fenSing',
        when: (g) => !g.flag('fenAsked'),
        run: (g, outcome) => {
          g.setFlag('fenAsked');
          if (outcome === 'sings') {
            g.say('Fen grins and sings an old song about ashes and teeth, then presses the songsheet into your hand.', 'dm');
            g.setFlag('heardAshes');
            g.givePage('songsheet');
          } else if (outcome === 'shrug') {
            g.say('"Not tonight." Fen turns back to the lute.', 'dm');
          } else {
            g.say('"Rude!" Fen storms out of the inn, toward the chapel.', 'dm');
            g.setFlag('fenGone');
          }
        },
      },
    ],
  },
  {
    id: 'moss',
    name: 'Old Moss',
    area: 'inn',
    x: 5,
    y: 8,
    sprite: 'moss',
    blurb: 'Old Moss rattles a pair of dice in a leather cup. "Fancy a game?"',
    actions: [
      {
        id: 'dice',
        label: 'Play dice with Moss',
        minutes: 15,
        check: 'dice',
        run: (g, outcome) => {
          if (outcome === 'win') {
            if (!g.hasPage('iou')) {
              g.say('"Bah. Can\'t pay you. Here, take an IOU instead." He scrawls something on a napkin.', 'dm');
              g.givePage('iou');
            } else {
              g.say('Moss grumbles and adds another line to the IOU.', 'dm');
            }
          } else {
            g.say('Moss cackles and scoops up the dice.', 'dm');
          }
        },
      },
    ],
  },
  look('barrel1', 'Barrel', 'inn', 16, 8, 'barrel', BARREL_LINES),
  look('barrel2', 'Barrel', 'inn', 1, 6, 'barrel', BARREL_LINES),
  frontDoor('frontDoor', 8, 'doorwayL'),
  frontDoor('frontDoorR', 9, 'doorwayR'),
  {
    id: 'cellarDoor',
    name: 'Cellar door',
    area: 'inn',
    x: 14,
    y: 9,
    sprite: 'trapdoor',
    blurb: 'A heavy wooden door set into the floor, with an iron lock.',
    actions: [
      {
        id: 'rattle',
        label: 'Try the door',
        minutes: 3,
        look: true,
        when: (g) => !g.flag('key') && !g.flag('doorOpen'),
        run: (g) => g.say('Locked. A heavy iron lock.', 'dm'),
      },
      {
        id: 'unlock',
        label: 'Unlock with the iron key',
        minutes: 5,
        when: (g) => g.flag('key') && !g.flag('doorOpen'),
        run: (g) => {
          g.say('The key turns with a gritty clunk. You head down into the cellar.', 'dm');
          g.setFlag('doorOpen');
          g.goTo('cellar', 5, 2);
        },
      },
      {
        id: 'force',
        label: 'Force the door',
        minutes: 10,
        check: 'forceDoor',
        when: (g) => !g.flag('key') && !g.flag('doorOpen') && !g.flag('doorGuarded'),
        run: (g, outcome) => {
          if (outcome === 'burst') {
            g.say('CRACK. The door gives way and you tumble down the stairs.', 'dm');
            g.setFlag('doorOpen');
            g.goTo('cellar', 5, 2);
          } else {
            g.say('Bram hears the racket. "Oi!" He drags a stool over and sits on the door for the rest of the night.', 'dm');
            g.setFlag('doorGuarded');
          }
        },
      },
      {
        id: 'down',
        label: 'Go down to the cellar',
        minutes: 5,
        when: (g) => g.flag('doorOpen'),
        run: (g) => g.goTo('cellar', 5, 2),
      },
    ],
  },

  // ── The Cellar ────────────────────────────────────────────
  {
    id: 'stairs',
    name: 'Stairs up',
    area: 'cellar',
    x: 4,
    y: 2,
    sprite: 'stairs',
    blurb: 'Stone steps lead back up to the warmth of the inn.',
    actions: [
      {
        id: 'up',
        label: 'Climb back up',
        minutes: 5,
        run: (g) => {
          if (!g.flag('doorOpen')) {
            g.say('The cellar door is bolted from this side. You slide the bolt and climb out.', 'dm');
            g.setFlag('doorOpen');
          }
          g.goTo('inn', 14, 8);
        },
      },
    ],
  },
  look('crate1', 'Crate', 'cellar', 5, 6, 'crate', [
    'A crate stamped "PICKLED EGGS — DO NOT OPEN UNTIL 1102". It is long past 1102.',
  ]),
  look('crate2', 'Crate', 'cellar', 6, 6, 'crate', [
    'This crate is full of straw. Under the straw: more straw.',
  ]),
  look('cbarrel1', 'Barrel', 'cellar', 12, 2, 'barrel', BARREL_LINES),
  look('cbarrel2', 'Barrel', 'cellar', 12, 6, 'barrel', BARREL_LINES),
  look('wineRack', 'Wine rack', 'cellar', 7, 1, 'wineRack', [
    'Dusty bottles of very old wine. Bram clearly does not come down here.',
    ['priya', 'I steal the wine.'],
    'Marcus: "Priya, you can\'t steal everything." Priya: "Watch me."',
  ]),
  look('cobweb', 'Cobwebs', 'cellar', 11, 1, 'cobweb', [
    'Thick cobwebs in the corner. Whatever made them is, thankfully, not home.',
  ]),
  {
    ...look('rat', 'Rat', 'cellar', 8, 5, 'rat', [
      'A fat rat stares at you, completely unafraid.',
      ['dan', 'I RAGE at the rat.'],
      'The rat is not impressed. It wanders off behind a barrel, then wanders back.',
    ]),
  },
  look('sack', 'Sack of potatoes', 'cellar', 7, 6, 'sack', [
    'A sack of potatoes. A few have sprouted. One has a face, if you squint.',
  ]),
  look('mushrooms', 'Glowing mushrooms', 'cellar', 4, 6, 'mushrooms', [
    'Purple mushrooms, faintly glowing. They smell like grape soda.',
    ['jo', 'Nobody eat the mushrooms.'],
    ['dan', '…'],
    ['jo', 'Dan.'],
  ]),
  {
    id: 'skeleton',
    name: 'Skeleton',
    area: 'cellar',
    x: 9,
    y: 2,
    sprite: 'skeleton',
    blurb: "An old adventurer's skeleton, slumped against the wall. One bony hand still clutches a d20, showing a 12.",
    actions: [
      {
        id: 'look',
        label: 'Take a closer look',
        minutes: 3,
        look: true,
        run: (g) => {
          g.say('Marcus: "He was SO close." There\'s a "G." scratched into the skeleton\'s belt buckle. His d20 still shows the 12 that got him eaten.', 'dm');
          g.learnRoll('chest', 12);
          g.achieve('curious');
        },
      },
      {
        id: 'die',
        label: "Take the skeleton's d20",
        steal: true,
        minutes: 3,
        when: (g) => !g.flag('gDie') && !g.flag('cryptOpen'),
        run: (g) => {
          g.say('You gently take the d20 from his fingers. It\'s warm. That\'s… weird.', 'dm');
          g.say('Are we grave robbing now? Is that the vibe?', 'jo');
          g.setFlag('gDie');
        },
      },
    ],
  },
  {
    id: 'chest',
    name: 'Brass-bound chest',
    area: 'cellar',
    x: 10,
    y: 4,
    sprite: 'chest',
    blurb: 'A brass-bound chest. It is very, very still.',
    actions: [
      {
        id: 'inspect',
        label: 'Inspect the chest',
        minutes: 3,
        look: true,
        run: (g) => g.say('Brass bands. A keyhole that seems to… breathe? You count the bolts: thirteen. You hear a faint, hungry gurgle.', 'dm'),
      },
      {
        id: 'open',
        label: 'Open the chest',
        minutes: 10,
        check: 'chest',
        when: (g) => !g.flag('chestShut') && !g.flag('bell'),
        run: (g, outcome) => {
          if (outcome === 'charmed') {
            g.say('The chest shivers… and purrs. The lid swings open. Inside, wrapped in sacking: a small bronze bell, humming faintly. The Bell of Harrowmere.', 'dm');
            g.setFlag('bell');
          } else if (outcome === 'snap') {
            g.say('The lid snaps shut so hard the bolts rattle. It will not open again tonight.', 'dm');
            g.setFlag('chestShut');
          } else {
            g.achieve('eaten');
            g.endSession('The chest grows teeth and swallows you whole. Marcus, grinning: "That\'s… actually a great place to stop."');
          }
        },
      },
      {
        id: 'ham',
        label: 'Toss the ham to the chest',
        minutes: 5,
        when: (g) => g.flag('ham') && !g.flag('hamUsed') && !g.flag('bell'),
        run: (g) => {
          g.say('The lid flies open, the ham vanishes with a crunch, and the chest makes a happy little burp. While it chews, you reach in and grab a small bronze bell. The Bell of Harrowmere.', 'dm');
          g.say("I can't believe the ham worked.", 'dan');
          g.setFlag('hamUsed');
          g.setFlag('bell');
          g.achieve('ham');
        },
      },
    ],
  },

  // ── Town Square ───────────────────────────────────────────
  look('crossroads', 'Crossroads signpost', 'square', 7, 4, 'signMulti', [
    'A signpost with arms pointing every which way. ↑ HALL STREET (the town hall, and a mill pond past it). ← THE CHAPEL (and the town gate past it). ↓ MARKET STREET (either alley), then WASHING LANE further east. → THE TOWER CLOSE (sealed by the Watch).',
    'Someone has added a tiny arm pointing straight down that just says "SNACKS". It points at nothing.',
  ]),
  look('dozeGuardN', 'Dozing guard', 'square', 15, 4, 'sleeperGuard', [
    'A guard asleep at his post by the Close gate, chin resting on his spear.',
  ]),
  look('dozeGuardS', 'Dozing guard', 'square', 15, 7, 'sleeperGuard', [
    'The other gate guard, snoring into his own helmet.',
  ]),
  look('lamplighter', 'Sleeping lamplighter', 'square', 11, 4, 'sleeperLamp', [
    'A lamplighter, asleep halfway through lighting the square. His taper has gone out.',
  ]),
  look('neonSign', 'Neon sign', 'square', 2, 2, 'neonInn', [
    'A glowing pink sign that just says INN. It buzzes faintly.',
    'Marcus: "It\'s… medieval neon. It\'s a thing. Don\'t worry about it."',
    ['priya', 'It is NOT a thing.'],
  ]),
  exit('innDoorOut', 'The Rusty Lantern', 'square', 3, 2, 'doorLeft',
    'The inn\'s big double door. Warm light spills out onto the cobbles.',
    'Go back inside', 'inn', 8, 9),
  exit('innDoorOutR', 'The Rusty Lantern', 'square', 4, 2, 'doorRight',
    'The inn\'s big double door. Warm light spills out onto the cobbles.',
    'Go back inside', 'inn', 9, 9),
  exit('bakeryDoor', 'The Bakery', 'square', 8, 2, 'door',
    'A bakery with a wooden sign shaped like a loaf. It smells amazing.',
    'Go into the bakery', 'bakery', 8, 7),
  ...roadExit('toStreet', 'Hall Street', 'square', [[10, 0], [11, 0]], 'Up',
    'A street north to the town hall and the stopped clock.',
    'Walk up Hall Street', 'street', 10, 9),
  exit('guardDoor', 'The Guardhouse', 'square', 16, 2, 'door',
    'The guardhouse, beside the gate to the Tower Close. Someone inside is snoring very loudly.',
    'Go into the guardhouse', 'guardhouse', 8, 7),
  ...roadExit('toChapel', 'Road to the chapel', 'square', [[0, 5], [0, 6]], 'Left',
    'The road west, out to the chapel.',
    'Walk out to the chapel road', 'road', 16, 5),
  ...roadExit('toMarketW', 'Alley to Market Street', 'square', [[4, 10], [5, 10]], 'Down',
    'An alley south to Market Street, by the smithy.',
    'Head down to Market Street', 'market', 4, 1),
  ...roadExit('toMarketE', 'Alley to Market Street', 'square', [[14, 10], [15, 10]], 'Down',
    'An alley south to Market Street. You can smell laundry soap from somewhere past it.',
    'Head down to Market Street', 'market', 14, 1),
  {
    id: 'chute',
    name: 'Coal chute',
    area: 'square',
    x: 6,
    y: 1,
    sprite: 'chute',
    blurb: "Down the alley beside the inn, a coal chute leads into the cellar. It looks like a very tight fit.",
    actions: [
      {
        id: 'squeeze',
        label: 'Squeeze down the coal chute',
        minutes: 10,
        check: 'chute',
        when: (g) => !g.flag('chuteStuck'),
        run: (g, outcome) => {
          if (outcome === 'slide') {
            g.achieve('chute');
            g.say('You shoot down the chute in a cloud of coal dust and land in the cellar. Graceful? No. Effective? Yes.', 'dm');
            g.goTo('cellar', 8, 3);
          } else {
            g.say('You get stuck halfway. It takes Dan, Jo and a rope to pull you back out.', 'dm');
            g.say("Nobody is trying that again tonight. I'm not pulling you out twice.", 'dan');
            g.setFlag('chuteStuck');
            g.achieve('stuck');
          }
        },
      },
    ],
  },
  {
    id: 'curfew',
    name: 'Notice post',
    area: 'square',
    x: 2,
    y: 4,
    sprite: 'post',
    blurb: "A notice nailed to a post, sealed with the town council's wax.",
    actions: [
      {
        id: 'read',
        label: 'Read the notice',
        minutes: 5,
        run: (g) => {
          g.say('Marcus hands you a torn handout with a wax seal drawn on it in red pen.', 'dm');
          g.givePage('curfew');
        },
      },
    ],
  },
  look('clock', 'Town clock', 'street', 10, 2, 'clock', [
    'The town clock has stopped at 11:52.',
    'Marcus: "It\'s symbolic."',
    ['priya', 'Of what?'],
    'Marcus: "…Of the clock."',
    'Under the clock face, a brass plaque: "In case of eternal sleep, consult the Town Hall archives."',
  ]),
  ...closeGate(),
  {
    id: 'well',
    name: 'Town well',
    area: 'square',
    x: 8,
    y: 6,
    sprite: 'well',
    blurb: 'The town well. A bucket hangs from a creaky winch.',
    actions: [
      {
        id: 'bucket',
        label: 'Lower the bucket',
        minutes: 10,
        when: (g) => !g.flag('wellWater'),
        run: (g) => {
          g.say('You haul up a bucket of cold, clear water and fill a flask with it.', 'dm');
          g.setFlag('wellWater');
        },
      },
      {
        id: 'wish',
        label: 'Make a wish',
        minutes: 3,
        look: true,
        run: (g) => g.say('Plink. You wish for snacks. Nothing happens. The well remains a well.', 'dm'),
      },
    ],
  },
  {
    id: 'vex',
    name: 'Vex',
    area: 'square',
    x: 12,
    y: 8,
    sprite: 'vex',
    blurb: 'A thin man in a velvet coat behind a market stall, wide awake. He smiles too much.',
    actions: [
      {
        id: 'talk',
        label: 'Talk to Vex',
        minutes: 10,
        talk: true,
        run: (g) => {
          g.say('"Ah, a fellow insomniac! I deal in curiosities. Bells, mainly. Well. One bell, specifically." He slides a price list across the counter.', 'dm');
          g.givePage('vexPrices');
        },
      },
      {
        id: 'sell',
        label: 'Sell Vex the bell',
        minutes: 5,
        when: (g) => g.flag('bell'),
        run: (g) => g.ending('bad', [
          'Vex counts out a heavy, clinking pile of gold. The bell disappears into his coat.',
          'He tips his hat and walks off toward the bell tower, whistling.',
          'Behind you, the town sleeps on. It will sleep forever.',
          'Marcus: "So you\'re… rich? Congrats? Everyone you\'ve met is asleep for eternity."',
          'Priya: "Worth it."',
        ]),
      },
      {
        id: 'confront',
        label: 'Confront Vex about the Warden',
        minutes: 10,
        talk: true,
        when: (g) => g.hasPage('vexReceipt') && !g.flag('towerKey'),
        run: (g) => {
          g.say('You slap the receipt on his counter. Vex goes pale. "You know about my employer? …Fine. FINE. Take the tower key. Leave me out of this."', 'dm');
          g.say("How do we have a receipt from a timeline that didn't happen?", 'jo');
          g.say('Marcus: "Don\'t worry about it."', 'dm');
          g.setFlag('towerKey');
        },
      },
    ],
  },
  look('vexStall', "Vex's stall", 'square', 13, 8, 'stall', [
    'Trinkets, a stuffed owl, a jar of teeth, and a hand-painted sign: "WE BUY BELLS."',
    ['priya', 'I steal the owl.'],
    'Marcus: "Vex is RIGHT THERE." Priya: "And?"',
  ]),
  {
    id: 'butcher',
    name: "Butcher's stall",
    area: 'square',
    x: 1,
    y: 8,
    sprite: 'butcher',
    blurb: 'A butcher\'s stall. A fat ham hangs from a hook. The butcher is asleep standing right next to it.',
    actions: [
      {
        id: 'ham',
        label: 'Take the ham',
        steal: true,
        minutes: 5,
        when: (g) => !g.flag('ham'),
        run: (g) => {
          g.say('You lift the ham off its hook. The butcher snores.', 'dm');
          g.say("We're stealing from a sleeping man?", 'jo');
          g.say('We are, and I love it.', 'priya');
          g.setFlag('ham');
        },
      },
    ],
  },
  look('butcherMan', 'Sleeping butcher', 'square', 2, 8, 'sleeperButcher', [
    'The butcher, asleep on his feet, cleaver in hand.',
    'He mumbles "…best ham in town…" in his sleep.',
  ]),
  look('guard', 'Sleeping guard', 'square', 12, 6, 'sleeperGuard', [
    'A town guard, asleep at attention. Impressive, honestly.',
    'You poke him. He mumbles "…five more minutes, mum."',
    {
      line: 'Tucked in his belt, a note: "East window latch is broken. Anyone could climb in." With a decent roll, anyway.',
      reward: (g) => g.learnRoll('climb', 12),
    },
    ['dan', 'I draw a mustache on him.'],
    'Marcus: "With what?" Dan: "…Coal. From the chute."',
  ]),
  look('baker', 'Sleeping baker', 'square', 5, 7, 'sleeperBaker', [
    'A baker frozen mid-stride, still holding a tray of bread.',
    'The bread is warm. How is the bread still warm?',
    ['priya', 'I steal a bread.'],
  ]),
  look('lamp1', 'Street lamp', 'square', 5, 5, 'lamp', LAMP_LINES),
  look('lamp2', 'Street lamp', 'square', 12, 4, 'lamp', LAMP_LINES),
  look('bench', 'Bench', 'square', 15, 8, 'bench', [
    'A bench with a little brass plaque: "IN MEMORY OF GARY THE SNAIL".',
    ['jo', 'Wait, there was a snail called Gary in the inn!'],
    'Marcus: "Different Gary."',
  ]),

  // ── The Old Chapel ────────────────────────────────────────
  exit('toTown', 'Chapel doors', 'chapel', 8, 10, 'doorway',
    'The chapel doors, back out to the road.',
    'Go back outside', 'road', 3, 4),
  {
    id: 'altar',
    name: 'Altar',
    area: 'chapel',
    x: 8,
    y: 1,
    sprite: 'altar',
    blurb: 'A stone altar with two candles that never seem to burn down.',
    actions: [
      {
        id: 'candle',
        label: 'Take a candle',
        minutes: 3,
        steal: true,
        when: (g) => !g.flag('candle'),
        run: (g) => {
          g.say('You lift one of the never-ending candles off the altar. It keeps burning in your hand.', 'dm');
          g.setFlag('candle');
        },
      },
      {
        id: 'quickPray',
        label: 'Say a quick prayer',
        minutes: 3,
        look: true,
        when: (g) => !g.flag('bell'),
        run: (g) => g.say('You pray for snacks. The candles flicker politely.', 'dm'),
      },
      {
        id: 'pray',
        label: 'Pray over the bell',
        minutes: 10,
        check: 'pray',
        when: (g) => g.flag('bell') && !g.flag('blessed') && !g.flag('prayed'),
        run: (g, outcome) => {
          g.setFlag('prayed');
          if (outcome === 'blessed') {
            g.say('Warm light sinks into the bronze. The bell hums a clear, bright note. It\'s blessed.', 'dm');
            g.setFlag('blessed');
          } else {
            g.say('Silence. The candles flicker. Nobody up there is listening tonight.', 'dm');
          }
        },
      },
    ],
  },
  {
    id: 'wren',
    name: 'Sister Wren',
    area: 'chapel',
    x: 10,
    y: 2,
    sprite: 'wren',
    blurb: 'Sister Wren, wide awake, sweeping the same spot over and over.',
    actions: [
      {
        id: 'talk',
        label: 'Talk to Sister Wren',
        minutes: 15,
        talk: true,
        run: (g) => {
          g.say('"You\'re awake too! Thank goodness. It\'s the Long Sleep. The Night Warden roosts in our bell tower, and the whole town dropped where they stood."', 'dm');
          g.say('"Ring the Bell of Harrowmere from the tower and the spell breaks. Old Grandma Bram hid that bell somewhere in the Lantern. And bless it first! An unblessed bell cracks."', 'dm');
          g.setFlag('metWren');
        },
      },
      {
        id: 'show',
        label: 'Show Wren the bell',
        minutes: 10,
        talk: true,
        when: (g) => g.flag('bell') && !g.flag('towerKey'),
        run: (g) => {
          g.say('"You found it!" She presses a little bell-shaped key into your hand. "The tower door. Go. And bless that bell first."', 'dm');
          g.setFlag('towerKey');
        },
      },
      {
        id: 'bless',
        label: 'Ask Wren to bless the bell',
        minutes: 10,
        talk: true,
        when: (g) => g.flag('bell') && !g.flag('blessed'),
        run: (g) => {
          if (g.flag('wellWater')) {
            g.say('She pours the well water over the bronze and murmurs a prayer. The bell starts to glow, softly.', 'dm');
            g.setFlag('blessed');
          } else {
            g.say('"I\'ll need water from the town well. Holy water is just well water I\'ve been very nice to."', 'dm');
          }
        },
      },
      {
        id: 'grave',
        label: 'Ask about the empty grave',
        minutes: 10,
        talk: true,
        when: (g) => g.hasPage('wrenNote'),
        run: (g) => g.say('"G.\'s grave. He tried to ring the bell centuries ago, and never made it. Some say he\'s still trying. Some nights I hear dice rattling in the crypt."', 'dm'),
      },
    ],
  },
  {
    id: 'prayerBook',
    name: 'Prayer book',
    area: 'chapel',
    x: 6,
    y: 3,
    sprite: 'lectern',
    blurb: 'A heavy prayer book, open on a lectern to a page about bells.',
    actions: [
      {
        id: 'read',
        label: 'Read the prayer book',
        minutes: 10,
        run: (g) => g.givePage('prayerBook'),
      },
    ],
  },
  look('pew1', 'Pew', 'chapel', 7, 6, 'pew', PEW_LINES),
  look('pew2', 'Pew', 'chapel', 9, 6, 'pew', PEW_LINES),
  {
    id: 'fenChapel',
    name: 'Fen the bard',
    area: 'chapel',
    x: 10,
    y: 8,
    sprite: 'fen',
    blurb: 'Fen, sulking on the chapel steps, plucking one sad string.',
    visible: (g) => g.flag('fenGone'),
    actions: [
      {
        id: 'sorry',
        label: 'Apologize to Fen',
        minutes: 10,
        talk: true,
        when: (g) => !g.flag('fenForgave'),
        run: (g) => {
          g.say('"…Fine. Apology accepted." Fen sings softly, a song about ashes and teeth, and hands you the songsheet.', 'dm');
          g.setFlag('fenForgave');
          g.setFlag('heardAshes');
          g.givePage('songsheet');
        },
      },
    ],
  },
  look('grave1', 'Grave', 'graveyard', 4, 2, 'grave', [
    'HERE LIES OLD TOM. HE ROLLED A 1.',
    {
      line: 'Smaller, underneath: "…while trying to force the cellar door at the Lantern."',
      reward: (g) => g.learnRoll('forceDoor', 1),
    },
  ]),
  look('grave2', 'Grave', 'graveyard', 8, 2, 'grave', [
    'BELOVED BAKER. SHE KNEW TOO MUCH ABOUT BREAD.',
  ]),
  look('grave3', 'Grave', 'graveyard', 12, 2, 'grave', [
    'R.I.P. A GOAT. FOUND AT LAST.',
    ['jo', 'The lost goat from the notice board!'],
    ['dan', '…I need a minute.'],
  ]),
  look('grave4', 'Grave', 'graveyard', 4, 6, 'grave', [
    'THIS GRAVE INTENTIONALLY LEFT BLANK.',
  ]),
  look('grave5', 'Grave', 'graveyard', 13, 6, 'grave', [
    'HERE LIES A BARD WHO DID NOT ASK NICELY.',
  ]),
  {
    id: 'gGrave',
    name: 'Empty grave',
    area: 'graveyard',
    x: 15,
    y: 6,
    sprite: 'gGrave',
    blurb: 'An open grave with a small headstone, marked only "G." There\'s nothing in it.',
    actions: [
      {
        id: 'look',
        label: 'Look into the grave',
        minutes: 3,
        look: true,
        run: (g) => g.say('Just dirt. At the bottom there\'s a small, neat hollow, about the size of… a die?', 'dm'),
      },
      {
        id: 'bury',
        label: "Bury G.'s d20 in the grave",
        minutes: 10,
        when: (g) => g.flag('gDie') && !g.flag('cryptOpen'),
        run: (g) => {
          if (!g.hasPage('wrenNote')) {
            g.say('You set the d20 in the hollow. Nothing happens. It doesn\'t feel right yet. You don\'t know who G. was.', 'dm');
            return;
          }
          g.say('You set the d20 in the hollow and push the dirt over it. Somewhere behind you, a stone door grinds open.', 'dm');
          g.say('Marcus has gone very quiet.', 'system');
          g.setFlag('cryptOpen');
        },
      },
    ],
  },
  {
    id: 'crypt',
    name: 'Crypt',
    area: 'graveyard',
    x: 14,
    y: 1,
    sprite: 'crypt',
    blurb: 'A stone crypt sealed with an iron door. There\'s no handle on this side.',
    actions: [
      {
        id: 'try',
        label: 'Try the crypt door',
        minutes: 3,
        look: true,
        when: (g) => !g.flag('cryptOpen'),
        run: (g) => g.say('Sealed tight. You\'d need a reason to be let in.', 'dm'),
      },
      {
        id: 'enter',
        label: 'Go down into the crypt',
        minutes: 10,
        when: (g) => g.flag('cryptOpen') && !g.flag('metG'),
        run: (g) => {
          g.say('A pale figure in old adventurer\'s gear sits on the crypt steps, rolling a ghostly d20 over and over. He looks up.', 'dm');
          g.say('"You brought my die home." He smiles. "I\'ve been trying to ring that bell for four hundred years. Every night, from the top."', 'dm');
          g.say('"If you have the bell… could I? Just once?"', 'dm');
          g.givePage('gJournal');
          g.setFlag('metG');
        },
      },
      {
        id: 'talkG',
        label: 'Talk to G.',
        minutes: 10,
        talk: true,
        when: (g) => g.flag('metG') && !g.flag('bell'),
        run: (g) => g.say('"The bell. It\'s in the Lantern cellar, in the chest with the teeth. Bring it to me and I\'ll ring it myself."', 'dm'),
      },
      {
        id: 'giveG',
        label: 'Give G. the bell',
        minutes: 5,
        when: (g) => g.flag('metG') && g.flag('bell'),
        run: (g) => g.ending('secret', [
          'G. takes the bell in both hands, like it\'s the most precious thing in the world.',
          '"I\'ve rung this a thousand times in my head," he says. "Never once for real."',
          'He climbs the tower alone. The Night Warden doesn\'t even stir. The bell rings out, clear and bright, and the whole town wakes.',
          'G. fades with the last echo, smiling.',
          'At the real table, Marcus is quiet for a long moment.',
          '"G. was my character. From the first campaign I ever ran, back in high school. We never finished it."',
          '"…Thanks for finishing it."',
        ]),
      },
    ],
  },
  look('tree1', 'Yew tree', 'graveyard', 16, 9, 'tree', [
    'An old yew tree. Someone has carved "G. WAS HERE" into the bark. A long time ago.',
  ]),
  look('grave6', 'Grave', 'graveyard', 8, 6, 'grave', [
    'HERE LIES DAVE. HE SPLIT THE PARTY.',
    ['priya', 'Rude. Accurate, but rude.'],
  ]),
  look('grave7', 'Grave', 'graveyard', 6, 8, 'grave', [
    'IN LOVING MEMORY OF THE PLOT. MARCUS PREPARED IT FOR THREE WEEKS.',
    'Marcus: "I don\'t want to talk about it."',
  ]),
  look('grave8', 'Grave', 'graveyard', 13, 8, 'graveCross', [
    'GRUKK THE FIRST. AND GRUKK THE SECOND, BESIDE HIM.',
    ['dan', 'Wait. WAIT. How many Grukks have there been?'],
    'Marcus: "Keep rolling like that and you\'ll find out."',
  ]),
  look('dugGrave', 'Half-dug grave', 'graveyard', 15, 8, 'shovelGrave', [
    'A half-dug grave with a shovel still standing in it. The marker just says RESERVED.',
    {
      line: 'Marcus: "It\'s for whoever falls asleep first." Jo laughs so hard she snorts, and suddenly everyone is a bit more awake.',
      reward: (g) => g.boostEnergy(4),
    },
  ]),
  look('crows', 'Crows', 'graveyard', 9, 6, 'crows', [
    'Two crows on a broken headstone, watching you closely. They are not asleep.',
    ['priya', 'Why are the crows awake?'],
    'Marcus: "No reason." He makes a note.',
  ]),
  look('tree2', 'Yew tree', 'graveyard', 2, 9, 'tree', [
    'An old yew tree, perfect for brooding under.',
    ['priya', 'I brood under it.'],
  ]),

  // ── Hall Street ───────────────────────────────────────────
  exit('hallDoor', 'Town Hall', 'street', 8, 2, 'door',
    'The town hall, grand and grey, with the stopped clock beside the door. The door is ajar.',
    'Go into the town hall', 'hall', 8, 8),
  ...roadExit('streetToSquare', 'Back to the square', 'street', [[10, 10], [11, 10]], 'Down',
    'The street back down to the town square.',
    'Walk down to the square', 'square', 10, 1),
  ...roadExit('streetToGraveyard', 'To the graveyard', 'street', [[0, 5], [0, 6]], 'Left',
    'West, to the back of the graveyard.',
    'Walk to the graveyard', 'graveyard', 16, 5),
  ...roadExit('graveyardToStreet', 'To Hall Street', 'graveyard', [[17, 5], [17, 6]], 'Right',
    'A gap in the hedge, out onto Hall Street.',
    'Walk out to Hall Street', 'street', 1, 5),
  ...roadExit('streetToPond', 'To the mill pond', 'street', [[17, 5], [17, 6]], 'Right',
    'East, down to the mill pond. You can hear ducks.',
    'Walk to the mill pond', 'pond', 1, 5),
  look('founder', 'Statue', 'street', 8, 5, 'statue', [
    'A statue of HARROW THE WAKEFUL, who founded the town and rang its first bell.',
    'Somebody has put a nightcap on him.',
    ['dan', 'Ironic.'],
  ]),
  look('hallBoard', 'Notice board', 'street', 12, 2, 'board', [
    'COUNCIL MEETING POSTPONED UNTIL EVERYONE WAKES UP.',
    {
      line: 'Under that, a lost-and-found card: "FOUND: one goose. Very angry. Do NOT feed after midnight. Bread only. — the Mill"',
      reward: (g) => g.learnRoll('goose', 12),
    },
  ]),
  look('houseW', 'House', 'street', 2, 2, 'door', [
    'A narrow house with a brass knocker.',
    'You knock. Somebody inside says "five more minutes" without waking up.',
  ], 'Knock'),
  look('houseE', 'House', 'street', 15, 2, 'door', [
    'A hand-written sign on the door: GONE TO BED. BACK NEVER.',
  ], 'Knock'),
  look('crier', 'Sleeping town crier', 'street', 13, 4, 'sleeperCrier', [
    'The town crier, asleep mid-announcement with his bell still raised.',
  ]),

  // ── The Mill Pond ─────────────────────────────────────────
  { id: 'millFront', name: '', area: 'pond', x: 11, y: 0, sprite: 'millFront', actions: [] },
  ...roadExit('pondToStreet', 'Back to Hall Street', 'pond', [[0, 5], [0, 6]], 'Left',
    'The lane back up to Hall Street.',
    'Walk back to Hall Street', 'street', 16, 5),
  {
    id: 'millDoor',
    name: 'Mill door',
    area: 'pond',
    x: 12,
    y: 2,
    sprite: 'door',
    blurb: 'The mill door, with floury handprints all over it.',
    actions: [
      {
        id: 'knock',
        label: 'Knock',
        minutes: 2,
        look: true,
        when: (g) => !g.flag('millKey'),
        run: (g) => g.say('Locked. Inside, the millstones are still turning, very slowly. Nobody is minding them.', 'dm'),
      },
      {
        id: 'unlock',
        label: 'Unlock the mill',
        minutes: 3,
        when: (g) => g.flag('millKey'),
        run: (g) => {
          if (!g.flag('millOpen')) g.say('The brass key turns. A puff of flour blows out to meet you.', 'dm');
          g.setFlag('millOpen');
          g.goTo('mill', 8, 7);
        },
      },
    ],
  },
  {
    id: 'sluice',
    name: 'Sluice gate',
    area: 'pond',
    x: 14,
    y: 3,
    sprite: '',
    hidden: true,
    blurb: 'Half under the water, a wooden sluice gate that feeds the mill wheel. There\'s a square socket where a crank should go.',
    actions: [
      {
        id: 'try',
        label: 'Try to shut it',
        minutes: 3,
        look: true,
        when: (g) => !g.flag('crank') && !g.flag('wheelStopped'),
        run: (g) => g.say('You heave on it with your bare hands. Nothing. It needs a crank in that socket.', 'dm'),
      },
      {
        id: 'shut',
        label: 'Fit the crank and shut the sluice',
        minutes: 5,
        when: (g) => g.flag('crank') && !g.flag('wheelStopped'),
        run: (g) => {
          g.say('The crank bites. You wind, and wind, and the sluice groans shut. The mill wheel slows… and stops, dripping.', 'dm');
          g.achieve('secret-spot');
          g.setFlag('wheelStopped');
        },
      },
    ],
  },
  {
    id: 'millWheel',
    name: 'Mill wheel',
    area: 'pond',
    x: 15,
    y: 2,
    sprite: 'millWheel',
    visible: (g) => !g.flag('wheelStopped'),
    blurb: 'The mill wheel, turning slowly. Something glints on one of the paddles each time it comes round.',
    actions: [
      {
        id: 'grab',
        label: 'Grab at the glint',
        minutes: 2,
        look: true,
        run: (g) => g.say('You lunge for it as the paddle goes by. The wheel nearly takes your arm with it. Maybe stop the wheel first.', 'dm'),
      },
    ],
  },
  {
    id: 'millWheelStill',
    name: 'Mill wheel',
    area: 'pond',
    x: 15,
    y: 2,
    sprite: 'millWheelStill',
    visible: (g) => g.flag('wheelStopped'),
    blurb: 'The mill wheel, stopped and dripping.',
    actions: [
      {
        id: 'key',
        label: 'Check the third paddle',
        minutes: 3,
        when: (g) => !g.flag('millKey'),
        run: (g) => {
          g.say('Tied to a nail on the third paddle with a bit of red string: a brass key, stamped MILL.', 'dm');
          g.say('That is the most complicated way to hide a key I have ever seen.', 'jo');
          g.setFlag('millKey');
        },
      },
    ],
  },
  {
    id: 'goose',
    name: 'Goose',
    area: 'pond',
    x: 5,
    y: 7,
    sprite: 'goose',
    visible: (g) => !g.flag('gooseGone'),
    blurb: 'A large white goose standing guard over the sleeping miller. It is wide awake. It is looking at you.',
    actions: [
      {
        id: 'bread',
        label: 'Throw it a loaf of bread',
        minutes: 3,
        when: (g) => g.flag('bread'),
        run: (g) => {
          g.say('The goose catches the loaf mid-air, gives you one last look of pure contempt, and waddles off to eat it in private.', 'dm');
          g.clearFlag('bread');
          g.setFlag('gooseGone');
        },
      },
      {
        id: 'fight',
        label: 'Fight the goose',
        minutes: 10,
        check: 'goose',
        run: (g, outcome) => {
          if (outcome === 'honked') {
            g.say('HONK. The goose chases the entire party, heroes of legend, all the way back up to Hall Street.', 'dm');
            g.say('I want it on record that Grukk ran first.', 'priya');
            g.boostEnergy(-6);
            g.goTo('street', 16, 5);
          } else if (outcome === 'friend') {
            g.say('You stand your ground. The goose stops. It looks you up and down… and bows. It falls in at your heel. You have a goose now.', 'dm');
            g.say('This is the best thing that has ever happened to me.', 'dan');
            g.setFlag('gooseGone');
            g.setFlag('gooseFriend');
            g.achieve('honk');
            g.boostEnergy(8);
            fightWon(g);
          } else {
            g.say('Grukk flaps his arms and HONKS back. The goose, deeply offended, retreats to the reeds.', 'dm');
            g.setFlag('gooseGone');
            g.boostEnergy(4);
            fightWon(g);
          }
        },
      },
    ],
  },
  {
    id: 'miller',
    name: 'Sleeping miller',
    area: 'pond',
    x: 5,
    y: 8,
    sprite: 'sleeperMiller',
    blurb: 'The miller, asleep in the grass with a well-thumbed almanac on his chest.',
    actions: [
      {
        id: 'blocked',
        label: 'Take a closer look',
        minutes: 2,
        look: true,
        when: (g) => !g.flag('gooseGone'),
        run: (g) => g.say('The goose steps between you and the miller and hisses like a kettle. Not today.', 'dm'),
      },
      {
        id: 'almanac',
        label: 'Borrow his almanac',
        minutes: 3,
        steal: true,
        when: (g) => g.flag('gooseGone') && !g.hasPage('almanac'),
        run: (g) => {
          g.say('You ease the almanac out from under his hands. He mumbles "not for sale" and keeps snoring.', 'dm');
          g.givePage('almanac');
        },
      },
      {
        id: 'salts',
        label: 'Wake him with smelling salts',
        minutes: 3,
        when: (g) => g.flag('gooseGone') && g.flag('salts') && !g.flag('awake:miller'),
        run: (g) => {
          g.say('You wave the salts under his nose. He snorts, rolls over and snores even louder. Millers sleep like millstones. You\'d need something far stronger.', 'dm');
        },
      },
      {
        id: 'revive',
        label: "Wake him with the Miller's Revival",
        minutes: 5,
        talk: true,
        when: (g) => g.flag('gooseGone') && g.flag('revival') && !g.flag('awake:miller'),
        run: (g) => {
          g.clearFlag('revival');
          g.setFlag('awake:miller');
          g.achieve('grind');
          g.say('One sniff of the Revival and the miller sits bolt upright, eyes streaming. He looks at you for a long moment.', 'dm');
          g.say('"You. You\'re the one who keeps coming back, aren\'t you? Every week, same night. I can see it on you, plain as flour." He tears a page from the back of his almanac and starts writing, fast.', 'dm');
          g.say('"Everything. How to ring that bell, start to finish. And what to do after." He presses it into your hands. "Don\'t waste it."', 'dm');
          g.say('Marcus stares at his notes. "…He was NOT supposed to know that."', 'dm');
          g.givePage('millerNotes');
          g.learnRoll('chest', 13);
          g.learnRoll('wardenLantern', 6);
        },
      },
      {
        id: 'askAgain',
        label: 'Ask him again',
        minutes: 2,
        talk: true,
        when: (g) => g.flag('awake:miller'),
        run: (g) => g.say('"It\'s all on the page. Chest, blessing, the Close, a light, a plank, salts. Then ring it. Then go and find G." He goes back to watching the goose.', 'dm'),
      },
    ],
    awakeBlurb: 'The miller, wide awake for the first time in weeks, sitting up in the grass and watching the goose with deep respect.',
  },
  look('fisher', 'Sleeping fisherman', 'pond', 8, 3, 'sleeperFisher', [
    'A fisherman asleep on the bank, his line still in the water. Something is tugging on it.',
    { line: 'You reel in his line for him: a boot, full of tiny fish. Everyone at the table cheers.', reward: (g) => g.calmTable(2) },
  ]),
  look('rowboat', 'Rowboat', 'pond', 14, 7, 'rowboat', [
    'A little rowboat tied to nothing, drifting in slow circles.',
    ['jo', 'Can we just… sit in the boat for a bit?'],
    'Marcus: "That\'s not a quest." Jo: "It could be."',
  ]),

  // ── The Mill ──────────────────────────────────────────────
  exit('millExit', 'Mill door', 'mill', 8, 8, 'doorway',
    'The way back out to the mill pond.', 'Go back outside', 'pond', 12, 3),
  look('millstones', 'Millstones', 'mill', 8, 3, 'millstone', [
    'The great millstones, grinding nothing, very slowly. Nobody has fed them grain in weeks.',
    ['dan', 'I put my hand in it.'],
    'Marcus: "No you don\'t."',
  ]),
  look('millDesk', "Miller's desk", 'mill', 5, 3, 'table', [
    'A desk buried in flour. A half-written letter: "Dear Mayor, for the LAST time, the goose is NOT for sale…"',
    {
      line: 'Under the letter, a list of customers. The baker\'s name is circled: "Owes for six sacks. Pays in bread. Goose approves."',
      reward: (g) => g.learnRoll('goose', 12),
    },
  ]),
  {
    id: 'revivalShelf',
    name: 'Shelf of jars',
    area: 'mill',
    x: 11,
    y: 2,
    sprite: 'saltsCounter',
    blurb: 'Jars of yeast, salt, and something murky. One big brown bottle reads: MILLER\'S REVIVAL. FOR THE DEEPEST SLEEPERS. ONE SNIFF ONLY.',
    actions: [
      {
        id: 'take',
        label: "Take the Miller's Revival",
        minutes: 3,
        steal: true,
        when: (g) => !g.flag('revival') && !g.flag('awake:miller'),
        run: (g) => {
          g.say('You pocket the bottle. Even corked, it makes your eyes water from here.', 'dm');
          g.say('Whatever that is, I want it for Monday mornings.', 'priya');
          g.setFlag('revival');
        },
      },
    ],
  },

  // ── The Tower Close ───────────────────────────────────────
  // The tower itself: one big illustration across 4×6 tiles, drawn under the doors.
  { id: 'towerFront', name: '', area: 'close', x: 7, y: 0, sprite: 'towerFront', actions: [] },
  ...towerDoors(),
  ...backGate('close'),
  ...roadExit('closeToSquare', 'Back to the square', 'close', [[0, 5], [0, 6]], 'Left',
    'The street back to the town square.',
    'Walk back to the square', 'square', 16, 5),
  {
    id: 'swarm',
    name: 'Moth swarm',
    area: 'close',
    x: 8,
    y: 6,
    sprite: 'mothSwarm',
    walkable: true,
    visible: (g) => !g.flag('swarmGone'),
    blurb: 'A whirling cloud of little moths, guarding the tower door. Every wingbeat sheds glittering, sleepy dust.',
    actions: [
      {
        id: 'light',
        label: 'Wave a light at them',
        minutes: 3,
        when: (g) => g.flag('lantern') || g.flag('coal') || g.flag('candle'),
        run: (g) => {
          g.say('You hold up the light. The swarm shrieks (tiny, many shrieks) and pours away up the tower wall.', 'dm');
          g.say("Fire solves everything. Write that down.", 'dan');
          g.setFlag('swarmGone');
        },
      },
      {
        id: 'fight',
        label: 'Fight the swarm',
        minutes: 10,
        check: 'swarm',
        run: (g, outcome) => {
          if (outcome === 'smothered') {
            g.say('You swing at the cloud. The cloud swings back, mostly with dust. Everyone at the real table yawns at once.', 'dm');
            g.boostEnergy(-10);
          } else if (outcome === 'scattered') {
            g.say('Grukk windmills his axe, Nyx stabs at specks, and the swarm finally breaks and scatters. You are all very, very dusty.', 'dm');
            g.boostEnergy(-4);
            g.setFlag('swarmGone');
            fightWon(g);
          } else {
            g.say('Halden raises his holy symbol, Grukk ROARS, and the swarm flees in a glittering panic.', 'dm');
            g.say("That's the best fight we've had in WEEKS.", 'dan');
            g.boostEnergy(6);
            g.setFlag('swarmGone');
            fightWon(g);
          }
        },
      },
    ],
  },
  look('ringer', 'Old bell-ringer', 'close', 13, 7, 'sleeperRinger', [
    'The old bell-ringer, asleep in the grass with his arms crossed. A rope burn on each palm.',
    {
      line: 'His logbook has slipped out of his coat: "Moths hate light. So does the big one."',
      reward: (g) => g.learnRoll('wardenLantern', 6),
    },
  ]),
  look('closeWell', 'Well', 'close', 4, 8, 'well', [
    'A little well for the tower. Someone has carved "RING ME" on the bucket.',
  ]),
  look('closeGrave', 'Old grave', 'close', 14, 2, 'grave', [
    'HERE LIES BARNABY. RANG THE BELL 40 YEARS. NOW HE CAN SLEEP IN.',
    ['jo', "That's either sweet or a threat."],
  ]),

  // ── The Bell Tower ────────────────────────────────────────
  exit('towerExit', 'Tower door', 'tower', 8, 10, 'doorway',
    'The way back out to the Tower Close.',
    'Go back outside', 'close', 9, 6),
  {
    id: 'bellFrame',
    name: 'Bell frame',
    area: 'belfry',
    x: 8,
    y: 1,
    sprite: 'bellFrame',
    blurb: 'An empty bell frame at the very top of the tower. A rope hangs from the crossbeam.',
    actions: [
      {
        id: 'empty',
        label: 'Look at the empty frame',
        minutes: 3,
        look: true,
        when: (g) => !g.flag('bell'),
        run: (g) => g.say('The bell should hang here. It doesn\'t. You need the Bell of Harrowmere.', 'dm'),
      },
      {
        id: 'ring',
        label: 'Hang the bell and ring it',
        minutes: 5,
        when: (g) => g.flag('bell'),
        run: (g) => {
          if (g.flag('blessed')) {
            g.ending('good', [
              'You hang the blessed bell and pull the rope. It rings out, clear and bright, over the rooftops.',
              'The Night Warden shrieks and flees into the dawn.',
              'All across Harrowmere, people wake up mid-sentence and finish their sentences.',
              'Marcus: "…You did it. You actually finished a campaign."',
              'Everyone cheers. Dan knocks over the snacks.',
            ]);
          } else if (!g.flag('wardenGone')) {
            g.ending('tpk', [
              'You hang the bell and pull the rope. It gives a sour, cracked CLANG.',
              'Above you, every one of the Night Warden\'s eyes opens at once.',
              'There is no initiative roll. There is just wings.',
              ...TPK_TAIL,
            ]);
          } else {
            g.ending('bad', [
              'You hang the bell and pull the rope. It gives one sour, broken CLANG and splits right down the middle.',
              'Below, the town stirs… and settles back to sleep. For good.',
              'Marcus: "You didn\'t bless it. It says to bless it in, like, three places."',
            ]);
          }
        },
      },
    ],
  },
  {
    id: 'warden',
    name: 'The Night Warden',
    area: 'belfry',
    x: 8,
    y: 4,
    sprite: 'moth',
    blurb: 'A moth the size of a carriage, hanging in the rafters. Its wings are covered in eyes. Some of them are open.',
    visible: notGone('wardenGone'),
    actions: [
      {
        id: 'tiptoe',
        label: 'Tiptoe past',
        minutes: 3,
        look: true,
        run: (g) => g.say('You tiptoe. The floorboards creak. One eye swivels toward you. You stop tiptoeing.', 'dm'),
      },
      {
        id: 'fight',
        label: 'Fight the Night Warden',
        minutes: 10,
        check: 'warden',
        when: (g) => !g.flag('lantern'),
        run: (g, outcome) => {
          if (outcome === 'driven') {
            g.say('Against all odds, you drive it off. It flaps out through a window into the night.', 'dm');
            g.setFlag('wardenGone');
          } else {
            g.ending('tpk', [
              'You swing. The Night Warden doesn\'t even bother to dodge.',
              'It unfolds its wings, and every eye on them opens at once.',
              ...TPK_TAIL,
            ]);
          }
        },
      },
      {
        id: 'lanternFight',
        label: 'Drive it off with the lantern',
        minutes: 10,
        check: 'wardenLantern',
        when: (g) => g.flag('lantern'),
        run: (g, outcome) => {
          if (outcome === 'driven') {
            g.say('You hold up Bram\'s lantern. The Warden shrieks, covers all its eyes, and bolts out a window.', 'dm');
            g.setFlag('wardenGone');
          } else {
            g.ending('tpk', [
              'You raise the lantern. It flickers. And goes out.',
              'In the dark, the Night Warden has never lost a fight.',
              ...TPK_TAIL,
            ]);
          }
        },
      },
    ],
  },
  {
    id: 'logbook',
    name: "Bell-ringer's logbook",
    area: 'tower',
    x: 6,
    y: 8,
    sprite: 'lectern',
    blurb: 'A logbook on a stand, full of tiny, nervous handwriting.',
    actions: [
      {
        id: 'read',
        label: 'Read the logbook',
        minutes: 10,
        run: (g) => g.givePage('bestiary'),
      },
    ],
  },
  look('rope', 'Bell rope', 'belfry', 11, 3, 'rope', [
    'A frayed bell rope hanging from nowhere in particular.',
    ['dan', 'I pull the rope.'],
    'Marcus: "There\'s no bell, Dan. Nothing happens. You look silly."',
  ]),
  look('towerCrate', 'Crate', 'tower', 11, 8, 'crate', [
    'Spare candles and a moth-eaten blanket. Very moth-eaten. Suspiciously moth-eaten.',
  ]),


  // ── The Bakery ────────────────────────────────────────────
  exit('bakeryExit', 'Bakery door', 'bakery', 8, 8, 'doorway',
    'The door back out to the square.', 'Go back outside', 'square', 8, 3),
  look('oven', 'Brick oven', 'bakery', 5, 1, 'oven', [
    'A big brick oven, still warm. Something smells incredible.',
    {
      line: 'Inside: one perfect loaf. Marcus describes it so well that everyone at the real table gets hungry, and Jo puts the kettle on.',
      reward: (g) => g.boostEnergy(6),
    },
  ]),
  look('breadRack', 'Bread racks', 'bakery', 8, 1, 'breadRack', [
    'Racks of bread, mid-cooling. Frozen in time like everything else.',
    ['dan', 'I eat the bread.'],
    'Marcus: "It\'s… fine. You eat the bread."',
  ]),
  look('orders', 'Order board', 'bakery', 11, 1, 'board', [
    'A chalkboard of standing orders.',
    {
      line: 'The handwriting looks suspiciously like Marcus\'s. One line reads: "PRIYA: anything SOUR."',
      reward: (g) => g.learnTaste('priya', 'sour'),
    },
    ['priya', '…Have you been taking notes on us?'],
  ]),
  look('apprentice', 'Sleeping apprentice', 'bakery', 6, 5, 'sleeperApprentice', [
    'An apprentice, asleep face-down in a bowl of dough.',
    'You gently lift his face out of the dough. He keeps snoring.',
  ]),

  // ── The Guardhouse ────────────────────────────────────────
  exit('guardExit', 'Guardhouse door', 'guardhouse', 8, 8, 'doorway',
    'The door back out to the square.', 'Go back outside', 'square', 16, 3),
  look('captain', 'Guard captain', 'guardhouse', 6, 3, 'sleeperGuard', [
    'The guard captain, asleep in full armour at his desk.',
    {
      line: 'His logbook is open: "Tower east window: latch broken. Anyone nimble could climb in." Underneath: "Hendricks made it on a 16."',
      reward: (g) => g.learnRoll('climb', 16),
    },
  ]),
  {
    ...look('keyRack', 'Key rack', 'guardhouse', 8, 1, 'keyRack', [
      'A key rack. Every hook is neatly labelled.',
      'The hook labelled TOWER is empty. A note pinned under it: "Spare: Sister W., up at the chapel."',
    ]),
  },
  {
    id: 'recruit',
    name: 'Sleepwalking recruit',
    area: 'guardhouse',
    x: 8,
    y: 2,
    sprite: 'recruit',
    walkable: true,
    visible: (g) => !g.flag('recruitDown'),
    blurb: 'A young recruit, sleepwalking through sword drills right in front of the key rack. Eyes glazed. Swinging hard.',
    actions: [
      {
        id: 'tackle',
        label: 'Tackle the recruit',
        minutes: 10,
        check: 'recruit',
        run: (g, outcome) => {
          if (outcome === 'pinned') {
            g.say('Grukk scoops the recruit up in a bear hug and lays him down on a cot, still mumbling drill counts. Out like a light.', 'dm');
            g.say("Aww. He's like a big sleepy puppy.", 'jo');
            g.boostEnergy(4);
            g.setFlag('recruitDown');
            fightWon(g);
          } else {
            g.say('BONK. The practice sword finds your helmet. Then your other helmet. You only have one helmet.', 'dm');
            g.say('He hit you TWICE. In his SLEEP.', 'priya');
            g.boostEnergy(-5);
          }
        },
      },
    ],
  },
  look('wanted', 'Wanted poster', 'guardhouse', 10, 1, 'poster', [
    'WANTED: a thin man in a velvet coat. For "trading in stolen bells".',
    ['jo', "That's… that's Vex, right?"],
  ]),
  {
    id: 'pip',
    name: 'Pip the prisoner',
    area: 'guardhouse',
    x: 12,
    y: 6,
    sprite: 'prisoner',
    blurb: 'A scruffy prisoner behind bars, wide awake and extremely bored.',
    actions: [
      {
        id: 'talk',
        label: 'Talk to Pip',
        minutes: 10,
        talk: true,
        run: (g) => {
          g.say('"Climbed that bell tower twice, I have. Got in on a twelve. Fell in the hedge on an eleven. That\'s how they caught me."', 'dm');
          g.learnRoll('climb', 11);
          g.learnRoll('climb', 12);
        },
      },
      {
        id: 'crime',
        label: "Ask what he's in for",
        minutes: 5,
        talk: true,
        run: (g) => {
          g.say('"Borrowed a ham. For a chest. Long story." He looks at you meaningfully.', 'dm');
          g.say("Okay, now I want to know the long story.", 'priya');
        },
      },
    ],
  },

  // ── Town Hall ─────────────────────────────────────────────
  exit('hallExit', 'Town hall door', 'hall', 8, 9, 'doorway',
    'The door back out to Hall Street.', 'Go back outside', 'street', 8, 3),
  look('mayor', 'Sleeping mayor', 'hall', 8, 3, 'sleeperMayor', [
    'The mayor, asleep on a mountain of paperwork.',
    'The form on top reads: "Request to bless the town bell: DENIED. No well water on file."',
  ]),
  look('archives', 'Town archives', 'hall', 5, 1, 'bookshelf', [
    'Shelves of town records. Mostly about goats.',
    'A ledger falls open: "Bell rung unblessed: cracked. Rung again, blessed: whole town woke." Someone has underlined BLESSED three times.',
  ]),
  look('townMap', 'Map of Harrowmere', 'hall', 9, 1, 'townMap', [
    'A big hand-drawn map of Harrowmere.',
    'Someone has circled two spots in red ink: the coal chute by the inn, and the wall behind the bench near the tower.',
  ]),
  {
    id: 'ledger',
    name: 'Records ledger',
    area: 'hall',
    x: 12,
    y: 6,
    sprite: 'lectern',
    blurb: 'A heavy ledger on a stand, open to a page about the bell.',
    actions: [{ id: 'read', label: 'Read the ledger', minutes: 10, run: (g) => g.givePage('records') }],
  },


  // ── The Chapel Road ───────────────────────────────────────
  // The chapel itself: one big illustration across 7×4 tiles, drawn under the door.
  { id: 'chapelFront', name: '', area: 'road', x: 0, y: 0, sprite: 'chapelFront', actions: [] },
  exit('chapelDoor', 'The Old Chapel', 'road', 3, 3, 'chapelDoor',
    'The old chapel: slate roof, mossy stone, a little bell-cote with no bell in it.',
    'Go into the chapel', 'chapel', 8, 9),
  ...roadExit('roadToSquare', 'Road to town', 'road', [[17, 5], [17, 6]], 'Right',
    'The road back to the town square.',
    'Walk back to town', 'square', 1, 5),
  look('shrine', 'Wayside shrine', 'road', 13, 3, 'shrine', [
    'A little wayside shrine with a candle that never seems to go out.',
    {
      line: 'You leave a coin and a quiet thought. For some reason, everyone at the real table relaxes a little.',
      reward: (g) => g.calmTable(2),
    },
  ], 'Leave a coin'),
  ...roadExit('roadToGraveyard', 'Lych-gate', 'road', [[10, 0], [11, 0]], 'Up',
    'A little roofed lych-gate in the hedge, beside the chapel. The graveyard is through there.',
    'Go into the graveyard', 'graveyard', 10, 9),
  ...roadExit('graveyardToRoad', 'Lych-gate', 'graveyard', [[10, 10], [11, 10]], 'Down',
    'The lych-gate back out to the chapel road.',
    'Go back to the road', 'road', 10, 1),
  ...roadExit('roadToGate', 'Lane to the town gate', 'road', [[4, 10], [5, 10]], 'Down',
    'A muddy lane south, along the back of the houses to the town gate.',
    'Walk down to the town gate', 'gate', 4, 1),
  look('scarecrow', 'Scarecrow', 'road', 13, 8, 'scarecrow', [
    'A scarecrow with a turnip for a head. Even it looks drowsy.',
    ['dan', 'I fight the scarecrow.'],
    'Marcus: "Roll for— no. No. It\'s a scarecrow, Dan."',
  ]),
  look('shepherd', 'Sleeping shepherd', 'road', 6, 8, 'sleeperShepherd', [
    'A shepherd, asleep leaning on his crook. His flock is asleep around him.',
    'He mumbles "…ninety-nine… a hundred…" in his sleep.',
  ]),
  look('sheep', 'Sleeping sheep', 'road', 8, 8, 'sheep', [
    'A sheep, fast asleep. Even the sheep got got.',
    {
      line: 'You count the sheep. One… two… three… Everyone at the real table yawns at once.',
      reward: (g) => g.boostEnergy(-3),
    },
    ['jo', 'Why would you do that.'],
  ], 'Count the sheep'),
  {
    id: 'roadCart',
    name: 'Broken cart',
    area: 'road',
    x: 12,
    y: 9,
    sprite: 'brokenCart',
    blurb: 'A cart with a broken wheel, abandoned mid-journey. Its boards look sturdy.',
    actions: [
      {
        id: 'board',
        label: 'Pull a board off the cart',
        minutes: 10,
        when: (g) => !g.flag('plank'),
        run: (g) => {
          g.say('With a lot of creaking and one splinter, you pry a long board off the cart bed.', 'dm');
          g.say('Is this stealing? This feels like stealing.', 'jo');
          g.setFlag('plank');
        },
      },
    ],
  },
  look('milestone', 'Milestone', 'road', 16, 4, 'milestone', [
    'HARROWMERE: 0 MILES. CHAPEL: RIGHT THERE.',
  ]),
  look('roadLamp', 'Road lamp', 'road', 6, 4, 'lamp', LAMP_LINES),

  // ── The Town Gate ─────────────────────────────────────────
  ...roadExit('gateToRoad', 'Lane to the chapel road', 'gate', [[4, 0], [5, 0]], 'Up',
    'A muddy lane north, up to the chapel road.',
    'Walk up to the chapel road', 'road', 4, 9),
  ...(['L', 'R'] as const).map((half, i): ObjectDef => ({
    id: `townGate${half}`,
    name: 'Town gate',
    area: 'gate',
    x: 8 + i,
    y: 8,
    sprite: `townGate${half}`,
    blurb: 'The town gate: shut, barred, and guarded by two people who are very much awake.',
    actions: [
      {
        id: 'leave',
        label: 'Try to leave town',
        minutes: 5,
        run: (g) => {
          g.say('Two spears cross in front of you. "Nobody leaves. Quarantine. Sergeant\'s orders."', 'dm');
          g.say('Marcus: "The campaign is in Harrowmere. Please stay in Harrowmere."', 'dm');
          g.achieve('nobody-leaves');
        },
      },
    ],
  })),
  look('gateGuard1', 'Gate guard', 'gate', 7, 7, 'guardAwake', [
    'A guard, very much awake, glaring at you over a shield.',
    'You wave. He does not wave back.',
  ]),
  look('gateGuard2', 'Gate guard', 'gate', 10, 7, 'guardAwake', [
    'A guard, awake and twitchy. She hasn\'t blinked in a worrying amount of time.',
    '"I drank nine coffees," she says, unprompted.',
  ]),
  {
    id: 'holt',
    name: 'Sergeant Holt',
    area: 'gate',
    x: 12,
    y: 5,
    sprite: 'sergeant',
    blurb: 'Sergeant Holt, red-caped, awake, and absolutely not in the mood.',
    actions: [
      {
        id: 'talk',
        label: 'Talk to Sergeant Holt',
        minutes: 10,
        talk: true,
        run: (g) => {
          g.say('"The sleep started the night that moth thing landed on the bell tower. Travellers outside dropped in the ditch. So: nobody in, nobody out."', 'dm');
          g.say('"Funny thing. A thin fellow in a velvet coat came in the day before. Wide awake ever since."', 'dm');
        },
      },
      {
        id: 'bluff',
        label: 'Talk your way past him',
        minutes: 10,
        talk: true,
        check: 'bluff',
        when: (g) => !g.flag('holtTried'),
        run: (g, outcome) => {
          g.setFlag('holtTried');
          if (outcome === 'peek') {
            g.say('Holt sighs and lets you look through the bars. Beyond the gate, the road is lined with travellers asleep in the ditch.', 'dm');
            g.say('"Whatever this is, it\'s spreading. Ring. That. Bell." Then, quieter: "I saw a farmer drive off a moth that size once. Took a mighty swing."', 'dm');
            g.learnRoll('warden', 17);
          } else {
            g.say('"No." Holt doesn\'t even look up. "Back inside, bard."', 'dm');
          }
        },
      },
    ],
  },
  {
    id: 'quarantineNotice',
    name: 'Quarantine notice',
    area: 'gate',
    x: 5,
    y: 4,
    sprite: 'post',
    blurb: 'A freshly nailed notice with an official-looking seal.',
    actions: [{ id: 'read', label: 'Read the notice', minutes: 5, run: (g) => g.givePage('quarantine') }],
  },
  look('gateLamp', 'Street lamp', 'gate', 11, 3, 'lamp', LAMP_LINES),
  ...roadExit('toMarket', 'Market Street', 'gate', [[17, 5], [17, 6]], 'Right',
    'The street east to Market Street. The shops down there are all shut.',
    'Walk to Market Street', 'market', 1, 5),
  look('horse', 'Sleeping horse', 'gate', 14, 6, 'horse', [
    'A cart horse, asleep standing up, which horses do anyway, so honestly no change.',
  ]),

  // ── Washing Lane ──────────────────────────────────────────
  ...roadExit('laneToMarket', 'Back to Market Street', 'yard', [[0, 5], [0, 6]], 'Left',
    'The street back west to Market Street.',
    'Walk back to Market Street', 'market', 16, 5),
  ...backGate('yard'),
  {
    id: 'ned',
    name: 'Cousin Ned',
    area: 'yard',
    x: 8,
    y: 4,
    sprite: 'ned',
    blurb: "Bram's cousin Ned, wide awake, one hand wrapped in an enormous bandage.",
    actions: [
      {
        id: 'talk',
        label: 'Talk to Cousin Ned',
        minutes: 10,
        talk: true,
        run: (g) => {
          g.say('"Insomnia runs in the family. Like the biting, apparently." He waves the bandage. "That chest in Bram\'s cellar. I opened it on a seven and it took a chunk out of me."', 'dm');
          g.learnRoll('chest', 7);
        },
      },
      {
        id: 'advice',
        label: 'Ask for advice about the chest',
        minutes: 5,
        talk: true,
        run: (g) => g.say('"Grandma always said: feed it, don\'t fight it. I did not listen to Grandma."', 'dm'),
      },
    ],
  },
  look('washer', 'Sleeping washerwoman', 'yard', 5, 4, 'sleeperWasher', [
    'A washerwoman, asleep mid-wring, a shirt still twisted in her hands.',
  ]),
  look('dog', 'Sleeping dog', 'yard', 10, 8, 'dog', [
    'A big brown dog, asleep and twitching. Chasing something in its dreams.',
    {
      line: 'You scratch behind its ears. Its back leg thumps. The whole real table melts.',
      reward: (g) => g.calmTable(2),
    },
  ], 'Scratch its ears'),
  look('coop', 'Chicken coop', 'yard', 16, 8, 'coop', [
    'A chicken coop. The chickens are asleep in a fluffy heap.',
    ['priya', 'I steal an egg.'],
    'Marcus: "There are no eggs. The chickens are asleep. That\'s not how eggs work." Priya: "That\'s exactly how eggs work."',
  ]),
  look('outhouse', 'Outhouse', 'yard', 16, 5, 'outhouse', [
    'An outhouse with a moon cut in the door.',
    'You knock. Someone inside snores. You back away slowly.',
  ]),


  // ── Bell Tower, base: the stair door is silked shut ───────
  {
    id: 'stairDoor',
    name: 'Stairs up',
    area: 'tower',
    x: 8,
    y: 0,
    sprite: 'webbedStairs',
    blurb: 'Stairs winding up the tower, sealed off with thick, glittering moth silk.',
    visible: (g) => !g.flag('webCleared'),
    actions: [
      {
        id: 'burn',
        label: 'Burn the silk away',
        minutes: 5,
        when: (g) => g.flag('lantern') || g.flag('coal') || g.flag('candle'),
        run: (g) => {
          g.say('You hold the flame to the silk. It shrivels away with a hiss and a smell like burnt sugar.', 'dm');
          g.setFlag('webCleared');
        },
      },
      {
        id: 'hack',
        label: 'Hack through the silk',
        minutes: 15,
        check: 'web',
        when: (g) => !g.flag('tangled'),
        run: (g, outcome) => {
          if (outcome === 'through') {
            g.say('You saw and hack and finally tear a hole big enough to squeeze through.', 'dm');
            g.setFlag('webCleared');
          } else {
            g.say('The silk wraps round your arms and won\'t let go. Grukk has to cut you loose. You\'re not doing that again tonight.', 'dm');
            g.say('It\'s like a really sticky hug.', 'dan');
            g.setFlag('tangled');
          }
        },
      },
      {
        id: 'poke',
        label: 'Poke the silk',
        minutes: 3,
        look: true,
        run: (g) => g.say('It\'s tough as rope and sticky as honey. Fire would do it. Or a lot of patience and a knife.', 'dm'),
      },
    ],
  },
  {
    id: 'stairsUp',
    name: 'Stairs up',
    area: 'tower',
    x: 8,
    y: 0,
    sprite: 'stairs',
    blurb: 'Stairs winding up the tower, a few singed threads of silk still clinging on.',
    visible: (g) => g.flag('webCleared'),
    actions: [{ id: 'up', label: 'Climb the stairs', minutes: 5, run: (g) => g.goTo('stairs', 8, 9) }],
  },

  // ── Bell Tower, winding stair: the rotted landing ────────
  exit('stairsDown', 'Stairs down', 'stairs', 8, 10, 'stairs',
    'Stairs back down to the base of the tower.', 'Go back down', 'tower', 8, 1),
  exit('stairsToBelfry', 'Stairs to the belfry', 'stairs', 8, 0, 'stairs',
    'The last flight up to the belfry. Something up there is breathing.', 'Climb to the belfry', 'belfry', 8, 9),
  {
    id: 'gap',
    name: 'Rotten landing',
    area: 'stairs',
    x: 8,
    y: 4,
    sprite: 'pit',
    blurb: 'A whole landing has rotted away. It\'s a long way down.',
    actions: [
      {
        id: 'lay',
        label: 'Lay the plank across',
        minutes: 5,
        when: (g) => g.flag('plank') && !g.flag('gapBridged'),
        run: (g) => {
          g.say('You lay the plank across the gap. It bends. It holds. Mostly.', 'dm');
          g.setFlag('gapBridged');
        },
      },
      {
        id: 'cross',
        label: 'Cross the plank',
        minutes: 3,
        when: (g) => g.flag('gapBridged'),
        run: (g) => {
          g.say('You edge across the plank, arms out. It bends. You don\'t look down.', 'dm');
          if (g.flag('aboveGap')) {
            g.clearFlag('aboveGap');
            g.goTo('stairs', 8, 5);
          } else {
            g.setFlag('aboveGap');
            g.goTo('stairs', 8, 3);
          }
        },
      },
      {
        id: 'jump',
        label: 'Jump the gap',
        minutes: 5,
        check: 'jump',
        when: (g) => !g.flag('gapBridged') && !g.flag('fellOnce') && !g.flag('aboveGap'),
        run: (g, outcome) => {
          if (outcome === 'across') {
            g.say('You take a run up and leap. You land, wobble, and grab the rail. Made it.', 'dm');
            g.setFlag('aboveGap');
            g.goTo('stairs', 8, 3);
          } else {
            g.say('You jump. You do not make it. You land in a heap at the bottom of the tower, bruised and very dusty.', 'dm');
            g.say('Marcus: "You take… let\'s say a lot of damage. You\'re fine. Ish."', 'dm');
            g.setFlag('fellOnce');
            g.goTo('tower', 8, 2);
          }
        },
      },
    ],
  },
  look('gears', 'Clockwork', 'stairs', 6, 7, 'gears', [
    'The works of the town clock: great brass gears, jammed solid with moth silk.',
    'That\'s why the clock stopped at 11:52. The moth webbed it the moment it landed.',
    ['jo', 'Can we fix it after? I want to fix it after.'],
  ]),
  look('gears2', 'Clockwork', 'stairs', 11, 8, 'gears', [
    'More gears, ticking very faintly, as if they\'re trying.',
  ]),

  // ── Belfry: back down ────────────────────────────────────
  exit('belfryDown', 'Stairs down', 'belfry', 8, 10, 'stairs',
    'Stairs back down to the winding stair.', 'Go back down', 'stairs', 8, 2),

  // ── Market Street ────────────────────────────────────────
  ...roadExit('marketToSquareW', 'Alley to the square', 'market', [[4, 0], [5, 0]], 'Up',
    'An alley north, up to the town square.', 'Go up to the square', 'square', 4, 9),
  ...roadExit('marketToSquareE', 'Alley to the square', 'market', [[14, 0], [15, 0]], 'Up',
    'An alley north, up to the town square.', 'Go up to the square', 'square', 14, 9),
  ...roadExit('marketToLane', 'Washing Lane', 'market', [[17, 5], [17, 6]], 'Right',
    'The street east to Washing Lane. Laundry lines and clucking.', 'Walk to Washing Lane', 'yard', 1, 5),
  ...roadExit('marketToGate', 'Back to the town gate', 'market', [[0, 5], [0, 6]], 'Left',
    'The street back west to the town gate.', 'Walk back to the gate', 'gate', 16, 5),
  exit('smithyDoor', 'The Smithy', 'market', 2, 2, 'door',
    'The smithy. A thin trail of smoke still curls from the chimney.',
    'Go into the smithy', 'smithy', 8, 7),
  exit('apothecaryDoor', 'The Apothecary', 'market', 10, 2, 'door',
    'The apothecary, with a pestle-and-mortar sign. The door is unlocked.',
    'Go into the apothecary', 'apothecary', 8, 7),
  look('alleyCat', 'Alley cat', 'market', 6, 8, 'cat', [
    'A scruffy cat asleep on a crate at the end of the alley.',
  ]),
  look('lockedHouse', 'Locked house', 'market', 16, 2, 'door', [
    'A narrow house. The door is locked.',
    'You knock. From inside: loud, contented snoring.',
  ], 'Knock'),
  look('fountain', 'Fountain', 'market', 8, 5, 'fountain', [
    'A little fountain. The water is still running, the only thing in town that is.',
    { line: 'You splash your face. Bracing! Somehow everyone at the real table perks up too.', reward: (g) => g.boostEnergy(4) },
  ]),
  look('merchant1', 'Sleeping merchant', 'market', 4, 6, 'sleeperMerchant', [
    'A merchant asleep on her own stall, using a cabbage as a pillow.',
  ]),
  look('merchant2', 'Sleeping merchant', 'market', 13, 4, 'sleeperMerchant', [
    'A cloth merchant, asleep sitting up, still holding a measuring tape.',
    ['priya', 'I steal the measuring tape.'],
  ]),
  look('marketLamp', 'Street lamp', 'market', 6, 3, 'lamp', LAMP_LINES),

  // ── The Smithy ───────────────────────────────────────────
  exit('smithyExit', 'Smithy door', 'smithy', 8, 8, 'doorway',
    'The way back out to Market Street.', 'Go back outside', 'market', 2, 3),
  {
    id: 'forge',
    name: 'Forge',
    area: 'smithy',
    x: 5,
    y: 1,
    sprite: 'forge',
    blurb: 'The forge, still glowing. Nobody banked the fire before they fell asleep.',
    actions: [
      {
        id: 'coal',
        label: 'Scoop a hot coal into a tin',
        minutes: 5,
        when: (g) => !g.flag('coal'),
        run: (g) => {
          g.say('You tip a glowing coal into an old snuff tin. It smoulders happily in your pocket. Hopefully.', 'dm');
          g.setFlag('coal');
        },
      },
    ],
  },
  {
    id: 'lumber',
    name: 'Lumber pile',
    area: 'smithy',
    x: 12,
    y: 6,
    sprite: 'lumber',
    blurb: 'A stack of good, sturdy planks for the smith\'s jobs.',
    actions: [
      {
        id: 'plank',
        label: 'Take a plank',
        minutes: 5,
        steal: true,
        when: (g) => !g.flag('plank'),
        run: (g) => {
          g.say('You heave a long plank onto your shoulder. Grukk offers to carry it. You let him.', 'dm');
          g.setFlag('plank');
        },
      },
    ],
  },
  {
    id: 'toolRack',
    name: 'Tool wall',
    area: 'smithy',
    x: 9,
    y: 1,
    sprite: 'toolRack',
    blurb: 'Tongs, hammers, files, and a big pair of bolt cutters, all hanging in neat outlines.',
    actions: [
      {
        id: 'cutters',
        label: 'Take the bolt cutters',
        minutes: 3,
        steal: true,
        when: (g) => !g.flag('boltCutters'),
        run: (g) => {
          g.say('You lift the bolt cutters off their hook. They leave a perfect painted outline behind, like a crime scene.', 'dm');
          g.setFlag('boltCutters');
        },
      },
      {
        id: 'crank',
        label: 'Take the iron crank',
        minutes: 3,
        steal: true,
        when: (g) => !g.flag('crank') && !g.flag('wheelStopped'),
        run: (g) => {
          g.say('A heavy iron crank with a square end, tagged MILL — SLUICE — MENDED. You take it. It\'s mended now.', 'dm');
          g.setFlag('crank');
        },
      },
    ],
  },
  look('smith', 'Sleeping smith', 'smithy', 9, 4, 'sleeperSmith', [
    'The smith, asleep with a hammer still raised mid-swing.',
    {
      line: 'A note pokes out of his apron: "Tower job: 4th landing rotten through. Bring planks. And something for the dust."',
      reward: () => {},
    },
  ]),

  // ── The Apothecary ───────────────────────────────────────
  exit('apothecaryExit', 'Apothecary door', 'apothecary', 8, 8, 'doorway',
    'The way back out to Market Street.', 'Go back outside', 'market', 10, 3),
  {
    id: 'saltsCounter',
    name: 'Counter',
    area: 'apothecary',
    x: 10,
    y: 4,
    sprite: 'saltsCounter',
    blurb: 'A counter crowded with little bottles. One is labelled SMELLING SALTS: FOR EMERGENCIES.',
    actions: [
      {
        id: 'salts',
        label: 'Rummage for smelling salts',
        minutes: 3,
        steal: true,
        check: 'salts',
        when: (g) => !g.flag('saltsTaken'),
        run: (g, outcome) => {
          const n = outcome === 'three' ? 3 : outcome === 'two' ? 2 : 1;
          g.say(
            n === 1
              ? 'Behind all the empty bottles you find just one full one. One sniff and your eyes water. Perfect.'
              : n === 2
                ? 'You find two bottles of smelling salts. One sniff and your eyes water. Perfect.'
                : 'Jackpot: three bottles, tucked behind the cough syrup. Your eyes water just holding them.',
            'dm',
          );
          g.setFlag('saltsTaken');
          giveSalts(g, n);
        },
      },
      {
        id: 'tonic',
        label: 'Drink a wake-up tonic',
        minutes: 3,
        steal: true,
        when: (g) => !g.flag('tonic'),
        run: (g) => {
          g.say('It tastes like mint, lightning and regret. Everyone at the table suddenly wants a coffee.', 'dm');
          g.setFlag('tonic');
          g.boostEnergy(8);
        },
      },
    ],
  },
  {
    id: 'herbalBook',
    name: 'Herbal book',
    area: 'apothecary',
    x: 6,
    y: 2,
    sprite: 'lectern',
    blurb: 'A thick herbal, left open on a stand.',
    actions: [{ id: 'read', label: 'Read the herbal', minutes: 10, run: (g) => g.givePage('herbal') }],
  },
  look('apothecaryShelf', 'Jar shelf', 'apothecary', 8, 1, 'jars', [
    'Jars of dried herbs, all neatly labelled.',
    {
      line: 'One label: "JO\'S TEA: chamomile, extra honey, NOTHING WITH CAFFEINE." In Marcus\'s handwriting, again.',
      reward: (g) => g.learnTaste('jo', 'caffeine'),
    },
  ]),
  look('apothecary', 'Sleeping apothecary', 'apothecary', 6, 5, 'sleeperApothecary', [
    'The apothecary, asleep with a teacup halfway to her mouth.',
    'The tea is labelled "SLEEPYTIME BLEND". Bold choice, in hindsight.',
  ]),

  // ── Hidden spots: no highlight; page backs say where they are ──
  {
    id: 'floorboard',
    name: 'Loose floorboard',
    area: 'inn',
    x: 13,
    y: 5,
    sprite: '',
    hidden: true,
    walkable: true,
    blurb: 'One floorboard by the bar sits a little higher than the rest.',
    actions: [
      {
        id: 'pry',
        label: 'Pry up the floorboard',
        steal: true,
        minutes: 5,
        when: (g) => !g.flag('key') && !g.flag('doorOpen'),
        run: (g) => {
          g.say('Under the board, wrapped in a rag: a dusty iron key. Bram\'s spare.', 'dm');
          g.say('How did you know that was there?', 'jo');
          g.setFlag('key');
          g.achieve('secret-spot');
        },
      },
    ],
  },
  {
    id: 'looseBrick',
    name: 'Loose brick',
    area: 'cellar',
    x: 13,
    y: 4,
    sprite: '',
    hidden: true,
    blurb: 'Thirteen bricks along, one brick is a slightly different color.',
    actions: [
      {
        id: 'wiggle',
        label: 'Wiggle the loose brick',
        minutes: 5,
        run: (g) => {
          g.say('The brick slides out. Behind it: a folded, yellowed letter.', 'dm');
          g.givePage('grandmaLetter');
          g.achieve('secret-spot');
        },
      },
    ],
  },
  {
    id: 'serviceDoor',
    name: 'Service door',
    area: 'square',
    x: 17,
    y: 7,
    sprite: '',
    hidden: true,
    blurb: 'Behind the bench, the faint outline of a small door in the stone gate pillar. Cold air seeps out of it, from somewhere under the Tower Close.',
    actions: [
      {
        id: 'open',
        label: 'Squeeze through the service door',
        minutes: 10,
        run: (g) => {
          g.say('It sticks, then gives. A low tunnel runs east under the Close and comes up inside the bell tower.', 'dm');
          g.say('Marcus: "…Okay, who told you about that door."', 'dm');
          g.achieve('secret-spot');
          g.goTo('tower', 8, 9);
        },
      },
    ],
  },
  {
    id: 'altarStone',
    name: 'Altar stone',
    area: 'chapel',
    x: 7,
    y: 1,
    sprite: '',
    hidden: true,
    walkable: true,
    blurb: 'The flagstone just left of the altar rocks slightly underfoot.',
    actions: [
      {
        id: 'lift',
        label: 'Lift the stone',
        steal: true,
        minutes: 5,
        when: (g) => !g.flag('wellWater') && !g.flag('blessed'),
        run: (g) => {
          g.say('Under the stone: a stoppered flask of holy water. It works just as well as well water.', 'dm');
          g.setFlag('wellWater');
          g.achieve('secret-spot');
        },
      },
    ],
  },
  {
    id: 'niche',
    name: 'Wall niche',
    area: 'tower',
    x: 12,
    y: 6,
    sprite: '',
    hidden: true,
    blurb: 'A dark little niche in the wall, easy to miss.',
    actions: [
      {
        id: 'reach',
        label: 'Reach into the niche',
        steal: true,
        minutes: 3,
        when: (g) => !g.flag('lantern'),
        run: (g) => {
          g.say('Your fingers close on a cold metal handle: a spare lantern, still full of oil.', 'dm');
          g.setFlag('lantern');
          g.achieve('secret-spot');
        },
      },
    ],
  },
  ...DECOR,
];

/**
 * Anyone asleep can be woken with smelling salts, but only one per night: the
 * fumes only work once before the whole table complains about the smell.
 * Whoever you wake stays up for the rest of the night and tells you
 * something that helps (ask again any time).
 */
interface WakeDef {
  /** What they say when they wake up. Ask again to hear it again. */
  lines: [Speaker, string][];
  /** One-time help when they wake (a roll result, a clue, a boost). */
  reward?: (g: Ctx) => void;
  /** Their description from then on. */
  awake: string;
}
/** Little fights bolted onto existing things. */
OBJECTS.find((o) => o.id === 'rat')?.actions.push({
  id: 'fight',
  label: 'Pick a fight with the rat',
  minutes: 10,
  check: 'rats',
  when: (g) => !g.flag('ratsFought'),
  run: (g, outcome) => {
    g.setFlag('ratsFought');
    if (outcome === 'routed') {
      g.say('Grukk stomps, Nyx hisses, and the rat and about thirty of its cousins pour away into the walls.', 'dm');
      g.say('Where they were nesting: a half-chewed chapel candle. Still good. Mostly.', 'dm');
      g.say('VICTORY. Over rats. I\'ll take it.', 'dan');
      g.boostEnergy(5);
      g.setFlag('candle');
      fightWon(g);
    } else {
      g.say('The rat squeaks once. Thirty more rats answer. You spend ten very long minutes standing on a crate.', 'dm');
      g.boostEnergy(-5);
    }
  },
});
OBJECTS.find((o) => o.id === 'scarecrow')?.actions.push({
  id: 'fight',
  label: 'Fight the scarecrow',
  minutes: 10,
  check: 'scarecrow',
  when: (g) => !g.flag('scarecrowFought'),
  run: (g, outcome) => {
    g.setFlag('scarecrowFought');
    g.say('Marcus sighs the sigh of a man who has lost. "Fine. FINE. The scarecrow… comes alive. Roll."', 'dm');
    if (outcome === 'won') {
      g.say('Grukk headbutts the scarecrow. Its turnip head sails over the hedge. The crows applaud.', 'dm');
      g.say('Best. Session. Ever.', 'dan');
      g.boostEnergy(6);
      fightWon(g);
    } else {
      g.say('Against all odds and the laws of straw, the scarecrow wins. Grukk is lying in the field. The scarecrow has not moved.', 'dm');
      g.say("I'm putting this in the group chat.", 'priya');
      g.boostEnergy(-3);
      g.calmTable(2);
    }
  },
});

OBJECTS.find((o) => o.id === 'breadRack')?.actions.push({
  id: 'loaf',
  label: 'Take a loaf',
  minutes: 2,
  steal: true,
  when: (g) => !g.flag('bread'),
  run: (g) => {
    g.say('You tuck a warm loaf under your arm. Grukk looks at it the way other people look at sunsets.', 'dm');
    g.setFlag('bread');
  },
});
OBJECTS.find((o) => o.id === 'swarm')?.actions.unshift({
  id: 'goose',
  label: 'Set the goose on them',
  minutes: 3,
  when: (g) => g.flag('gooseFriend'),
  run: (g) => {
    g.say('Your goose launches itself into the swarm, honking like a war horn. Moths everywhere. Then no moths anywhere.', 'dm');
    g.say("BEST. PARTY MEMBER.", 'dan');
    g.setFlag('swarmGone');
  },
});

// The first game night's cold open ends here, before a single die is rolled.
OBJECTS.find((o) => o.id === 'warden')?.actions.unshift({
  id: 'initiative',
  label: 'Roll for initiative!',
  minutes: 0,
  when: (g) => g.flag('prologue'),
  run: (g) => {
    g.say('You reach for your d20. Across the table, Dan is asleep on the couch, still holding his.', 'dm');
    g.say("I'm so sorry. I have work at seven.", 'priya');
    g.say('Same time next week?', 'jo');
    g.endSession('Dan is asleep on the couch, still holding his d20. Priya has work at seven.');
  },
});

const KEY_RACK = OBJECTS.find((o) => o.id === 'keyRack');
KEY_RACK?.actions.push({
  id: 'captainKey',
  label: 'Take the key labelled CLOSE',
  minutes: 3,
  steal: true,
  when: (g) => g.flag('recruitDown') && !g.flag('captainKey'),
  run: (g) => {
    g.say("You lift the captain's key off the hook labelled CLOSE. Big, iron, and smells faintly of moth.", 'dm');
    g.setFlag('captainKey');
  },
});

const WAKE: Record<string, WakeDef> = {
  // ── Town square
  butcherMan: {
    lines: [['dm', 'The butcher jolts awake, cleaver up. "Ham\'s not for sale! …Unless it\'s for that chest in the inn cellar. Those things go mad for ham. Or so I hear. Thirteen\'s the lucky number with \'em, my gran said."']],
    reward: (g) => g.learnRoll('chest', 13),
    awake: 'The butcher, awake and blinking, cleaver lowered. He keeps glancing at his ham like you might steal it.',
  },
  guard: {
    lines: [['dm', 'The guard snaps to attention. "Holt? At the town gate? Tell him a good enough story and he folds. Thirteen or better and he\'s putty." He salutes nobody in particular.']],
    reward: (g) => g.learnRoll('bluff', 13),
    awake: 'The guard, awake and very carefully standing to attention, pretending he was never asleep.',
  },
  dozeGuardN: {
    lines: [['dm', '"Wha— I\'m UP. Sir." He squints. "Oh, you\'re not the captain. The captain\'s key opens the Close. Hangs on the rack in the guardhouse. Mind young Hob in there, he sleepwalks. With a SWORD."']],
    awake: 'The gate guard, awake and leaning on his spear, keeping a sleepy eye on the Close gate.',
  },
  dozeGuardS: {
    lines: [['dm', 'He jerks awake. "The tower? East window\'s latch is broken. Hendricks climbed it once on a bet. Took him twelve tries. Well, needed a twelve."']],
    reward: (g) => g.learnRoll('climb', 12),
    awake: 'The other gate guard, awake now, rubbing a helmet-shaped dent out of his cheek.',
  },
  baker: {
    lines: [['dm', 'The baker wakes, presses a warm roll into your hand and says, very seriously: "Bread fixes everything. Even geese. ESPECIALLY geese. Take a loaf from my racks if you\'re going near the mill."'], ['dan', 'I eat the roll. In character AND out of character.']],
    reward: (g) => g.boostEnergy(6),
    awake: 'The baker, awake, still holding her tray of somehow-warm bread, looking pleased with herself.',
  },
  lamplighter: {
    lines: [['dm', 'The lamplighter blinks at his dead taper. "Need a light? Bram keeps a lantern behind the bar at the Lantern. And there\'s a spare in the wall niche at the bottom of the bell tower, if you can get in."']],
    awake: 'The lamplighter, awake, relighting his taper and squinting at the dark lamps.',
  },
  // ── Hall Street, the hall, the pond
  crier: {
    lines: [['dm', 'The crier leaps up. "HEAR YE! THE CLOSE IS SEALED! THE CAPTAIN HAS THE KEY! THE SMITH HAS CUTTERS! A STEADY HAND MAY PICK THE LOCK, TEN OR BETTER!"']],
    reward: (g) => g.learnRoll('padlock', 10),
    awake: 'The town crier, wide awake, bell in hand, clearly dying to announce something else.',
  },
  mayor: {
    lines: [['dm', 'The mayor wakes mid-signature. "The bell must be blessed before it\'s rung, or it cracks and dooms us all. Sister Wren can do it with water from the town well. Or pray like you mean it: fourteen or better."']],
    reward: (g) => g.learnRoll('pray', 14),
    awake: 'The mayor, awake, sorting the paperwork into slightly smaller drifts.',
  },
  fisher: {
    lines: [['dm', 'The fisherman blinks at you. "Biggest one I ever saw? Up in the bell tower. It\'s scared of fire, that one. Saw it flinch from the forge glow once." He offers you a sip from his flask.'], ['jo', 'I take a polite sip.']],
    reward: (g) => g.boostEnergy(5),
    awake: 'The fisherman, awake, reeling in his line very slowly. Nothing on it but weed.',
  },
  // ── The bakery, guardhouse, shops
  apprentice: {
    lines: [['dm', 'The apprentice lifts her face out of the dough. "Am I fired?" No. "Oh good. Hey, if you\'re going up the tower, the silk burns. Chapel candles never go out, Sister Wren won\'t miss one."'], ['jo', 'That\'s the most relatable thing that\'s happened all night.']],
    reward: (g) => g.calmTable(2),
    awake: 'The apprentice, awake and doughy-faced, kneading as if nothing happened.',
  },
  captain: {
    lines: [['dm', 'The captain grabs your wrist. "The thing in the belfry. It hates light. Bring a lantern and it runs. Six or better, even with shaking hands."']],
    reward: (g) => g.learnRoll('wardenLantern', 6),
    awake: 'The guard captain, awake at his desk, writing a very angry report about all this.',
  },
  smith: {
    lines: [['dm', 'The smith\'s hammer comes down on nothing. "Cellar door at the Lantern? Cheap hinges. Hit it hard enough, seventeen or so, and it\'ll go. And take a plank, the tower\'s fourth landing is rotten through."']],
    reward: (g) => g.learnRoll('forceDoor', 17),
    awake: 'The smith, awake, finishing the swing he started before everyone fell asleep.',
  },
  apothecary: {
    lines: [['dm', 'The apothecary sniffs, wakes, and glares at the bottle in your hand. "Those are MINE. Fine. Keep them. There are more behind the cough syrup if you really dig. You\'ll want them up in that dusty belfry."']],
    reward: (g) => g.learnRoll('salts', 17),
    awake: 'The apothecary, awake, finishing her tea and keeping an eye on her shelves.',
  },
  merchant1: {
    lines: [['dm', 'The merchant lifts her head off the cabbage. "Old Moss at the inn? Cheats on anything under ten. Beat that and he pays up, and he always has something good to pay with."']],
    reward: (g) => g.learnRoll('dice', 10),
    awake: 'The merchant, awake, inspecting her cabbage pillow for damage.',
  },
  merchant2: {
    lines: [['dm', 'The cloth merchant wakes, measures you, says "medium," then lowers his voice. "That Vex fellow\'s been buying up anything to do with the bell. Says he\'s got a buyer up in the tower. Don\'t sell to him."'], ['priya', 'I\'m stealing the tape now. Final answer.']],
    awake: 'The cloth merchant, awake, measuring everything in reach out of sheer habit.',
  },
  // ── The roads and lanes
  shepherd: {
    lines: [['dm', 'The shepherd squints at you. "Gaps? Sheep jump gaps all the time. It\'s about commitment. Ten or better. Or carry a plank, there\'s one on that broken cart."']],
    reward: (g) => g.learnRoll('jump', 10),
    awake: 'The shepherd, awake, counting his sheep. He keeps losing count and starting again.',
  },
  washer: {
    lines: [['dm', 'The washerwoman wakes and keeps wringing. "Cobwebs? Moth silk? Cut, don\'t pull, and you\'ll want a thirteen. Pull and you\'re wearing them. Or just burn the lot."']],
    reward: (g) => g.learnRoll('web', 13),
    awake: 'The washerwoman, awake, wringing the same shirt with renewed energy.',
  },
  ringer: {
    lines: [['dm', 'The bell-ringer sits bolt upright. "The big one flinches when the bell rings. Even unblessed. Fight it straight and you\'ll need a sixteen. Bring light and it\'s easy."']],
    reward: (g) => g.learnRoll('warden', 16),
    awake: 'The old bell-ringer, awake, staring up at his tower with his arms crossed.',
  },
  // ── Animals (they can't talk, but they can point)
  cat: {
    lines: [['dm', 'The cat opens one eye, judges you completely, then hops down and sits by the fireplace, staring very pointedly at the ashes.'], ['jo', 'Is the cat… helping?']],
    reward: (g) => g.setFlag('heardAshes'),
    awake: 'The inn cat, awake, sitting by the fireplace and staring at the ashes like they owe it money.',
  },
  alleyCat: {
    lines: [['dm', 'The alley cat stretches, yawns, and trots over to the apothecary step, where it sits and sneezes. Very loudly. Something in there clears the head.']],
    awake: 'The alley cat, awake, washing itself on the apothecary step.',
  },
  dog: {
    lines: [['dm', 'The dog bolts awake, licks your entire face, then races off to the town square and starts scratching at the wall behind the bench. There\'s something there.'], ['dan', 'Best NPC in the game.']],
    reward: (g) => g.boostEnergy(3),
    awake: 'The big brown dog, awake and wagging, looking back toward the town square like it wants to show you something.',
  },
  horse: {
    lines: [['dm', 'The horse wakes up. It was already standing. It looks at you, then turns and stares down the road toward the broken cart on the chapel road. The cart has a good, long plank in its bed.'], ['marcus', 'I\'m not narrating anything else for the horse.']],
    awake: 'The cart horse, awake, which looks exactly the same as asleep, except it\'s judging you.',
  },
  sheep: {
    lines: [['dm', 'The sheep wakes, says "baa" with real conviction, and stares at the lych-gate into the graveyard. Something about the empty grave in there bothers it.'], ['dan', 'That\'s a full conversation. I\'m counting it.']],
    awake: 'The sheep, awake, still staring at the graveyard gate.',
  },
  coop: {
    lines: [['dm', 'The chickens wake in a flurry and peck a determined little trail all the way to the town well. Holy water starts as well water, after all.']],
    awake: 'The chickens, awake and clucking, milling around the coop door.',
  },
};

for (const o of OBJECTS) {
  const w = WAKE[o.id];
  if (!w) continue;
  o.awakeBlurb = w.awake;
  o.actions.push(
    {
      id: 'wake',
      label: 'Wake them with smelling salts',
      minutes: 3,
      talk: true,
      when: (g) => g.flag('salts') && !g.flag('wokeSomeone'),
      run: (g) => {
        useSalt(g);
        g.setFlag('wokeSomeone');
        g.setFlag(`awake:${o.id}`);
        g.achieve('rise');
        for (const [who, line] of w.lines) g.say(line, who);
        w.reward?.(g);
        if (!g.flag('salts')) g.say('That was your last bottle of smelling salts.', 'system');
      },
    },
    {
      id: 'askAgain',
      label: 'Ask them again',
      minutes: 2,
      talk: true,
      when: (g) => g.flag(`awake:${o.id}`),
      run: (g) => g.say(w.lines[0][1], w.lines[0][0]),
    },
  );
}
