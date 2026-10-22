import { INK, view } from './config.js';
import { panel, text } from './draw.js';
import { backIcon, drawBackdrop } from './ui.js';

function row(ctx, app, y, label, sub, id, btnLabel, style) {
  text(ctx, label, view.w / 2 - 420, y + 20, { size: 28 });
  if (sub) text(ctx, sub, view.w / 2 - 420, y + 50, { size: 18, color: '#9aa3d4', weight: 600 });
  app.ui.button(ctx, id, view.w / 2 + 180, y - 6, 240, 62, btnLabel, { style, size: 24 });
}

export function drawSettings(ctx, app) {
  const { ui, profile, t } = app;
  const cx = view.w / 2;
  drawBackdrop(ctx, t);
  ui.round(ctx, 'settings:back', 56, 56, 30, (c, r, col) => backIcon(c, r, col));
  text(ctx, 'SETTINGS', cx, 52, { size: 46, align: 'center', base: 'middle', color: '#ffe14a', stroke: INK, lw: 10 });
  panel(ctx, cx - 480, 110, 960, 470, { fill: 'rgba(16,19,48,0.9)', r: 30 });
  row(ctx, app, 150, 'Sound', 'Effects for hits, powers and pickups', 'toggle:sound', profile.settings.sound ? 'ON' : 'OFF', profile.settings.sound ? 'success' : 'off');
  row(ctx, app, 236, 'Vibration', 'A little buzz on hits and powers (phones)', 'toggle:vibration', profile.settings.vibration ? 'ON' : 'OFF', profile.settings.vibration ? 'success' : 'off');
  row(ctx, app, 322, 'Player name', `Shown on the scoreboard: ${profile.player}`, 'edit:player', 'CHANGE', 'secondary');
  row(ctx, app, 408, 'Reset progress', app.confirmReset ? 'Tap again to erase scores, names and unlocks' : 'Scores, names and unlocked heroes', 'reset:progress', app.confirmReset ? 'SURE?' : 'RESET', 'danger');
  text(ctx, 'Character art by RGS_Dev (CC0). Font: Fredoka (OFL). Made with love and too much coffee.', cx, 548, { size: 17, align: 'center', base: 'middle', color: '#7f88b8', weight: 600 });
  text(ctx, 'Tip: add this page to your home screen to play it like an app.', cx, 640, { size: 19, align: 'center', base: 'middle', color: '#c9ceee', weight: 600 });
}
