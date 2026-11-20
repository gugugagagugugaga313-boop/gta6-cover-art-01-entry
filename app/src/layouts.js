// Panel geometry for the five cover layouts. Each layout maps a cover of width
// `w` and height `h` to the panel rectangles it draws, with a small gap between
// panels. A rect may carry `rot` (degrees) for tilted panels; `panels` is how
// many of the four panel slots the layout uses.

/** Splits `total` length into `n` parts with `gap` between them. */
function split(total, n, gap) {
  const size = (total - gap * (n - 1)) / n;
  const out = [];
  for (let i = 0; i < n; i += 1) out.push({ at: i * (size + gap), size });
  return out;
}

export const LAYOUTS = {
  grid: {
    name: 'Vice Grid',
    panels: 4,
    rects(w, h) {
      const g = Math.round(w * 0.012);
      const cols = split(w, 2, g);
      const rows = split(h, 2, g);
      return [
        { x: cols[0].at, y: rows[0].at, w: cols[0].size, h: rows[0].size },
        { x: cols[1].at, y: rows[0].at, w: cols[1].size, h: rows[0].size },
        { x: cols[0].at, y: rows[1].at, w: cols[0].size, h: rows[1].size },
        { x: cols[1].at, y: rows[1].at, w: cols[1].size, h: rows[1].size },
      ];
    },
  },
  hero: {
    name: 'Hero + Three',
    panels: 4,
    rects(w, h) {
      const g = Math.round(w * 0.012);
      const heroW = Math.round(w * 0.6);
      const sideX = heroW + g;
      const sideW = w - sideX;
      const rows = split(h, 3, g);
      return [
        { x: 0, y: 0, w: heroW, h },
        { x: sideX, y: rows[0].at, w: sideW, h: rows[0].size },
        { x: sideX, y: rows[1].at, w: sideW, h: rows[1].size },
        { x: sideX, y: rows[2].at, w: sideW, h: rows[2].size },
      ];
    },
  },
  bleed: {
    name: 'Full Bleed',
    panels: 1,
    rects(w, h) {
      return [{ x: 0, y: 0, w, h }];
    },
  },
  strip: {
    name: 'Sunset Strip',
    panels: 4,
    rects(w, h) {
      const g = Math.round(w * 0.012);
      const topH = Math.round(h * 0.66);
      const botY = topH + g;
      const botH = h - botY;
      const cols = split(w, 3, g);
      return [
        { x: 0, y: 0, w, h: topH },
        { x: cols[0].at, y: botY, w: cols[0].size, h: botH },
        { x: cols[1].at, y: botY, w: cols[1].size, h: botH },
        { x: cols[2].at, y: botY, w: cols[2].size, h: botH },
      ];
    },
  },
  stack: {
    name: 'Tilted Stack',
    panels: 3,
    rects(w, h) {
      const pw = Math.round(w * 0.62);
      const ph = Math.round(h * 0.62);
      return [
        { x: Math.round(w * 0.05), y: Math.round(h * 0.04), w: pw, h: ph, rot: -4 },
        { x: Math.round(w * 0.33), y: Math.round(h * 0.2), w: pw, h: ph, rot: 3 },
        { x: Math.round(w * 0.12), y: Math.round(h * 0.34), w: pw, h: ph, rot: -2 },
      ];
    },
  },
};

export const LAYOUT_IDS = Object.keys(LAYOUTS);
