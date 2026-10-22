const PREFIX = 'shipit-';
const VERSION = `${PREFIX}v7`;

const CORE = [
  './', 'index.html', 'manifest.webmanifest', 'assets/fonts/fredoka-latin.woff2',
  'assets/icons/icon-192.png', 'assets/icons/icon-512.png', 'assets/icons/apple-touch-icon.png', 'assets/icons/favicon-64.png',
  'assets/sprites/sprites.json',
  'src/ai.js',
  'src/allies.js',
  'src/assets.js',
  'src/audio.js',
  'src/combat.js',
  'src/config.js',
  'src/data.js',
  'src/draw.js',
  'src/editor.js',
  'src/fullscreen.js',
  'src/fx.js',
  'src/game.js',
  'src/glyphsOutdoor.js',
  'src/heroes.js',
  'src/home.js',
  'src/howto.js',
  'src/hud.js',
  'src/icons.js',
  'src/input.js',
  'src/levelSelect.js',
  'src/levels.js',
  'src/loader.js',
  'src/main.js',
  'src/overlays.js',
  'src/powers.js',
  'src/profile.js',
  'src/props.js',
  'src/propsOutdoor.js',
  'src/render.js',
  'src/results.js',
  'src/rules.js',
  'src/scores.js',
  'src/settings.js',
  'src/sim.js',
  'src/spawn.js',
  'src/squad.js',
  'src/state.js',
  'src/themeOffice.js',
  'src/themeOutdoor.js',
  'src/ui.js',
  'src/world.js',
  'src/zones.js',
];

async function precache() {
  const cache = await caches.open(VERSION);
  await cache.addAll(CORE);
  const sets = await (await fetch('assets/sprites/sprites.json')).json();
  const sprites = Object.entries(sets).flatMap(([id, set]) => Object.keys(set.anims).map(a => `assets/sprites/${id}_${a}.png`));
  await Promise.allSettled(sprites.map(u => cache.add(u)));
}

self.addEventListener('install', event => event.waitUntil(precache().then(() => self.skipWaiting())));

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith(PREFIX) && k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

const isCode = req => req.mode === 'navigate' || /\.(js|html|json|webmanifest)$/.test(new URL(req.url).pathname);

async function networkFirst(req) {
  const cache = await caches.open(VERSION);
  try {
    const res = await fetch(req);
    if (res && res.ok && !new URL(req.url).search) cache.put(req, res.clone());
    return res;
  } catch {
    return (await cache.match(req, { ignoreSearch: true })) || (await cache.match('index.html')) || Response.error();
  }
}

async function cacheFirst(req) {
  const cache = await caches.open(VERSION);
  const hit = await cache.match(req, { ignoreSearch: true });
  if (hit) return hit;
  try {
    const res = await fetch(req);
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  } catch {
    return Response.error();
  }
}

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith(isCode(req) ? networkFirst(req) : cacheFirst(req));
});
