// Tarnwick v8 — every tuning number, colour, name and line in one place.
// The playfield is a fixed 1280x720 logical area; the renderer scales it to the
// window, so no rule below depends on the screen size. Golden hour: the sun is low
// (~18:40), the light is warm orange-pink, the buildings are sun-soaked pastels.

export const FIELD = { width: 1280, height: 720, horizonY: 330, groundY: 720 };

/** The simulation's fixed step, in seconds: 60 updates a second whatever the display's rate. */
export const STEP = 1 / 60;

/** Where the best score is kept between visits (this browser only). */
export const BEST_KEY = 'tarnwick.best';
export const SAVE_KEY = 'tarnwick.saves';

export const PALETTE = {
  // Golden-hour sky, top to horizon.
  skyTop: '#7fb2d9',
  skyMid: '#f2a56b',
  skyLow: '#ff9a56',
  sun: '#ffd98a',
  sunCore: '#fff3c4',
  // Distant skyline and haze.
  skyline: '#8a5f7a',
  haze: '#f7c9a0',
  // Buildings: sun-soaked pastels, with a shaded side.
  building: ['#f5e6c8', '#f2c9a0', '#a8d8d0', '#e8b4a0', '#f7d774', '#c9d6a8'],
  buildingSide: ['#e8d5ae', '#e8bd8e', '#a8ccc2', '#ddab92', '#e8c96e', '#bcc89e'],
  windowLit: '#ffe9a8',
  windowDark: '#6b4a3a',
  // Road and ground.
  road: '#5a463e',
  roadEdge: '#7a6558',
  sidewalk: '#c9a887',
  lane: '#f2d06b',
  grass: '#8aa86b',
  sand: '#e8d5a8',
  sea: '#5fa8c9',
  // Cars.
  falcon: '#ff6b1a',
  falconDark: '#c94a08',
  cruiser: '#f2f2f2',
  cruiserDark: '#1a1a22',
  sedan: '#2a2a33',
  // HUD.
  panel: '#17120e',
  panelEdge: '#3a2c22',
  text: '#f7f2e8',
  muted: '#c9b8a3',
  gold: '#f2c94c',
  red: '#e5534b',
  blue: '#4fc3f7',
  green: '#7ac74f',
};

export const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

/** The six districts of Tarnwick, with their turf colour on the map. */
export const DISTRICTS = [
  { name: 'TARNWICK STRAND', turf: 'Strand crew', colour: '#f2c94c' },
  { name: 'OLD TARNWICK', turf: 'Strand crew', colour: '#f2c94c' },
  { name: 'GLASSWORKS', turf: 'GREYLINE', colour: '#e5534b' },
  { name: 'LANTERN MILE', turf: 'Contested', colour: '#c9a86b' },
  { name: 'THE MARINA', turf: 'Strand crew', colour: '#4fc3f7' },
  { name: 'HARLOW HEIGHTS', turf: 'GREYLINE', colour: '#e5534b' },
];

/** The eight story jobs across five acts. */
export const MISSIONS = [
  { id: 1, act: 1, name: 'COMING HOME', objective: 'Drive to the Kovac Garage', next: 'Meet Sena at the garage', stage: '1/3' },
  { id: 2, act: 1, name: 'FAMILY BUSINESS', objective: 'Collect the repo list from Maren', next: 'Take the list to Uncle Bram', stage: '2/4' },
  { id: 3, act: 2, name: 'STALL MONEY', objective: 'Collect protection cash at Lantern Mile', next: 'Get the cash to Mama Odelle', stage: '2/5' },
  { id: 4, act: 2, name: 'GREYLINE TAX', objective: 'Steal the GREYLINE courier van', next: 'Lose the tail on Harlow Heights', stage: '3/4' },
  { id: 5, act: 3, name: 'THE LONG WAY', objective: 'Outrun the Strand roadblock', next: 'Reach the Glassworks safehouse', stage: '1/4' },
  { id: 6, act: 4, name: "THE CAPTAIN'S CAR", objective: "Wreck Dray's black sedan · SEDAN 58%", next: 'Leave it smoking on the Strand', stage: '2/4' },
  { id: 7, act: 4, name: 'SMOKE ON THE WATER', objective: 'Sink the GREYLINE boat at the Marina', next: 'Get clear before the harbour locks down', stage: '3/5' },
  { id: 8, act: 5, name: 'THE LAST GOOD LIGHT', objective: 'Face Dray at the Strand at sunset', next: 'Come home', stage: '1/3' },
];

/** The crew — the left roster panel. */
export const CREW = [
  { initials: 'SK', name: 'SENA KOVAC', role: 'runs the Kovac Garage', colour: '#f2c94c' },
  { initials: 'UB', name: 'UNCLE BRAM', role: 'fixer · runs the Strand', colour: '#4fc3f7' },
  { initials: 'DR', name: 'DAX ROOK', role: 'turf captain', colour: '#7ac74f' },
  { initials: 'MV', name: 'MAREN VOSS', role: 'repo queen · chop shop', colour: '#e88bb0' },
];

/** The Tarnwick PD dispatch — seven named units with a tactic each. */
export const DISPATCH = [
  { unit: 'SKUA-3', tactic: 'SPOTLIGHT', dist: 27 },
  { unit: 'CORMORANT-12', tactic: 'RAMMING', dist: 33 },
  { unit: 'GANNET-21', tactic: 'BOX IN', dist: 44 },
  { unit: 'GULL-7', tactic: 'CLOSING IN', dist: 34 },
  { unit: 'HERON-22', tactic: 'FLANKING', dist: 39 },
  { unit: 'MERLIN-4', tactic: 'PIT MANEUVER', dist: 44 },
  { unit: 'OSPREY-9', tactic: 'ROADBLOCK', dist: 49 },
];

export const TICKER = 'TARNWICK PD ▸ GANNET-21 responding / ▸ OSPREY-9 setting roadblock / ▸ Golden hour over Tarnwick Strand';

/** Radio stations and what is playing on each. */
export const RADIO = [
  { freq: 'WAVE 97.9', name: 'Harbour Lights', song: 'Harbour Lights — The Strandlines' },
  { freq: 'HARBOUR 101.2', name: 'Low Tide', song: 'Low Tide — Maren Voss' },
  { freq: 'TARNWICK TALK 1210', name: 'Talk', song: 'Tarnwick Talk — Dray denies the sedan' },
];

/** Weapon slots: the first three held, the last two locked (named). */
export const WEAPONS = [
  { name: 'FISTS', ammo: '', locked: false },
  { name: '.38', ammo: '60', locked: false },
  { name: 'SMG', ammo: '120', locked: false },
  { name: 'AR-9', ammo: 'LOCKED', locked: true },
  { name: 'RPG', ammo: 'LOCKED', locked: true },
];

/** Crew abilities: portrait + key + live state. */
export const ABILITIES = [
  { name: 'SWAP PLATES', who: 'Sena Kovac', key: 'Z', state: 'READY', colour: '#f2c94c', initials: 'SK' },
  { name: 'QUICK FIX', who: 'Uncle Bram', key: 'X', state: '12S', colour: '#4fc3f7', initials: 'UB' },
  { name: 'EYES OUT', who: 'Maren Voss', key: 'C', state: '30S', colour: '#e88bb0', initials: 'MV' },
];

/** The hero car: Tam's Falcon GT. */
export const FALCON = {
  name: 'FALCON GT',
  plate: 'TAM-6',
  topSpeed: 142,
  accel: 46,
  brake: 90,
  steer: 2.6,
  condition: 78,
};

export const PLAYER = { width: 96, height: 34, speed: 560 };

export const LIVES = 3;
export const MONEY_START = 24600;
export const WANTED_START = 4;
export const RANK = { name: 'SHOT CALLER', rp: 840, rpMax: 1200, jobs: 5, jobsMax: 8 };
