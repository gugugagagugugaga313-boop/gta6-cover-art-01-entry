// Fixed scenes for screenshots. `?shot=<name>` picks a preset; query params
// override parts of it (photo, caption, layout, grade, size). `apply` gets a
// state patch { layout, grade, size, title, subtitle, photos, halftone,
// grain, vignette, coverOnly } and main.js loads the photos and paints.
// window.__shotReady is set once the scene is painted.
const SCENES = {
  'cover-landscape': {
    layout: 'grid', grade: 'neon', size: 'wide',
    title: 'NEON SHORE', subtitle: 'vice city nights',
    photos: ['pier', 'boulevard', 'pier', 'boulevard'],
    halftone: true, grain: true, vignette: true, coverOnly: true,
  },
  editor: {
    layout: 'grid', grade: 'sunset', size: 'square',
    title: 'Boulevard Queen', subtitle: 'golden hour',
    photos: ['boulevard', 'pier', 'boulevard', 'pier'],
    // Frame the hero photo a little tighter so the cover shows the zoom off.
    zoom: [1.15, 1, 1, 1],
    halftone: false, grain: true, vignette: true, coverOnly: false,
  },
  'cover-portrait': {
    layout: 'hero', grade: 'sunset', size: 'portrait',
    title: 'SUNSET HEIST', subtitle: 'one last score',
    photos: ['boulevard', 'pier', 'boulevard', 'pier'],
    halftone: true, grain: false, vignette: true, coverOnly: true,
  },
  'cover-square': {
    layout: 'full', grade: 'ocean', size: 'square',
    title: 'PIER PRESSURE', subtitle: 'low tide',
    photos: ['pier'],
    halftone: false, grain: true, vignette: true, coverOnly: true,
  },
};

export async function runShot(shot, query, apply) {
  const preset = SCENES[shot] ?? SCENES.editor;
  const patch = { ...preset };
  if (query.get('layout')) patch.layout = query.get('layout');
  if (query.get('grade')) patch.grade = query.get('grade');
  if (query.get('size')) patch.size = query.get('size');
  if (query.get('caption')) patch.title = query.get('caption');
  if (query.get('subtitle')) patch.subtitle = query.get('subtitle');
  if (query.get('photo')) patch.photos = query.get('photo').split(',');
  await apply(patch);
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}
