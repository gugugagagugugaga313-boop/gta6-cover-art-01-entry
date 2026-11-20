// Colour grades: a canvas `filter` string applied while a panel photo is drawn,
// plus two overlay gradients (a warm wash and a cool wash) composited over the
// whole cover afterwards. Each grade reads as a different Vice City mood.

export const GRADES = {
  sunset: {
    name: 'Vice Sunset',
    filter: 'saturate(1.3) contrast(1.06) brightness(1.02)',
    warm: ['rgba(255, 122, 60, 0.30)', 'rgba(214, 38, 120, 0.34)'],
    cool: ['rgba(40, 10, 90, 0)', 'rgba(40, 10, 90, 0.18)'],
  },
  neon: {
    name: 'Neon Night',
    filter: 'saturate(1.5) contrast(1.1)',
    warm: ['rgba(255, 46, 136, 0.34)', 'rgba(255, 46, 136, 0.22)'],
    cool: ['rgba(45, 226, 197, 0.22)', 'rgba(20, 20, 120, 0.30)'],
  },
  gold: {
    name: 'Palm Gold',
    filter: 'sepia(0.38) saturate(1.35) contrast(1.04)',
    warm: ['rgba(255, 179, 71, 0.30)', 'rgba(255, 140, 40, 0.22)'],
    cool: ['rgba(90, 50, 0, 0)', 'rgba(90, 50, 0, 0.14)'],
  },
  ocean: {
    name: 'Ocean Drive',
    filter: 'saturate(1.18) hue-rotate(-12deg) contrast(1.05)',
    warm: ['rgba(45, 226, 197, 0.10)', 'rgba(45, 226, 197, 0.16)'],
    cool: ['rgba(10, 80, 160, 0.22)', 'rgba(10, 30, 90, 0.34)'],
  },
  noir: {
    name: 'Noir Chrome',
    filter: 'grayscale(1) contrast(1.18) brightness(1.06)',
    warm: ['rgba(255, 255, 255, 0.06)', 'rgba(255, 255, 255, 0)'],
    cool: ['rgba(0, 0, 0, 0.10)', 'rgba(0, 0, 0, 0.30)'],
  },
};

export const GRADE_IDS = Object.keys(GRADES);
