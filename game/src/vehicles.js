// Vehicles: what they are and how they look. The hero car is Tam's orange Falcon GT,
// drawn in a three-quarter rear view — roof, rear window, trunk, taillights, wheels and a
// long shadow — so it reads as a car at contact-sheet size, not a rectangle. Police
// cruisers carry a light bar; Dray's sedan is black; traffic is a seeded mix of colours.

import { PALETTE } from './config.js';
import { groundShadow } from './geom.js';

/** Every drivable / stealable model in Tarnwick. */
export const VEHICLES = {
  falcon: { name: 'FALCON GT', colour: '#ff7a1a', dark: '#c85a10', top: 107, accel: 1.0, desc: 'Tam\u2019s car' },
  sedan: { name: 'DRAY SEDAN', colour: '#1c1c22', dark: '#0c0c10', top: 96, accel: 0.85, desc: 'black, armoured' },
  cruiser: { name: 'TPD CRUISER', colour: '#1a2a4a', dark: '#0e1830', top: 100, accel: 0.9, desc: 'police' },
  coupe: { name: 'VELOZ COMET', colour: '#c94c4c', dark: '#8c2f2f', top: 102, accel: 0.92, desc: 'street coupe' },
  pickup: { name: 'HARBOUR PICKUP', colour: '#4c7a5c', dark: '#2f5238', top: 88, accel: 0.8, desc: 'work truck' },
  taxi: { name: 'STRAND TAXI', colour: '#f2c94c', dark: '#b8932f', top: 90, accel: 0.82, desc: 'cab' },
  scooter: { name: 'SCOOTER', colour: '#7ab8c9', dark: '#4c8296', top: 55, accel: 0.7, desc: 'two wheels' },
};

/**
 * A car in three-quarter rear view. (x, y) is the centre of the rear bumper; `w` is the
 * body width. Damage dents the panels and adds a smoke wisp; police adds a light bar.
 */
export function drawCar(ctx, x, y, w, model, opts = {}) {
  const h = w * 0.60;
  const damage = opts.damage || 0;
  const police = !!opts.police;
  const brake = !!opts.brake;
  groundShadow(ctx, x, y + h * 0.40, w * 1.12, h * 0.20, 0.42);

  // Rear spoiler (a thin wing above the trunk).
  ctx.fillStyle = model.dark;
  ctx.fillRect(x - w * 0.42, y - h * 0.86, w * 0.84, h * 0.05);
  ctx.fillRect(x - w * 0.40, y - h * 0.86, w * 0.05, h * 0.10);
  ctx.fillRect(x + w * 0.35, y - h * 0.86, w * 0.05, h * 0.10);
  // Cabin: roof + rear window, tall enough to read as a car, not a slab.
  ctx.fillStyle = model.colour;
  ctx.beginPath();
  ctx.moveTo(x - w * 0.40, y - h * 0.42);
  ctx.lineTo(x - w * 0.32, y - h * 0.84);
  ctx.lineTo(x + w * 0.32, y - h * 0.84);
  ctx.lineTo(x + w * 0.40, y - h * 0.42);
  ctx.closePath();
  ctx.fill();
  // Rear window (dark glass) set into the cabin.
  ctx.fillStyle = '#16202e';
  ctx.beginPath();
  ctx.moveTo(x - w * 0.33, y - h * 0.44);
  ctx.lineTo(x - w * 0.27, y - h * 0.78);
  ctx.lineTo(x + w * 0.27, y - h * 0.78);
  ctx.lineTo(x + w * 0.33, y - h * 0.44);
  ctx.closePath();
  ctx.fill();
  // Sun glint across the glass.
  ctx.fillStyle = 'rgba(255, 240, 200, 0.5)';
  ctx.fillRect(x - w * 0.24, y - h * 0.74, w * 0.48, h * 0.04);
  // Roof highlight.
  ctx.fillStyle = 'rgba(255, 240, 200, 0.45)';
  ctx.fillRect(x - w * 0.32, y - h * 0.86, w * 0.64, h * 0.04);
  // Body: the main slab under the cabin, with a sunlit top edge.
  ctx.fillStyle = model.colour;
  ctx.beginPath();
  ctx.moveTo(x - w * 0.52, y - h * 0.08);
  ctx.lineTo(x - w * 0.44, y - h * 0.44);
  ctx.lineTo(x + w * 0.44, y - h * 0.44);
  ctx.lineTo(x + w * 0.52, y - h * 0.08);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 240, 200, 0.35)';
  ctx.fillRect(x - w * 0.44, y - h * 0.44, w * 0.88, h * 0.04);
  // Side panels (darker) so the body has depth.
  ctx.fillStyle = model.dark;
  ctx.fillRect(x - w * 0.52, y - h * 0.30, w * 0.05, h * 0.24);
  ctx.fillRect(x + w * 0.47, y - h * 0.30, w * 0.05, h * 0.24);
  // Trunk line and plate.
  ctx.fillStyle = model.dark;
  ctx.fillRect(x - w * 0.50, y - h * 0.14, w, h * 0.04);
  ctx.fillStyle = '#e8e0c8';
  ctx.fillRect(x - w * 0.09, y - h * 0.09, w * 0.18, h * 0.11);
  ctx.fillStyle = '#222';
  ctx.font = `bold ${Math.max(9, h * 0.07)}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('TAM-6', x, y - h * 0.005);
  // Taillights: bright red, brighter under braking.
  ctx.fillStyle = brake ? '#ff2a1a' : '#d42a1e';
  ctx.fillRect(x - w * 0.48, y - h * 0.36, w * 0.19, h * 0.10);
  ctx.fillRect(x + w * 0.29, y - h * 0.36, w * 0.19, h * 0.10);
  ctx.fillStyle = 'rgba(255, 120, 90, 0.5)';
  ctx.fillRect(x - w * 0.48, y - h * 0.36, w * 0.19, h * 0.03);
  ctx.fillRect(x + w * 0.29, y - h * 0.36, w * 0.19, h * 0.03);
  // Wheels: dark with a light hub, clearly separate from the body.
  ctx.fillStyle = '#101014';
  ctx.beginPath();
  ctx.arc(x - w * 0.44, y - h * 0.02, h * 0.11, 0, Math.PI * 2);
  ctx.arc(x + w * 0.44, y - h * 0.02, h * 0.11, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#c8c8d0';
  ctx.beginPath();
  ctx.arc(x - w * 0.44, y - h * 0.02, h * 0.05, 0, Math.PI * 2);
  ctx.arc(x + w * 0.44, y - h * 0.02, h * 0.05, 0, Math.PI * 2);
  ctx.fill();
  // Damage: dented corner + smoke wisp.
  if (damage > 0) {
    ctx.fillStyle = 'rgba(40, 30, 30, 0.55)';
    ctx.beginPath();
    ctx.moveTo(x + w * 0.30, y - h * 0.50);
    ctx.lineTo(x + w * 0.50, y - h * 0.30);
    ctx.lineTo(x + w * 0.50, y - h * 0.12);
    ctx.lineTo(x + w * 0.30, y - h * 0.12);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(200, 200, 200, 0.5)';
    ctx.beginPath();
    ctx.arc(x + w * 0.34, y - h * 0.62, 10 + damage * 8, 0, Math.PI * 2);
    ctx.arc(x + w * 0.40, y - h * 0.78, 14 + damage * 10, 0, Math.PI * 2);
    ctx.fill();
  }
  // Police light bar.
  if (police) {
    ctx.fillStyle = '#ff3b30';
    ctx.fillRect(x - w * 0.16, y - h * 0.82, w * 0.16, h * 0.07);
    ctx.fillStyle = '#2a6aff';
    ctx.fillRect(x, y - h * 0.82, w * 0.16, h * 0.07);
  }
}

/** A small scooter, for the right sidewalk. */
export function drawScooter(ctx, x, y, s) {
  groundShadow(ctx, x, y, 46 * s, 8 * s, 0.35);
  ctx.fillStyle = '#7ab8c9';
  ctx.beginPath();
  ctx.arc(x, y - 18 * s, 10 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2a2a30';
  ctx.fillRect(x - 22 * s, y - 8 * s, 44 * s, 6 * s);
  ctx.beginPath();
  ctx.arc(x - 16 * s, y - 2 * s, 7 * s, 0, Math.PI * 2);
  ctx.arc(x + 16 * s, y - 2 * s, 7 * s, 0, Math.PI * 2);
  ctx.fill();
}

/** A burning car on the left of the road: a wreck with flames and a smoke column. */
export function drawBurningCar(ctx, x, y, w) {
  drawCar(ctx, x, y, w, VEHICLES.coupe, { damage: 1 });
  // Flames licking out of the engine bay.
  ctx.fillStyle = '#ff9d1a';
  ctx.beginPath();
  ctx.moveTo(x - w * 0.30, y - w * 0.28);
  ctx.quadraticCurveTo(x - w * 0.10, y - w * 0.62, x + w * 0.05, y - w * 0.30);
  ctx.quadraticCurveTo(x - w * 0.05, y - w * 0.42, x - w * 0.30, y - w * 0.28);
  ctx.fill();
  ctx.fillStyle = '#ff5a1a';
  ctx.beginPath();
  ctx.moveTo(x - w * 0.18, y - w * 0.26);
  ctx.quadraticCurveTo(x, y - w * 0.48, x + w * 0.12, y - w * 0.26);
  ctx.closePath();
  ctx.fill();
  // Smoke column.
  ctx.fillStyle = 'rgba(60, 60, 60, 0.55)';
  for (let i = 0; i < 4; i += 1) {
    ctx.beginPath();
    ctx.arc(x + w * 0.05 + i * 8 - 12, y - w * 0.45 - i * 26, 16 + i * 6, 0, Math.PI * 2);
    ctx.fill();
  }
}
