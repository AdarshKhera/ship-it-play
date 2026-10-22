import { HEROES, STARTERS } from './data.js';
import { LEVELS, LEVEL_IDS } from './levels.js';

const KEY = 'shipit.profile.v2';
const MAX_SCORES = 10;
export const NAME_MAX = 12;
export const TITLE_MAX = 22;

export function sanitizeName(raw, max = NAME_MAX) {
  return String(raw ?? '').replace(/[\u0000-\u001f\u007f<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, max);
}

export function defaultProfile() {
  return {
    v: 2, player: 'Player', names: {}, bestWave: 1, cleared: [], level: 'office', scores: [], runs: 0, hintsDone: false, seenHowTo: false, seen: STARTERS.slice(),
    settings: { sound: true, vibration: true }, squad: STARTERS.slice(0, 3),
  };
}

function cleanSquad(list) {
  const ok = Array.isArray(list) && list.length === 3 && new Set(list).size === 3 && list.every(id => HEROES[id]);
  return ok ? list.slice() : STARTERS.slice(0, 3);
}

function cleanScores(list) {
  if (!Array.isArray(list)) return [];
  return list
    .filter(e => e && Number.isFinite(e.score))
    .map(e => ({
      score: Math.round(e.score), wave: Math.min(5, Math.max(1, Math.round(e.wave) || 1)), stars: Math.min(3, Math.max(0, Math.round(e.stars) || 0)),
      name: sanitizeName(e.name) || 'Player', level: LEVEL_IDS.includes(e.level) ? e.level : 'office', squad: Array.isArray(e.squad) ? e.squad.filter(id => HEROES[id]).slice(0, 3) : [], won: !!e.won, date: Number(e.date) || 0,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_SCORES);
}

export function migrate(raw) {
  const d = defaultProfile();
  if (!raw || typeof raw !== 'object') return d;
  const names = {};
  for (const id of Object.keys(HEROES)) {
    const n = raw.names && raw.names[id];
    if (n) {
      const entry = { name: sanitizeName(n.name), title: sanitizeName(n.title, TITLE_MAX) };
      if (entry.name || entry.title) names[id] = entry;
    }
  }
  return {
    ...d,
    player: sanitizeName(raw.player) || d.player,
    names,
    bestWave: Math.min(5, Math.max(1, Math.round(Number(raw.bestWave)) || 1)),
    cleared: Array.isArray(raw.cleared) ? LEVEL_IDS.filter(id => raw.cleared.includes(id)) : [],
    level: LEVEL_IDS.includes(raw.level) ? raw.level : 'office',
    scores: cleanScores(raw.scores),
    runs: Math.max(0, Math.round(Number(raw.runs)) || 0),
    hintsDone: !!raw.hintsDone,
    seenHowTo: !!raw.seenHowTo,
    seen: Array.isArray(raw.seen) ? raw.seen.filter(id => HEROES[id]) : d.seen,
    settings: { sound: raw.settings?.sound !== false, vibration: raw.settings?.vibration !== false },
    squad: cleanSquad(raw.squad),
  };
}

function store() {
  try { return globalThis.localStorage; } catch { return null; }
}

export function loadProfile(storage) {
  try { return migrate(JSON.parse((storage ?? store()).getItem(KEY))); } catch { return defaultProfile(); }
}

export function saveProfile(profile, storage) {
  try { (storage ?? store()).setItem(KEY, JSON.stringify(profile)); return true; } catch { return false; }
}

export function heroLabel(profile, def) {
  const o = profile.names[def.id];
  return { name: (o && o.name) || def.name, title: (o && o.title) || def.title };
}

export function setHeroLabel(profile, id, { name, title }) {
  if (!HEROES[id]) return profile;
  const clean = { name: sanitizeName(name), title: sanitizeName(title, TITLE_MAX) };
  const names = { ...profile.names };
  if (!clean.name && !clean.title) delete names[id];
  else names[id] = clean;
  return { ...profile, names };
}

export function setPlayerName(profile, name) {
  return { ...profile, player: sanitizeName(name) || 'Player' };
}

export function reachWave(profile, wave) {
  const w = Math.min(5, Math.max(1, Math.round(wave) || 1));
  return w > profile.bestWave ? { ...profile, bestWave: w } : profile;
}

export function markSeen(profile, ids) {
  const seen = Array.from(new Set([...profile.seen, ...ids.filter(id => HEROES[id])]));
  return seen.length === profile.seen.length ? profile : { ...profile, seen };
}

export function newlyUnlocked(prevBestWave, bestWave) {
  return Object.values(HEROES).filter(h => h.unlock > prevBestWave && h.unlock <= bestWave).map(h => h.id);
}

export function levelUnlocked(profile, id) {
  const i = LEVEL_IDS.indexOf(id);
  return i === 0 || (i > 0 && profile.cleared.includes(LEVEL_IDS[i - 1]));
}

export function nextLevelId(id) {
  return LEVEL_IDS[LEVEL_IDS.indexOf(id) + 1] || null;
}

export function recordRun(profile, run) {
  const level = LEVEL_IDS.includes(run.level) ? run.level : 'office';
  const entry = {
    score: run.score, wave: run.wave, stars: run.stars, name: profile.player, level, squad: run.squad, won: run.won, date: run.date ?? 0,
  };
  const next = nextLevelId(level);
  const opened = run.won && next && !profile.cleared.includes(level) ? next : null;
  const cleared = run.won && !profile.cleared.includes(level) ? LEVEL_IDS.filter(id => id === level || profile.cleared.includes(id)) : profile.cleared;
  const scores = cleanScores([...profile.scores, entry]);
  const rank = scores.findIndex(s => s.score === entry.score && s.date === entry.date && s.name === entry.name) + 1;
  return { profile: { ...reachWave({ ...profile, scores, cleared, level, runs: profile.runs + 1 }, run.wave), hintsDone: true }, rank, opened, best: entry.score > (profile.scores[0]?.score ?? -Infinity) };
}

export function shareText(entry, heroNames, url) {
  const stars = '★'.repeat(entry.stars) + '☆'.repeat(3 - entry.stars);
  const where = LEVELS.find(l => l.id === entry.level) || LEVELS[0];
  const verdict = entry.won ? `${where.name} cleared` : `Reached wave ${entry.wave} in ${where.name}`;
  return `Ship It: ${entry.score.toLocaleString('en-US')} pts ${stars}\n${verdict} with ${heroNames.join(', ')}\nBeat me: ${url}`;
}
