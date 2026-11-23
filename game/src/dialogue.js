// Dialogue: the boxes with a named character, a role and a line that moves the story.
// Every top entry does this — a portrait, a name, a role, one line. Tarnwick's two
// staged speakers are Ilya Vane (GREYLINE lieutenant, on the cover) and Mama Odelle
// (market matriarch, on the foot shot).

import { roundRect } from './geom.js';

export const DIALOGUE = {
  ilya: {
    name: 'ILYA VANE',
    role: 'GREYLINE lieutenant',
    colour: '#c98af2',
    line: '\u201CDray\u2019s sedan is on the boulevard at sunset. Wreck it \u2014 make him walk home.\u201D',
  },
  odelle: {
    name: 'MAMA ODELLE',
    role: 'market matriarch',
    colour: '#f2c94c',
    line: '\u201CThe Strand pays its debts, Renn. Collect the stall money \u2014 all five stalls.\u201D',
  },
  sena: {
    name: 'SENA KOVAC',
    role: 'runs the Kovac Garage',
    colour: '#ff8a5c',
    line: '\u201CTam\u2019s car is yours now. Don\u2019t bring it back dented. Bring it back feared.\u201D',
  },
  bram: {
    name: 'UNCLE BRAM',
    role: 'fixer · runs the Strand',
    colour: '#f2c94c',
    line: '\u201CSix years, and you walk in like the tide. The Strand remembers, boy.\u201D',
  },
};

/**
 * Draw a dialogue box: portrait disc on the left, name + role on top, the line below.
 * (x, y) is the top-left; the box is w wide and grows with the line.
 */
export function drawDialogue(ctx, x, y, w, speaker, font) {
  const pad = 12;
  const portraitR = 22;
  const lineH = 20;
  const h = 92;
  ctx.fillStyle = 'rgba(12, 14, 24, 0.88)';
  roundRect(ctx, x, y, w, h, 8);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 190, 90, 0.55)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // Portrait disc with initials.
  const px = x + pad + portraitR;
  const py = y + h / 2;
  ctx.fillStyle = speaker.colour;
  ctx.beginPath();
  ctx.arc(px, py, portraitR, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  ctx.arc(px - 6, py - 2, 2.5, 0, Math.PI * 2);
  ctx.arc(px + 6, py - 2, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = `bold 13px ${font}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(speaker.name.split(' ').map((p) => p[0]).join(''), px, py + 12);
  // Name on one line, role on the next — never overlapping.
  const tx = x + pad + portraitR * 2 + 10;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#f4ede0';
  ctx.font = `bold 15px ${font}`;
  ctx.fillText(speaker.name, tx, y + 22);
  ctx.fillStyle = '#f2c94c';
  ctx.font = `bold 10px ${font}`;
  ctx.fillText(speaker.role.toUpperCase(), tx, y + 38);
  // The line, wrapped to the box width.
  ctx.fillStyle = '#e8e0d0';
  ctx.font = `italic 14px ${font}`;
  const words = speaker.line.split(' ');
  let line = '';
  let ly = y + 58;
  const maxW = w - (tx - x) - pad;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, tx, ly);
      line = word;
      ly += lineH;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, tx, ly);
}
