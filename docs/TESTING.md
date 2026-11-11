# Testing the quests

How to check the main quest, every alternate route, the endings and the side
quests, by playing or quickly from the browser console.

## Setup

```bash
yarn dev
```

Open http://localhost:5173. In dev builds the console has shortcuts:

| Command | What it does |
| --- | --- |
| `dev.help()` | List everything below |
| `dev.start()` | Start a fresh session (skips the cupboard) |
| `dev.go('pond')` | Jump to an area (counts as visiting it, so you get the intro) |
| `dev.give('towerKey', 'bell')` | Set flags for tonight |
| `dev.take('salts')` | Clear flags |
| `dev.flags()` | List tonight's flags |
| `dev.page('almanac')` / `dev.pages()` | Add one page / every page to the binder |
| `dev.roll(13)` | Answer the dice prompt with an exact number |
| `dev.energy(100)` | Refill (or drain) everyone at the table |
| `dev.time()` | Minutes since 7:00 PM |
| `dev.reset()` | Wipe the save |

Areas: `inn cellar square street pond bakery guardhouse hall road chapel
graveyard gate yard market smithy apothecary close tower stairs belfry`.

**The cold open:** a brand-new save starts with the first-game-night cold
open (the belfry at 11:52, one button, then "we'll pick this up next week").
To see it again: `dev.reset()`, then click *Start your first game night*.
`dev.start()` skips it and goes straight to a normal session.

**Tip:** to test a roll, click the action in the game, then type
`dev.roll(n)` in the console instead of clicking the die. Rolls you make this
way are recorded like real ones (they fill in the roll tables).

**Tip:** settings (gear on the title screen) has *Walk speed: instant* and
*Quick rolls*, which make playing through by hand much faster.

## Town map

```
 Graveyard ── Hall Street ── Mill Pond
     │             │
 Chapel Road ── Town Square ── Tower Close
     │             │    │            ┊ back gate (bolted on the Close side)
 Town Gate  ── Market Street ── Washing Lane
```

Doors off the square: the inn, the bakery, the guardhouse. Hall Street: the
town hall. Market Street: the smithy, the apothecary. Chapel road: the chapel.

## Main quest: the good ending, by hand

Ring the blessed Bell of Harrowmere from the belfry.

1. **Inn.** Talk to Bram ("Who are you?", then ask about the fire). Search
   the fireplace ashes for the iron key.
2. **Cellar.** Unlock the cellar door. Open the mimic chest: you need an exact
   **13**. (Or steal the butcher's ham in the square and toss it in.) Take the
   bell.
3. **Chapel road → chapel.** Talk to Sister Wren, show her the bell: you get
   the bell-shaped tower key. Fill a flask at the well in the square, then
   ask Wren to bless the bell.
4. **Smithy (Market Street).** Take a plank, a hot coal, and the bolt cutters.
5. **Apothecary.** Rummage for smelling salts (roll for 1–3 bottles).
6. **Square → Tower Close.** Cut the chain on the gate. Wave the coal at the
   moth swarm. Unlock the tower door.
7. **Tower base.** Burn the silk on the stair door. Climb.
8. **Winding stair.** Lay the plank over the gap. Go up.
9. **Belfry.** Hang the bell and ring it → *Harrowmere Wakes*.

Check along the way: the clock moves when you walk, each new area gets one
Marcus intro per session, pages land in the binder, and you can't run out of
things to do in any one area.

**Quick version:**

```js
dev.start(); dev.give('bell', 'blessed', 'towerKey', 'salts'); dev.go('belfry')
```

Then click the bell frame → ring it.

## Alternate routes, step by step

Each row should work on its own. Failed rolls close that route for the
night, never every route.

| Step | Route | Quick setup |
| --- | --- | --- |
| Into the cellar | Iron key from the ashes | `dev.go('inn')`, talk to Bram first (or have the songsheet page) |
| | Force the door (roll 17+) | `dev.go('inn')`, click the cellar door |
| | Coal chute (roll 8+) | `dev.go('square')`, the chute by the inn |
| Get the bell | Exact 13 on the chest | `dev.go('cellar')`, open the chest, `dev.roll(13)` |
| | Toss the ham | `dev.give('ham'); dev.go('cellar')` |
| | Amulet: choose 13 | Go back to sleep as your very first action in a session |
| Into the Close | Bolt cutters | `dev.go('smithy')` → tool wall, then the gate in the square |
| | Captain's key | `dev.go('guardhouse')` → tackle the recruit (8+) → key rack |
| | Pick the lock (10+; 1–9 jams it tonight) | `dev.go('square')` → the Close gate |
| Past the swarm | A light | `dev.give('lantern')` (or `coal`/`candle`); `dev.go('close')` |
| | Fight (7+ clears it) | `dev.go('close')`, fight, `dev.roll(10)` |
| | Your goose | `dev.give('gooseFriend'); dev.go('close')` |
| Into the tower | Wren's key | Show Wren the bell |
| | Vex's key | Needs Vex's receipt (from the bad ending) |
| | Climb the wall (12+) | At the tower door; lands you above the silk and the gap |
| | Hidden service door | Square, behind the bench (east side, row 7). Not highlighted. |
| Past the silk | Burn it | `dev.give('candle'); dev.go('tower')` |
| | Hack it (13+; 1–12 tangles you for the night) | `dev.go('tower')` |
| Past the gap | Plank | `dev.give('plank'); dev.go('stairs')` |
| | Jump (10+; fail drops you to the base) | `dev.go('stairs')` |
| Belfry dust | Salts | Without salts, every action up there drains everyone by 4 |
| Bless the bell | Wren + well water | `dev.give('bell', 'wellWater'); dev.go('chapel')` |
| | Pray at the altar (14+) | `dev.give('bell'); dev.go('chapel')` |
| The Warden | Lantern (6+) / fight (16+) / tiptoe | `dev.give('bell'); dev.go('belfry')` |

## Endings

| Ending | How to trigger it | Quick setup |
| --- | --- | --- |
| Total Party Kill | Ring an unblessed bell with the Warden there, or lose the fight | `dev.give('bell'); dev.go('belfry')` |
| The Long Sleep | Sell the bell to Vex in the square | `dev.give('bell'); dev.go('square')` |
| Harrowmere Wakes | Ring the blessed bell | See the quick version above |
| The Groundhog's Rest | Have Wren's note (good ending page), get G.'s d20 from the skeleton in the cellar, bury it in G.'s grave (graveyard), go into the crypt, give G. the bell | `dev.page('wrenNote')`, then play it through |

Each ending should show its story, give its page, unlock its achievement and
offer "play again" (keeping everything) or wiping the save.

## Side quests

**The goose (Mill Pond).** The goose guards the sleeping miller, who has the
Miller's Almanac page.
- Fight it: 1–11 it chases you back to Hall Street (−6 energy, try again),
  12–19 it wanders off, a natural 20 makes it *your* goose (Honk
  achievement; it can clear the moth swarm for you).
- Or take a loaf from the bakery's bread racks and throw it the bread.
- Then borrow the almanac from the miller → page. Flip it: the back fills in
  the goose and swarm roll tables.
- Hints: the Hall Street notice board, or wake the miller with salts.

**Smelling salts.** Roll at the apothecary counter (1–7 one bottle, 8–16
two, 17–20 three). Any one sleeper per night can be woken, and every sleeper
in town has a tip. Check that their Zs stop, their sprite opens its eyes,
their description changes, and *Ask them again* repeats the tip. Using your
last bottle means the belfry dust gets you. Quick setup:
`dev.give('salts'); dev.go('square')`, then wake a dozing guard.

**Phones and tablets.** In the browser pane's viewport menu (or your
browser's device mode): a phone upright should show the rotate screen; a
phone sideways should fit the map and table with no scrolling; a tablet
upright puts the table under the map.

**The locked mill (Mill Pond).** Flip the Miller's Almanac for the clue.
Smithy tool wall → *Take the iron crank*. Pond: the hidden sluice is in the
water just left of the mill wheel → *Fit the crank and shut the sluice* (the
wheel stops). Mill wheel → *Check the third paddle* (key). Mill door →
*Unlock the mill*. Shelf → *Take the Miller's Revival*. Back at the pond
(goose gone) → *Wake him with the Miller's Revival*: the page *The Miller's
Directions* and the Rise and Grind achievement. Quick setup:
`dev.give('gooseGone', 'crank'); dev.go('pond')`. Check ordinary salts only
make him snore louder.

**Fights.** Each is one d20 roll. Win three in one night for *Brawler*.
- Sleepwalking recruit (guardhouse), cellar rat (wins drop a candle),
  scarecrow (chapel road), moth swarm (Tower Close), goose (Mill Pond).

**Fen and the songsheet (inn).** Ask Fen to sing (roll 14+), or apologise
after he storms off. You get the songsheet page, which points at the ashes.

**Dice with Old Moss (inn).** Roll 10+ to win.

**The back gate.** From inside the Tower Close, unbolt the gate in the south
hedge: it opens a shortcut to Washing Lane for the rest of the night. From
Washing Lane it's bolted until then.

**Hidden spots.** Some clickable things have no highlight. Page backs say
where. Clue tiles look slightly different (a proud floorboard, a loose
stone).

## Music and sound

Click anywhere first (browsers block sound until you do). The track should
change with the area (`dev.audio()` shows what's playing): title theme on the
title/cupboard/ending screens, jig in the inn and shops, town tune outside,
organ in the chapel and graveyard, drone in the cellar, tense tune from the
Tower Close up, boss theme in the belfry. Dice rattle and land; new pages and
achievements chime. Settings → Sound: the sliders change the volume as you
drag, and Mute silences everything. All three are remembered.

## Adventure paths

Binder → Adventure paths. After taking a route (any way, any session) its
row shows a tick and "session N". Check: routes you haven't found say "???";
steps past the next one are "???"; side quests are "???" until you've done
any part of them; an action that didn't work (asking Wren to bless the bell
without well water) doesn't tick anything. `dev.reset()` clears it.

## Between sessions

- **End session** (header, moon icon, only while playing) asks to confirm,
  then ends the night like any other: "We'll pick this up next week!", the
  weeks-later fade, and the next session starts at the inn. Nothing from
  that night counts; the binder keeps everything.

- Start a session, do one thing, then let everyone fall asleep
  (`dev.energy(1)` and take any action). Next session: flags are gone, but
  pages, roll results, friendships, achievements and discovered areas stay.
- The amulet: make your very first action of a session going back to sleep.
- Friendship: bring a snack someone loves, play to their style (Priya loves
  stealing and rolling, Dan hates sightseeing). Hearts show in the binder.

## Timing

- Walking: 1 minute per 5 tiles.
- Moving to the next area (along a road or alley, or through a door): 5
  minutes.
- Looks cost a little time, and too many in one night annoy the table.
- A typical night should end around 10:30–11:30 PM unless you bring
  caffeine. If it feels too long or too short, the knobs are
  `WALK_TILES_PER_MINUTE` in `src/game/controller.ts`, the `minutes` on
  actions in `src/content/campaign.ts`, and each friend's `drain` in
  `src/content/cast.ts`.
