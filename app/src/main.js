// Wires the studio: state, pickers, panel pan/zoom, uploads, samples, exports.
// A `?shot=` query sets up a fixed scene for a screenshot instead (./shots.js).
import { LAYOUTS, LAYOUT_IDS } from './layouts.js';
import { GRADES, GRADE_IDS } from './grades.js';
import { drawCover, renderCoverToCanvas } from './cover.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('cover');
const status = document.getElementById('status');

/** A panel slot: its photo (an Image or null) and its crop (zoom + pan). */
function blankPanel() {
  return { img: null, zoom: 1, ox: 0, oy: 0 };
}

export const state = {
  layout: 'grid',
  grade: 'sunset',
  halftone: true,
  grain: 35,
  vignette: 55,
  title: 'NEON SHORE',
  subtitle: 'vice city nights',
  panels: [blankPanel(), blankPanel(), blankPanel(), blankPanel()],
  selected: 0,
  showSelection: true,
};
window.__vice = state;

/** Loads an image from a URL, resolving once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

/** Sizes the preview canvas to its displayed size and redraws the cover. */
function redraw() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const rect = canvas.getBoundingClientRect();
  const w = Math.max(2, Math.round(rect.width * dpr));
  const h = Math.max(2, Math.round(rect.height * dpr));
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  drawCover(canvas.getContext('2d'), state, canvas.width, canvas.height);
}

/** Builds a picker of toggle buttons from a name map into `host`. */
function buildPicker(host, ids, names, current, onPick) {
  ids.forEach((id) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn small';
    button.textContent = names[id];
    button.setAttribute('aria-pressed', id === current ? 'true' : 'false');
    button.addEventListener('click', () => {
      onPick(id);
      host.querySelectorAll('button').forEach((b) => {
        b.setAttribute('aria-pressed', b === button ? 'true' : 'false');
      });
      redraw();
    });
    host.appendChild(button);
  });
}

buildPicker(
  document.getElementById('layout-picker'),
  LAYOUT_IDS,
  Object.fromEntries(LAYOUT_IDS.map((id) => [id, LAYOUTS[id].name])),
  state.layout,
  (id) => { state.layout = id; },
);
buildPicker(
  document.getElementById('grade-picker'),
  GRADE_IDS,
  Object.fromEntries(GRADE_IDS.map((id) => [id, GRADES[id].name])),
  state.grade,
  (id) => { state.grade = id; },
);

document.getElementById('fx-halftone').addEventListener('change', (e) => {
  state.halftone = e.target.checked;
  redraw();
});
document.getElementById('fx-grain').addEventListener('input', (e) => {
  state.grain = Number(e.target.value);
  redraw();
});
document.getElementById('fx-vignette').addEventListener('input', (e) => {
  state.vignette = Number(e.target.value);
  redraw();
});
document.getElementById('title').addEventListener('input', (e) => {
  state.title = e.target.value;
  redraw();
});
document.getElementById('subtitle').addEventListener('input', (e) => {
  state.subtitle = e.target.value;
  redraw();
});

const zoomSlider = document.getElementById('zoom');
function syncZoomSlider() {
  zoomSlider.value = String(Math.round(state.panels[state.selected].zoom * 100));
}
zoomSlider.addEventListener('input', () => {
  state.panels[state.selected].zoom = Number(zoomSlider.value) / 100;
  redraw();
});

const fileInput = document.getElementById('file-panel');
document.getElementById('upload-panel').addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  state.panels[state.selected].img = await loadImage(URL.createObjectURL(file));
  state.panels[state.selected].zoom = 1;
  state.panels[state.selected].ox = 0;
  state.panels[state.selected].oy = 0;
  syncZoomSlider();
  redraw();
});

document.getElementById('fill-all').addEventListener('click', () => {
  const source = state.panels[state.selected];
  if (!source.img) {
    status.textContent = 'Load a photo into the selected panel first.';
    return;
  }
  state.panels.forEach((panel) => {
    panel.img = source.img;
    panel.zoom = source.zoom;
    panel.ox = source.ox;
    panel.oy = source.oy;
  });
  status.textContent = 'Filled every panel with the selected photo.';
  redraw();
});

document.querySelectorAll('[data-sample]').forEach((button) => {
  button.addEventListener('click', async () => {
    state.panels[state.selected].img = await loadImage(`samples/${button.dataset.sample}.jpg`);
    state.panels[state.selected].zoom = 1;
    state.panels[state.selected].ox = 0;
    state.panels[state.selected].oy = 0;
    syncZoomSlider();
    redraw();
  });
});

/** Which panel rect, if any, holds canvas point (x, y). */
function panelAt(x, y) {
  const layout = LAYOUTS[state.layout];
  const rects = layout.rects(canvas.width, canvas.height);
  for (let i = rects.length - 1; i >= 0; i -= 1) {
    const r = rects[i];
    if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return i;
  }
  return -1;
}

let dragging = false;
let lastX = 0;
let lastY = 0;

canvas.addEventListener('pointerdown', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
  const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
  const hit = panelAt(x, y);
  if (hit === -1) return;
  state.selected = hit;
  syncZoomSlider();
  dragging = true;
  lastX = e.clientX;
  lastY = e.clientY;
  canvas.setPointerCapture(e.pointerId);
  redraw();
});
canvas.addEventListener('pointermove', (e) => {
  if (!dragging) return;
  const rect = canvas.getBoundingClientRect();
  const panel = state.panels[state.selected];
  const panelRect = LAYOUTS[state.layout].rects(canvas.width, canvas.height)[state.selected];
  panel.ox += (((e.clientX - lastX) / rect.width) * canvas.width) / panelRect.w;
  panel.oy += (((e.clientY - lastY) / rect.height) * canvas.height) / panelRect.h;
  lastX = e.clientX;
  lastY = e.clientY;
  redraw();
});
canvas.addEventListener('pointerup', () => { dragging = false; });
canvas.addEventListener('pointercancel', () => { dragging = false; });
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
  const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
  const hit = panelAt(x, y);
  if (hit === -1) return;
  state.selected = hit;
  const panel = state.panels[hit];
  panel.zoom = Math.max(1, Math.min(3, panel.zoom * (e.deltaY < 0 ? 1.1 : 0.9)));
  syncZoomSlider();
  redraw();
}, { passive: false });

/** Downloads a canvas as a PNG file. */
function downloadCanvas(exportCanvas, name) {
  return new Promise((resolve) => {
    exportCanvas.toBlob((blob) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = name;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
      resolve();
    }, 'image/png');
  });
}

export const EXPORT_SIZES = [
  { label: '1080x1080', w: 1080, h: 1080 },
  { label: '1080x1350', w: 1080, h: 1350 },
  { label: '1920x1080', w: 1920, h: 1080 },
];

/** Exports one size and names the file after it. */
async function exportSize(size) {
  const out = renderCoverToCanvas(state, size.w, size.h);
  await downloadCanvas(out, `vice-city-cover-${size.label}.png`);
  return size.label;
}

document.querySelectorAll('[data-export]').forEach((button) => {
  button.addEventListener('click', async () => {
    const size = EXPORT_SIZES.find((s) => s.label === button.dataset.export);
    const label = await exportSize(size);
    status.textContent = `Saved vice-city-cover-${label}.png`;
  });
});
document.getElementById('export-all').addEventListener('click', async () => {
  const labels = [];
  for (const size of EXPORT_SIZES) labels.push(await exportSize(size));
  status.textContent = `Saved ${labels.length} covers: ${labels.join(', ')}`;
});

window.addEventListener('resize', redraw);

const shot = new URLSearchParams(location.search).get('shot');
if (shot) {
  runShot(shot, new URLSearchParams(location.search), state, loadImage, redraw);
} else {
  Promise.all([
    document.fonts.load('40px Anton'),
    document.fonts.load('40px Pacifico'),
  ]).catch(() => {}).finally(redraw);
  redraw();
}
