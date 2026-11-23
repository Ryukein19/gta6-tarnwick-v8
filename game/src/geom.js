// Pseudo-3D projection: the camera sits low behind the hero car and looks down the
// road toward the horizon. A point is given as (x, z) where x is lateral (-1 = far
// left edge of the road plane, +1 = far right edge) and z is depth (0 = at the
// camera, 1 = the horizon). The projection pulls everything toward the centre as z
// grows, and shrinks it — the two things that make a flat drawing read as depth.

import { FIELD } from './config.js';

/**
 * Project a road-plane point to the screen.
 * Returns { x, y, s } where s is the perspective scale (1 at the camera, 0 at the
 * horizon) — multiply widths and heights by s to keep things the right size.
 */
export function project(x, z) {
  const t = 1 - z;
  const s = t * t;
  const y = FIELD.horizonY + (FIELD.groundY - FIELD.horizonY) * s;
  const px = FIELD.width / 2 + x * (FIELD.width * 0.62) * s;
  return { x: px, y, s };
}

/** The half-width of the road on screen at depth z (in pixels). */
export function roadHalfWidth(z) {
  const t = 1 - z;
  return FIELD.width * 0.42 * t * t + 26;
}

/** Screen x of a lane position (-1..1 across the road) at depth z. */
export function roadX(lane, z) {
  return FIELD.width / 2 + lane * roadHalfWidth(z);
}

/** Screen y of the road surface at depth z. */
export function roadY(z) {
  const t = 1 - z;
  return FIELD.horizonY + (FIELD.groundY - FIELD.horizonY) * t * t;
}

/** A point on the left or right sidewalk at depth z (side is -1 left, +1 right). */
export function sidewalkX(side, z) {
  const t = 1 - z;
  return FIELD.width / 2 + side * (roadHalfWidth(z) + 26 * t * t + 8);
}

/** Long golden-hour shadows fall toward the viewer: shift a ground point down and
 *  sideways by a small amount that grows with height. */
export function shadowOffset(height, z) {
  const t = 1 - z;
  return { x: -height * 0.35 * t, y: height * 0.22 * t };
}
