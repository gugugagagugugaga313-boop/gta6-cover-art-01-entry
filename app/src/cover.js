// Draws the cover: the layout's panels (each photo panned and zoomed), the grade
// filter and tint, halftone / grain / vignette overlays, and the Anton title with
// its Pacifico subtitle. A panel is { img, ox, oy, zoom }: ox/oy are the photo's
// centre offset as a fraction of the panel, zoom is a multiplier on cover-fit.

import { layoutRects } from './layouts.js';
import { gradeById } from './grades.js';

/** Small seeded RNG so grain and halftone are stable between draws. */
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Draws the whole cover onto `canvas` (its width/height are the output size).
 * `state` is { layout, grade, panels, title, subtitle, halftone, grain, vignette }.
 */
export function drawCover(canvas, state) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const grade = gradeById(state.grade);
  const rects = layoutRects(state.layout);
  const gap = Math.max(2, Math.round(Math.min(w, h) * 0.008));

  ctx.save();
  ctx.fillStyle = '#160a20';
  ctx.fillRect(0, 0, w, h);

  rects.forEach((rect, i) => {
    const panel = state.panels[i];
    const px = rect.x * w;
    const py = rect.y * h;
    const pw = rect.w * w;
    const ph = rect.h * h;
    ctx.save();
    ctx.beginPath();
    ctx.rect(px, py, pw, ph);
    ctx.clip();
    if (rect.rot) {
      ctx.translate(px + pw / 2, py + ph / 2);
      ctx.rotate((rect.rot * Math.PI) / 180);
      ctx.translate(-(px + pw / 2), -(py + ph / 2));
    }
    if (panel && panel.img) {
      const img = panel.img;
      const base = Math.max(pw / img.naturalWidth, ph / img.naturalHeight);
      const scale = base * (panel.zoom || 1);
      const dw = img.naturalWidth * scale;
      const dh = img.naturalHeight * scale;
      const cx = px + pw / 2 + (panel.ox || 0) * pw;
      const cy = py + ph / 2 + (panel.oy || 0) * ph;
      ctx.filter = grade.filter;
      ctx.drawImage(img, cx - dw / 2, cy - dh / 2, dw, dh);
      ctx.filter = 'none';
    } else {
      // Empty panel: a dark violet placeholder with a thin neon frame.
      ctx.fillStyle = '#241533';
      ctx.fillRect(px, py, pw, ph);
      ctx.strokeStyle = 'rgba(255, 110, 200, 0.55)';
      ctx.lineWidth = Math.max(2, gap / 2);
      ctx.strokeRect(px + gap, py + gap, pw - gap * 2, ph - gap * 2);
    }
    ctx.restore();
  });

  // Grade tint washed over the whole cover.
  const tint = ctx.createLinearGradient(0, 0, 0, h);
  tint.addColorStop(0, grade.tintTop);
  tint.addColorStop(1, grade.tintBottom);
  ctx.fillStyle = tint;
  ctx.fillRect(0, 0, w, h);

  if (state.halftone) drawHalftone(ctx, w, h);
  if (state.grain) drawGrain(ctx, w, h);
  if (state.vignette) drawVignette(ctx, w, h);

  // Panel gaps: thin dark seams so the layout reads as separate frames.
  ctx.fillStyle = '#160a20';
  rects.forEach((rect) => {
    if (rect.x > 0) ctx.fillRect(rect.x * w - gap / 2, 0, gap, h);
    if (rect.y > 0) ctx.fillRect(0, rect.y * h - gap / 2, w, gap);
  });

  drawTitles(ctx, w, h, state);
  ctx.restore();
}

function drawHalftone(ctx, w, h) {
  const step = Math.max(10, Math.round(Math.min(w, h) / 90));
  const r = step * 0.11;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.10)';
  for (let y = step / 2; y < h; y += step) {
    for (let x = step / 2; x < w; x += step) {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawGrain(ctx, w, h) {
  const rng = mulberry32(1337);
  const n = Math.floor((w * h) / 900);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
  for (let i = 0; i < n; i++) {
    const s = 1 + rng() * 2;
    ctx.fillRect(rng() * w, rng() * h, s, s);
  }
  ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
  for (let i = 0; i < n; i++) {
    const s = 1 + rng() * 2;
    ctx.fillRect(rng() * w, rng() * h, s, s);
  }
}

function drawVignette(ctx, w, h) {
  const g = ctx.createRadialGradient(
    w / 2, h / 2, Math.min(w, h) * 0.42,
    w / 2, h / 2, Math.max(w, h) * 0.72,
  );
  g.addColorStop(0, 'rgba(0, 0, 0, 0)');
  g.addColorStop(1, 'rgba(0, 0, 0, 0.42)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function drawTitles(ctx, w, h, state) {
  const title = (state.title || '').trim().toUpperCase();
  const subtitle = (state.subtitle || '').trim();
  const band = h * 0.24;
  const scrim = ctx.createLinearGradient(0, h - band * 1.5, 0, h);
  scrim.addColorStop(0, 'rgba(10, 4, 18, 0)');
  scrim.addColorStop(1, 'rgba(10, 4, 18, 0.72)');
  ctx.fillStyle = scrim;
  ctx.fillRect(0, h - band * 1.5, w, band * 1.5);

  if (subtitle) {
    let sub = Math.min(h * 0.045, w * 0.045);
    ctx.font = `${sub}px Pacifico, cursive`;
    while (ctx.measureText(subtitle).width > w * 0.86 && sub > 10) {
      sub -= 1;
      ctx.font = `${sub}px Pacifico, cursive`;
    }
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffd7f2';
    ctx.shadowColor = '#ff2e9a';
    ctx.shadowBlur = sub * 0.9;
    ctx.fillText(subtitle, w / 2, h - band * 0.62);
    ctx.shadowBlur = 0;
  }

  if (title) {
    let size = h * 0.115;
    ctx.font = `${size}px Anton, sans-serif`;
    while (ctx.measureText(title).width > w * 0.9 && size > 14) {
      size -= 2;
      ctx.font = `${size}px Anton, sans-serif`;
    }
    const grad = ctx.createLinearGradient(0, h - band, 0, h - band * 0.1);
    grad.addColorStop(0, '#ffe259');
    grad.addColorStop(0.5, '#ff7e5f');
    grad.addColorStop(1, '#ff2e9a');
    ctx.textAlign = 'center';
    ctx.fillStyle = grad;
    ctx.strokeStyle = 'rgba(20, 4, 24, 0.85)';
    ctx.lineWidth = Math.max(2, size * 0.08);
    ctx.lineJoin = 'round';
    const ty = h - band * 0.14;
    ctx.strokeText(title, w / 2, ty);
    ctx.fillText(title, w / 2, ty);
  }
}
