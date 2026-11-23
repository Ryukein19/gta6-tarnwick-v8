// Perspective projection for the pseudo-3D chase: the road converges on a
// vanishing point at the golden-hour horizon. Depth t runs 0 (the camera, at the
// bottom of the frame) to 1 (the horizon). Everything on the ground plane —
// traffic, pedestrians, buildings — is placed with project() so near things are
// big and far things shrink toward the vanishing point.
//
//   scale(t)  = (1 - t)^1.6        object scale at depth t
//   screenY(t)= horizon + (ground - horizon) * (1 - t)^2
//   roadX(t, lane): lane -1 (left kerb) .. 1 (right kerb), centre 640

import { FIELD } from './config.js';

const VANISH_X = FIELD.width / 2;
const HALF_ROAD_NEAR = 500;
const HALF_ROAD_FAR = 80;

/** Scale of an object standing at depth t (1 at the camera, 0 at the horizon). */
export function scaleAt(t) {
  const clamped = Math.min(1, Math.max(0, t));
  return Math.pow(1 - clamped, 1.6);
}

/** Screen y of a point on the ground plane at depth t. */
export function groundY(t) {
  const clamped = Math.min(1, Math.max(0, t));
  return FIELD.horizonY + (FIELD.groundY - FIELD.horizonY) * Math.pow(1 - clamped, 2);
}

/** Screen x of a point at depth t and road lane (-1 left kerb .. 1 right kerb). */
export function roadX(t, lane) {
  const clamped = Math.min(1, Math.max(0, t));
  const half = HALF_ROAD_FAR + (HALF_ROAD_NEAR - HALF_ROAD_FAR) * (1 - clamped);
  return VANISH_X + lane * half;
}

/** Full projection: {x, y, s} for a ground-plane point at depth t, lane. */
export function project(t, lane) {
  return { x: roadX(t, lane), y: groundY(t), s: scaleAt(t) };
}

/** X of the left/right road edge at depth t. */
export function roadEdge(t, side) {
  return roadX(t, side < 0 ? -1 : 1);
}

/** The road's left and right edges as screen polygons (for filling the asphalt). */
export function roadPolygon() {
  return [
    [roadEdge(0, -1), FIELD.groundY],
    [roadEdge(1, -1), FIELD.horizonY],
    [roadEdge(1, 1), FIELD.horizonY],
    [roadEdge(0, 1), FIELD.groundY],
  ];
}

/** Sidewalk strip beside the road at depth t: [innerX, outerX] for a side. */
export function sidewalkAt(t, side) {
  const edge = roadEdge(t, side);
  const width = 90 * scaleAt(t) + 14;
  return side < 0 ? [edge - width, edge] : [edge, edge + width];
}
