// Colour grades: a canvas filter for the photos plus a translucent overlay
// painted over each panel, so every grade reads as one Vice City look.
export const GRADES = {
  sunset: {
    name: 'Vice Sunset',
    filter: 'saturate(1.3) contrast(1.08) sepia(0.18) brightness(1.02)',
    overlay: [
      { at: 0, color: 'rgba(255, 176, 66, 0.16)' },
      { at: 1, color: 'rgba(214, 51, 132, 0.34)' },
    ],
  },
  neon: {
    name: 'Neon Night',
    filter: 'saturate(1.55) contrast(1.16) brightness(0.88) hue-rotate(-18deg)',
    overlay: [
      { at: 0, color: 'rgba(64, 224, 255, 0.14)' },
      { at: 1, color: 'rgba(255, 43, 214, 0.30)' },
    ],
  },
  gold: {
    name: 'Palm Gold',
    filter: 'sepia(0.38) saturate(1.35) contrast(1.06) brightness(1.04)',
    overlay: [
      { at: 0, color: 'rgba(255, 214, 110, 0.18)' },
      { at: 1, color: 'rgba(146, 64, 14, 0.26)' },
    ],
  },
  ocean: {
    name: 'Ocean Drive',
    filter: 'saturate(1.22) brightness(1.06) contrast(1.04) hue-rotate(14deg)',
    overlay: [
      { at: 0, color: 'rgba(45, 212, 191, 0.16)' },
      { at: 1, color: 'rgba(8, 74, 110, 0.30)' },
    ],
  },
  noir: {
    name: 'Noir Chrome',
    filter: 'grayscale(1) contrast(1.28) brightness(1.06)',
    overlay: [
      { at: 0, color: 'rgba(226, 232, 240, 0.10)' },
      { at: 1, color: 'rgba(15, 23, 42, 0.34)' },
    ],
  },
};

/** The grade ids, in the order the picker shows them. */
export const GRADE_ORDER = ['sunset', 'neon', 'gold', 'ocean', 'noir'];
