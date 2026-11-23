// The eight story jobs in five acts. "Come Home": Renn Kovacs returns after six
// years; brother Tam died on a smuggling run; sister Sena runs the Kovac Garage;
// fixer Uncle Bram; antagonist Capt. Elias Dray; rival crew GREYLINE. No Rockstar
// names, places or characters anywhere.

import { MISSIONS } from './config.js';

/** Mission by job number (1..8). */
export function missionByJob(job) {
  return MISSIONS.find((m) => m.job === job) ?? MISSIONS[0];
}

/** Act label for a job: "ACT 3/5". */
export function actLabel(job) {
  const m = missionByJob(job);
  return `ACT ${m.act}/5`;
}

/** The five acts, with their jobs, for the pause-menu progress bars. */
export const ACTS = [
  { act: 1, name: 'HOMECOMING', jobs: [1, 2] },
  { act: 2, name: 'DEBTS', jobs: [3, 4] },
  { act: 3, name: 'THE WAKE', jobs: [5, 6] },
  { act: 4, name: 'TAKEDOWN', jobs: [7] },
  { act: 5, name: 'COME HOME', jobs: [8] },
];

/** Progress summary for the pause menu: story jobs done, races, stunts, collectibles. */
export const CAREER = {
  storyDone: 5,
  storyTotal: 8,
  racesDone: 2,
  racesTotal: 4,
  stuntsDone: 3,
  stuntsTotal: 8,
  collectiblesDone: 9,
  collectiblesTotal: 20,
  districtJobsDone: 5,
  districtJobsTotal: 7,
  crewDone: 3,
  crewTotal: 3,
  carsStolen: 37,
  copsEscaped: 9,
  kmDriven: 61.4,
  peopleOut: 17,
  longestJump: 34,
  nextGoal: 'Wreck Dray\'s sedan — JOB 6/8 · THE CAPTAIN\'S CAR',
};
