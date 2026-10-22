import { ENEMIES, PING_SPRITES } from './data.js';
import { TAG_ORDER, WORLD, visible } from './config.js';
import { buildSegments, hpScaleForWave } from './rules.js';
import { burst, ring } from './fx.js';
import { TAGS } from './config.js';

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

export function spawnPoint(G) {
  const h = G.squad[G.active];
  const vis = visible();
  let best = null;
  for (let i = 0; i < 12; i++) {
    const a = G.rng() * Math.PI * 2;
    const x = clamp(h.x + Math.cos(a) * (vis.w / 2 + 130), WORLD.left + 50, WORLD.right - 50);
    const y = clamp(h.y + Math.sin(a) * (vis.h / 2 + 100), WORLD.top + 50, WORLD.bottom - 20);
    const d = Math.hypot(x - h.x, y - h.y);
    best = { x, y };
    if (d > 560) return best;
  }
  return best;
}

export function createEnemy(G, key, x, y) {
  const def = ENEMIES[key];
  const flyerTag = TAG_ORDER[Math.floor(G.rng() * 4)];
  const segs = buildSegments(def, hpScaleForWave(G.wave), flyerTag);
  const sprite = def.cls === 'flyer' ? PING_SPRITES[flyerTag] : def.sprite;
  return {
    id: G.nextId++, key, def, sprite, x, y, vx: 0, vy: 0, segs,
    maxHp: segs.reduce((s, g) => s + g.max, 0), face: 1, t: G.rng() * 4, hitT: 0, hitAnimT: 1,
    frozen: 0, lock: null, slow: 0, dead: false, deadT: 0, spawnT: 0, touchCd: 0,
    cd: { shoot: 1.5 + G.rng() * 1.5, slam: 2 + G.rng() * 2, dash: 1.5 + G.rng() * 2, boss: 2.5 },
    state: null, stateT: 0, dir: { x: 0, y: 0 }, weave: G.rng() * 6.28, bossStep: 0,
  };
}

export function spawnEnemy(G, key, at, extra = {}) {
  const p = at || spawnPoint(G);
  const e = createEnemy(G, key, p.x, p.y);
  Object.assign(e, extra);
  G.enemies.push(e);
  const color = TAGS[e.segs[0].tag].color;
  ring(G.fx, e.x, e.y, { from: 6, to: e.def.radius * 1.5, life: 0.4, width: 6, color });
  burst(G.fx, e.x, e.y - 10, { color, count: 6, speed: 140, life: 0.4, size: 8, shape: 'circle', gravity: 200, up: 40 });
  return e;
}
