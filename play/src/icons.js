import { FONT, INK } from './config.js';
import { OUTDOOR_GLYPHS } from './glyphsOutdoor.js';

const TAU = Math.PI * 2;

const GLYPHS = {
  bug(c) {
    c.beginPath(); c.ellipse(0, 0.1, 0.42, 0.52, 0, 0, TAU); c.stroke();
    c.beginPath(); c.moveTo(0, -0.4); c.lineTo(0, 0.6); c.moveTo(-0.3, -0.5); c.lineTo(-0.55, -0.85); c.moveTo(0.3, -0.5); c.lineTo(0.55, -0.85);
    c.moveTo(-0.42, -0.05); c.lineTo(-0.8, -0.15); c.moveTo(0.42, -0.05); c.lineTo(0.8, -0.15); c.moveTo(-0.38, 0.35); c.lineTo(-0.75, 0.55); c.moveTo(0.38, 0.35); c.lineTo(0.75, 0.55); c.stroke();
  },
  nullptr(c) {
    c.beginPath(); c.arc(0, 0, 0.55, 0, TAU); c.moveTo(-0.7, 0.7); c.lineTo(0.7, -0.7); c.stroke();
  },
  glitch(c) {
    [[-0.7, -0.6, 0.9], [-0.3, -0.15, 1.0], [-0.8, 0.3, 0.7]].forEach(([x, y, w]) => { c.beginPath(); c.moveTo(x, y); c.lineTo(x + w, y); c.stroke(); });
    c.fillRect(0.3, 0.5, 0.35, 0.3);
  },
  kerning(c) {
    c.beginPath(); c.moveTo(-0.85, 0.6); c.lineTo(-0.45, -0.6); c.lineTo(-0.05, 0.6); c.moveTo(-0.7, 0.2); c.lineTo(-0.2, 0.2);
    c.moveTo(0.1, -0.6); c.lineTo(0.5, 0.6); c.lineTo(0.9, -0.6); c.stroke();
  },
  creep(c) {
    [[0, -1], [1, 0], [0, 1], [-1, 0]].forEach(([x, y]) => {
      c.beginPath(); c.moveTo(x * 0.25, y * 0.25); c.lineTo(x * 0.8, y * 0.8); c.stroke();
      c.beginPath(); c.moveTo(x * 0.85 + y * 0.28, y * 0.85 + x * 0.28); c.lineTo(x * 0.85, y * 0.85); c.lineTo(x * 0.85 - y * 0.28, y * 0.85 - x * 0.28); c.stroke();
    });
  },
  invite(c) {
    c.beginPath(); c.rect(-0.7, -0.55, 1.4, 1.3); c.moveTo(-0.7, -0.15); c.lineTo(0.7, -0.15); c.moveTo(-0.35, -0.8); c.lineTo(-0.35, -0.45); c.moveTo(0.35, -0.8); c.lineTo(0.35, -0.45); c.stroke();
    c.fillRect(-0.15, 0.15, 0.3, 0.3);
  },
  flaky(c) {
    c.beginPath(); c.moveTo(-0.7, 0.05); c.lineTo(-0.25, 0.55); c.lineTo(0.7, -0.6); c.stroke();
    c.beginPath(); c.moveTo(0.55, 0.3); c.lineTo(0.85, 0.3); c.moveTo(0.7, 0.15); c.lineTo(0.7, 0.45); c.stroke();
  },
  e404(c, color) {
    c.font = `700 1.15px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = color; c.fillText('404', 0, 0.06);
  },
  ping(c) {
    c.beginPath(); c.moveTo(-0.55, 0.35); c.bezierCurveTo(-0.55, -0.2, -0.35, -0.6, 0, -0.6); c.bezierCurveTo(0.35, -0.6, 0.55, -0.2, 0.55, 0.35); c.closePath(); c.stroke();
    c.beginPath(); c.moveTo(-0.7, 0.35); c.lineTo(0.7, 0.35); c.stroke(); c.beginPath(); c.arc(0, 0.7, 0.14, 0, TAU); c.fill();
  },
  spaghetti(c) {
    c.beginPath(); c.moveTo(-0.85, 0.1); c.bezierCurveTo(-0.6, -0.9, -0.2, 0.9, 0.1, -0.1); c.bezierCurveTo(0.35, -0.8, 0.6, 0.6, 0.85, -0.2); c.stroke();
  },
  pop(c) {
    c.beginPath();
    for (let i = 0; i < 16; i++) { const r = i % 2 ? 0.45 : 0.95; c.lineTo(Math.cos((i * TAU) / 16) * r, Math.sin((i * TAU) / 16) * r); }
    c.closePath(); c.stroke();
  },
  standup(c) {
    c.beginPath(); c.arc(0, 0, 0.8, 0, TAU); c.moveTo(0, 0); c.lineTo(0, -0.5); c.moveTo(0, 0); c.lineTo(0.38, 0.2); c.stroke();
  },
  regress(c) {
    c.beginPath(); c.arc(0, 0, 0.7, -2.3, 3.4); c.stroke();
    c.beginPath(); c.moveTo(-0.7, -0.75); c.lineTo(-0.5, -0.4); c.lineTo(-0.95, -0.3); c.closePath(); c.fill();
  },
  checkout(c) {
    c.beginPath(); c.moveTo(-0.9, -0.6); c.lineTo(-0.55, -0.6); c.lineTo(-0.25, 0.35); c.lineTo(0.65, 0.35); c.lineTo(0.85, -0.3); c.lineTo(-0.5, -0.3); c.stroke();
    c.beginPath(); c.arc(-0.1, 0.7, 0.14, 0, TAU); c.arc(0.55, 0.7, 0.14, 0, TAU); c.fill();
  },
  reorg(c) {
    c.beginPath(); c.rect(-0.3, -0.85, 0.6, 0.4); c.rect(-0.85, 0.35, 0.55, 0.4); c.rect(0.3, 0.35, 0.55, 0.4);
    c.moveTo(0, -0.45); c.lineTo(0, 0); c.moveTo(-0.58, 0.35); c.lineTo(-0.58, 0); c.lineTo(0.58, 0); c.lineTo(0.58, 0.35); c.stroke();
  },
  demoday(c) {
    c.beginPath(); c.rect(-0.85, -0.65, 1.7, 1.15); c.moveTo(0, 0.5); c.lineTo(0, 0.85); c.moveTo(-0.4, 0.85); c.lineTo(0.4, 0.85); c.stroke();
    c.beginPath(); c.moveTo(-0.25, -0.35); c.lineTo(0.35, -0.05); c.lineTo(-0.25, 0.25); c.closePath(); c.fill();
  },
};

export function drawBadge(ctx, icon, x, y, r, color) {
  const glyph = GLYPHS[icon] || OUTDOOR_GLYPHS[icon];
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath(); ctx.arc(0, 0, r + 2.5, 0, TAU); ctx.fillStyle = INK; ctx.fill();
  ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fillStyle = '#fbfbfd'; ctx.fill();
  ctx.lineWidth = Math.max(2, r * 0.2); ctx.strokeStyle = color; ctx.stroke();
  if (glyph) {
    ctx.scale(r * 0.66, r * 0.66);
    ctx.lineWidth = 0.2; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = INK; ctx.fillStyle = INK;
    glyph(ctx, INK);
  }
  ctx.restore();
}
