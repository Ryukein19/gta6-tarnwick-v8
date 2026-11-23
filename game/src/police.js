// The police: the helicopter with its dominant spotlight cone, the seven named
// dispatch units, and the roadblock ahead. The helicopter is the chase's proof of
// escalation — in v8 it is large, top-centre, and its cone visibly hits the road.

import { FIELD, PALETTE } from './config.js';

/** The helicopter: body, tail, skids, a blurred rotor, and a searchlight. */
export function drawHelicopter(ctx, x, y, span, time) {
  const bodyW = span * 0.42;
  const bodyH = span * 0.16;
  // Rotor blur: a translucent disc above the body.
  ctx.fillStyle = 'rgba(30, 28, 34, 0.25)';
  ctx.beginPath();
  ctx.ellipse(x, y - bodyH * 0.9, span / 2, span * 0.05, 0, 0, Math.PI * 2);
  ctx.fill();
  // Rotor blades, spinning (two positions alternating).
  ctx.strokeStyle = '#1a1a22';
  ctx.lineWidth = Math.max(2, span * 0.012);
  const a = time * 9;
  ctx.beginPath();
  ctx.moveTo(x - Math.cos(a) * span * 0.48, y - bodyH * 0.9 - Math.sin(a) * span * 0.03);
  ctx.lineTo(x + Math.cos(a) * span * 0.48, y - bodyH * 0.9 + Math.sin(a) * span * 0.03);
  ctx.stroke();
  // Tail boom.
  ctx.fillStyle = '#23232e';
  ctx.fillRect(x + bodyW * 0.4, y - bodyH * 0.32, bodyW * 0.62, bodyH * 0.3);
  // Tail rotor.
  ctx.strokeStyle = '#1a1a22';
  ctx.lineWidth = Math.max(1.5, span * 0.008);
  ctx.beginPath();
  ctx.moveTo(x + bodyW * 0.95, y - bodyH * 0.55);
  ctx.lineTo(x + bodyW * 0.95, y + bodyH * 0.1);
  ctx.stroke();
  // Body.
  ctx.fillStyle = '#2e2e3a';
  ctx.beginPath();
  ctx.moveTo(x - bodyW / 2, y);
  ctx.lineTo(x - bodyW * 0.42, y - bodyH * 0.7);
  ctx.lineTo(x + bodyW * 0.32, y - bodyH * 0.7);
  ctx.lineTo(x + bodyW / 2, y - bodyH * 0.2);
  ctx.lineTo(x + bodyW * 0.42, y);
  ctx.closePath();
  ctx.fill();
  // Cockpit glass, catching the sun.
  ctx.fillStyle = '#9fd8ef';
  ctx.beginPath();
  ctx.moveTo(x - bodyW * 0.34, y - bodyH * 0.62);
  ctx.lineTo(x + bodyW * 0.1, y - bodyH * 0.62);
  ctx.lineTo(x + bodyW * 0.3, y - bodyH * 0.28);
  ctx.lineTo(x - bodyW * 0.36, y - bodyH * 0.28);
  ctx.closePath();
  ctx.fill();
  // "TARNWICK PD" on the side.
  ctx.fillStyle = '#f7f2e8';
  ctx.font = `bold ${Math.max(9, span * 0.045)}px ${'system-ui, sans-serif'}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('TARNWICK PD', x - bodyW * 0.02, y - bodyH * 0.08);
  // Searchlight housing under the nose.
  ctx.fillStyle = '#ffd98a';
  ctx.beginPath();
  ctx.arc(x - bodyW * 0.18, y + bodyH * 0.12, Math.max(3, span * 0.02), 0, Math.PI * 2);
  ctx.fill();
  // Skids.
  ctx.strokeStyle = '#1a1a22';
  ctx.lineWidth = Math.max(2, span * 0.01);
  ctx.beginPath();
  ctx.moveTo(x - bodyW * 0.34, y + bodyH * 0.32);
  ctx.lineTo(x + bodyW * 0.36, y + bodyH * 0.32);
  ctx.stroke();
}

/**
 * The spotlight cone: a wide translucent beam from the helicopter down to a bright
 * pool on the road ahead of the hero car. (hx, hy) is the helicopter, (tx, ty) the
 * pool centre on the road, width the pool's width.
 */
export function drawSpotlight(ctx, hx, hy, tx, ty, width, time) {
  const flicker = 0.82 + 0.08 * Math.sin(time * 7) + 0.05 * Math.sin(time * 13);
  const grad = ctx.createLinearGradient(hx, hy, tx, ty);
  grad.addColorStop(0, `rgba(255, 244, 200, ${0.55 * flicker})`);
  grad.addColorStop(1, `rgba(255, 244, 200, ${0.22 * flicker})`);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(hx - 8, hy + 6);
  ctx.lineTo(tx - width / 2, ty);
  ctx.lineTo(tx + width / 2, ty);
  ctx.lineTo(hx + 8, hy + 6);
  ctx.closePath();
  ctx.fill();
  // The pool of light on the road.
  ctx.fillStyle = `rgba(255, 244, 200, ${0.45 * flicker})`;
  ctx.beginPath();
  ctx.ellipse(tx, ty, width / 2, width * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();
  // Dust and heat shimmer in the beam.
  ctx.fillStyle = `rgba(255, 255, 255, ${0.12 * flicker})`;
  for (let i = 0; i < 5; i += 1) {
    const t = ((time * 0.12 + i * 0.2) % 1);
    const px = hx + (tx - hx) * t + Math.sin(time * 3 + i * 2) * 14;
    const py = hy + (ty - hy) * t;
    ctx.beginPath();
    ctx.arc(px, py, 2 + t * 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** A roadblock ahead: two cruisers nose-to-nose across the road plus a striped barrier. */
export function drawRoadblock(ctx, x, y, w, time) {
  const h = w * 0.16;
  // Barrier stripes.
  ctx.fillStyle = '#f7f2e8';
  ctx.fillRect(x - w / 2, y - h, w, h * 0.32);
  ctx.fillStyle = '#e5534b';
  for (let i = 0; i < 6; i += 1) {
    ctx.fillRect(x - w / 2 + (i * w) / 6, y - h, w / 12, h * 0.32);
  }
  // Flashing beacons on the barrier.
  const on = Math.floor(time * 2.5) % 2 === 0;
  ctx.fillStyle = on ? '#ff2e2e' : '#2e7bff';
  ctx.beginPath();
  ctx.arc(x - w * 0.3, y - h - 8, 6, 0, Math.PI * 2);
  ctx.arc(x + w * 0.3, y - h - 8, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PALETTE.gold;
  ctx.font = `bold ${Math.max(10, w * 0.05)}px ${'system-ui, sans-serif'}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('ROADBLOCK — TARNWICK PD', x, y - h * 1.7);
}
