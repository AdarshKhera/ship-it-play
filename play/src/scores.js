import { INK, TAGS, view } from './config.js';
import { HEROES } from './data.js';
import { levelById } from './levels.js';
import { drawPortrait } from './assets.js';
import { panel, rrect, starShape, text, TAU } from './draw.js';
import { backIcon, drawBackdrop } from './ui.js';

export function drawScores(ctx, app) {
  const { ui, profile, A, t } = app;
  const cx = view.w / 2;
  drawBackdrop(ctx, t);
  ui.round(ctx, 'scores:back', 56, 56, 30, (c, r, col) => backIcon(c, r, col));
  text(ctx, 'TOP SCORES', cx, 52, { size: 46, align: 'center', base: 'middle', color: '#ffe14a', stroke: INK, lw: 10 });
  text(ctx, 'Saved on this device. Share yours and see who is best at the office.', cx, 96, { size: 19, align: 'center', base: 'middle', color: '#c9ceee', weight: 600 });
  panel(ctx, cx - 520, 118, 1040, 520, { fill: 'rgba(16,19,48,0.9)', r: 28 });
  if (!profile.scores.length) {
    text(ctx, 'No runs yet', cx, 330, { size: 44, align: 'center', base: 'middle', color: '#ffffff' });
    text(ctx, 'Finish a sprint and your score lands here.', cx, 382, { size: 22, align: 'center', base: 'middle', color: '#aab1d0', weight: 600 });
    ui.button(ctx, 'scores:play', cx - 130, 430, 260, 70, 'PLAY', { style: 'primary', size: 32 });
    return;
  }
  text(ctx, 'RANK', cx - 480, 148, { size: 16, color: '#7f88b8' });
  text(ctx, 'PLAYER', cx - 400, 148, { size: 16, color: '#7f88b8' });
  text(ctx, 'SCORE', cx + 40, 148, { size: 16, align: 'right', color: '#7f88b8' });
  text(ctx, 'RESULT', cx + 70, 148, { size: 16, color: '#7f88b8' });
  text(ctx, 'SQUAD', cx + 380, 148, { size: 16, color: '#7f88b8' });
  profile.scores.forEach((s, i) => {
    const y = 160 + i * 46;
    if (i === app.lastRank - 1) { rrect(ctx, cx - 506, y, 1012, 42, 14); ctx.fillStyle = 'rgba(255,225,74,0.16)'; ctx.fill(); }
    const medal = ['#ffd23f', '#d6dbe8', '#e0a070'][i];
    if (medal) { ctx.beginPath(); ctx.arc(cx - 462, y + 21, 17, 0, TAU); ctx.fillStyle = medal; ctx.fill(); ctx.lineWidth = 3.5; ctx.strokeStyle = INK; ctx.stroke(); text(ctx, String(i + 1), cx - 462, y + 22, { size: 20, color: INK, align: 'center', base: 'middle' }); }
    else text(ctx, String(i + 1), cx - 462, y + 22, { size: 22, color: '#9aa3d4', align: 'center', base: 'middle' });
    text(ctx, s.name, cx - 400, y + 22, { size: 24, base: 'middle', color: '#ffffff' });
    text(ctx, s.score.toLocaleString('en-US'), cx + 40, y + 22, { size: 26, align: 'right', base: 'middle', color: '#ffe14a' });
    text(ctx, s.won ? 'Cleared' : `Wave ${s.wave}`, cx + 70, y + 15, { size: 18, base: 'middle', color: s.won ? '#7ef0a4' : '#c9ceee', weight: 600 });
    text(ctx, levelById(s.level).name, cx + 70, y + 33, { size: 13, base: 'middle', color: '#7f88b8', weight: 600 });
    for (let k = 0; k < 3; k++) starShape(ctx, cx + 262 + k * 32, y + 22, 14, '#ffd23f', k < s.stars);
    s.squad.forEach((id, k) => {
      const px = cx + 392 + k * 46;
      ctx.beginPath(); ctx.arc(px, y + 21, 20, 0, TAU); ctx.fillStyle = INK; ctx.fill();
      if (HEROES[id]) drawPortrait(ctx, A.sprites, id, px, y + 21, 34, TAGS[HEROES[id].tag].color);
    });
  });
  ui.button(ctx, 'scores:share', cx - 150, 650, 300, 56, 'SHARE BEST SCORE', { style: 'success', size: 22 });
}
