// Drawing cars, scooters and people in canvas 2D. A car is a body with a cabin,
// windows, wheels, a spoiler and a plate, drawn at (x, y) with width w — the
// projection decides how big w is, so the same code draws the hero Falcon GT
// large in the foreground and a traffic car small near the horizon.

/** Draw a car facing away from the camera (rear view). y is the ground line. */
export function drawCar(ctx, x, y, w, color, opts = {}) {
  const h = w * 0.42;
  const bodyH = h * 0.62;
  const dark = opts.dark ?? '#1c1a18';
  ctx.save();
  ctx.translate(x, y);
  // Shadow.
  ctx.fillStyle = 'rgba(20, 12, 8, 0.4)';
  ctx.beginPath();
  ctx.ellipse(0, 2, w * 0.52, h * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();
  // Body.
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-w / 2, 0);
  ctx.lineTo(-w / 2 + w * 0.04, -bodyH * 0.7);
  ctx.lineTo(-w * 0.36, -bodyH);
  ctx.lineTo(w * 0.36, -bodyH);
  ctx.lineTo(w / 2 - w * 0.04, -bodyH * 0.7);
  ctx.lineTo(w / 2, 0);
  ctx.closePath();
  ctx.fill();
  // Cabin + rear window.
  ctx.fillStyle = dark;
  ctx.beginPath();
  ctx.moveTo(-w * 0.32, -bodyH * 0.98);
  ctx.lineTo(-w * 0.26, -h * 0.98);
  ctx.lineTo(w * 0.26, -h * 0.98);
  ctx.lineTo(w * 0.32, -bodyH * 0.98);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 220, 160, 0.35)';
  ctx.fillRect(-w * 0.24, -h * 0.96, w * 0.48, h * 0.1);
  // Spoiler.
  if (opts.spoiler) {
    ctx.fillStyle = dark;
    ctx.fillRect(-w * 0.42, -h * 1.06, w * 0.84, h * 0.05);
    ctx.fillRect(-w * 0.4, -h * 0.98, w * 0.03, h * 0.1);
    ctx.fillRect(w * 0.37, -h * 0.98, w * 0.03, h * 0.1);
  }
  // Tail lights.
  ctx.fillStyle = '#ff3b30';
  ctx.fillRect(-w * 0.46, -bodyH * 0.42, w * 0.14, h * 0.09);
  ctx.fillRect(w * 0.32, -bodyH * 0.42, w * 0.14, h * 0.09);
  // Plate.
  if (opts.plate) {
    ctx.fillStyle = '#f4ede2';
    ctx.fillRect(-w * 0.13, -bodyH * 0.34, w * 0.26, h * 0.14);
    ctx.fillStyle = '#1c1a18';
    ctx.font = `bold ${Math.max(8, h * 0.11)}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(opts.plate, 0, -bodyH * 0.27);
  }
  // Wheels.
  ctx.fillStyle = '#141210';
  ctx.fillRect(-w * 0.48, -h * 0.16, w * 0.09, h * 0.2);
  ctx.fillRect(w * 0.39, -h * 0.16, w * 0.09, h * 0.2);
  // Damage dents.
  if (opts.damage) {
    ctx.strokeStyle = 'rgba(20, 14, 10, 0.7)';
    ctx.lineWidth = Math.max(1, w * 0.008);
    ctx.beginPath();
    ctx.moveTo(-w * 0.3, -bodyH * 0.5);
    ctx.lineTo(-w * 0.18, -bodyH * 0.62);
    ctx.lineTo(-w * 0.08, -bodyH * 0.48);
    ctx.stroke();
  }
  ctx.restore();
}

/** Smoke wisp above a damaged car or a burning wreck. */
export function drawSmoke(ctx, x, y, s, time) {
  ctx.save();
  ctx.globalAlpha = 0.5;
  for (let i = 0; i < 3; i += 1) {
    const drift = Math.sin(time * 1.4 + i * 2.1) * 8 * s;
    const r = (10 + i * 9) * s;
    ctx.fillStyle = i === 2 ? 'rgba(90, 80, 70, 0.5)' : 'rgba(120, 110, 100, 0.45)';
    ctx.beginPath();
    ctx.arc(x + drift, y - (14 + i * 16) * s, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** Flames licking out of a burning wreck. */
export function drawFlame(ctx, x, y, s, time) {
  ctx.save();
  for (let i = 0; i < 3; i += 1) {
    const flick = Math.sin(time * 9 + i * 2.4) * 4 * s;
    ctx.fillStyle = i === 0 ? '#ff9e2a' : i === 1 ? '#ff6a1a' : '#ffd94c';
    ctx.beginPath();
    ctx.moveTo(x - (16 - i * 4) * s, y);
    ctx.quadraticCurveTo(x + flick, y - (34 - i * 7) * s, x + (16 - i * 4) * s, y);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

/** A scooter with a rider, side view. */
export function drawScooter(ctx, x, y, w, color) {
  const h = w * 0.55;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(-w * 0.32, -h * 0.18, w * 0.16, 0, Math.PI * 2);
  ctx.arc(w * 0.32, -h * 0.18, w * 0.16, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1c1a18';
  ctx.beginPath();
  ctx.arc(-w * 0.32, -h * 0.18, w * 0.07, 0, Math.PI * 2);
  ctx.arc(w * 0.32, -h * 0.18, w * 0.07, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.fillRect(-w * 0.28, -h * 0.42, w * 0.6, h * 0.16);
  ctx.fillStyle = '#e8e0d0';
  ctx.beginPath();
  ctx.arc(0, -h * 0.85, w * 0.13, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#3a4a5a';
  ctx.fillRect(-w * 0.08, -h * 0.72, w * 0.16, h * 0.34);
  ctx.restore();
}

/** A pedestrian: head, shirt, legs, walking. */
export function drawPed(ctx, x, y, s, shirt, walk) {
  const h = 34 * s + 8;
  ctx.save();
  ctx.translate(x, y);
  const swing = Math.sin(walk) * 3 * s;
  ctx.fillStyle = '#2a2118';
  ctx.fillRect(-3 * s - swing, -h * 0.28, 3 * s, h * 0.28);
  ctx.fillRect(swing, -h * 0.28, 3 * s, h * 0.28);
  ctx.fillStyle = shirt;
  ctx.fillRect(-6 * s, -h * 0.72, 12 * s, h * 0.46);
  ctx.fillStyle = '#e8c9a0';
  ctx.beginPath();
  ctx.arc(0, -h * 0.84, 5 * s + 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
