// Tarnwick v9 — every tuning number, colour and story fact in one place.
// The playfield is a fixed 1280x720 logical area; the three.js camera frames it, and the
// DOM HUD lays over it, so no rule below depends on the window size.

export const FIELD = { width: 1280, height: 720 };

/** The simulation's fixed step, in seconds: 60 updates a second whatever the display's rate. */
export const STEP = 1 / 60;

/** The fixed scene time, in seconds, every screenshot is staged at: shots never move. */
export const SHOT_TIME = 1.5;

/** Golden-hour palette: warm low sun, dark road, lit windows. Never purple dusk. */
export const PALETTE = {
  skyTop: '#2e2450',
  skyMid: '#8a4438',
  skyHorizon: '#ff9a3c',
  sunCore: '#ffd76a',
  sunHalo: '#ffb347',
  road: '#221a15',
  roadLine: '#e8d9a0',
  sidewalk: '#3a2f28',
  buildingWarm: '#b0703a',
  buildingShade: '#5a4460',
  buildingDark: '#3d2f4a',
  windowLit: '#ffcf6e',
  windowDark: '#241a2e',
  carBody: '#2e3238',
  carAccent: '#c9a227',
  tailLight: '#ff2e2e',
  headLight: '#fff3c4',
  heliBody: '#1d2733',
  cone: '#ffffff',
  panel: 'rgba(12, 10, 18, 0.82)',
  panelEdge: '#c9a227',
  text: '#f2ead8',
  muted: '#b8a888',
  gold: '#ffd76a',
  red: '#ff4d4d',
  green: '#7ddb8a',
};

/** Where the best score is kept between visits (this browser only). */
export const BEST_KEY = 'tarnwick.best';

export const STORY = {
  title: 'TARNWICK',
  tagline: 'COME HOME',
  hero: 'Renn Kovacs',
  brother: 'Tam Kovacs',
  sister: 'Sena Kovacs',
  fixer: 'Uncle Bram',
  antagonist: 'Capt. Elias Dray',
  rival: 'GREYLINE',
  car: 'FALCON GT',
  carNote: "Tam's car",
};

export const RADIO = [
  { name: 'WAVE 97.9', line: 'Golden hour on WAVE 97.9 — the harbour never sounded this good.' },
  { name: 'HARBOUR 101.2', line: 'Harbour 101.2 — traffic, tides and the night shift.' },
  { name: 'TARNWICK TALK 1210', line: 'Tarnwick Talk 1210 — call in, the lines are open.' },
];

/** The 8 missions, 5-act arc. Names and order are fixed. */
export const MISSIONS = [
  { act: 'ACT I', name: 'Six Years Gone', status: 'DONE' },
  { act: 'ACT I', name: "Tam's Last Run", status: 'DONE' },
  { act: 'ACT II', name: 'The Harbour Gate', status: 'DONE' },
  { act: 'ACT II', name: 'Sena’s Dead Drop', status: 'DONE' },
  { act: 'ACT III', name: 'Bram’s Fix', status: 'DONE' },
  { act: 'ACT III', name: 'The Long Way Home', status: 'ACTIVE' },
  { act: 'ACT IV', name: 'Greyline Rising', status: 'LOCKED' },
  { act: 'ACT V', name: 'Come Home', status: 'LOCKED' },
];

export const CREW = [
  { initials: 'SK', name: 'Sena Kovacs', role: 'Dead Drop', key: 'Q', cooldown: 'READY', ability: 'DEAD DROP' },
  { initials: 'UB', name: 'Uncle Bram', role: 'Fixer Call', key: 'E', cooldown: '12S', ability: 'FIXER CALL' },
  { initials: 'MV', name: 'Mara Voss', role: 'Lookout', key: 'R', cooldown: '30S', ability: 'LOOKOUT' },
];

export const DISPATCH = [
  { unit: 'UNIT 04', call: 'Harbour', tactic: 'PIT MANEUVER' },
  { unit: 'UNIT 07', call: 'Northside', tactic: 'BOX IN' },
  { unit: 'UNIT 11', call: 'Old Town', tactic: 'ROADBLOCK' },
  { unit: 'UNIT 13', call: 'The Docks', tactic: 'PIT MANEUVER' },
  { unit: 'UNIT 19', call: 'Market Row', tactic: 'BOX IN' },
  { unit: 'UNIT 22', call: 'Greyline', tactic: 'PURSUIT' },
  { unit: 'HELI 1', call: 'Air Support', tactic: 'SPOTLIGHT' },
];

export const WEAPONS = [
  { name: 'AR-9', slots: 3, locked: false },
  { name: 'RPG', slots: 1, locked: true },
  { name: 'PISTOL', slots: 2, locked: false },
];

export const DISTRICTS = [
  { name: 'Harbour', color: '#c9a227', turf: 'KOVACS' },
  { name: 'Old Town', color: '#2e8b8b', turf: 'KOVACS' },
  { name: 'Northside', color: '#7a4a9e', turf: 'GREYLINE' },
  { name: 'The Docks', color: '#b0703a', turf: 'CONTESTED' },
  { name: 'Market Row', color: '#4a7a3a', turf: 'KOVACS' },
];

export const HUD = {
  money: 24600,
  day: 6,
  clock: '18:47',
  timerSeconds: 107,
  rankPoints: 840,
  rankNext: 1200,
  rankName: 'STREET',
  wanted: 3,
  health: 100,
  armour: 65,
};
