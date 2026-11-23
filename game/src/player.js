// Renn Kovacs and the Falcon GT — Tam's car, the hero of the chase. The player
// steers across lanes, holds speed, and can spend nitro. Damage grows when the
// police land a hit; at 100% the car is wrecked.

import { FIELD } from './config.js';

export function createPlayer() {
  return {
    lane: 0.28,
    speed: 112,
    damage: 38,
    nitro: 1,
    nitroLeft: 100,
    onFoot: false,
    x: 0,
    y: 0,
    width: 0,
  };
}

/** Steer: direction -1/0/1, dt seconds, nitro held or not. */
export function stepPlayer(player, direction, nitro, dt) {
  player.lane = Math.max(-0.82, Math.min(0.82, player.lane + direction * dt * 0.85));
  const target = nitro && player.nitroLeft > 0 ? 168 : 112;
  player.speed += (target - player.speed) * Math.min(1, dt * 1.2);
  if (nitro && player.nitroLeft > 0) player.nitroLeft = Math.max(0, player.nitroLeft - dt * 22);
  else player.nitroLeft = Math.min(100, player.nitroLeft + dt * 4);
}

/** Screen placement of the hero car: whole, large, centred slightly right. */
export function heroPlacement() {
  return {
    x: FIELD.width * 0.56,
    y: 512,
    w: FIELD.width * 0.26,
  };
}

/** A police hit lands: damage grows, speed dips. Returns true when wrecked. */
export function takeHit(player, amount) {
  player.damage = Math.min(100, player.damage + amount);
  player.speed = Math.max(40, player.speed - 18);
  return player.damage >= 100;
}
