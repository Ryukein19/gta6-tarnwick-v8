// The screenshot scenes behind ?shot=chase|foot|menu|title. Each one sets the
// world to a fixed, deterministic state — the cover chase, the Lantern Mile
// market on foot, the pause menu, the title screen — so the same seed always
// gives the same frame. The scenes are what a real session looks like: the
// chase plays the rules forward a few seconds with an autopilot holding the
// lane, the others stage their panels directly.

import { STEP } from './config.js';
import { LINES } from './dialogue.js';
import { SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE } from './render.js';
import { stepPlayer } from './player.js';

const CHASE_SECONDS = 6;

/** Set `world` to the named scene and return the screen to draw over it. */
export function stageShot(name, world) {
  const state = world.state;
  world.reset();
  if (name === 'foot') {
    state.mode = 'foot';
    state.mission = { job: 3, act: 2, name: 'STALL MONEY', stage: 'Lantern Mile', objective: 'Collect 5 stall debts · 2/5' };
    state.missionStage = 1;
    state.missionStages = 3;
    state.timer = 151; // 2:31
    state.day = 3;
    state.clock = '21:12';
    state.dialogue = LINES.odelle;
    state.player.onFoot = true;
    state.speed = 0;
    return { screen: SCREEN_PLAY };
  }
  if (name === 'menu') {
    state.mode = 'chase';
    for (let i = 0; i < CHASE_SECONDS / STEP; i += 1) {
      world.step(STEP, 0, true);
      stepPlayer(state.player, 0, false, STEP);
    }
    return { screen: SCREEN_PAUSED };
  }
  if (name === 'title') {
    state.mode = 'chase';
    return { screen: SCREEN_TITLE };
  }
  // Default: the cover chase (JOB 6/8, golden hour, helicopter overhead).
  state.mode = 'chase';
  state.dialogue = LINES.ilya;
  // Stage a burning wreck on the left, mid-distance — the dramatic beat.
  state.traffic[0] = { t: 0.45, lane: -0.55, color: '#3a3a3a', kind: 'wreck', speed: 1 };
  state.traffic[1] = { t: 0.55, lane: 0.62, color: '#22303e', kind: 'cruiser', speed: 1.1 };
  for (let i = 0; i < CHASE_SECONDS / STEP; i += 1) {
    const dir = Math.sin(i * STEP * 0.5) > 0 ? 1 : -1;
    world.step(STEP, dir * 0.2, false);
    stepPlayer(state.player, dir * 0.2, false, STEP);
  }
  state.speed = 112;
  state.timer = 107; // 1:47
  return { screen: SCREEN_PLAY };
}
