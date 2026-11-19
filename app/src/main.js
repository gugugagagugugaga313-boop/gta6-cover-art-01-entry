// Vice City Cover Studio — editor wiring.
// Owns the state, the controls, panel picking and dragging, and the
// PNG exports. All drawing lives in ./cover.js; this file only
// decides what to draw and when.
import { LAYOUTS, GRADES, THEMES, SIZES, layoutPanels, drawCover } from './cover.js';
import { runShot } from './shots.js';

const $ = (id) => document.getElementById(id);
const canvas = $('cover');
const statusEl = $('status');

/** The editor state: one object, redrawn on every change. */
const state = {
  layout: 'grid',
  grade: 'sunset',
  size: 'square',
  title: 'Sunset Heist',
  subtitle: 'one last ride',
  titlePos: 'bottom',
  titleSize: 1,
  theme: 'sunset',
  halftone: true,
  panels: [
    { img: null, zoom: 1, ox: 0, oy: 0 },
    { img: null, zoom: 1, ox: 0, oy: 0 },
    { img: null, zoom: 1, ox: 0, oy: 0 },
    { img: null, zoom: 1, ox: 0, oy: 0 },
  ],
};
let selectedPanel = 0;
let drag = null;

/** Loads an image from a URL, resolving once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('could not load image'));
    img.src = url;
  });
}

/** Loads an image from a local file the user picked. */
export function loadFile(file) {
  return loadImage(URL.createObjectURL(file));
}

/** Redraws the preview canvas at half the export size. */
export function redraw() {
  const size = SIZES[state.size];
  const scale = 0.5;
  canvas.width = Math.round(size.w * scale);
  canvas.height = Math.round(size.h * scale);
  drawCover(canvas, state);
  highlightSelectedPanel();
  $('panelLabel').textContent = `Panel ${selectedPanel + 1} of ${LAYOUTS[state.layout].panels}`;
  $('zoom').value = state.panels[selectedPanel].zoom;
  $('zoomVal').textContent = `${Math.round(state.panels[selectedPanel].zoom * 100)}%`;
}

/** Draws a dashed outline around the selected panel on the preview. */
export function highlightSelectedPanel() {
  const rects = layoutPanels(canvas.width, canvas.height, state.layout, state.titlePos);
  const rect = rects[selectedPanel];
  if (!rect) return;
  const ctx = canvas.getContext('2d');
  ctx.save();
  ctx.strokeStyle = '#00e5ff';
  ctx.lineWidth = 3;
  ctx.setLineDash([10, 6]);
  ctx.strokeRect(rect.x + 2, rect.y + 2, rect.w - 4, rect.h - 4);
  ctx.restore();
}

/** Puts one image into the selected panel, or every panel. */
export function placePhoto(img, everywhere) {
  if (everywhere) {
    state.panels.forEach((p) => {
      p.img = img;
      p.zoom = 1;
      p.ox = 0;
      p.oy = 0;
    });
  } else {
    const p = state.panels[selectedPanel];
    p.img = img;
    p.zoom = 1;
    p.ox = 0;
    p.oy = 0;
  }
  redraw();
}

/** Builds a row of toggle buttons from a table of choices. */
export function buildChoiceButtons(holder, table, current, onPick) {
  holder.innerHTML = '';
  Object.entries(table).forEach(([key, value]) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'choice' + (key === current ? ' active' : '');
    b.textContent = value.name;
    b.addEventListener('click', () => {
      onPick(key);
      holder.querySelectorAll('.choice').forEach((el) => el.classList.remove('active'));
      b.classList.add('active');
    });
    holder.appendChild(b);
  });
}

/** Renders one size's cover to a fresh canvas and downloads the PNG. */
export function exportSize(sizeKey) {
  const size = SIZES[sizeKey];
  const off = document.createElement('canvas');
  off.width = size.w;
  off.height = size.h;
  drawCover(off, state);
  return new Promise((resolve) => {
    off.toBlob((blob) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `vice-city-cover-${size.w}x${size.h}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
      resolve(blob);
    }, 'image/png');
  });
}

/** Exports the current size, or all three sizes in one click. */
export async function exportCover(all) {
  const keys = all ? Object.keys(SIZES) : [state.size];
  for (const key of keys) await exportSize(key);
  const size = SIZES[state.size];
  statusEl.textContent = all
    ? 'Saved all three sizes: 1080 x 1080, 1080 x 1350 and 1920 x 1080.'
    : `Saved vice-city-cover-${size.w}x${size.h}.png`;
}

/** Maps a pointer event on the preview to a panel index, or -1. */
export function panelAt(clientX, clientY) {
  const box = canvas.getBoundingClientRect();
  const x = ((clientX - box.left) / box.width) * canvas.width;
  const y = ((clientY - box.top) / box.height) * canvas.height;
  const rects = layoutPanels(canvas.width, canvas.height, state.layout, state.titlePos);
  for (let i = rects.length - 1; i >= 0; i--) {
    const r = rects[i];
    if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return i;
  }
  return -1;
}

// Photo inputs: one file per selected panel, fill-all, and samples.
$('photoFile').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    placePhoto(await loadFile(file), false);
    statusEl.textContent = `Photo loaded into panel ${selectedPanel + 1}. Drag it to position, zoom to crop.`;
  } catch {
    statusEl.textContent = 'That file could not be read as a photo.';
  }
  e.target.value = '';
});
$('photoFill').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    placePhoto(await loadFile(file), true);
    statusEl.textContent = 'One photo fills every panel. Pick a panel to crop it differently.';
  } catch {
    statusEl.textContent = 'That file could not be read as a photo.';
  }
  e.target.value = '';
});
$('sampleBoulevard').addEventListener('click', async () => {
  placePhoto(await loadImage('samples/boulevard.jpg'), true);
  statusEl.textContent = 'Sample photo loaded: boulevard at golden hour.';
});
$('samplePier').addEventListener('click', async () => {
  placePhoto(await loadImage('samples/pier.jpg'), true);
  statusEl.textContent = 'Sample photo loaded: pier over turquoise water.';
});

// Layout, grade and theme choices.
export function syncChoices() {
  buildChoiceButtons($('layouts'), LAYOUTS, state.layout, (key) => {
    state.layout = key;
    selectedPanel = 0;
    redraw();
  });
  buildChoiceButtons($('grades'), GRADES, state.grade, (key) => {
    state.grade = key;
    redraw();
  });
  buildChoiceButtons($('themes'), THEMES, state.theme, (key) => {
    state.theme = key;
    redraw();
  });
  buildChoiceButtons($('sizes'), SIZES, state.size, (key) => {
    state.size = key;
    redraw();
  });
}
syncChoices();

// Caption controls.
$('title').addEventListener('input', (e) => {
  state.title = e.target.value;
  redraw();
});
$('subtitle').addEventListener('input', (e) => {
  state.subtitle = e.target.value;
  redraw();
});
$('titlePos').addEventListener('change', (e) => {
  state.titlePos = e.target.value;
  redraw();
});
$('titleSize').addEventListener('input', (e) => {
  state.titleSize = Number(e.target.value);
  redraw();
});
$('halftone').addEventListener('change', (e) => {
  state.halftone = e.target.checked;
  redraw();
});

// Zoom slider for the selected panel.
$('zoom').addEventListener('input', (e) => {
  state.panels[selectedPanel].zoom = Number(e.target.value);
  redraw();
});

// Panel picking and drag-to-pan on the preview canvas.
canvas.addEventListener('pointerdown', (e) => {
  const i = panelAt(e.clientX, e.clientY);
  if (i < 0) return;
  selectedPanel = i;
  canvas.setPointerCapture(e.pointerId);
  drag = { x: e.clientX, y: e.clientY, ox: state.panels[i].ox, oy: state.panels[i].oy };
  redraw();
});
canvas.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const box = canvas.getBoundingClientRect();
  const rects = layoutPanels(canvas.width, canvas.height, state.layout, state.titlePos);
  const rect = rects[selectedPanel];
  if (!rect) return;
  const p = state.panels[selectedPanel];
  const dxCanvas = ((e.clientX - drag.x) / box.width) * canvas.width;
  const dyCanvas = ((e.clientY - drag.y) / box.height) * canvas.height;
  p.ox = Math.max(-0.6, Math.min(0.6, drag.ox + dxCanvas / rect.w));
  p.oy = Math.max(-0.6, Math.min(0.6, drag.oy + dyCanvas / rect.h));
  redraw();
});
canvas.addEventListener('pointerup', () => {
  drag = null;
});
canvas.addEventListener('dblclick', () => {
  const p = state.panels[selectedPanel];
  p.zoom = 1;
  p.ox = 0;
  p.oy = 0;
  redraw();
});

// Exports.
$('export').addEventListener('click', () => exportCover(false));
$('exportAll').addEventListener('click', () => exportCover(true));

// Fixed screenshot scenes (?shot=cover / ?shot=editor) for the maker.
const params = new URLSearchParams(location.search);
if (params.get('shot')) {
  runShot(params, state, placePhoto, redraw);
} else {
  redraw();
}
