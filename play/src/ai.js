import { TAGS, WORLD } from './config.js';
import { totalHp } from './rules.js';
import { burst, ring, shake } from './fx.js';
import { centerOf, damageEnemy, hurtHero } from './combat.js';
import { spawnEnemy } from './spawn.js';

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

export function addTelegraph(G, o) {
  G.telegraphs.push({ x: o.x, y: o.y, r: o.r, t: 0, dur: o.dur, color: o.color, dmg: o.dmg, boss: !!o.boss });
}

function enemyShot(G, x, y, angle, speed, dmg, color) {
  G.eshots.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, r: 17, dmg, color, life: 4.5, rot: 0 });
}

function shatter(G, e) {
  const L = e.lock;
  e.lock = null;
  if (!L) return;
  const c = centerOf(e);
  damageEnemy(G, e, L.dmg, 'DESIGN', { force: true });
  ring(G.fx, c.x, c.y, { from: 10, to: 120, life: 0.3, width: 8, color: TAGS.DESIGN.color });
  burst(G.fx, c.x, c.y, { color: [TAGS.DESIGN.color, '#ffffff', TAGS.DESIGN.soft], count: 14, speed: 460, life: 0.6, size: 12 });
}

function moveToward(G, e, h, dt, mul = 1, stop = 0) {
  const dx = h.x - e.x;
  const dy = h.y - e.y;
  const d = Math.hypot(dx, dy) || 1;
  e.face = dx >= 0 ? 1 : -1;
  if (d <= stop) return d;
  const sp = e.def.speed * (1 + G.wave * 0.05) * (e.slow > 0 ? 0.5 : 1) * mul * (e.rage ? 2.2 : 1);
  e.x += (dx / d) * sp * dt;
  e.y += (dy / d) * sp * dt;
  return d;
}

function bossBrain(G, e, h, dt, d) {
  const hpRatio = totalHp(e.segs) / e.maxHp;
  const phase = hpRatio > 0.66 ? 1 : hpRatio > 0.33 ? 2 : 3;
  e.phase = phase;
  e.cd.boss -= dt;
  if (e.state === 'wind') {
    e.stateT -= dt;
    if (e.stateT <= 0) {
      e.state = null;
      const n = [14, 18, 24][phase - 1];
      const off = G.rng() * 6.28;
      const c = centerOf(e);
      for (let i = 0; i < n; i++) enemyShot(G, c.x, c.y, off + (i / n) * Math.PI * 2, 250, 10, TAGS[e.segs[i % e.segs.length].tag].color);
      shake(G.fx, 12);
      G.sfx.slam();
    }
    return;
  }
  if (e.cd.boss > 0) return;
  const plan = [['slam', 'ring'], ['slam', 'summon', 'ring'], ['slam', 'ring', 'summon', 'slam']][phase - 1];
  const step = plan[e.bossStep++ % plan.length];
  e.cd.boss = phase === 3 ? 2.1 : 2.9;
  if (step === 'slam') {
    for (let i = 0; i < 3; i++) {
      const a = G.rng() * 6.28;
      const off = i === 0 ? 0 : 230;
      addTelegraph(G, { x: h.x + Math.cos(a) * off, y: h.y + Math.sin(a) * off, r: 150, dur: 1.05 + i * 0.28, color: '#ff4d4d', dmg: 22, boss: true });
    }
  } else if (step === 'ring') {
    e.state = 'wind';
    e.stateT = 0.65;
  } else {
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * 6.28;
      const key = ['bug', 'glitch', 'creep', 'flaky'][i];
      spawnEnemy(G, key, { x: clamp(e.x + Math.cos(a) * 200, WORLD.left + 40, WORLD.right - 40), y: clamp(e.y + Math.sin(a) * 140, WORLD.top + 40, WORLD.bottom - 20) });
    }
  }
}

function brain(G, e, h, dt) {
  const def = e.def;
  const abil = def.abilities || [];
  const dx = h.x - e.x;
  const dy = h.y - e.y;
  const d = Math.hypot(dx, dy) || 1;
  const tagColor = TAGS[e.segs[0].tag].color;

  if (def.cls === 'flyer') {
    const wob = Math.sin(e.t * 4.5 + e.weave) * 0.9;
    const a = Math.atan2(dy, dx) + wob * Math.min(1, d / 260);
    const sp = def.speed * (1 + G.wave * 0.05) * (e.slow > 0 ? 0.5 : 1) * (e.rage ? 2.2 : 1);
    e.x += Math.cos(a) * sp * dt;
    e.y += Math.sin(a) * sp * dt;
    e.face = dx >= 0 ? 1 : -1;
    return d;
  }

  if (def.boss) {
    bossBrain(G, e, h, dt, d);
    if (e.state !== 'wind') moveToward(G, e, h, dt, e.phase === 3 ? 1.5 : 1, 230);
    return d;
  }

  if (abil.includes('dash')) {
    e.cd.dash -= dt;
    if (e.state === 'tele') {
      e.stateT -= dt;
      e.face = dx >= 0 ? 1 : -1;
      if (e.stateT <= 0) { e.state = 'dash'; e.stateT = 0.42; }
      return d;
    }
    if (e.state === 'dash') {
      e.stateT -= dt;
      e.x += e.dir.x * 560 * dt;
      e.y += e.dir.y * 560 * dt;
      if (e.stateT <= 0) { e.state = null; e.cd.dash = 2.2 + G.rng() * 1.6; }
      return d;
    }
    if (e.cd.dash <= 0 && d < 560 && d > 150) { e.state = 'tele'; e.stateT = 0.5; e.dir = { x: dx / d, y: dy / d }; return d; }
  }

  if (abil.includes('shoot')) {
    e.cd.shoot -= dt;
    if (e.state === 'wind') {
      e.stateT -= dt;
      e.face = dx >= 0 ? 1 : -1;
      if (e.stateT <= 0) {
        e.state = null;
        e.cd.shoot = 2.8 + G.rng() * 1.2;
        const c = centerOf(e);
        const aim = Math.atan2(h.y - 60 - c.y, h.x - c.x);
        const n = def.segs.length > 1 ? 3 : 1;
        for (let i = 0; i < n; i++) enemyShot(G, c.x, c.y, aim + (i - (n - 1) / 2) * 0.3, 310, 9, tagColor);
        G.sfx.shoot('note');
      }
      return d;
    }
    if (e.cd.shoot <= 0 && d < 680 && d > 200) { e.state = 'wind'; e.stateT = 0.55; return d; }
  }

  if (abil.includes('slam')) {
    e.cd.slam -= dt;
    if (e.cd.slam <= 0 && d < 480) {
      e.cd.slam = 4.4 + G.rng() * 1.6;
      addTelegraph(G, { x: h.x, y: h.y, r: 135, dur: 1.0, color: tagColor, dmg: 16 });
    }
  }

  const stop = abil.includes('shoot') ? 330 : def.elite ? def.radius * 1.15 + 36 : def.radius * 0.6 + 18;
  moveToward(G, e, h, dt, 1, stop);
  return d;
}

export function updateEnemies(G, dt) {
  const h = G.squad[G.active];
  for (const e of G.enemies) {
    e.t += dt;
    e.numT = (e.numT || 0) - dt;
    if (e.dead) { e.deadT += dt; continue; }
    e.spawnT = Math.min(1, e.spawnT + dt * 4);
    e.hitT = Math.max(0, e.hitT - dt);
    e.hitAnimT += dt;
    e.slow = Math.max(0, e.slow - dt);
    e.vuln = Math.max(0, (e.vuln || 0) - dt);
    e.touchCd = Math.max(0, e.touchCd - dt);
    e.x += e.vx * dt;
    e.y += e.vy * dt;
    const damp = Math.pow(0.003, dt);
    e.vx *= damp;
    e.vy *= damp;
    if (e.frozen > 0) {
      e.frozen -= dt;
      if (e.frozen <= 0 && e.lock) shatter(G, e);
    } else if (!h.downed) {
      const d = brain(G, e, h, dt);
      if (d < e.def.radius * 0.7 + 24 && e.touchCd <= 0 && e.spawnT >= 1) {
        const hit = hurtHero(G, h, e.def.touch * (1 + G.wave * 0.06));
        e.touchCd = hit ? 0.7 : 0.2;
      }
    }
    if (e.def.cls === 'flyer') {
      e.x = clamp(e.x, WORLD.left, WORLD.right);
      e.y = clamp(e.y, WORLD.top + 30, WORLD.bottom);
    } else if (!e.rage) {
      G.world.pushOut(e, Math.min(e.def.radius * 0.5, 34));
    }
  }
  const list = G.enemies.filter(e => !e.dead);
  for (let i = 0; i < list.length; i++) {
    for (let j = i + 1; j < list.length; j++) {
      const a = list[i];
      const b = list[j];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const d = Math.hypot(dx, dy) || 0.001;
      const m = (a.def.radius + b.def.radius) * 0.62;
      if (d < m) {
        const push = ((m - d) / d) * 0.5;
        const wa = b.def.boss ? 1.8 : 1;
        const wb = a.def.boss ? 1.8 : 1;
        if (!a.def.boss) { a.x -= dx * push * (wa / 2); a.y -= dy * push * (wa / 2); }
        if (!b.def.boss) { b.x += dx * push * (wb / 2); b.y += dy * push * (wb / 2); }
      }
    }
  }
  G.enemies = G.enemies.filter(e => !(e.dead && e.deadT > 0.8));
}

export function updateTelegraphs(G, dt) {
  const h = G.squad[G.active];
  for (const t of G.telegraphs) {
    t.t += dt;
    if (t.t >= t.dur) {
      t.done = true;
      ring(G.fx, t.x, t.y, { from: 10, to: t.r * 1.05, life: 0.35, width: 14, color: t.color, fill: 0.3 });
      burst(G.fx, t.x, t.y, { color: [t.color, '#ffffff'], count: 14, speed: 420, life: 0.5, size: 12 });
      shake(G.fx, t.boss ? 16 : 9);
      G.sfx.slam();
      if (!h.downed && Math.hypot(h.x - t.x, h.y - t.y) < t.r + 14) hurtHero(G, h, t.dmg);
    }
  }
  G.telegraphs = G.telegraphs.filter(t => !t.done);
}

export function updateEnemyShots(G, dt) {
  const h = G.squad[G.active];
  for (const s of G.eshots) {
    s.x += s.vx * dt;
    s.y += s.vy * dt;
    s.life -= dt;
    s.rot += dt * 8;
    if (!h.downed && Math.hypot(h.x - s.x, h.y - 58 - s.y) < s.r + 26) {
      if (hurtHero(G, h, s.dmg)) { s.life = 0; burst(G.fx, s.x, s.y, { color: [s.color, '#ffffff'], count: 8, speed: 260, life: 0.35, size: 9 }); }
    }
    if (s.x < WORLD.left - 40 || s.x > WORLD.right + 40 || s.y < WORLD.top - 60 || s.y > WORLD.bottom + 60) s.life = 0;
  }
  G.eshots = G.eshots.filter(s => s.life > 0);
}
