import { INK } from './config.js';

const SS = 2;
const EDGE = '#434b60';

function mk(w, h, draw) {
  const canvas = document.createElement('canvas');
  canvas.width = w * SS;
  canvas.height = h * SS;
  const c = canvas.getContext('2d');
  c.scale(SS, SS);
  c.lineJoin = 'round';
  c.lineCap = 'round';
  draw(c);
  return { canvas, w, h };
}

function rr(c, x, y, w, h, r) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}

function paint(c, fill, lw = 3, edge = EDGE) {
  c.fillStyle = fill;
  c.fill();
  c.lineWidth = lw;
  c.strokeStyle = edge;
  c.stroke();
}

function oval(c, x, y, rx, ry, fill, lw = 3, edge = EDGE) {
  c.beginPath();
  c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  paint(c, fill, lw, edge);
}

function shade(c, cx, y, rx, ry) {
  c.fillStyle = 'rgba(40,44,70,0.16)';
  c.beginPath();
  c.ellipse(cx, y, rx, ry, 0, 0, Math.PI * 2);
  c.fill();
}

function gloss(c, x, y, w, h, r) {
  rr(c, x, y, w, h, r);
  c.fillStyle = 'rgba(255,255,255,0.28)';
  c.fill();
}

function desk() {
  return mk(210, 176, c => {
    shade(c, 105, 166, 98, 9);
    rr(c, 16, 104, 178, 58, 8); paint(c, '#bfa27c');
    c.strokeStyle = 'rgba(67,75,96,0.4)'; c.lineWidth = 2;
    c.beginPath(); c.moveTo(105, 110); c.lineTo(105, 156); c.stroke();
    rr(c, 40, 120, 40, 8, 4); paint(c, '#d4bb97', 2);
    rr(c, 130, 120, 40, 8, 4); paint(c, '#d4bb97', 2);
    rr(c, 8, 80, 194, 36, 10); paint(c, '#d8c3a1');
    gloss(c, 16, 85, 178, 7, 3);
    rr(c, 92, 66, 26, 18, 3); paint(c, '#7d879b', 2.5);
    rr(c, 50, 6, 110, 66, 9); paint(c, '#3f475c');
    rr(c, 57, 13, 96, 52, 5); c.fillStyle = '#a9c1d4'; c.fill();
    c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = 3;
    [[64, 24, 40], [64, 34, 62], [64, 44, 30]].forEach(([x, y, l]) => { c.beginPath(); c.moveTo(x, y); c.lineTo(x + l, y); c.stroke(); });
    rr(c, 66, 92, 78, 14, 6); paint(c, '#eef0f4', 2.5);
    rr(c, 156, 86, 18, 20, 5); paint(c, '#c9d0dc', 2.5);
  });
}

function chair() {
  return mk(76, 84, c => {
    shade(c, 38, 76, 26, 5);
    rr(c, 16, 6, 44, 38, 14); paint(c, '#7f8aa0');
    gloss(c, 22, 11, 32, 7, 3);
    oval(c, 38, 52, 26, 13, '#7f8aa0');
    rr(c, 33, 60, 10, 14, 2); paint(c, '#59627a', 2.5);
    c.beginPath(); c.moveTo(14, 77); c.lineTo(62, 77); c.lineWidth = 4; c.strokeStyle = EDGE; c.stroke();
  });
}

function plant(leaf, pot) {
  return mk(92, 150, c => {
    shade(c, 46, 140, 32, 6);
    [[-30, 40, 24, 54], [0, 22, 20, 64], [28, 42, 24, 54], [-14, 56, 20, 44], [14, 58, 20, 44]].forEach(([dx, dy, rx, ry], i) => {
      c.save(); c.translate(46 + dx, 78 + dy * 0.3); c.rotate((i - 2) * 0.28);
      c.beginPath(); c.ellipse(0, -ry * 0.5, rx * 0.5, ry * 0.6, 0, 0, Math.PI * 2); paint(c, i % 2 ? leaf : '#79ae8a', 3); c.restore();
    });
    c.beginPath(); c.moveTo(22, 94); c.lineTo(70, 94); c.lineTo(62, 138); c.lineTo(30, 138); c.closePath(); paint(c, pot);
    rr(c, 18, 88, 56, 14, 6); paint(c, pot);
    gloss(c, 24, 91, 44, 4, 2);
  });
}

function cooler() {
  return mk(76, 150, c => {
    shade(c, 38, 142, 28, 5);
    rr(c, 10, 60, 56, 82, 10); paint(c, '#e7ebf2');
    rr(c, 18, 74, 40, 26, 5); paint(c, '#c3cbdb', 2.5);
    oval(c, 30, 112, 5, 5, '#c9a0a0', 2); oval(c, 46, 112, 5, 5, '#9bb7d6', 2);
    rr(c, 14, 6, 48, 58, 18); paint(c, 'rgba(170,205,235,0.85)');
    rr(c, 20, 26, 36, 34, 8); c.fillStyle = 'rgba(120,170,215,0.6)'; c.fill();
    gloss(c, 20, 12, 7, 34, 3);
  });
}

function printer() {
  return mk(124, 100, c => {
    shade(c, 62, 92, 52, 6);
    rr(c, 8, 34, 108, 54, 12); paint(c, '#dde2ec');
    rr(c, 22, 14, 80, 28, 6); paint(c, '#f6f7fa', 2.5);
    rr(c, 24, 58, 76, 14, 5); paint(c, '#7d879b', 2.5);
    rr(c, 30, 74, 64, 8, 3); paint(c, '#f6f7fa', 2.5);
    oval(c, 98, 48, 4, 4, '#8fc6a2', 2);
    gloss(c, 14, 38, 96, 5, 2);
  });
}

function sofa() {
  return mk(260, 130, c => {
    shade(c, 130, 122, 112, 7);
    rr(c, 16, 14, 228, 70, 24); paint(c, '#8c99b6');
    rr(c, 6, 40, 44, 74, 18); paint(c, '#8c99b6');
    rr(c, 210, 40, 44, 74, 18); paint(c, '#8c99b6');
    rr(c, 42, 54, 88, 52, 14); paint(c, '#9ba7c2');
    rr(c, 130, 54, 88, 52, 14); paint(c, '#9ba7c2');
    gloss(c, 26, 20, 208, 7, 3);
    rr(c, 50, 38, 28, 28, 8); paint(c, '#d9cba0', 2.5);
  });
}

function table() {
  return mk(330, 190, c => {
    shade(c, 165, 176, 140, 10);
    rr(c, 130, 130, 20, 40, 4); paint(c, '#8b7556');
    rr(c, 180, 130, 20, 40, 4); paint(c, '#8b7556');
    c.beginPath(); c.ellipse(165, 96, 154, 66, 0, 0, Math.PI * 2); paint(c, '#bba27e');
    c.beginPath(); c.ellipse(165, 90, 144, 56, 0, 0, Math.PI * 2); paint(c, '#d6c19f', 2.5);
    gloss(c, 60, 56, 150, 6, 3);
    rr(c, 78, 66, 46, 30, 4); paint(c, '#6a7388', 2.5); rr(c, 82, 69, 38, 22, 2); c.fillStyle = '#b3c8d8'; c.fill();
    rr(c, 190, 74, 40, 22, 3); paint(c, '#f1f2f5', 2.5);
    oval(c, 130, 108, 9, 9, '#f1f2f5', 2.5); oval(c, 214, 106, 9, 9, '#f1f2f5', 2.5);
  });
}

function kitchen() {
  return mk(230, 160, c => {
    shade(c, 115, 152, 100, 7);
    rr(c, 8, 70, 214, 80, 10); paint(c, '#c4cbd9');
    rr(c, 8, 62, 214, 22, 8); paint(c, '#eef0f5');
    c.strokeStyle = 'rgba(67,75,96,0.35)'; c.lineWidth = 2.5;
    [72, 115, 158].forEach(x => { c.beginPath(); c.moveTo(x, 90); c.lineTo(x, 146); c.stroke(); });
    rr(c, 44, 8, 70, 62, 10); paint(c, '#5c667c');
    rr(c, 52, 16, 54, 26, 5); paint(c, '#363d50', 2.5);
    oval(c, 66, 52, 5, 5, '#b98a8a', 2); oval(c, 86, 52, 5, 5, '#8dbb9d', 2);
    rr(c, 62, 44, 22, 16, 3); paint(c, '#f1f2f5', 2.5);
    gloss(c, 14, 66, 202, 5, 2);
  });
}

function crates() {
  return mk(110, 100, c => {
    shade(c, 55, 92, 46, 6);
    rr(c, 6, 40, 60, 52, 6); paint(c, '#b99d76');
    rr(c, 50, 24, 54, 68, 6); paint(c, '#c8ad87');
    rr(c, 20, 6, 46, 40, 6); paint(c, '#d6bf9d');
    c.strokeStyle = 'rgba(67,75,96,0.4)'; c.lineWidth = 2.5;
    [[6, 60, 66, 60], [50, 50, 104, 50], [20, 22, 66, 22]].forEach(([a, b, d, e]) => { c.beginPath(); c.moveTo(a, b); c.lineTo(d, e); c.stroke(); });
  });
}

function beanbag() {
  return mk(124, 96, c => {
    shade(c, 62, 88, 52, 6);
    c.beginPath(); c.moveTo(14, 84); c.bezierCurveTo(0, 40, 24, 8, 62, 8); c.bezierCurveTo(100, 8, 124, 40, 110, 84); c.closePath(); paint(c, '#a9b9a6');
    gloss(c, 34, 16, 40, 7, 3);
  });
}

function bin() {
  return mk(52, 70, c => {
    shade(c, 26, 64, 18, 4);
    c.beginPath(); c.moveTo(8, 18); c.lineTo(44, 18); c.lineTo(39, 62); c.lineTo(13, 62); c.closePath(); paint(c, '#9aa4b8', 2.5);
    rr(c, 4, 10, 44, 12, 5); paint(c, '#b5bdce', 2.5);
  });
}

function bookshelf() {
  return mk(150, 170, c => {
    shade(c, 75, 162, 62, 6);
    rr(c, 10, 10, 130, 150, 8); paint(c, '#bfa27c');
    [[20, 20, 110, 44], [20, 72, 110, 44], [20, 124, 110, 28]].forEach(([x, y, w, h]) => { rr(c, x, y, w, h, 3); c.fillStyle = '#a58a66'; c.fill(); });
    const cols = ['#8aa0b8', '#c9a58a', '#98b59e', '#b8a3c4', '#d1c28a', '#9fb1c9'];
    [[20, 20, 44], [20, 72, 44], [20, 124, 28]].forEach(([x0, y0, h], row) => {
      let x = x0 + 4;
      for (let i = 0; i < 8; i++) { const w = 9 + ((i * 7 + row * 3) % 6); rr(c, x, y0 + h - 30 - ((i + row) % 3) * 4, w, 30 + ((i + row) % 3) * 4 - 2, 2); paint(c, cols[(i + row) % cols.length], 2); x += w + 3; if (x > 118) break; }
    });
  });
}

function fuelIcon(kind) {
  return mk(64, 80, c => {
    c.translate(0, 4);
    const steam = col => {
      c.strokeStyle = col; c.lineWidth = 4; c.globalAlpha = 0.85;
      [[24, 18], [38, 14]].forEach(([x, y]) => { c.beginPath(); c.moveTo(x, y + 14); c.bezierCurveTo(x - 8, y + 6, x + 8, y, x, y - 8); c.stroke(); });
      c.globalAlpha = 1;
    };
    const edge = INK;
    const solid = (fill, lw = 3) => paint(c, fill, lw, edge);
    if (kind === 'coffee') {
      steam('#fff');
      c.beginPath(); c.moveTo(12, 30); c.lineTo(52, 30); c.lineTo(46, 68); c.lineTo(18, 68); c.closePath(); solid('#ffffff');
      c.beginPath(); c.moveTo(14, 44); c.lineTo(50, 44); c.lineTo(48, 56); c.lineTo(16, 56); c.closePath(); solid('#c58b4f');
      rr(c, 9, 22, 46, 12, 5); solid('#3b2a20');
    } else if (kind === 'cola') {
      rr(c, 14, 10, 36, 62, 8); solid('#e8404a');
      c.beginPath(); c.moveTo(14, 36); c.bezierCurveTo(26, 26, 38, 46, 50, 36); c.lineTo(50, 48); c.bezierCurveTo(38, 58, 26, 38, 14, 48); c.closePath(); solid('#fff');
      rr(c, 14, 6, 36, 12, 5); solid('#c9d1e0'); rr(c, 14, 64, 36, 10, 5); solid('#c9d1e0');
      gloss(c, 18, 20, 6, 38, 3);
    } else if (kind === 'energy') {
      rr(c, 16, 8, 32, 64, 8); solid('#31c874');
      c.beginPath(); c.moveTo(34, 20); c.lineTo(22, 44); c.lineTo(32, 44); c.lineTo(28, 62); c.lineTo(42, 36); c.lineTo(32, 36); c.closePath(); solid('#ffe14a');
      rr(c, 16, 6, 32, 10, 4); solid('#c9d1e0'); rr(c, 16, 64, 32, 10, 4); solid('#c9d1e0');
    } else if (kind === 'chai') {
      steam('#fff');
      c.beginPath(); c.moveTo(10, 30); c.lineTo(48, 30); c.bezierCurveTo(48, 62, 38, 68, 29, 68); c.bezierCurveTo(20, 68, 10, 62, 10, 30); c.closePath(); solid('#f1dcb4');
      rr(c, 12, 30, 34, 10, 4); solid('#a85d2c');
      c.beginPath(); c.arc(52, 44, 8, -1.3, 1.3); c.lineWidth = 4; c.strokeStyle = edge; c.stroke();
      oval(c, 29, 72, 24, 5, '#e9e2d0', 3, edge);
    } else if (kind === 'coldbrew') {
      c.strokeStyle = edge; c.lineWidth = 6; c.beginPath(); c.moveTo(36, 28); c.lineTo(44, 4); c.stroke(); c.strokeStyle = '#f4a3b8'; c.lineWidth = 3; c.beginPath(); c.moveTo(36, 28); c.lineTo(44, 4); c.stroke();
      c.beginPath(); c.moveTo(14, 18); c.lineTo(50, 18); c.lineTo(46, 70); c.lineTo(18, 70); c.closePath(); solid('rgba(235,245,255,0.9)');
      c.beginPath(); c.moveTo(16, 30); c.lineTo(49, 30); c.lineTo(46, 68); c.lineTo(18, 68); c.closePath(); c.fillStyle = '#4a2e22'; c.fill();
      [[26, 38], [38, 46], [28, 54]].forEach(([x, y]) => { rr(c, x - 5, y - 5, 10, 10, 2); c.fillStyle = 'rgba(255,255,255,0.7)'; c.fill(); });
    } else if (kind === 'kombucha') {
      rr(c, 22, 4, 20, 14, 4); solid('#7c8aa0');
      c.beginPath(); c.moveTo(24, 16); c.lineTo(40, 16); c.lineTo(48, 32); c.lineTo(48, 70); c.lineTo(16, 70); c.lineTo(16, 32); c.closePath(); solid('#c98b3a');
      rr(c, 18, 40, 28, 22, 4); solid('#f6efe0', 2.5);
      c.beginPath(); c.arc(32, 51, 6, 0, 6.283); c.fillStyle = '#6aa57a'; c.fill();
    } else if (kind === 'oj') {
      c.beginPath(); c.moveTo(12, 24); c.lineTo(32, 6); c.lineTo(52, 24); c.closePath(); solid('#ffb347');
      rr(c, 12, 24, 40, 46, 4); solid('#ff9f1c');
      oval(c, 32, 46, 11, 11, '#ffd37a', 2.5, edge); c.strokeStyle = 'rgba(255,255,255,0.8)'; c.lineWidth = 2; c.beginPath(); c.moveTo(32, 35); c.lineTo(32, 57); c.moveTo(21, 46); c.lineTo(43, 46); c.stroke();
    } else if (kind === 'boba') {
      c.strokeStyle = edge; c.lineWidth = 8; c.beginPath(); c.moveTo(34, 24); c.lineTo(40, 2); c.stroke(); c.strokeStyle = '#ffd0e6'; c.lineWidth = 4; c.beginPath(); c.moveTo(34, 24); c.lineTo(40, 2); c.stroke();
      c.beginPath(); c.moveTo(12, 22); c.lineTo(52, 22); c.lineTo(47, 70); c.lineTo(17, 70); c.closePath(); solid('rgba(245,235,225,0.92)');
      c.beginPath(); c.moveTo(14, 34); c.lineTo(51, 34); c.lineTo(47, 68); c.lineTo(17, 68); c.closePath(); c.fillStyle = '#c9a074'; c.fill();
      [[22, 62], [30, 64], [38, 62], [26, 56], [34, 57], [42, 58]].forEach(([x, y]) => { c.beginPath(); c.arc(x, y, 3.4, 0, 6.283); c.fillStyle = '#2b1d16'; c.fill(); });
      rr(c, 10, 18, 44, 8, 4); solid('#f6e7f0');
    } else if (kind === 'greentea') {
      steam('#fff');
      c.strokeStyle = edge; c.lineWidth = 2.5; c.beginPath(); c.moveTo(34, 34); c.lineTo(44, 22); c.stroke(); rr(c, 42, 14, 12, 12, 2); solid('#f6efe0', 2.5);
      c.beginPath(); c.moveTo(10, 32); c.lineTo(48, 32); c.lineTo(46, 66); c.bezierCurveTo(46, 72, 12, 72, 12, 66); c.closePath(); solid('#d5e6d0');
      rr(c, 12, 32, 34, 9, 4); solid('#7fb77e');
      c.beginPath(); c.arc(52, 48, 8, -1.3, 1.3); c.lineWidth = 4; c.strokeStyle = edge; c.stroke();
    } else if (kind === 'protein') {
      rr(c, 20, 4, 24, 14, 5); solid('#f2f4f8');
      rr(c, 14, 16, 36, 56, 8); solid('#5b9bd5');
      rr(c, 18, 32, 28, 22, 4); solid('#fdfdfd', 2.5);
      c.strokeStyle = edge; c.lineWidth = 3; c.beginPath(); c.moveTo(24, 43); c.lineTo(40, 43); c.moveTo(32, 36); c.lineTo(32, 50); c.stroke();
    } else if (kind === 'seltzer') {
      rr(c, 18, 8, 28, 62, 7); solid('#9ad7e8');
      rr(c, 18, 4, 28, 10, 4); solid('#c9d1e0'); rr(c, 18, 64, 28, 10, 4); solid('#c9d1e0');
      [[27, 30, 3], [37, 42, 4], [28, 52, 3], [38, 24, 2.5]].forEach(([x, y, r]) => { c.beginPath(); c.arc(x, y, r, 0, 6.283); c.fillStyle = 'rgba(255,255,255,0.85)'; c.fill(); });
    } else {
      steam('#fff');
      oval(c, 32, 68, 26, 6, '#ece5d6', 3, edge);
      c.beginPath(); c.moveTo(14, 38); c.lineTo(48, 38); c.lineTo(45, 64); c.bezierCurveTo(45, 70, 17, 70, 17, 64); c.closePath(); solid('#efe7d9');
      oval(c, 31, 38, 17, 5, '#4a2e22', 2.5, edge); oval(c, 31, 38, 11, 3, '#c28a54', 1, '#c28a54');
      c.beginPath(); c.arc(51, 50, 7, -1.3, 1.3); c.lineWidth = 4; c.strokeStyle = edge; c.stroke();
    }
  });
}

export const FUEL_KINDS = ['coffee', 'cola', 'energy', 'chai', 'coldbrew', 'kombucha', 'oj', 'boba', 'greentea', 'protein', 'seltzer', 'espresso'];

export function buildProps() {
  return {
    desk: desk(), chair: chair(), plantA: plant('#5a9a74', '#b9a58a'), plantB: plant('#6aa985', '#a9b4c6'),
    cooler: cooler(), printer: printer(), sofa: sofa(), table: table(), kitchen: kitchen(), crates: crates(),
    beanbag: beanbag(), bin: bin(), bookshelf: bookshelf(),
  };
}

export function buildFuelIcons() {
  return Object.fromEntries(FUEL_KINDS.map(k => [k, fuelIcon(k)]));
}

export function drawSpriteCanvas(ctx, spr, x, y, scale = 1, alpha = 1) {
  ctx.globalAlpha = alpha;
  ctx.drawImage(spr.canvas, x - (spr.w * scale) / 2, y - spr.h * scale + 8 * scale, spr.w * scale, spr.h * scale);
  ctx.globalAlpha = 1;
}

export { mk, rr, paint, oval, shade, gloss };
