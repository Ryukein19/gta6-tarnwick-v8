// Tarnwick v8 — Come Home. Every tuning number, colour, name and story fact in one
// place. The playfield is a fixed 1280x720 logical area; the renderer scales it to the
// window, so no rule below depends on the screen size. Golden hour: the sun is low,
// the sky is orange-pink, the buildings are sun-soaked pastels.

export const FIELD = { width: 1280, height: 720, horizonY: 296, groundY: 720 };

/** The simulation's fixed step, in seconds: 60 updates a second whatever the display's rate. */
export const STEP = 1 / 60;

/** The hero car: Tam's Falcon GT, bright orange, dented, smoking a little. */
export const HERO = {
  name: 'FALCON GT',
  plate: 'TAM-6',
  colour: '#ff7a1a',
  speedKmh: 107,
  condition: 62,
};

export const PLAYER = { width: 190, height: 74, speed: 560 };

export const MONEY = 24600;
export const WANTED_STARS = 4;
export const RANK = { name: 'SHOT CALLER', rp: 840, rpMax: 1200, jobs: 5, jobsMax: 8 };

/** The six districts of Tarnwick, with their turf colours. */
export const DISTRICTS = [
  { name: 'TARNWICK STRAND', turf: 'STRAND CREW', colour: '#f2a541' },
  { name: 'OLD TARNWICK', turf: 'STRAND CREW', colour: '#e8b4b8' },
  { name: 'GLASSWORKS', turf: 'CONTESTED', colour: '#9fc6d8' },
  { name: 'LANTERN MILE', turf: 'STRAND CREW', colour: '#f6c453' },
  { name: 'THE MARINA', turf: 'GREYLINE', colour: '#7fb3d5' },
  { name: 'HARLOW HEIGHTS', turf: 'GREYLINE', colour: '#b08d57' },
];

/** The 8 story jobs, 5-act arc. Act I: jobs 1-2, Act II: 3-4, Act III: 5-6, Act IV: 7, Act V: 8. */
export const MISSIONS = [
  { id: 1, name: 'HOMECOMING', act: 1, objective: 'Drive to the Kovac Garage', location: 'TARNWICK STRAND' },
  { id: 2, name: 'THE GARAGE DEBT', act: 1, objective: 'Repo the Glassworks van', location: 'GLASSWORKS' },
  { id: 3, name: 'STALL MONEY', act: 2, objective: 'Collect protection cash · 2/5', location: 'LANTERN MILE' },
  { id: 4, name: 'LOW TIDE', act: 2, objective: 'Sink the GREYLINE stash boat', location: 'THE MARINA' },
  { id: 5, name: 'PAPER MOON', act: 3, objective: 'Steal the Harlow ledger', location: 'HARLOW HEIGHTS' },
  { id: 6, name: "THE CAPTAIN'S CAR", act: 3, objective: "Wreck Dray's black sedan · SEDAN 58%", location: 'TARNWICK STRAND' },
  { id: 7, name: 'SMOKE ON THE STRAND', act: 4, objective: 'Escape the roadblock', location: 'OLD TARNWICK' },
  { id: 8, name: 'COME HOME', act: 5, objective: 'Bring Tam’s car home', location: 'TARNWICK STRAND' },
];

/** The crew — four members, each with a role and an ability. */
export const CREW = [
  { initials: 'SK', name: 'SENA KOVAC', role: 'runs the Kovac Garage', colour: '#e2574c', ability: 'SWAP PLATES', key: 'Z', abilityRole: 'Driver', cooldown: 'READY' },
  { initials: 'UB', name: 'UNCLE BRAM', role: 'fixer · runs the Strand', colour: '#4a7fb5', ability: 'QUICK FIX', key: 'X', abilityRole: 'Mechanic', cooldown: '12S' },
  { initials: 'DR', name: 'DAX ROOK', role: 'turf captain', colour: '#6a9e4f', ability: 'HARD SHOULDER', key: 'V', abilityRole: 'Muscle', cooldown: '45S' },
  { initials: 'MV', name: 'MAREN VOSS', role: 'repo queen · chop shop', colour: '#9b6bc4', ability: 'EYES OUT', key: 'C', abilityRole: 'Lookout', cooldown: '30S' },
];

/** Tarnwick PD dispatch: 7 named units with distance and tactic. SKUA-3 is the helicopter. */
export const DISPATCH = [
  { unit: 'SKUA-3', tactic: 'SPOTLIGHT', distance: 27, air: true },
  { unit: 'CORMORANT-12', tactic: 'RAMMING', distance: 33, air: false },
  { unit: 'GANNET-21', tactic: 'BOX IN', distance: 44, air: false },
  { unit: 'GULL-7', tactic: 'CLOSING IN', distance: 34, air: false },
  { unit: 'HERON-22', tactic: 'FLANKING', distance: 39, air: false },
  { unit: 'MERLIN-4', tactic: 'PIT MANEUVER', distance: 44, air: false },
  { unit: 'OSPREY-9', tactic: 'ROADBLOCK', distance: 49, air: false },
];

export const TICKER = '▸ GANNET-21 responding · ▸ OSPREY-9 roadblock';

export const WEAPONS = [
  { slot: 1, name: 'FISTS', ammo: '', locked: false },
  { slot: 2, name: '.38', ammo: '60', locked: false },
  { slot: 3, name: 'SMG', ammo: '120', locked: false },
  { slot: 4, name: 'AR-9', ammo: 'LOCKED', locked: true },
  { slot: 5, name: 'RPG', ammo: 'LOCKED', locked: true },
];

export const RADIO = [
  { station: 'WAVE 97.9', show: 'Harbour Lights' },
  { station: 'HARBOUR 101.2', show: 'Low Tide' },
  { station: 'TARNWICK TALK 1210', show: 'The Strand Line' },
];

export const DIALOGUE = {
  chase: {
    name: 'ILYA VANE',
    role: 'GREYLINE lieutenant',
    colour: '#c94f6d',
    line: "Dray's sedan is on the boulevard at sunset. Wreck it — make him walk home.",
  },
  foot: {
    name: 'MAMA ODELLE',
    role: 'market matriarch',
    colour: '#d98e32',
    line: 'Two stalls paid, three to go. The Strand looks after its own, Renn.',
  },
};

export const CAREER = {
  carsStolen: 37,
  copsEscaped: 9,
  kmDriven: 61.4,
  peopleTakenOut: 17,
  longestJumpM: 34,
  progress: 55,
  story: '4/8',
  races: '2/4',
  stunts: '3/8',
  collectibles: '9/20',
  districtJobs: '5/7',
  crew: '3/3',
  nextGoal: 'NEXT GOAL — JOB 6/8 · THE CAPTAIN’S CAR: wreck Dray’s sedan',
  activities: 'ACTIVITIES 2/4 · STREET RACE · DELIVERY · CHOP SHOP · STUNTS',
};

export const SAVES = [
  { slot: 1, act: 'ACT III', progress: 55, money: 24600, time: '18:47' },
  { slot: 2, act: 'ACT II', progress: 31, money: 12400, time: '09:12' },
  { slot: 3, act: 'ACT I', progress: 12, money: 3200, time: '21:05' },
];

export const PALETTE = {
  skyTop: '#ff9a5c',
  skyMid: '#ffb37a',
  skyHorizon: '#ffd9a0',
  sun: '#fff3c4',
  sunCore: '#fffbe8',
  skylineFar: '#e8a37c',
  skylineNear: '#d98f6a',
  buildingCream: '#f2d5a0',
  buildingPeach: '#eeb27f',
  buildingTeal: '#a8c8bd',
  buildingRose: '#e0a08e',
  buildingShade: '#8a5a3c',
  road: '#3d3a38',
  roadEdge: '#c9a86a',
  lane: '#e8d27a',
  sidewalk: '#b99b6b',
  panel: 'rgba(12, 10, 14, 0.88)',
  panelSoft: 'rgba(12, 10, 14, 0.72)',
  gold: '#f2c94c',
  text: '#f5efe4',
  muted: '#c9bda6',
  red: '#e5534b',
  green: '#7fc46a',
  blue: '#6fb3e0',
};

export const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

/** Where the saves are kept between visits (this browser only). */
export const SAVE_KEY = 'tarnwick.v8.saves';
export const BEST_KEY = 'tarnwick.v8.best';
