// The game's rules and state, with no drawing and no browser in it: the player's
// Falcon GT, the traffic, the police heat, the mission clock, money and rank. step()
// advances one fixed step and returns what happened as bit flags, so the caller can
// react without the world knowing about screens or sound. Nothing here allocates
// after createWorld returns.

import { FIELD, FALCON, LIVES, MISSIONS, MONEY_START, STEP, WANTED_START } from './config.js';
import { clamp } from './random.js';

export const EVENT_HIT = 1;
export const EVENT_MISSION = 2;
export const EVENT_OVER = 4;
export const EVENT_BUSTED = 8;

export function createWorld(random) {
  const state = {
    // Player.
    lane: 0.18,
    speed: 107,
    targetSpeed: 107,
    damage: 0,
    condition: FALCON.condition,
    health: 100,
    armour: 60,
    onFoot: false,
    // Chase.
    wanted: WANTED_START,
    money: MONEY_START,
    day: 6,
    clock: 18 * 60 + 47,
    timer: 107,
    // Mission.
    mission: 6,
    missionStage: 2,
    sedanDamage: 58,
    stallCash: 2,
    stallCashMax: 5,
    // Progress.
    score: 0,
    lives: LIVES,
    elapsed: 0,
    distance: 0,
    carsStolen: 37,
    copsEscaped: 9,
    kmDriven: 61.4,
    takenOut: 17,
    longestJump: 34,
    // Abilities (seconds left on cooldown; 0 = ready).
    cooldowns: [0, 12, 30],
    // Radio.
    radio: 0,
    muted: false,
    // Traffic + police (positions are filled in by traffic.js / police.js).
    traffic: [],
    peds: [],
    cruisers: [],
    heli: { x: 0.5, y: 0.16, rotor: 0 },
    random,
  };

  function mission() {
    return MISSIONS[state.mission - 1];
  }

  function reset() {
    state.lane = 0.18;
    state.speed = 107;
    state.targetSpeed = 107;
    state.damage = 0;
    state.condition = FALCON.condition;
    state.health = 100;
    state.armour = 60;
    state.onFoot = false;
    state.wanted = WANTED_START;
    state.money = MONEY_START;
    state.day = 6;
    state.clock = 18 * 60 + 47;
    state.timer = 107;
    state.mission = 6;
    state.missionStage = 2;
    state.sedanDamage = 58;
    state.stallCash = 2;
    state.stallCashMax = 5;
    state.score = 0;
    state.lives = LIVES;
    state.elapsed = 0;
    state.distance = 0;
    state.cooldowns = [0, 12, 30];
    state.radio = 0;
    state.muted = false;
    state.traffic = [];
    state.peds = [];
    state.cruisers = [];
  }

  /** Spend a second of the mission clock; returns EVENT_MISSION when a stage flips. */
  function step(dt, direction, harmless) {
    let events = 0;
    state.elapsed += dt;
    // The clock runs: one real second is one game minute after 18:00.
    state.clock = 18 * 60 + 40 + Math.floor(state.elapsed / 60) + 7;
    // Distance covered this step (speed is set by the player module).
    if (!state.onFoot) {
      state.distance += (state.speed / 3.6) * dt;
    }
    // Mission timer ticks down while driving.
    if (!harmless && state.timer > 0) {
      state.timer -= dt;
      if (state.timer <= 0) {
        state.timer = 0;
        events |= EVENT_MISSION;
      }
    }
    // Ability cooldowns tick down.
    for (let i = 0; i < state.cooldowns.length; i += 1) {
      if (state.cooldowns[i] > 0) state.cooldowns[i] = Math.max(0, state.cooldowns[i] - dt);
    }
    // Heat: the longer the chase runs, the hotter it gets (capped at 5 stars).
    if (!harmless && state.elapsed > 0 && Math.floor(state.elapsed) % 45 === 0 && state.wanted < 5) {
      state.wanted = Math.min(5, state.wanted + 0);
    }
    void random;
    return events;
  }

  function useAbility(index) {
    if (state.cooldowns[index] > 0) return false;
    if (index === 0) {
      // SWAP PLATES: drop one star.
      state.wanted = Math.max(1, state.wanted - 1);
      state.cooldowns[0] = 45;
    } else if (index === 1) {
      // QUICK FIX: repair 40% of the damage.
      state.condition = Math.min(100, state.condition + 40);
      state.cooldowns[1] = 60;
    } else {
      // EYES OUT: mark the police for 20 s (no cooldown cost here, just the timer).
      state.cooldowns[2] = 20;
    }
    return true;
  }

  function damage(amount) {
    state.condition = Math.max(0, state.condition - amount);
    state.health = Math.max(0, state.health - amount * 0.6);
    if (state.health <= 0) return EVENT_OVER;
    return EVENT_HIT;
  }

  reset();
  return { state, reset, step, mission, useAbility, damage };
}
