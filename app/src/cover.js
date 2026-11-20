// Renders the cover: the layout's panels with their photos (cover-fit, pan and
// zoom per panel), the chosen grade, halftone / grain / vignette effects, and the
// caption in Anton with a gradient fill and a Pacifico subtitle with a neon glow.
// Everything draws at the canvas's own pixel size, so an export at 1080 x 1080
// is the same drawing at that size.
import { LAYOUTS } from './layouts.js';
import { GRADES } from './grades.js';

let noiseTile = null;
let dotTile = null;

/** A 128 px tile of random grey noise, reused for the grain effect. */
function getNoiseTile() {
  if (noiseTile) return noiseTile;
  const tile = document.createElement('canvas');
  tile.width = 128;
  tile.height = 128;
  const tctx = tile.getContext('2d');
  const data = tctx.createImageData(128, 128);
  for (let i = 0; i < data.data.length; i += 4) {
    const v = 96 + Math.floor(Math.random() * 64);
    data.data[i] = v;
    data.data[i + 1] = v;
    data.data[i + 2] = v;
    data.data[i + 3] = 255;
  }
  tctx.putImageData(data, 0, 0);
  noiseTile = tile;
  return tile;
}

/** A 14 px tile with one dark dot, reused for the halftone effect. */
function getDotTile() {
  if (dotTile) return dotTile;
  const tile = document.createElement('canvas');
  tile.width = 14;
  tile.height = 14;
  const tctx = tile.getContext('2d');
  tctx.fillStyle = '#000';
  tctx.beginPath();
  tctx.arc(7, 7, 3.4, 0, Math.PI * 2);
  tctx.fill();
  dotTile = tile;
  return tile;
}

/** Clamps a panel's pan offsets so its photo still covers the panel. */
function clampPan(panel, rect) {
  const img = panel.img;
  if (!img) return;
  const base = Math.max(rect.w / img.naturalWidth, rect.h / img.naturalHeight);
  const dw = img.naturalWidth * base * panel.zoom;
  const dh = img.naturalHeight * base * panel.zoom;
  const maxX = Math.max(0, (dw - rect.w) / 2 / rect.w);
  const maxY = Math.max(0, (dh - rect.h) / 2 / rect.h);
  panel.ox = Math.max(-maxX, Math.min(maxX, panel.ox));
  panel.oy = Math.max(-maxY, Math.min(maxY, panel.oy));
}

/** Draws one panel photo, cover-fit inside `rect`, with the panel's pan/zoom. */
function drawPanelPhoto(ctx, panel, rect, filter) {
  const img = panel.img;
  if (!img) {
    const shade = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.w, rect.y + rect.h);
    shade.addColorStop(0, '#3a1a52');
    shade.addColorStop(1, '#1c0b2c');
    ctx.fillStyle = shade;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    return;
  }
  clampPan(panel, rect);
  const base = Math.max(rect.w / img.naturalWidth, rect.h / img.naturalHeight);
  const dw = img.naturalWidth * base * panel.zoom;
  const dh = img.naturalHeight * base * panel.zoom;
  const cx = rect.x + rect.w / 2 + panel.ox * rect.w;
  const cy = rect.y + rect.h / 2 + panel.oy * rect.h;
  ctx.save();
  ctx.filter = filter;
  ctx.drawImage(img, cx - dw / 2, cy - dh / 2, dw, dh);
  ctx.restore();
}

/** Fits `text` in Anton to at most `maxWidth`, returning the font size used. */
function fitAnton(ctx, text, maxWidth, startSize) {
  let size = startSize;
  ctx.font = `${size}px Anton, sans-serif`;
  while (size > 14 && ctx.measureText(text).width > maxWidth) {
    size -= 2;
    ctx.font = `${size}px Anton, sans-serif`;
  }
  return size;
}

/** Draws the caption block: gradient Anton title, neon Pacifico subtitle. */
function drawCaption(ctx, w, h, title, subtitle) {
  const scrim = ctx.createLinearGradient(0, h * 0.62, 0, h);
  scrim.addColorStop(0, 'rgba(12, 2, 24, 0)');
  scrim.addColorStop(1, 'rgba(12, 2, 24, 0.62)');
  ctx.fillStyle = scrim;
  ctx.fillRect(0, h * 0.62, w, h * 0.38);

  const text = title.trim().toUpperCase();
  if (text) {
    const size = fitAnton(ctx, text, w * 0.92, Math.round(h * 0.115));
    const grad = ctx.createLinearGradient(w * 0.06, 0, w * 0.94, 0);
    grad.addColorStop(0, '#ff2e88');
    grad.addColorStop(0.5, '#ffb347');
    grad.addColorStop(1, '#ffe95e');
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.lineJoin = 'round';
    ctx.lineWidth = Math.max(3, size * 0.09);
    ctx.strokeStyle = '#160826';
    ctx.fillStyle = grad;
    const ty = h * 0.9;
    ctx.strokeText(text, w / 2, ty);
    ctx.fillText(text, w / 2, ty);
  }

  const sub = subtitle.trim();
  if (sub) {
    let size = Math.round(h * 0.042);
    ctx.font = `${size}px Pacifico, cursive`;
    while (size > 12 && ctx.measureText(sub).width > w * 0.8) {
      size -= 2;
      ctx.font = `${size}px Pacifico, cursive`;
    }
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ff2e88';
    ctx.shadowBlur = size * 0.7;
    ctx.fillText(sub, w / 2, h * 0.965);
    ctx.shadowBlur = 0;
  }
}

/**
 * Draws the whole cover onto `ctx` at pixel size `w` x `h`.
 * `state` holds layout, grade, effects, title, subtitle and the panel slots.
 */
export function drawCover(ctx, state, w, h) {
  const layout = LAYOUTS[state.layout] ?? LAYOUTS.grid;
  const grade = GRADES[state.grade] ?? GRADES.sunset;
  const rects = layout.rects(w, h);

  ctx.save();
  ctx.fillStyle = '#14081f';
  ctx.fillRect(0, 0, w, h);

  rects.forEach((rect, i) => {
    const panel = state.panels[i];
    if (!panel) return;
    ctx.save();
    if (rect.rot) {
      ctx.translate(rect.x + rect.w / 2, rect.y + rect.h / 2);
      ctx.rotate((rect.rot * Math.PI) / 180);
      ctx.translate(-rect.w / 2, -rect.h / 2);
      drawPanelPhoto(ctx, panel, { x: 0, y: 0, w: rect.w, h: rect.h }, grade.filter);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.92)';
      ctx.lineWidth = Math.max(3, w * 0.004);
      ctx.strokeRect(0, 0, rect.w, rect.h);
    } else {
      ctx.beginPath();
      ctx.rect(rect.x, rect.y, rect.w, rect.h);
      ctx.clip();
      drawPanelPhoto(ctx, panel, rect, grade.filter);
    }
    ctx.restore();
  });

  // Grade washes over the whole cover.
  ctx.save();
  ctx.globalCompositeOperation = 'soft-light';
  const warm = ctx.createLinearGradient(0, 0, 0, h);
  warm.addColorStop(0, grade.warm[0]);
  warm.addColorStop(1, grade.warm[1]);
  ctx.fillStyle = warm;
  ctx.fillRect(0, 0, w, h);
  const cool = ctx.createLinearGradient(0, 0, w, 0);
  cool.addColorStop(0, grade.cool[0]);
  cool.addColorStop(1, grade.cool[1]);
  ctx.fillStyle = cool;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();

  // Halftone dots, film grain, vignette.
  if (state.halftone) {
    ctx.save();
    ctx.globalAlpha = 0.16;
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = ctx.createPattern(getDotTile(), 'repeat');
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }
  if (state.grain > 0) {
    ctx.save();
    ctx.globalAlpha = (state.grain / 100) * 0.35;
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = ctx.createPattern(getNoiseTile(), 'repeat');
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }
  if (state.vignette > 0) {
    const vig = ctx.createRadialGradient(
      w / 2, h / 2, Math.min(w, h) * 0.42,
      w / 2, h / 2, Math.max(w, h) * 0.75,
    );
    vig.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vig.addColorStop(1, `rgba(0, 0, 0, ${(state.vignette / 100) * 0.55})`);
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, w, h);
  }

  // Selected panel outline in the live preview.
  if (state.selected >= 0 && state.showSelection && rects[state.selected]) {
    const r = rects[state.selected];
    ctx.save();
    ctx.strokeStyle = '#2de2c5';
    ctx.lineWidth = Math.max(3, w * 0.005);
    ctx.setLineDash([Math.max(8, w * 0.012), Math.max(6, w * 0.008)]);
    ctx.strokeRect(r.x + 2, r.y + 2, r.w - 4, r.h - 4);
    ctx.restore();
  }

  drawCaption(ctx, w, h, state.title, state.subtitle);

  // Poster frame.
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.lineWidth = Math.max(2, w * 0.003);
  ctx.strokeRect(w * 0.008, h * 0.008, w * 0.984, h * 0.984);
  ctx.restore();
}

/** Renders the cover to a fresh canvas at exactly `w` x `h` pixels. */
export function renderCoverToCanvas(state, w, h) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const clean = { ...state, showSelection: false };
  drawCover(canvas.getContext('2d'), clean, w, h);
  return canvas;
}
