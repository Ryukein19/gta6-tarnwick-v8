// The player: Renn Kovacs in Tam's Falcon GT. Steering moves the hero across the road
// (lateral metres from the centre line); the car sits at a fixed depth near the camera
// so it reads whole and large. Speed eases toward the staged 107 KM/H.
import { HERO } from './config.js';

export function createPlayer() {
  const state = {
    lateral: 0.4,
    depth: 0.3,
    speedKmh: HERO.speedKmh,
    health: 100,
    armour: 78,
    onFoot: false,
  };

  function reset() {
    state.lateral = 0.4;
    state.depth = 0.3;
    state.speedKmh = HERO.speedKmh;
    state.health = 100;
    state.armour = 78;
    state.onFoot = false;
  }

  function step(dt, direction) {
    state.lateral += direction * 3.4 * dt;
    state.lateral = Math.min(2.6, Math.max(-2.6, state.lateral));
    state.speedKmh += (HERO.speedKmh - state.speedKmh) * Math.min(1, dt * 0.8);
  }

  return { state, reset, step };
}
