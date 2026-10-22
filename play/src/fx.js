import { INK, FONT } from './config.js';

const MAX_PARTICLES = 520;

export function createFx() {
  return {
    particles: [], rings: [], texts: [], lines: [],
    shake: 0, flash: { a: 0, color: '#ffffff' }, hitstop: 0, slowT: 0, slowScale: 1, vignette: 0,
  };
}

export function burst(fx, x, y, o = {}) {
  const { color = '#fff', count = 12, speed = 320, life = 0.6, size = 11, shape = 'rect', gravity = 700, up = 120, glyphs = null, spread = Math.PI * 2, angle = 0 } = o;
  for (let i = 0; i < count; i++) {
    const a = angle + (Math.random() - 0.5) * spread;
    const s = speed * (0.35 + Math.random() * 0.75);
    fx.particles.push({
      x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - up * Math.random(), g: gravity,
      life: life * (0.6 + Math.random() * 0.6), t: 0, size: size * (0.6 + Math.random() * 0.8),
      color: Array.isArray(color) ? color[(Math.random() * color.length) | 0] : color,
      shape, rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 16,
      glyph: glyphs ? glyphs[(Math.random() * glyphs.length) | 0] : null,
    });
  }
  if (fx.particles.length > MAX_PARTICLES) fx.particles.splice(0, fx.particles.length - MAX_PARTICLES);
}

export function ring(fx, x, y, o = {}) {
  fx.rings.push({ x, y, from: o.from ?? 10, to: o.to ?? 200, life: o.life ?? 0.5, t: 0, width: o.width ?? 10, color: o.color ?? '#fff', fill: o.fill ?? 0 });
}

export function floatText(fx, x, y, text, o = {}) {
  fx.texts.push({ x, y, text, color: o.color ?? '#fff', size: o.size ?? 28, life: o.life ?? 0.85, t: 0, vy: o.vy ?? -85, pop: o.pop ?? 1 });
}

export function line(fx, x1, y1, x2, y2, o = {}) {
  fx.lines.push({ x1, y1, x2, y2, color: o.color ?? '#fff', width: o.width ?? 8, life: o.life ?? 0.3, t: 0 });
}

export function shake(fx, amount) { fx.shake = Math.max(fx.shake, amount); }
export function flash(fx, color, alpha) { fx.flash = { a: Math.max(fx.flash.a, alpha), color }; }
export function hitstop(fx, seconds) { fx.hitstop = Math.max(fx.hitstop, seconds); }
export function slowmo(fx, seconds, scale) { fx.slowT = Math.max(fx.slowT, seconds); fx.slowScale = scale; }

export function timeScale(fx) {
  if (fx.hitstop > 0) return 0.04;
  if (fx.slowT > 0) return fx.slowScale;
  return 1;
}

export function updateFx(fx, rawDt) {
  fx.hitstop = Math.max(0, fx.hitstop - rawDt);
  fx.slowT = Math.max(0, fx.slowT - rawDt);
  fx.shake = Math.max(0, fx.shake - rawDt * 38);
  fx.flash.a = Math.max(0, fx.flash.a - rawDt * 2.6);
  const dt = rawDt * timeScale(fx);
  for (const p of fx.particles) {
    p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += p.g * dt; p.vx *= 1 - Math.min(1, dt * 1.6); p.rot += p.vr * dt;
  }
  fx.particles = fx.particles.filter(p => p.t < p.life);
  for (const r of fx.rings) r.t += dt;
  fx.rings = fx.rings.filter(r => r.t < r.life);
  for (const l of fx.lines) l.t += dt;
  fx.lines = fx.lines.filter(l => l.t < l.life);
  for (const t of fx.texts) { t.t += dt; t.y += t.vy * dt; t.vy *= 1 - Math.min(1, dt * 3); }
  fx.texts = fx.texts.filter(t => t.t < t.life);
}

function drawParticle(ctx, p) {
  const k = 1 - p.t / p.life;
  ctx.save();
  ctx.globalAlpha = Math.min(1, k * 1.6);
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rot);
  if (p.shape === 'glyph') {
    ctx.font = `700 ${p.size * 2.2}px ${FONT}`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.strokeText(p.glyph, 0, 0);
    ctx.fillStyle = p.color; ctx.fillText(p.glyph, 0, 0);
  } else if (p.shape === 'circle') {
    ctx.fillStyle = p.color;
    ctx.beginPath(); ctx.arc(0, 0, p.size * (0.4 + k * 0.6), 0, 6.283); ctx.fill();
  } else {
    const s = p.size * (0.5 + k * 0.5);
    ctx.fillStyle = p.color; ctx.strokeStyle = INK; ctx.lineWidth = 2.5;
    ctx.fillRect(-s / 2, -s / 3, s, s * 0.66); ctx.strokeRect(-s / 2, -s / 3, s, s * 0.66);
  }
  ctx.restore();
}

export function drawFxWorld(ctx, fx) {
  for (const r of fx.rings) {
    const k = r.t / r.life;
    const e = 1 - Math.pow(1 - k, 3);
    const rad = r.from + (r.to - r.from) * e;
    ctx.save();
    ctx.globalAlpha = (1 - k) * 0.95;
    if (r.fill) { ctx.fillStyle = r.color; ctx.globalAlpha = (1 - k) * r.fill; ctx.beginPath(); ctx.arc(r.x, r.y, rad, 0, 6.283); ctx.fill(); ctx.globalAlpha = (1 - k) * 0.95; }
    ctx.lineWidth = r.width * (1 - k * 0.6) + 2;
    ctx.strokeStyle = INK; ctx.beginPath(); ctx.arc(r.x, r.y, rad + r.width * 0.5, 0, 6.283); ctx.stroke();
    ctx.lineWidth = r.width * (1 - k * 0.6);
    ctx.strokeStyle = r.color; ctx.beginPath(); ctx.arc(r.x, r.y, rad, 0, 6.283); ctx.stroke();
    ctx.restore();
  }
  for (const l of fx.lines) {
    const k = l.t / l.life;
    ctx.save();
    ctx.globalAlpha = 1 - k; ctx.lineCap = 'round';
    ctx.strokeStyle = INK; ctx.lineWidth = l.width + 5; ctx.beginPath(); ctx.moveTo(l.x1, l.y1); ctx.lineTo(l.x2, l.y2); ctx.stroke();
    ctx.strokeStyle = l.color; ctx.lineWidth = l.width * (1 - k * 0.5); ctx.beginPath(); ctx.moveTo(l.x1, l.y1); ctx.lineTo(l.x2, l.y2); ctx.stroke();
    ctx.restore();
  }
  for (const p of fx.particles) drawParticle(ctx, p);
  for (const t of fx.texts) {
    const k = t.t / t.life;
    const pop = t.pop * (k < 0.15 ? 0.6 + (k / 0.15) * 0.6 : 1.2 - Math.min(0.2, (k - 0.15) * 0.4));
    ctx.save();
    ctx.globalAlpha = k > 0.7 ? 1 - (k - 0.7) / 0.3 : 1;
    ctx.translate(t.x, t.y); ctx.scale(pop, pop);
    ctx.font = `700 ${t.size}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round'; ctx.lineWidth = Math.max(5, t.size * 0.24); ctx.strokeStyle = INK; ctx.strokeText(t.text, 0, 0);
    ctx.fillStyle = t.color; ctx.fillText(t.text, 0, 0);
    ctx.restore();
  }
}
