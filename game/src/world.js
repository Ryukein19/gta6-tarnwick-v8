// The world's state: mission clock, money, rank, wanted level, traffic, helicopter and
// the hero car. The state is a pure function of the seed plus the fixed shot time, so a
// staged screenshot is the same frame every run. The live loop steps it in fixed 1/60 s
// increments; the shot path never steps it at all.
import { HUD, MISSIONS, STEP } from './config.js';
import { createRandom, range } from './random.js';

export const EVENT_OVER = 1;

/** Lanes across the road, in world units (the road runs down -Z, x is across it). */
export const LANES = [-4.5, -1.5, 1.5, 4.5];

const TRAFFIC_COLORS = ['#7a2e2e', '#2e4a7a', '#5a5a5a', '#7a6a2e', '#3a3a3a', '#8a4a2e'];

export function createWorld(random) {
  const state = {
    seed: 1,
    time: 0,
    mission: MISSIONS[5],
    money: HUD.money,
    day: HUD.day,
    clock: HUD.clock,
    timer: HUD.timerSeconds,
    rankPoints: HUD.rankPoints,
    rankNext: HUD.rankNext,
    rankName: HUD.rankName,
    wanted: HUD.wanted,
    health: HUD.health,
    armour: HUD.armour,
    speed: 0,
    traffic: [],
    heli: { x: 6, y: 26, z: -34, angle: 0 },
    hero: { x: 1.5, z: 0, heading: 0 },
    onFoot: { x: 1.2, z: 6, heading: Math.PI },
  };

  /** Lay out the traffic for a scene: dense cars ahead of the hero, all from the seed. */
  function layTraffic(count, startZ) {
    state.traffic = [];
    for (let i = 0; i < count; i += 1) {
      const lane = LANES[Math.floor(random() * LANES.length)];
      state.traffic.push({
        x: lane,
        z: startZ - i * range(random, 6, 10) - random() * 4,
        speed: range(random, 9, 15),
        color: TRAFFIC_COLORS[Math.floor(random() * TRAFFIC_COLORS.length)],
        brake: random() < 0.25,
      });
    }
  }

  return {
    state,
    /** Fresh world for a scene: hero at the origin, dense traffic ahead, heli overhead. */
    reset(seed) {
      state.seed = seed;
      state.time = 0;
      state.money = HUD.money;
      state.timer = HUD.timerSeconds;
      state.wanted = HUD.wanted;
      state.health = HUD.health;
      state.armour = HUD.armour;
      state.speed = 88;
      state.hero = { x: 1.5, z: 0, heading: 0 };
      state.onFoot = { x: 1.2, z: 6, heading: Math.PI };
      state.heli = { x: 6, y: 26, z: -34, angle: 0.35 };
      layTraffic(9, -10);
    },
    /** One fixed step of the live game: the clock runs down, traffic rolls forward. */
    step(dt) {
      state.time += dt;
      state.timer = Math.max(0, state.timer - dt);
      for (const car of state.traffic) car.z += car.speed * dt;
      state.heli.angle += dt * 0.6;
      state.heli.x = 6 + Math.sin(state.time * 0.4) * 1.5;
      if (state.timer === 0) return EVENT_OVER;
      return 0;
    },
  };
}

export { createRandom, range, STEP };
