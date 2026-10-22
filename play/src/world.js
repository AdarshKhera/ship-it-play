import { WORLD } from './config.js';
import { drawSpriteCanvas } from './props.js';
import { officeTheme } from './themeOffice.js';
import { parkTheme, campTheme } from './themeOutdoor.js';

const WALL_SCALE = 1.4;
const THEMES = { office: officeTheme, park: parkTheme, camp: campTheme };

function renderWall(theme) {
  const h = WORLD.top + 60;
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(WORLD.w * WALL_SCALE); canvas.height = Math.round(h * WALL_SCALE);
  const c = canvas.getContext('2d');
  c.scale(WALL_SCALE, WALL_SCALE);
  c.lineJoin = 'round';
  theme.paintWall(c, h);
  return canvas;
}

function floorPattern(ctx, theme) {
  const pattern = ctx.createPattern(theme.floorTile(), 'repeat');
  pattern.setTransform(new DOMMatrix().scale(0.5));
  return pattern;
}

function rrPath(c, x, y, w, h, r) {
  c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}

function drawRug(ctx, r) {
  ctx.save();
  ctx.translate(r.x, r.y);
  if (r.round) { ctx.beginPath(); ctx.ellipse(0, 0, r.w / 2, r.h / 2, 0, 0, 6.283); } else rrPath(ctx, -r.w / 2, -r.h / 2, r.w, r.h, 30);
  ctx.fillStyle = r.fill; ctx.fill();
  ctx.restore();
}

export function createWorld(mainCtx, themeId = 'office') {
  const theme = THEMES[themeId] || officeTheme;
  const sprites = theme.buildSprites();
  const wall = renderWall(theme);
  const pattern = floorPattern(mainCtx, theme);
  const { fill, edge } = theme.frame;
  const props = theme.placements.map(([k, x, y, solid]) => ({
    k, x, y, sprite: sprites[k],
    rect: solid ? { x0: x - solid[0], x1: x + solid[0], y0: y - solid[1], y1: y } : null,
  }));
  const solids = props.filter(p => p.rect).map(p => p.rect);

  function pushOut(o, radius) {
    for (const r of solids) {
      const cx = Math.max(r.x0, Math.min(o.x, r.x1));
      const cy = Math.max(r.y0, Math.min(o.y, r.y1));
      const dx = o.x - cx;
      const dy = o.y - cy;
      const d = Math.hypot(dx, dy);
      if (d < radius) {
        if (d > 0.001) { o.x += (dx / d) * (radius - d); o.y += (dy / d) * (radius - d); }
        else o.y = r.y1 + radius;
      }
    }
    o.x = Math.max(WORLD.left + radius * 0.4, Math.min(WORLD.right - radius * 0.4, o.x));
    o.y = Math.max(WORLD.top + 6, Math.min(WORLD.bottom, o.y));
  }

  function drawBack(ctx, cam, vw, vh) {
    ctx.fillStyle = pattern;
    ctx.fillRect(cam.x - 2, Math.max(WORLD.top - 8, cam.y - 2), vw + 4, vh + 4);
    for (const r of theme.rugs) {
      if (r.x + r.w / 2 < cam.x || r.x - r.w / 2 > cam.x + vw || r.y + r.h / 2 < cam.y || r.y - r.h / 2 > cam.y + vh) continue;
      drawRug(ctx, r);
    }
    if (cam.y < WORLD.top + 60) ctx.drawImage(wall, 0, 0, wall.width, wall.height, 0, 0, WORLD.w, wall.height / WALL_SCALE);
    ctx.fillStyle = fill;
    ctx.fillRect(0, 0, WORLD.left - 6, WORLD.h); ctx.fillRect(WORLD.right + 6, 0, WORLD.w - WORLD.right, WORLD.h); ctx.fillRect(0, WORLD.bottom + 12, WORLD.w, WORLD.h - WORLD.bottom);
    ctx.fillStyle = edge;
    ctx.fillRect(WORLD.left - 8, WORLD.top - 4, 5, WORLD.bottom - WORLD.top + 18);
    ctx.fillRect(WORLD.right + 3, WORLD.top - 4, 5, WORLD.bottom - WORLD.top + 18);
    ctx.fillRect(WORLD.left - 8, WORLD.bottom + 8, WORLD.right - WORLD.left + 16, 5);
  }

  return { props, solids, pushOut, drawBack, drawProp: (ctx, p) => drawSpriteCanvas(ctx, p.sprite, p.x, p.y, 1), theme: themeId };
}
