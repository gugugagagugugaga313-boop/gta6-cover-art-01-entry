# Vice City Cover Studio

[![gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/c/gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/gugugagagugugaga313-boop/gta6-cover-art-01-entry/rank.svg)](https://make.fun/c/gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/gugugagagugugaga313-boop/gta6-cover-art-01-entry/reward.svg)](https://make.fun/c/gta6-cover-art-01)

Turn any photo and caption into GTA-style multi-panel cover art, in the
style of a Vice City sunset poster — offline, in your browser, exported
as a PNG to share. Built for the
[Make GTA 6 Cover Art](https://make.fun/c/gta6-cover-art-01) bounty on
[make.fun](https://make.fun).

## What it does

- **Any photo, any panel** — load your own photos from your machine
  (never uploaded) or try a sample in one click. Fill several panels
  with one photo or use a different photo per panel.
- **Crop and position per panel** — click a panel to select it, drag
  the photo inside it to position it, zoom with the slider,
  double-click to reset.
- **Five layouts** — Vice Grid (2×2), Hero + Three, Full Bleed,
  Sunset Strip (3 vertical panels) and Tilted Stack (3 tilted
  snapshots with white borders).
- **Five colour grades** — Vice Sunset, Neon Night, Palm Gold, Ocean
  Drive and Noir Chrome, drawn as canvas gradients and filters, plus
  halftone dots, film grain and a vignette.
- **Bold caption lettering** — an editable condensed title with a
  gradient fill and outline, a neon script subtitle, three lettering
  themes, top or bottom placement, and a size control.
- **Fast export** — one click exports a PNG at 1080 × 1080,
  1080 × 1350 or 1920 × 1080; "Export all 3 sizes" saves all three
  at once. The preview and the export share one drawing function, so
  what you see is what you share.

## Run it offline

```sh
node serve.ts
# open http://localhost:8080
```

No build step, no network request: every script, font and sample
image is a file under `app/`. Photos are read on your machine only.

## Originality

Everything is the maker's own: the layouts, grades and lettering are
drawn in code. No Rockstar Games logo, wordmark, artwork or font is
used. The Anton and Pacifico fonts are under the SIL Open Font
License (licence texts in `app/fonts/`). The two sample photos under
`app/samples/` were made with an image model for make.fun and are
free to use.

## Entry

`main.ts` (Node 22, standard library only) copies `app/` and
`screenshots/` to the output directory and writes `dossier.json`
with the vendored `vendor/makefun-app.ts` builder:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`screenshots/` holds four images taken by the app's maker: three
covers the app exported (landscape, portrait, square) and the editor
with a photo loaded.

## License

MIT — see `LICENSE`.
