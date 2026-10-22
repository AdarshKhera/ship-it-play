import { MAX_PIPS, OVERDRIVE_SECONDS, TAGS, tagColor } from './config.js';
import { burst, flash, floatText, ring, shake } from './fx.js';
import { centerOf, damageEnemy, explode, healHero } from './combat.js';

const AIM_RANGE = 720;

export function pickTarget(G, h) {
  let best = null;
  let bestScore = Infinity;
  for (const e of G.enemies) {
    if (e.dead) continue;
    const c = centerOf(e);
    const d = Math.hypot(c.x - h.x, c.y - (h.y - 60));
    if (d > AIM_RANGE) continue;
    const matches = e.segs.some(s => s.tag === h.def.tag && s.hp > 0);
    const score = d * (matches ? 0.72 : 1);
    if (score < bestScore) { bestScore = score; best = e; }
  }
  return best;
}

function fire(G, h, target) {
  const w = h.def.weapon;
  const od = h.od > 0;
  const o = h.def.overdrive;
  const count = od ? o.count : w.count;
  const spread = od ? o.spread : w.spread;
  const c = centerOf(target);
  const ox = h.x + h.face * 28;
  const oy = h.y - 66;
  const base = Math.atan2(c.y - oy, c.x - ox);
  for (let i = 0; i < count; i++) {
    const a = base + (i - (count - 1) / 2) * spread;
    G.shots.push({
      kind: w.kind, x: ox, y: oy, vx: Math.cos(a) * w.speed, vy: Math.sin(a) * w.speed,
      dmg: w.damage * (od ? 1.2 : 1), tag: h.def.tag, r: w.radius * (od ? 1.35 : 1),
      pierce: od ? o.pierce : w.pierce, life: AIM_RANGE * 1.25 / w.speed, hit: new Set(),
      rot: Math.random() * 6, slow: w.kind === 'note', od,
    });
  }
  h.fireT = 0;
  G.sfx.shoot(w.kind);
  burst(G.fx, ox + Math.cos(base) * 12, oy + Math.sin(base) * 12, { color: TAGS[h.def.tag].color, count: 3, speed: 160, life: 0.18, size: 8, shape: 'circle', gravity: 0, up: 0, spread: 1.2, angle: base });
}

export function updateHeroes(G, dt, move) {
  const mods = G.mods;
  G.swapCd = Math.max(0, G.swapCd - dt);
  G.squad.forEach((h, i) => {
    h.t += dt;
    h.fireT += dt;
    h.hurtT = Math.max(0, h.hurtT - dt);
    h.inv = Math.max(0, h.inv - dt);
    h.od = Math.max(0, h.od - dt);
    if (i !== G.active && !h.downed) healHero(G, h, mods.benchRegen * dt);
  });
  const h = G.squad[G.active];
  if (h.downed) return;
  const speed = h.def.speed * mods.speedMul * (h.od > 0 ? 1.12 : 1);
  h.moving = Math.hypot(move.x, move.y) > 0.08;
  h.x += move.x * speed * dt;
  h.y += move.y * speed * dt;
  G.world.pushOut(h, 22);
  const target = pickTarget(G, h);
  if (target) h.face = target.x >= h.x ? 1 : -1;
  else if (Math.abs(move.x) > 0.1) h.face = move.x > 0 ? 1 : -1;
  h.cd -= dt;
  if (h.cd <= 0 && target) {
    fire(G, h, target);
    h.cd = h.def.weapon.cooldown * mods.cooldownMul * (h.od > 0 ? 0.45 : 1);
  }
}

export function updateShots(G, dt) {
  for (const p of G.shots) {
    if (p.kind === 'bomb') { updateBomb(G, p, dt); continue; }
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= dt;
    p.rot += dt * 14;
    for (const e of G.enemies) {
      if (e.dead || p.hit.has(e.id)) continue;
      const reach = e.def.radius * 0.85 + p.r;
      const dx = e.x - p.x;
      const dy = e.y - e.def.radius * 0.9 - p.y;
      if (dx * dx + dy * dy < reach * reach) {
        p.hit.add(e.id);
        damageEnemy(G, e, p.dmg, p.tag, { knock: { x: p.x - p.vx * 0.05, y: p.y - p.vy * 0.05, power: p.od ? 220 : 130 }, slow: p.slow, ally: p.ally });
        burst(G.fx, p.x, p.y, { color: [tagColor(p.tag), '#ffffff'], count: 4, speed: 220, life: 0.25, size: 8, shape: 'circle', gravity: 0, up: 0 });
        if (--p.pierce <= 0) { p.life = 0; break; }
      }
    }
  }
  G.shots = G.shots.filter(p => p.life > 0);
}

function nearestEnemy(G, x, y) {
  let best = null;
  let bd = Infinity;
  for (const e of G.enemies) {
    if (e.dead) continue;
    const c = centerOf(e);
    const d = Math.hypot(c.x - x, c.y - y);
    if (d < bd) { bd = d; best = e; }
  }
  return best;
}

function updateBomb(G, p, dt) {
  p.age = (p.age || 0) + dt;
  p.life -= dt;
  p.rot += dt * 10;
  const target = (p.target && !p.target.dead) ? p.target : nearestEnemy(G, p.x, p.y);
  p.target = target;
  if (target && p.age > 0.18) {
    const c = centerOf(target);
    const want = Math.atan2(c.y - p.y, c.x - p.x);
    const cur = Math.atan2(p.vy, p.vx);
    let diff = want - cur;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    const turn = Math.max(-1, Math.min(1, diff)) * 9 * dt;
    const sp = Math.min(760, Math.hypot(p.vx, p.vy) + 1500 * dt);
    p.vx = Math.cos(cur + turn) * sp;
    p.vy = Math.sin(cur + turn) * sp;
    if (Math.hypot(c.x - p.x, c.y - p.y) < target.def.radius * 0.8 + 14) p.life = 0;
  } else {
    p.vx *= 1 - dt * 2.2;
    p.vy *= 1 - dt * 2.2;
  }
  p.x += p.vx * dt;
  p.y += p.vy * dt;
  if (p.life <= 0) {
    explode(G, p.x, p.y, 110, p.dmg, 'TEST');
    burst(G.fx, p.x, p.y, { color: [TAGS.TEST.color, '#ffffff', '#ffe14a'], count: 9, speed: 300, life: 0.4, size: 10 });
    shake(G.fx, 5);
    G.sfx.hit();
  }
}

export function startOverdrive(G, h) {
  h.od = OVERDRIVE_SECONDS + G.mods.overdriveBonus;
  const color = TAGS[h.def.tag].color;
  floatText(G.fx, h.x, h.y - 190, 'OVERDRIVE!', { color, size: 48, life: 1.1 });
  ring(G.fx, h.x, h.y - 30, { from: 20, to: 360, life: 0.55, width: 14, color, fill: 0.16 });
  burst(G.fx, h.x, h.y - 60, { color: [color, '#ffffff', '#ffe14a'], count: 30, speed: 520, life: 0.8, size: 13 });
  flash(G.fx, color, 0.32);
  shake(G.fx, 10);
  G.sfx.overdrive();
}

export function updatePickups(G, dt) {
  const h = G.squad[G.active];
  for (const p of G.pickups) {
    p.t += dt;
    p.life -= dt;
    p.vz -= 900 * dt;
    p.z = Math.max(0, p.z + p.vz * dt);
    if (p.z === 0 && p.vz < 0) p.vz = p.t < 0.8 ? 150 : 0;
    if (h.downed || p.t < 0.35) continue;
    if (Math.hypot(h.x - p.x, h.y - p.y) < 58) { collect(G, h, p); p.life = 0; }
  }
  G.pickups = G.pickups.filter(p => p.life > 0);
}

function collect(G, h, p) {
  G.sfx.pickup();
  const owner = G.squad.find(s => s.def.fuel.kind === p.kind);
  if (!owner) { healHero(G, h, 12); return; }
  const color = TAGS[owner.def.tag].color;
  ring(G.fx, p.x, p.y, { from: 10, to: 90, life: 0.4, width: 9, color });
  burst(G.fx, p.x, p.y - 30, { color: [color, '#ffffff'], count: 12, speed: 340, life: 0.5, size: 10 });
  if (owner === h) {
    startOverdrive(G, h);
    healHero(G, h, 30);
    G.pips = Math.min(MAX_PIPS, G.pips + 1);
  } else {
    healHero(G, h, 15);
    G.pips = Math.min(MAX_PIPS, G.pips + 0.4);
    if (!owner.downed) {
      owner.odStored = OVERDRIVE_SECONDS + G.mods.overdriveBonus;
      floatText(G.fx, h.x, h.y - 235, `${owner.name} is charged!`, { color, size: 30, life: 1.1 });
    }
  }
}

export function swapTo(G, index, forced = false) {
  const to = G.squad[index];
  if (!to || to.downed || index === G.active) return false;
  if (!forced && G.swapCd > 0) return false;
  const from = G.squad[G.active];
  to.x = from.x; to.y = from.y; to.face = from.face;
  G.active = index;
  G.swapCd = 0.5;
  to.inv = Math.max(to.inv, forced ? 1.3 : 0.9);
  to.cd = 0.08;
  const color = TAGS[to.def.tag].color;
  G.sfx.swap();
  ring(G.fx, to.x, to.y - 30, { from: 20, to: 230, life: 0.4, width: 12, color, fill: 0.14 });
  burst(G.fx, to.x, to.y - 50, { color: [color, '#ffffff'], count: 16, speed: 420, life: 0.55, size: 11 });
  floatText(G.fx, to.x, to.y - 190, `${to.name}!`, { color, size: 40, life: 0.8 });
  explode(G, to.x, to.y - 30, 210, 26 * G.mods.powerMul, to.def.tag, { quiet: false });
  if (to.odStored > 0) { to.od = to.odStored; to.odStored = 0; startOverdrive(G, to); }
  return true;
}

export function swapNext(G, dir = 1) {
  const n = G.squad.length;
  for (let k = 1; k <= n; k++) {
    const i = ((G.active + dir * k) % n + n) % n;
    if (!G.squad[i].downed) return swapTo(G, i);
  }
  return false;
}
