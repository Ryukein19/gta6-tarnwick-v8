// The screenshot scenes behind ?shot=cover|foot|menu|title. Each one stages the real
// world at the fixed shot time — the same seed always gives the same frame — and returns
// the screen to draw and the HUD layout to show. The live game never runs in shot mode.
import { SHOT_TIME } from './config.js';
import { SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE } from './render.js';

/**
 * Stage the named scene and return the screen and the HUD layout.
 * cover: the golden-hour chase. foot: Renn on foot in the street.
 * menu: the pause map. title: the title screen.
 * The world is already reset by the boot; this only fixes the scene time, so the
 * three.js cars built from the boot state and the HUD numbers always agree.
 */
export function stageShot(name, world) {
  world.state.time = SHOT_TIME;
  if (name === 'foot') {
    return { screen: SCREEN_PLAY, hud: 'foot', best: 0 };
  }
  if (name === 'menu') {
    return { screen: SCREEN_PAUSED, hud: 'menu', best: 0 };
  }
  if (name === 'title') {
    return { screen: SCREEN_TITLE, hud: 'title', best: 0 };
  }
  return { screen: SCREEN_PLAY, hud: 'cover', best: 0 };
}
