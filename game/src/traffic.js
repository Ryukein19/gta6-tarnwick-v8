// Traffic on the Strand: cars ahead of the player, a scooter on the right sidewalk,
// pedestrians on both sidewalks, and one burning car on the left — the dramatic beat.
// Each entry carries a depth (0 = camera, 1 = horizon) and drifts toward the camera as
// the player drives, then recycles to the horizon. Pools are allocated once, at boot.
import { range, pick } from './random.js';

const CAR_COLOURS = ['#c9d4dc', '#5b7fa6', '#b0483e', '#d8c26a', '#7a6a8f', '#3f6b4f'];
const PED_COLOURS = ['#e2574c', '#4a7fb5', '#f2c94c', '#7fc46a', '#c98ae0', '#e8e4da'];
const MAX_CARS = 9;
const MAX_PEDS = 10;

/** One traffic car: lane in metres from the road centre, depth, speed, colour, kind. */
function makeCar(random, depth) {
  return {
    active: true,
    lane: pick(random, [-2.2, -1.1, 0, 1.1, 2.2]),
    depth: depth ?? range(random, 0.25, 0.95),
    speed: range(random, 28, 52),
    colour: pick(random, CAR_COLOURS),
    kind: random() < 0.2 ? 'van' : 'car',
  };
}

export function createTraffic(random) {
  const cars = [];
  const peds = [];
  const scooter = { active: true, lane: 3.6, depth: 0.42, speed: 34 };
  const burning = { active: true, lane: -3.4, depth: 0.55, colour: '#2b2b2e' };

  for (let i = 0; i < MAX_CARS; i += 1) cars.push(makeCar(random, 0.35 + (i / MAX_CARS) * 0.6));
  for (let i = 0; i < MAX_PEDS; i += 1) {
    peds.push({
      active: true,
      side: i % 2 === 0 ? -1 : 1,
      lane: (i % 2 === 0 ? -1 : 1) * range(random, 3.4, 5.2),
      depth: range(random, 0.15, 0.9),
      colour: pick(random, PED_COLOURS),
      walk: range(random, 0, 6.28),
    });
  }

  const state = { cars, peds, scooter, burning };

  function reset() {
    for (let i = 0; i < cars.length; i += 1) {
      const car = makeCar(random, 0.35 + (i / MAX_CARS) * 0.6);
      cars[i].lane = car.lane;
      cars[i].depth = car.depth;
      cars[i].speed = car.speed;
      cars[i].colour = car.colour;
      cars[i].kind = car.kind;
    }
    scooter.depth = 0.42;
    burning.depth = 0.55;
  }

  /** Traffic drifts toward the camera as the player drives; anything that reaches the
   * hero's depth recycles to the horizon with a fresh lane and colour, so traffic
   * always stays ahead of the hero and never swallows the cover's foreground. */
  function step(dt, speedKmh) {
    const flow = (speedKmh / 3.6) * dt * 0.004;
    for (const car of cars) {
      car.depth -= flow * (0.5 + (car.speed / 60));
      if (car.depth <= 0.32) {
        const fresh = makeCar(random, 0.95);
        car.lane = fresh.lane;
        car.depth = fresh.depth;
        car.speed = fresh.speed;
        car.colour = fresh.colour;
        car.kind = fresh.kind;
      }
    }
    scooter.depth -= flow * 0.8;
    if (scooter.depth <= 0.32) scooter.depth = 0.95;
    burning.depth -= flow * 0.2;
    if (burning.depth <= 0.32) burning.depth = 0.9;
    for (const ped of peds) {
      ped.depth -= flow * 0.25;
      ped.walk += dt * 3;
      if (ped.depth <= 0.1) ped.depth = 0.92;
    }
  }

  return { state, reset, step };
}
