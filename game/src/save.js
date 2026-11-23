// Saves: three slots in localStorage. Each slot holds the act, the completion percent,
// the money and the clock — exactly what the title screen and the pause menu show.
// Storage can be off (private windows): the game then keeps the slots for the visit only.

import { SAVE_KEY, SAVES } from './config.js';

let memorySaves = null;

/** Read the three slots (seeded from the staged career when nothing is stored yet). */
export function readSaves() {
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length === 3) return parsed;
    }
  } catch {
    // Fall through to the seeded slots.
  }
  if (memorySaves) return memorySaves;
  memorySaves = SAVES.map((s) => ({ ...s }));
  return memorySaves;
}

/** Write the three slots. */
export function writeSaves(slots) {
  memorySaves = slots.map((s) => ({ ...s }));
  try {
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(memorySaves));
  } catch {
    // Private windows: memory only.
  }
}

/** Overwrite one slot with the current career state. */
export function saveToSlot(slot, act, complete, money, time) {
  const slots = readSaves();
  slots[slot - 1] = { slot, act, complete, money, time };
  writeSaves(slots);
  return slots;
}
