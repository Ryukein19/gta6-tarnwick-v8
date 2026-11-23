// The pause menu and the title screen: the full Tarnwick map with its six
// districts and turf, the career stats, the activities line, and the three save
// slots. The menu is drawn over a dimmed golden-hour panorama.

import { DISTRICTS, FIELD, FONT, PALETTE } from './config.js';
import { CAREER } from './missions.js';

/** District map positions (the pause-menu map is a stylised Tarnwick). */
export const MAP_SPOTS = [
  { name: 'TARNWICK STRAND', x: 0.62, y: 0.72, color: '#f2c94c' },
  { name: 'OLD TARNWICK', x: 0.42, y: 0.6, color: '#e8b48f' },
  { name: 'GLASSWORKS', x: 0.3, y: 0.34, color: '#cfe0d8' },
  { name: 'LANTERN MILE', x: 0.52, y: 0.44, color: '#ffb98a' },
  { name: 'THE MARINA', x: 0.78, y: 0.4, color: '#6fb7d9' },
  { name: 'HARLOW HEIGHTS', x: 0.22, y: 0.62, color: '#b98a68' },
];

function text(ctx, value, x, y, size, color, align = 'left', bold = false) {
  ctx.font = `${bold ? 'bold ' : ''}${size}px ${FONT}`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(value, x, y);
}

function bar(ctx, x, y, w, h, frac, fill) {
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, Math.max(0, Math.min(1, frac)) * w, h);
}

/** The pause menu: map left, progress + career + saves right. */
export function drawPauseMenu(ctx, state, saves) {
  const mx = 60, my = 60, mw = FIELD.width - 120, mh = FIELD.height - 120;
  ctx.fillStyle = 'rgba(12, 10, 14, 0.92)';
  ctx.fillRect(mx, my, mw, mh);
  ctx.strokeStyle = PALETTE.panelEdge;
  ctx.lineWidth = 2;
  ctx.strokeRect(mx + 1, my + 1, mw - 2, mh - 2);
  text(ctx, 'PAUSED — TARNWICK', mx + 28, my + 44, 26, PALETTE.text, 'left', true);
  text(ctx, '55% COMPLETE', mx + mw - 28, my + 44, 20, PALETTE.gold, 'right', true);

  // Map (left half).
  const mapX = mx + 28, mapY = my + 66, mapW = 560, mapH = 380;
  ctx.fillStyle = '#2a2620';
  ctx.fillRect(mapX, mapY, mapW, mapH);
  ctx.strokeStyle = 'rgba(244,237,226,0.35)';
  ctx.lineWidth = 1;
  ctx.strokeRect(mapX + 0.5, mapY + 0.5, mapW - 1, mapH - 1);
  // Coast + roads.
  ctx.fillStyle = '#3a5a74';
  ctx.beginPath();
  ctx.moveTo(mapX + mapW * 0.72, mapY);
  ctx.lineTo(mapX + mapW, mapY);
  ctx.lineTo(mapX + mapW, mapY + mapH * 0.55);
  ctx.lineTo(mapX + mapW * 0.8, mapY + mapH * 0.42);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(244,237,226,0.45)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(mapX + 20, mapY + mapH * 0.7);
  ctx.lineTo(mapX + mapW - 40, mapY + mapH * 0.3);
  ctx.moveTo(mapX + mapW * 0.4, mapY + 10);
  ctx.lineTo(mapX + mapW * 0.55, mapY + mapH - 10);
  ctx.stroke();
  for (const spot of MAP_SPOTS) {
    const sx = mapX + spot.x * mapW;
    const sy = mapY + spot.y * mapH;
    ctx.fillStyle = spot.color;
    ctx.beginPath();
    ctx.arc(sx, sy, 7, 0, Math.PI * 2);
    ctx.fill();
    text(ctx, spot.name, sx + 12, sy + 4, 11, PALETTE.text, 'left', true);
  }
  // YOU marker on the Strand.
  ctx.fillStyle = PALETTE.gold;
  ctx.beginPath();
  ctx.arc(mapX + 0.62 * mapW, mapY + 0.72 * mapH, 6, 0, Math.PI * 2);
  ctx.fill();
  text(ctx, 'YOU', mapX + 0.62 * mapW, mapY + 0.72 * mapH - 12, 11, PALETTE.gold, 'center', true);
  text(ctx, 'Turf:  Strand crew  ·  GREYLINE  ·  Contested', mapX, mapY + mapH + 22, 12, PALETTE.muted);

  // Right column: progress bars, career, activities, saves.
  const rx = mapX + mapW + 30, rw = mx + mw - rx - 28;
  let ry = my + 70;
  const rows = [
    ['STORY', CAREER.storyDone, CAREER.storyTotal],
    ['RACES', CAREER.racesDone, CAREER.racesTotal],
    ['STUNTS', CAREER.stuntsDone, CAREER.stuntsTotal],
    ['COLLECTIBLES', CAREER.collectiblesDone, CAREER.collectiblesTotal],
    ['DISTRICT JOBS', CAREER.districtJobsDone, CAREER.districtJobsTotal],
    ['CREW', CAREER.crewDone, CAREER.crewTotal],
  ];
  for (const [label, done, total] of rows) {
    text(ctx, label, rx, ry, 12, PALETTE.muted);
    text(ctx, `${done}/${total}`, rx + rw, ry, 12, PALETTE.text, 'right', true);
    bar(ctx, rx, ry + 6, rw, 6, done / total, PALETTE.gold);
    ry += 30;
  }
  ry += 6;
  text(ctx, 'CAREER', rx, ry, 13, PALETTE.gold, 'left', true);
  ry += 22;
  const stats = [
    `${CAREER.carsStolen} cars stolen`,
    `${CAREER.copsEscaped} cops escaped`,
    `${CAREER.kmDriven} km driven`,
    `${CAREER.peopleOut} people taken out`,
    `${CAREER.longestJump} m longest jump`,
  ];
  for (const s of stats) {
    text(ctx, '· ' + s, rx, ry, 13, PALETTE.text);
    ry += 20;
  }
  ry += 4;
  text(ctx, 'ACTIVITIES 2/4 · STREET RACE · DELIVERY · CHOP SHOP · STUNTS', rx, ry, 12, PALETTE.gold);
  ry += 26;
  text(ctx, 'NEXT GOAL', rx, ry, 12, PALETTE.muted);
  ry += 18;
  text(ctx, CAREER.nextGoal, rx, ry, 13, PALETTE.text);
  ry += 30;
  // Save slots.
  const slotW = (rw - 16) / 3;
  saves.forEach((s, i) => {
    const sx = rx + i * (slotW + 8);
    const sy = my + mh - 84;
    ctx.fillStyle = 'rgba(255,255,255,0.07)';
    ctx.fillRect(sx, sy, slotW, 56);
    ctx.strokeStyle = 'rgba(244,237,226,0.25)';
    ctx.strokeRect(sx + 0.5, sy + 0.5, slotW - 1, 55);
    if (s.empty) {
      text(ctx, `SLOT ${s.slot}`, sx + 8, sy + 22, 12, PALETTE.muted, 'left', true);
      text(ctx, 'EMPTY', sx + 8, sy + 42, 12, PALETTE.muted);
    } else {
      text(ctx, `SLOT ${s.slot} · ${s.act}`, sx + 8, sy + 20, 12, PALETTE.text, 'left', true);
      text(ctx, `${s.pct}% · $${s.money.toLocaleString('en-US')} · ${s.time}`, sx + 8, sy + 40, 11, PALETTE.muted);
    }
  });
  text(ctx, 'ESC resume · WASD drive · E enter/exit · 1-5 weapons', FIELD.width / 2, my + mh - 18, 12, PALETTE.muted, 'center');
}

/** The title screen: tagline, buttons, save slots, over the panorama. Text over
 *  the bright sky gets a dark shadow so it stays readable at contact-sheet size. */
export function drawTitleScreen(ctx, saves) {
  ctx.save();
  ctx.shadowColor = 'rgba(20, 12, 8, 0.85)';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 3;
  text(ctx, '— THE LAST GOOD LIGHT —', FIELD.width / 2, 168, 24, PALETTE.gold, 'center', true);
  text(ctx, 'TARNWICK', FIELD.width / 2, 268, 92, PALETTE.text, 'center', true);
  text(ctx, '3D · OPEN-WORLD CRIME · 8 STORY JOBS · POLICE · SAVES', FIELD.width / 2, 316, 18, PALETTE.text, 'center');
  text(ctx, 'A faded resort town. A crew in pieces. One way home.', FIELD.width / 2, 348, 16, PALETTE.muted, 'center');
  ctx.restore();
  const buttons = ['NEW GAME', 'CONTINUE', 'LOAD GAME'];
  buttons.forEach((b, i) => {
    const by = 396 + i * 52;
    ctx.fillStyle = i === 0 ? 'rgba(242,201,76,0.9)' : 'rgba(16,14,20,0.85)';
    ctx.fillRect(FIELD.width / 2 - 130, by, 260, 40);
    ctx.strokeStyle = PALETTE.panelEdge;
    ctx.strokeRect(FIELD.width / 2 - 129.5, by + 0.5, 259, 39);
    text(ctx, b, FIELD.width / 2, by + 27, 17, i === 0 ? '#141210' : PALETTE.text, 'center', true);
  });
  saves.forEach((s, i) => {
    const sx = FIELD.width / 2 - 270 + i * 190;
    const sy = 578;
    ctx.fillStyle = 'rgba(16,14,20,0.85)';
    ctx.fillRect(sx, sy, 170, 52);
    ctx.strokeStyle = 'rgba(244,237,226,0.25)';
    ctx.strokeRect(sx + 0.5, sy + 0.5, 169, 51);
    if (s.empty) {
      text(ctx, `SLOT ${s.slot}`, sx + 10, sy + 22, 12, PALETTE.muted, 'left', true);
      text(ctx, 'EMPTY', sx + 10, sy + 40, 12, PALETTE.muted);
    } else {
      text(ctx, `SLOT ${s.slot} · ${s.act}`, sx + 10, sy + 20, 12, PALETTE.text, 'left', true);
      text(ctx, `${s.pct}% · $${s.money.toLocaleString('en-US')} · ${s.time}`, sx + 10, sy + 38, 11, PALETTE.muted);
    }
  });
  text(ctx, 'Keyboard & mouse', FIELD.width / 2, 668, 13, '#3a2f26', 'center', true);
}
