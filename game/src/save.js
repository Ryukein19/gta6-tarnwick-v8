// Saves: three slots in localStorage — act, completion %, money and time.
// Storage can be off (private windows); then saves last this visit only.

import { SAVE_KEY } from './config.js';

export function readSaves() {
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (!raw) return defaultSaves();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length !== 3) return defaultSaves();
    return parsed;
  } catch {
    return defaultSaves();
  }
}

export function defaultSaves() {
  return [
    { slot: 1, act: 'ACT 3', pct: 55, money: 24600, time: '18:47', empty: false },
    { slot: 2, act: 'ACT 2', pct: 31, money: 12400, time: '12:20', empty: false },
    { slot: 3, act: '', pct: 0, money: 0, time: '', empty: true },
  ];
}

export function writeSaves(saves) {
  try {
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(saves));
    return true;
  } catch {
    return false;
  }
}

/** Overwrite one slot with the current progress. */
export function saveToSlot(slot, act, pct, money, time) {
  const saves = readSaves();
  saves[slot - 1] = { slot, act, pct, money, time, empty: false };
  return writeSaves(saves);
}
