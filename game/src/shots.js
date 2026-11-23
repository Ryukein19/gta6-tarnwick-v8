// The screenshot scenes behind ?shot=chase|foot|menu|title. Each one sets the world to
// the staged composition — the cover chase, the Lantern Mile market on foot, the pause
// menu over the chase, the title panorama — and returns the screen to draw over it.
// The world is stepped forward a little first so the traffic, the pedestrians and the
// helicopter sit in natural positions and the same seed always gives the same frame.
import { STEP } from './config.js';
import { SCREEN_CHASE, SCREEN_FOOT, SCREEN_MENU, SCREEN_TITLE } from './render.js';

const SETTLE_STEPS = 60;

/** Set `world` to the named scene and return the screen to draw over it. */
export function stageShot(name, world) {
  world.reset();
  // Let the chase settle: traffic drifts in, the helicopter circles into place.
  for (let i = 0; i < SETTLE_STEPS; i += 1) world.step(STEP, 0);
  // The settle ticks the clock down: restore the staged values for the frame.
  world.state.timerSeconds = 107;
  world.state.sedanHealth = 58;
  if (name === 'foot') {
    world.state.player.onFoot = true;
    return { screen: SCREEN_FOOT };
  }
  if (name === 'menu') return { screen: SCREEN_MENU };
  if (name === 'title') return { screen: SCREEN_TITLE };
  return { screen: SCREEN_CHASE };
}
