// Traffic and pedestrians on the Strand: cars, a scooter and walkers, all placed
// on the perspective road by depth t and lane. Spawning is seeded so the same
// seed always stages the same street.

import { pick, range } from './random.js';

const CAR_COLORS = ['#d9e2e8', '#3a4a5a', '#c94f43', '#e8c85a', '#7a8a99', '#5a6e7f', '#b8a88f'];
const PED_COLORS = ['#e8e0d0', '#c96a5a', '#6a8a6a', '#d9a85a', '#8a7ab8', '#5a9ab8'];
const PED_SHIRTS = ['#e5534b', '#f2c94c', '#6fb7d9', '#7bc96f', '#e8e0d0', '#c98ab8'];

/** A traffic car (or the burning wreck): depth t, lane -0.8..0.8, kind. */
export function spawnTraffic(random, t) {
  return {
    t,
    lane: range(random, -0.75, 0.75),
    color: pick(random, CAR_COLORS),
    kind: random() < 0.14 ? 'wreck' : random() < 0.2 ? 'cruiser' : 'car',
    speed: range(random, 0.9, 1.3),
  };
}

/** The scooter on the right sidewalk. */
export function spawnScooter(random, t) {
  return { t, lane: 0.92, color: '#e8c85a', kind: 'scooter' };
}

/** A pedestrian on a sidewalk: depth t, side, shirt colour. */
export function spawnPed(random, t) {
  const side = random() < 0.5 ? -1 : 1;
  return {
    t,
    lane: side * range(random, 1.1, 1.35),
    color: pick(random, PED_COLORS),
    shirt: pick(random, PED_SHIRTS),
    walk: random() * Math.PI * 2,
  };
}
