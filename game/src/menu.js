// The pause menu and the title screen. The pause menu shows the full six-district
// map with turf colours and the route, 55% COMPLETE, the progress bars, the career
// stats, the activities line and three save slots. The title screen shows the tagline,
// the buttons and the save slots over a golden-hour panorama. Both are pure drawing —
// the renderer calls these with the canvas context.
import { FIELD, PALETTE, DISTRICTS, CAREER, SAVES, FONT } from './config.js';
import { readSaves } from './save.js';

const W = FIELD.width;
const H = FIELD.height;

function panel(ctx, x, y, w, h, alpha = 0.9) {
  ctx.fillStyle = `rgba(12, 10, 14, ${alpha})`;
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = 'rgba(242, 201, 76, 0.4)';
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
}

function bar(ctx, x, y, w, h, frac, fill) {
  ctx.fillStyle = 'rgba(201, 189, 166, 0.3)';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, Math.max(0, Math.min(1, frac)) * w, h);
}

/** The pause menu: map left, stats right, saves along the bottom. */
export function drawPauseMenu(ctx, state) {
  // Dim the scene behind the menu.
  ctx.fillStyle = 'rgba(10, 8, 10, 0.55)';
  ctx.fillRect(0, 0, W, H);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  // Header.
  ctx.fillStyle = PALETTE.gold;
  ctx.font = 'bold 26px system-ui, sans-serif';
  ctx.fillText('PAUSED — TARNWICK', 48, 28);
  ctx.fillStyle = PALETTE.muted;
  ctx.font = '14px system-ui, sans-serif';
  ctx.fillText('JOB 6/8 · THE CAPTAIN’S CAR  ·  DAY 6 · 18:47', 48, 60);

  // Map panel (left).
  const mx = 48;
  const my = 92;
  const mw = 640;
  const mh = 340;
  panel(ctx, mx, my, mw, mh);
  ctx.fillStyle = '#1d2a33';
  ctx.fillRect(mx + 12, my + 12, mw - 24, mh - 24);
  // District blocks.
  const blocks = [
    { name: 'TARNWICK STRAND', x: 0.08, y: 0.55, w: 0.4, h: 0.36, colour: '#f2a541' },
    { name: 'OLD TARNWICK', x: 0.08, y: 0.12, w: 0.34, h: 0.36, colour: '#e8b4b8' },
    { name: 'GLASSWORKS', x: 0.46, y: 0.08, w: 0.24, h: 0.4, colour: '#9fc6d8' },
    { name: 'LANTERN MILE', x: 0.5, y: 0.55, w: 0.22, h: 0.36, colour: '#f6c453' },
    { name: 'THE MARINA', x: 0.74, y: 0.5, w: 0.2, h: 0.42, colour: '#7fb3d5' },
    { name: 'HARLOW HEIGHTS', x: 0.72, y: 0.08, w: 0.22, h: 0.36, colour: '#b08d57' },
  ];
  for (const b of blocks) {
    ctx.fillStyle = b.colour;
    ctx.globalAlpha = 0.75;
    ctx.fillRect(mx + 12 + b.x * (mw - 24), my + 12 + b.y * (mh - 24), b.w * (mw - 24), b.h * (mh - 24));
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#14100e';
    ctx.font = 'bold 12px system-ui, sans-serif';
    ctx.fillText(b.name, mx + 20 + b.x * (mw - 24), my + 20 + b.y * (mh - 24));
  }
  // Route arrow + YOU marker.
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(mx + 60, my + mh - 60);
  ctx.lineTo(mx + 300, my + mh - 120);
  ctx.lineTo(mx + 520, my + 90);
  ctx.stroke();
  ctx.fillStyle = '#ff7a1a';
  ctx.beginPath();
  ctx.arc(mx + 300, my + mh - 120, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px system-ui, sans-serif';
  ctx.fillText('YOU', mx + 314, my + mh - 128);

  // Progress panel (right).
  const px = 716;
  const py = 92;
  const pw = 516;
  const ph = 340;
  panel(ctx, px, py, pw, ph);
  ctx.fillStyle = PALETTE.gold;
  ctx.font = 'bold 20px system-ui, sans-serif';
  ctx.fillText('55% COMPLETE', px + 16, py + 14);
  const rows = [
    ['STORY', 4, 8],
    ['RACES', 2, 4],
    ['STUNTS', 3, 8],
    ['COLLECTIBLES', 9, 20],
    ['DISTRICT JOBS', 5, 7],
    ['CREW', 3, 3],
  ];
  rows.forEach(([label, done, total], i) => {
    const ry = py + 52 + i * 26;
    ctx.fillStyle = PALETTE.text;
    ctx.font = '13px system-ui, sans-serif';
    ctx.fillText(label, px + 16, ry);
    bar(ctx, px + 170, ry + 2, 220, 10, done / total, PALETTE.gold);
    ctx.textAlign = 'right';
    ctx.fillText(`${done}/${total}`, px + pw - 16, ry);
    ctx.textAlign = 'left';
  });
  // Career stats.
  ctx.fillStyle = PALETTE.gold;
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.fillText('CAREER', px + 16, py + 222);
  ctx.fillStyle = PALETTE.text;
  ctx.font = '13px system-ui, sans-serif';
  ctx.fillText(`${CAREER.carsStolen} cars stolen · ${CAREER.copsEscaped} cops escaped · ${CAREER.kmDriven} km driven`, px + 16, py + 244);
  ctx.fillText(`${CAREER.peopleTakenOut} people taken out · ${CAREER.longestJumpM} m longest jump`, px + 16, py + 264);
  ctx.fillStyle = PALETTE.muted;
  ctx.fillText(CAREER.activities, px + 16, py + 290);
  ctx.fillStyle = PALETTE.gold;
  ctx.fillText(CAREER.nextGoal, px + 16, py + 310);

  // Save slots along the bottom.
  drawSaveSlots(ctx, 48, 452, W - 96, 120);
  // Resume hint.
  ctx.fillStyle = PALETTE.muted;
  ctx.font = '13px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('ESC — RESUME  ·  M — MAP  ·  R — RADIO', W / 2, 600);
  ctx.textAlign = 'left';
}

/** Three save slots in a row. */
export function drawSaveSlots(ctx, x, y, w, h) {
  const saves = readSaves();
  const sw = (w - 32) / 3;
  saves.forEach((save, i) => {
    const sx = x + i * (sw + 16);
    panel(ctx, sx, y, sw, h, 0.9);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = PALETTE.gold;
    ctx.font = 'bold 15px system-ui, sans-serif';
    ctx.fillText(`SAVE ${save.slot} — ${save.act}`, sx + 14, y + 12);
    ctx.fillStyle = PALETTE.text;
    ctx.font = '14px system-ui, sans-serif';
    ctx.fillText(`${save.progress}%  ·  $${save.money.toLocaleString('en-US')}  ·  ${save.time}`, sx + 14, y + 40);
    ctx.fillStyle = PALETTE.muted;
    ctx.font = '12px system-ui, sans-serif';
    ctx.fillText('Tarnwick Strand · Falcon GT', sx + 14, y + 66);
  });
}

/** The title screen: tagline, buttons, save slots, control bar. */
export function drawTitleScreen(ctx) {
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = 'rgba(12, 10, 14, 0.45)';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = PALETTE.gold;
  ctx.font = '16px system-ui, sans-serif';
  ctx.fillText('— THE LAST GOOD LIGHT —', W / 2, 108);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 92px system-ui, sans-serif';
  ctx.fillText('TARNWICK', W / 2, 132);
  ctx.fillStyle = PALETTE.gold;
  ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.fillText('3D · OPEN-WORLD CRIME · 8 STORY JOBS · POLICE · SAVES', W / 2, 246);
  ctx.fillStyle = PALETTE.text;
  ctx.font = '17px system-ui, sans-serif';
  ctx.fillText('A faded resort town. A crew in pieces. One way home.', W / 2, 276);
  ctx.fillStyle = PALETTE.muted;
  ctx.font = '13px system-ui, sans-serif';
  ctx.fillText('Keyboard & mouse', W / 2, 302);
  // Buttons.
  const buttons = ['NEW GAME', 'CONTINUE', 'LOAD GAME'];
  buttons.forEach((label, i) => {
    const by = 348 + i * 48;
    const selected = i === 0;
    ctx.fillStyle = selected ? PALETTE.gold : 'rgba(12, 10, 14, 0.8)';
    ctx.fillRect(W / 2 - 130, by, 260, 38);
    ctx.fillStyle = selected ? '#14100e' : PALETTE.text;
    ctx.font = 'bold 16px system-ui, sans-serif';
    ctx.fillText(label, W / 2, by + 11);
  });
  drawSaveSlots(ctx, 190, 512, W - 380, 96);
  ctx.fillStyle = PALETTE.muted;
  ctx.font = '12px system-ui, sans-serif';
  ctx.fillText('WASD DRIVE/WALK  ·  E ENTER OR STEAL A CAR  ·  SPACE HANDBRAKE  ·  1-5 WEAPONS  ·  ESC PAUSE', W / 2, 636);
  ctx.textAlign = 'left';
}

export { FONT, DISTRICTS };
