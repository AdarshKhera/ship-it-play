import { INK, view } from './config.js';
import { panel, rrect, text, wrap } from './draw.js';

export function drawCards(ctx, app) {
  const { ui, G } = app;
  ctx.fillStyle = 'rgba(8,10,28,0.74)';
  ctx.fillRect(0, 0, view.w, view.h);
  const cx = view.w / 2;
  const ready = Math.min(1, G.cardsT / 0.6);
  text(ctx, 'PICK A BOOST', cx, 120, { size: 76, align: 'center', base: 'middle', color: '#ffe14a', stroke: INK, lw: 14 });
  ctx.globalAlpha = 0.45 + 0.55 * ready;
  text(ctx, 'Team fully healed. Choose one upgrade for the rest of the run.', cx, 178, { size: 24, align: 'center', base: 'middle', color: '#dfe3ff', weight: 600 });
  const cols = ['#3aa0ff', '#ff4fa3', '#ffb627'];
  [0, 1, 2].forEach(i => {
    const card = G.cards[i];
    if (!card) return;
    const x = cx - 510 + i * 350;
    const y = 220;
    const w = 320;
    const h = 330;
    const bob = Math.sin(app.t * 2 + i) * 4 * ready;
    panel(ctx, x, y + bob, w, h, { fill: '#171b44', r: 28 });
    ctx.save(); rrect(ctx, x + 5, y + bob + 5, w - 10, 96, 22); ctx.clip();
    ctx.fillStyle = cols[i]; ctx.fillRect(x, y + bob, w, 110);
    ctx.fillStyle = 'rgba(255,255,255,0.22)'; ctx.fillRect(x, y + bob, w, 36);
    ctx.restore();
    text(ctx, String(i + 1), x + w / 2, y + bob + 56, { size: 74, align: 'center', base: 'middle', color: '#ffffff', stroke: INK });
    text(ctx, card.name, x + w / 2, y + bob + 148, { size: 34, align: 'center', base: 'middle' });
    wrap(ctx, card.desc, w - 50, 23).forEach((ln, k) => text(ctx, ln, x + w / 2, y + bob + 198 + k * 30, { size: 23, align: 'center', color: '#c9ceee', weight: 600 }));
    text(ctx, 'TAP TO TAKE', x + w / 2, y + bob + h - 30, { size: 19, align: 'center', color: cols[i] });
    if (ready >= 1) ui.region(`card:${i}`, x, y, w, h);
  });
  ctx.globalAlpha = 1;
}

export function drawPause(ctx, app) {
  const { ui, profile } = app;
  const cx = view.w / 2;
  ctx.fillStyle = 'rgba(8,10,28,0.78)';
  ctx.fillRect(0, 0, view.w, view.h);
  text(ctx, 'PAUSED', cx, 170, { size: 96, align: 'center', base: 'middle', color: '#ffffff', stroke: INK, lw: 18 });
  ui.button(ctx, 'pause:resume', cx - 180, 250, 360, 76, 'RESUME', { style: 'primary', size: 34, pulse: true });
  ui.button(ctx, 'toggle:sound', cx - 180, 348, 360, 66, profile.settings.sound ? 'SOUND ON' : 'SOUND OFF', { style: 'secondary', size: 26 });
  ui.button(ctx, 'pause:home', cx - 180, 436, 360, 66, 'QUIT TO HOME', { style: 'danger', size: 26 });
}
