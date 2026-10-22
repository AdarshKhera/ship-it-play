import { DEFAULT_MODS, HEROES } from './data.js';
import { levelById } from './levels.js';
import { WORLD } from './config.js';
import { createFx } from './fx.js';
import { buildQueue, mulberry } from './rules.js';

const defaultLabel = id => ({ name: HEROES[id].name, title: HEROES[id].title });

export function makeHero(id, mods, label = defaultLabel(id)) {
  const def = HEROES[id];
  const max = def.hp + mods.hpBonus;
  return {
    id, def, name: label.name, title: label.title, x: 0, y: 0, face: 1, hp: max, max, t: 0, cd: 0.25, hurtT: 0, inv: 0,
    od: 0, odStored: 0, downed: false, moving: false, fireT: 9, deadT: 0,
  };
}

export function createRun({ squadIds, world, sfx, sprites, labelFor = defaultLabel, seed = Date.now(), touch = false, levelId = 'office' }) {
  const level = levelById(levelId);
  const mods = { ...DEFAULT_MODS, ...level.mods };
  const squad = squadIds.map(id => makeHero(id, mods, labelFor(id)));
  const cx = (WORLD.left + WORLD.right) / 2;
  squad.forEach(h => { h.x = cx; h.y = 980; });
  const G = {
    mode: 'play', paused: false, level, waves: level.waves, world, sfx, sprites, touch, rng: mulberry(seed), labelFor,
    squad, active: 0, swapCd: 0, mods, startMax: squad.reduce((s, h) => s + h.max, 0),
    enemies: [], shots: [], eshots: [], pickups: [], telegraphs: [], timers: [], corpses: [], zones: [], allies: [],
    fx: createFx(), pips: 1, driIndex: 0, surge: null, surgeDone: false, driBanner: null, surgeBanner: null,
    wave: 0, queue: [], queueTotal: 0, spawnT: 1.4, introT: 2.6, banner: '', clearT: 0, endT: 0,
    score: 0, kills: 0, combo: 0, comboT: 0, bestCombo: 0, time: 0, dmgTaken: 0, waveLog: [],
    cam: { x: cx - 800, y: 520 }, nextId: 1, cards: [], powerBanner: null, toast: null, hintStep: 0, hintT: 0,
    result: null, bossDown: false, cardsT: 0, squadPick: [],
  };
  startWave(G, 0);
  return G;
}

export function startWave(G, index) {
  const def = G.waves[index];
  G.wave = index;
  G.mode = 'play';
  G.queue = buildQueue(def.spawn, G.rng);
  G.queueTotal = G.queue.length;
  G.surge = null;
  G.surgeDone = !def.surge;
  G.spawnT = 1.2;
  G.introT = 2.6;
  G.banner = `WAVE ${index + 1}  ${def.name.toUpperCase()}`;
  G.bossDown = false;
  G.lastKillT = G.time;
  G.waveDmg0 = G.dmgTaken;
  G.timers = [];
}

export function applySquad(G, ids, labelFor = G.labelFor) {
  const prev = G.squad[G.active];
  const keep = new Map(G.squad.map(h => [h.id, h]));
  G.squad = ids.map(id => {
    const h = keep.get(id) || makeHero(id, G.mods, labelFor(id));
    const label = labelFor(id);
    h.name = label.name;
    h.title = label.title;
    h.max = h.def.hp + G.mods.hpBonus;
    h.hp = h.max;
    h.downed = false;
    h.od = 0;
    h.odStored = 0;
    h.inv = 0.8;
    h.x = prev.x;
    h.y = prev.y;
    h.face = prev.face;
    return h;
  });
  const idx = ids.indexOf(prev.id);
  G.active = idx >= 0 ? idx : 0;
  G.startMax = Math.max(G.startMax, G.squad.reduce((s, h) => s + h.max, 0));
}

export function after(G, seconds, fn) { G.timers.push({ t: seconds, fn }); }

export function aliveEnemies(G) { return G.enemies.filter(e => !e.dead); }
