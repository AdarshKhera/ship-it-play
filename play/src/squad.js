import { FONT, INK, TAGS, TAG_ORDER, view } from './config.js';
import { HEROES, ROSTER } from './data.js';
import { drawFrame, drawPortrait } from './assets.js';
import { drawSpriteCanvas } from './props.js';
import { heroLabel } from './profile.js';
import { isUnlocked, waveMix } from './rules.js';
import { chip, panel, rrect, text, TAU } from './draw.js';
import { backIcon, drawBackdrop, lockIcon, pencilIcon } from './ui.js';

const CARD = { w: 176, h: 182, gap: 12, cols: 6 };

export function cardRect(i) {
  const gx = view.w / 2 - (CARD.cols * CARD.w + (CARD.cols - 1) * CARD.gap) / 2;
  return { x: gx + (i % CARD.cols) * (CARD.w + CARD.gap), y: 118 + Math.floor(i / CARD.cols) * (CARD.h + CARD.gap), w: CARD.w, h: CARD.h };
}

function fit(ctx, str, maxW, size, weight = 600) {
  ctx.font = `${weight} ${size}px ${FONT}`;
  if (ctx.measureText(str).width <= maxW) return str;
  let s = str;
  while (s.length > 1 && ctx.measureText(`${s}…`).width > maxW) s = s.slice(0, -1);
  return `${s}…`;
}

function statBar(ctx, x, y, w, ratio, color, label) {
  text(ctx, label, x, y + 10, { size: 14, color: '#9aa3d4', weight: 600 });
  rrect(ctx, x + 74, y, w, 13, 6.5); ctx.fillStyle = INK; ctx.fill();
  rrect(ctx, x + 76, y + 2, Math.max(8, (w - 4) * Math.min(1, ratio)), 9, 4.5); ctx.fillStyle = color; ctx.fill();
}

function drawCard(ctx, app, id, i) {
  const { ui, profile, A, t } = app;
  const def = HEROES[id];
  const r = cardRect(i);
  const unlocked = isUnlocked(profile.bestWave, def);
  const order = app.squadUi.picked.indexOf(id);
  const on = order >= 0;
  const focus = app.squadUi.focus === id;
  const col = TAGS[def.tag].color;
  const lab = heroLabel(profile, def);
  const lift = on ? -6 : 0;
  const y = r.y + lift;
  panel(ctx, r.x, y, r.w, r.h, { fill: unlocked ? '#171b44' : '#13163a', stroke: on ? '#ffffff' : focus ? col : INK, lw: on ? 6 : focus ? 6 : 5, r: 22 });
  ctx.save();
  rrect(ctx, r.x + 5, y + 5, r.w - 10, 112, 17); ctx.clip();
  const g = ctx.createLinearGradient(0, y, 0, y + 116);
  g.addColorStop(0, unlocked ? col : '#3a4070'); g.addColorStop(1, unlocked ? `${col}88` : '#2a2f58');
  ctx.fillStyle = g; ctx.fillRect(r.x, y, r.w, 120);
  ctx.fillStyle = 'rgba(255,255,255,0.16)'; ctx.beginPath(); ctx.arc(r.x + r.w / 2, y + 74, 52, 0, TAU); ctx.fill();
  heroSprite(ctx, A.sprites, id, r.x + r.w / 2, y + 112, 0.7, t, i * 0.21, unlocked ? 1 : 0.28);
  ctx.restore();
  text(ctx, fit(ctx, lab.name, r.w - 16, 22, 700), r.x + r.w / 2, y + 138, { size: 22, align: 'center', base: 'middle', color: unlocked ? '#ffffff' : '#8f98c8' });
  text(ctx, fit(ctx, unlocked ? lab.title : def.title, r.w - 16, 14), r.x + r.w / 2, y + 160, { size: 14, align: 'center', base: 'middle', color: '#9aa3d4', weight: 600 });
  if (unlocked) {
    ctx.beginPath(); ctx.arc(r.x + 20, y + 20, 11, 0, TAU); ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = 3.5; ctx.strokeStyle = INK; ctx.stroke();
  } else {
    lockIcon(ctx, r.x + r.w / 2, y + 60, 1.1, '#cfd5ff');
    text(ctx, `WAVE ${def.unlock}`, r.x + r.w / 2, y + 100, { size: 16, align: 'center', base: 'middle', color: '#cfd5ff', stroke: INK });
  }
  if (on) {
    ctx.beginPath(); ctx.arc(r.x + r.w - 22, y + 22, 17, 0, TAU); ctx.fillStyle = '#ffe14a'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke();
    text(ctx, String(order + 1), r.x + r.w - 22, y + 23, { size: 20, color: INK, align: 'center', base: 'middle' });
  } else if (unlocked && !profile.seen.includes(id)) {
    rrect(ctx, r.x + r.w - 52, y + 8, 44, 22, 11); ctx.fillStyle = '#ff4f8a'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.stroke();
    text(ctx, 'NEW', r.x + r.w - 30, y + 20, { size: 13, align: 'center', base: 'middle' });
  }
  ui.region(`pick:${id}`, r.x, r.y - 6, r.w, r.h + 6);
}

function heroSprite(ctx, sprites, id, x, y, scale, t, phase, alpha) {
  const set = sprites[id];
  if (!set) return;
  drawFrame(ctx, set, 'idle', Math.floor((t + phase) * 8) % set.idle.n, x, y, scale, { alpha });
}

function drawDetail(ctx, app) {
  const { ui, profile, A, t } = app;
  const id = app.squadUi.focus;
  const def = HEROES[id];
  const lab = heroLabel(profile, def);
  const unlocked = isUnlocked(profile.bestWave, def);
  const col = TAGS[def.tag].color;
  const px = view.w / 2 - 620;
  const py = 506;
  panel(ctx, px, py, 1240, 196, { fill: 'rgba(16,19,48,0.92)', r: 26 });
  ctx.save();
  rrect(ctx, px + 6, py + 6, 196, 184, 20); ctx.clip();
  const g = ctx.createLinearGradient(0, py, 0, py + 186);
  g.addColorStop(0, unlocked ? col : '#3a4070'); g.addColorStop(1, unlocked ? `${col}66` : '#272c56');
  ctx.fillStyle = g; ctx.fillRect(px, py, 210, 186);
  ctx.fillStyle = 'rgba(255,255,255,0.16)'; ctx.beginPath(); ctx.arc(px + 104, py + 112, 70, 0, TAU); ctx.fill();
  heroSprite(ctx, A.sprites, id, px + 104, py + 176, 1.1, t, 0, unlocked ? 1 : 0.3);
  ctx.restore();

  const tx = px + 226;
  text(ctx, lab.name, tx, py + 40, { size: 34 });
  ctx.font = `700 34px ${FONT}`;
  const nw = ctx.measureText(lab.name).width;
  chip(ctx, def.tag, tx + nw + 14, py + 16, col, { size: 15, h: 28 });
  if (unlocked) ui.round(ctx, 'rename:hero', tx + nw + 128, py + 30, 22, (c, r, colr) => pencilIcon(c, r, colr), { style: 'ghost' });
  text(ctx, lab.title, tx, py + 66, { size: 19, color: '#c9ceee', weight: 600 });
  text(ctx, `"${def.tagline}"`, tx, py + 90, { size: 17, color: '#9aa3d4', weight: 600 });
  statBar(ctx, tx, py + 104, 150, def.hp / 150, '#4ade80', 'HEALTH');
  statBar(ctx, tx, py + 126, 150, def.speed / 290, '#ffb627', 'SPEED');
  drawSpriteCanvas(ctx, A.fuel[def.fuel.kind], tx + 20, py + 176, 0.42);
  text(ctx, `Runs on ${def.fuel.name}`, tx + 50, py + 168, { size: 17, color: '#ffe9a8' });
  const mx = tx + 300;
  text(ctx, `+ ${def.pro}`, mx, py + 112, { size: 17, color: '#7ef0a4', weight: 600 });
  text(ctx, `- ${def.con}`, mx, py + 136, { size: 17, color: '#ff9a9a', weight: 600 });
  text(ctx, `POWER: ${def.power.name}`, mx, py + 158, { size: 21, color: col });
  text(ctx, fit(ctx, def.power.blurb, 330, 16), mx, py + 180, { size: 16, color: '#aab1d0', weight: 600 });
  if (!unlocked) {
    rrect(ctx, tx - 12, py + 8, 660, 170, 16); ctx.fillStyle = 'rgba(16,19,48,0.9)'; ctx.fill();
    lockIcon(ctx, tx + 330, py + 62, 1.7, '#cfd5ff');
    text(ctx, `Reach wave ${def.unlock} to unlock ${def.name}`, tx + 330, py + 122, { size: 26, align: 'center', base: 'middle', color: '#ffe14a' });
    text(ctx, 'Clear earlier waves in any run.', tx + 330, py + 154, { size: 18, align: 'center', base: 'middle', color: '#aab1d0', weight: 600 });
  }

  const sx = px + 900;
  text(ctx, 'YOUR SQUAD', sx + 140, py + 28, { size: 17, align: 'center', color: '#9aa3d4' });
  for (let i = 0; i < 3; i++) {
    const cx = sx + 40 + i * 100;
    const cy = py + 76;
    const pid = app.squadUi.picked[i];
    ctx.beginPath(); ctx.arc(cx, cy, 36, 0, TAU); ctx.fillStyle = INK; ctx.fill();
    if (pid) {
      drawPortrait(ctx, A.sprites, pid, cx, cy, 66, TAGS[HEROES[pid].tag].color);
      ctx.lineWidth = 4; ctx.strokeStyle = '#ffffff'; ctx.beginPath(); ctx.arc(cx, cy, 36, 0, TAU); ctx.stroke();
      ui.region(`slot:${i}`, cx - 36, cy - 36, 72, 72);
    } else {
      ctx.setLineDash([8, 8]); ctx.lineWidth = 4; ctx.strokeStyle = '#59608c'; ctx.beginPath(); ctx.arc(cx, cy, 33, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
      text(ctx, String(i + 1), cx, cy + 2, { size: 26, align: 'center', base: 'middle', color: '#59608c' });
    }
  }
  const covered = new Set(app.squadUi.picked.map(p => HEROES[p].tag));
  TAG_ORDER.forEach((tag, i) => {
    const has = covered.has(tag);
    ctx.beginPath(); ctx.arc(sx + 14 + i * 30, py + 130, 9, 0, TAU); ctx.fillStyle = has ? TAGS[tag].color : '#2a2f5a'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.stroke();
  });
  const missing = 4 - covered.size;
  text(ctx, `${missing} colour${missing === 1 ? '' : 's'} uncovered`, sx + 140, py + 134, { size: 15, color: '#9aa3d4', weight: 600 });
  const ready = app.squadUi.picked.length === 3;
  const between = app.squadUi.mode === 'between';
  ui.button(ctx, 'squad:go', sx, py + 148, 280, 36, ready ? (between ? `GO TO WAVE ${app.squadUi.wave + 1}` : 'SAVE & PLAY') : `PICK ${3 - app.squadUi.picked.length} MORE`, { style: ready ? 'primary' : 'off', size: 20, disabled: !ready });
}

export function drawSquad(ctx, app) {
  const { ui, t } = app;
  const between = app.squadUi.mode === 'between';
  drawBackdrop(ctx, t);
  if (!between) ui.round(ctx, 'squad:back', 56, 56, 30, (c, r, col) => backIcon(c, r, col));
  text(ctx, between ? `Wave ${app.squadUi.wave + 1} is next` : 'Choose your squad', view.w / 2, 50, { size: 46, align: 'center', base: 'middle', color: '#ffe14a', stroke: INK, lw: 10 });
  if (between) {
    const mix = waveMix(app.G.waves[app.squadUi.wave]);
    const total = Math.max(1, Object.values(mix).reduce((a, b) => a + b, 0));
    text(ctx, `${app.G.waves[app.squadUi.wave].name}. Incoming:`, view.w / 2 - 190, 94, { size: 20, align: 'right', base: 'middle', color: '#c9ceee', weight: 600 });
    let x = view.w / 2 - 170;
    TAG_ORDER.forEach(tag => {
      const pct = Math.round((mix[tag] / total) * 100);
      x += chip(ctx, `${tag} ${pct}%`, x, 79, TAGS[tag].color, { size: 15, h: 28 }) + 8;
    });
  } else {
    text(ctx, 'Tap heroes to pick three. Tap the pencil to rename. Unlock more by reaching later waves.', view.w / 2, 94, { size: 20, align: 'center', base: 'middle', color: '#c9ceee', weight: 600 });
  }
  ROSTER.forEach((id, i) => drawCard(ctx, app, id, i));
  drawDetail(ctx, app);
}

