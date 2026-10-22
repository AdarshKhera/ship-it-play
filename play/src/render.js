import { FONT, INK, TAGS, ZOOM, tagColor, view, visible } from './config.js';
import { drawFrame } from './assets.js';
import { drawFxWorld } from './fx.js';
import { drawSpriteCanvas } from './props.js';
import { drawBadge } from './icons.js';
import { drawZones } from './zones.js';

const TAU = Math.PI * 2;
const GOLD = '#ffd23f';
const LS = 1 / ZOOM;

function shadow(ctx, x, y, rx, a = 0.28) {
  ctx.fillStyle = `rgba(20,22,40,${a})`;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, rx * 0.34, 0, 0, TAU);
  ctx.fill();
}

function pill(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function label(ctx, str, x, y, size, color = '#ffffff', weight = 700) {
  ctx.font = `${weight} ${size}px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.lineJoin = 'round';
  ctx.lineWidth = Math.max(4, size * 0.28);
  ctx.strokeStyle = INK;
  ctx.strokeText(str, x, y);
  ctx.fillStyle = color;
  ctx.fillText(str, x, y);
}

function drawBars(ctx, e, x, y, activeTag) {
  const n = e.segs.length;
  const total = (e.def.boss ? 300 : e.def.elite ? 120 : 58) * (e.def.boss ? 1 : 1);
  const gap = 4;
  const w = (total - gap * (n - 1)) / n;
  const h = e.def.boss ? 16 : e.def.elite ? 12 : 9;
  const x0 = x - total / 2;
  const pulse = 0.5 + 0.5 * Math.sin(performance.now() / 160);
  for (let i = 0; i < n; i++) {
    const s = e.segs[i];
    const bx = x0 + i * (w + gap);
    const match = activeTag && s.tag === activeTag && s.hp > 0;
    pill(ctx, bx - 3, y - 3, w + 6, h + 6, (h + 6) / 2);
    ctx.fillStyle = match ? '#ffffff' : INK;
    ctx.fill();
    if (match) { ctx.save(); ctx.globalAlpha = 0.25 + pulse * 0.35; pill(ctx, bx - 6, y - 6, w + 12, h + 12, (h + 12) / 2); ctx.fillStyle = TAGS[s.tag].color; ctx.fill(); ctx.restore(); }
    pill(ctx, bx - 1, y - 1, w + 2, h + 2, (h + 2) / 2);
    ctx.fillStyle = INK;
    ctx.fill();
    pill(ctx, bx, y, w, h, h / 2);
    ctx.fillStyle = '#2d3350';
    ctx.fill();
    const fw = Math.max(0, (s.hp / s.max) * w);
    if (fw > 0.5) {
      pill(ctx, bx, y, Math.max(h, fw), h, h / 2);
      ctx.save();
      ctx.clip();
      ctx.fillStyle = TAGS[s.tag].color;
      ctx.globalAlpha = activeTag && !match ? 0.78 : 1;
      ctx.fillRect(bx, y, fw, h);
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.fillRect(bx, y, fw, h * 0.35);
      ctx.restore();
    }
  }
}

function drawLockFrame(ctx, e, x, y, color) {
  const r = e.def.radius * 1.15;
  const cy = y - e.def.radius * 0.95;
  const pop = Math.min(1, (e.lock ? e.lock.dur - e.frozen : 0) * 7 + 0.35);
  const s = r * (1.6 - 0.6 * pop);
  ctx.save();
  ctx.translate(x, cy);
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = 'rgba(255,79,163,0.16)';
  ctx.fillRect(-s, -s, s * 2, s * 2);
  ctx.lineWidth = 9; ctx.strokeStyle = INK; ctx.lineCap = 'round';
  const L = s * 0.5;
  const corners = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
  corners.forEach(([sx, sy]) => { ctx.beginPath(); ctx.moveTo(sx * s, sy * (s - L)); ctx.lineTo(sx * s, sy * s); ctx.lineTo(sx * (s - L), sy * s); ctx.stroke(); });
  ctx.lineWidth = 5; ctx.strokeStyle = color;
  corners.forEach(([sx, sy]) => {
    ctx.beginPath(); ctx.moveTo(sx * s, sy * (s - L)); ctx.lineTo(sx * s, sy * s); ctx.lineTo(sx * (s - L), sy * s); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.strokeStyle = INK; ctx.lineWidth = 3;
    ctx.fillRect(sx * s - 6, sy * s - 6, 12, 12); ctx.strokeRect(sx * s - 6, sy * s - 6, 12, 12);
    ctx.strokeStyle = color;
  });
  ctx.restore();
}

function drawEnemy(ctx, G, A, e, activeTag) {
  const set = A.sprites[e.sprite];
  if (!set) return;
  const def = e.def;
  const tagCol = TAGS[e.segs[0].tag].color;
  const flyer = def.cls === 'flyer';
  const hover = flyer ? 14 + Math.sin(e.t * 6) * 8 : 0;

  if (!e.dead) shadow(ctx, e.x, e.y, def.radius * (flyer ? 0.7 : 0.95), flyer ? 0.2 : 0.3);
  if (!e.dead && def.elite) {
    ctx.save(); ctx.lineWidth = 6; ctx.strokeStyle = tagCol; ctx.globalAlpha = 0.9;
    ctx.beginPath(); ctx.ellipse(e.x, e.y, def.radius * 1.05, def.radius * 0.36, 0, 0, TAU); ctx.stroke();
    if (e.segs.length > 1) { ctx.strokeStyle = TAGS[e.segs[1].tag].color; ctx.setLineDash([16, 14]); ctx.stroke(); }
    ctx.restore();
  }

  let anim = 'walk';
  let frame;
  let alpha = 1;
  let sx = 1;
  let sy = 1;
  let rot = 0;
  let scale = def.scale * (0.35 + 0.65 * e.spawnT);
  const jitter = e.state === 'tele' || e.state === 'wind' ? (Math.random() - 0.5) * 6 : 0;
  if (e.dead) {
    if (flyer) {
      const k = Math.min(1, e.deadT / 0.4);
      scale *= 1 - k * 0.7; alpha = 1 - k; rot = e.deadT * 14;
      frame = Math.floor(e.t * 14) % set.walk.n;
    } else {
      anim = 'death';
      frame = Math.min(set.death.n - 1, Math.floor(e.deadT * (set.death.n / 0.38)));
      if (e.deadT > 0.5) alpha = Math.max(0, 1 - (e.deadT - 0.5) / 0.3);
    }
  } else if (e.hitAnimT < 0.2 && set.hit) {
    anim = 'hit';
    frame = Math.min(set.hit.n - 1, Math.floor(e.hitAnimT * 16));
  } else {
    frame = Math.floor(e.t * (flyer ? 14 : 11) * (e.slow > 0 ? 0.55 : 1)) % set.walk.n;
    if (e.frozen > 0) frame = 0;
  }
  if (e.hitAnimT < 0.12) { sx = 1.1; sy = 0.92; }
  const x = e.x + jitter;
  const y = e.y - hover;
  drawFrame(ctx, set, anim, frame, x, y, scale, { flip: e.face <= 0, alpha, sx, sy, rot });
  if (e.dead) return;
  if (!flyer && def.icon) {
    const bob = Math.sin(e.t * 11) * 1.5;
    const br = def.boss ? 19 : def.elite ? 13 : 9;
    const bodyH = (set.walk.fh || 150) * scale;
    drawBadge(ctx, def.icon, x + (e.face > 0 ? 1 : -1) * 0, y - bodyH * (def.elite ? 0.2 : 0.2) + bob, br * Math.min(1, 0.6 + e.spawnT * 0.4), tagCol);
  }
  if (e.frozen > 0 && e.lock) drawLockFrame(ctx, e, e.x, e.y, TAGS.DESIGN.color);

  const top = e.y - hover - def.radius * (flyer ? 3.1 : 3.15);
  drawBars(ctx, e, e.x, top, activeTag);
  if (def.elite) label(ctx, def.name, e.x, top - 10, (def.boss ? 26 : 17) * LS * 0.82);
  else label(ctx, def.name, e.x, e.y + 24, 11.5 * LS, '#fdfdff', 600);
  if (e.vuln > 0) {
    const vy = top - (def.elite ? 40 : 16);
    ctx.beginPath(); ctx.arc(e.x, vy, 10 * LS * 0.8, 0, TAU); ctx.fillStyle = TAGS.DESIGN.color; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.stroke();
    label(ctx, '?', e.x, vy + 5, 14 * LS * 0.8, '#ffffff');
  }
  if (e.state === 'tele' || e.state === 'wind') {
    ctx.font = `700 ${def.elite ? 46 : 34}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineWidth = 7; ctx.strokeStyle = INK; ctx.strokeText('!', e.x, top - (def.elite ? 54 : 34));
    ctx.fillStyle = '#ff5252'; ctx.fillText('!', e.x, top - (def.elite ? 54 : 34));
  }
}

function drawHero(ctx, G, A, h) {
  const set = A.sprites[h.id];
  const color = TAGS[h.def.tag].color;
  shadow(ctx, h.x, h.y, 34, 0.32);
  const pulse = 0.5 + 0.5 * Math.sin(h.t * 5);
  ctx.save();
  ctx.lineWidth = 7; ctx.strokeStyle = INK;
  ctx.beginPath(); ctx.ellipse(h.x, h.y, 40, 15, 0, 0, TAU); ctx.stroke();
  ctx.lineWidth = 4.5; ctx.strokeStyle = color; ctx.globalAlpha = 0.75 + pulse * 0.25;
  ctx.beginPath(); ctx.ellipse(h.x, h.y, 40, 15, 0, 0, TAU); ctx.stroke();
  ctx.restore();
  if (h.od > 0) {
    const g = ctx.createRadialGradient(h.x, h.y - 60, 8, h.x, h.y - 60, 120);
    g.addColorStop(0, color + 'aa'); g.addColorStop(1, color + '00');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(h.x, h.y - 60, 120, 0, TAU); ctx.fill();
  }
  let anim = h.moving ? 'walk' : 'idle';
  let frame = Math.floor(h.t * (h.moving ? 14 : 8)) % set[anim].n;
  if (h.hurtT > 0) { anim = 'hit'; frame = Math.min(2, Math.floor(((0.34 - h.hurtT) / 0.34) * 3)); }
  const kick = h.fireT < 0.09 ? 1 + (0.09 - h.fireT) * 0.9 : 1;
  const alpha = h.inv > 0 && h.hurtT <= 0 && Math.floor(h.inv * 18) % 2 === 0 ? 0.55 : 1;
  const bob = h.od > 0 ? Math.sin(h.t * 22) * 2 : 0;
  drawFrame(ctx, set, anim, frame, h.x, h.y + bob, h.def.scale, { flip: h.face <= 0, alpha, sx: 1 / kick, sy: kick });
}

function drawMarker(ctx, h) {
  const color = TAGS[h.def.tag].color;
  ctx.save();
  ctx.translate(h.x, h.y - 156 * (h.def.scale / 0.8) + Math.sin(h.t * 6) * 5);
  ctx.beginPath(); ctx.moveTo(-15, 0); ctx.lineTo(15, 0); ctx.lineTo(0, 20); ctx.closePath();
  ctx.fillStyle = color; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.lineJoin = 'round'; ctx.stroke();
  ctx.restore();
}

function drawAlly(ctx, G, A, a) {
  const set = A.sprites[a.def.sprite];
  if (!set) return;
  const lift = a.state === 'fall' ? a.fall : a.state === 'leave' ? a.rise : 0;
  const near = Math.max(0, 1 - lift / 900);
  shadow(ctx, a.x, a.y, 34 * (0.4 + near * 0.6), 0.12 + near * 0.2);
  ctx.save();
  ctx.lineWidth = 7; ctx.strokeStyle = INK;
  ctx.beginPath(); ctx.ellipse(a.x, a.y, 42 * (0.5 + near * 0.5), 16 * (0.5 + near * 0.5), 0, 0, TAU); ctx.stroke();
  ctx.lineWidth = 4.5; ctx.strokeStyle = GOLD;
  ctx.beginPath(); ctx.ellipse(a.x, a.y, 42 * (0.5 + near * 0.5), 16 * (0.5 + near * 0.5), 0, 0, TAU); ctx.stroke();
  ctx.restore();
  const anim = a.state === 'fight' && a.moving ? 'walk' : 'idle';
  const frame = Math.floor(a.t * (anim === 'walk' ? 14 : 8)) % set[anim].n;
  const flap = a.state === 'fight' ? Math.sin(a.t * 12) * 3 : 0;
  drawFrame(ctx, set, anim, frame, a.x, a.y - lift + flap, 0.8, { flip: a.face <= 0 });
  if (a.state !== 'fight') return;
  const ty = a.y - 190;
  const text = `DRI  ${a.def.name}`;
  ctx.font = `700 ${15 * LS * 0.85}px ${FONT}`;
  const w = ctx.measureText(text).width + 22;
  pill(ctx, a.x - w / 2, ty - 15, w, 28, 14); ctx.fillStyle = GOLD; ctx.fill(); ctx.lineWidth = 3.5; ctx.strokeStyle = INK; ctx.stroke();
  ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, a.x, ty - 0.5);
  const k = Math.max(0, a.life / 18);
  pill(ctx, a.x - 34, ty + 18, 68, 8, 4); ctx.fillStyle = INK; ctx.fill();
  pill(ctx, a.x - 32, ty + 20, 64 * k, 4, 2); ctx.fillStyle = GOLD; ctx.fill();
}

function drawCorpse(ctx, A, c) {
  const set = A.sprites[c.id];
  const frame = Math.min(set.death.n - 1, Math.floor(c.t * 15));
  const alpha = c.t > 0.9 ? Math.max(0, 1 - (c.t - 0.9) / 0.5) : 1;
  drawFrame(ctx, set, 'death', frame, c.x, c.y, 0.8, { flip: c.face <= 0, alpha });
}

function drawPickup(ctx, G, A, p) {
  const owner = G.squad.find(s => s.def.fuel.kind === p.kind);
  const color = owner ? TAGS[owner.def.tag].color : '#ffffff';
  const t = p.t;
  const blink = p.life < 4 && Math.floor(p.life * 8) % 2 === 0;
  if (blink) return;
  const bob = Math.sin(t * 4) * 5;
  shadow(ctx, p.x, p.y, 26, 0.25);
  ctx.save();
  ctx.globalAlpha = 0.5 + 0.2 * Math.sin(t * 6);
  const g = ctx.createRadialGradient(p.x, p.y - 30, 4, p.x, p.y - 30, 62);
  g.addColorStop(0, color + 'cc'); g.addColorStop(1, color + '00');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(p.x, p.y - 30, 62, 0, TAU); ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.lineWidth = 6; ctx.strokeStyle = INK;
  ctx.beginPath(); ctx.ellipse(p.x, p.y, 30, 11, 0, 0, TAU); ctx.stroke();
  ctx.lineWidth = 3.5; ctx.strokeStyle = color;
  ctx.beginPath(); ctx.ellipse(p.x, p.y, 30, 11, 0, 0, TAU); ctx.stroke();
  ctx.restore();
  drawSpriteCanvas(ctx, A.fuel[p.kind], p.x, p.y - 4 - p.z - 14 - bob, 0.85);
}

function drawShot(ctx, p) {
  const color = tagColor(p.tag);
  ctx.save();
  ctx.translate(p.x, p.y);
  if (p.kind === 'bolt') {
    ctx.rotate(Math.atan2(p.vy, p.vx));
    const L = 26 + p.r;
    ctx.globalAlpha = 0.35; ctx.fillStyle = color;
    ctx.beginPath(); ctx.ellipse(-L * 0.9, 0, L * 0.9, p.r * 0.5, 0, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
    ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.fillStyle = color;
    ctx.beginPath(); ctx.ellipse(0, 0, L * 0.55, p.r * 0.72, 0, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(2, -1, L * 0.3, p.r * 0.25, 0, 0, TAU); ctx.fill();
  } else if (p.kind === 'dart') {
    ctx.rotate(Math.atan2(p.vy, p.vx));
    const L = 34 + p.r;
    ctx.globalAlpha = 0.3; ctx.fillStyle = color; ctx.fillRect(-L * 1.8, -2.5, L * 1.6, 5); ctx.globalAlpha = 1;
    ctx.beginPath(); ctx.moveTo(L * 0.6, 0); ctx.lineTo(-L * 0.35, -p.r * 0.7); ctx.lineTo(-L * 0.15, 0); ctx.lineTo(-L * 0.35, p.r * 0.7); ctx.closePath();
    ctx.fillStyle = color; ctx.fill(); ctx.lineWidth = 4.5; ctx.strokeStyle = INK; ctx.lineJoin = 'round'; ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(L * 0.35, 0); ctx.lineTo(-L * 0.05, -p.r * 0.25); ctx.lineTo(-L * 0.05, p.r * 0.25); ctx.closePath(); ctx.fill();
  } else if (p.kind === 'orb') {
    const pulse = 1 + Math.sin(p.rot) * 0.06;
    ctx.scale(pulse, pulse);
    ctx.globalAlpha = 0.3; ctx.fillStyle = color; ctx.beginPath(); ctx.arc(0, 0, p.r * 1.5, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
    ctx.fillStyle = color; ctx.lineWidth = 5; ctx.strokeStyle = INK;
    ctx.beginPath(); ctx.arc(0, 0, p.r, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.beginPath(); ctx.arc(-p.r * 0.32, -p.r * 0.32, p.r * 0.34, 0, TAU); ctx.fill();
  } else if (p.kind === 'gold') {
    ctx.rotate(p.rot);
    ctx.beginPath();
    for (let i = 0; i < 12; i++) { const r = i % 2 ? p.r * 0.62 : p.r * 1.2; ctx.lineTo(Math.cos((i * TAU) / 12) * r, Math.sin((i * TAU) / 12) * r); }
    ctx.closePath(); ctx.fillStyle = GOLD; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.lineJoin = 'round'; ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, p.r * 0.32, 0, TAU); ctx.fill();
  } else if (p.kind === 'star') {
    ctx.rotate(p.rot);
    ctx.beginPath();
    for (let i = 0; i < 8; i++) { const r = i % 2 ? p.r * 0.55 : p.r * 1.35; ctx.lineTo(Math.cos((i * TAU) / 8) * r, Math.sin((i * TAU) / 8) * r); }
    ctx.closePath(); ctx.fillStyle = color; ctx.fill(); ctx.lineWidth = 4.5; ctx.strokeStyle = INK; ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, p.r * 0.28, 0, TAU); ctx.fill();
  } else if (p.kind === 'note') {
    ctx.rotate(Math.atan2(p.vy, p.vx) * 0.25 + Math.sin(p.rot) * 0.15);
    const s = p.r * 1.15;
    ctx.fillStyle = '#ffe86a'; ctx.lineWidth = 4.5; ctx.strokeStyle = INK;
    ctx.fillRect(-s, -s, s * 2, s * 2); ctx.strokeRect(-s, -s, s * 2, s * 2);
    ctx.strokeStyle = 'rgba(21,23,31,0.55)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-s * 0.6, -s * 0.3); ctx.lineTo(s * 0.6, -s * 0.3); ctx.moveTo(-s * 0.6, s * 0.15); ctx.lineTo(s * 0.3, s * 0.15); ctx.stroke();
    ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(s, s); ctx.lineTo(s - s * 0.7, s); ctx.lineTo(s, s - s * 0.7); ctx.closePath(); ctx.fill();
  } else if (p.kind === 'bomb') {
    const blink = Math.floor(p.rot * 1.2) % 2 === 0;
    ctx.fillStyle = blink ? '#7dffb0' : color; ctx.lineWidth = 4.5; ctx.strokeStyle = INK;
    ctx.beginPath(); ctx.arc(0, 0, p.r, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-p.r * 0.3, -p.r * 0.3, p.r * 0.3, 0, TAU); ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, -p.r); ctx.lineTo(4, -p.r - 7); ctx.stroke();
    ctx.fillStyle = '#ffe14a'; ctx.beginPath(); ctx.arc(5, -p.r - 8, 3.5, 0, TAU); ctx.fill();
  } else {
    ctx.globalAlpha = 0.3; ctx.fillStyle = color;
    ctx.beginPath(); ctx.ellipse(-p.vx * 0.02, -p.vy * 0.02, p.r * 2, p.r * 1.1, Math.atan2(p.vy, p.vx), 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
    ctx.fillStyle = color; ctx.lineWidth = 4; ctx.strokeStyle = INK;
    ctx.beginPath(); ctx.arc(0, 0, p.r, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-1, -1, p.r * 0.4, 0, TAU); ctx.fill();
  }
  ctx.restore();
}

function drawEnemyShot(ctx, s) {
  ctx.save();
  ctx.translate(s.x, s.y);
  ctx.rotate(s.rot);
  ctx.beginPath();
  for (let i = 0; i < 12; i++) { const r = i % 2 ? s.r * 0.7 : s.r * 1.15; ctx.lineTo(Math.cos((i * TAU) / 12) * r, Math.sin((i * TAU) / 12) * r); }
  ctx.closePath(); ctx.fillStyle = s.color; ctx.fill(); ctx.lineWidth = 4.5; ctx.strokeStyle = INK; ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, s.r * 0.35, 0, TAU); ctx.fill();
  ctx.restore();
}

function drawTelegraph(ctx, t) {
  const k = t.t / t.dur;
  ctx.save();
  ctx.translate(t.x, t.y);
  ctx.globalAlpha = 0.14 + k * 0.3;
  ctx.fillStyle = t.color;
  ctx.beginPath(); ctx.arc(0, 0, t.r, 0, TAU); ctx.fill();
  ctx.globalAlpha = 0.55 + 0.4 * Math.sin(k * 40);
  ctx.setLineDash([22, 14]);
  ctx.lineWidth = 9; ctx.strokeStyle = INK; ctx.beginPath(); ctx.arc(0, 0, t.r, 0, TAU); ctx.stroke();
  ctx.lineWidth = 5; ctx.strokeStyle = t.color; ctx.beginPath(); ctx.arc(0, 0, t.r, 0, TAU); ctx.stroke();
  ctx.setLineDash([]);
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = t.color;
  ctx.beginPath(); ctx.arc(0, 0, t.r * k, 0, TAU); ctx.fill();
  ctx.restore();
}

export function renderScene(ctx, G, A) {
  const cam = { x: G.cam.x, y: G.cam.y };
  const sh = G.fx.shake / ZOOM;
  if (sh > 0) { cam.x += (Math.random() - 0.5) * sh; cam.y += (Math.random() - 0.5) * sh; }
  const vis = visible();
  const h = G.squad[G.active];
  const activeTag = h.downed ? null : h.def.tag;
  ctx.save();
  ctx.scale(ZOOM, ZOOM);
  ctx.translate(-Math.round(cam.x), -Math.round(cam.y));
  G.world.drawBack(ctx, cam, vis.w, vis.h);
  G.telegraphs.forEach(t => drawTelegraph(ctx, t));
  drawZones(ctx, G, 'under');

  const items = [];
  const box = { x0: cam.x - 260, x1: cam.x + vis.w + 260, y0: cam.y - 100, y1: cam.y + vis.h + 420 };
  for (const p of G.world.props) if (p.x > box.x0 && p.x < box.x1 && p.y > box.y0 && p.y < box.y1) items.push({ y: p.y, d: () => G.world.drawProp(ctx, p) });
  for (const e of G.enemies) items.push({ y: e.y + (e.dead ? -400 : 0), d: () => drawEnemy(ctx, G, A, e, activeTag) });
  for (const a of G.allies) items.push({ y: a.y, d: () => drawAlly(ctx, G, A, a) });
  for (const c of G.corpses) items.push({ y: c.y, d: () => drawCorpse(ctx, A, c) });
  for (const p of G.pickups) items.push({ y: p.y, d: () => drawPickup(ctx, G, A, p) });
  if (!h.downed) items.push({ y: h.y, d: () => drawHero(ctx, G, A, h) });
  items.sort((a, b) => a.y - b.y).forEach(i => i.d());
  if (!h.downed) {
    const covered = G.enemies.some(e => !e.dead && e.y > h.y && Math.hypot(e.x - h.x, e.y - h.y) < e.def.radius + 46);
    if (covered) { ctx.save(); ctx.globalAlpha = 0.5; drawHero(ctx, G, A, h); ctx.restore(); }
    drawMarker(ctx, h);
  }

  drawZones(ctx, G, 'over');
  G.shots.forEach(p => drawShot(ctx, p));
  G.eshots.forEach(s => drawEnemyShot(ctx, s));
  drawFxWorld(ctx, G.fx);
  ctx.restore();

  if (G.level.tint) { ctx.fillStyle = G.level.tint; ctx.fillRect(0, 0, view.w, view.h); }
  if (A.vignette) ctx.drawImage(A.vignette, 0, 0, view.w, view.h);
  if (G.fx.flash.a > 0.01) { ctx.globalAlpha = Math.min(0.75, G.fx.flash.a); ctx.fillStyle = G.fx.flash.color; ctx.fillRect(0, 0, view.w, view.h); ctx.globalAlpha = 1; }
  const low = h.hp / h.max;
  if (low < 0.35 && !h.downed) {
    const a = (0.35 - low) * 1.3 * (0.6 + 0.4 * Math.sin(performance.now() / 180));
    const g = ctx.createRadialGradient(view.w / 2, view.h / 2, view.h * 0.4, view.w / 2, view.h / 2, view.h * 0.95);
    g.addColorStop(0, 'rgba(255,40,60,0)'); g.addColorStop(1, `rgba(255,40,60,${Math.min(0.55, a)})`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, view.w, view.h);
  }
}

export function makeVignette() {
  const c = document.createElement('canvas');
  c.width = 640; c.height = 360;
  const x = c.getContext('2d');
  const g = x.createRadialGradient(320, 180, 140, 320, 180, 440);
  g.addColorStop(0, 'rgba(20,18,50,0)'); g.addColorStop(1, 'rgba(20,18,50,0.34)');
  x.fillStyle = g; x.fillRect(0, 0, 640, 360);
  return c;
}
