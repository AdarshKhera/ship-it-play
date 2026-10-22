import { FONT, INK, TAGS, TAG_ORDER, view } from './config.js';
import { rrect, text, TAU } from './draw.js';

const STYLES = {
  primary: { top: '#ffe27a', bottom: '#ffb627', text: INK },
  secondary: { top: '#a3afff', bottom: '#6c7bff', text: '#ffffff' },
  danger: { top: '#ff9db0', bottom: '#ff6b81', text: '#ffffff' },
  success: { top: '#8cf5b6', bottom: '#3ddc84', text: INK },
  ghost: { top: 'rgba(255,255,255,0.16)', bottom: 'rgba(255,255,255,0.07)', text: '#ffffff' },
  off: { top: '#59608c', bottom: '#454b73', text: '#9aa2cf' },
};

export function createUi() {
  const ui = { hits: [], pressed: null, t: 0 };

  ui.begin = dt => { ui.hits = []; ui.t += dt; };
  ui.region = (id, x, y, w, h) => { ui.hits.push({ id, x, y, w, h }); };
  ui.at = p => {
    for (let i = ui.hits.length - 1; i >= 0; i--) {
      const r = ui.hits[i];
      if (p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h) return r.id;
    }
    return null;
  };

  ui.button = (ctx, id, x, y, w, h, label, o = {}) => {
    const { style = 'primary', size = 30, disabled = false, pulse = false, sub = null } = o;
    const st = STYLES[disabled ? 'off' : style];
    const press = !disabled && ui.pressed === id;
    const grow = pulse && !disabled ? 1 + Math.sin(ui.t * 4) * 0.02 : 1;
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2 + (press ? 4 : 0));
    ctx.scale(grow * (press ? 0.98 : 1), grow * (press ? 0.98 : 1));
    ctx.translate(-w / 2, -h / 2);
    rrect(ctx, 0, 7, w, h, h / 2); ctx.fillStyle = INK; ctx.fill();
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, st.top); g.addColorStop(1, st.bottom);
    rrect(ctx, 0, 0, w, h, h / 2); ctx.fillStyle = g; ctx.fill();
    ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke();
    ctx.save();
    rrect(ctx, 0, 0, w, h, h / 2); ctx.clip();
    ctx.fillStyle = 'rgba(255,255,255,0.28)'; ctx.fillRect(0, 0, w, h * 0.44);
    if (style === 'primary' && !disabled) {
      const sx = (((ui.t * 0.55) % 2.4) - 0.7) * w;
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.beginPath(); ctx.moveTo(sx, 0); ctx.lineTo(sx + 34, 0); ctx.lineTo(sx + 6, h); ctx.lineTo(sx - 28, h); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
    const ty = sub ? h / 2 - 8 : h / 2 + 2;
    text(ctx, label, w / 2, ty, { size, color: st.text, align: 'center', base: 'middle', stroke: style === 'ghost' || disabled ? null : null });
    if (sub) text(ctx, sub, w / 2, h / 2 + size * 0.55, { size: Math.max(15, size * 0.5), color: st.text, align: 'center', base: 'middle', weight: 600 });
    ctx.restore();
    if (!disabled) ui.region(id, x, y, w, h);
  };

  ui.round = (ctx, id, cx, cy, r, draw, o = {}) => {
    const { style = 'ghost', disabled = false } = o;
    const st = STYLES[disabled ? 'off' : style];
    const press = ui.pressed === id;
    ctx.save();
    ctx.translate(cx, cy + (press ? 3 : 0));
    ctx.scale(press ? 0.95 : 1, press ? 0.95 : 1);
    ctx.beginPath(); ctx.arc(0, 5, r, 0, TAU); ctx.fillStyle = INK; ctx.fill();
    const g = ctx.createLinearGradient(0, -r, 0, r);
    g.addColorStop(0, st.top); g.addColorStop(1, st.bottom);
    ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = 4.5; ctx.strokeStyle = INK; ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.22)'; ctx.beginPath(); ctx.ellipse(0, -r * 0.45, r * 0.7, r * 0.38, 0, 0, TAU); ctx.fill();
    draw(ctx, r, st.text);
    ctx.restore();
    if (!disabled) ui.region(id, cx - r, cy - r, r * 2, r * 2);
  };

  return ui;
}

export function drawBackdrop(ctx, t) {
  const g = ctx.createLinearGradient(0, 0, 0, view.h);
  g.addColorStop(0, '#2d3370'); g.addColorStop(0.6, '#1b1f4d'); g.addColorStop(1, '#12153a');
  ctx.fillStyle = g; ctx.fillRect(0, 0, view.w, view.h);
  const glow = ctx.createRadialGradient(view.w * 0.5, view.h * 0.32, 20, view.w * 0.5, view.h * 0.32, view.h * 0.9);
  glow.addColorStop(0, 'rgba(120,130,255,0.35)'); glow.addColorStop(1, 'rgba(120,130,255,0)');
  ctx.fillStyle = glow; ctx.fillRect(0, 0, view.w, view.h);
  for (let i = 0; i < 30; i++) {
    const tag = TAGS[TAG_ORDER[i % 4]].color;
    const speed = 14 + (i % 6) * 6;
    const sx = (i * 223) % view.w;
    const sy = ((i * 331 + t * speed) % (view.h + 120)) - 60;
    ctx.save();
    ctx.translate(sx, sy); ctx.rotate(t * 0.35 + i);
    ctx.globalAlpha = 0.1 + (i % 3) * 0.05;
    ctx.fillStyle = tag;
    rrect(ctx, -12, -8, 24 + (i % 4) * 5, 16, 5); ctx.fill();
    ctx.restore();
  }
}

export function drawHeader(ctx, title, subtitle) {
  text(ctx, title, view.w / 2, 62, { size: 54, align: 'center', base: 'middle', color: '#ffe14a', stroke: INK, lw: 11 });
  if (subtitle) text(ctx, subtitle, view.w / 2, 106, { size: 22, align: 'center', base: 'middle', color: '#c9ceee', weight: 600 });
}

export function backIcon(ctx, r, color) {
  ctx.strokeStyle = color; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(r * 0.25, -r * 0.45); ctx.lineTo(-r * 0.3, 0); ctx.lineTo(r * 0.25, r * 0.45); ctx.stroke();
}

export function speakerIcon(ctx, r, color, on) {
  ctx.fillStyle = color; ctx.strokeStyle = color; ctx.lineWidth = 4.5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-r * 0.5, -r * 0.2); ctx.lineTo(-r * 0.2, -r * 0.2); ctx.lineTo(r * 0.12, -r * 0.5); ctx.lineTo(r * 0.12, r * 0.5); ctx.lineTo(-r * 0.2, r * 0.2); ctx.lineTo(-r * 0.5, r * 0.2); ctx.closePath(); ctx.fill();
  if (on) { ctx.beginPath(); ctx.arc(r * 0.12, 0, r * 0.38, -0.9, 0.9); ctx.stroke(); ctx.beginPath(); ctx.arc(r * 0.12, 0, r * 0.62, -0.8, 0.8); ctx.stroke(); }
  else { ctx.beginPath(); ctx.moveTo(r * 0.35, -r * 0.25); ctx.lineTo(r * 0.7, r * 0.25); ctx.moveTo(r * 0.7, -r * 0.25); ctx.lineTo(r * 0.35, r * 0.25); ctx.stroke(); }
}

export function gearIcon(ctx, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 16; i++) { const rr = i % 2 ? r * 0.5 : r * 0.68; ctx.lineTo(Math.cos((i * TAU) / 16) * rr, Math.sin((i * TAU) / 16) * rr); }
  ctx.closePath(); ctx.fill();
  ctx.globalCompositeOperation = 'destination-out'; ctx.beginPath(); ctx.arc(0, 0, r * 0.2, 0, TAU); ctx.fill(); ctx.globalCompositeOperation = 'source-over';
}

export function fullscreenIcon(ctx, r, color, on) {
  ctx.strokeStyle = color; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const far = r * 0.5;
  const near = r * 0.2;
  [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([sx, sy]) => {
    const corner = on ? near : far;
    const tip = on ? far : near;
    ctx.beginPath(); ctx.moveTo(sx * tip, sy * corner); ctx.lineTo(sx * corner, sy * corner); ctx.lineTo(sx * corner, sy * tip); ctx.stroke();
  });
}

export function pencilIcon(ctx, r, color) {
  ctx.fillStyle = color; ctx.save(); ctx.rotate(-0.8);
  ctx.fillRect(-r * 0.14, -r * 0.62, r * 0.28, r * 0.9);
  ctx.beginPath(); ctx.moveTo(-r * 0.14, r * 0.3); ctx.lineTo(r * 0.14, r * 0.3); ctx.lineTo(0, r * 0.62); ctx.closePath(); ctx.fill();
  ctx.restore();
}

export function lockIcon(ctx, x, y, s, color) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = color; rrect(ctx, -14, -2, 28, 22, 5); ctx.fill();
  ctx.lineWidth = 5; ctx.strokeStyle = color; ctx.beginPath(); ctx.arc(0, -3, 9, Math.PI, 0); ctx.stroke();
  ctx.restore();
}

export const FONT_FAMILY = FONT;
