/**
 * Adventure paths: the quests, their steps, and every route through each
 * step. The binder shows the routes you've taken (in any session) and "???"
 * for the ones you haven't found, so you can tell there's more to discover.
 *
 * A route is taken when the game records one of its keys:
 *   'object:action'               you did that action
 *   'object:action:outcome'       …and the roll landed on that outcome
 *   'object:action>flag'          …and it set that flag (it actually worked)
 *   'ending:id'                   you reached that ending
 *   '*:action'                    that action on anything (e.g. '*:wake')
 */
export interface RouteDef {
  /** Any of these keys counts. */
  any: string[];
  label: string;
}

export interface StepDef {
  title: string;
  /** Nice to do, but you can finish without it. */
  optional?: boolean;
  routes: RouteDef[];
}

export interface QuestDef {
  id: string;
  title: string;
  icon: string;
  blurb: string;
  /** Always listed (otherwise "???" until you find any route in it). */
  known?: boolean;
  steps: StepDef[];
}

export const QUESTS: QuestDef[] = [
  {
    id: 'bell',
    title: 'Ring the bell',
    icon: 'notifications_active',
    blurb: 'The main quest: ring the Bell of Harrowmere from the bell tower and wake the town.',
    known: true,
    steps: [
      {
        title: 'Get into the cellar',
        routes: [
          { any: ['cellarDoor:unlock'], label: 'Unlock it with the iron key from the fireplace' },
          { any: ['cellarDoor:force:burst'], label: 'Force the door' },
          { any: ['chute:squeeze:slide'], label: 'Slide down the coal chute' },
        ],
      },
      {
        title: 'Get the bell from the mimic',
        routes: [
          { any: ['chest:open:charmed'], label: 'Open the chest with an exact 13' },
          { any: ['chest:ham'], label: 'Feed it the ham' },
          { any: ['chest:sausages'], label: 'Feed it the sausages' },
          { any: ['chest:fish'], label: 'Feed it a fish' },
          { any: ['chest:openHappy:charmed'], label: 'Give it a treat, then open it' },
        ],
      },
      {
        title: 'Bless the bell',
        routes: [
          { any: ['wren:bless>blessed'], label: 'Sister Wren, with water from the town well' },
          { any: ['altar:pray:blessed'], label: 'Pray over it at the altar' },
        ],
      },
      {
        title: 'Get into the Tower Close',
        routes: [
          { any: ['closeGate:cut'], label: "Cut the chain with the smith's bolt cutters" },
          { any: ['closeGate:key'], label: "Use the captain's key" },
          { any: ['closeGate:pick:click'], label: 'Pick the padlock' },
        ],
      },
      {
        title: 'Get past the moth swarm',
        routes: [
          { any: ['swarm:light'], label: 'Wave a light at them' },
          { any: ['swarm:fight>swarmGone'], label: 'Fight them off' },
          { any: ['swarm:goose'], label: 'Set your goose on them' },
        ],
      },
      {
        title: 'Get the tower key',
        optional: true,
        routes: [
          { any: ['wren:show'], label: 'Show Sister Wren the bell' },
          { any: ['vex:confront'], label: "Wave Vex's receipt at him" },
        ],
      },
      {
        title: 'Get into the tower',
        routes: [
          { any: ['towerDoor:unlock'], label: 'Unlock the door with the bell-shaped key' },
          { any: ['towerDoor:climb:up'], label: 'Climb the wall to the east window' },
          { any: ['serviceDoor:open'], label: 'The hidden service door' },
        ],
      },
      {
        title: 'Get past the silk',
        routes: [
          { any: ['stairDoor:burn'], label: 'Burn it' },
          { any: ['stairDoor:hack:through'], label: 'Hack through it' },
          { any: ['towerDoor:climb:up'], label: 'Skip it: climb in above' },
        ],
      },
      {
        title: 'Get over the gap',
        routes: [
          { any: ['gap:lay'], label: 'Lay a plank across' },
          { any: ['gap:jump:across'], label: 'Jump it' },
          { any: ['towerDoor:climb:up'], label: 'Skip it: climb in above' },
        ],
      },
      {
        title: 'Deal with the Night Warden',
        optional: true,
        routes: [
          { any: ['warden:lanternFight:driven'], label: 'Drive it off with a lantern' },
          { any: ['warden:fight:driven'], label: 'Fight it head on' },
        ],
      },
      {
        title: 'Ring the bell',
        routes: [
          { any: ['ending:good'], label: 'Ring the blessed bell' },
        ],
      },
    ],
  },
  {
    id: 'goose',
    title: "The miller's goose",
    icon: 'egg',
    blurb: 'A goose guards the sleeping miller at the mill pond, and the miller has an almanac.',
    steps: [
      {
        title: 'Get past the goose',
        routes: [
          { any: ['goose:bread'], label: 'Throw her a loaf of bread' },
          { any: ['goose:fight:shooed'], label: 'Shoo her off' },
          { any: ['goose:fight:friend'], label: 'Win her heart' },
        ],
      },
      {
        title: "Borrow the miller's almanac",
        routes: [{ any: ['miller:almanac'], label: 'Ease it out from under his hands' }],
      },
    ],
  },
  {
    id: 'mill',
    title: 'The locked mill',
    icon: 'cottage',
    blurb: 'The mill by the pond is locked tight, and the miller sleeps like a millstone.',
    steps: [
      { title: 'Find the sluice crank', routes: [{ any: ['toolRack:crank'], label: 'Take it from the smithy, mended' }] },
      { title: 'Stop the mill wheel', routes: [{ any: ['sluice:shut'], label: 'Shut the hidden sluice gate' }] },
      { title: 'Find the spare key', routes: [{ any: ['millWheelStill:key'], label: 'Check the third paddle' }] },
      { title: 'Get into the mill', routes: [{ any: ['millDoor:unlock'], label: 'Unlock the door' }] },
      { title: 'Find something strong enough', routes: [{ any: ['revivalShelf:take'], label: "Take the Miller's Revival" }] },
      { title: 'Wake the miller', routes: [{ any: ['miller:revive'], label: 'One sniff' }] },
    ],
  },
  {
    id: 'fen',
    title: "Fen's song",
    icon: 'music_note',
    blurb: 'Fen the bard knows an old song about the inn. Getting him to sing it is another matter.',
    steps: [
      {
        title: 'Get the songsheet',
        routes: [
          { any: ['fen:sing:sings'], label: 'Ask Fen to sing' },
          { any: ['fenChapel:sorry'], label: 'Apologise to him at the chapel' },
        ],
      },
      {
        title: 'Follow the song',
        routes: [{ any: ['fireplace:ashes'], label: 'Dig through the fireplace ashes' }],
      },
    ],
  },
  {
    id: 'moss',
    title: 'Dice with Old Moss',
    icon: 'casino',
    blurb: 'Old Moss at the inn will play dice with anyone. He usually wins.',
    steps: [{ title: 'Beat Old Moss', routes: [{ any: ['moss:dice:win'], label: 'Roll better than he does' }] }],
  },
  {
    id: 'salts',
    title: 'Smelling salts',
    icon: 'science',
    blurb: 'Salts keep the belfry dust off, and wake anyone in town for a chat.',
    steps: [
      { title: 'Find the salts', routes: [{ any: ['saltsCounter:salts'], label: 'Rummage at the apothecary counter' }] },
      { title: 'Wake someone up', routes: [{ any: ['*:wake'], label: 'Uncork a bottle under their nose' }] },
    ],
  },
  {
    id: 'fights',
    title: 'Fights',
    icon: 'swords',
    blurb: 'Every fight is one roll. Win three in a night and the table will talk about it for weeks.',
    known: true,
    steps: [
      {
        title: 'Fights won',
        routes: [
          { any: ['recruit:tackle:pinned'], label: 'The sleepwalking recruit' },
          { any: ['rat:fight:routed'], label: 'The cellar rat (and friends)' },
          { any: ['scarecrow:fight:won'], label: 'The scarecrow' },
          { any: ['swarm:fight>swarmGone'], label: 'The moth swarm' },
          { any: ['goose:fight:shooed', 'goose:fight:friend'], label: 'The goose' },
          { any: ['warden:fight:driven', 'warden:lanternFight:driven'], label: 'The Night Warden' },
        ],
      },
    ],
  },
  {
    id: 'secret',
    title: "The Groundhog's Rest",
    icon: 'auto_awesome',
    blurb: 'Someone tried to ring that bell a long, long time ago.',
    steps: [
      { title: "Find G.'s d20", routes: [{ any: ['skeleton:die'], label: "Take the skeleton's d20 in the cellar" }] },
      { title: 'Find out who G. was', routes: [{ any: ['ending:good'], label: 'Wake the town; Sister Wren leaves you a note' }] },
      { title: 'Lay it to rest', routes: [{ any: ['gGrave:bury>cryptOpen'], label: "Bury it in G.'s grave" }] },
      { title: 'Into the crypt', routes: [{ any: ['crypt:enter'], label: 'Go down into the crypt' }] },
      { title: 'Let him finish', routes: [{ any: ['ending:secret'], label: 'Give G. the bell' }] },
    ],
  },
  {
    id: 'endings',
    title: 'Endings',
    icon: 'flag',
    blurb: 'Every way the campaign can end. Each one leaves you something for next time.',
    known: true,
    steps: [
      {
        title: 'Endings reached',
        routes: [
          { any: ['ending:tpk'], label: 'Total Party Kill' },
          { any: ['ending:bad'], label: 'The Long Sleep' },
          { any: ['ending:good'], label: 'Harrowmere Wakes' },
          { any: ['ending:secret'], label: "The Groundhog's Rest" },
        ],
      },
    ],
  },
];

/** The session a route was first taken in, or null if never. */
export function routeTaken(paths: Record<string, number>, route: RouteDef): number | null {
  let first: number | null = null;
  for (const key of route.any) {
    const hits = key.startsWith('*')
      ? Object.entries(paths).filter(([k]) => k.endsWith(key.slice(1))).map(([, n]) => n)
      : paths[key] !== undefined ? [paths[key]] : [];
    for (const n of hits) if (first === null || n < first) first = n;
  }
  return first;
}
