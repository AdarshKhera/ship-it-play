import { DEFAULT_MODS, WAVES, scaleWaves } from './data.js';

const STAYCATION = [
  { name: 'Check-In', spawn: { sunbug: 9, filter: 8, itin: 5, deadzone: 4, ooo: 3, mozzie: 5 }, gap: 0.55 },
  {
    name: 'Beach Day', spawn: { sunbug: 6, filter: 6, itin: 6, rota: 6, screen: 5, deadzone: 4, ooo: 4, mozzie: 8, deckchair: 1 }, gap: 0.5,
    surge: { at: 0.5, label: 'Everyone brought a plus-one', spawn: { sunbug: 6, itin: 6, deadzone: 5, mozzie: 5 }, dri: false },
  },
  {
    name: 'Pool Party', spawn: { sunbug: 6, filter: 6, tides: 5, itin: 5, rota: 5, screen: 6, mozzie: 10, deckchair: 1, selfie: 1, booking: 1 }, gap: 0.45,
    surge: { at: 0.5, label: 'Cannonball!', spawn: { sunbug: 8, filter: 8, itin: 6, screen: 6, mozzie: 6 }, dri: true },
  },
  {
    name: 'BBQ Planning', spawn: { sunbug: 7, filter: 6, ooo: 6, tides: 6, itin: 6, rota: 6, screen: 6, deadzone: 5, mozzie: 12, potluck: 1, relapse: 1, cancelled: 1 }, gap: 0.4,
    surge: { at: 0.45, label: 'Who is bringing the salad?', spawn: { sunbug: 9, filter: 9, itin: 8, screen: 6, rota: 4, mozzie: 6 }, dri: true },
  },
  {
    name: 'Back To Work', spawn: { sunbug: 9, filter: 9, itin: 8, screen: 8, ooo: 5, tides: 5, mozzie: 12, selfie: 1, relapse: 1, monday: 1 }, gap: 0.4,
    surge: { at: 0.3, label: 'The inbox is back', spawn: { sunbug: 10, filter: 10, itin: 8, screen: 8, rota: 4 }, dri: true },
  },
];

const OFFSITE = [
  { name: 'Icebreakers', spawn: { stack: 9, mood: 8, icebreak: 6, breakout: 5, wrongturn: 5, moth: 5 }, gap: 0.5 },
  {
    name: 'Trust Falls', spawn: { stack: 6, merge: 6, mood: 6, fall: 8, breakout: 6, campfire: 5, wrongturn: 4, moth: 8, ropes: 1 }, gap: 0.46,
    surge: { at: 0.5, label: 'Everyone volunteers at once', spawn: { fall: 8, breakout: 6, stack: 6, moth: 5 }, dri: false },
  },
  {
    name: 'Hackathon Night', spawn: { stack: 7, merge: 7, mood: 5, icebreak: 5, campfire: 6, wrongturn: 6, moth: 10, hackathon: 1, bear: 1, slogan: 1 }, gap: 0.42,
    surge: { at: 0.5, label: 'Merge freeze lifted', spawn: { stack: 9, merge: 9, campfire: 7, wrongturn: 6, moth: 6 }, dri: true },
  },
  {
    name: 'Fireside Keynote', spawn: { stack: 7, merge: 7, mood: 7, icebreak: 6, fall: 7, breakout: 6, campfire: 6, wrongturn: 5, moth: 12, retro: 1, keynote: 1, ropes: 1 }, gap: 0.38,
    surge: { at: 0.45, label: 'Q and A is open', spawn: { mood: 9, icebreak: 9, fall: 8, breakout: 8, moth: 6 }, dri: true },
  },
  {
    name: 'Annual Review', spawn: { stack: 9, merge: 9, mood: 8, fall: 8, campfire: 7, wrongturn: 6, moth: 12, bear: 1, slogan: 1, review: 1 }, gap: 0.38,
    surge: { at: 0.3, label: 'Calibration session', spawn: { stack: 10, merge: 10, mood: 9, campfire: 8, breakout: 5 }, dri: true },
  },
];

export const LEVELS = [
  {
    id: 'office', name: 'The Office', blurb: 'Ship the sprint before Demo Day.', perk: 'Classic rules', theme: 'office',
    mods: {}, waves: WAVES, sky: ['#5b678a', '#2f3858'], accent: '#ffb627',
  },
  {
    id: 'staycation', name: 'Staycation', blurb: 'Out of office. Work did not get the memo.', perk: 'Cool box: drinks drop 40% more', theme: 'park',
    mods: { fuelDropMul: 1.4 }, waves: scaleWaves(STAYCATION, [1.2, 1.3, 1.45, 1.55, 1.62]), sky: ['#7fd3ff', '#cdeeff'], accent: '#3ddc84',
  },
  {
    id: 'offsite', name: 'The Offsite', blurb: 'Trust falls, campfires, one long review.', perk: 'Campfire: benched heroes heal twice as fast', theme: 'camp',
    mods: { benchRegen: DEFAULT_MODS.benchRegen * 2 }, waves: scaleWaves(OFFSITE, [1.32, 1.42, 1.56, 1.66, 1.74]), sky: ['#2b2f6b', '#6a4a8c'], accent: '#b28dff', tint: 'rgba(52,34,120,0.2)',
  },
];

export const LEVEL_IDS = LEVELS.map(l => l.id);
export const levelById = id => LEVELS.find(l => l.id === id) || LEVELS[0];
export const levelIndex = id => Math.max(0, LEVEL_IDS.indexOf(id));
