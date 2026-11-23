// The game's rules and state, with no drawing and no browser in it: the player's Falcon
// GT, the traffic ahead, the police chase, the helicopter, the mission clock and the
// money. step() advances one fixed step and returns what happened as bit flags, so the
// caller can react without the world knowing about screens or sound. Nothing here
// allocates after createWorld returns.

import { FIELD, STEP, PLAYER, MISSIONS } from './config.js';
import { createRandom } from './random.js';
import { VEHICLES } from './vehicles.js';

export const EVENT_BOUNTY = 1;
export const EVENT_BUSTED = 2;
export const EVENT_JOB_DONE = 4;

const TRAFFIC_MODELS = [VEHICLES.coupe, VEHICLES.pickup, VEHICLES.taxi, VEHICLES.sedan];

/** A traffic car: its model, its lane (-1..1) and its depth (0 = near, 1 = horizon). */
function makeTraffic(random, depth) {
  return {
    model: TRAFFIC_MODELS[Math.floor(random.next() * TRAFFIC_MODELS.length)],
    lateral: random.range(-0.38, 0.38),
    depth,
    police: false,
    speed: random.range(0.5, 0.9),
  };
}

export function createWorld(random) {
  const state = {
    // The player: the Falcon GT, its speed and its position on the road.
    speed: 0,
    maxSpeed: PLAYER.maxSpeed,
    lateral: 0.08,
    damage: 0.22,
    money: 24600,
    wanted: 4,
    // The mission clock (job 6) and the day.
    timer: 107,
    day: 6,
    mission: MISSIONS[5],
    // The chase: two cruisers flanking, the helicopter overhead.
    helicopter: { x: 0.52, y: 0.16, span: 0.20 },
    cruisers: [
      { lateral: -0.30, depth: 0.62 },
      { lateral: 0.38, depth: 0.68 },
    ],
    traffic: [],
    pedestrians: [],
    elapsed: 0,
    onFoot: false,
    jobDone: false,
  };

  function reset() {
    state.speed = 0;
    state.lateral = 0.08;
    state.damage = 0.22;
    state.money = 24600;
    state.wanted = 4;
    state.timer = 107;
    state.day = 6;
    state.mission = MISSIONS[5];
    state.elapsed = 0;
    state.onFoot = false;
    state.jobDone = false;
    state.traffic = [];
    for (let i = 0; i < 5; i += 1) {
      state.traffic.push(makeTraffic(random, 0.5 + i * 0.09));
    }
    state.cruisers = [
      { lateral: -0.30, depth: 0.62 },
      { lateral: 0.38, depth: 0.68 },
    ];
  }

  /**
   * One fixed step. `direction` is -1, 0 or 1 (left, still, right); `throttle` is 0..1.
   * The road scrolls: traffic drifts toward the camera, the timer ticks down, and the
   * helicopter holds its station over the road ahead.
   */
  function step(dt, direction, throttle) {
    let events = 0;
    state.elapsed += dt;
    state.timer = Math.max(0, state.timer - dt);
    // Steering and speed.
    state.lateral = Math.max(-0.42, Math.min(0.42, state.lateral + direction * 0.55 * dt));
    const target = state.maxSpeed * throttle;
    if (target > state.speed) state.speed = Math.min(target, state.speed + PLAYER.accel * dt);
    else state.speed = Math.max(target, state.speed - PLAYER.brake * dt);
    // Traffic drifts toward the camera as the player advances.
    const flow = (state.speed / state.maxSpeed) * 0.12 * dt;
    for (const car of state.traffic) {
      car.depth -= flow * car.speed;
      if (car.depth < 0.05) {
        car.depth = 0.92;
        car.lateral = random.range(-0.38, 0.38);
        car.model = TRAFFIC_MODELS[Math.floor(random.next() * TRAFFIC_MODELS.length)];
      }
    }
    // Cruisers weave a little.
    state.cruisers[0].lateral = -0.30 + Math.sin(state.elapsed * 0.7) * 0.05;
    state.cruisers[1].lateral = 0.38 + Math.cos(state.elapsed * 0.55) * 0.05;
    // The helicopter bobs gently and holds over the road.
    state.helicopter.y = 0.16 + Math.sin(state.elapsed * 0.9) * 0.008;
    // The timer running out ends the job.
    if (state.timer === 0 && !state.jobDone) {
      state.jobDone = true;
      events |= EVENT_JOB_DONE;
    }
    return events;
  }

  reset();
  return { state, reset, step };
}
