# Vice City Cover Studio

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/gugugagagugugaga313-boop/gta6-cover-art-01-entry/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/gugugagagugugaga313-boop/gta6-cover-art-01-entry/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

Turn any photo and a caption into GTA-style multi-panel cover art, in the
browser, offline, with nothing uploaded. Built for make.fun's
[“Make GTA 6 Cover Art” bounty](https://make.fun/bounty/gta6-cover-art-01)
($250, 50 paid places).

## What it does

- **5 layouts** — Vice Grid (2×2), Hero + Three, Full Bleed, Sunset Strip,
  Tilted Stack. Switch live; the cover redraws instantly.
- **Any photo** — upload your own per panel, fill all panels with one photo,
  or drop in a sample (Boulevard, Pier). Drag to pan, scroll (or the slider)
  to zoom, per panel.
- **5 grades** — Vice Sunset, Neon Night, Palm Gold, Ocean Drive, Noir
  Chrome — plus halftone dots, film grain and vignette.
- **Lettering** — an editable title in Anton with a sunset gradient fill and
  a subtitle in Pacifico with a neon glow. Both fonts are vendored under the
  SIL Open Font License (`app/fonts/`, OFL texts beside them).
- **Export** — one click each for 1080×1080, 1080×1350 and 1920×1080 PNGs,
  or “Export all 3 sizes”.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

No build step, no network request: every script, image and font is a file
under `app/`. Screenshots are taken with the app's own `?shot=` scenes (see
`shots.json`).

## Files

- `app/` — the static app (index.html, style.css, src/*.js, fonts, samples)
- `screenshots/` — 4 screenshots: the landscape cover, the editor, the
  portrait cover, the square cover
- `main.ts` — the entry program: copies `app/` and `screenshots/` to
  `/output` and writes `dossier.json`
- `vendor/makefun-app.ts` — the kit's dossier library, unchanged

---

<sub>Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>
