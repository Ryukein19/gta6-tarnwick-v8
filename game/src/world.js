// The game's rules and state, with no drawing and no browser in it: Renn's Falcon GT, the
// traffic ahead, the police helicopter overhead, the wanted level, the mission timer and the
// safehouse run. step() advances one fixed step and returns what happened as bit flags, so the
// caller can react without the world knowing about screens. Nothing here allocates after
// createWorld returns, and nothing here reads Math.random or the clock — the seeded random
// passed in is the only source of variation, so a fixed seed replays the same chase.

import { GAME, STEP } from './config.js';

export const EVENT_NONE = 0;
export const EVENT_NEAR_MISS = 1;
export const EVENT_SPOTTED = 2;
export const EVENT_ARRIVED = 4;
export const EVENT_TIME_UP = 8;

const ROAD_HALF = 7; // the road is 14 units wide; the car stays inside it
const CAR_SPEED = 26; // units per second at full throttle
const TRAFFIC_SPEED = 11;
const SAFEHOUSE_DISTANCE = 420; // units from the start line to the harbour gate

function makeTraffic(random, count) {
  const cars = [];
  const colors = ['trafficRed', 'trafficBlue', 'trafficYellow', 'trafficTeal', 'trafficWhite'];
  for (let index = 0; index < count; index += 1) {
    cars.push({
      lane: index % 2 === 0 ? -3.4 : 3.4,
      // Staggered ahead of the player so the chase reads dense from the first frame.
      z: -18 - index * 13 - random() * 6,
      speed: TRAFFIC_SPEED + random() * 4,
      color: colors[Math.floor(random() * colors.length)],
      kind: index === 2 ? 'police' : 'car',
      wobble: random() * Math.PI * 2,
    });
  }
  return cars;
}

function makePeds(random, count) {
  const peds = [];
  const shirts = ['#e5484d', '#4a90d9', '#f2c94c', '#3aa88f', '#e5488a', '#f5efe4'];
  for (let index = 0; index < count; index += 1) {
    peds.push({
      x: (random() < 0.5 ? -1 : 1) * (9 + random() * 5),
      z: -10 - random() * 90,
      shirt: shirts[Math.floor(random() * shirts.length)],
      walk: random() * Math.PI * 2,
    });
  }
  return peds;
}

export function createWorld(random) {
  const state = {
    time: 0,
    distance: 0,
    speed: 0,
    carX: 0,
    carAngle: 0,
    timer: GAME.timerSeconds,
    money: GAME.money,
    stars: GAME.stars,
    health: GAME.health,
    armour: GAME.armour,
    wanted: 'IN SIGHT',
    traffic: makeTraffic(random, 9),
    peds: makePeds(random, 12),
    heli: { x: -2, y: 10, z: -22, rotor: 0 },
    nearMiss: 0,
  };

  function reset() {
    state.time = 0;
    state.distance = 0;
    state.speed = 0;
    state.carX = 0;
    state.carAngle = 0;
    state.timer = GAME.timerSeconds;
    state.money = GAME.money;
    state.stars = GAME.stars;
    state.health = GAME.health;
    state.armour = GAME.armour;
    state.nearMiss = 0;
    state.heli.x = -2;
    state.heli.y = 10;
    state.heli.z = -22;
    state.heli.rotor = 0;
  }

  /** One fixed step. steer -1..1, throttle -1..1. Returns EVENT_* flags. */
  function step(dt, steer, throttle) {
    let events = EVENT_NONE;
    state.time += dt;
    state.timer = Math.max(0, state.timer - dt);
    if (state.timer === 0) return EVENT_TIME_UP;

    // The car accelerates toward its target speed and steers inside the road.
    const target = throttle > 0 ? CAR_SPEED : throttle < 0 ? -6 : CAR_SPEED * 0.55;
    state.speed += (target - state.speed) * Math.min(1, dt * 1.6);
    state.carX = Math.max(-ROAD_HALF, Math.min(ROAD_HALF, state.carX + steer * 9 * dt));
    state.carAngle = steer * 0.22;
    state.distance += Math.max(0, state.speed) * dt;

    // Traffic drifts forward and wobbles in its lane; the police cruiser holds the middle.
    for (const car of state.traffic) {
      car.z += (state.speed - car.speed) * dt;
      car.wobble += dt;
      if (car.z > 14) {
        car.z -= 130;
        if (Math.abs(car.lane - state.carX) < 3.2 && car.z > -4 && car.z < 4) {
          state.nearMiss += 1;
          events |= EVENT_NEAR_MISS;
        }
      }
    }

    // Pedestrians stroll along the sidewalks.
    for (const ped of state.peds) {
      ped.walk += dt * 0.9;
      ped.z += state.speed * dt * 0.9;
      if (ped.z > 12) ped.z -= 110;
    }

    // The helicopter hangs over the chase, its rotor spinning, its spotlight tracking the car.
    state.heli.rotor += dt * 21;
    state.heli.x += (state.carX - 2 - state.heli.x) * Math.min(1, dt * 0.8);
    state.heli.z = -22 + Math.sin(state.time * 0.4) * 2;

    if (state.distance >= SAFEHOUSE_DISTANCE) return EVENT_ARRIVED;
    return events;
  }

  reset();
  return { state, reset, step };
}
