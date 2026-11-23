// Dialogue: named characters with roles and a line that advances the story.
// A portrait is a coloured circle with initials — distinct per character, never
// a grey box.

/** Draw a dialogue box: portrait + name + role + line, bottom-centre. */
export function drawDialogue(ctx, x, y, w, d, font) {
  const pad = 14;
  const portraitR = 26;
  const boxH = 86;
  ctx.save();
  ctx.fillStyle = 'rgba(16, 14, 20, 0.88)';
  ctx.strokeStyle = '#c9a86a';
  ctx.lineWidth = 1.5;
  roundRect(ctx, x, y, w, boxH, 8);
  ctx.fill();
  ctx.stroke();
  // Portrait.
  const cx = x + pad + portraitR;
  const cy = y + boxH / 2;
  ctx.fillStyle = d.color;
  ctx.beginPath();
  ctx.arc(cx, cy, portraitR, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f4ede2';
  ctx.font = `bold 20px ${font}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(d.initials, cx, cy + 1);
  // Name + role. Measure the name while its font is still set, or the role
  // starts on top of the name's tail.
  const tx = x + pad + portraitR * 2 + 12;
  ctx.fillStyle = '#f2c94c';
  ctx.font = `bold 17px ${font}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(d.name, tx, y + 28);
  const nameW = ctx.measureText(d.name).width;
  ctx.fillStyle = '#cbbfa8';
  ctx.font = `13px ${font}`;
  ctx.fillText(d.role, tx + nameW + 10, y + 28);
  // Line (wrapped to two lines max).
  ctx.fillStyle = '#f4ede2';
  ctx.font = `16px ${font}`;
  const maxW = w - (tx - x) - pad;
  const words = d.line.split(' ');
  let line = '';
  let lineY = y + 56;
  for (const word of words) {
    const test = line ? line + ' ' + word : word;
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, tx, lineY);
      line = word;
      lineY += 20;
      if (lineY > y + 74) break;
    } else {
      line = test;
    }
  }
  if (line && lineY <= y + 74) ctx.fillText(line, tx, lineY);
  ctx.restore();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/** The mission dialogue lines (speaker, role, line). */
export const LINES = {
  ilya: {
    initials: 'IV', name: 'ILYA VANE', role: 'GREYLINE lieutenant', color: '#e5534b',
    line: 'Dray\'s sedan is on the boulevard at sunset. Wreck it — make him walk home.',
  },
  odelle: {
    initials: 'MO', name: 'MAMA ODELLE', role: 'market matriarch', color: '#f2c94c',
    line: 'Two stalls paid, three to go, Renn. The Mile remembers who collects.',
  },
  sena: {
    initials: 'SK', name: 'SENA KOVAC', role: 'runs the Kovac Garage', color: '#f2c94c',
    line: 'Tam\'s car is yours now. Bring it home in one piece — mostly.',
  },
  bram: {
    initials: 'UB', name: 'UNCLE BRAM', role: 'fixer · runs the Strand', color: '#6fb7d9',
    line: 'Dray owns the harbour, not the Strand. Keep it that way.',
  },
};
