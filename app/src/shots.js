// Fixed scenes for screenshots: ?shot=editor shows the editor with a
// sample photo loaded; ?shot=cover shows the cover alone, drawn by
// the app's own cover code at the requested export size.
// `photo` picks the sample (samples/<photo>.jpg), `caption` the words,
// `layout`, `grade` and `size` pick the cover setup.
// window.__shotReady is set once the scene has painted.
import { loadImage, syncChoices } from './main.js';
import { SIZES } from './cover.js';

/** Per-panel crop presets that frame different parts of one photo. */
export const VARY_PRESETS = {
  grid: [
    { zoom: 1.5, ox: -0.12, oy: 0.45 },
    { zoom: 1.5, ox: 0.12, oy: 0.45 },
    { zoom: 1.2, ox: 0, oy: -0.45 },
    { zoom: 1, ox: 0, oy: 0 },
  ],
  tilted: [
    { zoom: 1, ox: 0, oy: 0.18 },
    { zoom: 1, ox: 0, oy: 0.18 },
    { zoom: 1, ox: 0, oy: 0.15 },
  ],
};

/** Runs one fixed screenshot scene against the live editor state. */
export async function runShot(query, state, placePhoto, redraw) {
  const shot = query.get('shot');
  const photo = query.get('photo') || 'boulevard';
  const caption = query.get('caption') || 'Sunset Heist';
  if (query.get('layout')) state.layout = query.get('layout');
  if (query.get('grade')) state.grade = query.get('grade');
  if (query.get('subtitle') !== null) state.subtitle = query.get('subtitle');
  if (query.get('theme')) state.theme = query.get('theme');
  if (query.get('titlePos')) state.titlePos = query.get('titlePos');
  state.title = caption;
  const titleInput = document.getElementById('title');
  if (titleInput) titleInput.value = caption;
  const subtitleInput = document.getElementById('subtitle');
  if (subtitleInput) subtitleInput.value = state.subtitle;

  if (shot === 'cover') {
    document.body.classList.add('shot-cover');
    const size = SIZES[query.get('size')] || SIZES.landscape;
    state.size = query.get('size') || 'landscape';
    const img = await loadImage(`samples/${photo}.jpg`);
    placePhoto(img, true);
    // Vary the crop per panel so one photo reads as a poster sequence.
    if (query.get('vary') === 'panels') {
      const presets = VARY_PRESETS[state.layout] || [];
      presets.forEach((preset, i) => {
        if (state.panels[i]) Object.assign(state.panels[i], preset);
      });
    }
    syncChoices();
    // Draw the cover at full export resolution, full frame.
    const canvas = document.getElementById('cover');
    canvas.width = size.w;
    canvas.height = size.h;
    const { drawCover } = await import('./cover.js');
    drawCover(canvas, state);
  } else {
    document.body.classList.add('shot-editor');
    const img = await loadImage(`samples/${photo}.jpg`);
    placePhoto(img, true);
    syncChoices();
  }

  await document.fonts.ready;
  redraw();
  // In cover mode redraw() resets the canvas to half size; repaint full.
  if (shot === 'cover') {
    const size = SIZES[query.get('size')] || SIZES.landscape;
    const canvas = document.getElementById('cover');
    canvas.width = size.w;
    canvas.height = size.h;
    const { drawCover } = await import('./cover.js');
    drawCover(canvas, state);
  }
  requestAnimationFrame(() => requestAnimationFrame(() => {
    window.__shotReady = true;
  }));
}
