// Fixed scenes for screenshots. `?shot=` picks the scene; `photo`, `title`,
// `subtitle`, `layout`, `grade` and `aspect` tune it. Cover-only scenes hide
// the editor and stretch the canvas to the viewport; the editor scene keeps
// the full UI. window.__shotReady is set once painted.

const SCENES = {
  'cover-landscape': {
    coverOnly: true, layout: 'grid', grade: 'sunset', aspect: 'wide',
    photo: 'pier', title: 'NEON SHORE', subtitle: 'one Vice City sunset',
    // Four different crops of the same photo, so the grid reads as four shots.
    pan: [
      { ox: -0.08, oy: -0.06, zoom: 1.3 },
      { ox: 0.1, oy: 0.04, zoom: 1.05 },
      { ox: -0.05, oy: 0.1, zoom: 1.2 },
      { ox: 0.12, oy: -0.08, zoom: 1.4 },
    ],
  },
  editor: {
    coverOnly: false, layout: 'grid', grade: 'sunset', aspect: 'square',
    photo: 'boulevard', title: 'SUNSET HEIST', subtitle: 'one Vice City sunset',
    pan: [
      { ox: 0, oy: 0, zoom: 1 },
      { ox: 0.08, oy: 0, zoom: 1.15 },
      { ox: -0.08, oy: 0.05, zoom: 1.15 },
      { ox: 0, oy: -0.05, zoom: 1.1 },
    ],
  },
  'cover-portrait': {
    coverOnly: true, layout: 'hero', grade: 'neon', aspect: 'portrait',
    photo: 'pier', title: 'SUNSET HEIST', subtitle: 'one Vice City sunset',
    // Lift the hero crop so the face clears the panel seam; vary the rail.
    pan: [
      { ox: 0, oy: -0.14, zoom: 1.05 },
      { ox: 0.06, oy: 0, zoom: 1.2 },
      { ox: -0.06, oy: 0.04, zoom: 1.15 },
      { ox: 0.1, oy: -0.06, zoom: 1.25 },
    ],
  },
  'cover-square': {
    coverOnly: true, layout: 'grid', grade: 'gold', aspect: 'square',
    photo: 'boulevard', title: 'PIER PRESSURE', subtitle: 'one Vice City sunset',
    pan: [
      { ox: -0.06, oy: -0.04, zoom: 1.25 },
      { ox: 0.08, oy: 0.02, zoom: 1.1 },
      { ox: 0, oy: 0.08, zoom: 1.2 },
      { ox: -0.1, oy: -0.02, zoom: 1.35 },
    ],
  },
};

export async function runShot(shot, query, api) {
  const scene = SCENES[shot] ?? SCENES['cover-landscape'];
  const photo = query.get('photo') ?? scene.photo;
  const patch = {
    layout: query.get('layout') ?? scene.layout,
    grade: query.get('grade') ?? scene.grade,
    aspect: query.get('aspect') ?? scene.aspect,
    title: query.get('title') ?? scene.title,
    subtitle: query.get('subtitle') ?? scene.subtitle,
  };
  if (scene.coverOnly) document.body.classList.add('shot-cover');
  api.setState(patch);
  const img = await api.loadImage(`samples/${photo}.jpg`);
  const count = { grid: 4, hero: 4, full: 1, strip: 3, tilted: 4 }[patch.layout] ?? 4;
  await api.applyImageTo(img, Array.from({ length: count }, (_, i) => i));
  if (scene.pan) api.setPanels(scene.pan.slice(0, count));
  if (scene.coverOnly) {
    // Cover fills the whole screenshot frame at the viewport's own size.
    api.canvas.width = window.innerWidth;
    api.canvas.height = window.innerHeight;
    api.redraw();
  }
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}
