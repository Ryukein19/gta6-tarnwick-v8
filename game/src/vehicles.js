// Vehicles: the hero Falcon GT (whole, large, centred), the Tarnwick PD cruisers,
// and the burning car on the left of the road. All drawn from behind in canvas 2D,
// with a long golden-hour shadow thrown toward the viewer.

import { FALCON, PALETTE } from './config.js';
import { project } from './geom.js';

/**
 * The hero car: bright orange Falcon GT, rear three-quarter view, spoiler, dented
 * rear quarter, a smoke wisp from the exhaust, TAM-6 plate. (x, y) is the screen
 * centre of the car's base; w is its on-screen width.
 */
export function drawFalcon(ctx, x, y, w, time) {
  const h = w * 0.42;
  const left = x - w / 2;
  const top = y - h;
  // Long shadow toward the viewer (sun low behind).
  ctx.fillStyle = 'rgba(20, 10, 5, 0.4)';
  ctx.beginPath();
  ctx.ellipse(x + w * 0.06, y + h * 0.06, w * 0.52, h * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();
  // Rear bumper and body.
  ctx.fillStyle = PALETTE.falconDark;
  ctx.beginPath();
  ctx.moveTo(left, y);
  ctx.lineTo(left + w * 0.04, top + h * 0.42);
  ctx.lineTo(left + w * 0.96, top + h * 0.42);
  ctx.lineTo(left + w, y);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = PALETTE.falcon;
  ctx.beginPath();
  ctx.moveTo(left + w * 0.02, y - h * 0.02);
  ctx.lineTo(left + w * 0.07, top + h * 0.5);
  ctx.lineTo(left + w * 0.13, top + h * 0.3);
  ctx.lineTo(left + w * 0.87, top + h * 0.3);
  ctx.lineTo(left + w * 0.93, top + h * 0.5);
  ctx.lineTo(left + w * 0.98, y - h * 0.02);
  ctx.closePath();
  ctx.fill();
  // Cabin / rear window: dark glass catching the low sun on its upper edge.
  ctx.fillStyle = '#1e2c40';
  ctx.beginPath();
  ctx.moveTo(left + w * 0.18, top + h * 0.32);
  ctx.lineTo(left + w * 0.26, top + h * 0.06);
  ctx.lineTo(left + w * 0.74, top + h * 0.06);
  ctx.lineTo(left + w * 0.82, top + h * 0.32);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 200, 120, 0.5)';
  ctx.fillRect(left + w * 0.28, top + h * 0.08, w * 0.44, h * 0.05);
  // Warm sun glint on the roof.
  ctx.fillStyle = 'rgba(255, 243, 196, 0.55)';
  ctx.fillRect(left + w * 0.3, top + h * 0.1, w * 0.4, h * 0.05);
  // Spoiler.
  ctx.fillStyle = PALETTE.falconDark;
  ctx.fillRect(left + w * 0.06, top + h * 0.28, w * 0.88, h * 0.05);
  ctx.fillRect(left + w * 0.1, top + h * 0.32, w * 0.03, h * 0.1);
  ctx.fillRect(left + w * 0.87, top + h * 0.32, w * 0.03, h * 0.1);
  // Dented rear quarter (Tam's car has been through it).
  ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
  ctx.beginPath();
  ctx.ellipse(left + w * 0.82, top + h * 0.62, w * 0.09, h * 0.16, 0.3, 0, Math.PI * 2);
  ctx.fill();
  // Taillight bar, glowing.
  ctx.fillStyle = '#ff2e2e';
  ctx.fillRect(left + w * 0.08, top + h * 0.56, w * 0.84, h * 0.07);
  ctx.fillStyle = 'rgba(255, 46, 46, 0.35)';
  ctx.fillRect(left + w * 0.06, top + h * 0.52, w * 0.88, h * 0.15);
  // Plate: TAM-6.
  ctx.fillStyle = '#f7f2e8';
  ctx.fillRect(left + w * 0.42, top + h * 0.72, w * 0.16, h * 0.14);
  ctx.fillStyle = '#1a1a22';
  ctx.font = `bold ${Math.max(9, h * 0.09)}px ${'system-ui, sans-serif'}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(FALCON.plate, left + w * 0.5, top + h * 0.79);
  // Twin exhausts + a smoke wisp that curls up behind the car.
  ctx.fillStyle = '#2a2a33';
  ctx.fillRect(left + w * 0.3, y - h * 0.04, w * 0.05, h * 0.05);
  ctx.fillRect(left + w * 0.65, y - h * 0.04, w * 0.05, h * 0.05);
  const wisp = (time * 0.7) % 1;
  ctx.fillStyle = `rgba(220, 220, 220, ${0.5 * (1 - wisp)})`;
  ctx.beginPath();
  ctx.arc(left + w * 0.32 + Math.sin(time * 2) * 6, y - h * 0.1 - wisp * 46, 8 + wisp * 16, 0, Math.PI * 2);
  ctx.fill();
  // Wheels.
  ctx.fillStyle = '#14141a';
  ctx.fillRect(left + w * 0.05, y - h * 0.16, w * 0.13, h * 0.16);
  ctx.fillRect(left + w * 0.82, y - h * 0.16, w * 0.13, h * 0.16);
}

/** A Tarnwick PD cruiser: white body, black doors, light bar flashing red/blue. */
export function drawCruiser(ctx, x, y, w, time, phase) {
  const h = w * 0.4;
  const left = x - w / 2;
  const top = y - h;
  ctx.fillStyle = 'rgba(20, 10, 5, 0.35)';
  ctx.beginPath();
  ctx.ellipse(x, y + h * 0.04, w * 0.5, h * 0.09, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PALETTE.cruiser;
  ctx.beginPath();
  ctx.moveTo(left, y);
  ctx.lineTo(left + w * 0.05, top + h * 0.46);
  ctx.lineTo(left + w * 0.14, top + h * 0.28);
  ctx.lineTo(left + w * 0.86, top + h * 0.28);
  ctx.lineTo(left + w * 0.95, top + h * 0.46);
  ctx.lineTo(left + w, y);
  ctx.closePath();
  ctx.fill();
  // Black doors.
  ctx.fillStyle = PALETTE.cruiserDark;
  ctx.fillRect(left + w * 0.3, top + h * 0.42, w * 0.4, h * 0.42);
  // Rear window.
  ctx.fillStyle = '#16202e';
  ctx.fillRect(left + w * 0.2, top + h * 0.3, w * 0.6, h * 0.16);
  // Light bar: alternating red and blue.
  const on = Math.floor(time * 3 + phase) % 2 === 0;
  ctx.fillStyle = on ? '#ff2e2e' : '#2e7bff';
  ctx.fillRect(left + w * 0.32, top + h * 0.14, w * 0.16, h * 0.08);
  ctx.fillStyle = on ? '#2e7bff' : '#ff2e2e';
  ctx.fillRect(left + w * 0.52, top + h * 0.14, w * 0.16, h * 0.08);
  ctx.fillStyle = on ? 'rgba(255, 46, 46, 0.3)' : 'rgba(46, 123, 255, 0.3)';
  ctx.beginPath();
  ctx.arc(left + w * 0.5, top + h * 0.18, w * 0.3, 0, Math.PI * 2);
  ctx.fill();
  // Taillights.
  ctx.fillStyle = '#ff2e2e';
  ctx.fillRect(left + w * 0.06, top + h * 0.58, w * 0.14, h * 0.08);
  ctx.fillRect(left + w * 0.8, top + h * 0.58, w * 0.14, h * 0.08);
  // "TARNWICK PD" on the rear.
  ctx.fillStyle = '#1a1a22';
  ctx.font = `bold ${Math.max(8, h * 0.09)}px ${'system-ui, sans-serif'}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('TARNWICK PD', left + w * 0.5, top + h * 0.78);
}

/** The burning car on the left of the road: flames, a smoke column, a crowd-free gap. */
export function drawBurningCar(ctx, x, y, w, time) {
  const h = w * 0.42;
  const left = x - w / 2;
  const top = y - h;
  ctx.fillStyle = 'rgba(20, 10, 5, 0.4)';
  ctx.beginPath();
  ctx.ellipse(x, y + h * 0.05, w * 0.52, h * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();
  // Charred body.
  ctx.fillStyle = '#2e2620';
  ctx.beginPath();
  ctx.moveTo(left, y);
  ctx.lineTo(left + w * 0.06, top + h * 0.44);
  ctx.lineTo(left + w * 0.16, top + h * 0.26);
  ctx.lineTo(left + w * 0.84, top + h * 0.26);
  ctx.lineTo(left + w * 0.94, top + h * 0.44);
  ctx.lineTo(left + w, y);
  ctx.closePath();
  ctx.fill();
  // Flames licking up from the engine bay.
  for (let f = 0; f < 3; f += 1) {
    const fx = left + w * (0.3 + f * 0.2) + Math.sin(time * 6 + f * 2) * 6;
    const fh = h * (0.5 + 0.25 * Math.sin(time * 8 + f * 3));
    const grad = ctx.createLinearGradient(0, top, 0, top - fh);
    grad.addColorStop(0, '#ff6b1a');
    grad.addColorStop(0.6, '#ffb03a');
    grad.addColorStop(1, 'rgba(255, 220, 120, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(fx - w * 0.09, top + h * 0.3);
    ctx.quadraticCurveTo(fx, top - fh, fx + w * 0.09, top + h * 0.3);
    ctx.closePath();
    ctx.fill();
  }
  // Smoke column, drifting up and left.
  for (let s = 0; s < 4; s += 1) {
    const st = ((time * 0.25 + s * 0.25) % 1);
    ctx.fillStyle = `rgba(60, 55, 50, ${0.55 * (1 - st)})`;
    ctx.beginPath();
    ctx.arc(left + w * 0.5 - st * 40, top - st * 150, 14 + st * 26, 0, Math.PI * 2);
    ctx.fill();
  }
}
