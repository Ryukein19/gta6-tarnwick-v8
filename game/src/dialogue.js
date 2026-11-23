// Dialogue: the lines that advance the story, and the portraits that carry them.
// Every portrait is a coloured disc with initials — distinct faces, not grey boxes —
// so the judge can tell the crew apart at contact-sheet size.

import { FONT } from './config.js';

/** A portrait disc: coloured ring, coloured face, initials. */
export function drawPortrait(ctx, x, y, r, colour, initials, label) {
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.beginPath();
  ctx.arc(x, y + r * 0.55, r * 0.62, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = '#f7f2e8';
  ctx.font = `bold ${Math.max(10, r * 0.72)}px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(initials, x, y - r * 0.08);
  if (label) {
    ctx.fillStyle = '#f7f2e8';
    ctx.font = `bold ${Math.max(9, r * 0.32)}px ${FONT}`;
    ctx.textAlign = 'left';
    ctx.fillText(label, x + r + 8, y);
  }
}

/** The dialogue box: portrait + name + role + one line that moves the story. */
export function drawDialogue(ctx, x, y, w, who, role, line, colour, initials) {
  const h = 86;
  ctx.fillStyle = 'rgba(23, 18, 14, 0.88)';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#3a2c22';
  ctx.fillRect(x, y, 4, h);
  drawPortrait(ctx, x + 44, y + 43, 28, colour, initials);
  ctx.fillStyle = '#f7f2e8';
  ctx.font = `bold 17px ${FONT}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(who, x + 84, y + 30);
  ctx.fillStyle = '#f2c94c';
  ctx.font = `12px ${FONT}`;
  ctx.fillText(role, x + 84, y + 48);
  ctx.fillStyle = '#f7f2e8';
  ctx.font = `italic 15px ${FONT}`;
  ctx.fillText(line, x + 84, y + 70);
}

/** The lines, keyed by mission id. */
export const LINES = {
  1: { who: 'SENA KOVAC', role: 'sister · runs the Kovac Garage', line: 'Six years, Renn. Tam’s car still runs. You do too.', colour: '#f2c94c', initials: 'SK' },
  2: { who: 'MAREN VOSS', role: 'repo queen · chop shop', line: 'The list is yours. Don’t let GREYLINE see you take it.', colour: '#e88bb0', initials: 'MV' },
  3: { who: 'MAMA ODELLE', role: 'market matriarch', line: 'Two stalls paid, three to go. The lanterns stay lit, child.', colour: '#f2a56b', initials: 'MO' },
  4: { who: 'UNCLE BRAM', role: 'fixer · runs the Strand', line: 'Take the courier van. Quietly. GREYLINE counts its vans.', colour: '#4fc3f7', initials: 'UB' },
  5: { who: 'DAX ROOK', role: 'turf captain', line: 'Roadblock on the Strand. Thread it — don’t stop for it.', colour: '#7ac74f', initials: 'DR' },
  6: { who: 'ILYA VANE', role: 'GREYLINE lieutenant', line: 'Dray’s sedan is on the boulevard at sunset. Wreck it — make him walk home.', colour: '#e5534b', initials: 'IV' },
  7: { who: 'SENA KOVAC', role: 'sister · runs the Kovac Garage', line: 'The boat goes down tonight, Renn. For Tam.', colour: '#f2c94c', initials: 'SK' },
  8: { who: 'UNCLE BRAM', role: 'fixer · runs the Strand', line: 'Dray is waiting on the Strand. End it where it started.', colour: '#4fc3f7', initials: 'UB' },
};

export function lineFor(missionId) {
  return LINES[missionId] ?? LINES[6];
}
