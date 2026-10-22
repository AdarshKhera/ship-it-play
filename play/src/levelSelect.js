import { INK, view } from './config.js';
import { ENEMIES } from './data.js';
import { drawFrame } from './assets.js';
import { drawBadge } from './icons.js';
import { LEVELS } from './levels.js';
import { levelUnlocked } from './profile.js';
import { chip, panel, rrect, starShape, text, TAU } from './draw.js';
import { backIcon, drawBackdrop, lockIcon } from './ui.js';

const CARD_H = 440;
const ART_H = 210;
const SAMPLE = {
  office: [['bug', 'e1_code'], ['creep', 'e2_process']],
  staycation: [['sunbug', 'e1_code'], ['filter', 'e1_design']],
  offsite: [['merge', 'e2_code'], ['campfire', 'e2_test']],
};

function sceneArt(ctx, level, x, y, w, h, t) {
  ctx.save();
  rrect(ctx, x, y, w, h, 22); ctx.clip();
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, level.sky[0]); g.addColorStop(1, level.sky[1]);
  ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
  const ground = y + h - 56;
  if (level.theme === 'office') {
    ctx.fillStyle = '#4a5677'; ctx.fillRect(x, y, w, ground - y);
    [0.2, 0.5, 0.8].forEach(k => { ctx.fillStyle = '#bcd8ef'; rrect(ctx, x + w * k - 34, y + 22, 68, 56, 6); ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#434b60'; ctx.stroke(); });
    ctx.fillStyle = '#ebe6dc'; ctx.fillRect(x, ground, w, 60);
  } else if (level.theme === 'park') {
    ctx.fillStyle = '#fff7b8'; ctx.beginPath(); ctx.arc(x + w - 60, y + 50, 28, 0, TAU); ctx.fill();
    ctx.fillStyle = '#a5e0b4'; ctx.beginPath(); ctx.ellipse(x + w * 0.3, ground + 10, w * 0.6, 60, 0, Math.PI, TAU); ctx.fill();
    ctx.fillStyle = '#7ccf93'; ctx.beginPath(); ctx.ellipse(x + w * 0.8, ground + 16, w * 0.5, 50, 0, Math.PI, TAU); ctx.fill();
    ctx.fillStyle = '#a3e08e'; ctx.fillRect(x, ground, w, 60);
    ctx.fillStyle = '#9b7653'; ctx.fillRect(x + 50, y + 100, 12, 50); ctx.fillStyle = '#4fbf6d'; ctx.beginPath(); ctx.arc(x + 56, y + 90, 34, 0, TAU); ctx.fill();
  } else {
    ctx.fillStyle = '#fff4cf'; ctx.beginPath(); ctx.arc(x + 70, y + 44, 22, 0, TAU); ctx.fill();
    [0.25, 0.55, 0.85].forEach((k, i) => { ctx.fillStyle = i % 2 ? '#122a2f' : '#193a40'; ctx.beginPath(); ctx.moveTo(x + w * k - 36, ground); ctx.lineTo(x + w * k, ground - 100 - i * 8); ctx.lineTo(x + w * k + 36, ground); ctx.fill(); });
    ctx.fillStyle = '#4f8a63'; ctx.fillRect(x, ground, w, 60);
    ctx.fillStyle = '#ff8a3d'; ctx.beginPath(); ctx.ellipse(x + w * 0.5, ground + 24, 14 + Math.sin(t * 9) * 2, 22, 0, 0, TAU); ctx.fill();
  }
  ctx.restore();
}

function enemies(ctx, A, level, x, y, w, t) {
  (SAMPLE[level.id] || SAMPLE.office).forEach(([key, spriteKey], i) => {
    const set = A.sprites[spriteKey];
    if (!set) return;
    const ex = x + w * (0.35 + i * 0.32);
    const ey = y + ART_H - 26;
    drawFrame(ctx, set, 'walk', Math.floor((t + i * 0.3) * 9) % set.walk.n, ex, ey, 0.6, { flip: i === 0 });
    drawBadge(ctx, ENEMIES[key].icon, ex, ey - (set.walk.fh || 150) * 0.6 * 0.2, 9, '#ffffff');
  });
}

function drawCard(ctx, app, level, i, x, y, w) {
  const { ui, profile, A, t } = app;
  const open = levelUnlocked(profile, level.id);
  const current = profile.level === level.id;
  panel(ctx, x, y, w, CARD_H, { fill: 'rgba(16,19,48,0.92)', r: 28, stroke: current && open ? level.accent : INK, lw: current && open ? 7 : 5 });
  sceneArt(ctx, level, x + 14, y + 14, w - 28, ART_H, t);
  enemies(ctx, A, level, x + 14, y + 14, w - 28, t);
  text(ctx, `LEVEL ${i + 1}`, x + 28, y + ART_H + 52, { size: 16, color: level.accent });
  text(ctx, level.name, x + 28, y + ART_H + 88, { size: 36, stroke: INK, lw: 8 });
  text(ctx, level.blurb, x + 28, y + ART_H + 118, { size: 17, color: '#c9ceee', weight: 600 });
  chip(ctx, level.perk, x + 28, y + ART_H + 156, level.accent, { size: 14, h: 28 });
  const cleared = profile.cleared.includes(level.id);
  text(ctx, `${level.waves.length} waves`, x + 28, y + CARD_H - 24, { size: 17, color: '#9aa3d4', weight: 600 });
  if (cleared) {
    text(ctx, 'CLEARED', x + w - 28, y + CARD_H - 24, { size: 18, align: 'right', color: '#7ef0a4' });
    starShape(ctx, x + w - 130, y + CARD_H - 31, 12, '#ffd23f', true);
  } else if (open) {
    text(ctx, 'TAP TO PLAY', x + w - 28, y + CARD_H - 24, { size: 18, align: 'right', color: level.accent });
  }
  if (open) { ui.region(`level:${level.id}`, x, y, w, CARD_H); return; }
  rrect(ctx, x, y, w, CARD_H, 28); ctx.fillStyle = 'rgba(10,12,32,0.78)'; ctx.fill();
  lockIcon(ctx, x + w / 2, y + 120, 1.8, '#ffffff');
  text(ctx, `Clear ${LEVELS[i - 1].name}`, x + w / 2, y + 220, { size: 24, align: 'center', color: '#ffffff' });
  text(ctx, 'to unlock', x + w / 2, y + 252, { size: 20, align: 'center', color: '#c9ceee', weight: 600 });
  ui.region('level:locked', x, y, w, CARD_H);
}

export function drawLevelSelect(ctx, app) {
  const { ui, t } = app;
  const cx = view.w / 2;
  drawBackdrop(ctx, t);
  ui.round(ctx, 'levels:back', 56, 56, 30, (c, r, col) => backIcon(c, r, col));
  text(ctx, 'CHOOSE A LEVEL', cx, 52, { size: 46, align: 'center', base: 'middle', color: '#ffe14a', stroke: INK, lw: 10 });
  text(ctx, 'Same squad, new scenery, new problems.', cx, 96, { size: 20, align: 'center', base: 'middle', color: '#c9ceee', weight: 600 });
  const w = 380;
  const gap = 28;
  const x0 = cx - (w * LEVELS.length + gap * (LEVELS.length - 1)) / 2;
  LEVELS.forEach((level, i) => drawCard(ctx, app, level, i, x0 + i * (w + gap), 130, w));
  ui.button(ctx, 'go:squad', cx - 150, 596, 300, 62, 'CHANGE SQUAD', { style: 'secondary', size: 22 });
}
