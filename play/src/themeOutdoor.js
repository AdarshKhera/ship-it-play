import { WORLD } from './config.js';
import { buildCampProps, buildParkProps } from './propsOutdoor.js';

const TAU = Math.PI * 2;

function noiseTile(a, b, speck, count, seed) {
  const t = document.createElement('canvas');
  t.width = 800; t.height = 800;
  const c = t.getContext('2d');
  for (let y = 0; y < 4; y++) { c.fillStyle = y % 2 ? a : b; c.fillRect(0, y * 200, 800, 200); }
  c.fillStyle = speck;
  let s = seed;
  const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  for (let i = 0; i < count; i++) { c.beginPath(); c.ellipse(rnd() * 800, rnd() * 800, 2 + rnd() * 5, 1.5 + rnd() * 2, 0, 0, TAU); c.fill(); }
  return t;
}

function hill(c, y, amp, color, phase) {
  c.fillStyle = color;
  c.beginPath(); c.moveTo(0, y + 120);
  for (let x = 0; x <= WORLD.w; x += 40) c.lineTo(x, y - Math.sin(x / 260 + phase) * amp - Math.sin(x / 97 + phase * 2) * amp * 0.3);
  c.lineTo(WORLD.w, y + 120); c.closePath(); c.fill();
}

function shadowBand(c, h) {
  const g = c.createLinearGradient(0, WORLD.top + 4, 0, h);
  g.addColorStop(0, 'rgba(20,40,30,0.25)'); g.addColorStop(1, 'rgba(20,40,30,0)');
  c.fillStyle = g; c.fillRect(0, WORLD.top + 4, WORLD.w, h - WORLD.top - 4);
}

function paintParkWall(c, h) {
  const g = c.createLinearGradient(0, 0, 0, WORLD.top);
  g.addColorStop(0, '#6fcbff'); g.addColorStop(1, '#d8f1ff');
  c.fillStyle = g; c.fillRect(0, 0, WORLD.w, WORLD.top);
  const sun = c.createRadialGradient(2650, 110, 10, 2650, 110, 200);
  sun.addColorStop(0, 'rgba(255,246,170,0.95)'); sun.addColorStop(0.25, 'rgba(255,240,150,0.5)'); sun.addColorStop(1, 'rgba(255,240,150,0)');
  c.fillStyle = sun; c.fillRect(2400, 0, 500, 320);
  c.fillStyle = '#fff7b8'; c.beginPath(); c.arc(2650, 110, 54, 0, TAU); c.fill();
  c.fillStyle = 'rgba(255,255,255,0.9)';
  [[420, 90, 1], [980, 140, 0.8], [1560, 70, 1.2], [2060, 150, 0.9], [3000, 60, 0.7]].forEach(([x, y, k]) => {
    [[0, 0, 70], [60, -14, 56], [-62, 8, 50], [120, 10, 44]].forEach(([dx, dy, r]) => { c.beginPath(); c.arc(x + dx * k, y + dy * k, r * k * 0.5, 0, TAU); c.fill(); });
  });
  hill(c, 230, 26, '#a5e0b4', 0.4); hill(c, 262, 20, '#7ccf93', 2.1);
  for (let x = 40; x < WORLD.w; x += 96) { const r = 30 + ((x * 7) % 14); c.fillStyle = (x / 96) % 2 ? '#45b06c' : '#3a9f61'; c.beginPath(); c.arc(x, WORLD.top - 22, r, 0, TAU); c.fill(); }
  c.fillStyle = '#2f7a4a'; c.fillRect(0, WORLD.top - 26, WORLD.w, 26);
  c.fillStyle = '#1f5a38'; c.fillRect(0, WORLD.top - 3, WORLD.w, 5);
  shadowBand(c, h);
}

function paintCampWall(c, h) {
  const g = c.createLinearGradient(0, 0, 0, WORLD.top);
  g.addColorStop(0, '#171b45'); g.addColorStop(0.6, '#5b3f86'); g.addColorStop(1, '#f08a6b');
  c.fillStyle = g; c.fillRect(0, 0, WORLD.w, WORLD.top);
  c.fillStyle = 'rgba(255,255,255,0.85)';
  for (let i = 0; i < 70; i++) { const x = (i * 457) % WORLD.w; const y = (i * 131) % 190; c.beginPath(); c.arc(x, y, 1.5 + (i % 3), 0, TAU); c.fill(); }
  c.fillStyle = '#fff4cf'; c.beginPath(); c.arc(520, 100, 46, 0, TAU); c.fill();
  c.fillStyle = '#e8dcae'; c.beginPath(); c.arc(505, 90, 11, 0, TAU); c.arc(540, 118, 8, 0, TAU); c.fill();
  hill(c, 238, 22, '#3b3f78', 0.9);
  [0, 1].forEach(layer => {
    c.fillStyle = layer ? '#122a2f' : '#193a40';
    for (let x = layer ? 30 : -10; x < WORLD.w; x += 78) {
      const hgt = 70 + ((x * 13 + layer * 7) % 40);
      c.beginPath(); c.moveTo(x, WORLD.top - 8); c.lineTo(x + 30, WORLD.top - 8 - hgt); c.lineTo(x + 60, WORLD.top - 8); c.closePath(); c.fill();
    }
  });
  c.fillStyle = '#10241f'; c.fillRect(0, WORLD.top - 12, WORLD.w, 12);
  c.strokeStyle = '#0c1a17'; c.lineWidth = 3;
  [0, 1, 2, 3].forEach(seg => {
    const x0 = seg * 800;
    c.beginPath(); c.moveTo(x0, 190); c.quadraticCurveTo(x0 + 400, 270, x0 + 800, 190); c.stroke();
    for (let i = 1; i < 10; i++) {
      const u = i / 10; const x = x0 + u * 800; const y = 190 + 2 * u * (1 - u) * 160 + 4;
      const col = ['#ffd23f', '#ff8fb1', '#7ef0a4', '#8fd0ff'][(i + seg) % 4];
      c.fillStyle = 'rgba(255,230,160,0.25)'; c.beginPath(); c.arc(x, y + 8, 16, 0, TAU); c.fill();
      c.fillStyle = col; c.beginPath(); c.arc(x, y + 8, 6.5, 0, TAU); c.fill();
    }
  });
  shadowBand(c, h);
}

const PARK = [
  ['tree', 330, 520, [28, 26]], ['treeB', 900, 470, [28, 26]], ['tree', 1600, 450, [28, 26]], ['treeB', 2300, 480, [28, 26]], ['tree', 2860, 520, [28, 26]],
  ['bench', 1050, 700, [66, 22]], ['bench', 2150, 700, [66, 22]], ['lamp', 1330, 640, [10, 10]], ['lamp', 1870, 640, [10, 10]],
  ['picnic', 640, 1020, [112, 40]], ['picnic', 2560, 1020, [112, 40]],
  ['bbq', 2830, 720, [42, 28]], ['coolbox', 2700, 770, [44, 22]],
  ['parasolA', 1060, 1210, [18, 14]], ['loungerB', 1160, 1340, null], ['parasolB', 2140, 1210, [18, 14]], ['lounger', 2040, 1340, null],
  ['pool', 1600, 1360, [210, 64]],
  ['bush', 300, 1260, [44, 24]], ['flowers', 420, 1560, null], ['flowers', 2760, 1580, null], ['bush', 2900, 1280, [44, 24]],
  ['treeB', 280, 1830, [28, 26]], ['tree', 2950, 1830, [28, 26]], ['bush', 1000, 1800, [44, 24]], ['flowers', 1700, 1800, null], ['bush', 2260, 1790, [44, 24]],
  ['flowers', 520, 700, null], ['flowers', 2660, 560, null], ['lamp', 760, 1500, [10, 10]], ['lamp', 2440, 1500, [10, 10]],
];

const PARK_RUGS = [
  { x: 1600, y: 920, w: 2700, h: 150, fill: 'rgba(240,226,188,0.85)' },
  { x: 1600, y: 1180, w: 170, h: 520, fill: 'rgba(240,226,188,0.85)' },
  { x: 1600, y: 1330, w: 860, h: 380, fill: 'rgba(240,228,196,0.85)', round: true },
  { x: 420, y: 1560, w: 420, h: 220, fill: 'rgba(60,140,80,0.22)', round: true },
  { x: 2760, y: 1580, w: 420, h: 220, fill: 'rgba(60,140,80,0.22)', round: true },
];

const CAMP = [
  ['pine', 300, 560, [24, 24]], ['pineB', 760, 470, [24, 24]], ['pine', 1250, 450, [24, 24]], ['pineB', 1950, 450, [24, 24]], ['pine', 2450, 470, [24, 24]], ['pineB', 2900, 560, [24, 24]],
  ['tent', 700, 800, [100, 50]], ['tentB', 2500, 780, [100, 50]], ['tent', 2850, 1320, [100, 50]], ['tentB', 330, 1360, [100, 50]],
  ['campfire', 1600, 1330, [44, 28]], ['log', 1420, 1430, [56, 18]], ['log', 1780, 1430, [56, 18]], ['log', 1600, 1520, [56, 18]],
  ['rock', 1100, 1100, [40, 22]], ['rock', 2200, 1160, [40, 22]], ['rock', 560, 1700, [40, 22]], ['rock', 2700, 1780, [40, 22]],
  ['lamp', 1200, 880, [10, 10]], ['lamp', 2000, 880, [10, 10]], ['coolbox', 1240, 1500, [44, 22]],
  ['pine', 250, 1840, [24, 24]], ['pineB', 3000, 1840, [24, 24]], ['bush', 900, 1840, [44, 24]], ['pine', 1650, 1860, [24, 24]], ['bush', 2350, 1840, [44, 24]],
  ['flowers', 1000, 640, null], ['flowers', 2000, 640, null],
];

const CAMP_RUGS = [
  { x: 1600, y: 1320, w: 940, h: 460, fill: 'rgba(150,120,80,0.55)', round: true },
  { x: 1600, y: 800, w: 2500, h: 140, fill: 'rgba(150,120,80,0.35)' },
  { x: 700, y: 1000, w: 160, h: 520, fill: 'rgba(150,120,80,0.3)' },
  { x: 2500, y: 1000, w: 160, h: 520, fill: 'rgba(150,120,80,0.3)' },
];

export const parkTheme = {
  placements: PARK, rugs: PARK_RUGS, frame: { fill: '#2f7a4a', edge: '#1f5a38' }, buildSprites: buildParkProps, paintWall: paintParkWall,
  floorTile: () => noiseTile('#a3e08e', '#9ad884', 'rgba(60,140,70,0.18)', 90, 17),
};

export const campTheme = {
  placements: CAMP, rugs: CAMP_RUGS, frame: { fill: '#10241f', edge: '#0a1713' }, buildSprites: buildCampProps, paintWall: paintCampWall,
  floorTile: () => noiseTile('#4f8a63', '#498359', 'rgba(20,60,40,0.3)', 140, 31),
};
