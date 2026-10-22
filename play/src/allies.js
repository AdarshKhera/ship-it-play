import { WORLD, tagColor } from './config.js';
import { DRIS, DRI_RULES } from './data.js';
import { burst, floatText, ring, shake } from './fx.js';
import { centerOf, explode } from './combat.js';

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const GOLD = '#ffd23f';

export function summonDri(G) {
  const def = DRIS[G.driIndex++ % DRIS.length];
  const o = G.squad[G.active];
  const a = G.rng() * Math.PI * 2;
  G.allies.push({
    def, x: clamp(o.x + Math.cos(a) * 280, WORLD.left + 80, WORLD.right - 80), y: clamp(o.y + Math.sin(a) * 200, WORLD.top + 80, WORLD.bottom - 40),
    fall: 1000, state: 'fall', t: 0, shootCd: 0.3, stompCd: 0.5, thinkT: 0, life: DRI_RULES.seconds, face: 1, moving: false, target: null, rise: 0,
  });
  G.driBanner = { name: def.name, title: def.title, t: 0 };
  G.sfx.boss();
}

function densest(G, a) {
  let best = null;
  let bestScore = -1;
  for (const e of G.enemies) {
    if (e.dead) continue;
    const d = Math.hypot(e.x - a.x, e.y - a.y);
    if (d > 1100) continue;
    let n = 0;
    for (const f of G.enemies) if (!f.dead && Math.hypot(f.x - e.x, f.y - e.y) < 240) n++;
    const score = n * 100 - d * 0.05;
    if (score > bestScore) { bestScore = score; best = e; }
  }
  return best;
}

function nearest(G, a, range) {
  let best = null;
  let bd = range;
  for (const e of G.enemies) {
    if (e.dead) continue;
    const c = centerOf(e);
    const d = Math.hypot(c.x - a.x, c.y - 60 - a.y);
    if (d < bd) { bd = d; best = e; }
  }
  return best;
}

function land(G, a) {
  a.state = 'fight';
  a.fall = 0;
  ring(G.fx, a.x, a.y - 10, { from: 20, to: 300, life: 0.55, width: 18, color: GOLD, fill: 0.25 });
  burst(G.fx, a.x, a.y - 30, { color: [GOLD, '#ffffff', '#fff1bf'], count: 40, speed: 700, life: 0.8, size: 14 });
  explode(G, a.x, a.y - 30, 270, 46, '*', { ally: true });
  floatText(G.fx, a.x, a.y - 210, `"${a.def.quote}"`, { color: GOLD, size: 34, life: 1.4 });
  shake(G.fx, 22);
  G.sfx.slam();
}

export function updateAllies(G, dt) {
  for (const a of G.allies) {
    a.t += dt;
    if (a.state === 'fall') {
      a.fall -= 1700 * dt;
      if (a.fall <= 0) land(G, a);
      continue;
    }
    if (a.state === 'leave') {
      a.rise += 1500 * dt;
      continue;
    }
    a.life -= dt;
    if (a.life <= 0) {
      a.state = 'leave';
      floatText(G.fx, a.x, a.y - 200, 'Over to you!', { color: GOLD, size: 32, life: 1.2 });
      burst(G.fx, a.x, a.y - 60, { color: [GOLD, '#ffffff'], count: 16, speed: 360, life: 0.6, size: 11 });
      continue;
    }
    a.thinkT -= dt;
    if (a.thinkT <= 0) { a.thinkT = 0.4; a.target = densest(G, a); }
    a.moving = false;
    if (a.target && !a.target.dead) {
      const dx = a.target.x - a.x;
      const dy = a.target.y - a.y;
      const d = Math.hypot(dx, dy);
      if (d > 230) {
        a.x = clamp(a.x + (dx / d) * DRI_RULES.move * dt, WORLD.left + 60, WORLD.right - 60);
        a.y = clamp(a.y + (dy / d) * DRI_RULES.move * dt, WORLD.top + 40, WORLD.bottom - 20);
        a.moving = true;
      }
      if (Math.abs(dx) > 8) a.face = dx > 0 ? 1 : -1;
    }
    a.shootCd -= dt;
    if (a.shootCd <= 0) {
      const t = nearest(G, a, 760);
      if (t) {
        const c = centerOf(t);
        const ox = a.x + a.face * 24;
        const oy = a.y - 70;
        const ang = Math.atan2(c.y - oy, c.x - ox);
        G.shots.push({
          kind: 'gold', x: ox, y: oy, vx: Math.cos(ang) * DRI_RULES.speed, vy: Math.sin(ang) * DRI_RULES.speed, dmg: DRI_RULES.damage, tag: '*', r: 14,
          pierce: 2, life: 0.9, hit: new Set(), rot: 0, slow: false, od: false, ally: true,
        });
        a.shootCd = DRI_RULES.cooldown;
        a.face = c.x >= a.x ? 1 : -1;
      }
    }
    a.stompCd -= dt;
    if (a.stompCd <= 0) {
      const near = G.enemies.filter(e => !e.dead && Math.hypot(e.x - a.x, e.y - a.y) < DRI_RULES.stompRadius).length;
      if (near >= 3) {
        a.stompCd = DRI_RULES.stompEvery;
        explode(G, a.x, a.y - 20, DRI_RULES.stompRadius, DRI_RULES.stompDamage, '*', { ally: true });
        ring(G.fx, a.x, a.y - 10, { from: 20, to: DRI_RULES.stompRadius, life: 0.4, width: 12, color: GOLD, fill: 0.2 });
        shake(G.fx, 9);
        G.sfx.slam();
      } else a.stompCd = 0.4;
    }
  }
  G.allies = G.allies.filter(a => !(a.state === 'leave' && a.rise > 1000));
}

export const allyColor = tagColor('*');
