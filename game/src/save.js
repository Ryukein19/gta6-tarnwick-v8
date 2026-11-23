// Saves: three slots in localStorage, each holding an act, a progress %, money and a
// clock time. Reads and writes are guarded — private windows and headless runs can
// refuse storage, and the game must keep working when they do.
import { SAVE_KEY, SAVES } from './config.js';

export function readSaves() {
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (raw === null) return SAVES.map((s) => ({ ...s }));
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length !== 3) return SAVES.map((s) => ({ ...s }));
    return parsed;
  } catch {
    return SAVES.map((s) => ({ ...s }));
  }
}

export function writeSaves(saves) {
  try {
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(saves));
    return true;
  } catch {
    return false;
  }
}

export function writeSaveSlot(slot, save) {
  const saves = readSaves();
  saves[slot - 1] = { slot, ...save };
  return writeSaves(saves);
}
