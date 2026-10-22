import { MAX_PIPS, TAGS } from './config.js';
import { totalHp } from './rules.js';
import { burst, flash, floatText, hitstop, line, ring, shake, slowmo } from './fx.js';
import { centerOf, damageEnemy, healHero, killEnemy } from './combat.js';
import { after } from './state.js';
import { addZone } from './zones.js';

const living = G => G.enemies.filter(e => !e.dead);
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

function forcePush(G, h, tier) {
  const R = [320, 520, 860][tier - 1];
  const dmg = [42, 90, 190][tier - 1] * G.mods.powerMul;
  const color = TAGS.CODE.color;
  const cx = h.x;
  const cy = h.y - 30;
  for (let i = 0; i < 3; i++) {
    after(G, i * 0.09, () => ring(G.fx, cx, cy, { from: 20, to: R * (0.62 + i * 0.2), life: 0.5, width: 20 - i * 5, color: i === 1 ? '#ffffff' : color, fill: i === 0 ? 0.2 : 0 }));
  }
  burst(G.fx, cx, cy, { color: [color, '#ffffff', TAGS.CODE.soft], count: 14 + tier * 16, speed: 760 + tier * 140, life: 0.9, size: 15, shape: 'glyph', glyphs: ['{', '}', '</>', ';', '[]', '&&', '=>'], gravity: 100, up: 0 });
  burst(G.fx, cx, cy, { color: [color, '#ffffff'], count: 20 + tier * 14, speed: 640, life: 0.7, size: 13 });
  for (const e of living(G)) {
    const d = dist(e, h);
    if (d > R) continue;
    const near = 1 - (d / R) * 0.55;
    after(G, (d / R) * 0.22, () => {
      if (e.dead) return;
      const cleaner = tier === 3 && !e.def.elite && totalHp(e.segs) < 110;
      damageEnemy(G, e, dmg * near, 'CODE', { knock: { x: h.x, y: h.y, power: 1100 * near }, force: true, quiet: cleaner });
      if (cleaner && !e.dead) { killEnemy(G, e); floatText(G.fx, e.x, e.y - 130, 'REVERTED', { color, size: 26 }); }
    });
  }
}

function frameLock(G, h, tier) {
  const R = [440, 660, 1040][tier - 1];
  const dur = [2.6, 4, 5.6][tier - 1];
  const dmg = [48, 90, 170][tier - 1] * G.mods.powerMul;
  const color = TAGS.DESIGN.color;
  const cx = h.x;
  const cy = h.y - 30;
  for (let i = 0; i < 2; i++) after(G, i * 0.1, () => ring(G.fx, cx, cy, { from: 20, to: R * (0.8 + i * 0.2), life: 0.55, width: 16 - i * 6, color: i ? '#ffffff' : color, fill: i ? 0 : 0.16 }));
  burst(G.fx, cx, cy, { color: [color, '#ffffff', TAGS.DESIGN.soft], count: 24 + tier * 12, speed: 620, life: 0.8, size: 14, shape: 'glyph', glyphs: ['◇', '□', '○', '✦', '▢'], gravity: 80, up: 0 });
  for (const e of living(G)) {
    const d = dist(e, h);
    if (d > R) continue;
    after(G, (d / R) * 0.25, () => {
      if (e.dead) return;
      const f = e.def.boss ? 0.28 : 1;
      e.frozen = dur * f;
      e.lock = { dmg: dmg * (e.def.boss ? 0.8 : 1), t: 0, dur: dur * f };
      const c = centerOf(e);
      burst(G.fx, c.x, c.y, { color: [color, '#ffffff'], count: 6, speed: 260, life: 0.35, size: 10, gravity: 0, up: 0 });
    });
  }
}

function scopeCut(G, h, tier) {
  const N = [3, 6, 14][tier - 1];
  const color = TAGS.PROCESS.color;
  const targets = living(G).filter(e => dist(e, h) < 1100).sort((a, b) => dist(a, h) - dist(b, h)).slice(0, N);
  ring(G.fx, h.x, h.y - 30, { from: 20, to: 360 + tier * 120, life: 0.5, width: 12, color, fill: 0.14 });
  for (const e of living(G)) { e.slow = 3.2 + tier; if (!e.def.boss) { e.vx += (e.x - h.x) * 1.4; e.vy += (e.y - h.y) * 1.4; } }
  targets.forEach((e, i) => {
    after(G, 0.16 + i * 0.075, () => {
      if (e.dead) return;
      const c = centerOf(e);
      line(G.fx, c.x - 110, c.y - 70, c.x + 110, c.y + 70, { color: '#ffffff', width: 10, life: 0.35 });
      line(G.fx, c.x - 110, c.y + 70, c.x + 110, c.y - 70, { color, width: 10, life: 0.35 });
      burst(G.fx, c.x, c.y, { color: [color, '#ffffff', '#ff4d4d'], count: 14, speed: 540, life: 0.6, size: 13, shape: 'glyph', glyphs: ['✕', '−', '⌫'], gravity: 200, up: 0 });
      shake(G.fx, 7);
      G.sfx.kill(i + 8);
      if (e.def.elite) damageEnemy(G, e, 150 * G.mods.powerMul * (e.def.boss ? 1.2 : 1), 'PROCESS', { force: true, knock: { x: h.x, y: h.y, power: 600 } });
      else { floatText(G.fx, c.x, c.y - e.def.radius * 1.4, 'DELETED', { color: '#ffffff', size: 24 }); killEnemy(G, e); }
    });
  });
}

function edgeCase(G, h, tier) {
  const N = [9, 18, 34][tier - 1];
  const color = TAGS.TEST.color;
  ring(G.fx, h.x, h.y - 30, { from: 20, to: 280, life: 0.45, width: 12, color, fill: 0.15 });
  for (let i = 0; i < N; i++) {
    after(G, i * 0.026, () => {
      const a = G.rng() * Math.PI * 2;
      const sp = 380 + G.rng() * 280;
      const src = G.squad[G.active];
      G.shots.push({ kind: 'bomb', x: src.x, y: src.y - 60, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 120, dmg: 44 * G.mods.powerMul, tag: 'TEST', r: 14, life: 2.6, hit: new Set(), rot: 0, pierce: 1 });
      G.sfx.shoot('ping');
    });
  }
  burst(G.fx, h.x, h.y - 40, { color: [color, '#ffffff', '#ffe14a'], count: 26, speed: 600, life: 0.7, size: 12, shape: 'glyph', glyphs: ['✓', '!', '?', '404'], gravity: 100, up: 0 });
}

const pick = (list, tier) => list[tier - 1];
const TAU = Math.PI * 2;

function hotfix(G, h, tier) {
  const color = TAGS.CODE.color;
  addZone(G, {
    kind: 'beam', dur: pick([1.2, 1.5, 1.9], tier), angle: G.rng() * TAU, spin: 4.8, beams: tier + 1, len: 1100,
    width: pick([44, 56, 70], tier), dmg: pick([7, 10, 14], tier) * G.mods.powerMul, ox: h.x, oy: h.y - 60,
  });
  ring(G.fx, h.x, h.y - 30, { from: 20, to: 280, life: 0.45, width: 14, color, fill: 0.18 });
  burst(G.fx, h.x, h.y - 50, { color: [color, '#ffffff', TAGS.CODE.soft], count: 24, speed: 560, life: 0.7, size: 13, shape: 'glyph', glyphs: ['{', '}', ';', '!'], gravity: 80, up: 0 });
}

function rollback(G, h, tier) {
  addZone(G, {
    kind: 'vortex', dur: pick([1.0, 1.2, 1.4], tier), x: h.x, y: h.y, radius: pick([480, 660, 900], tier), pull: 950,
    blast: pick([240, 320, 420], tier), dmg: pick([60, 110, 200], tier) * G.mods.powerMul, blown: false,
  });
  ring(G.fx, h.x, h.y - 30, { from: 30, to: 320, life: 0.5, width: 14, color: TAGS.CODE.color });
}

function colorBurst(G, h, tier) {
  const n = pick([10, 18, 30], tier);
  addZone(G, { kind: 'rain', dur: pick([1.2, 1.6, 2.2], tier), n, left: n, dmg: pick([34, 52, 76], tier) * G.mods.powerMul, splats: [] });
  burst(G.fx, h.x, h.y - 60, { color: ['#ff4fa3', '#ffb627', '#3ad0ff', '#7cf0b0'], count: 30, speed: 560, life: 0.7, size: 13, shape: 'circle', gravity: 300, up: 200 });
  ring(G.fx, h.x, h.y - 30, { from: 20, to: 300, life: 0.45, width: 12, color: TAGS.DESIGN.color, fill: 0.16 });
}

function userInterview(G, h, tier) {
  const color = TAGS.DESIGN.color;
  const dur = pick([6, 9, 12], tier);
  ring(G.fx, h.x, h.y - 30, { from: 20, to: 900, life: 0.7, width: 14, color, fill: 0.1 });
  for (const e of living(G)) {
    e.vuln = dur;
    e.slow = Math.max(e.slow, 3);
    const c = centerOf(e);
    burst(G.fx, c.x, c.y - 20, { color: [color, '#ffffff'], count: 5, speed: 200, life: 0.4, size: 9, gravity: 0, up: 0 });
  }
  G.squad.forEach(m => healHero(G, m, m.max * pick([0.1, 0.18, 0.28], tier)));
  floatText(G.fx, h.x, h.y - 190, 'Insights found!', { color, size: 30, life: 1.1 });
}

function sprintReset(G, h, tier) {
  const color = TAGS.PROCESS.color;
  addZone(G, { kind: 'timestop', dur: pick([2.5, 4, 6], tier) });
  G.squad.forEach(m => {
    if (m.downed && tier === 3) { m.downed = false; m.hp = m.max * 0.4; }
    healHero(G, m, m.max * pick([0.25, 0.4, 0.6], tier));
  });
  G.eshots = [];
  ring(G.fx, h.x, h.y - 30, { from: 20, to: 520, life: 0.6, width: 16, color, fill: 0.14 });
  floatText(G.fx, h.x, h.y - 190, 'TIME OUT', { color, size: 34, life: 1.2 });
}

function airCover(G, h, tier) {
  addZone(G, { kind: 'shield', dur: pick([3.5, 5.5, 8], tier), radius: pick([240, 290, 340], tier), dmg: pick([8, 12, 17], tier) * G.mods.powerMul, x: h.x, y: h.y });
  ring(G.fx, h.x, h.y - 30, { from: 20, to: 300, life: 0.5, width: 14, color: TAGS.PROCESS.color, fill: 0.2 });
}

function chaosMonkey(G, h, tier) {
  const n = pick([7, 13, 24], tier);
  addZone(G, { kind: 'lightning', dur: pick([1.2, 1.6, 2.2], tier), n, left: n, dmg: pick([46, 66, 92], tier) * G.mods.powerMul });
  ring(G.fx, h.x, h.y - 30, { from: 20, to: 260, life: 0.4, width: 12, color: TAGS.TEST.color, fill: 0.16 });
}

function penTest(G, h, tier) {
  addZone(G, {
    kind: 'orbit', dur: pick([5, 7, 9], tier), blades: pick([4, 6, 8], tier), radius: pick([150, 175, 200], tier), spin: 7,
    dmg: pick([11, 15, 20], tier) * G.mods.powerMul, angle: 0, cx: h.x, cy: h.y - 55, pos: [],
  });
  ring(G.fx, h.x, h.y - 30, { from: 20, to: 240, life: 0.4, width: 12, color: TAGS.TEST.color, fill: 0.16 });
}

const POWERS = {
  forcePush, hotfix, rollback, frameLock, colorBurst, userInterview, scopeCut, sprintReset, airCover, edgeCase, chaosMonkey, penTest,
};

export function usePower(G) {
  if (G.mode !== 'play' || G.pips < 1) return false;
  const h = G.squad[G.active];
  if (h.downed) return false;
  const tier = Math.min(MAX_PIPS, Math.floor(G.pips));
  G.pips -= tier;
  const color = TAGS[h.def.tag].color;
  POWERS[h.def.power.kind](G, h, tier);
  G.powerBanner = { name: h.def.power.name.toUpperCase(), tier, color, t: 0 };
  G.sfx.power(tier);
  if (G.haptic) G.haptic([30, 40, 30 + tier * 25]);
  slowmo(G.fx, 0.22 + tier * 0.06, 0.32);
  hitstop(G.fx, 0.05 + tier * 0.02);
  shake(G.fx, 12 + tier * 9);
  flash(G.fx, color, 0.3 + tier * 0.12);
  return true;
}
