import { MAX_ENEMIES, MAX_PIPS, PIP_SECONDS, WORLD, ZOOM, view, visible } from './config.js';
import { applyUpgrade, finalScore, pickUpgrades, starRating } from './rules.js';
import { burst, floatText, ring, shake, timeScale, updateFx } from './fx.js';
import { killEnemy } from './combat.js';
import { updateEnemies, updateEnemyShots, updateTelegraphs } from './ai.js';
import { swapNext, swapTo, updateHeroes, updatePickups, updateShots } from './heroes.js';
import { usePower } from './powers.js';
import { spawnEnemy } from './spawn.js';
import { applySquad, startWave } from './state.js';
import { updateZones } from './zones.js';
import { summonDri, updateAllies } from './allies.js';

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const SURGE_WARN = 2.4;

export function attachHooks(G) {
  G.hooks = { swapTo };
}

export function commandSwap(G, dir = 1) {
  if (G.mode !== 'play') return false;
  return swapNext(G, dir);
}

export function commandSwapTo(G, i) {
  if (G.mode !== 'play') return false;
  return swapTo(G, i);
}

export function commandPower(G) { return usePower(G); }

function endWave(G) {
  const last = G.wave >= G.waves.length - 1;
  G.waveLog.push({ wave: G.wave + 1, t: Math.round(G.time), dmg: Math.round(G.dmgTaken - G.waveDmg0) });
  G.mode = 'clear';
  G.clearT = last ? 2.8 : 2;
  G.banner = last ? (G.level.id === 'office' ? 'SPRINT SHIPPED!' : 'LEVEL CLEARED!') : 'WAVE CLEARED';
  G.sfx.wave();
  G.eshots = [];
  G.telegraphs = [];
  G.zones = [];
  G.surge = null;
  G.allies.forEach(a => { if (a.state !== 'leave') { a.state = 'leave'; a.rise = 0; } });
  const h = G.squad[G.active];
  burst(G.fx, h.x, h.y - 60, { color: ['#ff4fa3', '#3aa0ff', '#ffb627', '#3ddc84', '#ffffff'], count: 60, speed: 720, life: 1.2, size: 14 });
  ring(G.fx, h.x, h.y - 30, { from: 20, to: 520, life: 0.7, width: 16, color: '#ffffff', fill: 0.12 });
  G.squad.forEach(s => {
    if (s.downed) { s.downed = false; floatText(G.fx, h.x, h.y - 230, 'Team revived', { color: '#ffffff', size: 26, life: 1.2 }); }
    s.hp = s.max;
  });
  G.pickups.forEach(p => { p.life = Math.max(p.life, 8); });
}

function finishRun(G, won) {
  const damageRatio = G.dmgTaken / Math.max(1, G.startMax);
  const breakdown = finalScore({
    base: G.score, wavesCleared: won ? G.waves.length : G.wave, flawlessWaves: G.waveLog.filter(w => w.dmg === 0).length,
    damageRatio, seconds: G.time, won,
  });
  G.result = {
    won, score: breakdown.total, breakdown, kills: G.kills, bestCombo: G.bestCombo, seconds: Math.round(G.time),
    stars: won ? starRating({ damageRatio, seconds: G.time }) : 0, wave: G.wave + 1, damageRatio,
    squad: G.squad.map(h => h.id), squadNames: G.squad.map(h => h.name), level: G.level.id, levelName: G.level.name, waveCount: G.waves.length,
  };
  G.mode = won ? 'win' : 'lost';
  G.endT = 0;
  if (won) G.sfx.win();
}

export function chooseCard(G, index) {
  const card = G.cards[index];
  if (!card || G.mode !== 'cards' || G.cardsT < 0.6) return false;
  G.mods = applyUpgrade(G.mods, card.id);
  G.squad.forEach(h => {
    const prev = h.max;
    h.max = h.def.hp + G.mods.hpBonus;
    h.hp = card.id === 'skin' ? h.max : Math.min(h.max, h.hp + (h.max - prev));
  });
  G.sfx.pickup();
  G.mode = 'squad';
  G.squadPick = G.squad.map(h => h.id);
  G.cardsT = 0;
  return true;
}

export function commitSquad(G, ids) {
  if (G.mode !== 'squad' || ids.length !== 3 || new Set(ids).size !== 3) return false;
  applySquad(G, ids);
  startWave(G, G.wave + 1);
  return true;
}

function ringPoint(G, i, n) {
  const vis = visible();
  const h = G.squad[G.active];
  for (let tries = 0; tries < 6; tries++) {
    const a = (i / n) * Math.PI * 2 + G.rng() * 0.5 + tries * 0.9;
    const x = clamp(h.x + Math.cos(a) * (vis.w / 2 + 160), WORLD.left + 50, WORLD.right - 50);
    const y = clamp(h.y + Math.sin(a) * (vis.h / 2 + 120), WORLD.top + 50, WORLD.bottom - 20);
    if (Math.hypot(x - h.x, y - h.y) > 520) return { x, y };
  }
  return { x: clamp(h.x + 700, WORLD.left + 50, WORLD.right - 50), y: clamp(h.y, WORLD.top + 50, WORLD.bottom - 20) };
}

function surgeTick(G, dt, def) {
  const s = def.surge;
  if (s && !G.surge && !G.surgeDone && G.queueTotal && 1 - G.queue.length / G.queueTotal >= s.at) {
    const list = [];
    Object.entries(s.spawn).forEach(([k, n]) => { for (let i = 0; i < n; i++) list.push(k); });
    for (let i = list.length - 1; i > 0; i--) { const j = Math.floor(G.rng() * (i + 1)); [list[i], list[j]] = [list[j], list[i]]; }
    G.surge = { t: 0, def: s, list, total: list.length, spawned: 0, driDone: false, tick: 0 };
    G.surgeBanner = { label: s.label, t: 0 };
    G.sfx.boss();
    shake(G.fx, 12);
  }
  const sg = G.surge;
  if (!sg) return;
  sg.t += dt;
  if (sg.t < SURGE_WARN) return;
  if (sg.def.dri && !sg.driDone && sg.t > SURGE_WARN + 0.2) { sg.driDone = true; summonDri(G); }
  sg.tick -= dt;
  while (sg.tick <= 0 && sg.list.length) {
    sg.tick += 0.035;
    spawnEnemy(G, sg.list.shift(), ringPoint(G, sg.spawned++, sg.total), { fromSurge: true });
  }
  if (!sg.list.length && (!sg.def.dri || sg.driDone)) { G.surge = null; G.surgeDone = true; }
}

function spawnTick(G, dt) {
  const def = G.waves[G.wave];
  G.introT = Math.max(0, G.introT - dt);
  const alive = G.enemies.reduce((n, e) => n + (e.dead ? 0 : 1), 0);
  if (G.introT < 1.3 && G.queue.length && alive < MAX_ENEMIES) {
    G.spawnT -= dt;
    if (G.spawnT <= 0) {
      const key = G.queue.shift();
      const e = spawnEnemy(G, key);
      G.spawnT = def.gap * (0.55 + G.rng() * 0.9);
      if (e.def.boss) { G.sfx.boss(); shake(G.fx, 20); G.bossIntro = { t: 0, name: e.def.name }; }
    }
  }
  if (G.introT < 1.3) surgeTick(G, dt, def);
  if (alive > 0 && alive <= 5 && !G.queue.length && !G.surge && G.time - G.lastKillT > 12 && !G.enemies.some(e => e.def.boss && !e.dead)) {
    G.enemies.forEach(e => { e.rage = true; });
  }
  if (G.bossDown) {
    G.queue = [];
    G.enemies.forEach(e => { if (!e.dead) killEnemy(G, e, { noDrop: true, noChain: true }); });
    G.bossDown = false;
    if (G.surge) { G.surge = null; G.surgeDone = true; }
  }
  if (!G.queue.length && !G.surge && G.surgeDone && alive === 0 && G.introT <= 0) endWave(G);
}

function updateHints(G, dt) {
  if (!G.hintsOn || G.wave !== 0 || G.mode !== 'play') return;
  G.hintT += dt;
  const steps = [
    [0.8, G.touch ? 'Drag on the left to move. Your hero attacks on its own.' : 'WASD or arrow keys to move. Your hero attacks on its own.'],
    [8, 'Match the hero colour to the enemy bar for big damage.'],
    [16, G.touch ? 'Meter full? Hit POWER. Tap TAG to swap heroes.' : 'Meter full? Press SPACE for POWER. SHIFT swaps heroes.'],
    [26, 'Grab drinks that match your hero for OVERDRIVE.'],
  ];
  const next = steps[G.hintStep];
  if (next && G.hintT >= next[0]) { G.toast = { text: next[1], t: 0, dur: 6 }; G.hintStep++; }
}

function tickBanners(G, rawDt) {
  for (const k of ['powerBanner', 'comboBanner', 'bossIntro', 'driBanner', 'surgeBanner']) {
    const b = G[k];
    if (!b) continue;
    b.t += rawDt;
    if (b.t > (k === 'bossIntro' ? 2.4 : k === 'comboBanner' ? 1.2 : k === 'powerBanner' ? 1.3 : k === 'driBanner' ? 3.2 : 2.6)) G[k] = null;
  }
  if (G.toast) { G.toast.t += rawDt; if (G.toast.t > G.toast.dur) G.toast = null; }
}

export function updateGame(G, rawDt, move) {
  if (G.paused) return;
  updateFx(G.fx, rawDt);
  tickBanners(G, rawDt);
  if (G.mode === 'cards' || G.mode === 'squad') { G.cardsT += rawDt; return; }
  const dt = rawDt * timeScale(G.fx);

  if (G.mode === 'win' || G.mode === 'lost') { G.endT += rawDt; updateEnemies(G, dt); return; }

  if (G.mode === 'play') G.time += dt;

  for (const t of G.timers) t.t -= dt;
  const due = G.timers.filter(t => t.t <= 0);
  G.timers = G.timers.filter(t => t.t > 0);
  due.forEach(t => t.fn());

  if (G.mode === 'lose') {
    G.endT += rawDt;
    updateEnemies(G, dt);
    updateAllies(G, dt);
    if (G.endT > 1.6) finishRun(G, false);
    return;
  }

  G.pips = Math.min(MAX_PIPS, G.pips + (dt * G.mods.pipRateMul) / PIP_SECONDS);
  G.comboT -= dt;
  if (G.comboT <= 0) G.combo = 0;
  G.corpses.forEach(c => { c.t += dt; });
  G.corpses = G.corpses.filter(c => c.t < 1.4);

  updateHeroes(G, dt, G.mode === 'play' ? move : { x: 0, y: 0 });
  if (G.mode === 'play') { spawnTick(G, dt); updateHints(G, rawDt); }
  updateEnemies(G, dt);
  updateZones(G, dt);
  updateAllies(G, dt);
  updateShots(G, dt);
  updateEnemyShots(G, dt);
  updateTelegraphs(G, dt);
  updatePickups(G, dt);

  if (G.mode === 'clear') {
    G.clearT -= dt;
    if (G.clearT <= 0) {
      if (G.wave >= G.waves.length - 1) finishRun(G, true);
      else { G.mode = 'cards'; G.cardsT = 0; G.cards = pickUpgrades(3, G.rng); }
    }
  }

  const h = G.squad[G.active];
  const vis = visible();
  const tx = clamp(h.x - vis.w / 2, 0, WORLD.w - vis.w);
  const ty = clamp(h.y - vis.h * 0.56, 0, WORLD.h - vis.h);
  const k = Math.min(1, rawDt * 7);
  G.cam.x += (tx - G.cam.x) * k;
  G.cam.y += (ty - G.cam.y) * k;
}

export { ZOOM, view };
