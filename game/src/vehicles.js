// Drawing cars in 2D. Every car is a small set of flat shapes — body, cabin, windows,
// wheels, plate, damage — drawn at a projected position and scale, so the same code
// draws the hero Falcon GT at 25% of the frame and a traffic car near the horizon.
// The hero is drawn from the rear-three-quarter: wide orange body, spoiler, TAM-6 plate,
// a dented rear panel and a smoke wisp.
import { project } from './geom.js';
import { HERO } from './config.js';

/** Draw a car seen from behind at the given world position. widthM is the car's width in metres. */
export function drawCar(ctx, lateral, depth, widthM, colour, opts = {}) {
  const p = project(lateral, 0, depth);
  const boost = opts.scaleBoost ?? 1;
  const w = widthM * 150 * p.s * boost;
  const h = w * 0.42;
  const x = p.x - w / 2;
  const y = p.y - h;
  const dented = opts.dented === true;
  const smoke = opts.smoke === true;

  // Shadow on the road.
  ctx.fillStyle = 'rgba(20, 12, 8, 0.45)';
  ctx.beginPath();
  ctx.ellipse(p.x, p.y + 2 * p.s, w * 0.52, h * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();

  // Body.
  ctx.fillStyle = colour;
  roundRect(ctx, x, y + h * 0.3, w, h * 0.7, h * 0.16);
  ctx.fill();
  // Cabin + windows.
  ctx.fillStyle = shade(colour, -18);
  roundRect(ctx, x + w * 0.14, y, w * 0.66, h * 0.42, h * 0.12);
  ctx.fill();
  ctx.fillStyle = 'rgba(30, 42, 58, 0.9)';
  roundRect(ctx, x + w * 0.2, y + h * 0.06, w * 0.54, h * 0.26, h * 0.08);
  ctx.fill();
  // Rear lights.
  ctx.fillStyle = '#ff2e2e';
  ctx.fillRect(x + w * 0.04, y + h * 0.52, w * 0.16, h * 0.1);
  ctx.fillRect(x + w * 0.8, y + h * 0.52, w * 0.16, h * 0.1);
  // Wheels.
  ctx.fillStyle = '#14100e';
  ctx.fillRect(x + w * 0.06, y + h * 0.86, w * 0.16, h * 0.16);
  ctx.fillRect(x + w * 0.78, y + h * 0.86, w * 0.16, h * 0.16);
  // Plate.
  if (w > 46) {
    ctx.fillStyle = '#f5efe4';
    ctx.fillRect(x + w * 0.4, y + h * 0.62, w * 0.2, h * 0.14);
    ctx.fillStyle = '#1c1a18';
    ctx.font = `bold ${Math.max(7, h * 0.11)}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(opts.plate ?? '', x + w * 0.5, y + h * 0.69);
  }
  // Dented rear panel + smoke wisp.
  if (dented) {
    ctx.fillStyle = 'rgba(20, 16, 12, 0.5)';
    ctx.beginPath();
    ctx.ellipse(x + w * 0.72, y + h * 0.5, w * 0.12, h * 0.16, 0.4, 0, Math.PI * 2);
    ctx.fill();
  }
  if (smoke) {
    ctx.fillStyle = 'rgba(220, 220, 220, 0.35)';
    ctx.beginPath();
    ctx.ellipse(x + w * 0.82, y - h * 0.28, w * 0.09, h * 0.2, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(220, 220, 220, 0.22)';
    ctx.beginPath();
    ctx.ellipse(x + w * 0.86, y - h * 0.55, w * 0.13, h * 0.26, 0.2, 0, Math.PI * 2);
    ctx.fill();
  }
  return { x, y, w, h };
}

/** The hero Falcon GT: whole, large, centred, spoiler on top, TAM-6 plate, smoke wisp.
 * The camera car is drawn 1.65x the perspective scale so it reads ~25% of the frame
 * wide at its road position (base y ~548, above the HUD strip). */
export function drawHero(ctx, lateral, depth) {
  const p = project(lateral, 0, depth);
  const w = 2.1 * 150 * p.s * 1.65;
  const h = w * 0.42;
  const x = p.x - w / 2;
  const y = p.y - h;
  drawCar(ctx, lateral, depth, 2.1, HERO.colour, { dented: true, smoke: true, plate: HERO.plate, scaleBoost: 1.65 });
  // Spoiler.
  ctx.fillStyle = '#1c1a18';
  ctx.fillRect(x + w * 0.06, y + h * 0.08, w * 0.88, h * 0.07);
  ctx.fillRect(x + w * 0.1, y + h * 0.14, w * 0.05, h * 0.12);
  ctx.fillRect(x + w * 0.85, y + h * 0.14, w * 0.05, h * 0.12);
  // Brake glow.
  ctx.fillStyle = 'rgba(255, 46, 46, 0.85)';
  ctx.fillRect(x + w * 0.04, y + h * 0.5, w * 0.2, h * 0.12);
  ctx.fillRect(x + w * 0.76, y + h * 0.5, w * 0.2, h * 0.12);
  return { x, y, w, h };
}

/** A police cruiser: black-and-white body, light bar, "TARNWICK PD" on the rear. */
export function drawCruiser(ctx, lateral, depth) {
  const r = drawCar(ctx, lateral, depth, 2.0, '#20242c', { plate: 'TPD' });
  ctx.fillStyle = '#e8e4da';
  ctx.fillRect(r.x + r.w * 0.08, r.y + r.h * 0.3, r.w * 0.84, r.h * 0.22);
  // Light bar.
  ctx.fillStyle = '#ff2e2e';
  ctx.fillRect(r.x + r.w * 0.3, r.y - r.h * 0.06, r.w * 0.18, r.h * 0.1);
  ctx.fillStyle = '#2e7fe5';
  ctx.fillRect(r.x + r.w * 0.52, r.y - r.h * 0.06, r.w * 0.18, r.h * 0.1);
  return r;
}

/** Dray's black sedan, the mission target: sleek, black, 58% health. */
export function drawSedan(ctx, lateral, depth) {
  return drawCar(ctx, lateral, depth, 2.05, '#14161c', { plate: 'DRAY-1' });
}

/** A burning car: dark body, orange flame licks, grey smoke column. */
export function drawBurningCar(ctx, lateral, depth, t) {
  const r = drawCar(ctx, lateral, depth, 1.9, '#2b2b2e', {});
  const flick = 0.7 + 0.3 * Math.sin(t * 9 + lateral * 5);
  ctx.fillStyle = `rgba(255, ${Math.floor(120 + 60 * flick)}, 20, 0.9)`;
  ctx.beginPath();
  ctx.ellipse(r.x + r.w * 0.5, r.y - r.h * 0.2, r.w * 0.2 * flick, r.h * 0.5 * flick, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(60, 60, 66, 0.5)';
  ctx.beginPath();
  ctx.ellipse(r.x + r.w * 0.5, r.y - r.h * 0.9, r.w * 0.24, r.h * 0.55, 0.15, 0, Math.PI * 2);
  ctx.fill();
  return r;
}

function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function shade(hex, amount) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, Math.max(0, (n >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((n >> 8) & 255) + amount));
  const b = Math.min(255, Math.max(0, (n & 255) + amount));
  return `rgb(${r}, ${g}, ${b})`;
}
