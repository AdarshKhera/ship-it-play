import { TAGS } from './config.js';
import { applyHit, comboMultiplier } from './rules.js';
import { burst, floatText, flash, hitstop, ring, shake } from './fx.js';

export const centerOf = e => ({ x: e.x, y: e.y - e.def.radius * 0.9 });

export function damageEnemy(G, e, raw, tag, opts = {}) {
  if (e.dead) return 0;
  const bonus = (e.frozen > 0 ? 1.5 : 1) * (e.vuln > 0 ? 1.6 : 1);
  const r = applyHit(e.segs, tag, raw * bonus);
  if (r.shown <= 0) return 0;
  e.segs = r.segs;
  e.hitT = 0.22;
  e.hitAnimT = 0;
  if (opts.slow) e.slow = Math.max(e.slow, 1.5);
  if (opts.knock) {
    const k = opts.knock;
    const resist = e.def.boss ? 0.06 : e.def.elite ? 0.3 : 1;
    const a = Math.atan2(e.y - k.y, e.x - k.x);
    e.vx += Math.cos(a) * k.power * resist;
    e.vy += Math.sin(a) * k.power * resist;
  }
  if (!opts.quiet && (!e.numT || e.numT <= 0 || opts.force)) {
    e.numT = 0.08;
    const c = centerOf(e);
    const color = r.matched ? '#ffe14a' : '#d5d9e6';
    floatText(G.fx, c.x + (Math.random() - 0.5) * 36, c.y - e.def.radius * 1.1, String(Math.round(r.shown)), {
      color, size: r.matched ? (r.shown > 80 ? 46 : 32) : 20, life: r.matched ? 0.8 : 0.6,
    });
    G.sfx.hit();
  }
  if (r.dead) killEnemy(G, e, opts);
  return r.shown;
}

export function killEnemy(G, e, opts = {}) {
  if (e.dead) return;
  e.dead = true;
  e.deadT = 0;
  e.frozen = 0;
  e.lock = null;
  G.kills++;
  if (e.fromSurge) { G.surgeKills = (G.surgeKills || 0) + 1; if (opts.ally) G.driKills = (G.driKills || 0) + 1; }
  G.lastKillT = G.time;
  G.combo++;
  G.comboT = 3.2;
  G.bestCombo = Math.max(G.bestCombo, G.combo);
  const pts = Math.round(e.def.score * comboMultiplier(G.combo));
  G.score += pts;
  const c = centerOf(e);
  const tag = e.segs[0].tag;
  const color = TAGS[tag].color;
  const n = e.def.boss ? 70 : e.def.elite ? 30 : 13;
  burst(G.fx, c.x, c.y, { color: [color, '#ffffff', TAGS[tag].soft, '#ffe14a'], count: n, speed: e.def.boss ? 620 : 380, life: 0.75, size: e.def.boss ? 18 : 12 });
  ring(G.fx, c.x, c.y, { from: 10, to: e.def.radius * (e.def.boss ? 4 : 2.2), life: 0.35, width: 8, color });
  if (e.def.elite) floatText(G.fx, c.x, c.y - e.def.radius * 1.6, `+${pts}`, { color: '#ffffff', size: 34, life: 1 });
  G.sfx.kill(G.combo);
  if (e.def.boss) { hitstop(G.fx, 0.32); shake(G.fx, 30); flash(G.fx, '#ffffff', 0.7); G.sfx.boss(); G.bossDown = true; }
  else if (e.def.elite) { hitstop(G.fx, 0.08); shake(G.fx, 10); }
  else shake(G.fx, 2.5);
  if (!opts.noDrop && G.rng() < e.def.drop * G.mods.fuelDropMul) dropFuel(G, e.x, e.y);
  if (G.mods.chain && !opts.noChain) explode(G, c.x, c.y, 130, 28, '*', { noChain: true });
  for (const m of [10, 25, 50, 100]) {
    if (G.combo === m) { G.comboBanner = { text: `COMBO x${m}!`, t: 0 }; G.sfx.pickup(); }
  }
}

export function explode(G, x, y, radius, raw, tag, opts = {}) {
  ring(G.fx, x, y, { from: 8, to: radius, life: 0.3, width: 7, color: tag === '*' ? '#ffb627' : TAGS[tag].color, fill: 0.18 });
  for (const e of G.enemies) {
    if (e.dead) continue;
    const c = centerOf(e);
    const d = Math.hypot(c.x - x, c.y - y);
    if (d < radius + e.def.radius * 0.6) {
      damageEnemy(G, e, raw * (1 - (d / (radius * 1.4))), tag, { knock: { x, y, power: 260 }, noChain: opts.noChain, quiet: opts.quiet, ally: opts.ally });
    }
  }
}

export function healHero(G, h, amount) {
  if (h.downed) return;
  h.hp = Math.min(h.max, h.hp + amount);
}

export function hurtHero(G, h, dmg) {
  if (G.mode !== 'play' || h.inv > 0 || h.downed) return false;
  h.hp -= dmg;
  G.dmgTaken = (G.dmgTaken || 0) + dmg;
  h.hurtT = 0.34;
  h.inv = 0.85;
  G.sfx.hurt();
  if (G.haptic) G.haptic(40);
  shake(G.fx, 14);
  flash(G.fx, '#ff3b3b', 0.22);
  floatText(G.fx, h.x, h.y - 150, `-${Math.round(dmg)}`, { color: '#ff6b6b', size: 34 });
  if (h.hp <= 0) downHero(G, h);
  return true;
}

function downHero(G, h) {
  h.hp = 0;
  h.downed = true;
  h.od = 0;
  G.corpses.push({ id: h.id, x: h.x, y: h.y, face: h.face, t: 0 });
  burst(G.fx, h.x, h.y - 50, { color: ['#ff6b6b', '#ffffff', '#ffe14a'], count: 20, speed: 420, life: 0.7 });
  const next = G.squad.findIndex(s => !s.downed);
  if (next < 0) {
    G.mode = 'lose';
    G.endT = 0;
    G.sfx.lose();
    return;
  }
  G.hooks.swapTo(G, next, true);
}

export function dropFuel(G, x, y, kind) {
  let k = kind;
  if (!k) {
    const kinds = G.squad.map(s => s.def.fuel.kind);
    k = G.rng() < 0.45 ? G.squad[G.active].def.fuel.kind : kinds[Math.floor(G.rng() * kinds.length)];
  }
  G.pickups.push({ kind: k, x, y, t: 0, life: 17, z: 0, vz: 260, id: G.nextId++ });
}
