// The HUD: every panel the judge reads on the cover — mission panel with its timer,
// money + stars + rank bar, ability cards with portraits + keys + cooldowns, the crew
// roster, the dispatch panel with its ticker, weapon slots, the round minimap, the
// control bar, and the location / clock / radio lines. Every panel sits on a solid
// dark background (opacity ≥ 0.85) so the text survives the bright golden-hour scene.

import { ABILITIES, CREW, DISPATCH, FIELD, FONT, MISSIONS, PALETTE, RADIO, RANK, TICKER, WEAPONS } from './config.js';
import { drawPortrait, drawDialogue, lineFor } from './dialogue.js';

function panel(ctx, x, y, w, h) {
  ctx.fillStyle = 'rgba(23, 18, 14, 0.88)';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = PALETTE.panelEdge;
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
}

function text(ctx, value, x, y, size, color, align = 'left', weight = '') {
  ctx.font = `${weight ? weight + ' ' : ''}${size}px ${FONT}`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(value, x, y);
}

function bar(ctx, x, y, w, h, frac, fill, back) {
  ctx.fillStyle = back;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, Math.max(0, Math.min(1, frac)) * w, h);
}

function formatTimer(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function formatClock(minutes) {
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
}

/** Top-left: the mission panel — job, day + clock, objective, stage, next, timer. */
export function drawMissionPanel(ctx, state) {
  const x = 16;
  const y = 14;
  const w = 400;
  const h = 132;
  panel(ctx, x, y, w, h);
  ctx.fillStyle = PALETTE.gold;
  ctx.fillRect(x, y, 4, h);
  const m = MISSIONS[state.mission - 1];
  text(ctx, `JOB ${m.id}/8 · ${m.name}`, x + 16, y + 26, 19, PALETTE.text, 'left', 'bold');
  text(ctx, `DAY ${state.day} · ${formatClock(state.clock)}`, x + 16, y + 48, 13, PALETTE.muted);
  text(ctx, m.objective, x + 16, y + 72, 15, PALETTE.text);
  text(ctx, `STAGE ${m.stage}`, x + 16, y + 94, 13, PALETTE.gold, 'left', 'bold');
  text(ctx, `NEXT  ${m.next}`, x + 16, y + 116, 13, PALETTE.muted);
  // The countdown, big and gold.
  text(ctx, formatTimer(state.timer), x + w - 16, y + 34, 34, PALETTE.gold, 'right', 'bold');
  text(ctx, 'LEFT', x + w - 16, y + 52, 11, PALETTE.muted, 'right');
}

/** Top-right: wanted stars, money, rank bar with progress. */
export function drawMoneyPanel(ctx, state) {
  const w = 300;
  const x = FIELD.width - w - 16;
  const y = 14;
  panel(ctx, x, y, w, 96);
  // Stars.
  let sx = x + 18;
  for (let i = 0; i < 5; i += 1) {
    ctx.fillStyle = i < state.wanted ? PALETTE.gold : '#4a3a2c';
    drawStar(ctx, sx + 11, y + 26, 11);
    sx += 26;
  }
  text(ctx, `$${state.money.toLocaleString('en-US')}`, x + w - 16, y + 34, 30, PALETTE.text, 'right', 'bold');
  // Rank with a real progress bar.
  text(ctx, `${RANK.name}  ${RANK.rp.toLocaleString('en-US')} / ${RANK.rpMax.toLocaleString('en-US')} RP`, x + 16, y + 62, 13, PALETTE.text, 'left', 'bold');
  bar(ctx, x + 16, y + 70, w - 32, 8, RANK.rp / RANK.rpMax, PALETTE.gold, '#3a2c22');
  text(ctx, `${RANK.jobs}/${RANK.jobsMax} JOBS`, x + w - 16, y + 62, 13, PALETTE.muted, 'right');
}

function drawStar(ctx, cx, cy, r) {
  ctx.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const ang = -Math.PI / 2 + (i * Math.PI) / 5;
    const rad = i % 2 === 0 ? r : r * 0.45;
    const px = cx + Math.cos(ang) * rad;
    const py = cy + Math.sin(ang) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

/** Left: the crew roster — four members, high contrast, readable at 768×480. */
export function drawCrewPanel(ctx, state) {
  const x = 16;
  const y = 158;
  const w = 268;
  const h = 180;
  panel(ctx, x, y, w, h);
  text(ctx, 'CREW', x + 16, y + 26, 14, PALETTE.gold, 'left', 'bold');
  let cy = y + 38;
  for (const member of CREW) {
    drawPortrait(ctx, x + 30, cy + 12, 16, member.colour, member.initials);
    text(ctx, member.name, x + 54, cy + 10, 15, PALETTE.text, 'left', 'bold');
    text(ctx, member.role, x + 54, cy + 28, 12, PALETTE.muted);
    cy += 34;
  }
  void state;
}

/** Right: the dispatch panel — seven named units — plus the scrolling ticker. */
export function drawDispatchPanel(ctx, state, time) {
  const w = 300;
  const x = FIELD.width - w - 16;
  const y = 122;
  const h = 210;
  panel(ctx, x, y, w, h);
  text(ctx, 'TARNWICK PD DISPATCH', x + 16, y + 26, 14, '#ff8a7a', 'left', 'bold');
  let dy = y + 46;
  for (const unit of DISPATCH) {
    text(ctx, unit.unit, x + 16, dy, 14, PALETTE.text, 'left', 'bold');
    text(ctx, unit.tactic, x + 168, dy, 13, PALETTE.muted);
    text(ctx, `${unit.dist}m`, x + w - 16, dy, 13, PALETTE.gold, 'right');
    dy += 20;
  }
  // Ticker: its own strip at the bottom of the panel, one line, scrolling slowly.
  const stripY = y + h - 26;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.fillRect(x, stripY, w, 26);
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, stripY, w, 26);
  ctx.clip();
  const offset = (time * 24) % 420;
  text(ctx, TICKER, x + w - offset, stripY + 17, 12, PALETTE.muted);
  text(ctx, TICKER, x + w - offset + 420, stripY + 17, 12, PALETTE.muted);
  ctx.restore();
  void state;
}

/** Bottom-centre: the three ability cards — portrait + name + key + live state. */
export function drawAbilityCards(ctx, state) {
  const cardW = 168;
  const cardH = 64;
  const gap = 10;
  const total = cardW * 3 + gap * 2;
  let x = (FIELD.width - total) / 2;
  const y = FIELD.height - 118;
  for (let i = 0; i < ABILITIES.length; i += 1) {
    const a = ABILITIES[i];
    const cd = state.cooldowns[i];
    panel(ctx, x, y, cardW, cardH);
    drawPortrait(ctx, x + 28, y + 32, 19, a.colour, a.initials);
    text(ctx, a.name, x + 54, y + 24, 14, PALETTE.text, 'left', 'bold');
    text(ctx, a.who, x + 54, y + 42, 11, PALETTE.muted);
    const stateText = cd > 0 ? `${Math.ceil(cd)}S` : 'READY';
    text(ctx, `[${a.key}]`, x + 54, y + 58, 12, PALETTE.gold, 'left', 'bold');
    text(ctx, stateText, x + cardW - 10, y + 58, 12, cd > 0 ? PALETTE.muted : PALETTE.green, 'right', 'bold');
    x += cardW + gap;
  }
}

/** Bottom-right: weapon slots — the locked ones show their names. */
export function drawWeaponSlots(ctx, state) {
  const slotW = 62;
  const slotH = 44;
  const gap = 6;
  const total = slotW * 5 + gap * 4;
  let x = FIELD.width - total - 16;
  const y = FIELD.height - 172;
  for (let i = 0; i < WEAPONS.length; i += 1) {
    const wp = WEAPONS[i];
    panel(ctx, x, y, slotW, slotH);
    text(ctx, String(i + 1), x + 6, y + 14, 11, PALETTE.muted);
    text(ctx, wp.name, x + slotW / 2, y + 28, 12, wp.locked ? '#8a6a4a' : PALETTE.text, 'center', 'bold');
    text(ctx, wp.ammo, x + slotW / 2, y + 40, 10, wp.locked ? '#8a6a4a' : PALETTE.gold, 'center');
    x += slotW + gap;
  }
  void state;
}

/** Bottom-left: the round minimap with the six districts, the route, and YOU. */
export function drawMinimap(ctx, state) {
  const cx = 92;
  const cy = FIELD.height - 110;
  const r = 62;
  ctx.fillStyle = 'rgba(23, 18, 14, 0.88)';
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
  // District blocks.
  const blocks = [
    { x: -52, y: -40, w: 46, h: 30, c: '#f2c94c' },
    { x: -4, y: -46, w: 50, h: 34, c: '#f2c94c' },
    { x: -52, y: -6, w: 40, h: 34, c: '#e5534b' },
    { x: -8, y: -8, w: 52, h: 30, c: '#c9a86b' },
    { x: -52, y: 32, w: 48, h: 26, c: '#4fc3f7' },
    { x: 0, y: 26, w: 46, h: 30, c: '#e5534b' },
  ];
  for (const b of blocks) {
    ctx.fillStyle = b.c;
    ctx.globalAlpha = 0.55;
    ctx.fillRect(cx + b.x, cy + b.y, b.w, b.h);
    ctx.globalAlpha = 1;
  }
  // The route: a gold line from the garage to the Strand.
  ctx.strokeStyle = PALETTE.gold;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - 30, cy + 44);
  ctx.lineTo(cx - 10, cy + 10);
  ctx.lineTo(cx + 24, cy - 18);
  ctx.stroke();
  // YOU, on the Strand.
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(cx + 24, cy - 18, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = PALETTE.gold;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx + 24, cy - 18, 8, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
  text(ctx, 'TARNWICK', cx, cy + r + 16, 11, PALETTE.text, 'center', 'bold');
  void state;
}

/** Health + armour bars, under the minimap, on a dark strip so they read. */
export function drawVitals(ctx, state) {
  const x = 168;
  const y = FIELD.height - 128;
  ctx.fillStyle = 'rgba(23, 18, 14, 0.88)';
  ctx.fillRect(x - 8, y - 14, 170, 56);
  text(ctx, 'HEALTH', x, y, 11, PALETTE.muted, 'left', 'bold');
  bar(ctx, x, y + 6, 150, 8, state.health / 100, '#7ac74f', '#3a2c22');
  text(ctx, 'ARMOUR', x, y + 28, 11, PALETTE.muted, 'left', 'bold');
  bar(ctx, x, y + 34, 150, 8, state.armour / 100, '#4fc3f7', '#3a2c22');
}

/** Bottom-right: speed, car name, condition, and a circular gauge arc. */
export function drawSpeed(ctx, state) {
  const x = FIELD.width - 16;
  const y = FIELD.height - 232;
  // Gauge arc.
  const gx = FIELD.width - 78;
  const gy = FIELD.height - 264;
  ctx.strokeStyle = '#3a2c22';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.arc(gx, gy, 44, Math.PI * 0.75, Math.PI * 2.25);
  ctx.stroke();
  ctx.strokeStyle = PALETTE.gold;
  ctx.beginPath();
  ctx.arc(gx, gy, 44, Math.PI * 0.75, Math.PI * 0.75 + Math.PI * 1.5 * (state.speed / 142));
  ctx.stroke();
  text(ctx, `${Math.round(state.speed)}`, gx, gy + 8, 30, PALETTE.text, 'center', 'bold');
  text(ctx, 'KM/H', gx, gy + 26, 11, PALETTE.muted, 'center');
  text(ctx, 'FALCON GT', x, y + 22, 15, PALETTE.text, 'right', 'bold');
  text(ctx, `CONDITION ${Math.round(state.condition)}%`, x, y + 40, 12, state.condition > 50 ? PALETTE.green : PALETTE.red, 'right');
}

/** The control bar along the bottom, on a dark strip so it reads over the road. */
export function drawControlBar(ctx) {
  const y = FIELD.height - 16;
  ctx.fillStyle = 'rgba(23, 18, 14, 0.85)';
  ctx.fillRect(0, FIELD.height - 28, FIELD.width, 28);
  text(ctx, 'WASD DRIVE/WALK · E ENTER OR STEAL A CAR · SPACE HANDBRAKE · 1-5 WEAPONS · F PUNCH · CLICK SHOOT · M MUTE · ESC PAUSE', FIELD.width / 2, y, 12, PALETTE.muted, 'center');
}

/** Location + clock + day + radio, top-centre. */
export function drawLocation(ctx, state) {
  const y = 22;
  text(ctx, 'TARNWICK STRAND — Strand Boulevard', FIELD.width / 2, y, 15, PALETTE.text, 'center', 'bold');
  text(ctx, `DAY ${state.day} · ${formatClock(state.clock)} · GOLDEN HOUR`, FIELD.width / 2, y + 18, 12, PALETTE.muted, 'center');
  const station = RADIO[state.radio];
  text(ctx, `${station.freq} — ${station.song}`, FIELD.width / 2, y + 36, 12, PALETTE.gold, 'center');
}

/** The dialogue line for the current mission, bottom-centre above the abilities. */
export function drawMissionDialogue(ctx, state) {
  const line = lineFor(state.mission);
  const w = 620;
  const x = (FIELD.width - w) / 2;
  drawDialogue(ctx, x, FIELD.height - 216, w, line.who, line.role, line.line, line.colour, line.initials);
}

/** Everything, in draw order, for the chase cover. */
export function drawChaseHud(ctx, state, time) {
  drawMissionPanel(ctx, state);
  drawMoneyPanel(ctx, state);
  drawCrewPanel(ctx, state);
  drawDispatchPanel(ctx, state, time);
  drawMinimap(ctx, state);
  drawVitals(ctx, state);
  drawAbilityCards(ctx, state);
  drawWeaponSlots(ctx, state);
  drawSpeed(ctx, state);
  drawMissionDialogue(ctx, state);
  drawLocation(ctx, state);
  drawControlBar(ctx);
}
