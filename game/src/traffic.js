// Traffic: the cars ahead on the boulevard, the scooter on the right sidewalk and the
// pedestrians on both sidewalks. The cover needs the road to read BUSY — five cars ahead,
// a scooter, and people on both sides — so the staged chase composes a fixed, dense
// layout while live play re-seeds it.

import { VEHICLES, drawCar, drawScooter } from './vehicles.js';
import { drawPedestrian } from './people.js';
import { depthX, depthY, depthScale } from './geom.js';

const TRAFFIC_MODELS = [VEHICLES.coupe, VEHICLES.pickup, VEHICLES.taxi, VEHICLES.sedan, VEHICLES.coupe];
const PED_COLOURS = ['#c94c4c', '#4c7a9c', '#7a9c4c', '#c9a44c', '#9c6ac9', '#4cc9a8'];

/** The staged cover traffic: five cars ahead, spread across the lanes and depths so the
 * road reads busy, not piled up. Near cars sit wide, far cars sit near the vanishing point. */
export function coverTraffic() {
  return [
    { model: VEHICLES.cruiser, lateral: -0.34, depth: 0.34, police: true },
    { model: VEHICLES.coupe, lateral: 0.30, depth: 0.46, police: false },
    { model: VEHICLES.pickup, lateral: -0.16, depth: 0.60, police: false },
    { model: VEHICLES.taxi, lateral: 0.34, depth: 0.70, police: false },
    { model: VEHICLES.sedan, lateral: -0.06, depth: 0.82, police: false },
    { model: VEHICLES.cruiser, lateral: 0.38, depth: 0.56, police: true },
  ];
}

/** Draw the traffic list for a chase frame. */
export function drawTraffic(ctx, list) {
  // Far to near, so near cars overlap far ones.
  const sorted = [...list].sort((a, b) => b.depth - a.depth);
  for (const car of sorted) {
    const x = depthX(car.lateral, car.depth);
    const y = depthY(car.depth);
    const s = depthScale(car.depth);
    drawCar(ctx, x, y, 300 * s + 30, car.model, { police: car.police });
  }
}

/** The staged cover pedestrians: four on the left sidewalk, three on the right. */
export function coverPedestrians() {
  return [
    { lateral: -0.78, depth: 0.30, colour: PED_COLOURS[0] },
    { lateral: -0.82, depth: 0.48, colour: PED_COLOURS[1] },
    { lateral: -0.75, depth: 0.66, colour: PED_COLOURS[2] },
    { lateral: -0.85, depth: 0.82, colour: PED_COLOURS[3] },
    { lateral: 0.80, depth: 0.36, colour: PED_COLOURS[4] },
    { lateral: 0.76, depth: 0.58, colour: PED_COLOURS[5] },
    { lateral: 0.84, depth: 0.78, colour: PED_COLOURS[0] },
  ];
}

/** Draw pedestrians at their sidewalk positions. */
export function drawPedestrians(ctx, list) {
  const sorted = [...list].sort((a, b) => b.depth - a.depth);
  for (const p of sorted) {
    const x = depthX(p.lateral, p.depth);
    const y = depthY(p.depth) + 6;
    const s = depthScale(p.depth);
    drawPedestrian(ctx, x, y, 0.9 * s + 0.25, p.colour);
  }
}

/** The scooter parked on the right sidewalk, ahead of the hero car. */
export function drawCoverScooter(ctx) {
  const x = depthX(0.72, 0.42);
  const y = depthY(0.42) + 8;
  drawScooter(ctx, x, y, 1.1);
}
