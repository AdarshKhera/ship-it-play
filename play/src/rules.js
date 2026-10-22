import { MATCH_MULT, OFF_MULT } from './config.js';
import { ENEMIES, UPGRADES } from './data.js';
import { TAG_ORDER } from './config.js';

export const NEUTRAL = '*';

export function damageMultiplier(segmentTag, heroTag) {
  if (heroTag === NEUTRAL) return 1;
  return segmentTag === heroTag ? MATCH_MULT : OFF_MULT;
}

export function pickSegmentIndex(segs, tag) {
  const matched = segs.findIndex(s => s.tag === tag && s.hp > 0);
  return matched >= 0 ? matched : segs.findIndex(s => s.hp > 0);
}

export function applyHit(segs, tag, raw) {
  const idx = pickSegmentIndex(segs, tag);
  if (idx < 0 || !Number.isFinite(raw) || raw < 0) {
    return { segs, shown: 0, matched: false, dead: idx < 0 };
  }
  const matched = segs[idx].tag === tag;
  const shown = raw * damageMultiplier(segs[idx].tag, tag);
  const next = segs.map((s, i) => (i === idx ? { ...s, hp: Math.max(0, s.hp - shown) } : s));
  return { segs: next, shown, matched, dead: next.every(s => s.hp <= 0) };
}

export function totalHp(segs) {
  return segs.reduce((sum, s) => sum + s.hp, 0);
}

export function buildSegments(def, hpScale, flyerTag) {
  if (def.segs) return def.segs.map(([tag, hp]) => ({ tag, hp: Math.round(hp * hpScale), max: Math.round(hp * hpScale) }));
  const hp = Math.round(def.hp * hpScale);
  return [{ tag: flyerTag, hp, max: hp }];
}

export function comboMultiplier(combo) {
  return 1 + Math.min(Math.max(combo, 0), 30) * 0.04;
}

export function hpScaleForWave(wave) {
  return 1 + wave * 0.14;
}

export function buildQueue(spawnTable, rng) {
  const fodder = [];
  const specials = [];
  for (const [type, count] of Object.entries(spawnTable)) {
    const bucket = ENEMIES[type].elite ? specials : fodder;
    for (let i = 0; i < count; i++) bucket.push(type);
  }
  for (let i = fodder.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [fodder[i], fodder[j]] = [fodder[j], fodder[i]];
  }
  const queue = fodder.slice();
  specials.forEach((type, i) => {
    const at = ENEMIES[type].boss ? Math.min(4, queue.length) : Math.floor(queue.length * ((i + 1) / (specials.length + 1)));
    queue.splice(at, 0, type);
  });
  return queue;
}

export function applyUpgrade(mods, id) {
  const up = UPGRADES.find(u => u.id === id);
  return up ? up.apply(mods) : mods;
}

export function pickUpgrades(count, rng, exclude = []) {
  const pool = UPGRADES.filter(u => !exclude.includes(u.id));
  const out = [];
  while (out.length < count && pool.length) {
    out.push(pool.splice(Math.floor(rng() * pool.length), 1)[0]);
  }
  return out;
}

export function starRating({ damageRatio, seconds }) {
  if (damageRatio <= 0.6 && seconds <= 330) return 3;
  if (damageRatio <= 1.5) return 2;
  return 1;
}

const clampNum = (v, lo = 0) => (Number.isFinite(v) ? Math.max(lo, v) : lo);

export function finalScore({ base, wavesCleared, flawlessWaves, damageRatio, seconds, won }) {
  const b = Math.round(clampNum(base));
  const waveBonus = Math.round(clampNum(wavesCleared)) * 400;
  const flawless = Math.round(clampNum(flawlessWaves)) * 300;
  const survivor = won ? Math.round((1 - Math.min(clampNum(damageRatio), 1)) * 1200) : 0;
  const speed = won ? Math.round(clampNum(300 - clampNum(seconds)) * 4) : 0;
  return { base: b, waveBonus, flawless, survivor, speed, total: b + waveBonus + flawless + survivor + speed };
}

export function waveMix(waveDef) {
  const mix = Object.fromEntries(TAG_ORDER.map(t => [t, 0]));
  const add = spawn => {
    for (const [key, n] of Object.entries(spawn)) {
      const e = ENEMIES[key];
      if (e.segs) e.segs.forEach(([tag]) => { mix[tag] += n; });
      else TAG_ORDER.forEach(tag => { mix[tag] += n / 4; });
    }
  };
  add(waveDef.spawn);
  if (waveDef.surge) add(waveDef.surge.spawn);
  return Object.fromEntries(Object.entries(mix).map(([t, n]) => [t, Math.round(n)]));
}

export function isUnlocked(bestWave, def) {
  return clampNum(bestWave, 1) >= def.unlock;
}

export function mulberry(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
