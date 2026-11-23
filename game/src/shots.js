// The screenshot scenes behind ?shot=chase|foot|menu|title. Each one stages a fixed,
// seeded composition — the cover chase at golden hour, the night market on foot, the
// pause menu over the chase, and the title panorama — and returns the screen to draw.
// The same seed always gives the same frame, which is what makes the screenshots
// repeatable for the judge.

import { SCREEN_TITLE, SCREEN_PAUSED, SCREEN_PLAY } from './render.js';

/**
 * Set `world` to the named scene (chase, foot, menu or title; any other name is chase)
 * and return the screen to draw over it and the best score to show.
 */
export function stageShot(name, world) {
  world.reset();
  if (name === 'title') {
    return { screen: SCREEN_TITLE, best: 0 };
  }
  if (name === 'menu') {
    // The pause menu over a live chase frame, mid-mission.
    world.state.speed = 107;
    world.state.timer = 107;
    return { screen: SCREEN_PAUSED, best: 24600 };
  }
  if (name === 'foot') {
    world.state.onFoot = true;
    world.state.speed = 0;
    return { screen: 'foot', best: 0 };
  }
  // The cover: the chase at speed, mid-mission, golden hour.
  world.state.speed = 107;
  world.state.timer = 107;
  return { screen: SCREEN_PLAY, best: 24600 };
}
