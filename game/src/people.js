// People: pedestrians on the sidewalks and the crew portraits that make the ability
// cards and the roster read as people, not text. Every portrait is a coloured disc with
// initials and a distinct silhouette — cheap, readable at contact-sheet size, and never a
// grey box.

import { CREW } from './config.js';

/** A pedestrian: head, body, legs, one accent colour. `s` is the scale. */
export function drawPedestrian(ctx, x, y, s, colour) {
  ctx.fillStyle = 'rgba(20, 10, 10, 0.35)';
  ctx.beginPath();
  ctx.ellipse(x, y, 10 * s, 3 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  // Legs.
  ctx.fillStyle = '#2a2a34';
  ctx.fillRect(x - 5 * s, y - 16 * s, 4 * s, 16 * s);
  ctx.fillRect(x + 1 * s, y - 16 * s, 4 * s, 16 * s);
  // Body.
  ctx.fillStyle = colour;
  ctx.fillRect(x - 7 * s, y - 34 * s, 14 * s, 20 * s);
  // Arms.
  ctx.fillRect(x - 10 * s, y - 32 * s, 3 * s, 14 * s);
  ctx.fillRect(x + 7 * s, y - 32 * s, 3 * s, 14 * s);
  // Head.
  ctx.fillStyle = '#e8c8a0';
  ctx.beginPath();
  ctx.arc(x, y - 40 * s, 6 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2a2a30';
  ctx.beginPath();
  ctx.arc(x, y - 43 * s, 6 * s, Math.PI, 0);
  ctx.fill();
}

/** A crew portrait: coloured disc, initials, role colour ring. `r` is the disc radius. */
export function drawPortrait(ctx, x, y, r, member) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = member.colour;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.stroke();
  // Simple face: darker hair cap + eyes.
  ctx.fillStyle = 'rgba(30, 20, 20, 0.75)';
  ctx.beginPath();
  ctx.arc(x, y - r * 0.28, r * 0.62, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  ctx.arc(x - r * 0.28, y - r * 0.05, r * 0.09, 0, Math.PI * 2);
  ctx.arc(x + r * 0.28, y - r * 0.05, r * 0.09, 0, Math.PI * 2);
  ctx.fill();
  // Initials along the bottom of the disc.
  ctx.fillStyle = '#fff';
  ctx.font = `bold ${Math.max(9, r * 0.62)}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(member.initials, x, y + r * 0.48);
  ctx.restore();
}

/** Look a crew member up by initials. */
export function crewByInitials(initials) {
  return CREW.find((c) => c.initials === initials) || CREW[0];
}

/** The four roster lines, as the left panel shows them. */
export function rosterLines() {
  return CREW.map((c) => ({ initials: c.initials, name: c.name, role: c.role, colour: c.colour }));
}
