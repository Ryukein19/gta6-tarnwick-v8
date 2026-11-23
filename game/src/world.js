// The game's rules and state, with no drawing and no browser in it: Renn's
// Falcon GT, the traffic, the police helicopter, the mission timer, money, rank
// and the day clock. step() advances one fixed step; the renderer paints the
// state. Nothing here allocates after createWorld returns.

import { ABILITIES, CREW, DISPATCH, MISSIONS, RADIO, STEP, WEAPONS } from './config.js';
import { buildCity } from './city.js';
import { spawnPed, spawnTraffic } from './traffic.js';

export const EVENT_NONE = 0;
export const EVENT_TIMER_END = 1;
export const EVENT_WRECKED = 2;

export function createWorld(random) {
  const city = buildCity(random);
  const state = {
    time: 0,
    day: 6,
    clock: '18:47',
    money: 24600,
    rank: 'SHOT CALLER',
    rankCur: 840,
    rankMax: 1200,
    jobsDone: 5,
    speed: 112,
    health: 82,
    armour: 64,
    wanted: 4,
    mission: MISSIONS[5],
    missionStage: 2,
    missionStages: 4,
    missionProgress: 58,
    timer: 107, // 1:47
    location: 'TARNWICK STRAND — Strand Boulevard',
    radio: RADIO[0],
    weather: 'CLEAR · 21°C · WIND 6',
    grip: 50,
    traffic: [],
    peds: [],
    heli: { x: 640, y: 92, rotor: 0, spotlightX: 700, spotlightY: 430 },
    player: { lane: 0.28, speed: 112, damage: 38, nitro: 1, onFoot: false },
    dialogue: null,
    crew: CREW,
    dispatch: DISPATCH,
    abilities: ABILITIES,
    weapons: WEAPONS,
    mode: 'chase',
    seed: 0,
  };

  function reset() {
    state.time = 0;
    state.timer = 107;
    state.speed = 112;
    state.traffic = [];
    state.peds = [];
    for (let i = 0; i < 7; i += 1) state.traffic.push(spawnTraffic(random, 0.15 + i * 0.11));
    for (let i = 0; i < 6; i += 1) state.peds.push(spawnPed(random, 0.2 + i * 0.12));
    state.dialogue = {
      initials: 'IV',
      name: 'ILYA VANE',
      role: 'GREYLINE lieutenant',
      color: '#e5534b',
      line: 'Dray\'s sedan is on the boulevard at sunset. Wreck it — make him walk home.',
    };
  }

  function step(dt, direction, harmless) {
    state.time += dt;
    state.heli.rotor += dt * 22;
    state.heli.spotlightX = 700 + Math.sin(state.time * 0.7) * 40;
    if (!harmless && state.timer > 0) state.timer = Math.max(0, state.timer - dt);
    // The player drifts across lanes; traffic rolls toward the camera.
    state.player.lane = Math.max(-0.8, Math.min(0.8, state.player.lane + direction * dt * 0.9));
    state.speed = Math.max(0, Math.min(168, state.speed + (harmless ? 0 : (direction === 0 ? -2 : 0) * dt)));
    for (const car of state.traffic) {
      car.t -= dt * 0.055;
      if (car.t <= 0.04) {
        const fresh = spawnTraffic(random, 0.95);
        car.t = fresh.t;
        car.lane = fresh.lane;
        car.color = fresh.color;
        car.kind = fresh.kind;
      }
    }
    for (const ped of state.peds) {
      ped.t -= dt * 0.02;
      if (ped.t <= 0.06) {
        const fresh = spawnPed(random, 0.95);
        ped.t = fresh.t;
        ped.lane = fresh.lane;
        ped.color = fresh.color;
      }
    }
    if (state.timer === 0) return EVENT_TIMER_END;
    return EVENT_NONE;
  }

  reset();
  return { state, city, reset, step, STEP };
}
