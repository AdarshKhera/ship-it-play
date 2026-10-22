const hero = (id, name, title, tag, tagline, unlock, stats, fuel, weapon, overdrive, power, pro, con) => ({
  id, name, title, tag, tagline, unlock, sprite: id, scale: stats.scale ?? 0.8, hp: stats.hp, speed: stats.speed, fuel, weapon, overdrive, power, pro, con,
});

export const HEROES = {
  dave: hero('dave', 'Dave', 'Senior Engineer', 'CODE', 'Ships on Fridays. Regrets nothing.', 1,
    { hp: 120, speed: 262 }, { kind: 'coffee', name: 'Coffee' },
    { kind: 'bolt', cooldown: 0.42, damage: 15, speed: 820, pierce: 3, radius: 15, count: 1, spread: 0 },
    { count: 3, spread: 0.2, pierce: 99 },
    { name: 'Force Push', kind: 'forcePush', blurb: 'A shockwave that blasts everything away' },
    'Bolts pierce whole lines of enemies', 'Slow reload'),
  nadia: hero('nadia', 'Nadia', 'Backend Engineer', 'CODE', 'Zero downtime. Zero small talk.', 2,
    { hp: 110, speed: 270 }, { kind: 'coldbrew', name: 'Cold Brew' },
    { kind: 'dart', cooldown: 0.34, damage: 10, speed: 1100, pierce: 5, radius: 11, count: 1, spread: 0 },
    { count: 3, spread: 0.1, pierce: 99 },
    { name: 'Hotfix', kind: 'hotfix', blurb: 'A spinning laser that slices the whole room' },
    'Needle shots pierce entire rows', 'Light hits on single targets'),
  kiran: hero('kiran', 'Kiran', 'DevOps Engineer', 'CODE', 'It works on every machine now.', 4,
    { hp: 132, speed: 250 }, { kind: 'kombucha', name: 'Kombucha' },
    { kind: 'orb', cooldown: 0.72, damage: 26, speed: 520, pierce: 2, radius: 22, count: 1, spread: 0 },
    { count: 3, spread: 0.3, pierce: 4 },
    { name: 'Rollback', kind: 'rollback', blurb: 'Drags every enemy in, then blows them up' },
    'Heavy orbs hit like a truck', 'Slow to fire'),
  mei: hero('mei', 'Mei', 'Product Designer', 'DESIGN', 'Pixel perfect or nothing.', 1,
    { hp: 110, speed: 275 }, { kind: 'cola', name: 'Diet Coke' },
    { kind: 'star', cooldown: 0.52, damage: 9, speed: 660, pierce: 1, radius: 15, count: 3, spread: 0.24 },
    { count: 7, spread: 0.2, pierce: 2 },
    { name: 'Frame Lock', kind: 'frameLock', blurb: 'Traps a crowd in frames, then shatters them' },
    'A fan of stars covers a wide area', 'Low damage per star'),
  zoe: hero('zoe', 'Zoe', 'Motion Designer', 'DESIGN', 'Everything needs more easing.', 2,
    { hp: 108, speed: 280 }, { kind: 'oj', name: 'Orange Juice' },
    { kind: 'orb', cooldown: 0.5, damage: 8, speed: 640, pierce: 1, radius: 16, count: 2, spread: 0.36 },
    { count: 5, spread: 0.22, pierce: 2 },
    { name: 'Color Burst', kind: 'colorBurst', blurb: 'Paint bombs rain down on the crowd' },
    'Twin paint shots, very quick feet', 'Splashy but shallow'),
  theo: hero('theo', 'Theo', 'UX Researcher', 'DESIGN', 'But what do users actually want?', 4,
    { hp: 118, speed: 262 }, { kind: 'boba', name: 'Boba Tea' },
    { kind: 'dart', cooldown: 0.4, damage: 11, speed: 900, pierce: 2, radius: 12, count: 1, spread: 0 },
    { count: 3, spread: 0.14, pierce: 99 },
    { name: 'User Interview', kind: 'userInterview', blurb: 'Exposes every enemy: slower and hit harder' },
    'Reliable shots, great at setting up teammates', 'Modest raw damage'),
  sam: hero('sam', 'Sam', 'Product Manager', 'PROCESS', "Let's take that offline.", 1,
    { hp: 125, speed: 255 }, { kind: 'energy', name: 'Energy Drink' },
    { kind: 'note', cooldown: 0.46, damage: 13, speed: 720, pierce: 1, radius: 17, count: 1, spread: 0 },
    { count: 3, spread: 0.26, pierce: 3 },
    { name: 'Scope Cut', kind: 'scopeCut', blurb: 'Deletes the nearest problems for good' },
    'Sticky notes slow whatever they hit', 'Shorter range'),
  priya: hero('priya', 'Priya', 'Scrum Master', 'PROCESS', 'Quick sync? Five minutes.', 3,
    { hp: 120, speed: 262 }, { kind: 'greentea', name: 'Green Tea' },
    { kind: 'note', cooldown: 0.44, damage: 8, speed: 740, pierce: 1, radius: 15, count: 2, spread: 0.18 },
    { count: 4, spread: 0.2, pierce: 2 },
    { name: 'Sprint Reset', kind: 'sprintReset', blurb: 'Freezes time and patches up the team' },
    'Twin notes and a team-saving power', 'Needs allies to shine'),
  marcus: hero('marcus', 'Marcus', 'Engineering Manager', 'PROCESS', "I'll take that to leadership.", 5,
    { hp: 142, speed: 245 }, { kind: 'protein', name: 'Protein Shake' },
    { kind: 'bolt', cooldown: 0.55, damage: 17, speed: 560, pierce: 2, radius: 24, count: 1, spread: 0 },
    { count: 3, spread: 0.3, pierce: 5 },
    { name: 'Air Cover', kind: 'airCover', blurb: 'A shield nobody can break, and nobody can touch' },
    'Biggest health pool, protects the team', 'Slow and steady'),
  jo: hero('jo', 'Jo', 'QA Engineer', 'TEST', 'Found it. Again.', 1,
    { hp: 115, speed: 272 }, { kind: 'chai', name: 'Masala Chai' },
    { kind: 'ping', cooldown: 0.17, damage: 6, speed: 1000, pierce: 1, radius: 11, count: 1, spread: 0 },
    { count: 3, spread: 0.12, pierce: 2 },
    { name: 'Edge Case', kind: 'edgeCase', blurb: 'A swarm of homing bug-bombs' },
    'Rapid fire that never stops', 'Each hit is small'),
  lena: hero('lena', 'Lena', 'SDET', 'TEST', 'I automated your job. Sorry.', 3,
    { hp: 112, speed: 270 }, { kind: 'seltzer', name: 'Seltzer' },
    { kind: 'ping', cooldown: 0.3, damage: 5, speed: 960, pierce: 1, radius: 11, count: 2, spread: 0.16 },
    { count: 5, spread: 0.14, pierce: 2 },
    { name: 'Chaos Monkey', kind: 'chaosMonkey', blurb: 'Lightning strikes land all over the room' },
    'Double shots, bolts from the blue', 'Strikes are random'),
  omar: hero('omar', 'Omar', 'Security Engineer', 'TEST', "That's a vulnerability.", 5,
    { hp: 118, speed: 266 }, { kind: 'espresso', name: 'Espresso' },
    { kind: 'dart', cooldown: 0.3, damage: 7, speed: 1000, pierce: 3, radius: 11, count: 1, spread: 0 },
    { count: 3, spread: 0.12, pierce: 99 },
    { name: 'Pen Test', kind: 'penTest', blurb: 'Spinning blades orbit you and shred anything close' },
    'Piercing darts, great close defence', 'Power needs enemies nearby'),
};
export const ROSTER = Object.keys(HEROES);
export const STARTERS = ROSTER.filter(id => HEROES[id].unlock <= 1);

export const DRIS = [
  { id: 'rhea', sprite: 'dri_rhea', name: 'Rhea', title: 'Incident Commander', quote: 'I own this.' },
  { id: 'ben', sprite: 'dri_ben', name: 'Ben', title: 'Staff Engineer', quote: 'On it.' },
  { id: 'yuki', sprite: 'dri_yuki', name: 'Yuki', title: 'Ops Lead', quote: 'Page me.' },
];
export const DRI_RULES = { seconds: 18, cooldown: 0.19, damage: 13, speed: 880, stompEvery: 2.6, stompRadius: 200, stompDamage: 34, move: 330 };

export const PING_SPRITES = { CODE: 'e3_code', DESIGN: 'e3_design', PROCESS: 'e3_process', TEST: 'e3_test' };

const walker = (name, sprite, tag, hp, speed, touch, icon, extra = {}) => ({
  name, cls: 'walker', sprite, scale: 0.62, segs: [[tag, hp]], speed, touch, radius: 30, score: 10, drop: 0.09, icon, ...extra,
});
const elite = (name, sprite, segs, speed, touch, icon, abilities, extra = {}) => ({
  name, cls: 'walker', elite: true, sprite, scale: 1.0, segs, speed, touch, radius: 54, score: 70, drop: 0.7, icon, abilities, ...extra,
});

export const ENEMIES = {
  bug: walker('Bug', 'e1_code', 'CODE', 26, 125, 10, 'bug'),
  nullptr: walker('Null Pointer', 'e2_code', 'CODE', 30, 115, 11, 'nullptr', { score: 12 }),
  glitch: walker('Glitch', 'e1_design', 'DESIGN', 26, 132, 10, 'glitch'),
  kerning: walker('Kerning Crime', 'e2_design', 'DESIGN', 30, 118, 11, 'kerning', { score: 12 }),
  creep: walker('Scope Creep', 'e2_process', 'PROCESS', 34, 108, 12, 'creep', { score: 14, drop: 0.1 }),
  invite: walker('Meeting Invite', 'e1_process', 'PROCESS', 28, 126, 11, 'invite', { score: 12 }),
  flaky: walker('Flaky Test', 'e2_test', 'TEST', 30, 112, 12, 'flaky', { score: 14, drop: 0.1, abilities: ['dash'] }),
  e404: walker('404', 'e1_test', 'TEST', 26, 130, 10, 'e404'),
  ping: { name: 'Slack Ping', cls: 'flyer', sprite: null, scale: 0.55, segs: null, hp: 16, speed: 218, touch: 8, radius: 28, score: 12, drop: 0.08, icon: 'ping' },
  spaghetti: elite('Spaghetti Code', 'e4_code', [['CODE', 170]], 74, 17, 'spaghetti', ['shoot']),
  pop: elite('Make It Pop', 'e4_design', [['DESIGN', 170]], 74, 17, 'pop', ['shoot']),
  standup: elite('Endless Standup', 'e4_process', [['PROCESS', 190]], 69, 17, 'standup', ['slam']),
  regress: elite('Regression', 'e4_test', [['TEST', 170]], 78, 17, 'regress', ['dash']),
  checkout: elite('Confusing Checkout', 'e4_code', [['CODE', 120], ['DESIGN', 120]], 67, 20, 'checkout', ['slam', 'shoot'], { scale: 1.1, radius: 58, score: 120, drop: 1 }),
  reorg: elite('The Reorg', 'e4_process', [['PROCESS', 120], ['TEST', 120]], 67, 20, 'reorg', ['slam', 'shoot'], { scale: 1.1, radius: 58, score: 120, drop: 1 }),
  demoday: elite('Demo Day', 'e4_boss', [['CODE', 260], ['DESIGN', 260], ['PROCESS', 260], ['TEST', 260]], 54, 27, 'demoday', ['bossSlam', 'ring', 'summon'], { boss: true, scale: 1.5, radius: 78, score: 1000, drop: 1 }),
};

const flyer = (name, icon = 'ping') => ({ name, cls: 'flyer', sprite: null, scale: 0.55, segs: null, hp: 16, speed: 218, touch: 8, radius: 28, score: 12, drop: 0.08, icon });
const mid = (name, sprite, segs, icon) => elite(name, sprite, segs, 67, 20, icon, ['slam', 'shoot'], { scale: 1.1, radius: 58, score: 120, drop: 1 });
const boss = (name, icon) => elite(name, 'e4_boss', [['CODE', 260], ['DESIGN', 260], ['PROCESS', 260], ['TEST', 260]], 54, 27, icon, ['bossSlam', 'ring', 'summon'], { boss: true, scale: 1.5, radius: 78, score: 1000, drop: 1 });

Object.assign(ENEMIES, {
  sunbug: walker('Sunburnt Bug', 'e1_code', 'CODE', 26, 125, 10, 'sun'),
  ooo: walker('Auto-Reply', 'e2_code', 'CODE', 30, 115, 11, 'plane', { score: 12 }),
  filter: walker('Beach Filter', 'e1_design', 'DESIGN', 26, 132, 10, 'shades'),
  tides: walker('Tidal Kerning', 'e2_design', 'DESIGN', 30, 118, 11, 'wave', { score: 12 }),
  itin: walker('Itinerary Creep', 'e2_process', 'PROCESS', 34, 108, 12, 'map', { score: 14, drop: 0.1 }),
  rota: walker('Pool Rota', 'e1_process', 'PROCESS', 28, 126, 11, 'palm', { score: 12 }),
  screen: walker('Flaky Sunscreen', 'e2_test', 'TEST', 30, 112, 12, 'drop', { score: 14, drop: 0.1, abilities: ['dash'] }),
  deadzone: walker('Dead Zone', 'e1_test', 'TEST', 26, 130, 10, 'wifi'),
  mozzie: flyer('Mosquito Ping'),
  deckchair: elite('Tangled Deckchair', 'e4_code', [['CODE', 170]], 74, 17, 'deckchair', ['shoot']),
  selfie: elite('Over-Edited Selfie', 'e4_design', [['DESIGN', 170]], 74, 17, 'camera', ['shoot']),
  potluck: elite('Potluck Planning', 'e4_process', [['PROCESS', 190]], 69, 17, 'pot', ['slam']),
  relapse: elite('Sunburn Relapse', 'e4_test', [['TEST', 170]], 78, 17, 'sun', ['dash']),
  booking: mid('Double Booking', 'e4_code', [['CODE', 120], ['PROCESS', 120]], 'bed'),
  cancelled: mid('Trip Cancelled', 'e4_design', [['DESIGN', 120], ['TEST', 120]], 'plane'),
  monday: boss('Monday Morning', 'alarm'),

  stack: walker('Stack Overflow', 'e1_code', 'CODE', 28, 126, 11, 'layers'),
  merge: walker('Merge Conflict', 'e2_code', 'CODE', 32, 116, 12, 'fork', { score: 13 }),
  mood: walker('Mood Board', 'e1_design', 'DESIGN', 28, 132, 11, 'grid'),
  icebreak: walker('Ice Breaker', 'e2_design', 'DESIGN', 32, 118, 12, 'snow', { score: 13 }),
  fall: walker('Trust Fall', 'e2_process', 'PROCESS', 36, 108, 12, 'fall', { score: 15, drop: 0.1 }),
  breakout: walker('Breakout Room', 'e1_process', 'PROCESS', 30, 128, 12, 'door', { score: 13 }),
  campfire: walker('Flaky Campfire', 'e2_test', 'TEST', 32, 114, 12, 'flame', { score: 15, drop: 0.1, abilities: ['dash'] }),
  wrongturn: walker('Wrong Turn', 'e1_test', 'TEST', 28, 132, 11, 'compass'),
  moth: flyer('Moth Ping'),
  ropes: elite('Ropes Course', 'e4_code', [['CODE', 180]], 74, 17, 'rope', ['shoot']),
  slogan: elite('Team Slogan', 'e4_design', [['DESIGN', 180]], 74, 17, 'megaphone', ['shoot']),
  retro: elite('Endless Retro', 'e4_process', [['PROCESS', 200]], 69, 17, 'loop', ['slam']),
  bear: elite('Regression Bear', 'e4_test', [['TEST', 180]], 80, 17, 'paw', ['dash']),
  keynote: mid('Fireside Keynote', 'e4_design', [['DESIGN', 130], ['PROCESS', 130]], 'megaphone'),
  hackathon: mid('Hackathon', 'e4_code', [['CODE', 130], ['TEST', 130]], 'layers'),
  review: boss('Annual Review', 'chart'),
});

const RAW_WAVES = [
  { name: 'Standup', spawn: { bug: 11, glitch: 10, nullptr: 4, kerning: 3 }, gap: 0.62 },
  {
    name: 'Sprint Planning', spawn: { bug: 6, glitch: 6, creep: 8, invite: 6, flaky: 6, e404: 4, nullptr: 4, ping: 8, spaghetti: 1 }, gap: 0.5,
    surge: { at: 0.5, label: 'Backlog explosion', spawn: { bug: 6, creep: 6, e404: 4, ping: 4 }, dri: false },
  },
  {
    name: 'Release Week', spawn: { bug: 6, glitch: 6, creep: 6, kerning: 5, flaky: 6, invite: 5, ping: 10, spaghetti: 2, pop: 2, standup: 1 }, gap: 0.45,
    surge: { at: 0.5, label: 'Prod is on fire', spawn: { bug: 8, glitch: 8, creep: 6, flaky: 6, ping: 6 }, dri: true },
  },
  {
    name: 'Crunch Time', spawn: { bug: 8, glitch: 7, nullptr: 6, kerning: 6, creep: 7, e404: 6, flaky: 6, ping: 12, checkout: 2, standup: 1, regress: 1, reorg: 1 }, gap: 0.4,
    surge: { at: 0.45, label: 'Everyone needs it today', spawn: { bug: 9, glitch: 9, creep: 8, flaky: 6, invite: 4, ping: 6 }, dri: true },
  },
  {
    name: 'Demo Day', spawn: { bug: 10, glitch: 10, creep: 8, flaky: 8, nullptr: 5, kerning: 5, ping: 12, pop: 1, regress: 1, demoday: 1 }, gap: 0.4,
    surge: { at: 0.3, label: 'The board walks in', spawn: { bug: 10, glitch: 10, creep: 8, flaky: 8, invite: 4 }, dri: true },
  },
];

const scaleSpawn = (spawn, k) => Object.fromEntries(Object.entries(spawn).map(([key, n]) => [key, ENEMIES[key].elite ? n : Math.round(n * k)]));

export function scaleWaves(raw, pressure) {
  return raw.map((w, i) => ({
    ...w,
    spawn: scaleSpawn(w.spawn, pressure[i]),
    surge: w.surge && { ...w.surge, spawn: scaleSpawn(w.surge.spawn, 1 + (pressure[i] - 1) * 1.25) },
  }));
}

export const WAVES = scaleWaves(RAW_WAVES, [1, 1, 1.2, 1.28, 1.34]);

export const DEFAULT_MODS = {
  cooldownMul: 1, pipRateMul: 1, hpBonus: 0, fuelDropMul: 1, overdriveBonus: 0,
  powerMul: 1, speedMul: 1, chain: false, benchRegen: 6,
};

export const UPGRADES = [
  { id: 'rapid', name: 'Double Tap', desc: 'Everyone attacks 25% faster', apply: m => ({ ...m, cooldownMul: m.cooldownMul * 0.75 }) },
  { id: 'charger', name: 'Pip Charger', desc: 'Power meter fills 35% faster', apply: m => ({ ...m, pipRateMul: m.pipRateMul * 1.35 }) },
  { id: 'skin', name: 'Thick Skin', desc: '+30 max health and a full heal', apply: m => ({ ...m, hpBonus: m.hpBonus + 30 }) },
  { id: 'fuel', name: 'Fuel Rush', desc: 'More drinks drop, and Overdrive lasts 3s longer', apply: m => ({ ...m, fuelDropMul: m.fuelDropMul * 1.8, overdriveBonus: m.overdriveBonus + 3 }) },
  { id: 'surge', name: 'Power Surge', desc: 'Powers hit 40% harder', apply: m => ({ ...m, powerMul: m.powerMul * 1.4 }) },
  { id: 'feet', name: 'Quick Feet', desc: 'Everyone moves 15% faster', apply: m => ({ ...m, speedMul: m.speedMul * 1.15 }) },
  { id: 'chain', name: 'Chain Reaction', desc: 'Defeated enemies explode and hurt their neighbours', apply: m => ({ ...m, chain: true }) },
  { id: 'bench', name: 'Coffee Break', desc: 'Benched heroes heal three times faster', apply: m => ({ ...m, benchRegen: m.benchRegen * 3 }) },
];
