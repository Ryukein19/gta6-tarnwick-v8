// Tarnwick v8 — every tuning number, colour and piece of story data in one place.
// The playfield is a fixed 1280x720 logical area; the renderer scales it to the window,
// so no rule below depends on the screen size. Golden hour, not purple dusk: the sun is
// low (~18:40), the sky is warm orange-pink, the buildings are sun-soaked pastels.

export const FIELD = { width: 1280, height: 720, horizonY: 296 };

/** The simulation's fixed step, in seconds: 60 updates a second whatever the display rate. */
export const STEP = 1 / 60;

export const PLAYER = { speed: 560, accel: 900, brake: 1400, maxSpeed: 320 };

/** Golden-hour palette. HUD panels sit on near-black at opacity >= 0.8 so text stays
 * legible over the bright sky; the scene itself is warm and bright. */
export const PALETTE = {
  skyTop: '#7a5a8c',
  skyMid: '#e8907a',
  skyLow: '#ffb36b',
  sunCore: '#fff3c4',
  sunGlow: '#ff9d5c',
  buildingCream: '#f2d8a8',
  buildingPeach: '#e8a87c',
  buildingTeal: '#9fc4b8',
  buildingRose: '#d98a7a',
  buildingShadow: '#8a6a72',
  windowLit: '#ffd97a',
  windowDark: '#5a4a5e',
  road: '#3a3a44',
  roadEdge: '#c8b8a0',
  lane: '#e8d8a0',
  sidewalk: '#b8a888',
  carHero: '#ff7a1a',
  carHeroDark: '#c85a10',
  carPolice: '#1a2a4a',
  carPoliceLight: '#ff3b30',
  carSedan: '#1c1c22',
  heli: '#2a3442',
  panel: 'rgba(12, 14, 24, 0.88)',
  panelEdge: 'rgba(255, 190, 90, 0.55)',
  text: '#f4ede0',
  muted: '#b8a890',
  gold: '#f2c94c',
  red: '#ff5a4a',
  green: '#7ad98a',
  blue: '#6ab8ff',
};

/** Where the best score is kept between visits (this browser only). */
export const BEST_KEY = 'tarnwick.best';
export const SAVE_KEY = 'tarnwick.saves.v8';

/** The six districts and who holds them. Turf colours are the map's language. */
export const DISTRICTS = [
  { name: 'TARNWICK STRAND', turf: 'strand', colour: '#f2c94c', x: 0.42, y: 0.55 },
  { name: 'OLD TARNWICK', turf: 'strand', colour: '#f2c94c', x: 0.30, y: 0.38 },
  { name: 'GLASSWORKS', turf: 'contested', colour: '#e8907a', x: 0.62, y: 0.34 },
  { name: 'LANTERN MILE', turf: 'contested', colour: '#e8907a', x: 0.24, y: 0.66 },
  { name: 'THE MARINA', turf: 'dray', colour: '#6ab8ff', x: 0.70, y: 0.62 },
  { name: 'HARLOW HEIGHTS', turf: 'dray', colour: '#6ab8ff', x: 0.58, y: 0.74 },
];

/** The crew. Initials, name, role, colour — the roster panel and the ability portraits. */
export const CREW = [
  { initials: 'SK', name: 'SENA KOVAC', role: 'runs the Kovac Garage', colour: '#ff8a5c', job: 'Driver' },
  { initials: 'UB', name: 'UNCLE BRAM', role: 'fixer · runs the Strand', colour: '#f2c94c', job: 'Mechanic' },
  { initials: 'DR', name: 'DAX ROOK', role: 'turf captain', colour: '#7ad98a', job: 'Muscle' },
  { initials: 'MV', name: 'MAREN VOSS', role: 'repo queen · chop shop', colour: '#c98af2', job: 'Lookout' },
];

/** The 8 story jobs, one 5-act arc. Only the staged ones are drawn in full. */
export const MISSIONS = [
  { n: 1, name: 'COMING HOME', act: 1, stage: '1/8', objective: 'Drive Tam\u2019s Falcon GT to the Kovac Garage', next: 'Meet Sena at the garage' },
  { n: 2, name: 'FIRST WHEELS', act: 1, stage: '2/8', objective: 'Steal a car for the crew', next: 'Bring it back in one piece' },
  { n: 3, name: 'STALL MONEY', act: 2, stage: '3/8', objective: 'Collect protection money on Lantern Mile', next: 'Mama Odelle is waiting' },
  { n: 4, name: 'GREYLINE TAX', act: 2, stage: '4/8', objective: 'Hit a GREYLINE stash house', next: 'Do not get caught' },
  { n: 5, name: 'THE SETUP', act: 3, stage: '5/8', objective: 'Run a job for Uncle Bram', next: 'Something feels wrong' },
  { n: 6, name: 'THE CAPTAIN\u2019S CAR', act: 3, stage: '6/8', objective: 'Wreck Dray\u2019s black sedan · SEDAN 58%', next: 'Leave it smoking on the Strand', timer: '1:47', day: 6 },
  { n: 7, name: 'FRAMED', act: 4, stage: '7/8', objective: 'Outrun the whole of Tarnwick PD', next: 'Get out of the Strand alive' },
  { n: 8, name: 'TAKE THE STRAND BACK', act: 5, stage: '8/8', objective: 'End Dray at sunset on the Strand', next: 'Come home' },
];

/** Tarnwick PD dispatch: 7 named units, distance and tactic — the chase's proof. */
export const DISPATCH = [
  { unit: 'SKUA-3', tactic: 'SPOTLIGHT', dist: 27 },
  { unit: 'CORMORANT-12', tactic: 'RAMMING', dist: 33 },
  { unit: 'GANNET-21', tactic: 'BOX IN', dist: 44 },
  { unit: 'GULL-7', tactic: 'CLOSING IN', dist: 34 },
  { unit: 'HERON-22', tactic: 'FLANKING', dist: 39 },
  { unit: 'MERLIN-4', tactic: 'PIT MANEUVER', dist: 44 },
  { unit: 'OSPREY-9', tactic: 'ROADBLOCK', dist: 49 },
];

export const TICKER = 'TARNWICK PD \u25B8 GANNET-21 responding / \u25B8 OSPREY-9 setting roadblock / \u25B8 Golden hour over Tarnwick Strand';

/** Crew abilities: portrait colour, key, live cooldown. */
export const ABILITIES = [
  { name: 'SWAP PLATES', who: 'Sena · Driver', key: 'Z', state: 'READY', colour: '#ff8a5c', desc: 'drop 1 star' },
  { name: 'QUICK FIX', who: 'Uncle Bram · Mechanic', key: 'X', state: '12S', colour: '#f2c94c', desc: 'repair 40%' },
  { name: 'EYES OUT', who: 'Maren · Lookout', key: 'C', state: '30S', colour: '#c98af2', desc: 'mark police 20s' },
];

/** Weapon slots: three held, two named-locked (progression signal). */
export const WEAPONS = [
  { slot: 1, name: 'FISTS', ammo: '', locked: false },
  { slot: 2, name: '.38', ammo: '60', locked: false },
  { slot: 3, name: 'SMG', ammo: '120', locked: false },
  { slot: 4, name: 'AR-9', ammo: 'LOCKED', locked: true },
  { slot: 5, name: 'RPG', ammo: 'LOCKED', locked: true },
];

/** Radio: three stations, all Tarnwick's own. No Rockstar names anywhere. */
export const RADIO = [
  { freq: 'WAVE 97.9', show: 'Harbour Lights', genre: 'Island Pop' },
  { freq: 'HARBOUR 101.2', show: 'Low Tide', genre: 'Late Soul' },
  { freq: 'TARNWICK TALK 1210', show: 'The Strand Line', genre: 'Talk' },
];

/** Career numbers shown on the pause menu — the same game, the same save. */
export const CAREER = {
  complete: 55,
  story: '4/8', races: '2/4', stunts: '3/8', collectibles: '9/20', districtJobs: '5/7', crew: '3/3',
  carsStolen: 37, copsEscaped: 9, kmDriven: 61.4, peopleOut: 17, longestJump: 34,
  nextGoal: 'JOB 6/8 · THE CAPTAIN\u2019S CAR — wreck Dray\u2019s sedan on the Strand',
  activities: 'ACTIVITIES 2/4 · STREET RACE · DELIVERY · CHOP SHOP · STUNTS',
};

export const SAVES = [
  { slot: 1, act: 'ACT 3', complete: '55%', money: '$24,600', time: '18:40' },
  { slot: 2, act: 'ACT 2', complete: '31%', money: '$8,200', time: '11:15' },
  { slot: 3, act: 'ACT 1', complete: '12%', money: '$1,450', time: '09:02' },
];

export const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';
export const FONT_COND = '"Arial Narrow", "Helvetica Neue Condensed", system-ui, sans-serif';
