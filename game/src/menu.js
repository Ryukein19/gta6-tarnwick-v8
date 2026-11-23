// The pause menu and the title screen. The pause menu is a full system in one frame:
// a map of all six districts with turf colours and the route, the completion bars, the
// career stats, the next goal, the activities line and three save slots. The title screen
// is the same golden-hour panorama as the cover, with the tagline and the save slots.

import { FIELD, FONT, PALETTE, DISTRICTS, CAREER, SAVES } from './config.js';
import { roundRect } from './geom.js';
import { drawSky, drawBuilding } from './city.js';
import { createRandom } from './random.js';

function text(ctx, value, x, y, size, colour, align = 'left', weight = '') {
  ctx.font = `${weight ? `${weight} ` : ''}${size}px ${FONT}`;
  ctx.fillStyle = colour;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(value, x, y);
}

function bar(ctx, x, y, w, label, done, total) {
  text(ctx, label, x, y + 13, 12, PALETTE.text, 'left', 'bold');
  const bx = x + 150;
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  roundRect(ctx, bx, y + 4, w - 150 - 60, 10, 5);
  ctx.fill();
  ctx.fillStyle = PALETTE.gold;
  const frac = total === 0 ? 0 : done / total;
  roundRect(ctx, bx, y + 4, (w - 150 - 60) * frac, 10, 5);
  ctx.fill();
  text(ctx, `${done}/${total}`, x + w - 52, y + 13, 12, PALETTE.gold, 'right', 'bold');
}

/** The district map: dark sea + land, six turf dots with names, route arrow, YOU marker. */
export function drawMap(ctx, x, y, w, h) {
  ctx.fillStyle = 'rgba(16, 22, 38, 0.92)';
  roundRect(ctx, x, y, w, h, 10);
  ctx.fill();
  ctx.strokeStyle = PALETTE.panelEdge;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // Landmass.
  ctx.fillStyle = '#3a4a5a';
  ctx.beginPath();
  ctx.ellipse(x + w * 0.52, y + h * 0.52, w * 0.42, h * 0.40, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2a3a4a';
  ctx.beginPath();
  ctx.ellipse(x + w * 0.30, y + h * 0.30, w * 0.16, h * 0.14, 0, 0, Math.PI * 2);
  ctx.fill();
  // Route: Strand -> Marina.
  const a = DISTRICTS[0];
  const b = DISTRICTS[4];
  ctx.strokeStyle = PALETTE.gold;
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 6]);
  ctx.beginPath();
  ctx.moveTo(x + a.x * w, y + a.y * h);
  ctx.lineTo(x + b.x * w, y + b.y * h);
  ctx.stroke();
  ctx.setLineDash([]);
  // District dots + names.
  for (const d of DISTRICTS) {
    const dx = x + d.x * w;
    const dy = y + d.y * h;
    ctx.fillStyle = d.colour;
    ctx.beginPath();
    ctx.arc(dx, dy, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(dx, dy, 3, 0, Math.PI * 2);
    ctx.fill();
    text(ctx, d.name, dx + 11, dy + 4, 11, PALETTE.text, 'left', 'bold');
  }
  // YOU marker on the Strand.
  const px = x + a.x * w;
  const py = y + a.y * h;
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.moveTo(px, py - 14);
  ctx.lineTo(px - 8, py - 2);
  ctx.lineTo(px + 8, py - 2);
  ctx.closePath();
  ctx.fill();
  text(ctx, 'YOU', px, py - 18, 10, PALETTE.gold, 'center', 'bold');
  // Turf legend.
  text(ctx, 'STRAND CREW', x + 14, y + h - 30, 10, '#f2c94c', 'left', 'bold');
  text(ctx, 'GREYLINE–DRAY', x + 120, y + h - 30, 10, '#6ab8ff', 'left', 'bold');
  text(ctx, 'CONTESTED', x + 240, y + h - 30, 10, '#e8907a', 'left', 'bold');
}

/** The pause menu screen: map left, stats + saves right. */
export function drawPauseMenu(ctx) {
  ctx.fillStyle = 'rgba(10, 12, 20, 0.90)';
  ctx.fillRect(0, 0, FIELD.width, FIELD.height);
  const mx = 40;
  const my = 60;
  const mw = 560;
  const mh = 520;
  drawMap(ctx, mx, my, mw, mh);
  text(ctx, 'TARNWICK — MAP', mx + 16, my + 26, 15, PALETTE.text, 'left', 'bold');
  text(ctx, `${CAREER.complete}% COMPLETE`, mx + mw - 16, my + 26, 15, PALETTE.gold, 'right', 'bold');

  const sx = 640;
  const sy = 60;
  const sw = 600;
  // Progress bars.
  text(ctx, 'PROGRESS', sx, sy + 20, 14, PALETTE.gold, 'left', 'bold');
  const bars = [
    ['STORY', 4, 8], ['RACES', 2, 4], ['STUNTS', 3, 8],
    ['COLLECTIBLES', 9, 20], ['DISTRICT JOBS', 5, 7], ['CREW', 3, 3],
  ];
  bars.forEach(([label, done, total], i) => {
    bar(ctx, sx, sy + 34 + i * 26, sw, label, done, total);
  });
  // Career stats.
  const cy = sy + 220;
  text(ctx, 'CAREER', sx, cy + 20, 14, PALETTE.gold, 'left', 'bold');
  const stats = [
    ['Cars stolen', '37'], ['Cops escaped', '9'], ['Driven', '61.4 km'],
    ['People taken out', '17'], ['Longest jump', '34 m'],
  ];
  stats.forEach(([label, value], i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = sx + col * 300;
    const yy = cy + 44 + row * 26;
    text(ctx, label, x, yy, 13, PALETTE.muted);
    text(ctx, value, x + 280, yy, 13, PALETTE.text, 'right', 'bold');
  });
  text(ctx, `NEXT GOAL  ${CAREER.nextGoal}`, sx, cy + 132, 12, PALETTE.text);
  text(ctx, CAREER.activities, sx, cy + 154, 12, PALETTE.gold, 'left', 'bold');
  // Save slots.
  const syy = cy + 180;
  text(ctx, 'SAVES', sx, syy + 18, 14, PALETTE.gold, 'left', 'bold');
  SAVES.forEach((s, i) => {
    const x = sx + i * 204;
    ctx.fillStyle = 'rgba(12, 14, 24, 0.88)';
    roundRect(ctx, x, syy + 30, 192, 64, 8);
    ctx.fill();
    ctx.strokeStyle = i === 0 ? PALETTE.gold : 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    text(ctx, `SLOT ${s.slot} — ${s.act}`, x + 12, syy + 54, 12, PALETTE.text, 'left', 'bold');
    text(ctx, `${s.complete}  ·  ${s.money}  ·  ${s.time}`, x + 12, syy + 76, 11, PALETTE.muted);
  });
  text(ctx, 'ESC — RESUME', FIELD.width / 2, FIELD.height - 34, 12, PALETTE.muted, 'center');
}

/** The title screen: the golden-hour panorama, the tagline, the buttons, the saves. */
export function drawTitle(ctx, seed) {
  const random = createRandom(seed);
  drawSky(ctx, FIELD.width * 0.62, FIELD.horizonY - 30);
  // City skyline: a dense band of sun-soaked buildings across the full width, sitting on
  // the horizon line, so the title text below it sits on the dark gradient, not on the
  // bright buildings.
  const skylineColours = [PALETTE.buildingCream, PALETTE.buildingPeach, PALETTE.buildingTeal, PALETTE.buildingRose];
  const baseY = FIELD.horizonY + 74;
  let sx = 0;
  while (sx < FIELD.width) {
    const w = 70 + random.range(0, 70);
    const h = 46 + random.range(0, 78);
    const col = skylineColours[Math.floor(random.next() * skylineColours.length)];
    ctx.fillStyle = col;
    ctx.fillRect(sx, baseY - h, w, h);
    ctx.fillStyle = 'rgba(255, 240, 200, 0.8)';
    ctx.fillRect(sx, baseY - h, w, 3);
    // Lit windows.
    const cols = Math.max(2, Math.floor(w / 22));
    const rows = Math.max(2, Math.floor(h / 26));
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        ctx.fillStyle = random.next() < 0.55 ? PALETTE.windowLit : PALETTE.windowDark;
        ctx.fillRect(sx + 6 + c * ((w - 12) / cols), baseY - h + 8 + r * ((h - 14) / rows), (w - 12) / cols - 5, (h - 14) / rows - 6);
      }
    }
    sx += w + random.range(2, 14);
  }
  // Dark gradient over the lower half for the text.
  const g = ctx.createLinearGradient(0, FIELD.height - 360, 0, FIELD.height);
  g.addColorStop(0, 'rgba(10, 12, 20, 0)');
  g.addColorStop(1, 'rgba(10, 12, 20, 0.92)');
  ctx.fillStyle = g;
  ctx.fillRect(0, FIELD.height - 360, FIELD.width, 360);

  text(ctx, '— THE LAST GOOD LIGHT —', FIELD.width / 2, 400, 20, PALETTE.gold, 'center', 'bold');
  ctx.font = `bold 84px ${FONT}`;
  ctx.fillStyle = '#fff3e0';
  ctx.textAlign = 'center';
  ctx.fillText('TARNWICK', FIELD.width / 2, 484);
  text(ctx, '3D · OPEN-WORLD CRIME · 8 STORY JOBS · POLICE · SAVES', FIELD.width / 2, 514, 16, PALETTE.text, 'center', 'bold');
  text(ctx, 'A faded resort town. A crew in pieces. One way home.', FIELD.width / 2, 538, 15, PALETTE.muted, 'center');
  text(ctx, 'Keyboard & mouse', FIELD.width / 2, 560, 13, PALETTE.muted, 'center');

  // Buttons.
  const buttons = ['NEW GAME', 'CONTINUE', 'LOAD GAME'];
  const bw = 200;
  const bh = 44;
  const gap = 18;
  const totalW = buttons.length * bw + (buttons.length - 1) * gap;
  let bx = (FIELD.width - totalW) / 2;
  buttons.forEach((label, i) => {
    ctx.fillStyle = i === 0 ? PALETTE.gold : 'rgba(12, 14, 24, 0.88)';
    roundRect(ctx, bx, 578, bw, bh, 8);
    ctx.fill();
    ctx.strokeStyle = i === 0 ? PALETTE.gold : 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    text(ctx, label, bx + bw / 2, 578 + 28, 15, i === 0 ? '#1a1a1a' : PALETTE.text, 'center', 'bold');
    bx += bw + gap;
  });
  // Save slots under the buttons.
  const sy = 636;
  SAVES.forEach((s, i) => {
    const x = (FIELD.width - totalW) / 2 + i * (bw + gap);
    ctx.fillStyle = 'rgba(12, 14, 24, 0.75)';
    roundRect(ctx, x, sy, bw, 48, 8);
    ctx.fill();
    text(ctx, `SLOT ${s.slot} — ${s.act}`, x + 12, sy + 19, 12, PALETTE.text, 'left', 'bold');
    text(ctx, `${s.complete}  ·  ${s.money}  ·  ${s.time}`, x + 12, sy + 38, 11, PALETTE.muted);
  });
  text(ctx, 'WASD DRIVE / WALK · E ENTER OR STEAL A CAR · SPACE HANDBRAKE · 1-5 WEAPONS · F PUNCH · CLICK SHOOT · M MUTE · ESC PAUSE', FIELD.width / 2, FIELD.height - 10, 11, PALETTE.muted, 'center');
}
