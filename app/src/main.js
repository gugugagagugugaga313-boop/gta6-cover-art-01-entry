// Vice City Cover Studio: wires the editor. State holds the layout, grade,
// export size, caption and one photo slot per panel (image, pan, zoom).
// The preview canvas redraws on every change; exports render the same state
// at an exact post size. `?shot=` loads a fixed scene for screenshots.
import { drawCover, renderExport } from './cover.js';
import { runShot } from './shots.js';
import { LAYOUTS, LAYOUT_ORDER } from './layouts.js';
import { GRADES, GRADE_ORDER } from './grades.js';

export const SIZES = {
  square: { name: 'Square', w: 1080, h: 1080 },
  portrait: { name: 'Portrait', w: 1080, h: 1350 },
  wide: { name: 'Wide', w: 1920, h: 1080 },
};

const state = {
  layout: 'grid',
  grade: 'sunset',
  size: 'square',
  title: 'Vice City',
  subtitle: 'sunset drive',
  halftone: true,
  grain: true,
  vignette: true,
  panels: Array.from({ length: 5 }, () => ({ img: null, ox: 0, oy: 0, zoom: 1 })),
};

const canvas = document.getElementById('cover');
const statusEl = document.getElementById('status');
let rects = [];
let selected = 0;
let fontsReady = false;

document.fonts.load('16px Anton').then(() => document.fonts.load('16px Pacifico'))
  .then(() => { fontsReady = true; redraw(); })
  .catch(() => { fontsReady = true; redraw(); });

/** Preview canvas size for an export size (half scale, capped). In a
 * cover-only shot the canvas renders at the full viewport, so the screenshot
 * frame is filled edge to edge instead of floating in dark space. */
function previewSize() {
  if (document.body.classList.contains('shot-cover')) {
    return { w: window.innerWidth, h: window.innerHeight };
  }
  const s = SIZES[state.size];
  const k = Math.min(720 / s.w, 720 / s.h);
  return { w: Math.round(s.w * k), h: Math.round(s.h * k) };
}

function redraw() {
  const p = previewSize();
  if (canvas.width !== p.w || canvas.height !== p.h) {
    canvas.width = p.w;
    canvas.height = p.h;
  }
  rects = drawCover(canvas, state);
}

/** Loads an image from a URL, resolving to the image once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function setStatus(text) {
  statusEl.textContent = text;
}

function panelCount() {
  return LAYOUTS[state.layout].panels;
}

function buildPicker(el, items, current, onPick) {
  el.innerHTML = '';
  for (const [id, label] of items) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = label;
    b.dataset.id = id;
    b.classList.toggle('on', id === current);
    b.addEventListener('click', () => { onPick(id); buildAll(); redraw(); });
    el.appendChild(b);
  }
}

function buildPanels() {
  const list = document.getElementById('panels');
  list.innerHTML = '';
  for (let i = 0; i < panelCount(); i++) {
    const row = document.createElement('div');
    row.className = 'panel-row' + (i === selected ? ' sel' : '');
    const name = document.createElement('span');
    name.textContent = `Panel ${i + 1}${state.panels[i].img ? ' ✓' : ''}`;
    const file = document.createElement('input');
    file.type = 'file';
    file.accept = 'image/*';
    file.dataset.panel = String(i);
    file.addEventListener('change', async (e) => {
      const f = e.target.files[0];
      if (!f) return;
      state.panels[i].img = await loadImage(URL.createObjectURL(f));
      state.panels[i].ox = 0;
      state.panels[i].oy = 0;
      state.panels[i].zoom = 1;
      selected = i;
      buildAll();
      redraw();
    });
    const zoom = document.createElement('input');
    zoom.type = 'range';
    zoom.min = '100';
    zoom.max = '300';
    zoom.value = String(Math.round((state.panels[i].zoom ?? 1) * 100));
    zoom.title = 'Zoom';
    zoom.addEventListener('input', () => {
      state.panels[i].zoom = Number(zoom.value) / 100;
      redraw();
    });
    const sample = document.createElement('button');
    sample.type = 'button';
    sample.textContent = 'Sample';
    sample.addEventListener('click', async () => {
      state.panels[i].img = await loadImage(`samples/${i % 2 ? 'pier' : 'boulevard'}.jpg`);
      selected = i;
      buildAll();
      redraw();
    });
    row.append(name, file, zoom, sample);
    row.addEventListener('click', (e) => {
      if (e.target === row || e.target === name) { selected = i; buildAll(); redraw(); }
    });
    list.appendChild(row);
  }
}

function buildAll() {
  buildPicker(
    document.getElementById('layouts'),
    LAYOUT_ORDER.map((id) => [id, LAYOUTS[id].name]),
    state.layout,
    (id) => { state.layout = id; selected = 0; },
  );
  buildPicker(
    document.getElementById('sizes'),
    Object.entries(SIZES).map(([id, s]) => [id, `${s.name} ${s.w}×${s.h}`]),
    state.size,
    (id) => { state.size = id; },
  );
  buildPicker(
    document.getElementById('grades'),
    GRADE_ORDER.map((id) => [id, GRADES[id].name]),
    state.grade,
    (id) => { state.grade = id; },
  );
  buildPanels();
}

function download(blob, name) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

async function exportOne(sizeKey) {
  const s = SIZES[sizeKey];
  const blob = await renderExport(state, s.w, s.h);
  download(blob, `vice-city-${s.w}x${s.h}.png`);
  window.__vice.lastExport = { w: s.w, h: s.h, bytes: blob.size };
  setStatus(`Saved vice-city-${s.w}x${s.h}.png`);
}

document.getElementById('title').addEventListener('input', (e) => { state.title = e.target.value; redraw(); });
document.getElementById('subtitle').addEventListener('input', (e) => { state.subtitle = e.target.value; redraw(); });
for (const [id, key] of [['fx-halftone', 'halftone'], ['fx-grain', 'grain'], ['fx-vignette', 'vignette']]) {
  document.getElementById(id).addEventListener('change', (e) => { state[key] = e.target.checked; redraw(); });
}
document.getElementById('fill-all').addEventListener('click', async () => {
  const src = state.panels[selected].img ?? await loadImage('samples/boulevard.jpg');
  for (let i = 0; i < panelCount(); i++) {
    state.panels[i].img = src;
    state.panels[i].ox = 0;
    state.panels[i].oy = 0;
    state.panels[i].zoom = 1;
  }
  buildAll();
  redraw();
  setStatus('Filled all panels');
});
document.getElementById('export-all').addEventListener('click', async () => {
  for (const key of Object.keys(SIZES)) {
    const s = SIZES[key];
    const blob = await renderExport(state, s.w, s.h);
    download(blob, `vice-city-${s.w}x${s.h}.png`);
    window.__vice.lastExport = { w: s.w, h: s.h, bytes: blob.size };
  }
  setStatus('Saved 3 covers');
});
for (const key of Object.keys(SIZES)) {
  document.getElementById(`export-${key}`).addEventListener('click', () => exportOne(key));
}

// Drag to pan the selected panel, wheel to zoom it, click to select one.
let drag = null;
function canvasPoint(e) {
  const r = canvas.getBoundingClientRect();
  return {
    x: ((e.clientX - r.left) / r.width) * canvas.width,
    y: ((e.clientY - r.top) / r.height) * canvas.height,
  };
}
function hitPanel(p) {
  for (let i = rects.length - 1; i >= 0; i--) {
    const r = rects[i];
    if (p.x >= r.x && p.x < r.x + r.w && p.y >= r.y && p.y < r.y + r.h) return i;
  }
  return -1;
}
canvas.addEventListener('pointerdown', (e) => {
  const p = canvasPoint(e);
  const i = hitPanel(p);
  if (i < 0) return;
  selected = i;
  drag = { x: p.x, y: p.y, ox: state.panels[i].ox, oy: state.panels[i].oy };
  canvas.setPointerCapture(e.pointerId);
  buildAll();
  redraw();
});
canvas.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const p = canvasPoint(e);
  const r = rects[selected];
  const panel = state.panels[selected];
  panel.ox = drag.ox + (p.x - drag.x) / r.w;
  panel.oy = drag.oy + (p.y - drag.y) / r.h;
  redraw();
});
canvas.addEventListener('pointerup', () => { drag = null; });
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  const panel = state.panels[selected];
  panel.zoom = Math.min(3, Math.max(1, panel.zoom * Math.pow(1.1, -e.deltaY / 100)));
  buildAll();
  redraw();
}, { passive: false });

window.__vice = {
  state,
  get selected() { return selected; },
  get rects() { return rects; },
  get fontsReady() { return fontsReady; },
  lastExport: null,
  redraw,
};

buildAll();
const params = new URLSearchParams(location.search);
const shot = params.get('shot');
if (shot) {
  runShot(shot, params, async (patch) => {
    state.layout = patch.layout;
    state.grade = patch.grade;
    state.size = patch.size;
    state.title = patch.title;
    state.subtitle = patch.subtitle;
    state.halftone = patch.halftone;
    state.grain = patch.grain;
    state.vignette = patch.vignette;
    for (const id of ['fx-halftone', 'fx-grain', 'fx-vignette']) {
      document.getElementById(id).checked = state[{ 'fx-halftone': 'halftone', 'fx-grain': 'grain', 'fx-vignette': 'vignette' }[id]];
    }
    document.getElementById('title').value = state.title;
    document.getElementById('subtitle').value = state.subtitle;
    for (let i = 0; i < patch.photos.length; i++) {
      state.panels[i].img = await loadImage(`samples/${patch.photos[i]}.jpg`);
      state.panels[i].zoom = patch.zoom?.[i] ?? 1;
    }
    if (patch.coverOnly) document.body.classList.add('shot-cover');
    buildAll();
    redraw();
  });
} else {
  redraw();
}
