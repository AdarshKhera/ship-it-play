import { FONT, INK, MAX_PIPS, TAGS, view } from './config.js';
import { drawPortrait } from './assets.js';
import { totalHp } from './rules.js';
import { STICK } from './input.js';
import { bar, chip, panel, rrect, TAU, text } from './draw.js';

export const POWER_BTN = { get x() { return view.w - 134; }, y: 590, r: 78 };
export const SWAP_BTN = { get x() { return view.w - 300; }, y: 646, r: 52 };
export const PAUSE_BTN = { get x() { return view.w - 44; }, y: 44, r: 28 };
export const benchSlot = i => ({ x: 56 + i * 92, y: 168, r: 38 });

function drawBench(ctx, G, A) {
  G.squad.forEach((h, i) => {
    const s = benchSlot(i);
    const active = i === G.active;
    const color = TAGS[h.def.tag].color;
    ctx.save();
    if (h.downed) ctx.globalAlpha = 0.4;
    ctx.beginPath(); ctx.arc(s.x, s.y, s.r + 5, 0, TAU); ctx.fillStyle = INK; ctx.fill();
    drawPortrait(ctx, A.sprites, h.id, s.x, s.y, s.r * 2 - 6, active ? color : '#2b3150');
    ctx.restore();
    ctx.lineWidth = 7;
    ctx.strokeStyle = '#1b2038';
    ctx.beginPath(); ctx.arc(s.x, s.y, s.r + 3, 0, TAU); ctx.stroke();
    ctx.strokeStyle = h.hp / h.max > 0.4 ? '#4ade80' : '#ff5a5a';
    ctx.beginPath(); ctx.arc(s.x, s.y, s.r + 3, -Math.PI / 2, -Math.PI / 2 + TAU * Math.max(0, h.hp / h.max)); ctx.stroke();
    if (active) {
      ctx.lineWidth = 4; ctx.strokeStyle = '#fff';
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r + 10, 0, TAU); ctx.stroke();
    }
    ctx.beginPath(); ctx.arc(s.x - 28, s.y - 28, 15, 0, TAU); ctx.fillStyle = color; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke();
    text(ctx, String(i + 1), s.x - 28, s.y - 27, { size: 19, color: INK, align: 'center', base: 'middle' });
    if (h.odStored > 0 && !h.downed) {
      ctx.beginPath(); ctx.arc(s.x + 29, s.y - 27, 16, 0, TAU); ctx.fillStyle = '#ffe14a'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke();
      text(ctx, '⚡', s.x + 29, s.y - 26, { size: 19, color: INK, align: 'center', base: 'middle', weight: 400 });
    }
  });
}

function drawActiveCard(ctx, G, A) {
  const h = G.squad[G.active];
  const color = TAGS[h.def.tag].color;
  panel(ctx, 16, 14, 360, 98, { accent: color });
  drawPortrait(ctx, A.sprites, h.id, 74, 63, 70, color);
  ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.beginPath(); ctx.arc(74, 63, 36, 0, TAU); ctx.stroke();
  text(ctx, h.name, 124, 44, { size: 30 });
  chip(ctx, h.def.tag, 124 + 8 + ctx.measureText(h.name).width, 21, color, { size: 16, h: 26 });
  text(ctx, h.title, 124, 66, { size: 18, color: '#aab1d0', weight: 600 });
  bar(ctx, 124, 78, 238, 16, h.hp / h.max, h.hp / h.max > 0.4 ? '#4ade80' : '#ff5a5a');
  if (h.od > 0) {
    const k = h.od / (7 + G.mods.overdriveBonus);
    bar(ctx, 124, 100, 238, 7, k, color, { lw: 3 });
    text(ctx, 'OVERDRIVE', 372, 106, { size: 14, color, align: 'right', stroke: INK });
  }
}

function drawTopCenter(ctx, G) {
  const def = G.waves[G.wave];
  const left = G.enemies.reduce((n, e) => n + (e.dead ? 0 : 1), 0) + G.queue.length;
  const label = `WAVE ${G.wave + 1}/${G.waves.length}  ${def.name}`;
  ctx.font = `700 22px ${FONT}`;
  const w = Math.max(280, ctx.measureText(label).width + 56);
  panel(ctx, view.w / 2 - w / 2, 14, w, 52, { r: 26 });
  text(ctx, label, view.w / 2, 41, { size: 22, align: 'center', base: 'middle' });
  const prog = 1 - left / Math.max(1, Object.values(def.spawn).reduce((a, b) => a + b, 0));
  bar(ctx, view.w / 2 - w / 2 + 24, 56, w - 48, 6, Math.max(0, Math.min(1, prog)), '#ffb627', { lw: 3 });
  const boss = G.enemies.find(e => e.def.boss && !e.dead);
  if (boss) {
    const total = 560;
    panel(ctx, view.w / 2 - total / 2 - 10, 78, total + 20, 62, { r: 18 });
    text(ctx, boss.def.name.toUpperCase(), view.w / 2, 100, { size: 20, align: 'center', base: 'middle' });
    const gap = 6;
    const w2 = (total - gap * 3) / 4;
    boss.segs.forEach((s, i) => bar(ctx, view.w / 2 - total / 2 + i * (w2 + gap), 114, w2, 14, s.hp / s.max, TAGS[s.tag].color, { lw: 4 }));
    void totalHp;
  }
}

function drawScore(ctx, G) {
  text(ctx, String(G.score).padStart(6, '0'), view.w - 90, 46, { size: 38, align: 'right', stroke: INK });
  if (G.combo >= 2) {
    const k = Math.min(1, G.comboT / 3.2);
    text(ctx, `x${G.combo}`, view.w - 90, 92, { size: 38 + Math.min(20, G.combo), align: 'right', color: '#ffe14a', stroke: INK });
    bar(ctx, view.w - 220, 104, 130, 8, k, '#ffe14a', { lw: 3 });
  }
  ctx.beginPath(); ctx.arc(PAUSE_BTN.x, PAUSE_BTN.y, PAUSE_BTN.r, 0, TAU); ctx.fillStyle = 'rgba(17,20,42,0.88)'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke();
  ctx.fillStyle = '#fff';
  rrect(ctx, PAUSE_BTN.x - 9, PAUSE_BTN.y - 10, 6, 20, 2); ctx.fill();
  rrect(ctx, PAUSE_BTN.x + 3, PAUSE_BTN.y - 10, 6, 20, 2); ctx.fill();
}

function drawPowerButton(ctx, G) {
  const h = G.squad[G.active];
  const color = TAGS[h.def.tag].color;
  const b = POWER_BTN;
  const tier = Math.floor(G.pips);
  const ready = tier >= 1;
  const t = performance.now() / 1000;
  const pulse = ready ? 1 + Math.sin(t * 8) * 0.04 * tier : 1;
  ctx.save();
  ctx.translate(b.x, b.y);
  ctx.scale(pulse, pulse);
  if (ready) {
    const g = ctx.createRadialGradient(0, 0, b.r * 0.6, 0, 0, b.r * 1.6);
    g.addColorStop(0, color + '99'); g.addColorStop(1, color + '00');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, b.r * 1.6, 0, TAU); ctx.fill();
  }
  ctx.beginPath(); ctx.arc(0, 8, b.r, 0, TAU); ctx.fillStyle = INK; ctx.fill();
  ctx.beginPath(); ctx.arc(0, 0, b.r, 0, TAU); ctx.fillStyle = ready ? color : '#39406a'; ctx.fill();
  ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke();
  ctx.beginPath(); ctx.arc(-b.r * 0.2, -b.r * 0.35, b.r * 0.5, Math.PI, Math.PI * 1.8); ctx.lineWidth = 8; ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineCap = 'round'; ctx.stroke();
  for (let i = 0; i < MAX_PIPS; i++) {
    const a0 = -Math.PI / 2 + (i / MAX_PIPS) * TAU + 0.12;
    const a1 = -Math.PI / 2 + ((i + 1) / MAX_PIPS) * TAU - 0.12;
    const fill = Math.max(0, Math.min(1, G.pips - i));
    ctx.lineWidth = 12; ctx.lineCap = 'round';
    ctx.strokeStyle = INK; ctx.beginPath(); ctx.arc(0, 0, b.r + 15, a0, a1); ctx.stroke();
    ctx.lineWidth = 7; ctx.strokeStyle = '#2b3150'; ctx.beginPath(); ctx.arc(0, 0, b.r + 15, a0, a1); ctx.stroke();
    if (fill > 0.02) { ctx.strokeStyle = fill >= 1 ? '#ffe14a' : '#ffb627'; ctx.beginPath(); ctx.arc(0, 0, b.r + 15, a0, a0 + (a1 - a0) * fill); ctx.stroke(); }
  }
  text(ctx, ready ? 'POWER' : 'CHARGING', 0, -8, { size: ready ? 28 : 20, align: 'center', base: 'middle', color: ready ? INK : '#9aa3cf' });
  text(ctx, h.def.power.name, 0, 24, { size: 17, align: 'center', base: 'middle', color: ready ? INK : '#7d86b3', weight: 600 });
  if (ready) text(ctx, 'x'.repeat(0) + ['', 'I', 'II', 'III'][tier], 0, -48, { size: 26, align: 'center', base: 'middle', color: '#ffffff', stroke: INK });
  ctx.restore();
}

function drawSwapButton(ctx, G) {
  const b = SWAP_BTN;
  const can = G.swapCd <= 0 && G.squad.filter(h => !h.downed).length > 1;
  ctx.beginPath(); ctx.arc(b.x, b.y + 6, b.r, 0, TAU); ctx.fillStyle = INK; ctx.fill();
  ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, TAU); ctx.fillStyle = can ? '#6c7bff' : '#39406a'; ctx.fill();
  ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke();
  text(ctx, 'TAG', b.x, b.y - 6, { size: 26, align: 'center', base: 'middle', color: can ? '#fff' : '#8f98c8' });
  text(ctx, 'swap', b.x, b.y + 18, { size: 16, align: 'center', base: 'middle', color: can ? '#d7dbff' : '#707aa8', weight: 600 });
}

function drawEventBanners(ctx, G) {
  const sg = G.surge;
  if (sg && sg.t < 2.6) {
    const pulse = 0.5 + 0.5 * Math.sin(sg.t * 14);
    const g = ctx.createRadialGradient(view.w / 2, view.h / 2, view.h * 0.35, view.w / 2, view.h / 2, view.h * 0.9);
    g.addColorStop(0, 'rgba(255,60,60,0)'); g.addColorStop(1, `rgba(255,60,60,${0.18 + pulse * 0.22})`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, view.w, view.h);
    const k = Math.min(1, sg.t * 6);
    ctx.save(); ctx.globalAlpha = k;
    panel(ctx, view.w / 2 - 330, 150, 660, 92, { fill: 'rgba(60,14,20,0.94)', stroke: INK, r: 28 });
    text(ctx, `INCIDENT: ${sg.def.label.toUpperCase()}`, view.w / 2, 184, { size: 32, align: 'center', base: 'middle', color: pulse > 0.5 ? '#ff7a7a' : '#ffd0d0' });
    text(ctx, sg.def.dri ? 'A DRI is on the way. Hold the line!' : 'Brace for impact!', view.w / 2, 218, { size: 20, align: 'center', base: 'middle', color: '#ffc9c9', weight: 600 });
    ctx.restore();
  }
  const d = G.driBanner;
  if (d) {
    const a = Math.min(1, d.t * 5, (3.2 - d.t) * 3);
    ctx.save(); ctx.globalAlpha = Math.max(0, a);
    panel(ctx, view.w / 2 - 300, 150, 600, 92, { fill: 'rgba(48,38,8,0.95)', stroke: INK, r: 28 });
    text(ctx, `DRI ${d.name} HAS JOINED`, view.w / 2, 184, { size: 32, align: 'center', base: 'middle', color: '#ffd23f' });
    text(ctx, `${d.title}. Hits every colour equally for 18s.`, view.w / 2, 218, { size: 19, align: 'center', base: 'middle', color: '#f3e3a6', weight: 600 });
    ctx.restore();
  }
}

function drawBanners(ctx, G) {
  drawEventBanners(ctx, G);
  if ((G.mode === 'play' && G.introT > 0) || G.mode === 'clear') {
    const age = G.mode === 'clear' ? Math.min(1, G.clearT, (2.2 - G.clearT) * 4) : Math.min(1, G.introT * 2, (2.6 - G.introT) * 4);
    const a = Math.max(0, Math.min(1, age));
    ctx.save();
    ctx.globalAlpha = a;
    const y = 150 - (1 - a) * 16;
    const sub = G.mode === 'play' && G.wave === 0;
    panel(ctx, view.w / 2 - 340, y, 680, sub ? 92 : 68, { fill: 'rgba(17,20,42,0.92)', r: 28 });
    text(ctx, G.banner, view.w / 2, y + 34, { size: 38, align: 'center', base: 'middle', color: G.mode === 'clear' ? '#4ade80' : '#ffe14a' });
    if (sub) text(ctx, 'Clear the sprint before it clears you', view.w / 2, y + 68, { size: 20, align: 'center', base: 'middle', color: '#aab1d0', weight: 600 });
    ctx.restore();
  }
  if (G.powerBanner) {
    const b = G.powerBanner;
    const k = b.t / 1.3;
    const s = k < 0.12 ? 0.5 + (k / 0.12) * 0.7 : 1.2 - Math.min(0.2, (k - 0.12) * 0.5);
    ctx.save();
    ctx.globalAlpha = k > 0.7 ? 1 - (k - 0.7) / 0.3 : 1;
    ctx.translate(view.w / 2, 210); ctx.scale(s, s);
    text(ctx, `${b.name} ${['', 'I', 'II', 'III'][b.tier]}`, 0, 0, { size: 66 + b.tier * 8, align: 'center', base: 'middle', color: b.color, stroke: INK, lw: 14 });
    ctx.restore();
  }
  if (G.comboBanner) {
    const k = G.comboBanner.t / 1.2;
    ctx.save();
    ctx.globalAlpha = k > 0.7 ? 1 - (k - 0.7) / 0.3 : 1;
    ctx.translate(view.w - 250, 250 - k * 24);
    ctx.rotate(-0.06);
    text(ctx, G.comboBanner.text, 0, 0, { size: 46, align: 'center', base: 'middle', color: '#ffe14a', stroke: INK, lw: 10 });
    ctx.restore();
  }
  if (G.bossIntro) {
    const k = G.bossIntro.t / 2.4;
    ctx.save();
    ctx.globalAlpha = k > 0.75 ? 1 - (k - 0.75) / 0.25 : Math.min(1, k * 5);
    ctx.fillStyle = 'rgba(40,0,10,0.45)'; ctx.fillRect(0, 280, view.w, 150);
    text(ctx, 'FINAL BOSS', view.w / 2, 330, { size: 28, align: 'center', base: 'middle', color: '#ff8a8a', stroke: INK });
    text(ctx, G.bossIntro.name.toUpperCase(), view.w / 2, 386, { size: 74, align: 'center', base: 'middle', color: '#ffffff', stroke: INK, lw: 14 });
    ctx.restore();
  }
  if (G.toast) {
    const k = G.toast.t / G.toast.dur;
    const a = Math.min(1, G.toast.t * 4, (1 - k) * 6);
    ctx.save();
    ctx.globalAlpha = Math.max(0, a);
    ctx.font = `700 24px ${FONT}`;
    const w = Math.min(780, ctx.measureText(G.toast.text).width + 52);
    panel(ctx, 500 - w / 2, 624, w, 54, { r: 27, fill: 'rgba(17,20,42,0.92)' });
    text(ctx, G.toast.text, 500, 651, { size: 24, align: 'center', base: 'middle' });
    ctx.restore();
  }
}

function drawStick(ctx, input) {
  const s = input.stick;
  if (s.id === null) return;
  ctx.save();
  ctx.globalAlpha = 0.6;
  ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.beginPath(); ctx.arc(s.ox, s.oy, STICK.radius, 0, TAU); ctx.stroke();
  ctx.lineWidth = 3; ctx.strokeStyle = '#ffffff'; ctx.beginPath(); ctx.arc(s.ox, s.oy, STICK.radius, 0, TAU); ctx.stroke();
  const dx = s.x - s.ox;
  const dy = s.y - s.oy;
  const d = Math.min(STICK.radius, Math.hypot(dx, dy));
  const a = Math.atan2(dy, dx);
  ctx.beginPath(); ctx.arc(s.ox + Math.cos(a) * d, s.oy + Math.sin(a) * d, 36, 0, TAU);
  ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke();
  ctx.restore();
}

export function drawHud(ctx, G, A, input) {
  drawActiveCard(ctx, G, A);
  drawBench(ctx, G, A);
  drawTopCenter(ctx, G);
  drawScore(ctx, G);
  drawPowerButton(ctx, G);
  drawSwapButton(ctx, G);
  drawBanners(ctx, G);
  drawStick(ctx, input);
}

