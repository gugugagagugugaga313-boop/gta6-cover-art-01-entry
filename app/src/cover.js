// Vice City Cover Studio — cover drawing engine.
// One shared function draws every cover: the live preview and the
// exported PNGs all go through drawCover, so what you see is what
// you share. Layouts, colour grades, lettering and grain are all
// drawn with Canvas 2D code — no photo filter library, no artwork
// borrowed from anywhere.

/** The five panel layouts, each with its panel count. */
export const LAYOUTS = {
  grid: { name: 'Vice Grid', panels: 4 },
  hero: { name: 'Hero + Three', panels: 4 },
  fullbleed: { name: 'Full Bleed', panels: 1 },
  strip: { name: 'Sunset Strip', panels: 3 },
  tilted: { name: 'Tilted Stack', panels: 3 },
};

/** The five Vice City colour grades. */
export const GRADES = {
  sunset: {
    name: 'Vice Sunset',
    photo: 'saturate(1.35) contrast(1.1) brightness(1.02)',
    wash: ['rgba(255,94,31,0.28)', 'rgba(255,0,110,0.34)', 'rgba(40,0,80,0.30)'],
    sun: '#ffd166',
  },
  neon: {
    name: 'Neon Night',
    photo: 'saturate(1.5) contrast(1.15) brightness(0.95)',
    wash: ['rgba(255,0,153,0.30)', 'rgba(0,229,255,0.26)', 'rgba(20,0,60,0.38)'],
    sun: '#ff2fb3',
  },
  gold: {
    name: 'Palm Gold',
    photo: 'saturate(1.2) contrast(1.06) brightness(1.06) sepia(0.25)',
    wash: ['rgba(255,183,0,0.30)', 'rgba(255,120,0,0.22)', 'rgba(60,20,0,0.26)'],
    sun: '#ffe9a8',
  },
  ocean: {
    name: 'Ocean Drive',
    photo: 'saturate(1.3) contrast(1.08) brightness(1.0)',
    wash: ['rgba(0,229,255,0.24)', 'rgba(0,120,200,0.26)', 'rgba(0,20,60,0.30)'],
    sun: '#aef3ff',
  },
  noir: {
    name: 'Noir Chrome',
    photo: 'grayscale(1) contrast(1.25) brightness(1.02)',
    wash: ['rgba(255,255,255,0.10)', 'rgba(0,0,0,0.22)', 'rgba(0,0,0,0.34)'],
    sun: '#f2f2f2',
  },
};

/** The three caption lettering themes (title gradient stops). */
export const THEMES = {
  sunset: { name: 'Sunset Ink', stops: ['#fff7d6', '#ffb347', '#ff2e88'] },
  neon: { name: 'Neon Pop', stops: ['#ffffff', '#ff5ce1', '#00e5ff'] },
  gold: { name: 'Gold Leaf', stops: ['#fffbe0', '#ffd166', '#ff8c00'] },
};

/** The three post sizes the app exports. */
export const SIZES = {
  square: { name: 'Square', w: 1080, h: 1080 },
  portrait: { name: 'Portrait', w: 1080, h: 1350 },
  landscape: { name: 'Landscape', w: 1920, h: 1080 },
};

const GUTTER = 0.012;

/** Returns the panel rectangles (pixels) for a layout and title spot. */
export function layoutPanels(w, h, layout, titlePos) {
  const g = Math.min(w, h) * GUTTER;
  const titleH = h * 0.24;
  const top = titlePos === 'top' ? titleH : 0;
  const bodyH = h - titleH;
  switch (layout) {
    case 'grid': {
      const cw = (w - g * 3) / 2;
      const ch = (bodyH - g * 3) / 2;
      return [
        { x: g, y: top + g, w: cw, h: ch },
        { x: g * 2 + cw, y: top + g, w: cw, h: ch },
        { x: g, y: top + g * 2 + ch, w: cw, h: ch },
        { x: g * 2 + cw, y: top + g * 2 + ch, w: cw, h: ch },
      ];
    }
    case 'hero': {
      const small = (w - g * 4) / 3;
      const sh = bodyH * 0.3;
      return [
        { x: g, y: top + g, w: w - g * 2, h: bodyH - sh - g * 2 },
        { x: g, y: top + bodyH - sh - g, w: small, h: sh },
        { x: g * 2 + small, y: top + bodyH - sh - g, w: small, h: sh },
        { x: g * 3 + small * 2, y: top + bodyH - sh - g, w: small, h: sh },
      ];
    }
    case 'fullbleed':
      return [{ x: 0, y: top, w, h: bodyH }];
    case 'strip': {
      const cw = (w - g * 4) / 3;
      return [
        { x: g, y: top + g, w: cw, h: bodyH - g * 2 },
        { x: g * 2 + cw, y: top + g, w: cw, h: bodyH - g * 2 },
        { x: g * 3 + cw * 2, y: top + g, w: cw, h: bodyH - g * 2 },
      ];
    }
    case 'tilted': {
      const cw = w * 0.52;
      const ch = bodyH * 0.62;
      return [
        { x: w * 0.06, y: top + bodyH * 0.04, w: cw, h: ch, tilt: -0.07 },
        { x: w * 0.42, y: top + bodyH * 0.10, w: cw, h: ch, tilt: 0.05 },
        { x: w * 0.24, y: top + bodyH * 0.30, w: cw, h: ch, tilt: -0.02 },
      ];
    }
    default:
      return layoutPanels(w, h, 'grid', titlePos);
  }
}

/** Draws one photo cover-fit into a rectangle, honouring pan/zoom. */
export function drawPhotoInto(ctx, img, rect, zoom, ox, oy) {
  if (!img) return false;
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  const base = Math.max(rect.w / iw, rect.h / ih);
  const scale = base * (zoom || 1);
  const dw = iw * scale;
  const dh = ih * scale;
  const cx = rect.x + rect.w / 2 + (ox || 0) * rect.w;
  const cy = rect.y + rect.h / 2 + (oy || 0) * rect.h;
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  ctx.drawImage(img, cx - dw / 2, cy - dh / 2, dw, dh);
  ctx.restore();
  return true;
}

/**
 * Draws one photo into a wide rectangle the poster way: a blurred
 * cover-fit backdrop fills the frame, then the sharp photo sits
 * inside it contain-fit, so a portrait photo never loses its subject
 * to a wide crop.
 */
export function drawPhotoBackdropFit(ctx, img, rect, zoom, ox, oy) {
  if (!img) return false;
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  // Blurred backdrop, cover-fit.
  ctx.save();
  ctx.filter = 'blur(18px) brightness(0.65) saturate(1.3)';
  const base = Math.max(rect.w / iw, rect.h / ih);
  ctx.drawImage(img, rect.x + rect.w / 2 - (iw * base) / 2, rect.y + rect.h / 2 - (ih * base) / 2, iw * base, ih * base);
  ctx.restore();
  // Sharp photo, contain-fit, honouring pan/zoom.
  const fit = Math.min(rect.w / iw, rect.h / ih) * (zoom || 1);
  const dw = iw * fit;
  const dh = ih * fit;
  const cx = rect.x + rect.w / 2 + (ox || 0) * rect.w;
  const cy = rect.y + rect.h / 2 + (oy || 0) * rect.h;
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = rect.w * 0.02;
  ctx.shadowOffsetY = rect.w * 0.006;
  ctx.drawImage(img, cx - dw / 2, cy - dh / 2, dw, dh);
  ctx.restore();
  return true;
}

/** A tiny generated grain tile, cached per document. */
let grainTile = null;
export function makeGrainTile() {
  if (grainTile) return grainTile;
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 128;
  const g = c.getContext('2d');
  const data = g.createImageData(128, 128);
  for (let i = 0; i < data.data.length; i += 4) {
    const v = Math.floor(Math.random() * 255);
    data.data[i] = v;
    data.data[i + 1] = v;
    data.data[i + 2] = v;
    data.data[i + 3] = 22;
  }
  g.putImageData(data, 0, 0);
  grainTile = c;
  return grainTile;
}

/** Draws a code-drawn palm silhouette, trunk plus fronds. */
export function drawPalm(ctx, x, y, s, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = s * 0.07;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + s * 0.08, y - s * 0.55, x + s * 0.22, y - s * 0.95);
  ctx.stroke();
  const topX = x + s * 0.22;
  const topY = y - s * 0.95;
  for (let i = 0; i < 6; i++) {
    const a = Math.PI * (0.08 + i * 0.16);
    const len = s * (0.42 + (i % 2) * 0.12);
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.quadraticCurveTo(
      topX + Math.cos(a) * len * 0.6,
      topY - Math.sin(a) * len * 0.35 - s * 0.12,
      topX + Math.cos(a) * len,
      topY - Math.sin(a) * len * 0.5 + s * 0.22,
    );
    ctx.stroke();
  }
  ctx.restore();
}

/** Draws the halftone dot field over the lower half of the cover. */
export function drawHalftone(ctx, w, h, step) {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.20)';
  for (let y = h * 0.55; y < h; y += step) {
    const row = Math.round((y - h * 0.55) / step);
    for (let x = (row % 2) * step * 0.5; x < w; x += step) {
      const r = step * 0.16 * (0.6 + 0.4 * ((y - h * 0.55) / (h * 0.45)));
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

/** Fits a font size so the text fits the given width. */
export function fitFont(ctx, text, font, maxWidth, startSize) {
  let size = startSize;
  ctx.font = font(size);
  while (size > 12 && ctx.measureText(text).width > maxWidth) {
    size -= 2;
    ctx.font = font(size);
  }
  return size;
}

/**
 * Draws the whole cover onto a canvas at its own size.
 * state: { layout, grade, title, subtitle, titlePos, titleSize,
 *          theme, halftone, panels: [{img, zoom, ox, oy}] }
 */
export function drawCover(canvas, state) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const grade = GRADES[state.grade] || GRADES.sunset;
  const theme = THEMES[state.theme] || THEMES.sunset;
  const titlePos = state.titlePos === 'top' ? 'top' : 'bottom';
  const rects = layoutPanels(w, h, state.layout, titlePos);
  const titleH = h * 0.24;
  const titleTop = titlePos === 'top' ? 0 : h - titleH;
  const bodyTop = titlePos === 'top' ? titleH : 0;
  const bodyH = h - titleH;

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#14061f';
  ctx.fillRect(0, 0, w, h);

  // Photo panels, each with the grade's photo filter.
  ctx.save();
  ctx.filter = grade.photo;
  rects.forEach((rect, i) => {
    const panel = (state.panels || [])[i] || {};
    if (rect.tilt) {
      ctx.save();
      ctx.translate(rect.x + rect.w / 2, rect.y + rect.h / 2);
      ctx.rotate(rect.tilt);
      ctx.translate(-rect.w / 2, -rect.h / 2);
      const inner = { x: 0, y: 0, w: rect.w, h: rect.h };
      if (!drawPhotoInto(ctx, panel.img, inner, panel.zoom, panel.ox, panel.oy)) {
        ctx.fillStyle = '#2a1240';
        ctx.fillRect(0, 0, rect.w, rect.h);
      }
      ctx.restore();
      // Snapshot white border and shadow.
      ctx.save();
      ctx.translate(rect.x + rect.w / 2, rect.y + rect.h / 2);
      ctx.rotate(rect.tilt);
      ctx.shadowColor = 'rgba(0,0,0,0.55)';
      ctx.shadowBlur = w * 0.02;
      ctx.shadowOffsetY = w * 0.008;
      ctx.strokeStyle = '#fff8ee';
      ctx.lineWidth = Math.max(4, w * 0.008);
      ctx.strokeRect(-rect.w / 2, -rect.h / 2, rect.w, rect.h);
      ctx.restore();
    } else {
      ctx.save();
      // The hero panel is wide: a portrait photo gets the blurred
      // backdrop treatment so its subject is never cropped away.
      const fitted = state.layout === 'hero' && i === 0
        ? drawPhotoBackdropFit(ctx, panel.img, rect, panel.zoom, panel.ox, panel.oy)
        : drawPhotoInto(ctx, panel.img, rect, panel.zoom, panel.ox, panel.oy);
      if (!fitted) {
        ctx.fillStyle = '#2a1240';
        ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
        ctx.strokeStyle = 'rgba(255,255,255,0.35)';
        ctx.lineWidth = Math.max(2, w * 0.002);
        ctx.setLineDash([w * 0.012, w * 0.008]);
        ctx.strokeRect(rect.x + 4, rect.y + 4, rect.w - 8, rect.h - 8);
        ctx.setLineDash([]);
      }
      ctx.restore();
    }
  });
  ctx.restore();
  ctx.filter = 'none';

  // Sunset / neon wash over the photo area.
  const wash = ctx.createLinearGradient(0, bodyTop, 0, bodyTop + bodyH);
  wash.addColorStop(0, grade.wash[0]);
  wash.addColorStop(0.55, grade.wash[1]);
  wash.addColorStop(1, grade.wash[2]);
  ctx.fillStyle = wash;
  ctx.fillRect(0, bodyTop, w, bodyH);

  // Title band: deep plum with a glowing sun disc and palm silhouettes.
  const band = ctx.createLinearGradient(0, titleTop, 0, titleTop + titleH);
  band.addColorStop(0, '#1c0b2e');
  band.addColorStop(1, '#3d0f4a');
  ctx.fillStyle = band;
  ctx.fillRect(0, titleTop, w, titleH);
  const sunR = titleH * 0.42;
  const sunX = w * 0.88;
  const sunY = titleTop + titleH * 0.5;
  const sun = ctx.createRadialGradient(sunX, sunY, sunR * 0.1, sunX, sunY, sunR);
  sun.addColorStop(0, grade.sun);
  sun.addColorStop(0.7, 'rgba(255,120,60,0.55)');
  sun.addColorStop(1, 'rgba(255,120,60,0)');
  ctx.fillStyle = sun;
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
  ctx.fill();
  drawPalm(ctx, w * 0.04, titleTop + titleH * 0.98, titleH * 0.9, 'rgba(10,2,18,0.9)');
  drawPalm(ctx, w * 0.11, titleTop + titleH * 0.98, titleH * 0.62, 'rgba(10,2,18,0.75)');

  // Thin neon divider between photos and title band.
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.fillRect(0, titleTop - 2, w, 3);

  // Bold condensed title with a gradient fill and dark outline.
  const title = (state.title || '').trim().toUpperCase();
  if (title) {
    const size = fitFont(
      ctx,
      title,
      (s) => `${s}px Anton, "Arial Narrow", sans-serif`,
      w * 0.78,
      titleH * 0.52 * (state.titleSize || 1),
    );
    const grad = ctx.createLinearGradient(0, titleTop + titleH * 0.18, 0, titleTop + titleH * 0.82);
    theme.stops.forEach((stop, i) => grad.addColorStop(i / (theme.stops.length - 1), stop));
    ctx.font = `${size}px Anton, "Arial Narrow", sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#12041c';
    ctx.lineWidth = Math.max(3, size * 0.09);
    ctx.shadowColor = 'rgba(255,46,136,0.65)';
    ctx.shadowBlur = size * 0.18;
    const tx = w * 0.05;
    const ty = titleTop + titleH * 0.42;
    ctx.strokeText(title, tx, ty);
    ctx.fillStyle = grad;
    ctx.fillText(title, tx, ty);
    ctx.shadowBlur = 0;
  }

  // Neon script subtitle under the title.
  const subtitle = (state.subtitle || '').trim();
  if (subtitle) {
    const size = fitFont(
      ctx,
      subtitle,
      (s) => `${s}px Pacifico, cursive`,
      w * 0.6,
      titleH * 0.22,
    );
    ctx.font = `${size}px Pacifico, cursive`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#7df9ff';
    ctx.shadowColor = '#ff2fb3';
    ctx.shadowBlur = size * 0.5;
    ctx.fillText(subtitle, w * 0.055, titleTop + titleH * 0.8);
    ctx.shadowBlur = 0;
  }

  if (state.halftone) drawHalftone(ctx, w, h, Math.max(10, w * 0.012));

  // Grain and vignette finish the poster look.
  const tile = makeGrainTile();
  const pattern = ctx.createPattern(tile, 'repeat');
  ctx.fillStyle = pattern;
  ctx.fillRect(0, 0, w, h);
  const vig = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.75);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(0,0,0,0.38)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);

  // Thin white poster frame.
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.lineWidth = Math.max(3, w * 0.004);
  ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, w - ctx.lineWidth, h - ctx.lineWidth);
}
