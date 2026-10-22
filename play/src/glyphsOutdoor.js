const TAU = Math.PI * 2;

const poly = (c, pts) => { pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); };

export const OUTDOOR_GLYPHS = {
  sun(c) {
    c.beginPath(); c.arc(0, 0, 0.42, 0, TAU); c.stroke();
    for (let i = 0; i < 8; i++) { const a = (i * TAU) / 8; c.beginPath(); c.moveTo(Math.cos(a) * 0.62, Math.sin(a) * 0.62); c.lineTo(Math.cos(a) * 0.95, Math.sin(a) * 0.95); c.stroke(); }
  },
  plane(c) {
    c.beginPath(); poly(c, [[-0.9, 0.1], [0.9, -0.65], [0.2, 0.7], [-0.1, 0.15]]); c.closePath(); c.stroke();
    c.beginPath(); c.moveTo(-0.1, 0.15); c.lineTo(0.9, -0.65); c.stroke();
  },
  shades(c) {
    c.beginPath(); c.ellipse(-0.42, 0.05, 0.38, 0.3, 0, 0, TAU); c.ellipse(0.42, 0.05, 0.38, 0.3, 0, 0, TAU); c.fill();
    c.beginPath(); c.moveTo(-0.05, 0); c.lineTo(0.05, 0); c.moveTo(-0.8, 0); c.lineTo(-0.95, -0.2); c.moveTo(0.8, 0); c.lineTo(0.95, -0.2); c.stroke();
  },
  wave(c) {
    [-0.35, 0.3].forEach(y => { c.beginPath(); c.moveTo(-0.9, y); c.bezierCurveTo(-0.6, y - 0.5, -0.3, y - 0.5, 0, y); c.bezierCurveTo(0.3, y + 0.5, 0.6, y + 0.5, 0.9, y); c.stroke(); });
  },
  map(c) {
    c.beginPath(); poly(c, [[-0.85, -0.55], [-0.3, -0.7], [0.3, -0.5], [0.85, -0.7], [0.85, 0.55], [0.3, 0.7], [-0.3, 0.5], [-0.85, 0.7]]); c.closePath();
    c.moveTo(-0.3, -0.7); c.lineTo(-0.3, 0.5); c.moveTo(0.3, -0.5); c.lineTo(0.3, 0.7); c.stroke();
  },
  palm(c) {
    c.beginPath(); c.moveTo(0.1, 0.9); c.quadraticCurveTo(0.3, 0.2, 0, -0.2); c.stroke();
    [[-0.9, 0.1], [-0.6, -0.55], [0.7, -0.5], [0.95, 0.2]].forEach(([x, y]) => { c.beginPath(); c.moveTo(0, -0.2); c.quadraticCurveTo(x * 0.5, y - 0.35, x, y); c.stroke(); });
  },
  drop(c) {
    c.beginPath(); c.moveTo(0, -0.9); c.bezierCurveTo(0.2, -0.4, 0.65, 0, 0.65, 0.35); c.bezierCurveTo(0.65, 0.8, -0.65, 0.8, -0.65, 0.35); c.bezierCurveTo(-0.65, 0, -0.2, -0.4, 0, -0.9); c.stroke();
  },
  wifi(c) {
    [0.35, 0.65, 0.95].forEach(r => { c.beginPath(); c.arc(0, 0.6, r, -2.4, -0.74); c.stroke(); });
    c.beginPath(); c.arc(0, 0.6, 0.12, 0, TAU); c.fill();
  },
  deckchair(c) {
    c.beginPath(); poly(c, [[-0.7, -0.8], [0.1, 0.1], [0.85, 0.1]]); c.stroke();
    c.beginPath(); poly(c, [[-0.5, 0.9], [0.1, 0.1], [0.7, 0.9]]); c.stroke();
  },
  camera(c) {
    c.beginPath(); c.rect(-0.85, -0.45, 1.7, 1.1); c.moveTo(-0.3, -0.45); c.lineTo(-0.15, -0.75); c.lineTo(0.25, -0.75); c.lineTo(0.4, -0.45); c.stroke();
    c.beginPath(); c.arc(0, 0.1, 0.35, 0, TAU); c.stroke();
  },
  pot(c) {
    c.beginPath(); c.rect(-0.7, -0.1, 1.4, 0.8); c.moveTo(-0.9, -0.1); c.lineTo(0.9, -0.1); c.moveTo(-0.7, 0.25); c.lineTo(-0.95, 0.25); c.moveTo(0.7, 0.25); c.lineTo(0.95, 0.25); c.stroke();
    c.beginPath(); c.moveTo(-0.25, -0.35); c.quadraticCurveTo(-0.45, -0.6, -0.25, -0.85); c.moveTo(0.25, -0.35); c.quadraticCurveTo(0.05, -0.6, 0.25, -0.85); c.stroke();
  },
  bed(c) {
    c.beginPath(); poly(c, [[-0.9, -0.5], [-0.9, 0.6]]); c.moveTo(-0.9, 0.3); c.lineTo(0.9, 0.3); c.lineTo(0.9, 0.6); c.stroke();
    c.beginPath(); c.rect(-0.75, -0.1, 0.55, 0.3); c.stroke(); c.fillRect(-0.05, 0.05, 0.9, 0.25);
  },
  alarm(c) {
    c.beginPath(); c.arc(0, 0.1, 0.62, 0, TAU); c.moveTo(0, 0.1); c.lineTo(0, -0.3); c.moveTo(0, 0.1); c.lineTo(0.3, 0.25); c.stroke();
    c.beginPath(); c.arc(-0.6, -0.55, 0.25, 2.5, 5.3); c.arc(0.6, -0.55, 0.25, 4.1, 0.65 + TAU); c.stroke();
  },
  layers(c) {
    [-0.4, 0, 0.4].forEach(y => { c.beginPath(); poly(c, [[-0.85, y], [0, y - 0.35], [0.85, y], [0, y + 0.35]]); c.closePath(); c.stroke(); });
  },
  fork(c) {
    c.beginPath(); c.moveTo(0, 0.85); c.lineTo(0, 0.1); c.lineTo(-0.6, -0.55); c.moveTo(0, 0.1); c.lineTo(0.6, -0.55); c.stroke();
    [[0, 0.85], [-0.6, -0.65], [0.6, -0.65]].forEach(([x, y]) => { c.beginPath(); c.arc(x, y, 0.17, 0, TAU); c.fill(); });
  },
  grid(c) {
    [[-0.8, -0.8], [0.05, -0.8], [-0.8, 0.05], [0.05, 0.05]].forEach(([x, y]) => { c.beginPath(); c.rect(x, y, 0.75, 0.75); c.stroke(); });
  },
  snow(c) {
    for (let i = 0; i < 3; i++) { const a = (i * TAU) / 6 + 0.2; c.beginPath(); c.moveTo(Math.cos(a) * 0.9, Math.sin(a) * 0.9); c.lineTo(-Math.cos(a) * 0.9, -Math.sin(a) * 0.9); c.stroke(); }
  },
  fall(c) {
    c.beginPath(); c.moveTo(0, -0.85); c.lineTo(0, 0.7); c.moveTo(-0.45, 0.25); c.lineTo(0, 0.75); c.lineTo(0.45, 0.25); c.stroke();
    c.beginPath(); c.arc(0, -0.85, 0.14, 0, TAU); c.fill();
  },
  door(c) {
    c.beginPath(); c.rect(-0.55, -0.85, 1.1, 1.7); c.stroke();
    c.beginPath(); c.arc(0.28, 0.05, 0.1, 0, TAU); c.fill();
  },
  flame(c) {
    c.beginPath(); c.moveTo(0, -0.95); c.bezierCurveTo(0.2, -0.45, 0.7, -0.15, 0.6, 0.35); c.bezierCurveTo(0.5, 0.9, -0.5, 0.9, -0.6, 0.35); c.bezierCurveTo(-0.65, 0, -0.3, -0.1, -0.3, -0.5); c.bezierCurveTo(-0.1, -0.45, -0.05, -0.7, 0, -0.95); c.stroke();
  },
  compass(c) {
    c.beginPath(); c.arc(0, 0, 0.8, 0, TAU); c.stroke();
    c.beginPath(); poly(c, [[0, -0.55], [0.2, 0], [0, 0.55], [-0.2, 0]]); c.closePath(); c.fill();
  },
  rope(c) {
    c.beginPath(); c.moveTo(-0.9, -0.3); c.bezierCurveTo(-0.4, -0.9, 0, 0.5, 0.35, 0); c.bezierCurveTo(0.7, -0.5, 0.85, 0.4, 0.9, 0.7); c.stroke();
    c.beginPath(); c.arc(0.12, 0.2, 0.22, 0, TAU); c.stroke();
  },
  megaphone(c) {
    c.beginPath(); poly(c, [[-0.8, -0.2], [0.1, -0.2], [0.85, -0.7], [0.85, 0.7], [0.1, 0.2], [-0.8, 0.2]]); c.closePath(); c.stroke();
    c.beginPath(); c.moveTo(-0.4, 0.2); c.lineTo(-0.2, 0.8); c.stroke();
  },
  loop(c) {
    c.beginPath(); c.arc(0, 0, 0.7, -0.4, 4.4); c.stroke();
    c.beginPath(); poly(c, [[0.55, -0.9], [0.65, -0.35], [0.1, -0.45]]); c.closePath(); c.fill();
  },
  paw(c) {
    c.beginPath(); c.ellipse(0, 0.3, 0.45, 0.38, 0, 0, TAU); c.fill();
    [[-0.62, -0.2, 0.2], [-0.22, -0.6, 0.2], [0.22, -0.6, 0.2], [0.62, -0.2, 0.2]].forEach(([x, y, r]) => { c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); });
  },
  chart(c) {
    c.beginPath(); c.moveTo(-0.85, -0.8); c.lineTo(-0.85, 0.8); c.lineTo(0.9, 0.8); c.stroke();
    c.fillRect(-0.55, 0.1, 0.3, 0.6); c.fillRect(-0.1, -0.3, 0.3, 1); c.fillRect(0.35, -0.7, 0.3, 1.4);
  },
};
