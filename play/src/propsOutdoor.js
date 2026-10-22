import { mk, oval, paint, rr, shade } from './props.js';

const OUT = '#2e4a3a';
const P = (c, fill, lw = 3) => paint(c, fill, lw, OUT);
const TAU = Math.PI * 2;

function tree(leaf, leaf2, trunk = '#9b7653') {
  return mk(230, 310, c => {
    shade(c, 115, 296, 70, 9);
    rr(c, 98, 170, 34, 128, 8); P(c, trunk);
    oval(c, 115, 112, 96, 92, leaf); oval(c, 66, 136, 56, 50, leaf2); oval(c, 166, 138, 54, 48, leaf2);
    oval(c, 112, 70, 62, 52, leaf2, 2.5);
    c.fillStyle = 'rgba(255,255,255,0.22)'; c.beginPath(); c.ellipse(86, 66, 30, 14, -0.4, 0, TAU); c.fill();
  });
}

function pine(top, bottom) {
  return mk(150, 330, c => {
    shade(c, 75, 318, 44, 7);
    rr(c, 64, 250, 22, 66, 5); P(c, '#8a6a4b');
    [[250, 66], [196, 56], [142, 46], [92, 36]].forEach(([y, w], i) => {
      c.beginPath(); c.moveTo(75, y - 90 + i * 8); c.lineTo(75 + w + 10, y); c.lineTo(75 - w - 10, y); c.closePath(); P(c, i % 2 ? top : bottom);
    });
  });
}

function bush(col) {
  return mk(120, 84, c => {
    shade(c, 60, 76, 46, 5);
    oval(c, 34, 50, 30, 26, col); oval(c, 86, 50, 30, 26, col); oval(c, 60, 36, 38, 30, col);
    [[40, 40], [74, 30], [88, 52]].forEach(([x, y]) => { c.beginPath(); c.arc(x, y, 4, 0, TAU); c.fillStyle = '#ff8fb1'; c.fill(); });
  });
}

function flowers() {
  return mk(110, 60, c => {
    [[20, 40, '#ff8fb1'], [46, 28, '#ffd23f'], [72, 42, '#ffffff'], [94, 30, '#b28dff'], [58, 50, '#ff8fb1']].forEach(([x, y, col]) => {
      c.strokeStyle = '#3d8a54'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y); c.lineTo(x, 58); c.stroke();
      c.beginPath(); c.arc(x, y, 9, 0, TAU); P(c, col, 2.5); c.beginPath(); c.arc(x, y, 3.2, 0, TAU); c.fillStyle = '#ffb627'; c.fill();
    });
  });
}

function parasol(col) {
  return mk(190, 240, c => {
    shade(c, 95, 226, 40, 6);
    c.strokeStyle = OUT; c.lineWidth = 9; c.beginPath(); c.moveTo(95, 40); c.lineTo(95, 226); c.stroke();
    c.strokeStyle = '#f1ece0'; c.lineWidth = 4.5; c.beginPath(); c.moveTo(95, 40); c.lineTo(95, 226); c.stroke();
    c.beginPath(); c.moveTo(8, 96); c.quadraticCurveTo(95, -50, 182, 96); c.quadraticCurveTo(138, 76, 95, 96); c.quadraticCurveTo(52, 76, 8, 96); c.closePath(); P(c, col);
    c.save(); c.clip(); c.fillStyle = 'rgba(255,255,255,0.8)';
    [[50, 0], [95, 0], [140, 0]].forEach(([x]) => { c.beginPath(); c.moveTo(95, 20); c.lineTo(x - 30, 100); c.lineTo(x + 5, 100); c.closePath(); c.fill(); });
    c.restore();
  });
}

function lounger(col) {
  return mk(150, 110, c => {
    shade(c, 75, 100, 62, 6);
    rr(c, 20, 78, 10, 22, 3); P(c, '#d9d4c8'); rr(c, 118, 78, 10, 22, 3); P(c, '#d9d4c8');
    c.beginPath(); c.moveTo(12, 70); c.lineTo(112, 70); c.lineTo(138, 84); c.lineTo(12, 84); c.closePath(); P(c, col);
    c.beginPath(); c.moveTo(14, 70); c.lineTo(36, 14); c.lineTo(62, 22); c.lineTo(44, 70); c.closePath(); P(c, col);
    c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = 4;
    [26, 52, 78, 104].forEach(x => { c.beginPath(); c.moveTo(x, 72); c.lineTo(x + 6, 82); c.stroke(); });
  });
}

function picnic() {
  return mk(250, 150, c => {
    shade(c, 125, 140, 108, 7);
    rr(c, 28, 100, 194, 12, 5); P(c, '#a7835c'); rr(c, 28, 14, 194, 12, 5); P(c, '#a7835c');
    rr(c, 40, 24, 14, 80, 3); P(c, '#8d6c48'); rr(c, 196, 24, 14, 80, 3); P(c, '#8d6c48');
    rr(c, 16, 44, 218, 38, 8); P(c, '#d9b98a');
    c.save(); rr(c, 16, 44, 218, 38, 8); c.clip();
    for (let x = 0; x < 218; x += 26) for (let y = 0; y < 38; y += 19) { if (((x / 26) + (y / 19)) % 2 === 0) { c.fillStyle = 'rgba(224,70,80,0.75)'; c.fillRect(16 + x, 44 + y, 26, 19); } }
    c.restore();
    oval(c, 100, 60, 14, 6, '#fff', 2); oval(c, 150, 62, 14, 6, '#fff', 2);
  });
}

function bbq() {
  return mk(120, 170, c => {
    shade(c, 60, 160, 40, 6);
    c.strokeStyle = OUT; c.lineWidth = 5; [[34, 100, 26, 156], [86, 100, 94, 156]].forEach(([a, b, d, e]) => { c.beginPath(); c.moveTo(a, b); c.lineTo(d, e); c.stroke(); });
    c.beginPath(); c.arc(60, 84, 48, Math.PI, TAU); c.closePath(); P(c, '#5b6177');
    rr(c, 10, 82, 100, 20, 8); P(c, '#454b5f');
    rr(c, 52, 24, 16, 10, 3); P(c, '#454b5f');
    c.strokeStyle = 'rgba(255,255,255,0.75)'; c.lineWidth = 4; c.globalAlpha = 0.8;
    [[44, 20], [62, 14]].forEach(([x, y]) => { c.beginPath(); c.moveTo(x, y + 14); c.bezierCurveTo(x - 8, y + 6, x + 8, y, x, y - 8); c.stroke(); });
    c.globalAlpha = 1;
  });
}

function coolbox() {
  return mk(120, 90, c => {
    shade(c, 60, 82, 48, 5);
    rr(c, 10, 26, 100, 56, 9); P(c, '#4aa3df'); rr(c, 6, 14, 108, 24, 9); P(c, '#f3f6fb');
    rr(c, 44, 8, 32, 10, 5); P(c, '#d7e0ee', 2.5); rr(c, 22, 48, 76, 8, 4); c.fillStyle = 'rgba(255,255,255,0.6)'; c.fill();
  });
}

function pool() {
  return mk(560, 250, c => {
    c.beginPath(); c.ellipse(280, 128, 262, 108, 0, 0, TAU); P(c, '#f3f1e8', 5);
    c.beginPath(); c.ellipse(280, 128, 240, 90, 0, 0, TAU); P(c, '#58c7ec', 3);
    c.fillStyle = 'rgba(255,255,255,0.4)';
    [[150, 100, 90], [330, 150, 120], [400, 96, 60]].forEach(([x, y, w]) => { c.beginPath(); c.ellipse(x, y, w / 2, 5, 0, 0, TAU); c.fill(); });
    c.beginPath(); c.ellipse(280, 128, 240, 90, 0, Math.PI * 1.05, Math.PI * 1.45); c.strokeStyle = 'rgba(255,255,255,0.8)'; c.lineWidth = 6; c.stroke();
    oval(c, 190, 120, 28, 14, '#ff7a8a', 3); oval(c, 190, 120, 12, 5, '#58c7ec', 2);
  });
}

function bench() {
  return mk(150, 100, c => {
    shade(c, 75, 92, 62, 5);
    rr(c, 14, 70, 10, 24, 3); P(c, '#6f7685'); rr(c, 126, 70, 10, 24, 3); P(c, '#6f7685');
    rr(c, 8, 54, 134, 16, 5); P(c, '#b78d62'); rr(c, 10, 14, 130, 14, 5); P(c, '#b78d62'); rr(c, 10, 32, 130, 14, 5); P(c, '#b78d62');
  });
}

function lamp() {
  return mk(60, 190, c => {
    shade(c, 30, 180, 20, 4);
    rr(c, 26, 40, 8, 140, 3); P(c, '#59627a'); rr(c, 14, 8, 32, 40, 10); P(c, '#fff0b0');
    c.fillStyle = 'rgba(255,240,170,0.35)'; c.beginPath(); c.arc(30, 28, 30, 0, TAU); c.fill();
  });
}

function tent(col) {
  return mk(240, 190, c => {
    shade(c, 120, 178, 100, 7);
    c.beginPath(); c.moveTo(120, 10); c.lineTo(228, 172); c.lineTo(12, 172); c.closePath(); P(c, col, 3.5);
    c.beginPath(); c.moveTo(120, 10); c.lineTo(150, 172); c.lineTo(90, 172); c.closePath(); P(c, '#2c3350', 3);
    c.strokeStyle = 'rgba(255,255,255,0.35)'; c.lineWidth = 4; c.beginPath(); c.moveTo(60, 100); c.lineTo(112, 28); c.stroke();
    c.beginPath(); c.moveTo(120, 10); c.lineTo(120, -2); c.stroke();
  });
}

function campfire() {
  return mk(170, 170, c => {
    shade(c, 85, 150, 60, 7);
    c.fillStyle = 'rgba(255,170,60,0.28)'; c.beginPath(); c.arc(85, 96, 80, 0, TAU); c.fill();
    c.fillStyle = 'rgba(255,200,80,0.28)'; c.beginPath(); c.arc(85, 96, 52, 0, TAU); c.fill();
    [[-24, 12], [24, 12], [0, 22]].forEach(([dx, dy], i) => { c.save(); c.translate(85 + dx, 128 + dy * 0.3); c.rotate(i === 2 ? 0 : (i ? -0.5 : 0.5)); rr(c, -34, -8, 68, 16, 7); P(c, '#8d6a47'); c.restore(); });
    c.beginPath(); c.moveTo(85, 30); c.bezierCurveTo(100, 62, 134, 84, 122, 120); c.bezierCurveTo(110, 150, 60, 150, 48, 120); c.bezierCurveTo(40, 94, 70, 84, 70, 56); c.bezierCurveTo(78, 60, 82, 44, 85, 30); P(c, '#ff8a3d', 3.5);
    c.beginPath(); c.moveTo(85, 70); c.bezierCurveTo(96, 92, 112, 104, 106, 124); c.bezierCurveTo(98, 140, 72, 140, 66, 124); c.bezierCurveTo(62, 106, 82, 100, 85, 70); c.fillStyle = '#ffd23f'; c.fill();
  });
}

function log() {
  return mk(130, 64, c => {
    shade(c, 65, 58, 52, 4);
    rr(c, 8, 18, 114, 36, 16); P(c, '#a07a52'); oval(c, 112, 36, 10, 16, '#d9b98a', 2.5);
    c.strokeStyle = 'rgba(46,74,58,0.5)'; c.lineWidth = 2.5; [[26, 26, 84, 26], [34, 38, 96, 38]].forEach(([a, b, d, e]) => { c.beginPath(); c.moveTo(a, b); c.lineTo(d, e); c.stroke(); });
  });
}

function rock() {
  return mk(110, 74, c => {
    shade(c, 55, 68, 44, 5);
    c.beginPath(); c.moveTo(8, 62); c.bezierCurveTo(0, 30, 24, 8, 52, 8); c.bezierCurveTo(86, 8, 108, 34, 102, 62); c.closePath(); P(c, '#a3aab6');
    c.fillStyle = 'rgba(255,255,255,0.3)'; c.beginPath(); c.ellipse(40, 24, 18, 6, -0.3, 0, TAU); c.fill();
  });
}

export function buildParkProps() {
  return {
    tree: tree('#4fbf6d', '#66d283'), treeB: tree('#43b377', '#5cc98e'), bush: bush('#46b06a'), flowers: flowers(),
    parasolA: parasol('#ff6b81'), parasolB: parasol('#3aa0ff'), lounger: lounger('#ffb627'), loungerB: lounger('#ff6b81'),
    picnic: picnic(), bbq: bbq(), coolbox: coolbox(), pool: pool(), bench: bench(), lamp: lamp(),
  };
}

export function buildCampProps() {
  return {
    pine: pine('#2f7a5a', '#276a4c'), pineB: pine('#3a8a67', '#2f7a5a'), bush: bush('#3f9a5e'), tent: tent('#ff7a59'), tentB: tent('#5d8bff'),
    campfire: campfire(), log: log(), rock: rock(), coolbox: coolbox(), lamp: lamp(), flowers: flowers(),
  };
}
