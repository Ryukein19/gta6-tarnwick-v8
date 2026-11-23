// The eight story jobs across the five-act arc. Each mission knows its act, its
// objective, the line that advances it, and what the next job asks for. The current
// job for the cover is JOB 6/8 — THE CAPTAIN'S CAR.

import { MISSIONS } from './config.js';

export { MISSIONS };

export function missionById(id) {
  return MISSIONS[id - 1];
}

/** The act a mission belongs to, as a Roman numeral for the HUD. */
export function actNumeral(act) {
  return ['I', 'II', 'III', 'IV', 'V'][act - 1] ?? 'I';
}

/** "JOB 6/8" label for a mission id. */
export function jobLabel(id) {
  return `JOB ${id}/8`;
}

/** How far through the story the player is, as a 0..1 fraction. */
export function storyFraction(id) {
  return (id - 1) / MISSIONS.length;
}

/** The next mission after this one, or null after the finale. */
export function nextMission(id) {
  return id < MISSIONS.length ? MISSIONS[id] : null;
}

/** The staged cover mission: JOB 6/8, THE CAPTAIN'S CAR, STAGE 2/4, timer 1:47. */
export const COVER_MISSION = {
  id: 6,
  timer: 107,
  stage: 2,
  stages: 4,
  sedanDamage: 58,
  day: 6,
  clock: '18:47',
  money: 24600,
};

/** The on-foot mission: JOB 3/8, STALL MONEY, Lantern Mile, 2 of 5 collected. */
export const FOOT_MISSION = {
  id: 3,
  collected: 2,
  total: 5,
  day: 3,
  clock: '21:12',
  money: 1840,
};
