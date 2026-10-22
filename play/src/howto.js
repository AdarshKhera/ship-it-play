import { INK, TAGS, TAG_ORDER, view } from './config.js';
import { drawFrame, drawPortrait } from './assets.js';
import { drawSpriteCanvas } from './props.js';
import { chip, panel, text, TAU } from './draw.js';
import { backIcon, drawBackdrop } from './ui.js';

export const HOWTO_SLIDES = 4;

const SLIDES = [
  { title: 'Move. Your hero fights.', lines: ['Drag on the left side of the screen, or use WASD / arrow keys.', 'Your hero aims and fires on its own.', 'Dodge red circles and glowing shots.'] },
  { title: 'Match the colours', lines: ['Every enemy health bar is split into colours.', 'A hero hits its own colour 2.4x harder.', 'Tap TAG (or press Shift) to swap to the right hero.'] },
  { title: 'Charge your POWER', lines: ['One pip fills every 4 seconds.', 'Fire at 1, 2 or 3 pips. Bigger every time.', 'Three pips is a wave-wrecker.'] },
  { title: 'Drinks and DRIs', lines: ["Grab your hero's drink for OVERDRIVE.", "Grab a teammate's drink to charge them for later.", 'In big surges a DRI drops in and hits every colour equally.'] },
];

function art(ctx, app, i, x, y, w, h) {
  const { A, t } = app;
  const cx = x + w / 2;
  const cy = y + h / 2;
  if (i === 0) {
    ctx.save(); ctx.globalAlpha = 0.9;
    ctx.beginPath(); ctx.arc(x + 90, cy + 70, 62, 0, TAU); ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = '#ffffff'; ctx.stroke();
    const a = t * 1.6;
    ctx.beginPath(); ctx.arc(x + 90 + Math.cos(a) * 26, cy + 70 + Math.sin(a) * 26, 28, 0, TAU); ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke();
    ctx.restore();
    drawFrame(ctx, A.sprites.dave, 'idle', Math.floor(t * 8) % 6, cx + 20, cy + 70, 1.1);
    const e = A.sprites.e1_code;
    drawFrame(ctx, e, 'walk', Math.floor(t * 11) % 8, x + w - 70, cy + 70, 0.8, { flip: true });
    for (let k = 0; k < 3; k++) {
      const px = cx + 80 + ((t * 300 + k * 90) % 270);
      ctx.beginPath(); ctx.ellipse(px, cy + 20, 22, 12, 0, 0, TAU); ctx.fillStyle = TAGS.CODE.color; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke();
    }
  } else if (i === 1) {
    TAG_ORDER.forEach((tag, k) => {
      const hx = x + 70 + k * 100;
      const id = ['dave', 'mei', 'sam', 'jo'][k];
      ctx.beginPath(); ctx.arc(hx, cy - 130, 40, 0, TAU); ctx.fillStyle = INK; ctx.fill();
      drawPortrait(ctx, A.sprites, id, hx, cy - 130, 70, TAGS[tag].color);
      chip(ctx, tag, hx, cy - 82, TAGS[tag].color, { size: 12, h: 22, align: 'center' });
    });
    const ex = cx + 10;
    drawFrame(ctx, A.sprites.e4_code, 'walk', Math.floor(t * 11) % 8, ex, cy + 170, 0.8);
    const segs = [['CODE', 0.55], ['DESIGN', 1]];
    segs.forEach(([tag, f], k) => {
      const bx = ex - 62 + k * 66;
      ctx.fillStyle = INK; ctx.fillRect(bx - 3, cy + 6, 62, 17);
      ctx.fillStyle = '#2d3350'; ctx.fillRect(bx, cy + 9, 56, 11);
      ctx.fillStyle = TAGS[tag].color; ctx.fillRect(bx, cy + 9, 56 * (f - (tag === 'CODE' ? (Math.sin(t * 2) * 0.2 + 0.2) : 0)), 11);
    });
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 4; ctx.setLineDash([8, 8]);
    ctx.beginPath(); ctx.moveTo(x + 70, cy - 50); ctx.lineTo(ex - 34, cy + 2); ctx.stroke(); ctx.setLineDash([]);
  } else if (i === 2) {
    const r = 74;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.fillStyle = TAGS.CODE.color; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke();
    text(ctx, 'POWER', cx, cy + 4, { size: 30, align: 'center', base: 'middle', color: INK });
    const fill = (t * 0.5) % 3;
    for (let k = 0; k < 3; k++) {
      const a0 = -Math.PI / 2 + (k / 3) * TAU + 0.12;
      const a1 = -Math.PI / 2 + ((k + 1) / 3) * TAU - 0.12;
      ctx.lineWidth = 14; ctx.lineCap = 'round'; ctx.strokeStyle = INK; ctx.beginPath(); ctx.arc(cx, cy, r + 16, a0, a1); ctx.stroke();
      ctx.lineWidth = 8; ctx.strokeStyle = '#2b3150'; ctx.beginPath(); ctx.arc(cx, cy, r + 16, a0, a1); ctx.stroke();
      const f = Math.max(0, Math.min(1, fill - k));
      if (f > 0.02) { ctx.strokeStyle = '#ffe14a'; ctx.beginPath(); ctx.arc(cx, cy, r + 16, a0, a0 + (a1 - a0) * f); ctx.stroke(); }
    }
    ['I', 'II', 'III'].forEach((n, k) => text(ctx, n, cx - 110 + k * 110, cy + 142, { size: 30, align: 'center', base: 'middle', color: k <= Math.floor(fill) ? '#ffe14a' : '#59608c', stroke: INK }));
  } else {
    drawSpriteCanvas(ctx, A.fuel.coffee, x + 90, cy + 56, 1.5);
    drawSpriteCanvas(ctx, A.fuel.cola, x + 170, cy + 56, 1.5);
    drawFrame(ctx, A.sprites.dri_rhea, 'idle', Math.floor(t * 8) % 6, cx + 70, cy + 100 + Math.sin(t * 3) * 8, 1.15);
    text(ctx, 'DRI', cx + 70, cy - 70, { size: 34, align: 'center', base: 'middle', color: '#ffd23f', stroke: INK });
  }
}

export function drawHowto(ctx, app) {
  const { ui, t } = app;
  const i = app.howto.i;
  const s = SLIDES[i];
  const cx = view.w / 2;
  drawBackdrop(ctx, t);
  ui.round(ctx, 'howto:back', 56, 56, 30, (c, r, col) => backIcon(c, r, col));
  text(ctx, 'HOW TO PLAY', cx, 52, { size: 44, align: 'center', base: 'middle', color: '#ffe14a', stroke: INK, lw: 10 });
  panel(ctx, cx - 480, 104, 960, 460, { fill: 'rgba(16,19,48,0.9)', r: 32 });
  art(ctx, app, i, cx - 460, 120, 440, 420);
  text(ctx, s.title, cx + 20, 190, { size: 40 });
  s.lines.forEach((ln, k) => {
    ctx.beginPath(); ctx.arc(cx + 30, 252 + k * 78, 9, 0, TAU); ctx.fillStyle = TAGS[TAG_ORDER[(i + k) % 4]].color; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.stroke();
    const words = ln.split(' ');
    let line = '';
    let row = 0;
    ctx.font = `600 24px "Fredoka", system-ui, sans-serif`;
    words.forEach(wd => {
      const test = line ? `${line} ${wd}` : wd;
      if (ctx.measureText(test).width > 400 && line) { text(ctx, line, cx + 54, 258 + k * 78 + row * 30, { size: 24, color: '#e3e6ff', weight: 600 }); line = wd; row++; } else line = test;
    });
    text(ctx, line, cx + 54, 258 + k * 78 + row * 30, { size: 24, color: '#e3e6ff', weight: 600 });
  });
  for (let d = 0; d < HOWTO_SLIDES; d++) {
    ctx.beginPath(); ctx.arc(cx - 36 + d * 24, 596, d === i ? 9 : 6, 0, TAU); ctx.fillStyle = d === i ? '#ffe14a' : '#59608c'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.stroke();
  }
  if (i > 0) ui.button(ctx, 'howto:prev', cx - 480, 618, 200, 62, 'BACK', { style: 'ghost', size: 24 });
  const last = i === HOWTO_SLIDES - 1;
  ui.button(ctx, last ? 'howto:done' : 'howto:next', cx + 280, 618, 200, 62, last ? "LET'S GO" : 'NEXT', { style: last ? 'primary' : 'secondary', size: 26, pulse: last });
}
