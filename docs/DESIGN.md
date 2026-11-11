# Design Doc — "We'll Pick This Up Next Week"

_Working title. Planning draft, 2026-11-10._

## Pitch

You're playing a tabletop fantasy campaign with your friends. Everyone is tired.
If the group doesn't finish the mission before someone falls asleep, the session
doesn't count. Everyone forgets it, and next week (or whenever) you start again
from page one.

Only **you** remember. Your knowledge, and the adventure pages you've collected,
are the only things that carry over between sessions.

## Pillars

1. **Knowledge is progression.** Like Tunic, most unlocks come from knowing
   something, not from owning something. A skilled player with the right
   knowledge can finish in one session.
2. **The real world feeds the fantasy.** Snacks, bribes and handouts at the
   table change what's possible in the campaign.
3. **Dice are knowable.** Roll tables start hidden and fill in as you play. Old
   rolls can be reused once you have the Groundhog item.
4. **Cozy, not stressful.** Time passes per action, not in real time. Failing is
   funny ("we'll pick this up next week!"), not punishing.

## Core loop

```
 ┌─ Pre-session ───────────────────────────────┐
 │ Pick a handful of items to bring (snacks,   │
 │ energy drinks, DM bribes). Review pages.    │
 └──────────────────────┬──────────────────────┘
                        ▼
 ┌─ Game night (7pm → ~11pm) ──────────────────┐
 │ Explore, talk, roll. Each action costs      │
 │ minutes and drains energy. Hand out snacks  │
 │ to keep the table awake.                    │
 └──────────┬───────────────────────┬──────────┘
            ▼                       ▼
   Mission complete          Someone falls asleep
   → ending                  → "We'll pick this up next week!"
                             → fade: "4 weeks later…"
                             → reset (keep knowledge + pages)
```

## What persists

| Persists across sessions                  | Resets every session              |
| ----------------------------------------- | --------------------------------- |
| Player knowledge (in your head)           | Items you brought                 |
| Adventure pages / handouts collected      | Friends' energy                   |
| Discovered roll-table ranges (see below)  | World state, flags, NPC moods     |
| Roll history (usable via Groundhog item)  | The Groundhog item itself         |

## Systems

### Time and energy

- The session runs on an in-game clock (7pm to roughly 11pm). Every action
  (moving to an area, talking, rolling, searching) costs minutes.
- Each person at the table has their own **energy meter**. The session ends
  when the **first** person falls asleep.
- The DM is at the table too. When the DM gets tired, they start skipping or
  speeding through scenes ("you get to the castle, it's fine, roll initiative").
  That costs content, not the session.
- **Energy drinks** give a big boost now and a crash later in the night.
- Each friend has a **favorite snack** that restores much more energy for them.

### Walking takes time

Walking costs a minute for every five tiles, and moving to the next area
(along a road or alley, or through a door) takes 5 minutes. A town this big
means you can't do everything in one night.

### Looking around and table patience

- **Clicking anything is free.** It opens a dialog with the object's
  description and its actions.
- **Looks cost time.** Taking a closer look, inspecting or petting the cat
  costs about 3 minutes and counts as an action (so it can cost you the
  Groundhog amulet if you do it first).
- **The table loses patience.** Each look in a session uses up some patience.
  The first 4 are fine. After that friends start grumbling, and every extra
  look drains everyone's energy (1 more each time, up to 5 per look).
- **Session notes** keep everything said this session with timestamps. They're
  thrown away at the end of the session. Only the binder carries over.

### Page backs and hidden spots

- **Every page has a back.** Click a page in the binder to flip it. Backs are
  the "DM eyes only" side: roll tables, margin notes and secrets. Pages whose
  back you haven't read show a "↻ flip me" tag.
- **Roll tables come from the backs.** A page only fills in a roll table once
  you've flipped it and read it. Flips are remembered forever.
- **Hidden spots** are clickable but never highlighted (no hover, no hand
  cursor). A page back tells you where they are, and the floor or wall there
  has a faint tell:
  - Inn: loose floorboard by the bar → Bram's spare cellar key.
  - Cellar: the 13th brick → Grandma Bram's letter (a new page).
  - Town square: service door behind the bench → into the tower.
  - Chapel: the stone left of the altar → holy water (counts for blessing).
  - Tower: wall niche → a spare lantern.
- Floors and walls have a few variants (knots, cracks, moss, weeds, flowers,
  windows) scattered around, so the tells blend in.

### Snacks, drinks and tastes (no money)

- **A different cupboard each week.** About 20 items in the pool; each week
  the cupboard offers 3, always at least one drink and one food, each a
  different type. You pick one to bring. After a break of 8+ weeks, homemade
  things have gone off and something else takes their place.
- **Items have a type, not an owner.** Salty, sweet, sour, hearty, healthy,
  soft drink, caffeine, alcohol. Cards show the type and what it does, never
  who likes it.
- **Everything goes on the table.** Each item reaches the whole group:
  people who love it get double energy, people who don't mind it get the
  normal amount, and people who don't like it (or won't have it) skip it.
  Every pick is a group decision, and each one shows you everyone's reaction.
- **Snack breaks happen on their own.** The first time anyone drops below 60
  energy, what you brought comes out. Any further items (see friendship) come
  out the next time someone flags, at least 30 minutes later.
- **Effects:**
  - Caffeine: big boost, crash an hour later.
  - Hearty food: steady boost, food coma an hour later.
  - Sugar (candy, soda): people get chatty.
  - Alcohol: restores table patience (forgives a few looks), and makes
    whoever drinks a bit sleepier for the rest of the night.
  - Homemade: bribes the DM for a page.
- **Hidden tastes.** Each friend loves, doesn't mind, dislikes, or won't have
  each type. You learn them by watching reactions, and they're recorded in the
  binder for good. Old friends start partly known (Marcus fully, Priya not at
  all).
- **Profiles.** The ⓘ next to each friend shows who they are, how you know
  them, and what you know about their tastes. Item cards show the expected
  energy change for each friend you know about, and "?" for the rest.

### Friendship (permanent)

- Each friend has 0–5 hearts that carry over between sessions. You start at
  how well you know them: Marcus ♥♥♥, Jo ♥♥, Dan ♥, Priya none.
- Changes add up during the night and count when it ends, win or lose.
- **Hearts are for keeps.** A bad night can set back your progress toward
  the next heart, but never takes away a heart you've already earned (and
  its perks stay too).
- **Earning it:** +3 when you bring something they love (−2 if they dislike
  it), −1 for each look once the table is restless, +5 for finishing the
  mission. A good night is worth about one heart.
- **How they like to play.** Each friend loves or hates some play styles:
  role-playing (talking to people), exploring (closer looks, new places),
  stealing, rolling dice, finding lore and pages.
  - Marcus loves role-playing and lore, hates you stealing from his NPCs.
  - Priya loves stealing and dice, gets bored by talking.
  - Dan loves dice and NPC voices, hates sightseeing.
  - Jo loves role-playing and exploring, wants you to give things back.
  Playing their way: +2 friendship and a little energy; against it: −1 and a
  little energy lost (each up to 3 times a night). They react out loud the
  first time each night, and you learn their styles like their tastes.
- **Benefits:**
  - Each heart: tires 4% slower.
  - ♥♥ and ♥♥♥♥: they let a taste slip during the week (added to the binder).
  - ♥♥♥: once a night they rally instead of falling asleep.
  - ♥♥♥♥♥: they bring a snack of their own (usually one they love).

### Closer looks that pay off

Most "Take a closer look" lines are flavor, but some give a one-time reward
(once per night) with a 💡 line:
- **A roll outcome**, recorded as if you'd seen it (so the amulet can take
  it): the skeleton's 12 on the chest, Moss's tallies, the guard's note about
  the tower window, Old Tom's grave.
- **A taste**: the bakery's order board knows Priya loves sour candy.
- **Energy**: the bakery oven's loaf, the jerky behind the wardrobe sock.
- **Patience**: petting the cat (everyone goes "awww").
- **Hints** toward hidden spots and routes (the town map, the key rack, the
  clock plaque).

### Repeating yourself

Doing the exact same thing twice in a row, when it would give the exact same
answer, gets a canned reply instead: "C'mon, dude. I literally just told you
that." It escalates if you keep going. It still costs the time.

### Adventure pages (the Tunic layer)

- Pages represent **handouts from the DM** or pages from the module book.
  They are designed to look like a real printed adventure: maps, roll tables,
  margin notes, lore.
- **Each page has more on it than you expected.** A handout about the tavern
  also hints at the cellar door you walked past three sessions ago.
- Pages can be **damaged**: torn, coffee-stained, or partly scribbled over.
  Sometimes you need a second copy or another page to fill in the gap.
- Ways to get pages:
  - Found in the fantasy world ("you find a torn parchment") → it becomes a
    real handout in your binder.
  - Earned through conversations or quests.
  - Bribing the DM.
- Pages go into a **binder** you can browse between and during sessions.
  The binder has tabs down the side: Pages, Friends (a tab per friend), Roll
  tables (a tab per location; places you haven't been and rolls you
  haven't tried show as ???), Session notes, and Achievements.

### Adventure paths

A binder tab that maps every quest (the main quest, the side quests, fights,
the secret, the endings) as a column of steps, each with every route
through it. Routes you've taken show a tick and the session you first took
them in; the rest show "???", so you can see a step has more ways through
without being told what they are. Steps past where you've got are "???"
too, and side quests stay "???" until you stumble into them. It all
persists, like the rest of the binder.

Under the hood the game records every action you finish, its roll outcome,
and any flags it set (so "ask Wren to bless the bell" only counts if it
actually blessed it). The quests and their routes live in
`src/content/quests.ts`.

### Rolls and roll tables

- **d20 only.** No other dice in the game.
- **One roll decides an encounter.** No turn-by-turn combat. A fight, a
  negotiation or a lock is a single roll checked against that encounter's table.
  What you learn, bring or do before the roll (items, conversations, pages)
  changes your options or the table, not the number of rolls.
- Checks use a d20 against a **result table** with ranges, such as
  `1–5: bridge collapses · 6–15: troll refuses · 16–20: troll lets you pass`.
- Tables start **hidden**. Landing on a result reveals **that result's whole
  range**; results you've never landed on stay `?`:

  > You rolled a 9 on the troll check and got "refused".
  > The table shows: `1–5: ?` · `6–15: refused` · `16–20: ?`

  Gaps between known results are clues: on the mimic chest, once you've been
  eaten (1–12) and seen it snap shut (14–20), a lone `?` at 13 stares back.
  Finding the page with the table printed on it reveals every result at once.
- Discovered table info persists across sessions (it's knowledge).

### The Amulet of the Groundhog

- A nod to Groundhog Day. Found by going back to sleep as your **first
  action** of the night; any other first action and it's gone for that night.
- **Unlimited:** instead of rolling, take any path you've already seen for
  that roll, from rolls in any session or a page that prints the table.
- **Once a night:** choose the exact number you roll. It counts as a real
  roll, so that outcome becomes a known path you can take on every future run.
- So the amulet turns knowledge into progress: each night you can "unlock" one
  new outcome, then reuse it forever.

### You and your party

- You play a **bard**: the talker and jack of all trades, which is why you do
  all the talking and rolling.
- Your friends' characters travel with you and follow you around the map:
  **Nyx** the rogue (Priya), **Grukk** the barbarian (Dan) and **Halden** the
  cleric (Jo). Marcus runs the game and voices every NPC.
- The sidebar and binder show each friend's real face with their character
  as a badge.

### Friends at the table

Flavor characters with a personality and a favorite snack. No skills or
mechanics beyond energy. Placeholder cast:

| Name   | Role        | Vibe                                  | Fave snack       |
| ------ | ----------- | ------------------------------------- | ---------------- |
| Marcus | DM          | Over-prepared, secretly loves bribes  | Coffee, cookies  |
| Priya  | Rogue       | Sharp, gets bored fastest             | Sour gummies     |
| Dan    | Barbarian   | Loud early, crashes hard              | Pizza rolls      |
| Jo     | Cleric      | Steady, last to fall asleep           | Sparkling water  |
| You    | (player)    | The only one who remembers            | —                |

### Session end gag

Every failed session ends the same way: someone yawns, the DM closes the book,
and says **"We'll pick this up next week!"** Fade to black, then a card:
**"_N_ weeks later…"** with _N_ random from 2 to 10. Optional extras: the gap
length could change small things (the cupboard, a friend's new haircut, a
running joke about the delay getting longer).

### The first game night (cold open)

A brand-new save skips the cupboard and opens at 11:52 PM in the belfry, four
hours into the session, with everyone nearly asleep. Marcus describes the
Night Warden waking and calls for initiative. Its only action is "Roll for
initiative!", and clicking it ends the night: Dan is asleep holding his d20,
Priya has work at seven, and it's "We'll pick this up next week!" Session 2
starts at the inn, and nobody remembers a thing. It shows the goal up front
and sets up the loop.

## Presentation and interaction

- **Any screen size.** The map keeps its shape and always fits the height of
  the screen. Landscape phones get a compact header with the table scrolling
  beside the map; portrait tablets put the table under the map. Phones held
  upright (touch screens only) see a "turn your phone sideways" screen.

- **Browser game**, **pixel-art, top-down**, built from tilemaps.
- Two layers on screen:
  - **The table** (real world): friends, energy meters, clock, items, binder.
  - **The fantasy map**: tile-based areas you move through.
- **Click to interact.** Clicking an object or NPC **adds options to the action
  list** (e.g. click the well → "look in the well", "lower the bucket").
- **Conversations unlock actions.** Talking to an NPC can add new options
  elsewhere, so solutions need several steps across areas.

## The campaign: The Long Sleep of Harrowmere

The whole town has fallen into a magical sleep. The Night Warden, a giant
moth, roosts in the bell tower. Ring the Bell of Harrowmere from the tower to
wake everyone. (It mirrors the real table: everyone is falling asleep.)

### Areas

- **The Rusty Lantern Inn**: start here. Bram, Fen, Old Moss, the cellar door,
  and a front door that's always open.
- **The Cellar**: the mimic chest holding the bell, and G.'s skeleton.
- **Town Square**: proper buildings with rooftops and fronts (the inn, the
  bakery, the town hall, the guardhouse), streets and alleys between them.
  Sleeping townsfolk, the well, Vex's stall, the butcher's ham, the coal
  chute down the inn's alley, the curfew notice, a crossroads signpost, and
  the chained gate to the Tower Close on the east side.
- **Hall Street** (north of the square): the town hall, the stopped town
  clock, a statue of Harrow the Wakeful in a nightcap, a notice board, and
  a sleeping town crier.
- **The Mill Pond** (east of Hall Street): a water mill with a turning wheel,
  ducks, a rowboat, a sleeping fisherman, and the sleeping miller guarded by
  a goose. Get past the goose (fight it, or throw it a loaf from the bakery)
  to borrow the Miller's Almanac (a page; its back has the goose and swarm
  tables). Roll a natural 20 against the goose and it joins you, and it can
  clear the moth swarm.
- **The Bakery** (off the square): a warm oven, bread racks, a board of
  standing orders in suspiciously familiar handwriting.
- **The Guardhouse** (off the square): the guard captain's logbook, the key
  rack (the captain's key to the Close, guarded by a sleepwalking recruit you
  have to tackle), a WANTED poster for Vex, and Pip, an awake prisoner who has climbed
  the tower.
- **Town Hall** (off Hall Street): the mayor, the archives, a map with red
  circles, and the town records (a page).
- **The Chapel Road** (west of the square): a dirt road out to the chapel,
  which you see from outside first. A wayside shrine, a scarecrow, a
  sleeping shepherd and his flock, a milestone.
- **The Town Gate** (south of the chapel road, along the town wall): shut and guarded by awake soldiers under
  quarantine. Sergeant Holt (talk, or bluff your way to a peek), a
  quarantine notice (page; its back has the tower-climb table).
- **Washing Lane** (east of Market Street; a back gate north into the Tower Close, bolted on the Close side): backyards, laundry, chickens, a sleeping
  dog, and Cousin Ned, the one the mimic bit.
- **The Tower Close** (east of the square, behind a chained gate): the bell
  tower seen from outside, a swarm of little moths guarding its door, the
  old bell-ringer asleep in the grass, a well and an old grave.
- **The Old Chapel**: Sister Wren, the altar, the prayer book.
- **The Graveyard** (through the lych-gate beside the chapel, off the chapel
  road): rows of old stones (with jokes on them), the crypt between two
  angel statues, awake crows, will-o'-wisps, a half-dug grave marked
  RESERVED, yew trees, and G.'s empty grave.
- **Market Street** (south of the square, two alleys down; the town gate to the west, Washing Lane to the east): closed stalls, sleeping
  merchants, a fountain.
- **The Smithy**: a glowing forge (a hot coal in a tin), a lumber pile
  (planks), a tool wall (bolt cutters), and a sleeping smith with a note about the tower.
- **The Apothecary**: smelling salts (roll for 1–3 bottles), a wake-up tonic, and the herbal (a page;
  its back has the silk and jump tables).
- **The Bell Tower**, three floors:
  - **Base**: the logbook, the hidden lantern niche, and the stairs up,
    sealed with moth silk. Burn it (lantern, chapel candle, or smithy coal)
    or hack through it (a roll; get tangled and that's it for the night).
  - **Winding stair**: the town clock's works, jammed with silk. A rotted
    landing: lay a plank (smithy lumber or the broken cart on the chapel
    road) or jump it (a roll; miss and you fall back to the base).
  - **Belfry**: the Night Warden and the bell frame. Sleepy moth dust drains
    the whole table on every action unless you carry smelling salts.
  Climbing the outside wall (a roll) lands you on the upper stair, past both
  the silk and the gap.

### No dead stops: every step has more than one route

| Step | Routes |
| --- | --- |
| Into the cellar | Iron key (fireplace ashes) · force the door (roll) · coal chute from the square (roll) |
| Get the bell | Exact 13 on the chest · amulet (choose a 13, or take the path once you've seen it) · feed it meat: the butcher's ham, sausages from Market Street, or a fish from the pond (works even after it's snapped shut) · feed it a treat (bread or a pie from the bakery, an apple from the square's fruit stall) and it's happy: opening it then needs 7–15 instead of 13 |
| Into the Tower Close | Bolt cutters (smithy) · the captain's key (guardhouse, past the recruit) · pick the padlock (roll; a snapped pick jams it for the night) |
| Past the moth swarm | Wave a light at it (lantern, coal, candle) · fight it (roll) |
| Into the tower | Wren's key (show her the bell) · Vex's key (after the bad ending) · the hidden service door · climb the wall (roll; lands above the next two) |
| Past the silk | Burn it (lantern, chapel candle, smithy coal) · hack through (roll) |
| Past the gap | Lay a plank (smithy lumber, broken cart) · jump (roll) |
| In the belfry | Smelling salts (apothecary), or put up with the sleepy dust |
| Bless the bell | Wren + well water · pray at the altar (roll) |

### Smelling salts

Rummaging the apothecary counter is a roll: 1–7 finds one bottle, 8–16 two,
17–20 three. Any one sleeper per night (people and animals) can be woken with
a bottle. Every sleeper in town can be woken (25 of them, animals
included), and each one tells you something that helps you progress: a roll
result, where to find an item, or another way past a step (the inn cat
stares at the fireplace ashes, the dog scratches at the hidden service door).
They stay awake for the rest of the night: the Zs stop, their sprite opens
its eyes, their description changes, and you can ask them again. Spending
your last bottle means the belfry dust gets you, so it's a trade-off.

### Fights

Fights are single d20 rolls like everything else. Winning hypes the real table
(a little energy); losing costs energy. Three wins in one night earns Brawler.

| Fight | Where | Win | Lose |
| --- | --- | --- | --- |
| Moth swarm | Tower Close door | Swarm gone (15+ also gives energy) | −10 energy, swarm stays |
| Sleepwalking recruit | Guardhouse key rack | Reach the captain's key | Bonked, −5 energy, try again |
| Cellar rat | The cellar | Rats flee and leave a chapel candle | 30 rats, −5 energy |
| Goose | Mill Pond | Gone (20: she's yours) | Chased back to Hall Street, −6 energy |
| Scarecrow | Chapel road | Turnip off, +6 energy | It wins. Table laughs (patience back) |

### Town layout

The outdoor areas form a grid, and every street lands you at the same spot
on the next screen (a road on rows 5–6 on one side comes out on rows 5–6 on
the other; an alley at columns 4–5 comes out at columns 4–5).

```
 Graveyard ── Hall Street ── Mill Pond
     │             │
 Chapel Road ── Town Square ── Tower Close
     │             │    │            ┊ back gate (bolted on the Close side)
 Town Gate  ── Market Street ── Washing Lane
```

The first time you walk into any area in a session, Marcus describes it.

### The locked mill (side quest)

1. The back of the Miller's Almanac says the spare key is on the mill wheel's
   third paddle, the wheel has to be stopped first, and the sluice crank is at
   the smithy being mended.
2. Take the iron crank from the smithy's tool wall.
3. Shut the hidden sluice gate (in the water beside the wheel; not
   highlighted, with a faint board showing under the surface).
4. Check the stopped wheel's third paddle: the brass mill key.
5. Unlock the mill (a new interior: millstones, the miller's desk, and a
   shelf with the Miller's Revival).
6. Ordinary smelling salts only make the miller snore louder. The Revival
   wakes him: he recognises you as the one who keeps coming back and writes
   out *The Miller's Directions*, a full walkthrough page whose back covers
   the secret ending. Secret achievement: Rise and Grind.

### Music and sound

Chiptune made live in the browser (square, pulse and triangle waves and noise
drums, no audio files), one looping track per kind of place, crossfading as
you move: a wistful title theme (title, cupboard, endings), a cozy jig (the
inn, shops and the mill), a sleepy town tune (streets, market, lanes, pond),
a slow organ piece (chapel and graveyard), a dark drone (cellar), a tense
climb (Tower Close, tower, stairs) and a boss theme (the belfry). Sound
effects for the dice, new pages and achievements. Settings: music volume,
sound-effects volume, mute. Tracks live in `src/audio/tracks.ts`.

### Roads and signs

Every road or alley that leads to another area is two tiles wide, and the
whole width is a clickable arrow through. Each crossing has a matching
boundary on both screens: iron railings and gate pillars between the square
and the Tower Close, cemetery railings between Hall Street and the graveyard,
hedges where a road leaves town, a low stone wall between the town gate and
Market Street, a picket fence into Washing Lane. Buildings along the bottom
of a screen are one row tall (except the town wall). Direction signs stand beside each
one, and the square has a crossroads signpost naming every way out.

Every street edge either leads somewhere or is closed off by buildings or
hedges, and every shop has a hanging sign showing what it is.

Failed rolls close one route for the night (the door gets guarded, the chute
can't be retried, the tower windows slam shut), never all of them.

### Endings (each counts as finishing the campaign)

| Ending | How | Leaves you |
| --- | --- | --- |
| Total Party Kill | Ring an unblessed bell with the Warden there, or lose the fight | Marcus's debrief → Bram's lantern, Warden tables |
| The Long Sleep (bad) | Sell the bell to Vex, or ring it unblessed after driving off the Warden | Vex's receipt → confront Vex for the tower key |
| Harrowmere Wakes (good) | Ring the blessed bell | Wren's note about G. → unlocks the secret |
| The Groundhog's Rest (secret) | Bury G.'s d20 in his grave (needs Wren's note), meet him in the crypt, give him the bell | The reveal: G. was Marcus's first character |

After an ending you can play again keeping everything you know, or wipe your
save.

### Achievements

30 achievements (the 4 endings plus things like the amulet, natural 20s and
1s, feeding the mimic a ham, best friends, past midnight), kept forever and
shown on a 🏆 page in the header and on the title screen.

## Tech direction (proposal)

- TypeScript + Vite, with Yarn (repo already set up for it).
- Rendering: **Phaser 3** for tilemaps, sprites and input, with a DOM overlay
  for the action list, binder and dialogue. Lighter option: plain canvas plus DOM.
- Maps built in **Tiled** and loaded as JSON.
- **Content as data**: areas, objects, actions, conversations, checks, roll
  tables and pages defined in data files, so the campaign can grow without code
  changes.
- **Persistence**: `localStorage` save with pages, discovered table ranges and
  roll history only.

## Open questions

- Amulet charges per session: 1, 3 or unlimited?
- How many item slots to bring, and is the cupboard fixed or random?
- Can you see your full roll history in the UI, or do you have to remember it?
- Does the DM getting tired skip specific scenes (designed) or random ones?
- How does a session that *succeeds* end: one finale, or multiple endings?
- Art: placeholder tiles first, or settle on a palette and tile size (16×16?)
  up front?
