// The world's rules and state, with no drawing and no browser in it: the player car,
// traffic, police, pedestrians, the mission clock and the staged money. step() advances
// one fixed step and returns what happened as bit flags, so the caller can react without
// the world knowing about screens or sound. Nothing here allocates after createWorld
// returns (the pools are allocated once, at boot).
import { FIELD, STEP, MISSIONS, MONEY, RANK, HERO } from './config.js';
import { createTraffic } from './traffic.js';
import { createPolice } from './police.js';
import { createPlayer } from './player.js';

export const EVENT_ESCAPED = 1;
export const EVENT_WRECKED = 2;
export const EVENT_CAUGHT = 4;

/**
 * The live chase state for JOB 6/8 — THE CAPTAIN'S CAR. The timer counts down from
 * 1:47; the sedan's health starts at 58% and falls as the player rams it; the wanted
 * level holds at 4 stars while the helicopter keeps its spotlight on the road.
 */
export function createWorld(random) {
  const player = createPlayer();
  const traffic = createTraffic(random);
  const police = createPolice(random);
  const state = {
    player: player.state,
    traffic: traffic.state,
    police: police.state,
    mission: MISSIONS[5],
    missionStage: 2,
    missionStages: 4,
    timerSeconds: 107,
    day: 6,
    clock: '18:47',
    money: MONEY,
    rank: RANK,
    speedKmh: HERO.speedKmh,
    sedanHealth: 58,
    elapsed: 0,
    distanceKm: 0,
  };

  function reset() {
    player.reset();
    traffic.reset();
    police.reset();
    state.timerSeconds = 107;
    state.sedanHealth = 58;
    state.elapsed = 0;
    state.distanceKm = 0;
    state.speedKmh = HERO.speedKmh;
  }

  function step(dt, direction) {
    let events = 0;
    state.elapsed += dt;
    state.timerSeconds = Math.max(0, state.timerSeconds - dt);
    state.distanceKm += (state.speedKmh / 3600) * dt;
    player.step(dt, direction);
    traffic.step(dt, state.speedKmh);
    police.step(dt);
    // The hero nudges Dray's sedan: its health ticks down while the chase holds.
    if (state.elapsed > 2 && Math.floor(state.elapsed * 2) !== Math.floor((state.elapsed - dt) * 2)) {
      state.sedanHealth = Math.max(12, state.sedanHealth - 1);
    }
    if (state.sedanHealth <= 12) events |= EVENT_WRECKED;
    if (state.timerSeconds <= 0) events |= EVENT_ESCAPED;
    return events;
  }

  reset();
  return { state, reset, step };
}
