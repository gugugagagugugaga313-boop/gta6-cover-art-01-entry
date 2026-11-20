// Panel geometry for the five cover layouts. Each layout returns the panel
// rectangles (fractions of the cover width/height) it uses, in draw order.
// Panels are drawn first to last; later panels overlap earlier ones.
export const LAYOUTS = {
  grid: {
    name: 'Vice Grid',
    panels: 4,
    rects(w, h) {
      const g = Math.min(w, h) * 0.02;
      const cw = (w - g) / 2;
      const ch = (h - g) / 2;
      return [
        { x: 0, y: 0, w: cw, h: ch },
        { x: cw + g, y: 0, w: cw, h: ch },
        { x: 0, y: ch + g, w: cw, h: ch },
        { x: cw + g, y: ch + g, w: cw, h: ch },
      ];
    },
  },
  hero: {
    name: 'Hero + Three',
    panels: 4,
    rects(w, h) {
      const g = Math.min(w, h) * 0.02;
      const left = w * 0.62;
      const right = w - left - g;
      const ch = (h - 2 * g) / 3;
      return [
        { x: 0, y: 0, w: left, h },
        { x: left + g, y: 0, w: right, h: ch },
        { x: left + g, y: ch + g, w: right, h: ch },
        { x: left + g, y: 2 * (ch + g), w: right, h: ch },
      ];
    },
  },
  full: {
    name: 'Full Bleed',
    panels: 1,
    rects(w, h) {
      return [{ x: 0, y: 0, w, h }];
    },
  },
  strip: {
    name: 'Sunset Strip',
    panels: 3,
    rects(w, h) {
      const g = Math.min(w, h) * 0.02;
      const ch = (h - 2 * g) / 3;
      return [
        { x: 0, y: 0, w, h: ch },
        { x: 0, y: ch + g, w, h: ch },
        { x: 0, y: 2 * (ch + g), w, h: ch },
      ];
    },
  },
  stack: {
    name: 'Tilted Stack',
    panels: 3,
    rects(w, h) {
      // Overlapping cards, each tilted a little; rotation is applied by the
      // drawer from the rect's `tilt` field (degrees, around the rect centre).
      const cw = w * 0.62;
      const ch = h * 0.58;
      return [
        { x: w * 0.05, y: h * 0.04, w: cw, h: ch, tilt: -4 },
        { x: w * 0.33, y: h * 0.2, w: cw, h: ch, tilt: 3 },
        { x: w * 0.12, y: h * 0.38, w: cw, h: ch, tilt: -1.5 },
      ];
    },
  },
};

/** The layout ids, in the order the picker shows them. */
export const LAYOUT_ORDER = ['grid', 'hero', 'full', 'strip', 'stack'];
