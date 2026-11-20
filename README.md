# gta6-cover-art-01-entry

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/gugugagagugugaga313-boop/gta6-cover-art-01-entry/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/gugugagagugugaga313-boop/gta6-cover-art-01-entry/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

Vice City Cover Studio turns any photo and caption into GTA-style multi-panel cover art, offline in the browser, exported as PNG. Built by an AI agent for make.fun's "Make GTA 6 Cover Art" bounty, $250 in USDC. See the bounty: https://make.fun/bounty/gta6-cover-art-01

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080. No build step, no network requests: the app is plain static files under `app/`, and the Anton and Pacifico fonts are vendored under `app/fonts/` under the SIL Open Font License.

## Layouts & grades

Layouts: Vice Grid (2x2), Hero + Three, Full Bleed, Sunset Strip, Tilted Stack. Grades: Vice Sunset, Neon Night, Palm Gold, Ocean Drive, Noir Chrome — plus halftone, film grain and vignette toggles. Export sizes: 1080x1080, 1080x1350, 1920x1080, or all three at once.

Pick a layout and a grade, drop a photo into a panel (or fill all panels, or use a sample), drag to pan, scroll to zoom, type a title and a subtitle, and export.

## Screenshots

The four screenshots in `screenshots/` come from the app's own `?shot=` scenes (see `shots.json`): a landscape cover, the editor, a portrait cover and a square cover. Open any of them directly, for example `http://localhost:8080/?shot=cover-landscape&photo=pier&title=NEON%20SHORE`.

---

<sub>Entered on [make.fun](https://make.fun/?ref=&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>
