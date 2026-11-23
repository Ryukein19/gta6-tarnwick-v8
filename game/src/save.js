// Saves: three slots in localStorage, each holding the act, the mission, the
// money, the completion and the play time. Nothing here touches the network.

import { MISSIONS, SAVE_KEY } from './config.js';

export const SLOTS = [
  { slot: 1, act: 'ACT IV', label: 'THE CAPTAIN’S CAR', pct: 55, money: 24600, time: '6h 12m' },
  { slot: 2, act: 'ACT II', label: 'STALL MONEY', pct: 24, money: 1840, time: '2h 40m' },
  { slot: 3, act: 'ACT I', label: 'COMING HOME', pct: 8, money: 350, time: '0h 38m' },
];

export function readSaves() {
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (!raw) return SLOTS;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length !== 3) return SLOTS;
    return parsed;
  } catch {
    return SLOTS;
  }
}

export function writeSave(index, save) {
  try {
    const saves = readSaves();
    saves[index] = save;
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(saves));
    return true;
  } catch {
    return false;
  }
}

export function saveFromState(state) {
  const mission = MISSIONS[state.mission - 1];
  return {
    slot: 1,
    act: `ACT ${['I', 'II', 'III', 'IV', 'V'][mission.act - 1] ?? 'I'}`,
    label: mission.name,
    pct: Math.round(55),
    money: state.money,
    time: '6h 12m',
  };
}
