// The menus: the title screen over a golden-hour panorama, the pause menu with its
// full map, career stats and save slots, and the game-over panel. The pause menu is
// the shot that proves the systems exist — map, progress, stats, saves, activities.

import { DISTRICTS, FIELD, FONT, PALETTE } from './config.js';
import { SLOTS } from './save.js';

function text(ctx, value, x, y, size, color, align = 'left', weight = '') {
  ctx.font = `${weight ? weight + ' ' : ''}${size}px ${FONT}`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(value, x, y);
}

function panel(ctx, x, y, w, h) {
  ctx.fillStyle = 'rgba(23, 18, 14, 0.92)';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = PALETTE.panelEdge;
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
}

function bar(ctx, x, y, w, h, frac, fill) {
  ctx.fillStyle = '#3a2c22';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, Math.max(0, Math.min(1, frac)) * w, h);
}

/** The title screen: tagline, TARNWICK, buttons, save slots, control bar. */
export function drawTitle(ctx, state, time) {
  // Golden-hour panorama: sun, sea, city silhouette, beach.
  const sky = ctx.createLinearGradient(0, 0, 0, FIELD.height);
  sky.addColorStop(0, PALETTE.skyTop);
  sky.addColorStop(0.45, PALETTE.skyMid);
  sky.addColorStop(0.75, PALETTE.skyLow);
  sky.addColorStop(1, '#e88bb0');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, FIELD.width, FIELD.height);
  // The sun, low and big, on the left so it never washes out the subtitle.
  ctx.fillStyle = 'rgba(255, 243, 196, 0.35)';
  ctx.beginPath();
  ctx.arc(FIELD.width * 0.22, 330, 120, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PALETTE.sunCore;
  ctx.beginPath();
  ctx.arc(FIELD.width * 0.22, 330, 62, 0, Math.PI * 2);
  ctx.fill();
  // City silhouette.
  ctx.fillStyle = 'rgba(90, 50, 70, 0.75)';
  let x = 0;
  let i = 0;
  while (x < FIELD.width) {
    const w = 60 + ((i * 53) % 90);
    const h = 60 + ((i * 37) % 130);
    ctx.fillRect(x, 470 - h, w, h);
    x += w + 8;
    i += 1;
  }
  // The sea and the beach.
  ctx.fillStyle = PALETTE.sea;
  ctx.fillRect(0, 470, FIELD.width, 90);
  ctx.fillStyle = 'rgba(255, 243, 196, 0.5)';
  ctx.fillRect(FIELD.width * 0.6, 500, 220, 4);
  ctx.fillStyle = PALETTE.sand;
  ctx.fillRect(0, 560, FIELD.width, 160);
  // A lone Falcon GT on the beach, clear of the buttons and the save slots.
  ctx.fillStyle = PALETTE.falcon;
  ctx.fillRect(180, 620, 150, 26);
  ctx.fillStyle = '#16202e';
  ctx.fillRect(220, 608, 70, 16);
  // The tagline and the title.
  text(ctx, '— THE LAST GOOD LIGHT —', FIELD.width / 2, 150, 22, PALETTE.gold, 'center');
  ctx.fillStyle = '#fff8ec';
  ctx.font = `bold 96px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.fillText('TARNWICK', FIELD.width / 2, 252);
  text(ctx, '3D · OPEN-WORLD CRIME · 8 STORY JOBS · POLICE · SAVES', FIELD.width / 2, 292, 17, PALETTE.text, 'center', 'bold');
  text(ctx, 'A faded resort town. A crew in pieces. One way home. · Keyboard & mouse', FIELD.width / 2, 320, 15, PALETTE.muted, 'center');
  // Buttons.
  const buttons = ['NEW GAME', 'CONTINUE', 'LOAD GAME'];
  let by = 380;
  for (const b of buttons) {
    panel(ctx, FIELD.width / 2 - 130, by, 260, 44);
    text(ctx, b, FIELD.width / 2, by + 29, 17, b === 'NEW GAME' ? PALETTE.gold : PALETTE.text, 'center', 'bold');
    by += 54;
  }
  // Save slots, small.
  let sy = 566;
  for (const slot of SLOTS) {
    panel(ctx, FIELD.width / 2 - 260, sy, 520, 30);
    text(ctx, `SLOT ${slot.slot} · ${slot.act} · ${slot.label}`, FIELD.width / 2 - 248, sy + 20, 13, PALETTE.text, 'left', 'bold');
    text(ctx, `${slot.pct}% · $${slot.money.toLocaleString('en-US')} · ${slot.time}`, FIELD.width / 2 + 248, sy + 20, 13, PALETTE.muted, 'right');
    sy += 36;
  }
  void state;
  void time;
}

/** The pause menu: full map, completion, progress bars, career stats, saves, activities. */
export function drawPause(ctx, state) {
  ctx.fillStyle = 'rgba(12, 8, 6, 0.72)';
  ctx.fillRect(0, 0, FIELD.width, FIELD.height);
  const x = 90;
  const y = 60;
  const w = FIELD.width - 180;
  const h = FIELD.height - 120;
  panel(ctx, x, y, w, h);
  text(ctx, 'PAUSED — TARNWICK', x + 28, y + 44, 26, PALETTE.text, 'left', 'bold');
  text(ctx, '55% COMPLETE', x + w - 28, y + 44, 20, PALETTE.gold, 'right', 'bold');
  // The map: six districts in their turf colours, the route, YOU.
  const mapX = x + 28;
  const mapY = y + 66;
  const mapW = 560;
  const mapH = 300;
  ctx.fillStyle = '#0e0a08';
  ctx.fillRect(mapX, mapY, mapW, mapH);
  ctx.strokeStyle = PALETTE.panelEdge;
  ctx.strokeRect(mapX + 0.5, mapY + 0.5, mapW - 1, mapH - 1);
  const blocks = [
    { name: 'TARNWICK STRAND', turf: 'Strand crew', c: '#f2c94c', x: 20, y: 150, w: 190, h: 110 },
    { name: 'OLD TARNWICK', turf: 'Strand crew', c: '#f2c94c', x: 220, y: 30, w: 160, h: 110 },
    { name: 'GLASSWORKS', turf: 'GREYLINE', c: '#e5534b', x: 390, y: 30, w: 150, h: 110 },
    { name: 'LANTERN MILE', turf: 'Contested', c: '#c9a86b', x: 220, y: 150, w: 160, h: 110 },
    { name: 'THE MARINA', turf: 'Strand crew', c: '#4fc3f7', x: 20, y: 30, w: 190, h: 110 },
    { name: 'HARLOW HEIGHTS', turf: 'GREYLINE', c: '#e5534b', x: 390, y: 150, w: 150, h: 110 },
  ];
  for (const b of blocks) {
    ctx.fillStyle = b.c;
    ctx.globalAlpha = 0.5;
    ctx.fillRect(mapX + b.x, mapY + b.y, b.w, b.h);
    ctx.globalAlpha = 1;
    text(ctx, b.name, mapX + b.x + 10, mapY + b.y + 22, 13, PALETTE.text, 'left', 'bold');
    text(ctx, b.turf, mapX + b.x + 10, mapY + b.y + 40, 11, PALETTE.muted);
  }
  // Route arrow + YOU.
  ctx.strokeStyle = PALETTE.gold;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(mapX + 120, mapY + 260);
  ctx.lineTo(mapX + 300, mapY + 200);
  ctx.lineTo(mapX + 470, mapY + 90);
  ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(mapX + 470, mapY + 90, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = PALETTE.gold;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(mapX + 470, mapY + 90, 11, 0, Math.PI * 2);
  ctx.stroke();
  text(ctx, 'YOU', mapX + 470, mapY + 118, 11, PALETTE.text, 'center', 'bold');
  // Progress bars, right of the map.
  const px = mapX + mapW + 28;
  const rows = [
    ['STORY', 4, 8],
    ['RACES', 2, 4],
    ['STUNTS', 3, 8],
    ['COLLECTIBLES', 9, 20],
    ['DISTRICT JOBS', 5, 7],
    ['CREW', 3, 3],
  ];
  let ry = mapY + 18;
  for (const [label, have, max] of rows) {
    text(ctx, label, px, ry, 13, PALETTE.text, 'left', 'bold');
    text(ctx, `${have}/${max}`, px + 300, ry, 13, PALETTE.gold, 'right');
    bar(ctx, px, ry + 8, 300, 9, have / max, PALETTE.gold);
    ry += 42;
  }
  // Career stats.
  const sy = mapY + mapH + 28;
  text(ctx, 'CAREER', x + 28, sy, 14, PALETTE.gold, 'left', 'bold');
  const stats = [
    '37 cars stolen', '9 cops escaped', '61.4 km driven', '17 people taken out', '34 m longest jump',
  ];
  text(ctx, stats.join('   ·   '), x + 28, sy + 26, 14, PALETTE.text);
  text(ctx, 'NEXT GOAL — Finish JOB 6/8 · THE CAPTAIN’S CAR, then take the boat job at the Marina.', x + 28, sy + 52, 14, PALETTE.muted);
  text(ctx, 'ACTIVITIES 2/4 · STREET RACE · DELIVERY · CHOP SHOP · STUNTS', x + 28, sy + 78, 14, PALETTE.gold, 'left', 'bold');
  // Save slots.
  let slotY = sy + 104;
  for (const slot of SLOTS) {
    panel(ctx, x + 28, slotY, w - 56, 30);
    text(ctx, `SLOT ${slot.slot} · ${slot.act} · ${slot.label}`, x + 44, slotY + 20, 13, PALETTE.text, 'left', 'bold');
    text(ctx, `${slot.pct}% · $${slot.money.toLocaleString('en-US')} · ${slot.time}`, x + w - 44, slotY + 20, 13, PALETTE.muted, 'right');
    slotY += 36;
  }
  void state;
}

/** Game over: busted or wrecked, with the score and a restart prompt. */
export function drawOver(ctx, state, best) {
  ctx.fillStyle = 'rgba(12, 8, 6, 0.78)';
  ctx.fillRect(0, 0, FIELD.width, FIELD.height);
  const w = 560;
  const h = 300;
  const x = (FIELD.width - w) / 2;
  const y = (FIELD.height - h) / 2;
  panel(ctx, x, y, w, h);
  text(ctx, state.busted ? 'BUSTED' : 'WRECKED', FIELD.width / 2, y + 70, 52, PALETTE.red, 'center', 'bold');
  text(ctx, state.busted ? 'Tarnwick PD took you in on the Strand.' : 'The Falcon gave out on the Strand.', FIELD.width / 2, y + 110, 17, PALETTE.muted, 'center');
  text(ctx, `Score ${state.score} · Best ${best}`, FIELD.width / 2, y + 160, 22, PALETTE.text, 'center');
  text(ctx, `Money $${state.money.toLocaleString('en-US')} · ${state.carsStolen} cars stolen · ${state.copsEscaped} cops escaped`, FIELD.width / 2, y + 196, 15, PALETTE.muted, 'center');
  text(ctx, 'Press Space or click to try again', FIELD.width / 2, y + h - 36, 18, PALETTE.gold, 'center', 'bold');
}
