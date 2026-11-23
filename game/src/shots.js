// The screenshot staging: the four named shots, each staged at a fixed world time from a fixed
// seed so a re-render is byte-identical. The cover is the chase with the full HUD; on-foot is
// Renn in the night market; the pause menu is the top-down street-grid map; the title is the
// golden-hour street with the parked Falcon GT. The renderer stages the 3D scene and the HUD
// switches to the matching mode; the caller waits a frame, then captures.

import { createWorld } from './world.js';
import { createRandom } from './random.js';
import { SHOT_TIME } from './config.js';
import { setHudMode } from './hud.js';
import { layoutMapLabels } from './map.js';
import { STEP } from './config.js';

export const SHOTS = [
  { name: 'cover', mode: 'cover', label: 'The chase — Falcon GT under the helicopter spotlight' },
  { name: 'foot', mode: 'foot', label: 'On foot — Renn runs the night market' },
  { name: 'menu', mode: 'menu', label: 'Pause — the Tarnwick map' },
  { name: 'title', mode: 'title', label: 'Title — golden hour on Harbour Road' },
];

export function createShots({ renderer, hud }) {
  /** Stage one shot by name. Returns the shot record. */
  function stage(name) {
    const shot = SHOTS.find((s) => s.name === name);
    if (!shot) throw new Error(`unknown shot: ${name}`);
    // A fresh seeded world, stepped to the fixed shot time: the same shot every time.
    const world = createWorld(createRandom(20261124));
    for (let i = 0; i < Math.round(SHOT_TIME / STEP); i += 1) {
      world.step(STEP, 0, 1);
    }
    renderer.stageShot(shot.name, world.state);
    setHudMode(hud, shot.mode);
    if (shot.name === 'menu') layoutMapLabels(hud, renderer.mapCam);
    renderer.draw(world.state);
    return shot;
  }

  /** Stage every shot in order and return the records. */
  function stageAll() {
    return SHOTS.map((shot) => stage(shot.name));
  }

  return { stage, stageAll };
}
