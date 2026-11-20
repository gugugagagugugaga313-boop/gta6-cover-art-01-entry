// Draws the whole cover onto a canvas 2D context at the canvas's own size:
// the layout's panels with their photos (panned and zoomed), the grade,
// halftone, grain and vignette, then the Anton title and Pacifico subtitle.
import { LAYOUTS } from './layouts.js';
import { GRADES } from './grades.js';

let grainTile = null;

/** A small tile of random grey noise, reused for the grain overlay. */
function grainCanvas() {
  if (grainTile) return grainTile;
  const t = document.createElement('canvas');
  t.width = 128;
  t.height = 128;
  const c = t.getContext('2d');
  const img = c.createImageData(128, 128);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 110 + Math.floor(Math.random() * 90);
    img.data[i] = v;
    img.data[i + 1] = v;
    img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  c.putImageData(img, 0, 0);
  grainTile = t;
  return t;
}

/** Draws one photo into a panel rect, cover-fit, panned by ox/oy and zoomed. */
function drawPanelPhoto(ctx, photo, rect, ox, oy, zoom) {
  if (!photo || !photo.img) return;
  const iw = photo.img.naturalWidth;
  const ih = photo.img.naturalHeight;
  const base = Math.max(rect.w / iw, rect.h / ih);
  const scale = base * zoom;
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = rect.x + (rect.w - dw) / 2 + ox * rect.w;
  const dy = rect.y + (rect.h - dh) / 2 + oy * rect.h;
  ctx.drawImage(photo.img, dx, dy, dw, dh);
}

/** Paints a vertical gradient overlay, clipped to a rect. */
function paintOverlay(ctx, rect, stops) {
  const g = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h);
  for (const s of stops) g.addColorStop(s.at, s.color);
  ctx.fillStyle = g;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
}

/** Halftone dots across the whole cover, faint, like cheap print. Kept light
 * so faces stay clean: the dots read as print texture, not dirt. */
function paintHalftone(ctx, w, h) {
  const step = Math.max(10, Math.round(w / 110));
  ctx.fillStyle = 'rgba(0, 0, 0, 0.13)';
  for (let y = step / 2; y < h; y += step) {
    for (let x = step / 2; x < w; x += step) {
      ctx.beginPath();
      ctx.arc(x, y, step * 0.11, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

/**
 * Draws the cover. `state` holds layout, grade, title, subtitle, the effect
 * toggles, and panels: [{ img, ox, oy, zoom }] by panel index. Returns the
 * panel rects it used, so the editor can hit-test clicks and drags.
 */
export function drawCover(canvas, state) {
  const ctx = canvas.getContext('2d');
  const { width: w, height: h } = canvas;
  const layout = LAYOUTS[state.layout] ?? LAYOUTS.grid;
  const grade = GRADES[state.grade] ?? GRADES.sunset;
  const rects = layout.rects(w, h);

  ctx.fillStyle = '#14081f';
  ctx.fillRect(0, 0, w, h);

  rects.forEach((rect, i) => {
    const panel = state.panels[i] ?? {};
    ctx.save();
    ctx.beginPath();
    ctx.rect(rect.x, rect.y, rect.w, rect.h);
    ctx.clip();
    if (rect.tilt) {
      ctx.translate(rect.x + rect.w / 2, rect.y + rect.h / 2);
      ctx.rotate((rect.tilt * Math.PI) / 180);
      ctx.translate(-(rect.x + rect.w / 2), -(rect.y + rect.h / 2));
    }
    ctx.fillStyle = '#241335';
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.filter = grade.filter;
    drawPanelPhoto(ctx, panel, rect, panel.ox ?? 0, panel.oy ?? 0, panel.zoom ?? 1);
    ctx.filter = 'none';
    paintOverlay(ctx, rect, grade.overlay);
    ctx.restore();
    ctx.strokeStyle = 'rgba(20, 8, 31, 0.9)';
    ctx.lineWidth = Math.max(2, Math.min(w, h) * 0.008);
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
  });

  if (state.halftone) paintHalftone(ctx, w, h);
  if (state.grain) {
    ctx.save();
    ctx.globalAlpha = 0.07;
    ctx.fillStyle = ctx.createPattern(grainCanvas(), 'repeat');
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }
  if (state.vignette) {
    const v = ctx.createRadialGradient(
      w / 2, h / 2, Math.min(w, h) * 0.42,
      w / 2, h / 2, Math.max(w, h) * 0.75,
    );
    v.addColorStop(0, 'rgba(0, 0, 0, 0)');
    v.addColorStop(1, 'rgba(0, 0, 0, 0.45)');
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, w, h);
  }

  // Caption: gradient Anton title, neon Pacifico subtitle above it.
  const title = (state.title ?? '').trim().toUpperCase();
  const subtitle = (state.subtitle ?? '').trim();
  const band = h * 0.16;
  if (subtitle) {
    let size = h * 0.045;
    ctx.font = `${size}px Pacifico, cursive`;
    while (ctx.measureText(subtitle).width > w * 0.86 && size > 10) {
      size -= 1;
      ctx.font = `${size}px Pacifico, cursive`;
    }
    ctx.textAlign = 'center';
    ctx.fillStyle = '#7df9ff';
    ctx.shadowColor = '#ff2bd6';
    ctx.shadowBlur = size * 0.55;
    ctx.fillText(subtitle, w / 2, h - band + size * 0.4);
    ctx.shadowBlur = 0;
  }
  if (title) {
    let size = h * 0.11;
    ctx.font = `${size}px Anton, sans-serif`;
    while (ctx.measureText(title).width > w * 0.92 && size > 12) {
      size -= 2;
      ctx.font = `${size}px Anton, sans-serif`;
    }
    const grad = ctx.createLinearGradient(0, h - band, 0, h - band * 0.12);
    grad.addColorStop(0, '#ffe259');
    grad.addColorStop(0.5, '#ff7e5f');
    grad.addColorStop(1, '#ff2bd6');
    ctx.textAlign = 'center';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(20, 8, 31, 0.95)';
    ctx.lineWidth = Math.max(3, size * 0.09);
    ctx.strokeText(title, w / 2, h - band * 0.12);
    ctx.fillStyle = grad;
    ctx.fillText(title, w / 2, h - band * 0.12);
  }
  return rects;
}

/** Renders the cover at an exact export size and resolves to a PNG blob. */
export function renderExport(state, width, height) {
  const off = document.createElement('canvas');
  off.width = width;
  off.height = height;
  drawCover(off, state);
  return new Promise((resolve) => off.toBlob(resolve, 'image/png'));
}
