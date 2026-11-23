// Perspective projection for the pseudo-3D chase view. The road runs from the camera
// (bottom of the screen, depth 0) to the horizon (depth 1). A point is given by its
// lateral offset from the road centre in metres, its height above the road in metres,
// and its depth. Near things are big and low on the screen; far things are small and
// sit on the horizon line. y = horizon + (ground − horizon) · nearness, so depth 1
// always lands exactly on the horizon and depth 0 exactly on the bottom edge.
import { FIELD } from './config.js';

const HORIZON = FIELD.horizonY;
const GROUND = FIELD.groundY;
const CENTRE_X = FIELD.width / 2;

/**
 * Project a world point to the screen.
 * lateral: metres from the road centre (negative = left, positive = right).
 * height: metres above the road surface.
 * depth: 0 at the camera, 1 at the horizon.
 * Returns { x, y, s } where s is the perspective scale (1 at the camera, ~0.06 at the horizon).
 */
export function project(lateral, height, depth) {
  const d = Math.min(1, Math.max(0, depth));
  const nearness = 1 - d;
  const curve = Math.pow(nearness, 1.45);
  const s = 0.06 + 0.94 * curve;
  const x = CENTRE_X + lateral * 150 * s;
  const y = HORIZON + (GROUND - HORIZON) * curve - height * 95 * s;
  return { x, y, s };
}

/** How wide the road is on screen at a given depth (half-width, in pixels). Consistent
 * with project(): the road is 7.2 m across, so its half-width is 3.6 * 150 * scale. */
export function roadHalfWidth(depth) {
  const d = Math.min(1, Math.max(0, depth));
  const nearness = 1 - d;
  return 540 * (0.06 + 0.94 * Math.pow(nearness, 1.45));
}

/** Screen y of the road surface at a given depth (height 0). */
export function roadY(depth) {
  const d = Math.min(1, Math.max(0, depth));
  return HORIZON + (GROUND - HORIZON) * Math.pow(1 - d, 1.45);
}

/** The horizon line's screen y. */
export function horizonY() {
  return HORIZON;
}
