export const view = { w: 1280, h: 720 };
export const ZOOM = 0.8;
export const visible = () => ({ w: view.w / ZOOM, h: view.h / ZOOM });

export const WORLD = { w: 3200, h: 2000, left: 120, right: 3080, top: 300, bottom: 1920 };

export const INK = '#15171f';

export const TAGS = {
  CODE: { color: '#3aa0ff', deep: '#1c67b8', soft: '#d3e9ff' },
  DESIGN: { color: '#ff4fa3', deep: '#bd2a79', soft: '#ffd5e9' },
  PROCESS: { color: '#ffb627', deep: '#c47f00', soft: '#ffefc7' },
  TEST: { color: '#3ddc84', deep: '#1c9a58', soft: '#cdf6df' },
};
export const tagColor = t => (TAGS[t] ? TAGS[t].color : '#ffd23f');
export const TAG_ORDER = ['CODE', 'DESIGN', 'PROCESS', 'TEST'];

export const MATCH_MULT = 2.4;
export const OFF_MULT = 0.28;
export const MAX_PIPS = 3;
export const PIP_SECONDS = 4;
export const OVERDRIVE_SECONDS = 7;
export const SQUAD_SIZE = 3;
export const MAX_ENEMIES = 34;
export const FONT = '"Fredoka", "Baloo 2", ui-rounded, "SF Pro Rounded", system-ui, sans-serif';
