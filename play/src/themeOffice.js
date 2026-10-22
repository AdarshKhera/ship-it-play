import { WORLD } from './config.js';
import { buildProps } from './props.js';

const EDGE = '#434b60';

const PLACEMENTS = [
  ['desk', 950, 640, [96, 62]], ['desk', 1600, 640, [96, 62]], ['desk', 2250, 640, [96, 62]],
  ['chair', 950, 750, null], ['chair', 1600, 750, null], ['chair', 2250, 750, null],
  ['bookshelf', 470, 480, [66, 44]], ['kitchen', 2800, 480, [108, 50]], ['cooler', 2500, 480, [30, 36]],
  ['sofa', 480, 1300, [112, 60]], ['plantA', 250, 1080, [24, 30]],
  ['table', 1600, 1320, [144, 68]],
  ['desk', 2480, 1700, [96, 62]], ['crates', 2950, 1500, [46, 50]],
  ['desk', 940, 1760, [96, 62]],
  ['plantB', 260, 470, [24, 30]], ['plantA', 3000, 880, [24, 30]], ['plantB', 250, 1860, [24, 30]], ['plantA', 2990, 1860, [24, 30]],
];

const RUGS = [
  { x: 1600, y: 690, w: 1900, h: 300, fill: 'rgba(188,205,224,0.55)' },
  { x: 1600, y: 1310, w: 780, h: 440, fill: 'rgba(224,206,170,0.55)', round: true },
  { x: 480, y: 1290, w: 580, h: 330, fill: 'rgba(188,212,196,0.55)' },
];

function floorTile() {
  const t = document.createElement('canvas');
  t.width = 800; t.height = 800;
  const c = t.getContext('2d');
  for (let y = 0; y < 2; y++) {
    for (let x = 0; x < 2; x++) {
      c.fillStyle = (x + y) % 2 ? '#ebe6dc' : '#efebe3';
      c.fillRect(x * 400, y * 400, 400, 400);
    }
  }
  c.strokeStyle = '#ddd7ca'; c.lineWidth = 8;
  for (let i = 0; i <= 2; i++) { c.beginPath(); c.moveTo(i * 400, 0); c.lineTo(i * 400, 800); c.stroke(); c.beginPath(); c.moveTo(0, i * 400); c.lineTo(800, i * 400); c.stroke(); }
  c.fillStyle = 'rgba(120,105,80,0.06)';
  for (let i = 0; i < 120; i++) c.fillRect(Math.random() * 800, Math.random() * 800, 3 + Math.random() * 4, 3);
  return t;
}

function rrPath(c, x, y, w, h, r) {
  c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}

function paint(c, fill, lw = 4) { c.fillStyle = fill; c.fill(); c.lineWidth = lw; c.strokeStyle = EDGE; c.stroke(); }

function drawWindow(c, cx) {
  const x = cx - 120, y = 54, w = 240, h = 140;
  rrPath(c, x - 8, y - 8, w + 16, h + 16, 10); paint(c, '#e3e7f0', 4);
  const g = c.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, '#bcd8ef'); g.addColorStop(1, '#e8f3fb');
  c.save(); rrPath(c, x, y, w, h, 6); c.clip();
  c.fillStyle = g; c.fillRect(x, y, w, h);
  [[0, 56, 44, '#a9c3dc'], [38, 40, 50, '#9db8d3'], [84, 66, 38, '#a9c3dc'], [118, 34, 54, '#9db8d3'], [166, 60, 40, '#a9c3dc'], [202, 44, 44, '#9db8d3']].forEach(([dx, top, bw, col]) => {
    c.fillStyle = col; c.fillRect(x + dx, y + h - top - 10, bw, top + 10);
  });
  c.restore();
  c.strokeStyle = EDGE; c.lineWidth = 5; c.beginPath(); c.moveTo(x + w / 2, y); c.lineTo(x + w / 2, y + h); c.moveTo(x, y + h / 2); c.lineTo(x + w, y + h / 2); c.stroke();
  rrPath(c, x - 14, y + h + 6, w + 28, 14, 5); paint(c, '#eef0f6', 3.5);
}

function drawBoard(c, cx) {
  const x = cx - 130, y = 52, w = 260, h = 140;
  rrPath(c, x, y, w, h, 8); paint(c, '#f7f8fb', 4);
  c.lineCap = 'round'; c.lineWidth = 4;
  [['#9bb4d3', 18, 30, 120], ['#d6a3b9', 18, 54, 90], ['#e0c48a', 18, 78, 140], ['#a1cfb2', 18, 102, 70]].forEach(([col, dx, dy, l]) => { c.strokeStyle = col; c.beginPath(); c.moveTo(x + dx, y + dy); c.lineTo(x + dx + l, y + dy); c.stroke(); });
  rrPath(c, x + 20, y + h + 2, w - 40, 12, 4); paint(c, '#cfd5e3', 3);
}

function drawClock(c, cx, cy) {
  c.beginPath(); c.arc(cx, cy, 34, 0, 6.283); paint(c, '#f7f8fb', 4);
  c.strokeStyle = EDGE; c.lineWidth = 4; c.lineCap = 'round';
  c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx, cy - 20); c.moveTo(cx, cy); c.lineTo(cx + 14, cy + 6); c.stroke();
}

function paintWall(c, h) {
  c.fillStyle = '#5b678a'; c.fillRect(0, 0, WORLD.w, WORLD.top - 8);
  c.fillStyle = '#556184';
  for (let x = 0; x < WORLD.w; x += 140) c.fillRect(x, 0, 70, WORLD.top - 8);
  c.fillStyle = '#4a5677'; c.fillRect(0, 214, WORLD.w, WORLD.top - 222);
  c.fillStyle = EDGE; c.fillRect(0, 211, WORLD.w, 4);
  c.fillStyle = '#3b4562'; c.fillRect(0, WORLD.top - 14, WORLD.w, 14);
  c.fillStyle = EDGE; c.fillRect(0, WORLD.top - 2, WORLD.w, 5);
  [380, 1030, 1680, 2330, 2870].forEach(x => drawWindow(c, x));
  [705, 2600].forEach(x => drawBoard(c, x));
  drawClock(c, 1355, 112);
  const g = c.createLinearGradient(0, WORLD.top + 4, 0, h);
  g.addColorStop(0, 'rgba(40,40,70,0.2)'); g.addColorStop(1, 'rgba(40,40,70,0)');
  c.fillStyle = g; c.fillRect(0, WORLD.top + 4, WORLD.w, h - WORLD.top - 4);
}

export const officeTheme = {
  placements: PLACEMENTS, rugs: RUGS, floorTile, paintWall, buildSprites: buildProps, frame: { fill: '#3e4968', edge: EDGE },
};
