import { FONT, view } from './config.js';
import { loadSprites } from './assets.js';
import { createAudio } from './audio.js';
import { createInput } from './input.js';
import { createApp } from './game.js';
import { drawLoader } from './loader.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d', { alpha: false });

function stageSize() {
  const body = document.body;
  const cs = getComputedStyle(body);
  const px = k => parseFloat(cs[k]) || 0;
  return {
    vw: Math.max(1, body.clientWidth - px('paddingLeft') - px('paddingRight')),
    vh: Math.max(1, body.clientHeight - px('paddingTop') - px('paddingBottom')),
  };
}

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const { vw, vh } = stageSize();
  view.w = Math.round(Math.max(1280, Math.min(1640, (view.h * vw) / Math.max(1, vh))));
  const scale = Math.min(vw / view.w, vh / view.h);
  const cssW = Math.floor(view.w * scale);
  const cssH = Math.floor(view.h * scale);
  canvas.style.width = `${cssW}px`;
  canvas.style.height = `${cssH}px`;
  canvas.width = Math.round(cssW * dpr);
  canvas.height = Math.round(cssH * dpr);
}
window.addEventListener('resize', resize);
window.addEventListener('orientationchange', resize);
if (window.visualViewport) window.visualViewport.addEventListener('resize', resize);
if ('ResizeObserver' in window) new ResizeObserver(resize).observe(document.body);
document.addEventListener('fullscreenchange', resize);
resize();

async function waitForFonts() {
  if (!document.fonts) return;
  const timeout = new Promise(res => setTimeout(res, 2500));
  await Promise.race([Promise.all([document.fonts.load(`700 24px ${FONT}`), document.fonts.load(`600 20px ${FONT}`)]).catch(() => {}), timeout]);
}

function registerOffline() {
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
  if (!('serviceWorker' in navigator) || local || location.protocol === 'file:' || /ShipItAndroid/.test(navigator.userAgent)) return;
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

async function boot() {
  let progress = 0;
  let loading = true;
  const t0 = performance.now();
  const paintLoader = now => {
    if (!loading) return;
    ctx.setTransform(canvas.width / view.w, 0, 0, canvas.height / view.h, 0, 0);
    drawLoader(ctx, progress, (now - t0) / 1000);
    requestAnimationFrame(paintLoader);
  };
  requestAnimationFrame(paintLoader);
  try {
    const minTime = new Promise(res => setTimeout(res, 900));
    const [sprites] = await Promise.all([loadSprites('assets/sprites', p => { progress = Math.max(progress, p * 0.94); }), waitForFonts(), minTime]);
    progress = 1;
    registerOffline();
    const audio = createAudio();
    ['pointerdown', 'touchend', 'keydown'].forEach(t => window.addEventListener(t, () => audio.unlock(), { passive: true }));
    const input = createInput(canvas);
    const app = createApp({ canvas, ctx, sprites, audio, input });
    if (location.search.includes('debug')) window.__shipit = app;
    const portrait = window.matchMedia('(orientation: portrait) and (max-width: 900px)');
    portrait.addEventListener('change', e => { if (e.matches) app.pause(); });
    loading = false;
    let last = performance.now();
    const loop = now => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      requestAnimationFrame(loop);
      try { app.frame(dt); } catch (err) { console.error('Frame failed:', err); }
    };
    requestAnimationFrame(loop);
  } catch (err) {
    loading = false;
    ctx.setTransform(canvas.width / view.w, 0, 0, canvas.height / view.h, 0, 0);
    ctx.fillStyle = '#171a3d';
    ctx.fillRect(0, 0, view.w, view.h);
    ctx.fillStyle = '#ffffff';
    ctx.font = `600 30px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText(`Could not start: ${err.message}`, view.w / 2, view.h / 2);
  }
}

boot();
