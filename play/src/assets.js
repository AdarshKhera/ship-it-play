function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load ${src}`));
    img.src = src;
  });
}

export async function loadSprites(base = 'assets/sprites', onProgress = () => {}) {
  const res = await fetch(`${base}/sprites.json`);
  if (!res.ok) throw new Error('sprites.json could not be loaded');
  const meta = await res.json();
  const sets = {};
  const jobs = [];
  let done = 0;
  const total = Object.values(meta).reduce((n, m) => n + Object.keys(m.anims).length, 0);
  for (const [key, m] of Object.entries(meta)) {
    sets[key] = {};
    for (const [anim, info] of Object.entries(m.anims)) {
      jobs.push(loadImage(`${base}/${key}_${anim}.png`).then(img => {
        sets[key][anim] = { ...info, img };
        onProgress(++done / total);
      }));
    }
  }
  await Promise.all(jobs);
  return sets;
}

export function frameIndex(set, anim, t, fps, loop = true) {
  const a = set[anim];
  if (!a) return 0;
  const f = Math.floor(Math.max(0, t) * fps);
  return loop ? f % a.n : Math.min(f, a.n - 1);
}

export function animDuration(set, anim, fps) {
  const a = set[anim];
  return a ? a.n / fps : 0;
}

export function drawFrame(ctx, set, anim, frame, x, y, scale, opts = {}) {
  const a = set[anim];
  if (!a) return;
  const { flip = false, alpha = 1, sx = 1, sy = 1, rot = 0 } = opts;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  if (rot) ctx.rotate(rot);
  const k = a.k || 1;
  ctx.scale((flip ? -1 : 1) * scale * sx * k, scale * sy * k);
  ctx.drawImage(a.img, frame * a.fw, 0, a.fw, a.fh, -a.ax, -a.ay, a.fw, a.fh);
  ctx.restore();
}

export function drawPortrait(ctx, sprites, key, cx, cy, size, bg) {
  const set = sprites[key];
  if (!set || !set.idle) return;
  const a = set.idle;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, size / 2, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = bg;
  ctx.fillRect(cx - size / 2, cy - size / 2, size, size);
  const sc = (size * 1.18) / a.fh;
  ctx.drawImage(a.img, 0, 0, a.fw, a.fh, cx - (a.fw * sc) / 2, cy - size * 0.38, a.fw * sc, a.fh * sc);
  ctx.restore();
}
