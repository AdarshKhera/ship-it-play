import { FONT, INK } from './config.js';

const TAU = Math.PI * 2;

export function rrect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

export function panel(ctx, x, y, w, h, o = {}) {
  const { fill = 'rgba(17,20,42,0.88)', stroke = INK, lw = 5, r = 20, accent = null } = o;
  rrect(ctx, x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
  if (accent) {
    ctx.save(); ctx.clip();
    ctx.fillStyle = accent; ctx.fillRect(x, y, 10, h);
    ctx.restore();
  }
  ctx.lineWidth = lw;
  ctx.strokeStyle = stroke;
  rrect(ctx, x, y, w, h, r);
  ctx.stroke();
}

export function text(ctx, str, x, y, o = {}) {
  const { size = 24, color = '#fff', align = 'left', base = 'alphabetic', stroke = null, weight = 700, lw = null } = o;
  ctx.font = `${weight} ${size}px ${FONT}`;
  ctx.textAlign = align;
  ctx.textBaseline = base;
  ctx.lineJoin = 'round';
  if (stroke) { ctx.lineWidth = lw ?? Math.max(4, size * 0.22); ctx.strokeStyle = stroke; ctx.strokeText(str, x, y); }
  ctx.fillStyle = color;
  ctx.fillText(str, x, y);
}

export function wrap(ctx, str, maxW, size, weight = 600) {
  ctx.font = `${weight} ${size}px ${FONT}`;
  const words = str.split(' ');
  const lines = [];
  let line = '';
  for (const w of words) {
    const t = line ? `${line} ${w}` : w;
    if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t;
  }
  if (line) lines.push(line);
  return lines;
}

export function chip(ctx, label, x, y, color, o = {}) {
  const { size = 18, h = 30, fill = color, textColor = INK, align = 'left' } = o;
  ctx.font = `700 ${size}px ${FONT}`;
  const w = ctx.measureText(label).width + 24;
  const x0 = align === 'center' ? x - w / 2 : x;
  rrect(ctx, x0, y, w, h, h / 2);
  ctx.fillStyle = fill; ctx.fill();
  ctx.lineWidth = 3.5; ctx.strokeStyle = INK; ctx.stroke();
  text(ctx, label, x0 + w / 2, y + h / 2 + 1, { size, color: textColor, align: 'center', base: 'middle' });
  return w;
}

export function bar(ctx, x, y, w, h, ratio, color, o = {}) {
  const { bg = '#2b3150', lw = 4 } = o;
  rrect(ctx, x - lw / 2, y - lw / 2, w + lw, h + lw, (h + lw) / 2);
  ctx.fillStyle = INK; ctx.fill();
  rrect(ctx, x, y, w, h, h / 2);
  ctx.fillStyle = bg; ctx.fill();
  const fw = Math.max(0, Math.min(1, ratio)) * w;
  if (fw > 1) {
    rrect(ctx, x, y, Math.max(h, fw), h, h / 2);
    ctx.save(); ctx.clip();
    ctx.fillStyle = color; ctx.fillRect(x, y, fw, h);
    ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(x, y, fw, h * 0.38);
    ctx.restore();
  }
}

export function starShape(ctx, cx, cy, r, fill, on = true) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 ? r * 0.48 : r;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fillStyle = on ? fill : '#3a4066';
  ctx.fill();
  ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.lineJoin = 'round'; ctx.stroke();
}

export function button(ctx, x, y, w, h, label, o = {}) {
  const { fill = '#ffb627', textColor = INK, size = 30, press = 0 } = o;
  const dy = press ? 4 : 0;
  rrect(ctx, x, y + 7, w, h, h / 2); ctx.fillStyle = INK; ctx.fill();
  rrect(ctx, x, y + dy, w, h, h / 2); ctx.fillStyle = fill; ctx.fill();
  ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke();
  rrect(ctx, x + 10, y + dy + 6, w - 20, h * 0.28, h * 0.14); ctx.fillStyle = 'rgba(255,255,255,0.38)'; ctx.fill();
  text(ctx, label, x + w / 2, y + dy + h / 2 + 2, { size, color: textColor, align: 'center', base: 'middle' });
}

export function inRect(p, r) { return p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h; }
export function inCircle(p, c) { return Math.hypot(p.x - c.x, p.y - c.y) <= c.r; }

export { TAU };
