// Wires the editor: layout / grade / aspect pickers, per-panel upload, fill-all and
// samples, drag-to-pan and wheel/slider zoom on the selected panel, title and
// subtitle inputs, effects toggles, and PNG export at three sizes. A `?shot=`
// query sets up a fixed scene for a screenshot instead (./shots.js).

import { drawCover } from './cover.js';
import { LAYOUTS, layoutById, layoutRects } from './layouts.js';
import { GRADES, gradeById } from './grades.js';
import { runShot } from './shots.js';

export const ASPECTS = {
  square: { w: 1080, h: 1080, label: 'Square 1080 x 1080' },
  portrait: { w: 1080, h: 1350, label: 'Portrait 1080 x 1350' },
  wide: { w: 1920, h: 1080, label: 'Wide 1920 x 1080' },
};

const state = {
  layout: 'grid',
  grade: 'sunset',
  aspect: 'square',
  panels: [],
  title: 'NEON SHORE',
  subtitle: 'one Vice City sunset',
  halftone: true,
  grain: true,
  vignette: true,
};
let selected = 0;

const canvas = document.getElementById('cover');
const status = document.getElementById('status');

function resetPanels(count) {
  const keep = state.panels.slice(0, count);
  while (keep.length < count) keep.push({ img: null, ox: 0, oy: 0, zoom: 1 });
  state.panels = keep;
  if (selected >= count) selected = 0;
}

function fitPreview() {
  const a = ASPECTS[state.aspect];
  const s = 900 / Math.max(a.w, a.h);
  canvas.width = Math.round(a.w * s);
  canvas.height = Math.round(a.h * s);
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

function redraw() {
  drawCover(canvas, state);
  syncPanelUI();
}

function syncPanelUI() {
  const p = state.panels[selected];
  const zoom = document.getElementById('zoom');
  if (zoom && p) zoom.value = String(Math.round((p.zoom || 1) * 100));
  const label = document.getElementById('panel-label');
  if (label) label.textContent = `Panel ${selected + 1} of ${state.panels.length}`;
  document.querySelectorAll('[data-panel]').forEach((b) => {
    b.classList.toggle('active', Number(b.dataset.panel) === selected);
  });
}

function panelAtPoint(x, y) {
  const rects = layoutRects(state.layout);
  for (let i = 0; i < rects.length; i++) {
    const r = rects[i];
    if (x >= r.x * canvas.width && x < (r.x + r.w) * canvas.width
      && y >= r.y * canvas.height && y < (r.y + r.h) * canvas.height) return i;
  }
  return -1;
}

function canvasPoint(e) {
  const r = canvas.getBoundingClientRect();
  return {
    x: ((e.clientX - r.left) / r.width) * canvas.width,
    y: ((e.clientY - r.top) / r.height) * canvas.height,
  };
}

let dragging = null;
canvas.addEventListener('pointerdown', (e) => {
  const p = canvasPoint(e);
  const i = panelAtPoint(p.x, p.y);
  if (i < 0) return;
  selected = i;
  dragging = { x: p.x, y: p.y, ox: state.panels[i].ox, oy: state.panels[i].oy };
  canvas.setPointerCapture(e.pointerId);
  syncPanelUI();
});
canvas.addEventListener('pointermove', (e) => {
  if (!dragging) return;
  const p = canvasPoint(e);
  const panel = state.panels[selected];
  const rect = layoutRects(state.layout)[selected];
  panel.ox = dragging.ox + (p.x - dragging.x) / (rect.w * canvas.width);
  panel.oy = dragging.oy + (p.y - dragging.y) / (rect.h * canvas.height);
  panel.ox = Math.max(-0.5, Math.min(0.5, panel.ox));
  panel.oy = Math.max(-0.5, Math.min(0.5, panel.oy));
  redraw();
});
canvas.addEventListener('pointerup', () => { dragging = null; });
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  const panel = state.panels[selected];
  if (!panel) return;
  const f = e.deltaY < 0 ? 1.1 : 1 / 1.1;
  panel.zoom = Math.max(1, Math.min(4, (panel.zoom || 1) * f));
  redraw();
}, { passive: false });

function buildButtons(el, items, activeId, onPick) {
  el.innerHTML = '';
  items.forEach((it) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = it.name;
    b.dataset.id = it.id;
    if (it.id === activeId) b.classList.add('active');
    b.addEventListener('click', () => {
      onPick(it.id);
      el.querySelectorAll('button').forEach((x) => x.classList.toggle('active', x === b));
    });
    el.appendChild(b);
  });
}

function buildUI() {
  buildButtons(document.getElementById('layouts'), LAYOUTS, state.layout, (id) => {
    state.layout = id;
    resetPanels(layoutById(id).panels);
    redraw();
  });
  buildButtons(document.getElementById('grades'), GRADES, state.grade, (id) => {
    state.grade = id;
    redraw();
  });
  buildButtons(
    document.getElementById('aspects'),
    Object.entries(ASPECTS).map(([id, a]) => ({ id, name: a.label })),
    state.aspect,
    (id) => {
      state.aspect = id;
      fitPreview();
      redraw();
    },
  );
  const panelRow = document.getElementById('panels');
  panelRow.innerHTML = '';
  state.panels.forEach((_, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = `Panel ${i + 1}`;
    b.dataset.panel = String(i);
    if (i === selected) b.classList.add('active');
    b.addEventListener('click', () => { selected = i; syncPanelUI(); });
    panelRow.appendChild(b);
  });
}

async function applyImageTo(img, indexes) {
  indexes.forEach((i) => {
    state.panels[i] = { img, ox: 0, oy: 0, zoom: 1 };
  });
  redraw();
}

document.getElementById('upload').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const img = await loadImage(URL.createObjectURL(file));
  await applyImageTo(img, [selected]);
  status.textContent = `Photo loaded into panel ${selected + 1}`;
  e.target.value = '';
});
document.getElementById('fill-all').addEventListener('click', async () => {
  const file = document.getElementById('upload').files[0];
  if (file) {
    const img = await loadImage(URL.createObjectURL(file));
    await applyImageTo(img, state.panels.map((_, i) => i));
    status.textContent = 'One photo filled every panel';
    return;
  }
  const img = await loadImage('samples/boulevard.jpg');
  await applyImageTo(img, state.panels.map((_, i) => i));
  status.textContent = 'Sample filled every panel';
});
document.getElementById('sample-boulevard').addEventListener('click', async () => {
  const img = await loadImage('samples/boulevard.jpg');
  await applyImageTo(img, [selected]);
});
document.getElementById('sample-pier').addEventListener('click', async () => {
  const img = await loadImage('samples/pier.jpg');
  await applyImageTo(img, [selected]);
});
document.getElementById('zoom').addEventListener('input', (e) => {
  const panel = state.panels[selected];
  if (!panel) return;
  panel.zoom = Math.max(1, Math.min(4, Number(e.target.value) / 100));
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
['halftone', 'grain', 'vignette'].forEach((key) => {
  document.getElementById(key).addEventListener('change', (e) => {
    state[key] = e.target.checked;
    redraw();
  });
});

function download(blob, name) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

function exportOne(key) {
  return new Promise((resolve) => {
    const a = ASPECTS[key];
    const off = document.createElement('canvas');
    off.width = a.w;
    off.height = a.h;
    drawCover(off, state);
    off.toBlob((blob) => {
      download(blob, `cover-${a.w}x${a.h}.png`);
      resolve(blob);
    }, 'image/png');
  });
}

document.getElementById('export').addEventListener('click', async () => {
  await exportOne(state.aspect);
  const a = ASPECTS[state.aspect];
  status.textContent = `Saved cover-${a.w}x${a.h}.png`;
});
document.getElementById('export-all').addEventListener('click', async () => {
  for (const key of Object.keys(ASPECTS)) await exportOne(key);
  status.textContent = 'Saved 3 covers';
});

// Test hook: the live state, serialised without the image elements.
window.__vice = {
  get state() {
    return {
      layout: state.layout,
      grade: state.grade,
      aspect: state.aspect,
      title: state.title,
      subtitle: state.subtitle,
      halftone: state.halftone,
      grain: state.grain,
      vignette: state.vignette,
      selected,
      panels: state.panels.map((p) => ({
        hasImage: !!p.img, ox: p.ox, oy: p.oy, zoom: p.zoom,
      })),
    };
  },
  setLayout(id) { state.layout = id; resetPanels(layoutById(id).panels); buildUI(); redraw(); },
  setGrade(id) { state.grade = id; buildUI(); redraw(); },
  setAspect(id) { state.aspect = id; fitPreview(); buildUI(); redraw(); },
  setTitle(t) { state.title = t; document.getElementById('title').value = t; redraw(); },
  redraw,
};

resetPanels(layoutById(state.layout).panels);
fitPreview();
buildUI();

const params = new URLSearchParams(location.search);
const shot = params.get('shot');
if (shot) {
  runShot(shot, params, {
    loadImage,
    applyImageTo,
    setPanels(list) {
      list.forEach((p, i) => {
        if (!state.panels[i]) return;
        if (typeof p.ox === 'number') state.panels[i].ox = p.ox;
        if (typeof p.oy === 'number') state.panels[i].oy = p.oy;
        if (typeof p.zoom === 'number') state.panels[i].zoom = p.zoom;
      });
      redraw();
    },
    setState(patch) {
      Object.assign(state, patch);
      if (patch.layout) resetPanels(layoutById(patch.layout).panels);
      if (patch.aspect) fitPreview();
      buildUI();
      redraw();
    },
    fitPreview,
    redraw,
    canvas,
  });
} else {
  redraw();
}
