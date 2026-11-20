// The five cover layouts. Each layout names its panels and returns their rects as
// fractions of the cover (x, y, w, h in 0..1) plus an optional per-panel rotation
// in degrees (Tilted Stack). Rects always tile the whole frame; the draw step
// applies a small gap between panels.

export const LAYOUTS = [
  { id: 'grid', name: 'Vice Grid', panels: 4 },
  { id: 'hero', name: 'Hero + Three', panels: 4 },
  { id: 'full', name: 'Full Bleed', panels: 1 },
  { id: 'strip', name: 'Sunset Strip', panels: 3 },
  { id: 'tilted', name: 'Tilted Stack', panels: 4 },
];

/** Rects for `layoutId` over a cover of any aspect. Rotations are in degrees. */
export function layoutRects(layoutId) {
  switch (layoutId) {
    case 'hero':
      return [
        { x: 0, y: 0, w: 0.665, h: 1, rot: 0 },
        { x: 0.675, y: 0, w: 0.325, h: 0.326, rot: 0 },
        { x: 0.675, y: 0.337, w: 0.325, h: 0.326, rot: 0 },
        { x: 0.675, y: 0.674, w: 0.325, h: 0.326, rot: 0 },
      ];
    case 'full':
      return [{ x: 0, y: 0, w: 1, h: 1, rot: 0 }];
    case 'strip':
      return [
        { x: 0, y: 0, w: 0.326, h: 1, rot: 0 },
        { x: 0.337, y: 0, w: 0.326, h: 1, rot: 0 },
        { x: 0.674, y: 0, w: 0.326, h: 1, rot: 0 },
      ];
    case 'tilted':
      return [
        { x: 0, y: 0, w: 0.495, h: 0.495, rot: -2.5 },
        { x: 0.505, y: 0, w: 0.495, h: 0.495, rot: 2 },
        { x: 0, y: 0.505, w: 0.495, h: 0.495, rot: 1.5 },
        { x: 0.505, y: 0.505, w: 0.495, h: 0.495, rot: -2 },
      ];
    case 'grid':
    default:
      return [
        { x: 0, y: 0, w: 0.495, h: 0.495, rot: 0 },
        { x: 0.505, y: 0, w: 0.495, h: 0.495, rot: 0 },
        { x: 0, y: 0.505, w: 0.495, h: 0.495, rot: 0 },
        { x: 0.505, y: 0.505, w: 0.495, h: 0.495, rot: 0 },
      ];
  }
}

export function layoutById(id) {
  return LAYOUTS.find((l) => l.id === id) ?? LAYOUTS[0];
}
