import { view } from './config.js';

const KEYMAP = {
  ' ': 'power', shift: 'swap', tab: 'swap', e: 'swap', q: 'swapPrev',
  p: 'pause', escape: 'pause', m: 'mute', enter: 'confirm', r: 'restart',
  1: 'n1', 2: 'n2', 3: 'n3', 4: 'n4',
  arrowleft: 'left', arrowright: 'right', arrowup: 'up', arrowdown: 'down',
};
const BLOCKED = new Set([' ', 'tab', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright']);
const STICK_RADIUS = 85;

export function createInput(canvas) {
  const keys = new Set();
  let actions = [];
  let pointers = [];
  const stick = { id: null, ox: 0, oy: 0, x: 0, y: 0 };
  const lastPos = new Map();

  function toLogical(e) {
    const r = canvas.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * view.w, y: ((e.clientY - r.top) / r.height) * view.h };
  }

  const typing = e => e.target instanceof Element && !!e.target.closest('#editor, input, textarea');

  window.addEventListener('keydown', e => {
    if (typing(e)) return;
    const k = e.key.toLowerCase();
    if (BLOCKED.has(k)) e.preventDefault();
    keys.add(k);
    if (e.repeat) return;
    if (KEYMAP[k]) actions.push(KEYMAP[k]);
  });
  window.addEventListener('keyup', e => {
    if (typing(e)) return;
    if (e.key === 'Meta') keys.clear();
    keys.delete(e.key.toLowerCase());
  });
  window.addEventListener('blur', () => { keys.clear(); stick.id = null; });

  canvas.addEventListener('pointerdown', e => {
    const p = toLogical(e);
    try { canvas.setPointerCapture(e.pointerId); } catch { /* not capturable */ }
    lastPos.set(e.pointerId, p);
    pointers.push({ kind: 'down', id: e.pointerId, x: p.x, y: p.y, touch: e.pointerType === 'touch' });
  });
  canvas.addEventListener('pointermove', e => {
    const p = toLogical(e);
    lastPos.set(e.pointerId, p);
    if (e.pointerId !== stick.id) return;
    stick.x = p.x;
    stick.y = p.y;
  });
  const up = e => {
    const p = toLogical(e);
    lastPos.delete(e.pointerId);
    if (e.pointerId === stick.id) stick.id = null;
    pointers.push({ kind: 'up', id: e.pointerId, x: p.x, y: p.y });
  };
  canvas.addEventListener('pointerup', up);
  canvas.addEventListener('pointercancel', up);
  canvas.addEventListener('contextmenu', e => e.preventDefault());

  return {
    stick,
    drain() {
      const out = { actions, pointers };
      actions = [];
      pointers = [];
      return out;
    },
    beginStick(id, x, y) {
      stick.id = id;
      const now = lastPos.get(id) || { x, y };
      stick.ox = x; stick.oy = y; stick.x = now.x; stick.y = now.y;
    },
    endStick(id) { if (stick.id === id) stick.id = null; },
    stickActive: () => stick.id !== null,
    move() {
      let x = 0;
      let y = 0;
      if (keys.has('arrowleft') || keys.has('a')) x -= 1;
      if (keys.has('arrowright') || keys.has('d')) x += 1;
      if (keys.has('arrowup') || keys.has('w')) y -= 1;
      if (keys.has('arrowdown') || keys.has('s')) y += 1;
      if (stick.id !== null) {
        const dx = stick.x - stick.ox;
        const dy = stick.y - stick.oy;
        const d = Math.hypot(dx, dy);
        if (d > 10) {
          const k = Math.min(1, d / STICK_RADIUS);
          x = (dx / d) * k;
          y = (dy / d) * k;
        }
      }
      const m = Math.hypot(x, y);
      return m > 1 ? { x: x / m, y: y / m } : { x, y };
    },
    reset() { keys.clear(); stick.id = null; actions = []; pointers = []; },
  };
}

export const STICK = { radius: STICK_RADIUS };
