// Tarnwick v8 — Come Home. Every tuning number, colour, name and line of the
// game's fiction in one place. The playfield is a fixed 1280x720 logical area;
// the renderer scales it to the window, so no rule below depends on screen size.
// Canvas 2D with perspective projection (pseudo-3D): the road converges on a
// vanishing point at the golden-hour horizon.

export const FIELD = { width: 1280, height: 720, horizonY: 300, groundY: 720 };

/** The simulation's fixed step, in seconds: 60 updates a second whatever the display's rate. */
export const STEP = 1 / 60;

/** Golden-hour palette: warm orange-pink sun, pastel buildings, bright sky. */
export const PALETTE = {
  skyTop: '#ff9e6b',
  skyMid: '#ffb98a',
  skyHorizon: '#ffd9a0',
  sun: '#ffdf8a',
  sunGlow: 'rgba(255, 190, 110, 0.55)',
  road: '#4a4238',
  roadEdge: '#c9b48a',
  lane: '#e8d9a8',
  sidewalk: '#8a7a68',
  building: ['#f2c9a0', '#e8b48f', '#cfe0d8', '#f6d9b8', '#d9c2a8', '#eac9c0'],
  buildingDark: ['#b98a68', '#a87a5e', '#9fb8ac', '#c2a284', '#a89078', '#b89a90'],
  windowLit: '#ffe9a8',
  windowDark: '#5a4a3e',
  panel: 'rgba(16, 14, 20, 0.88)',
  panelEdge: '#c9a86a',
  text: '#f4ede2',
  muted: '#cbbfa8',
  gold: '#f2c94c',
  red: '#e5534b',
  green: '#7bc96f',
  blue: '#6fb7d9',
  hero: '#ff7a1a',
  heroDark: '#c24e00',
  police: '#1c2733',
  policeLight: '#dfe9f2',
  night: '#1a2030',
};

/** The six districts of Tarnwick, with their turf colours. */
export const DISTRICTS = [
  { name: 'TARNWICK STRAND', turf: 'Strand crew', color: '#f2c94c' },
  { name: 'OLD TARNWICK', turf: 'Strand crew', color: '#e8b48f' },
  { name: 'GLASSWORKS', turf: 'Contested', color: '#cfe0d8' },
  { name: 'LANTERN MILE', turf: 'Strand crew', color: '#ffb98a' },
  { name: 'THE MARINA', turf: 'GREYLINE', color: '#6fb7d9' },
  { name: 'HARLOW HEIGHTS', turf: 'GREYLINE', color: '#b98a68' },
];

/** The eight story jobs, in five acts. */
export const MISSIONS = [
  { job: 1, act: 1, name: 'THE LONG WAY HOME', stage: 'Return to Tarnwick', objective: 'Drive to the Kovac Garage' },
  { job: 2, act: 1, name: 'FAMILY BUSINESS', stage: 'Meet Sena', objective: 'Collect the repo list from Sena' },
  { job: 3, act: 2, name: 'STALL MONEY', stage: 'Lantern Mile', objective: 'Collect 5 stall debts · 2/5' },
  { job: 4, act: 2, name: 'PAPER TRAIL', stage: 'Glassworks', objective: 'Photograph the GREYLINE ledger' },
  { job: 5, act: 3, name: 'THE SMUGGLER\'S WAKE', stage: 'The Marina', objective: 'Find Tam\'s last route' },
  { job: 6, act: 3, name: 'THE CAPTAIN\'S CAR', stage: 'Tarnwick Strand', objective: 'Wreck Dray\'s black sedan · SEDAN 58%' },
  { job: 7, act: 4, name: 'GREYLINE FALLS', stage: 'Harlow Heights', objective: 'Take the Harlow depot' },
  { job: 8, act: 5, name: 'COME HOME', stage: 'The Strand', objective: 'Bring the Falcon GT home' },
];

/** The crew — Renn's people, left roster panel. */
export const CREW = [
  { initials: 'SK', name: 'SENA KOVAC', role: 'runs the Kovac Garage', color: '#f2c94c' },
  { initials: 'UB', name: 'UNCLE BRAM', role: 'fixer · runs the Strand', color: '#6fb7d9' },
  { initials: 'DR', name: 'DAX ROOK', role: 'turf captain', color: '#e5534b' },
  { initials: 'MV', name: 'MAREN VOSS', role: 'repo queen · chop shop', color: '#7bc96f' },
];

/** Tarnwick PD dispatch units, with distance and tactic. */
export const DISPATCH = [
  { call: 'SKUA-3', tactic: 'SPOTLIGHT', dist: 27, heli: true },
  { call: 'CORMORANT-12', tactic: 'RAMMING', dist: 33 },
  { call: 'GANNET-21', tactic: 'BOX IN', dist: 44 },
  { call: 'GULL-7', tactic: 'CLOSING IN', dist: 34 },
  { call: 'HERON-22', tactic: 'FLANKING', dist: 39 },
  { call: 'MERLIN-4', tactic: 'PIT MANEUVER', dist: 44 },
  { call: 'OSPREY-9', tactic: 'ROADBLOCK', dist: 49 },
];

export const TICKER = 'TARNWICK PD ▸ GANNET-21 responding · OSPREY-9 roadblock';

/** Crew ability cards: portrait, key, live state. */
export const ABILITIES = [
  { name: 'SWAP PLATES', who: 'Sena · Driver', key: 'Z', state: 'READY', color: '#f2c94c', initials: 'SK' },
  { name: 'QUICK FIX', who: 'Bram · Mechanic', key: 'X', state: '12S', color: '#6fb7d9', initials: 'UB' },
  { name: 'EYES OUT', who: 'Maren · Lookout', key: 'C', state: '30S', color: '#7bc96f', initials: 'MV' },
];

export const WEAPONS = [
  { name: 'FISTS', ammo: '' },
  { name: '.38', ammo: '60' },
  { name: 'SMG', ammo: '120' },
  { name: 'AR-9', ammo: 'LOCKED' },
  { name: 'RPG', ammo: 'LOCKED' },
];

export const RADIO = [
  { station: 'WAVE 97.9', show: 'Harbour Lights' },
  { station: 'HARBOUR 101.2', show: 'Low Tide' },
  { station: 'TARNWICK TALK 1210', show: 'The Strand Report' },
];

export const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

/** Where saves are kept between visits (this browser only). */
export const SAVE_KEY = 'tarnwick-v8.saves';
export const BEST_KEY = 'tarnwick-v8.best';
