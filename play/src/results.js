import { INK, view } from './config.js';
import { heroLabel } from './profile.js';
import { HEROES } from './data.js';
import { levelById } from './levels.js';
import { nextLevelId } from './profile.js';
import { panel, starShape, text, TAU } from './draw.js';
import { drawBackdrop } from './ui.js';

const ROWS = [
  ['base', 'Defeats and combos'],
  ['waveBonus', 'Waves cleared'],
  ['flawless', 'Flawless waves'],
  ['survivor', 'Survivor bonus'],
  ['speed', 'Speed bonus'],
];

const ease = k => 1 - Math.pow(1 - Math.min(1, Math.max(0, k)), 3);

export function drawResults(ctx, app) {
  const { ui, G, profile, resultInfo } = app;
  const r = G.result;
  const cx = view.w / 2;
  const t = G.endT;
  drawBackdrop(ctx, app.t);
  ctx.fillStyle = 'rgba(8,10,28,0.4)';
  ctx.fillRect(0, 0, view.w, view.h);
  const pop = ease(t * 3);
  ctx.save();
  ctx.translate(cx, 360); ctx.scale(0.9 + pop * 0.1, 0.9 + pop * 0.1); ctx.globalAlpha = pop; ctx.translate(-cx, -360);
  panel(ctx, cx - 450, 24, 900, 676, { fill: 'rgba(20,24,64,0.96)', r: 36 });
  text(ctx, r.won ? (r.level === 'office' ? 'SPRINT SHIPPED!' : 'LEVEL CLEARED!') : 'SPRINT FAILED', cx, 96, { size: 64, align: 'center', base: 'middle', color: r.won ? '#4ade80' : '#ff7a7a', stroke: INK, lw: 13 });
  text(ctx, r.won ? `${r.levelName}. ${r.squadNames.join(', ')} got it over the line.` : `You reached wave ${r.wave} of ${r.waveCount}. Try a different mix.`, cx, 146, { size: 22, align: 'center', base: 'middle', color: '#c9ceee', weight: 600 });
  if (r.won) {
    [0, 1, 2].forEach(i => {
      const on = i < r.stars;
      const p = ease(t * 1.8 - 0.4 - i * 0.3);
      starShape(ctx, cx + (i - 1) * 104, 214 + (i === 1 ? -12 : 0), 44 * (on ? 0.3 + p * 0.7 : 1), '#ffd23f', on && p > 0);
    });
  } else {
    for (let i = 0; i < 5; i++) {
      ctx.beginPath(); ctx.arc(cx + (i - 2) * 46, 214, 15, 0, TAU); ctx.fillStyle = i < r.wave ? '#ffb627' : '#2a2f5a'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke();
    }
  }
  ROWS.forEach(([key, label], i) => {
    const a = ease((t - 0.7 - i * 0.22) * 4);
    if (a <= 0) return;
    const y = 282 + i * 38;
    ctx.save(); ctx.globalAlpha = a; ctx.translate((1 - a) * -30, 0);
    text(ctx, label, cx - 330, y, { size: 24, color: '#aab1d0', weight: 600, base: 'middle' });
    text(ctx, `+${Math.round(r.breakdown[key] * a).toLocaleString('en-US')}`, cx + 330, y, { size: 26, color: '#ffffff', align: 'right', base: 'middle' });
    ctx.restore();
  });
  ctx.strokeStyle = '#59608c'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx - 330, 480); ctx.lineTo(cx + 330, 480); ctx.stroke();
  const tk = ease((t - 2.0) / 0.9);
  text(ctx, 'TOTAL', cx - 330, 518, { size: 28, color: '#ffffff', base: 'middle' });
  text(ctx, Math.round(r.score * tk).toLocaleString('en-US'), cx + 330, 518, { size: 54, align: 'right', base: 'middle', color: '#ffe14a', stroke: INK, lw: 10 });
  const notes = [];
  if (resultInfo) {
    const un = resultInfo.unlocked;
    if (resultInfo.opened) notes.push([`New level: ${levelById(resultInfo.opened).name}!`, '#8fd0ff']);
    if (un.length) notes.push([un.length > 2 ? `${un.length} new heroes unlocked!` : `Unlocked: ${un.map(id => heroLabel(profile, HEROES[id]).name).join(' and ')}!`, '#7ef0a4']);
    if (resultInfo.best) notes.push(['NEW PERSONAL BEST!', '#ffe14a']);
    else if (resultInfo.rank > 0) notes.push([`#${resultInfo.rank} on your scoreboard`, '#c9ceee']);
  }
  const nk = ease((t - 2.4) * 3);
  notes.slice(0, 2).forEach(([msg, col], i) => {
    ctx.save(); ctx.globalAlpha = nk; text(ctx, msg, cx, 558 + i * 28, { size: 21, align: 'center', base: 'middle', color: col }); ctx.restore();
  });
  ctx.restore();
  const by = 624;
  const bw = 208;
  const gap = 14;
  const x0 = cx - (bw * 4 + gap * 3) / 2;
  if (t > 0.8) {
    const next = r.won && nextLevelId(r.level);
    if (next) ui.button(ctx, 'result:next', x0, by, bw, 62, 'NEXT LEVEL', { style: 'primary', size: 24, pulse: true });
    ui.button(ctx, 'result:again', next ? x0 + (bw + gap) : x0, by, bw, 62, 'PLAY AGAIN', { style: next ? 'secondary' : 'primary', size: 24 });
    if (!next) ui.button(ctx, 'go:squad', x0 + (bw + gap), by, bw, 62, 'SQUAD', { style: 'secondary', size: 24 });
    ui.button(ctx, 'result:share', x0 + (bw + gap) * 2, by, bw, 62, 'SHARE', { style: 'success', size: 24 });
    ui.button(ctx, 'result:home', x0 + (bw + gap) * 3, by, bw, 62, 'HOME', { style: 'ghost', size: 24 });
  }
}
