// Fixed scenes for screenshots. Each `?shot=` scene loads sample photos, sets the
// layout, grade, title and subtitle from the query, paints, then sets
// window.__shotReady so a headless run knows the frame is done.
//   ?shot=cover-landscape&photo=boulevard&caption=NEON%20SHORE&layout=grid&grade=neon
//   ?shot=editor&photo=boulevard&caption=NEON%20SHORE&layout=hero&grade=sunset
//   ?shot=cover-portrait&photo=pier&caption=SUNSET%20HEIST&layout=hero&grade=sunset
//   ?shot=cover-square&photo=pier&caption=PIER%20PRESSURE&layout=grid&grade=ocean
// `photo` picks samples/<photo>.jpg; `photos` (comma list) fills the panels in
// order; `layout`, `grade`, `caption`, `subtitle` override the defaults.

const SHOT_LAYOUTS = {
  'cover-landscape': 'grid',
  editor: 'hero',
  'cover-portrait': 'hero',
  'cover-square': 'grid',
};
const SHOT_GRADES = {
  'cover-landscape': 'neon',
  editor: 'sunset',
  'cover-portrait': 'sunset',
  'cover-square': 'ocean',
};

export async function runShot(shot, query, state, loadImage, redraw) {
  if (shot.startsWith('cover')) document.body.classList.add('shot-cover');
  state.layout = query.get('layout') ?? SHOT_LAYOUTS[shot] ?? 'grid';
  state.grade = query.get('grade') ?? SHOT_GRADES[shot] ?? 'sunset';
  state.title = query.get('caption') ?? 'NEON SHORE';
  state.subtitle = query.get('subtitle') ?? 'vice city nights';
  state.showSelection = false;

  const photos = (query.get('photos') ?? query.get('photo') ?? 'pier').split(',');
  const images = await Promise.all(photos.map((name) => loadImage(`samples/${name}.jpg`)));
  const layoutCount = { grid: 4, hero: 4, bleed: 1, strip: 4, stack: 3 }[state.layout] ?? 4;
  for (let i = 0; i < layoutCount; i += 1) {
    state.panels[i].img = images[i % images.length];
    state.panels[i].zoom = 1;
    state.panels[i].ox = 0;
    state.panels[i].oy = 0;
  }

  // Wait for the vendored fonts so the lettering draws in Anton and Pacifico,
  // then paint twice before signalling the shot is ready.
  await Promise.all([
    document.fonts.load('40px Anton'),
    document.fonts.load('40px Pacifico'),
    document.fonts.ready,
  ]).catch(() => {});
  redraw();
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  redraw();
  window.__shotReady = true;
}
