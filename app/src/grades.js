// The five colour grades. A grade is a canvas filter applied to each photo plus a
// two-stop tint washed over the whole cover (top, bottom) so the panels read as
// one image. Each grade's tint is a different sunset-city mood.

export const GRADES = [
  {
    id: 'sunset',
    name: 'Vice Sunset',
    filter: 'saturate(1.35) contrast(1.08) sepia(0.18) hue-rotate(-8deg)',
    tintTop: 'rgba(255, 110, 60, 0.10)',
    tintBottom: 'rgba(200, 40, 120, 0.28)',
  },
  {
    id: 'neon',
    name: 'Neon Night',
    filter: 'saturate(1.5) contrast(1.15) brightness(0.92) hue-rotate(12deg)',
    tintTop: 'rgba(80, 40, 200, 0.16)',
    tintBottom: 'rgba(20, 10, 60, 0.30)',
  },
  {
    id: 'gold',
    name: 'Palm Gold',
    filter: 'sepia(0.35) saturate(1.3) contrast(1.05) brightness(1.05)',
    tintTop: 'rgba(255, 190, 80, 0.12)',
    tintBottom: 'rgba(160, 90, 20, 0.26)',
  },
  {
    id: 'ocean',
    name: 'Ocean Drive',
    filter: 'saturate(1.25) hue-rotate(18deg) contrast(1.05) brightness(1.02)',
    tintTop: 'rgba(40, 200, 210, 0.10)',
    tintBottom: 'rgba(10, 80, 110, 0.28)',
  },
  {
    id: 'noir',
    name: 'Noir Chrome',
    filter: 'grayscale(1) contrast(1.25) brightness(1.05)',
    tintTop: 'rgba(220, 220, 230, 0.08)',
    tintBottom: 'rgba(10, 10, 14, 0.30)',
  },
];

export function gradeById(id) {
  return GRADES.find((g) => g.id === id) ?? GRADES[0];
}
