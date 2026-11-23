// The city of Tarnwick: a golden-hour sky with a low sun, sun-soaked pastel buildings
// lining both sides of the Strand boulevard, and the road itself receding to the horizon.
// Every building is drawn from a seeded layout, so the same seed always paints the same
// street — the cover and the title panorama share this sky.

import { FIELD, PALETTE, DISTRICTS } from './config.js';
import { CAMERA, depthScale, depthY, depthX } from './geom.js';

/** Golden-hour sky: warm orange-pink at the horizon, soft violet up top, sun disc low. */
export function drawSky(ctx, sunX, sunY) {
  const g = ctx.createLinearGradient(0, 0, 0, FIELD.horizonY + 40);
  g.addColorStop(0, PALETTE.skyTop);
  g.addColorStop(0.55, PALETTE.skyMid);
  g.addColorStop(1, PALETTE.skyLow);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, FIELD.width, FIELD.horizonY + 40);

  // Sun glow, then the disc itself, low on the horizon.
  const glow = ctx.createRadialGradient(sunX, sunY, 8, sunX, sunY, 190);
  glow.addColorStop(0, 'rgba(255, 243, 196, 0.95)');
  glow.addColorStop(0.35, 'rgba(255, 157, 92, 0.55)');
  glow.addColorStop(1, 'rgba(255, 157, 92, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(sunX - 200, sunY - 200, 400, 400);
  ctx.fillStyle = PALETTE.sunCore;
  ctx.beginPath();
  ctx.arc(sunX, sunY, 34, 0, Math.PI * 2);
  ctx.fill();

  // Thin warm clouds catching the light.
  ctx.fillStyle = 'rgba(255, 220, 180, 0.35)';
  for (const [cx, cy, w] of [[180, 90, 220], [560, 60, 160], [980, 120, 240], [1120, 70, 130]]) {
    ctx.beginPath();
    ctx.ellipse(cx, cy, w / 2, 9, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * One building face: a pastel box with lit windows and a darker shaded side, drawn at a
 * depth so the street narrows toward the vanishing point. `side` is -1 (left) or 1 (right).
 */
export function drawBuilding(ctx, random, side, depth, baseY) {
  const s = depthScale(depth);
  const w = 150 * s + 40;
  const h = (150 + random.range(0, 110)) * s + 30;
  const x = depthX(side * (0.52 + random.range(0, 0.10)), depth) - (side < 0 ? w : 0);
  const y = baseY - h;
  const colours = [PALETTE.buildingCream, PALETTE.buildingPeach, PALETTE.buildingTeal, PALETTE.buildingRose];
  const face = colours[Math.floor(random.next() * colours.length)];
  // Front face (sunlit) and shaded side face.
  ctx.fillStyle = face;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = PALETTE.buildingShadow;
  ctx.fillRect(x + (side < 0 ? w - 12 * s : 0), y, 12 * s, h);
  // Lit windows: warm yellow, some dark.
  const cols = Math.max(2, Math.floor(w / 26));
  const rows = Math.max(2, Math.floor(h / 34));
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      ctx.fillStyle = random.next() < 0.55 ? PALETTE.windowLit : PALETTE.windowDark;
      ctx.fillRect(x + 8 + c * ((w - 16) / cols), y + 10 + r * ((h - 18) / rows), (w - 16) / cols - 6, (h - 18) / rows - 8);
    }
  }
  // Roof line catching the sun.
  ctx.fillStyle = 'rgba(255, 240, 200, 0.8)';
  ctx.fillRect(x, y, w, 3);
  // Long shadow toward the camera.
  ctx.fillStyle = 'rgba(40, 20, 20, 0.25)';
  const shW = w * 0.9;
  ctx.beginPath();
  ctx.moveTo(x + (side < 0 ? w * 0.1 : w * 0.9), baseY);
  ctx.lineTo(x + (side < 0 ? w * 0.1 : w * 0.9) + (side < 0 ? -shW : shW) * 0.4, baseY + 60 * s + 20);
  ctx.lineTo(x + (side < 0 ? w * 0.1 : w * 0.9) + (side < 0 ? -shW : shW) * 0.4 + shW, baseY + 60 * s + 20);
  ctx.lineTo(x + (side < 0 ? w * 0.1 : w * 0.9) + shW, baseY);
  ctx.closePath();
  ctx.fill();
}

/** Both sides of the street, near to far. */
export function drawStreet(ctx, random) {
  const depths = [0.05, 0.22, 0.42, 0.62, 0.80, 0.92];
  for (const d of depths) {
    const y = depthY(d) + 8;
    drawBuilding(ctx, random, -1, d, y);
    drawBuilding(ctx, random, 1, d, y);
  }
}

/** The boulevard itself: a trapezoid from the horizon to the bottom of the frame, with
 * lane markings, a centre line and a crosswalk near the camera. */
export function drawRoad(ctx) {
  const topW = 46;
  const botW = 1080;
  const topY = FIELD.horizonY + 6;
  const botY = FIELD.height;
  const cx = CAMERA.vx;
  ctx.fillStyle = PALETTE.road;
  ctx.beginPath();
  ctx.moveTo(cx - topW / 2, topY);
  ctx.lineTo(cx + topW / 2, topY);
  ctx.lineTo(cx + botW / 2, botY);
  ctx.lineTo(cx - botW / 2, botY);
  ctx.closePath();
  ctx.fill();
  // Sidewalks.
  ctx.fillStyle = PALETTE.sidewalk;
  ctx.beginPath();
  ctx.moveTo(cx - topW / 2 - 90, topY);
  ctx.lineTo(cx - topW / 2, topY);
  ctx.lineTo(cx - botW / 2, botY);
  ctx.lineTo(cx - botW / 2 - 150, botY);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx + topW / 2 + 90, topY);
  ctx.lineTo(cx + topW / 2, topY);
  ctx.lineTo(cx + botW / 2, botY);
  ctx.lineTo(cx + botW / 2 + 150, botY);
  ctx.closePath();
  ctx.fill();
  // Lane dashes, shrinking toward the horizon.
  ctx.fillStyle = PALETTE.lane;
  for (let i = 0; i < 7; i += 1) {
    const t = i / 7;
    const y = topY + t * (botY - topY);
    const w = 4 + t * 10;
    const h = 6 + t * 26;
    ctx.fillRect(cx - w / 2, y, w, h);
  }
  // Crosswalk stripes near the camera.
  ctx.fillStyle = 'rgba(240, 230, 210, 0.85)';
  for (let i = 0; i < 8; i += 1) {
    const x = cx - botW / 2 + 60 + i * ((botW - 120) / 8);
    ctx.fillRect(x, botY - 84, (botW - 120) / 8 - 14, 26);
  }
}

/** The six districts as a lookup for the map and the HUD location line. */
export function districtAt(x, y) {
  let best = DISTRICTS[0];
  let bestD = Infinity;
  for (const d of DISTRICTS) {
    const dx = d.x - x;
    const dy = d.y - y;
    const dist = dx * dx + dy * dy;
    if (dist < bestD) {
      bestD = dist;
      best = d;
    }
  }
  return best;
}
