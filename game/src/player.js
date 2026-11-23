// The player: Renn Kovacs in Tam's Falcon GT. Steering, speed, damage, and the
// three crew abilities (SWAP PLATES, QUICK FIX, EYES OUT) with their cooldowns.

import { FALCON } from './config.js';
import { clamp } from './random.js';

/** Ability cooldowns in seconds: 45 s plates, 60 s fix, 20 s eyes. */
const COOLDOWNS = [45, 60, 20];

export function createPlayer() {
  return {
    lane: 0.18,
    speed: 107,
    targetSpeed: 107,
    condition: FALCON.condition,
    health: 100,
    armour: 60,
    onFoot: false,
    x: 0,
    y: 0,
    cooldowns: [0, 12, 30],
    eyesOut: 0,
  };
}

/** Steer and accelerate: direction -1/0/1, throttle 0..1, brake true/false. */
export function stepPlayer(player, dt, direction, throttle, brake) {
  if (player.onFoot) {
    player.lane = clamp(player.lane + direction * 1.1 * dt, -0.85, 0.85);
    player.speed = 0;
    return;
  }
  player.lane = clamp(player.lane + direction * FALCON.steer * dt * (0.4 + player.speed / FALCON.topSpeed), -0.72, 0.72);
  if (brake) player.targetSpeed = Math.max(0, player.targetSpeed - FALCON.brake * dt);
  else player.targetSpeed = clamp(player.targetSpeed + FALCON.accel * throttle * dt, 0, FALCON.topSpeed);
  player.speed += (player.targetSpeed - player.speed) * Math.min(1, dt * 1.4);
  for (let i = 0; i < player.cooldowns.length; i += 1) {
    if (player.cooldowns[i] > 0) player.cooldowns[i] = Math.max(0, player.cooldowns[i] - dt);
  }
  if (player.eyesOut > 0) player.eyesOut = Math.max(0, player.eyesOut - dt);
}

/**
 * Use an ability (0 = SWAP PLATES, 1 = QUICK FIX, 2 = EYES OUT).
 * Returns a short line for the HUD, or null when the ability is still cooling down.
 */
export function useAbility(player, wanted, index) {
  if (player.cooldowns[index] > 0) return null;
  player.cooldowns[index] = COOLDOWNS[index];
  if (index === 0) {
    wanted.level = Math.max(1, wanted.level - 1);
    return 'SWAP PLATES — plates swapped, heat down one star';
  }
  if (index === 1) {
    player.condition = Math.min(100, player.condition + 40);
    return 'QUICK FIX — Uncle Bram patched the Falcon, +40% condition';
  }
  player.eyesOut = 20;
  return 'EYES OUT — Maren marked every unit for 20 s';
}

/** Damage the car: returns true when the car is wrecked. */
export function damagePlayer(player, amount) {
  player.condition = Math.max(0, player.condition - amount);
  if (player.armour > 0) {
    const absorbed = Math.min(player.armour, amount * 0.6);
    player.armour -= absorbed;
    player.health -= (amount - absorbed) * 0.6;
  } else {
    player.health -= amount * 0.6;
  }
  player.health = Math.max(0, player.health);
  return player.health <= 0;
}
