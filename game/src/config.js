// Every tuning number, colour and story fact in one place. Tarnwick v10 ("v9-fixed") is a
// BRIGHT golden-hour chase: warm orange sky, light road, light buildings, a BRIGHT ORANGE hero
// car and a WHITE helicopter. Nothing important is allowed to render black — the lights in
// render.js carry a strong fill from the camera so the car and heli stay readable at 300px.

export const FIELD = { width: 1280, height: 720 };
export const STEP = 1 / 60;
export const BEST_KEY = 'tarnwick.best';

// The shot clock: every staged screenshot is taken at this fixed world time, so re-renders
// are byte-identical.
export const SHOT_TIME = 1.5;

export const GAME = {
  money: 24600,
  stars: 4,
  wanted: 'IN SIGHT',
  timerSeconds: 107, // 1:47
  day: 6,
  clock: '18:47',
  rank: 840,
  rankMax: 1200,
  rankTitle: 'STREET',
  health: 100,
  armour: 65,
  speedKmh: 111,
  carName: 'FALCON GT',
  carCondition: 100,
  mission: 'THE LONG WAY HOME',
  missionAct: 'ACT IV — THE LONG WAY HOME',
  plate: 'TAM-6',
};

export const CREW = [
  { name: 'RENN KOVACS', role: 'DRIVER · YOU', color: '#ff6a00', initial: 'RK' },
  { name: 'SENA KOVACS', role: 'SISTER · LOOKOUT', color: '#e5488a', initial: 'SK' },
  { name: 'UNCLE BRAM', role: 'FIXER', color: '#4a90d9', initial: 'UB' },
  { name: 'MAMA ODELLE', role: 'MARKET · FENCE', color: '#3aa88f', initial: 'MO' },
];

export const ABILITIES = [
  { key: 'SK', name: 'DEAD DROP', keyCap: 'Q', state: 'READY', stateClass: 'ready' },
  { key: 'UB', name: 'FIXER CALL', keyCap: 'E', state: '12S', stateClass: 'cool' },
  { key: 'MV', name: 'LOOKOUT', keyCap: 'R', state: '30S', stateClass: 'cool' },
];

export const DISPATCH = [
  { unit: 'CONDOR-1', tactic: 'AIR SPOTLIGHT OVERHEAD' },
  { unit: 'SIERRA-12', tactic: 'RAM' },
  { unit: 'TANGO-7', tactic: 'PURSUE' },
  { unit: 'SIERRA-04', tactic: 'PIT MANEUVER' },
  { unit: 'VICTOR-9', tactic: 'BOX IN' },
  { unit: 'KILO-2', tactic: 'ROADBLOCK HARBOUR' },
  { unit: 'ECHO-5', tactic: 'CORDON MARKET ROW' },
];

export const WEAPONS = [
  { slot: 1, name: 'FISTS', ammo: '—', locked: false },
  { slot: 2, name: '.38', ammo: '60', locked: false },
  { slot: 3, name: 'SMG', ammo: '120', locked: false },
  { slot: 4, name: 'AR-9', ammo: 'LOCKED', locked: true },
  { slot: 5, name: 'RPG', ammo: 'LOCKED', locked: true },
];

export const MISSIONS = [
  { act: 'ACT I', name: 'HOMECOMING', state: 'DONE' },
  { act: 'ACT I', name: 'THE FALCON GT', state: 'DONE' },
  { act: 'ACT II', name: 'HARBOUR LIGHTS', state: 'DONE' },
  { act: 'ACT III', name: 'GREYLINE DEBT', state: 'DONE' },
  { act: 'ACT IV', name: 'THE LONG WAY HOME', state: 'ACTIVE' },
  { act: 'ACT IV', name: 'DRAY’S NET', state: 'LOCKED' },
  { act: 'ACT V', name: 'SAFEHOUSE', state: 'LOCKED' },
  { act: 'ACT V', name: 'COME HOME', state: 'LOCKED' },
];

export const DISTRICTS = [
  { name: 'NORTHSIDE', owner: 'GREYLINE', color: '#8a7f8a' },
  { name: 'OLD TOWN', owner: 'KOVACS', color: '#f2c94c' },
  { name: 'MARKET ROW', owner: 'KOVACS', color: '#3aa88f' },
  { name: 'HARBOUR', owner: 'KOVACS', color: '#4a90d9' },
  { name: 'THE DOCKS', owner: 'CONTESTED', color: '#e5484d' },
];

export const RADIO = [
  { station: 'WAVE 97.9', line: 'Golden hour on WAVE 97.9 — Tarnwick’s own' },
  { station: 'HARBOUR 101.2', line: 'Harbour 101.2 — the docks never sleep' },
  { station: 'TALK 1210', line: 'Tarnwick Talk 1210 — who killed Tam Kovacs?' },
];

export const DIALOGUE = {
  cover: { who: 'SENA', text: 'Renn, the harbour gate closes at midnight. Don’t stop for anyone.' },
  foot: { who: 'MAMA ODELLE', text: 'The heli can’t follow you through the market, boy. Run the stalls.' },
};

// BRIGHT golden-hour palette. The road is a warm mid-grey (never black), the buildings are light
// tan/peach/cream, the sky is orange-pink at the horizon to soft blue above.
export const PALETTE = {
  skyTop: '#6fb7e8',
  skyMid: '#ffb38a',
  skyHorizon: '#ff8c42',
  fog: '#ffbe8e',
  sunCore: '#fff3c4',
  sunHalo: '#ffcf7d',
  road: '#7a7268',
  roadEdge: '#f7ead0',
  sidewalk: '#cbb89a',
  ground: '#b99a72',
  buildingTan: '#f2d8a7',
  buildingPeach: '#e8b48a',
  buildingBrick: '#d98a6a',
  buildingSage: '#a8c8b8',
  buildingCream: '#f7e8c8',
  windowLit: '#ffd76a',
  windowDark: '#5a4a3a',
  carOrange: '#ff6a00',
  carGold: '#f2c94c',
  heliWhite: '#e8ecef',
  heliGrey: '#c8ccd0',
  policeWhite: '#f2f2f2',
  policeBlack: '#2a2e33',
  trafficRed: '#e5484d',
  trafficBlue: '#4a90d9',
  trafficYellow: '#f2c94c',
  trafficTeal: '#3aa88f',
  trafficWhite: '#f2f2f2',
  awningRed: '#d94f3d',
  awningCream: '#f7e8c8',
  text: '#f5efe4',
  muted: '#cbb89a',
  gold: '#f2c94c',
};

export const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';
