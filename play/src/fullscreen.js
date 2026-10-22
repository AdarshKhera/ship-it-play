const root = () => document.documentElement;

export const isStandalone = () => ['standalone', 'fullscreen'].some(m => window.matchMedia(`(display-mode: ${m})`).matches) || navigator.standalone === true;
export const canFullscreen = () => !!(root().requestFullscreen || root().webkitRequestFullscreen) && document.fullscreenEnabled !== false;
export const isFullscreen = () => !!(document.fullscreenElement || document.webkitFullscreenElement);

export async function enterFullscreen() {
  try {
    if (root().requestFullscreen) await root().requestFullscreen({ navigationUI: 'hide' });
    else if (root().webkitRequestFullscreen) root().webkitRequestFullscreen();
  } catch { /* refused: stay windowed */ }
  try { await screen.orientation.lock('landscape'); } catch { /* not supported or not allowed */ }
}

export async function exitFullscreen() {
  try {
    if (document.exitFullscreen) await document.exitFullscreen();
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
  } catch { /* ignore */ }
  try { screen.orientation.unlock(); } catch { /* ignore */ }
}

export const toggleFullscreen = () => (isFullscreen() ? exitFullscreen() : enterFullscreen());
