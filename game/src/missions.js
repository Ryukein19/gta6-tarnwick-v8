// The 8 story jobs and the 5-act arc. Each mission names its act, its objective and
// its district; the cover stages JOB 6/8 — THE CAPTAIN'S CAR — with the timer at 1:47
// and the sedan at 58%. Nothing here draws or touches the browser.
import { MISSIONS } from './config.js';

export const ACT_NAMES = {
  1: 'ACT I — HOMECOMING',
  2: 'ACT II — LOW TIDE',
  3: 'ACT III — PAPER MOON',
  4: 'ACT IV — SMOKE',
  5: 'ACT V — COME HOME',
};

export function missionById(id) {
  return MISSIONS.find((m) => m.id === id) ?? MISSIONS[0];
}

export function actName(act) {
  return ACT_NAMES[act] ?? `ACT ${act}`;
}

/** The mission line for the cover panel: job number, name, stage, objective, next step. */
export function coverMission() {
  const m = MISSIONS[5];
  return {
    job: 'JOB 6/8',
    name: m.name,
    stage: 'STAGE 2/4',
    objective: m.objective,
    next: 'Leave it smoking on the Strand',
    timer: '1:47',
    day: 'DAY 6',
    clock: '18:47',
  };
}

/** The on-foot mission line for the Lantern Mile shot. */
export function footMission() {
  const m = MISSIONS[2];
  return {
    job: 'JOB 3/8',
    name: m.name,
    stage: 'STAGE 1/3',
    objective: m.objective,
    next: 'Three stalls left on the row',
    timer: '4:12',
    day: 'DAY 3',
    clock: '21:05',
  };
}
