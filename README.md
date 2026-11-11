# We'll Pick This Up Next Week

A looping tabletop-RPG adventure. Your friends are tired: finish the mission
before someone falls asleep, or everyone forgets the session and starts over.
Only you (and your binder of pages) remember.

**Play it:** https://patrickeaton.github.io/well-pick-this-up-next-week/

See [docs/DESIGN.md](docs/DESIGN.md) for the design and
[docs/TESTING.md](docs/TESTING.md) for how to test the quests.

## Run it

```bash
yarn install
yarn dev
```

Then open http://localhost:5173.

## Layout

- `src/content/` — campaign data: maps, objects, actions, checks, pages, cast
- `src/game/` — rules: session state, energy, rolls, saved knowledge
- `src/scenes/` — Phaser map scene and placeholder pixel art
- `src/ui/` — DOM interface: table, actions, log, binder, roll and end screens

In dev mode, type `dev.help()` in the browser console for testing shortcuts
(jump to an area, give items, pick a roll, wipe the save).

## Publishing

Every push to `main` builds the game and publishes it to GitHub Pages
(`.github/workflows/deploy.yml`). One-time setup: in the repo's
**Settings → Pages**, set **Source** to **GitHub Actions**.

The version comes from `package.json`. The bottom of the in-game Settings
shows the version, the commit it was built from, and the build date, so you
can check you're not on an old copy.
