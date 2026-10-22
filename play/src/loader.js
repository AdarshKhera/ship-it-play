import { FONT, INK, TAGS, TAG_ORDER, view } from './config.js';
import { rrect, text, TAU } from './draw.js';

const TIPS = [
  'Match your hero colour to the enemy bar for big damage.',
  'Three pips of POWER hits far harder than one.',
  'A DRI drops in when the surge gets serious.',
  "Grab a teammate's drink to charge them for later.",
  'Swapping heroes gives a free blast and a split second of safety.',
];

export function drawLoader(ctx, progress, t) {
  const cx = view.w / 2;
  const g = ctx.createLinearGradient(0, 0, 0, view.h);
  g.addColorStop(0, '#2d3370'); g.addColorStop(1, '#12153a');
  ctx.fillStyle = g; ctx.fillRect(0, 0, view.w, view.h);
  ctx.font = `700 120px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  const bounce = Math.sin(t * 3) * 6;
  ctx.lineWidth = 28; ctx.strokeStyle = INK; ctx.strokeText('SHIP IT', cx, 240 + bounce);
  ctx.fillStyle = '#ffd23f'; ctx.fillText('SHIP IT', cx, 240 + bounce);
  TAG_ORDER.forEach((tag, i) => {
    const y = 360 + Math.sin(t * 5 + i) * 10;
    ctx.beginPath(); ctx.arc(cx - 66 + i * 44, y, 14, 0, TAU); ctx.fillStyle = TAGS[tag].color; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke();
  });
  const w = 520;
  rrect(ctx, cx - w / 2 - 5, 420 - 5, w + 10, 38, 19); ctx.fillStyle = INK; ctx.fill();
  rrect(ctx, cx - w / 2, 420, w, 28, 14); ctx.fillStyle = '#2b3150'; ctx.fill();
  const fw = Math.max(28, w * Math.min(1, progress));
  rrect(ctx, cx - w / 2, 420, fw, 28, 14); ctx.fillStyle = '#ffb627'; ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; rrect(ctx, cx - w / 2 + 6, 424, Math.max(16, fw - 12), 8, 4); ctx.fill();
  text(ctx, `Loading ${Math.round(Math.min(1, progress) * 100)}%`, cx, 484, { size: 22, align: 'center', base: 'middle', color: '#c9ceee', weight: 600 });
  text(ctx, TIPS[Math.floor(t / 2.6) % TIPS.length], cx, 560, { size: 22, align: 'center', base: 'middle', color: '#aab1d0', weight: 600 });
}
