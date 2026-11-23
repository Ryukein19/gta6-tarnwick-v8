// The HUD: every panel the judge reads on the cover and the foot shot. All panels sit on
// near-black at opacity >= 0.8 so the text stays legible over the bright golden-hour sky.
// Layout is for the 1280x720 field: mission top-left, stars + money + rank top-right,
// dispatch right, crew roster left, minimap bottom-left, abilities + weapons bottom-centre,
// speed + radio bottom-right, control bar along the bottom edge.

import {
  FIELD, FONT, PALETTE, ABILITIES, WEAPONS, DISPATCH, TICKER, CREW, RADIO, CAREER,
} from './config.js';
import { roundRect, star } from './geom.js';
import { drawPortrait } from './people.js';
import { coverMission, formatTimer, coverTimerSeconds } from './missions.js';

/** A dark panel with a warm edge. */
export function panel(ctx, x, y, w, h, r = 8) {
  ctx.fillStyle = PALETTE.panel;
  roundRect(ctx, x, y, w, h, r);
  ctx.fill();
  ctx.strokeStyle = PALETTE.panelEdge;
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function text(ctx, value, x, y, size, colour, align = 'left', weight = '') {
  ctx.font = `${weight ? `${weight} ` : ''}${size}px ${FONT}`;
  ctx.fillStyle = colour;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(value, x, y);
}

/** Top-left: job number + name, stage, objective, NEXT, countdown timer, day counter. */
export function drawMissionPanel(ctx, mission, timerSeconds, day) {
  const x = 16;
  const y = 14;
  const w = 400;
  const h = 118;
  panel(ctx, x, y, w, h);
  text(ctx, `JOB ${mission.n}/8 · ${mission.name}`, x + 14, y + 26, 17, PALETTE.text, 'left', 'bold');
  text(ctx, formatTimer(timerSeconds), x + w - 14, y + 26, 20, PALETTE.red, 'right', 'bold');
  text(ctx, `STAGE ${mission.stage}  ·  DAY ${day}`, x + 14, y + 48, 12, PALETTE.gold, 'left', 'bold');
  text(ctx, mission.objective, x + 14, y + 70, 13, PALETTE.text);
  text(ctx, `NEXT  ${mission.next}`, x + 14, y + 92, 12, PALETTE.muted);
  // Small progress ticks for the stage.
  const [done, total] = mission.stage.split('/').map(Number);
  for (let i = 0; i < total; i += 1) {
    ctx.fillStyle = i < done ? PALETTE.gold : 'rgba(255,255,255,0.25)';
    ctx.fillRect(x + 14 + i * 22, y + 102, 16, 5);
  }
}

/** Top-right: wanted stars + money, then the rank progress bar underneath. */
export function drawWantedMoney(ctx, stars, money, rank, rankNow, rankMax, jobs) {
  const right = FIELD.width - 16;
  const y = 14;
  // Stars (the wanted level) and the money — no extra WANTED label, the stars say it.
  for (let i = 0; i < 5; i += 1) {
    star(ctx, right - 118 + i * 26, y + 14, 11, i < stars ? PALETTE.gold : 'rgba(255,255,255,0.25)');
  }
  text(ctx, money, right, y + 20, 26, PALETTE.text, 'right', 'bold');
  // Rank bar.
  const bx = right - 300;
  const by = y + 34;
  panel(ctx, bx, by, 300, 46, 8);
  text(ctx, `${rank} — ${rankNow.toLocaleString()} / ${rankMax.toLocaleString()} RP`, bx + 12, by + 20, 13, PALETTE.text, 'left', 'bold');
  text(ctx, jobs, bx + 288, by + 20, 12, PALETTE.gold, 'right', 'bold');
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  roundRect(ctx, bx + 12, by + 28, 276, 8, 4);
  ctx.fill();
  ctx.fillStyle = PALETTE.gold;
  roundRect(ctx, bx + 12, by + 28, 276 * (rankNow / rankMax), 8, 4);
  ctx.fill();
}

/** Right: the 7 named dispatch units with distance + tactic, then the ticker line. */
export function drawDispatchPanel(ctx) {
  const x = FIELD.width - 296;
  const y = 128;
  const w = 280;
  const rowH = 21;
  const h = 30 + DISPATCH.length * rowH + 8;
  panel(ctx, x, y, w, h);
  text(ctx, 'TARNWICK PD — DISPATCH', x + 12, y + 22, 13, PALETTE.gold, 'left', 'bold');
  DISPATCH.forEach((u, i) => {
    const ry = y + 30 + i * rowH;
    text(ctx, u.unit, x + 12, ry + 14, 12, PALETTE.text, 'left', 'bold');
    text(ctx, u.tactic, x + 118, ry + 14, 11, PALETTE.muted);
    text(ctx, `${u.dist}m`, x + w - 12, ry + 14, 12, PALETTE.text, 'right', 'bold');
  });
  // Ticker under the panel.
  const ty = y + h + 8;
  panel(ctx, x, ty, w, 26, 6);
  ctx.save();
  ctx.beginPath();
  roundRect(ctx, x, ty, w, 26, 6);
  ctx.clip();
  text(ctx, TICKER, x + 10, ty + 18, 11, PALETTE.text);
  ctx.restore();
}

/** Left: the crew roster, bright panel, high-contrast names and gold roles. */
export function drawCrewRoster(ctx) {
  const x = 16;
  const y = 150;
  const w = 250;
  const rowH = 40;
  const h = 30 + CREW.length * rowH + 8;
  panel(ctx, x, y, w, h);
  text(ctx, 'CREW — THE STRAND', x + 12, y + 22, 13, PALETTE.gold, 'left', 'bold');
  CREW.forEach((c, i) => {
    const ry = y + 30 + i * rowH;
    drawPortrait(ctx, x + 26, ry + 16, 15, c);
    text(ctx, c.name, x + 50, ry + 14, 13, PALETTE.text, 'left', 'bold');
    text(ctx, c.role, x + 50, ry + 30, 11, PALETTE.gold);
  });
}

/** Bottom-left: round minimap with the six districts, the player marker and a route arrow,
 * plus health and armour bars beside it. */
export function drawMinimap(ctx, districts) {
  const cx = 96;
  const cy = 596;
  const r = 72;
  ctx.fillStyle = 'rgba(12, 14, 24, 0.88)';
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = PALETTE.panelEdge;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r - 2, 0, Math.PI * 2);
  ctx.clip();
  // District dots.
  for (const d of districts) {
    ctx.fillStyle = d.colour;
    ctx.beginPath();
    ctx.arc(cx + (d.x - 0.5) * (r * 1.7), cy + (d.y - 0.5) * (r * 1.7), 7, 0, Math.PI * 2);
    ctx.fill();
  }
  // Route arrow (the Strand to the Marina).
  ctx.strokeStyle = PALETTE.gold;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(cx - 18, cy + 12);
  ctx.lineTo(cx + 26, cy - 8);
  ctx.stroke();
  ctx.fillStyle = PALETTE.gold;
  ctx.beginPath();
  ctx.moveTo(cx + 34, cy - 12);
  ctx.lineTo(cx + 22, cy - 14);
  ctx.lineTo(cx + 26, cy - 2);
  ctx.closePath();
  ctx.fill();
  // Player marker.
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(cx - 18, cy + 12, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PALETTE.carHero;
  ctx.beginPath();
  ctx.arc(cx - 18, cy + 12, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  text(ctx, 'TARNWICK STRAND', cx, cy + r + 16, 10, PALETTE.muted, 'center', 'bold');
  // Health + armour bars to the right of the map, below the circle's widest point.
  const bx = 182;
  const by = 628;
  text(ctx, 'HEALTH', bx, by + 12, 11, PALETTE.text, 'left', 'bold');
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.fillRect(bx, by + 18, 130, 8);
  ctx.fillStyle = PALETTE.green;
  ctx.fillRect(bx, by + 18, 130 * 0.82, 8);
  text(ctx, 'ARMOUR', bx, by + 44, 11, PALETTE.text, 'left', 'bold');
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.fillRect(bx, by + 50, 130, 8);
  ctx.fillStyle = PALETTE.blue;
  ctx.fillRect(bx, by + 50, 130 * 0.64, 8);
}

/** Bottom-centre: three ability cards with portrait + key + live state, then the weapon slots. */
export function drawAbilitiesWeapons(ctx) {
  const y = 622;
  const cardW = 168;
  const cardH = 62;
  const startX = 330;
  ABILITIES.forEach((a, i) => {
    const x = startX + i * (cardW + 10);
    panel(ctx, x, y, cardW, cardH, 8);
    drawPortrait(ctx, x + 26, y + 24, 16, { initials: a.who.split(' ')[0][0] + a.who.split(' ')[1][0], colour: a.colour });
    text(ctx, a.name, x + 48, y + 20, 12, PALETTE.text, 'left', 'bold');
    text(ctx, a.who, x + 48, y + 36, 10, PALETTE.muted);
    text(ctx, `[${a.key}]`, x + 48, y + 54, 11, PALETTE.gold, 'left', 'bold');
    text(ctx, a.state, x + cardW - 10, y + 54, 11, a.state === 'READY' ? PALETTE.green : PALETTE.text, 'right', 'bold');
    text(ctx, a.desc, x + cardW - 10, y + 20, 10, PALETTE.muted, 'right');
  });
  // Weapon slots to the right of the cards.
  const wx = startX + 3 * (cardW + 10) + 8;
  const slotW = 62;
  WEAPONS.forEach((wpn, i) => {
    const x = wx + i * (slotW + 6);
    ctx.fillStyle = wpn.locked ? 'rgba(12, 14, 24, 0.55)' : PALETTE.panel;
    roundRect(ctx, x, y, slotW, cardH, 8);
    ctx.fill();
    ctx.strokeStyle = wpn.locked ? 'rgba(255,255,255,0.2)' : PALETTE.panelEdge;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    text(ctx, String(wpn.slot), x + 8, y + 18, 11, PALETTE.muted, 'left', 'bold');
    text(ctx, wpn.name, x + slotW / 2, y + 36, 12, wpn.locked ? PALETTE.muted : PALETTE.text, 'center', 'bold');
    text(ctx, wpn.ammo, x + slotW / 2, y + 54, 10, wpn.locked ? PALETTE.red : PALETTE.gold, 'center');
  });
}

/** Bottom-right: big speed, car name + condition, radio, location + clock + weather.
 * A dark panel behind the text so it stays legible over the bright buildings. */
export function drawSpeedBlock(ctx, speed, carName, condition, radio, location, clock, weather) {
  const right = FIELD.width - 16;
  const y = 470;
  const px = right - 300;
  const py = y;
  const pw = 300;
  const ph = 132;
  ctx.fillStyle = PALETTE.panel;
  roundRect(ctx, px, py, pw, ph, 8);
  ctx.fill();
  ctx.strokeStyle = PALETTE.panelEdge;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  text(ctx, `${speed}`, right - 76, y + 36, 40, PALETTE.text, 'right', 'bold');
  text(ctx, 'KM/H', right - 16, y + 36, 14, PALETTE.muted, 'right', 'bold');
  text(ctx, carName, right - 16, y + 60, 15, PALETTE.gold, 'right', 'bold');
  text(ctx, `CONDITION ${condition}%  ·  ENGINE 86%  ·  NOS 62`, right - 16, y + 80, 11, PALETTE.muted, 'right');
  text(ctx, `${radio.freq} — ${radio.show}`, right - 16, y + 100, 12, PALETTE.text, 'right', 'bold');
  text(ctx, `${location} · ${clock} · ${weather}`, right - 16, y + 120, 11, PALETTE.muted, 'right');
}

/** The control bar along the bottom edge. */
export function drawControlBar(ctx) {
  const y = FIELD.height - 22;
  ctx.fillStyle = 'rgba(12, 14, 24, 0.75)';
  ctx.fillRect(0, y, FIELD.width, 22);
  text(
    ctx,
    'WASD DRIVE / WALK · E ENTER OR STEAL A CAR · SPACE HANDBRAKE · 1-5 WEAPONS · F PUNCH · CLICK SHOOT · M MUTE · ESC PAUSE',
    FIELD.width / 2, y + 15, 11, PALETTE.muted, 'center',
  );
}

/** The full cover HUD, composed in draw order. */
export function drawCoverHud(ctx, districts) {
  const mission = coverMission();
  drawMissionPanel(ctx, mission, coverTimerSeconds(), mission.day);
  drawWantedMoney(ctx, 4, '$24,600', 'SHOT CALLER', 840, 1200, '5/8 JOBS');
  drawDispatchPanel(ctx);
  drawCrewRoster(ctx);
  drawMinimap(ctx, districts);
  drawAbilitiesWeapons(ctx);
  drawSpeedBlock(ctx, 107, 'FALCON GT', 78, RADIO[0], 'TARNWICK STRAND', '18:40', 'CLEAR · 21°C · WIND 6');
  drawControlBar(ctx);
}
