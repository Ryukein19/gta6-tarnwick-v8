// Missions: the 8 story jobs in one 5-act arc. Renn Kovacs comes home after six years;
// his brother Tam is dead, the Kovac Garage is about to be seized, the Strand crew is
// down to three — and the fixer who welcomed him home set up the run that killed Tam.
// The cover stages job 6, "THE CAPTAIN'S CAR", with a ticking timer and a day counter.

import { MISSIONS } from './config.js';

/** The mission staged on the cover: job 6, act 3. */
export function coverMission() {
  return MISSIONS[5];
}

/** Look a mission up by number (1–8). */
export function missionByNumber(n) {
  return MISSIONS.find((m) => m.n === n) || MISSIONS[0];
}

/** The act a mission belongs to, as a label. */
export function actLabel(mission) {
  return `ACT ${mission.act}`;
}

/** A countdown string from a remaining-seconds count. */
export function formatTimer(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, '0')}`;
}

/** The mission timer for the cover: 1:47, ticking down. */
export function coverTimerSeconds() {
  return 107;
}

/** Progress through the story, for the pause menu bars. */
export function storyProgress() {
  return { story: '4/8', races: '2/4', stunts: '3/8', collectibles: '9/20', districtJobs: '5/7', crew: '3/3' };
}
