// Geometry helpers for the pseudo-3D chase view: a perspective road that recedes to a
// vanishing point on the horizon, and the shapes everything else is built from. The world
// is drawn on a 2D canvas with hand-tuned perspective — no library, no network — so the
// staged screenshots come out exactly as composed.

import { FIELD } from './config.js';

/** The chase camera: the road's vanishing point and the horizon line. */
export const CAMERA = { vx: FIELD.width * 0.52, horizonY: FIELD.horizonY };

/**
 * Perspective scale for a depth in [0, 1] (0 = at the camera, 1 = at the horizon).
 * Objects shrink toward the vanishing point; the curve keeps near objects big.
 */
export function depthScale(depth) {
  const d = Math.max(0, Math.min(1, depth));
  return (1 - d) * (1 - d) * 0.92 + 0.08;
}

/** Screen y for a depth: the horizon line at depth 1, the bottom of the frame at depth 0. */
export function depthY(depth) {
  const d = Math.max(0, Math.min(1, depth));
  return CAMERA.horizonY + (1 - d) * (1 - d) * (FIELD.height - CAMERA.horizonY);
}

/** Screen x for a lateral offset (-1 = far left, 1 = far right) at a depth. */
export function depthX(lateral, depth) {
  const s = depthScale(depth);
  return CAMERA.vx + lateral * s * FIELD.width * 0.62;
}

/** A rounded rectangle path, for HUD panels and buttons. */
export function roundRect(ctx, x, y, w, h, r) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

/** A soft ellipse shadow under a car, person or helicopter. */
export function groundShadow(ctx, x, y, w, h, alpha) {
  ctx.save();
  ctx.fillStyle = `rgba(20, 10, 10, ${alpha})`;
  ctx.beginPath();
  ctx.ellipse(x, y, w / 2, h / 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** A five-point star, for the wanted level. */
export function star(ctx, cx, cy, r, colour) {
  ctx.save();
  ctx.fillStyle = colour;
  ctx.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const rad = i % 2 === 0 ? r : r * 0.45;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const x = cx + Math.cos(a) * rad;
    const y = cy + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}
