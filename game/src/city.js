// The city: seeded pastel buildings lining both sides of the Strand, a distant
// skyline on the horizon, palms and lamps. Buildings are generated once per seed;
// each one knows its side, its depth, its height and its colour, and the renderer
// draws it with a sunlit face and a shaded side so the street reads as 3D.

import { FIELD, PALETTE } from './config.js';
import { project, roadHalfWidth } from './geom.js';
import { pick } from './random.js';

/** Build the street: 14 buildings a side, spaced down the road, plus palms and lamps. */
export function createCity(random) {
  const buildings = [];
  for (let side = -1; side <= 1; side += 2) {
    let z = 0.06;
    let index = 0;
    while (z < 0.97) {
      const depth = 0.05 + random() * 0.06;
      buildings.push({
        side,
        z,
        depth,
        width: 0.16 + random() * 0.14,
        height: 90 + random() * 170,
        colour: pick(random, PALETTE.building),
        sideColour: pick(random, PALETTE.buildingSide),
        windows: 2 + Math.floor(random() * 4),
        awning: random() < 0.3,
        index: index++,
      });
      z += depth + 0.012;
    }
  }
  const palms = [];
  for (let i = 0; i < 16; i += 1) {
    palms.push({ side: i % 2 === 0 ? -1 : 1, z: 0.08 + random() * 0.8, lean: (random() - 0.5) * 0.5 });
  }
  const lamps = [];
  for (let i = 0; i < 10; i += 1) {
    lamps.push({ side: i % 2 === 0 ? -1 : 1, z: 0.1 + random() * 0.75 });
  }
  return { buildings, palms, lamps };
}

/** Draw one building: sunlit front, shaded side, lit windows, an awning sometimes. */
export function drawBuilding(ctx, b, time) {
  const base = project(b.side * 1.18, b.z);
  const far = project(b.side * 1.18, Math.min(0.99, b.z + b.depth));
  const w = b.width * FIELD.width * 0.62 * base.s;
  const h = b.height * base.s;
  if (w < 4 || h < 6) return;
  const x = base.x - (b.side < 0 ? w : 0);
  // Shaded side face (the face turned away from the low sun).
  const sideW = Math.max(6, w * 0.22);
  ctx.fillStyle = b.sideColour;
  if (b.side < 0) ctx.fillRect(x + w, base.y - h, sideW, h);
  else ctx.fillRect(x - sideW, base.y - h, sideW, h);
  // Sunlit front.
  ctx.fillStyle = b.colour;
  ctx.fillRect(x, base.y - h, w, h);
  // Roof line in the warm light.
  ctx.fillStyle = PALETTE.sun;
  ctx.fillRect(x, base.y - h, w, Math.max(2, 4 * base.s));
  // Lit windows: warm gold, some dark.
  const cols = Math.max(1, Math.floor(w / 26));
  const rows = Math.max(1, Math.floor(h / 34));
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const lit = ((b.index * 7 + r * 3 + c * 5) % 4) !== 0;
      ctx.fillStyle = lit ? PALETTE.windowLit : PALETTE.windowDark;
      const wx = x + 8 + (c * (w - 16)) / Math.max(1, cols);
      const wy = base.y - h + 12 + (r * (h - 22)) / Math.max(1, rows);
      ctx.fillRect(wx, wy, Math.max(3, (w - 16) / Math.max(1, cols) - 8), Math.max(4, 12 * base.s));
    }
  }
  // A lit shop awning at street level, sometimes.
  if (b.awning && base.s > 0.25) {
    ctx.fillStyle = '#e5534b';
    ctx.fillRect(x, base.y - 16 * base.s - 8, w, 10 * base.s + 4);
    ctx.fillStyle = PALETTE.windowLit;
    ctx.fillRect(x, base.y - 8 * base.s, w, 8 * base.s);
  }
  void far;
  void time;
}

/** A palm: a leaning trunk and a crown of fronds, silhouetted against the sun. */
export function drawPalm(ctx, p) {
  const base = project(p.side * 1.12, p.z);
  const h = 120 * base.s;
  if (h < 8) return;
  ctx.strokeStyle = '#6b4a2f';
  ctx.lineWidth = Math.max(2, 7 * base.s);
  ctx.beginPath();
  ctx.moveTo(base.x, base.y);
  ctx.quadraticCurveTo(base.x + p.lean * 40 * base.s, base.y - h * 0.6, base.x + p.lean * 70 * base.s, base.y - h);
  ctx.stroke();
  ctx.strokeStyle = '#4a7a3a';
  ctx.lineWidth = Math.max(1.5, 4 * base.s);
  const tx = base.x + p.lean * 70 * base.s;
  const ty = base.y - h;
  for (let f = -2; f <= 2; f += 1) {
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.quadraticCurveTo(tx + f * 22 * base.s, ty - 14 * base.s, tx + f * 34 * base.s, ty + 10 * base.s);
    ctx.stroke();
  }
}

/** A street lamp, already lit for golden hour. */
export function drawLamp(ctx, l) {
  const base = project(l.side * 1.08, l.z);
  const h = 64 * base.s;
  if (h < 6) return;
  ctx.strokeStyle = '#3a2c22';
  ctx.lineWidth = Math.max(1.5, 3 * base.s);
  ctx.beginPath();
  ctx.moveTo(base.x, base.y);
  ctx.lineTo(base.x, base.y - h);
  ctx.stroke();
  ctx.fillStyle = PALETTE.windowLit;
  ctx.beginPath();
  ctx.arc(base.x, base.y - h - 4 * base.s, Math.max(2, 5 * base.s), 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 233, 168, 0.18)';
  ctx.beginPath();
  ctx.arc(base.x, base.y - h - 4 * base.s, Math.max(4, 14 * base.s), 0, Math.PI * 2);
  ctx.fill();
}

/** The distant skyline: a dark warm silhouette with a few lit windows. */
export function drawSkyline(ctx, seed) {
  const base = FIELD.horizonY;
  ctx.fillStyle = PALETTE.skyline;
  let x = -20;
  let i = 0;
  while (x < FIELD.width + 20) {
    const w = 40 + ((seed * (i + 3) * 37) % 70);
    const h = 26 + ((seed * (i + 7) * 53) % 66);
    ctx.fillRect(x, base - h, w, h);
    x += w + 6;
    i += 1;
  }
  // The sea glints to the right of the Strand, past the buildings.
  ctx.fillStyle = PALETTE.sea;
  ctx.fillRect(FIELD.width * 0.86, base - 4, FIELD.width * 0.14 + 4, 8);
  ctx.fillStyle = 'rgba(255, 243, 196, 0.7)';
  ctx.fillRect(FIELD.width * 0.9, base - 2, 60, 2);
}
