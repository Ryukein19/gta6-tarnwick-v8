// The screenshot scenes behind ?shot=chase|foot|menu|title. Each one sets the world
// to a fixed, staged state — the same seed always gives the same frame — so the four
// screenshots each prove a different system: the chase cover, the on-foot market,
// the pause menu, the title screen.

import { SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE } from './render.js';
import { FOOT_MISSION } from './missions.js';

/**
 * Set `world` to the named scene and return the screen to draw over it and the best
 * score to show. Names: chase (the cover), foot (Lantern Mile on foot), menu (pause
 * with the full map), title (the title screen). Any other name is the cover.
 */
export function stageShot(name, world, city, traffic) {
  const state = world.state;
  state.shot = name;
  if (name === 'foot') {
    // JOB 3/8 · STALL MONEY, Lantern Mile night market, on foot.
    state.mission = 3;
    state.missionStage = 2;
    state.stallCash = FOOT_MISSION.collected;
    state.stallCashMax = FOOT_MISSION.total;
    state.day = FOOT_MISSION.day;
    state.money = FOOT_MISSION.money;
    state.onFoot = true;
    state.speed = 0;
    state.elapsed = 4;
    return { screen: SCREEN_PLAY, best: 0 };
  }
  if (name === 'menu') {
    // Pause menu over the chase: the map, the stats, the saves, the activities.
    state.mission = 6;
    state.missionStage = 2;
    state.elapsed = 12;
    return { screen: SCREEN_PAUSED, best: 24600 };
  }
  if (name === 'title') {
    state.elapsed = 2;
    return { screen: SCREEN_TITLE, best: 24600 };
  }
  // The cover chase: JOB 6/8 · THE CAPTAIN'S CAR, timer 1:47, DAY 6, 18:47,
  // $24,600, 107 KM/H, four stars, the helicopter and the spotlight.
  state.mission = 6;
  state.missionStage = 2;
  state.timer = 107;
  state.day = 6;
  state.clock = 18 * 60 + 47;
  state.money = 24600;
  state.speed = 107;
  state.targetSpeed = 107;
  state.wanted = 4;
  state.condition = 78;
  state.health = 100;
  state.armour = 60;
  state.elapsed = 8;
  state.lane = 0.18;
  state.cooldowns = [0, 12, 30];
  void city;
  void traffic;
  return { screen: SCREEN_PLAY, best: 24600 };
}
