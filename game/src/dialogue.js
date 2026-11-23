// Dialogue: the portrait box with a named character, a role, and one line that moves
// the story. Portraits are flat 2D faces — a coloured disc, hair, eyes — distinct per
// character so the box reads as a person, not a grey square.
import { DIALOGUE } from './config.js';

/** Draw a small flat portrait: coloured background disc, hair cap, face, eyes. */
export function drawPortrait(ctx, x, y, size, colour, seed) {
  const r = size / 2;
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  // Hair.
  ctx.fillStyle = seed % 2 === 0 ? '#241a12' : '#3a2a18';
  ctx.beginPath();
  ctx.arc(x, y - r * 0.28, r * 0.72, Math.PI, 0);
  ctx.fill();
  // Face.
  ctx.fillStyle = '#e8b98a';
  ctx.beginPath();
  ctx.arc(x, y + r * 0.08, r * 0.52, 0, Math.PI * 2);
  ctx.fill();
  // Eyes.
  ctx.fillStyle = '#1c1a18';
  ctx.beginPath();
  ctx.arc(x - r * 0.2, y, r * 0.07, 0, Math.PI * 2);
  ctx.arc(x + r * 0.2, y, r * 0.07, 0, Math.PI * 2);
  ctx.fill();
}

/** The dialogue box: portrait left, name + role on top, the line below. Returns its height. */
export function drawDialogueBox(ctx, x, y, width, which) {
  const d = DIALOGUE[which];
  const pad = 12;
  const portraitSize = 52;
  const lineHeight = 17;
  const boxHeight = 84;
  ctx.fillStyle = 'rgba(12, 10, 14, 0.88)';
  ctx.fillRect(x, y, width, boxHeight);
  ctx.strokeStyle = 'rgba(242, 201, 76, 0.55)';
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 0.5, y + 0.5, width - 1, boxHeight - 1);
  drawPortrait(ctx, x + pad + portraitSize / 2, y + pad + portraitSize / 2, portraitSize, d.colour, which === 'chase' ? 1 : 2);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#f2c94c';
  ctx.font = 'bold 14px system-ui, sans-serif';
  ctx.fillText(`${d.name}  ·  ${d.role.toUpperCase()}`, x + pad * 2 + portraitSize, y + pad);
  ctx.fillStyle = '#f5efe4';
  ctx.font = '15px system-ui, sans-serif';
  ctx.fillText(d.line, x + pad * 2 + portraitSize, y + pad + 24, width - pad * 3 - portraitSize);
  ctx.fillStyle = '#c9bda6';
  ctx.font = '11px system-ui, sans-serif';
  ctx.fillText('SPACE — continue', x + pad * 2 + portraitSize, y + pad + 46);
  return boxHeight;
}
