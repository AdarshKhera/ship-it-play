import { FONT, INK, TAGS, TAG_ORDER, view } from './config.js';
import { HEROES } from './data.js';
import { LEVELS, levelById } from './levels.js';
import { drawFrame } from './assets.js';
import { heroLabel } from './profile.js';
import { chip, rrect, text, TAU } from './draw.js';
import { drawBackdrop, gearIcon, speakerIcon } from './ui.js';

export function heroIdle(ctx, sprites, id, x, y, scale, t, phase = 0, alpha = 1) {
  const set = sprites[id];
  if (!set) return;
  drawFrame(ctx, set, 'idle', Math.floor((t + phase) * 8) % set.idle.n, x, y, scale, { alpha });
}

function logo(ctx, cx, cy, t) {
  const bounce = Math.sin(t * 2.2) * 5;
  ctx.save();
  ctx.translate(cx, cy + bounce);
  ctx.rotate(Math.sin(t * 1.1) * 0.012);
  ctx.font = `700 150px ${FONT}`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  ctx.lineWidth = 34; ctx.strokeStyle = INK; ctx.strokeText('SHIP IT', 0, 8);
  ctx.fillStyle = '#c47f00'; ctx.fillText('SHIP IT', 0, 12);
  ctx.lineWidth = 30; ctx.strokeStyle = INK; ctx.strokeText('SHIP IT', 0, 0);
  const g = ctx.createLinearGradient(0, -70, 0, 70);
  g.addColorStop(0, '#fff3a6'); g.addColorStop(0.55, '#ffd23f'); g.addColorStop(1, '#ffb627');
  ctx.fillStyle = g; ctx.fillText('SHIP IT', 0, 0);
  ctx.restore();
}

export function drawHome(ctx, app) {
  const { ui, profile, t } = app;
  const cx = view.w / 2;
  drawBackdrop(ctx, t);

  const best = profile.scores[0] ? profile.scores[0].score : 0;
  ctx.font = `700 22px ${FONT}`;
  const label = best ? `BEST  ${best.toLocaleString('en-US')}` : 'NO SCORE YET';
  const bw = ctx.measureText(label).width + 40;
  rrect(ctx, 28, 24, bw, 46, 23); ctx.fillStyle = 'rgba(14,16,40,0.65)'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke();
  text(ctx, label, 28 + bw / 2, 48, { size: 22, align: 'center', base: 'middle', color: best ? '#ffe14a' : '#aab1d0' });

  ui.round(ctx, 'toggle:sound', view.w - 142, 47, 28, (c, r, col) => speakerIcon(c, r, col, profile.settings.sound));
  ui.round(ctx, 'go:settings', view.w - 76, 47, 28, (c, r, col) => gearIcon(c, r, col));

  logo(ctx, cx, 122, t);
  text(ctx, 'Tag-team your way through the workday', cx, 206, { size: 28, align: 'center', base: 'middle', color: '#dfe3ff', weight: 600 });

  const spots = [-230, 0, 230];
  profile.squad.forEach((id, i) => {
    const def = HEROES[id];
    const lab = heroLabel(profile, def);
    const x = cx + spots[i];
    const y = i === 1 ? 392 : 400;
    const col = TAGS[def.tag].color;
    ctx.beginPath(); ctx.ellipse(x, y + 6, 78, 24, 0, 0, TAU); ctx.fillStyle = INK; ctx.fill();
    ctx.beginPath(); ctx.ellipse(x, y, 78, 24, 0, 0, TAU); ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke();
    ctx.beginPath(); ctx.ellipse(x, y - 4, 56, 16, 0, 0, TAU); ctx.fillStyle = 'rgba(255,255,255,0.28)'; ctx.fill();
    heroIdle(ctx, app.A.sprites, id, x, y - 4, i === 1 ? 1.2 : 1.05, t, i * 0.35);
    text(ctx, lab.name, x, y + 46, { size: 26, align: 'center', base: 'middle', stroke: INK, lw: 7 });
    chip(ctx, def.tag, x, y + 62, col, { size: 14, h: 24, align: 'center' });
    ui.region('go:squad', x - 90, y - 150, 180, 220);
  });

  ui.button(ctx, 'play', cx - 210, 484, 420, 100, 'PLAY', { style: 'primary', size: 52, pulse: true, sub: levelById(profile.level).name });
  const w = 218;
  const gap = 14;
  const x0 = cx - (w * 4 + gap * 3) / 2;
  ui.button(ctx, 'go:howto', x0, 608, w, 62, 'HOW TO PLAY', { style: 'ghost', size: 21 });
  ui.button(ctx, 'go:levels', x0 + w + gap, 608, w, 62, 'LEVELS', { style: 'success', size: 24, sub: `${LEVELS.length} levels` });
  ui.button(ctx, 'go:squad', x0 + (w + gap) * 2, 608, w, 62, 'SQUAD', { style: 'secondary', size: 24, sub: '12 heroes' });
  ui.button(ctx, 'go:scores', x0 + (w + gap) * 3, 608, w, 62, 'SCORES', { style: 'ghost', size: 21 });

  const fx = cx - 270;
  text(ctx, 'Match colours', fx, 700, { size: 18, color: '#9aa3d4', weight: 600 });
  TAG_ORDER.forEach((tag, i) => { ctx.beginPath(); ctx.arc(fx + 130 + i * 20, 695, 7, 0, TAU); ctx.fillStyle = TAGS[tag].color; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.stroke(); });
  text(ctx, 'Swap heroes  ·  Smash POWER', fx + 240, 700, { size: 18, color: '#9aa3d4', weight: 600 });
  if (location.hostname.endsWith('github.io')) ui.button(ctx, 'link:case', 28, 82, 190, 44, 'CASE STUDY', { style: 'ghost', size: 17 });
  text(ctx, `Playing as ${profile.player}`, 30, 700, { size: 16, color: '#7f88b8', weight: 600 });
  text(ctx, 'Art: RGS_Dev (CC0)', view.w - 30, 700, { size: 16, align: 'right', color: '#5d6597', weight: 600 });
}
