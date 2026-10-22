import { INK, TAGS } from './config.js';
import { burst, line, ring, shake } from './fx.js';
import { centerOf, damageEnemy, explode } from './combat.js';

const TAU = Math.PI * 2;
const living = G => G.enemies.filter(e => !e.dead);
const lead = G => G.squad[G.active];

export function addZone(G, zone) {
  G.zones.push({ t: 0, tick: 0, ...zone });
}

const PAINT = ['#ff4fa3', '#ffb627', '#3ad0ff', '#7cf0b0', '#b58cff'];

function bolt(G, x1, y1, x2, y2, color, width = 9) {
  const segs = 7;
  let px = x1;
  let py = y1;
  for (let i = 1; i <= segs; i++) {
    const t = i / segs;
    const nx = x1 + (x2 - x1) * t + (i === segs ? 0 : (Math.random() - 0.5) * 70);
    const ny = y1 + (y2 - y1) * t;
    line(G.fx, px, py, nx, ny, { color, width, life: 0.28 });
    px = nx;
    py = ny;
  }
}

const UPDATE = {
  beam(G, z, dt) {
    const o = lead(G);
    z.ox = o.x;
    z.oy = o.y - 60;
    z.angle += z.spin * dt;
    z.tick -= dt;
    if (z.tick > 0) return;
    z.tick = 0.06;
    for (const e of living(G)) {
      const c = centerOf(e);
      const dx = c.x - z.ox;
      const dy = c.y - z.oy;
      for (let k = 0; k < z.beams; k++) {
        const a = z.angle + (k * TAU) / z.beams;
        const along = dx * Math.cos(a) + dy * Math.sin(a);
        const across = Math.abs(-dx * Math.sin(a) + dy * Math.cos(a));
        if (along > 0 && along < z.len && across < z.width / 2 + e.def.radius * 0.7) {
          damageEnemy(G, e, z.dmg, 'CODE', { knock: { x: z.ox, y: z.oy, power: 40 } });
          break;
        }
      }
    }
  },

  orbit(G, z, dt) {
    const o = lead(G);
    z.cx = o.x;
    z.cy = o.y - 55;
    z.angle += z.spin * dt;
    z.pos = [];
    for (let i = 0; i < z.blades; i++) {
      const a = z.angle + (i * TAU) / z.blades;
      z.pos.push({ x: z.cx + Math.cos(a) * z.radius, y: z.cy + Math.sin(a) * z.radius });
    }
    for (const e of G.enemies) e.orbitCd = Math.max(0, (e.orbitCd || 0) - dt);
    for (const e of living(G)) {
      if (e.orbitCd > 0) continue;
      const c = centerOf(e);
      if (z.pos.some(p => Math.hypot(c.x - p.x, c.y - p.y) < e.def.radius * 0.8 + 34)) {
        e.orbitCd = 0.2;
        damageEnemy(G, e, z.dmg, 'TEST', { knock: { x: z.cx, y: z.cy, power: 260 } });
      }
    }
  },

  vortex(G, z, dt) {
    if (z.t < z.dur) {
      for (const e of living(G)) {
        const dx = z.x - e.x;
        const dy = z.y - e.y;
        const d = Math.hypot(dx, dy);
        if (d > z.radius || d < 8) continue;
        const k = (e.def.boss ? 0.15 : e.def.elite ? 0.5 : 1) * z.pull * dt * (0.45 + 0.55 * (1 - d / z.radius));
        e.x += (dx / d) * Math.min(k, d);
        e.y += (dy / d) * Math.min(k, d);
      }
      return;
    }
    if (z.blown) return;
    z.blown = true;
    explode(G, z.x, z.y - 30, z.blast, z.dmg, 'CODE', {});
    ring(G.fx, z.x, z.y - 30, { from: 20, to: z.blast * 1.2, life: 0.5, width: 20, color: TAGS.CODE.color, fill: 0.25 });
    burst(G.fx, z.x, z.y - 30, { color: [TAGS.CODE.color, '#ffffff', TAGS.CODE.soft], count: 50, speed: 820, life: 0.8, size: 14, shape: 'glyph', glyphs: ['{', '}', '</>', ';', '=>'], gravity: 80, up: 0 });
    shake(G.fx, 26);
    G.sfx.slam();
  },

  shield(G, z, dt) {
    const o = lead(G);
    z.x = o.x;
    z.y = o.y;
    z.tick -= dt;
    for (const h of G.squad) if (!h.downed) h.inv = Math.max(h.inv, 0.3);
    for (const s of G.eshots) {
      if (Math.hypot(s.x - z.x, s.y - 60 - z.y) < z.radius) {
        s.life = 0;
        burst(G.fx, s.x, s.y, { color: [TAGS.PROCESS.color, '#ffffff'], count: 6, speed: 240, life: 0.3, size: 8, shape: 'circle', gravity: 0, up: 0 });
      }
    }
    const hit = z.tick <= 0;
    if (hit) z.tick = 0.3;
    for (const e of living(G)) {
      const d = Math.hypot(e.x - z.x, e.y - z.y);
      if (d > z.radius) continue;
      if (!e.def.boss) { e.x += ((e.x - z.x) / (d || 1)) * 420 * dt; e.y += ((e.y - z.y) / (d || 1)) * 420 * dt; }
      if (hit) damageEnemy(G, e, z.dmg, 'PROCESS', {});
    }
  },

  timestop(G, z, dt) {
    for (const e of living(G)) e.frozen = Math.max(e.frozen, 0.2);
    for (const s of G.eshots) { s.x -= s.vx * dt; s.y -= s.vy * dt; }
    for (const t of G.telegraphs) t.t = Math.max(0, t.t - dt);
  },

  rain(G, z, dt) {
    z.tick -= dt;
    while (z.tick <= 0 && z.left > 0) {
      z.tick += z.dur / z.n;
      z.left--;
      const alive = living(G);
      const o = lead(G);
      const target = alive.length ? alive[Math.floor(G.rng() * alive.length)] : null;
      const px = target ? target.x : o.x + (G.rng() - 0.5) * 700;
      const py = target ? target.y - 30 : o.y + (G.rng() - 0.5) * 400;
      explode(G, px, py, 130, z.dmg, 'DESIGN', {});
      for (const e of living(G)) if (Math.hypot(e.x - px, e.y - py) < 150) e.slow = Math.max(e.slow, 2.2);
      const col = PAINT[Math.floor(G.rng() * PAINT.length)];
      ring(G.fx, px, py, { from: 10, to: 140, life: 0.55, width: 10, color: col, fill: 0.4 });
      burst(G.fx, px, py, { color: [col, '#ffffff'], count: 12, speed: 520, life: 0.6, size: 13, shape: 'circle', gravity: 400, up: 220 });
      z.splats.push({ x: px, y: py, col, t: 0, r: 70 + G.rng() * 40 });
      G.sfx.hit();
    }
    for (const s of z.splats) s.t += dt;
  },

  lightning(G, z, dt) {
    z.tick -= dt;
    while (z.tick <= 0 && z.left > 0) {
      z.tick += z.dur / z.n;
      z.left--;
      const alive = living(G);
      if (!alive.length) continue;
      const target = alive[Math.floor(G.rng() * alive.length)];
      const c = centerOf(target);
      bolt(G, c.x + (Math.random() - 0.5) * 120, c.y - 760, c.x, c.y, '#e6fff0', 11);
      explode(G, c.x, c.y, 100, z.dmg, 'TEST', {});
      ring(G.fx, c.x, c.y, { from: 10, to: 110, life: 0.35, width: 9, color: TAGS.TEST.color, fill: 0.3 });
      burst(G.fx, c.x, c.y, { color: [TAGS.TEST.color, '#ffffff', '#ffe14a'], count: 12, speed: 480, life: 0.5, size: 11 });
      const chain = alive.filter(e => e !== target && !e.dead).sort((a, b) => Math.hypot(a.x - target.x, a.y - target.y) - Math.hypot(b.x - target.x, b.y - target.y)).slice(0, 2);
      chain.forEach(e => {
        const ec = centerOf(e);
        if (Math.hypot(ec.x - c.x, ec.y - c.y) > 280) return;
        bolt(G, c.x, c.y, ec.x, ec.y, TAGS.TEST.color, 6);
        damageEnemy(G, e, z.dmg * 0.6, 'TEST', {});
      });
      shake(G.fx, 6);
      G.sfx.kill(10 + z.left);
    }
  },
};

export function updateZones(G, dt) {
  for (const z of G.zones) {
    z.t += dt;
    UPDATE[z.kind](G, z, dt);
  }
  G.zones = G.zones.filter(z => z.t < z.dur || (z.kind === 'vortex' && !z.blown));
}

const UNDER = new Set(['vortex', 'timestop', 'rain']);

const DRAW = {
  beam(ctx, z) {
    const fade = Math.min(1, (z.dur - z.t) * 4, z.t * 8);
    for (let k = 0; k < z.beams; k++) {
      const a = z.angle + (k * TAU) / z.beams;
      const ex = z.ox + Math.cos(a) * z.len;
      const ey = z.oy + Math.sin(a) * z.len;
      ctx.save();
      ctx.globalAlpha = fade;
      ctx.lineCap = 'round';
      ctx.strokeStyle = INK; ctx.lineWidth = z.width + 12; ctx.beginPath(); ctx.moveTo(z.ox, z.oy); ctx.lineTo(ex, ey); ctx.stroke();
      ctx.strokeStyle = TAGS.CODE.color; ctx.lineWidth = z.width; ctx.beginPath(); ctx.moveTo(z.ox, z.oy); ctx.lineTo(ex, ey); ctx.stroke();
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = z.width * 0.38; ctx.beginPath(); ctx.moveTo(z.ox, z.oy); ctx.lineTo(ex, ey); ctx.stroke();
      ctx.restore();
    }
  },
  orbit(ctx, z) {
    if (!z.pos) return;
    const fade = Math.min(1, (z.dur - z.t) * 3, z.t * 6);
    ctx.save();
    ctx.globalAlpha = 0.35 * fade; ctx.strokeStyle = TAGS.TEST.color; ctx.lineWidth = 6; ctx.setLineDash([14, 16]);
    ctx.beginPath(); ctx.arc(z.cx, z.cy, z.radius, 0, TAU); ctx.stroke();
    ctx.restore();
    z.pos.forEach((p, i) => {
      ctx.save();
      ctx.globalAlpha = fade;
      ctx.translate(p.x, p.y); ctx.rotate(z.t * 14 + i);
      ctx.beginPath();
      for (let k = 0; k < 8; k++) { const r = k % 2 ? 11 : 30; ctx.lineTo(Math.cos((k * TAU) / 8) * r, Math.sin((k * TAU) / 8) * r); }
      ctx.closePath(); ctx.fillStyle = TAGS.TEST.color; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.lineJoin = 'round'; ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, 7, 0, TAU); ctx.fillStyle = '#ffffff'; ctx.fill();
      ctx.restore();
    });
  },
  vortex(ctx, z) {
    const k = Math.min(1, z.t / z.dur);
    ctx.save();
    ctx.translate(z.x, z.y - 20);
    ctx.globalAlpha = 0.9 - k * 0.3;
    for (let i = 0; i < 4; i++) {
      const r = z.radius * (1 - ((k * 1.6 + i * 0.25) % 1));
      ctx.lineWidth = 12; ctx.strokeStyle = INK;
      ctx.beginPath(); ctx.arc(0, 0, r, z.t * 6 + i, z.t * 6 + i + 3.6); ctx.stroke();
      ctx.lineWidth = 6; ctx.strokeStyle = i % 2 ? '#ffffff' : TAGS.CODE.color;
      ctx.beginPath(); ctx.arc(0, 0, r, z.t * 6 + i, z.t * 6 + i + 3.6); ctx.stroke();
    }
    ctx.fillStyle = 'rgba(58,160,255,0.25)'; ctx.beginPath(); ctx.arc(0, 0, 50 + k * 50, 0, TAU); ctx.fill();
    ctx.restore();
  },
  shield(ctx, z) {
    const fade = Math.min(1, (z.dur - z.t) * 3, z.t * 8);
    const pulse = 1 + Math.sin(z.t * 8) * 0.02;
    ctx.save();
    ctx.translate(z.x, z.y - 50);
    ctx.scale(pulse, pulse);
    ctx.globalAlpha = fade;
    ctx.fillStyle = 'rgba(255,182,39,0.16)'; ctx.beginPath(); ctx.arc(0, 0, z.radius, 0, TAU); ctx.fill();
    ctx.lineWidth = 11; ctx.strokeStyle = INK; ctx.beginPath(); ctx.arc(0, 0, z.radius, 0, TAU); ctx.stroke();
    ctx.lineWidth = 6; ctx.strokeStyle = TAGS.PROCESS.color; ctx.beginPath(); ctx.arc(0, 0, z.radius, 0, TAU); ctx.stroke();
    ctx.globalAlpha = fade * 0.5; ctx.lineWidth = 3; ctx.strokeStyle = '#ffffff';
    for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(0, 0, z.radius * 0.82, z.t * 2 + i * 1.05, z.t * 2 + i * 1.05 + 0.55); ctx.stroke(); }
    ctx.restore();
  },
  timestop(ctx, z) {
    const o = lead(z.G);
    const k = Math.min(1, z.t / 0.25, (z.dur - z.t) / 0.4);
    ctx.save();
    ctx.translate(o.x, o.y - 10);
    ctx.globalAlpha = 0.85 * Math.max(0, k);
    const R = 520;
    ctx.fillStyle = 'rgba(255,182,39,0.1)'; ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.fill();
    ctx.lineWidth = 12; ctx.strokeStyle = INK; ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.stroke();
    ctx.lineWidth = 6; ctx.strokeStyle = TAGS.PROCESS.color; ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.stroke();
    for (let i = 0; i < 12; i++) {
      const a = (i * TAU) / 12;
      ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.beginPath(); ctx.moveTo(Math.cos(a) * (R - 28), Math.sin(a) * (R - 28)); ctx.lineTo(Math.cos(a) * R, Math.sin(a) * R); ctx.stroke();
    }
    const hand = z.t * 3 - Math.PI / 2;
    ctx.lineCap = 'round'; ctx.lineWidth = 12; ctx.strokeStyle = INK; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(hand) * R * 0.85, Math.sin(hand) * R * 0.85); ctx.stroke();
    ctx.lineWidth = 6; ctx.strokeStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(hand) * R * 0.85, Math.sin(hand) * R * 0.85); ctx.stroke();
    ctx.restore();
  },
  rain(ctx, z) {
    for (const s of z.splats) {
      const a = Math.max(0, 1 - s.t / 1.8);
      ctx.save();
      ctx.globalAlpha = a * 0.6; ctx.fillStyle = s.col;
      ctx.beginPath(); ctx.ellipse(s.x, s.y + 6, s.r, s.r * 0.5, 0, 0, TAU); ctx.fill();
      ctx.restore();
    }
  },
  lightning() {},
};

export function drawZones(ctx, G, layer) {
  for (const z of G.zones) {
    const under = UNDER.has(z.kind);
    if ((layer === 'under') !== under) continue;
    z.G = G;
    DRAW[z.kind](ctx, z);
  }
}
