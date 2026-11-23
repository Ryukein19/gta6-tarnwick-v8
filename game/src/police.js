// Tarnwick PD: the helicopter with its spotlight cone, the wanted stars, and the
// dispatch panel. The helicopter is the chase's proof of escalation — in v8 it is LARGE
// (rotor span ~20% of the frame) with a wide, bright cone visibly hitting the road ahead
// of the player car. The dispatch panel keeps all 7 named units with distance + tactic.

import { DISPATCH } from './config.js';
import { FIELD } from './config.js';

/**
 * The police helicopter: body, tail boom, blurred rotor disc and a wide spotlight cone
 * that hits the road ahead of the hero car. (x, y) is the centre of the body.
 */
export function drawHelicopter(ctx, x, y, span) {
  // Spotlight cone first (behind the body), from the heli down to the road.
  const coneTop = y + 12;
  const coneBottom = 470;
  const coneHalfTop = span * 0.10;
  const coneHalfBottom = span * 0.55;
  const grad = ctx.createLinearGradient(0, coneTop, 0, coneBottom);
  grad.addColorStop(0, 'rgba(255, 250, 210, 0.55)');
  grad.addColorStop(1, 'rgba(255, 250, 210, 0.05)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(x - coneHalfTop, coneTop);
  ctx.lineTo(x + coneHalfTop, coneTop);
  ctx.lineTo(x + coneHalfBottom, coneBottom);
  ctx.lineTo(x - coneHalfBottom, coneBottom);
  ctx.closePath();
  ctx.fill();
  // Bright pool where the cone hits the road.
  ctx.fillStyle = 'rgba(255, 250, 210, 0.35)';
  ctx.beginPath();
  ctx.ellipse(x + 30, coneBottom, coneHalfBottom * 0.9, 18, 0, 0, Math.PI * 2);
  ctx.fill();

  // Rotor disc (blurred, fast).
  ctx.fillStyle = 'rgba(40, 44, 54, 0.35)';
  ctx.beginPath();
  ctx.ellipse(x, y - 16, span / 2, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(40, 44, 54, 0.6)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(x, y - 16, span / 2, 7, 0, 0, Math.PI * 2);
  ctx.stroke();
  // Tail boom.
  ctx.fillStyle = '#2a3442';
  ctx.beginPath();
  ctx.moveTo(x + span * 0.10, y - 4);
  ctx.lineTo(x + span * 0.34, y - 14);
  ctx.lineTo(x + span * 0.34, y - 2);
  ctx.lineTo(x + span * 0.10, y + 6);
  ctx.closePath();
  ctx.fill();
  // Tail rotor.
  ctx.strokeStyle = '#2a3442';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x + span * 0.34, y - 22);
  ctx.lineTo(x + span * 0.34, y + 4);
  ctx.stroke();
  // Body.
  ctx.fillStyle = '#2a3442';
  ctx.beginPath();
  ctx.ellipse(x, y, span * 0.16, span * 0.075, 0, 0, Math.PI * 2);
  ctx.fill();
  // Belly + skids.
  ctx.fillStyle = '#1a2230';
  ctx.beginPath();
  ctx.ellipse(x, y + span * 0.055, span * 0.11, span * 0.02, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#1a2230';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - span * 0.12, y + span * 0.10);
  ctx.lineTo(x + span * 0.12, y + span * 0.10);
  ctx.stroke();
  // Cockpit glass catching the sun.
  ctx.fillStyle = '#ffd97a';
  ctx.beginPath();
  ctx.ellipse(x - span * 0.06, y - span * 0.02, span * 0.045, span * 0.03, -0.2, 0, Math.PI * 2);
  ctx.fill();
  // Searchlight housing under the nose.
  ctx.fillStyle = '#fff3c4';
  ctx.beginPath();
  ctx.arc(x - span * 0.02, y + span * 0.06, 5, 0, Math.PI * 2);
  ctx.fill();
}

/** The wanted stars, top-right, with the money beside them. */
export function wantedStars() {
  return 4;
}

/** The 7 dispatch units, in panel order. */
export function dispatchUnits() {
  return DISPATCH;
}

/** The spotlight unit's callsign — the helicopter in the dispatch panel. */
export function spotlightUnit() {
  return DISPATCH[0];
}
