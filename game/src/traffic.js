// Traffic: the cars ahead on the Strand, a scooter on the right sidewalk, and the
// pedestrians on both sidewalks. Everything is seeded, so the same seed always gives
// the same street — the staged shots are deterministic.

import { PALETTE } from './config.js';
import { project, roadX, sidewalkX } from './geom.js';
import { pick } from './random.js';

const CAR_COLOURS = ['#2e8f8a', '#e8dcc0', '#3a4a6b', '#c9a86b', '#7a3a4a', '#4a6b3a'];
const PED_COLOURS = ['#e5534b', '#4fc3f7', '#f2c94c', '#e88bb0', '#7ac74f', '#f7f2e8'];

/** The street for the cover chase: dense, busy, golden hour. */
export function createTraffic(random) {
  const cars = [
    { lane: -0.45, z: 0.62, colour: pick(random, CAR_COLOURS), kind: 'sedan', speed: 62 },
    { lane: 0.42, z: 0.55, colour: pick(random, CAR_COLOURS), kind: 'sedan', speed: 58 },
    { lane: -0.1, z: 0.74, colour: '#2a2a33', kind: 'target', speed: 88 },
    { lane: 0.68, z: 0.38, colour: pick(random, CAR_COLOURS), kind: 'taxi', speed: 54 },
    { lane: -0.68, z: 0.45, colour: pick(random, CAR_COLOURS), kind: 'sedan', speed: 49 },
    { lane: 0.15, z: 0.86, colour: pick(random, CAR_COLOURS), kind: 'sedan', speed: 66 },
  ];
  const scooter = { side: 1, z: 0.42, colour: '#e5534b' };
  const peds = [];
  for (let i = 0; i < 7; i += 1) {
    peds.push({
      side: i % 2 === 0 ? -1 : 1,
      z: 0.35 + random() * 0.5,
      colour: pick(random, PED_COLOURS),
      walk: random() * Math.PI * 2,
    });
  }
  return { cars, scooter, peds };
}

/** One traffic car, drawn from behind at its depth: roof, rear window, lights, plate. */
export function drawTrafficCar(ctx, car, time) {
  const p = project(car.lane, car.z);
  const w = 150 * p.s;
  const h = 62 * p.s;
  if (w < 8) return;
  const x = p.x - w / 2;
  const y = p.y - h;
  // Shadow on the road.
  ctx.fillStyle = 'rgba(20, 10, 5, 0.35)';
  ctx.beginPath();
  ctx.ellipse(p.x, p.y + 2, w * 0.55, 7 * p.s + 2, 0, 0, Math.PI * 2);
  ctx.fill();
  // Body.
  ctx.fillStyle = car.colour;
  ctx.beginPath();
  ctx.moveTo(x, y + h);
  ctx.lineTo(x + w * 0.06, y + h * 0.34);
  ctx.lineTo(x + w * 0.16, y + h * 0.12);
  ctx.lineTo(x + w * 0.84, y + h * 0.12);
  ctx.lineTo(x + w * 0.94, y + h * 0.34);
  ctx.lineTo(x + w, y + h);
  ctx.closePath();
  ctx.fill();
  // Rear window.
  ctx.fillStyle = '#1a2230';
  ctx.fillRect(x + w * 0.2, y + h * 0.16, w * 0.6, h * 0.2);
  // Taillights: warm red in the low sun.
  ctx.fillStyle = '#ff3b30';
  ctx.fillRect(x + w * 0.05, y + h * 0.52, w * 0.16, h * 0.1);
  ctx.fillRect(x + w * 0.79, y + h * 0.52, w * 0.16, h * 0.1);
  // Plate.
  ctx.fillStyle = '#f7f2e8';
  ctx.fillRect(x + w * 0.42, y + h * 0.68, w * 0.16, h * 0.14);
  if (car.kind === 'taxi') {
    ctx.fillStyle = PALETTE.gold;
    ctx.fillRect(x + w * 0.3, y + h * 0.02, w * 0.4, h * 0.1);
  }
  if (car.kind === 'target') {
    // Dray's black sedan: a gold pinstripe and a dented rear quarter.
    ctx.fillStyle = PALETTE.gold;
    ctx.fillRect(x + w * 0.06, y + h * 0.44, w * 0.88, Math.max(1.5, 3 * p.s));
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(x + w * 0.68, y + h * 0.3, w * 0.2, h * 0.5);
  }
  void time;
}

/** The scooter on the right sidewalk, with its rider. */
export function drawScooter(ctx, scooter, time) {
  const p = project(0, scooter.z);
  const x = sidewalkX(scooter.side, scooter.z);
  const s = p.s;
  if (s < 0.08) return;
  ctx.fillStyle = 'rgba(20, 10, 5, 0.3)';
  ctx.beginPath();
  ctx.ellipse(x, p.y + 2, 16 * s + 3, 3 * s + 1, 0, 0, Math.PI * 2);
  ctx.fill();
  // Rider.
  ctx.fillStyle = '#f2c94c';
  ctx.beginPath();
  ctx.arc(x, p.y - 26 * s, 7 * s + 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2a2a33';
  ctx.fillRect(x - 5 * s, p.y - 20 * s, 10 * s, 14 * s);
  // Scooter body.
  ctx.fillStyle = scooter.colour;
  ctx.fillRect(x - 14 * s, p.y - 10 * s, 28 * s, 8 * s);
  ctx.beginPath();
  ctx.arc(x - 10 * s, p.y, 5 * s + 1, 0, Math.PI * 2);
  ctx.arc(x + 10 * s, p.y, 5 * s + 1, 0, Math.PI * 2);
  ctx.fill();
  void time;
}

/** One pedestrian: a small figure with a coloured top, walking the sidewalk. */
export function drawPed(ctx, ped, time) {
  const x = sidewalkX(ped.side, ped.z);
  const p = project(0, ped.z);
  const s = p.s;
  if (s < 0.06) return;
  const bob = Math.sin(time * 3 + ped.walk) * 2 * s;
  ctx.fillStyle = 'rgba(20, 10, 5, 0.3)';
  ctx.beginPath();
  ctx.ellipse(x, p.y + 1, 8 * s + 2, 2.5 * s + 1, 0, 0, Math.PI * 2);
  ctx.fill();
  // Legs.
  ctx.strokeStyle = '#2a2a33';
  ctx.lineWidth = Math.max(1.5, 3 * s);
  ctx.beginPath();
  ctx.moveTo(x, p.y - 14 * s + bob * 0.4);
  ctx.lineTo(x - 4 * s, p.y);
  ctx.moveTo(x, p.y - 14 * s + bob * 0.4);
  ctx.lineTo(x + 4 * s, p.y);
  ctx.stroke();
  // Body.
  ctx.fillStyle = ped.colour;
  ctx.fillRect(x - 5 * s, p.y - 28 * s + bob * 0.4, 10 * s, 15 * s);
  // Head.
  ctx.fillStyle = '#e8c39a';
  ctx.beginPath();
  ctx.arc(x, p.y - 33 * s + bob * 0.4, 5 * s + 1.5, 0, Math.PI * 2);
  ctx.fill();
}

/** A market-stall shopper for the on-foot shot: same figure, warmer light. */
export function drawShopper(ctx, x, y, s, colour, time) {
  const bob = Math.sin(time * 2 + x) * 1.5 * s;
  ctx.fillStyle = 'rgba(20, 10, 5, 0.35)';
  ctx.beginPath();
  ctx.ellipse(x, y + 1, 10 * s + 2, 3 * s + 1, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = colour;
  ctx.fillRect(x - 7 * s, y - 34 * s + bob * 0.4, 14 * s, 20 * s);
  ctx.fillStyle = '#e8c39a';
  ctx.beginPath();
  ctx.arc(x, y - 40 * s + bob * 0.4, 6 * s + 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#2a2a33';
  ctx.lineWidth = Math.max(2, 4 * s);
  ctx.beginPath();
  ctx.moveTo(x, y - 14 * s);
  ctx.lineTo(x - 5 * s, y);
  ctx.moveTo(x, y - 14 * s);
  ctx.lineTo(x + 5 * s, y);
  ctx.stroke();
}
