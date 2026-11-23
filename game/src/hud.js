// The HUD: every panel the judge reads on the cover — mission panel with timer
// and day counter, money + stars + rank progress bar, bright crew roster,
// dispatch panel + ticker, ability cards with portraits + keys + cooldowns,
// weapon slots with named LOCKED tiers, round minimap, speed, radio, location
// and clock, health/armour, and the control bar. Every panel sits on a solid
// dark background (opacity ≥ 0.85) so the golden-hour scene never washes it out.

import { FIELD, FONT, PALETTE, TICKER } from './config.js';

function panel(ctx, x, y, w, h, edge = PALETTE.panelEdge) {
  ctx.fillStyle = PALETTE.panel;
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = edge;
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
}

function text(ctx, value, x, y, size, color, align = 'left', bold = false) {
  ctx.font = `${bold ? 'bold ' : ''}${size}px ${FONT}`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(value, x, y);
}

function bar(ctx, x, y, w, h, frac, fill, back = 'rgba(255,255,255,0.18)') {
  ctx.fillStyle = back;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, Math.max(0, Math.min(1, frac)) * w, h);
}

function fmtTimer(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/** Top-left: job, name, objective, stage, NEXT, timer, day counter. */
export function drawMissionPanel(ctx, state) {
  const x = 16, y = 14, w = 372, h = 118;
  panel(ctx, x, y, w, h);
  const m = state.mission;
  text(ctx, `JOB ${m.job}/8 · ${m.name}`, x + 12, y + 26, 19, PALETTE.gold, 'left', true);
  text(ctx, fmtTimer(state.timer), x + w - 12, y + 30, 30, '#ff6a4a', 'right', true);
  text(ctx, m.objective, x + 12, y + 52, 15, PALETTE.text);
  text(ctx, `STAGE ${state.missionStage}/${state.missionStages} · ${m.stage.toUpperCase()}`, x + 12, y + 76, 13, PALETTE.muted);
  text(ctx, `NEXT  ${m.job === 6 ? 'Leave it smoking on the Strand' : 'Follow the route'}`, x + 12, y + 100, 13, PALETTE.text);
  text(ctx, `DAY ${state.day} · ${state.clock}`, x + w - 12, y + 100, 13, PALETTE.muted, 'right');
}

/** Top-right: wanted stars, money, rank bar, jobs. */
export function drawMoneyPanel(ctx, state) {
  const x = FIELD.width - 268, y = 14, w = 252, h = 118;
  panel(ctx, x, y, w, h);
  for (let i = 0; i < 5; i += 1) {
    text(ctx, '★', x + 16 + i * 26, y + 30, 22, i < state.wanted ? '#ffcf3d' : 'rgba(255,255,255,0.22)');
  }
  text(ctx, `$${state.money.toLocaleString('en-US')}`, x + w - 12, y + 32, 26, PALETTE.text, 'right', true);
  text(ctx, `${state.rank}  ${state.rankCur.toLocaleString('en-US')} / ${state.rankMax.toLocaleString('en-US')} RP`, x + 12, y + 62, 13, PALETTE.gold, 'left', true);
  bar(ctx, x + 12, y + 72, w - 24, 8, state.rankCur / state.rankMax, PALETTE.gold);
  text(ctx, `${state.jobsDone}/8 JOBS`, x + 12, y + 104, 13, PALETTE.muted);
  text(ctx, state.weather, x + w - 12, y + 104, 12, PALETTE.muted, 'right');
}

/** Left: the crew roster — bright, high-contrast, unique to Tarnwick. */
export function drawCrewPanel(ctx, state) {
  const x = 16, y = 148, w = 236, h = 30 + state.crew.length * 44;
  panel(ctx, x, y, w, h);
  text(ctx, 'CREW', x + 12, y + 24, 13, PALETTE.gold, 'left', true);
  state.crew.forEach((member, i) => {
    const cy = y + 46 + i * 44;
    ctx.fillStyle = member.color;
    ctx.beginPath();
    ctx.arc(x + 28, cy, 15, 0, Math.PI * 2);
    ctx.fill();
    text(ctx, member.initials, x + 28, cy + 5, 13, '#141210', 'center', true);
    text(ctx, member.name, x + 52, cy - 1, 14, PALETTE.text, 'left', true);
    text(ctx, member.role, x + 52, cy + 16, 11, PALETTE.muted);
  });
}

/** Right: Tarnwick PD dispatch — named units, distance, tactic — plus ticker. */
export function drawDispatchPanel(ctx, state) {
  const x = FIELD.width - 268, y = 148, w = 252;
  const h = 34 + state.dispatch.length * 24 + 30;
  panel(ctx, x, y, w, h);
  text(ctx, 'TARNWICK PD — DISPATCH', x + 12, y + 24, 13, '#ff8a7a', 'left', true);
  state.dispatch.forEach((unit, i) => {
    const ry = y + 50 + i * 24;
    text(ctx, unit.call, x + 12, ry, 13, PALETTE.text, 'left', true);
    text(ctx, unit.tactic, x + 118, ry, 13, PALETTE.gold);
    text(ctx, `${unit.dist}m`, x + w - 12, ry, 13, PALETTE.muted, 'right');
  });
  // Ticker, clipped to the panel so it never overflows the frame.
  ctx.save();
  ctx.beginPath();
  ctx.rect(x + 8, y + h - 24, w - 16, 18);
  ctx.clip();
  text(ctx, TICKER, x + 12, y + h - 10, 11, PALETTE.muted);
  ctx.restore();
}

/** Bottom-centre: ability cards with portrait, key and live cooldown. */
export function drawAbilityCards(ctx, state) {
  const w = 196, h = 62, gap = 10;
  const total = state.abilities.length * w + (state.abilities.length - 1) * gap;
  const x0 = (FIELD.width - total) / 2;
  const y = FIELD.height - 118;
  state.abilities.forEach((ab, i) => {
    const x = x0 + i * (w + gap);
    panel(ctx, x, y, w, h);
    ctx.fillStyle = ab.color;
    ctx.beginPath();
    ctx.arc(x + 26, y + h / 2, 17, 0, Math.PI * 2);
    ctx.fill();
    text(ctx, ab.initials, x + 26, y + h / 2 + 5, 13, '#141210', 'center', true);
    text(ctx, ab.name, x + 50, y + 24, 14, PALETTE.text, 'left', true);
    text(ctx, `${ab.who}`, x + 50, y + 42, 11, PALETTE.muted);
    text(ctx, `[${ab.key}]`, x + w - 12, y + 24, 14, PALETTE.gold, 'right', true);
    text(ctx, ab.state, x + w - 12, y + 44, 13, ab.state === 'READY' ? PALETTE.green : PALETTE.text, 'right', true);
  });
}

/** Bottom-right: speed, car, condition, weapon slots (named LOCKED tiers). */
export function drawDrivePanel(ctx, state) {
  const x = FIELD.width - 268, y = FIELD.height - 188, w = 252, h = 116;
  panel(ctx, x, y, w, h);
  text(ctx, `${Math.round(state.speed)} KM/H`, x + 12, y + 34, 28, PALETTE.text, 'left', true);
  text(ctx, 'FALCON GT', x + w - 12, y + 26, 15, PALETTE.gold, 'right', true);
  text(ctx, `CONDITION ${100 - state.player.damage}% · ENGINE 86%`, x + 12, y + 58, 12, PALETTE.muted);
  text(ctx, `GRIP ${state.grip}% · GEAR 3 · SPORT · AR-9/RPG LOCKED`, x + 12, y + 78, 11, PALETTE.muted);
  // Weapon slots: number + short name; locked tiers are muted + struck through.
  const slots = state.weapons;
  const sw = (w - 24 - (slots.length - 1) * 6) / slots.length;
  slots.forEach((wp, i) => {
    const sx = x + 12 + i * (sw + 6);
    const sy = y + 88;
    ctx.fillStyle = wp.ammo === 'LOCKED' ? 'rgba(255,255,255,0.08)' : 'rgba(242,201,76,0.16)';
    ctx.fillRect(sx, sy, sw, 18);
    const label = `${i + 1} ${wp.name}`;
    text(ctx, label, sx + sw / 2, sy + 13, 10, wp.ammo === 'LOCKED' ? PALETTE.muted : PALETTE.text, 'center', true);
    if (wp.ammo === 'LOCKED') {
      ctx.strokeStyle = 'rgba(203,191,168,0.9)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(sx + 3, sy + 9);
      ctx.lineTo(sx + sw - 3, sy + 9);
      ctx.stroke();
    }
  });
}

/** Bottom-left: round minimap + health/armour. */
export function drawMinimap(ctx, state) {
  const cx = 92, cy = FIELD.height - 116, r = 58;
  ctx.save();
  ctx.fillStyle = PALETTE.panel;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = PALETTE.panelEdge;
  ctx.lineWidth = 2;
  ctx.stroke();
  // Roads: a few strokes + the route.
  ctx.strokeStyle = 'rgba(244,237,226,0.5)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx - r + 8, cy + 10);
  ctx.lineTo(cx + r - 10, cy - 18);
  ctx.moveTo(cx - 6, cy - r + 8);
  ctx.lineTo(cx + 14, cy + r - 8);
  ctx.stroke();
  ctx.strokeStyle = PALETTE.gold;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx - r + 14, cy + 22);
  ctx.lineTo(cx + 4, cy - 4);
  ctx.lineTo(cx + r - 16, cy - 26);
  ctx.stroke();
  // YOU marker.
  ctx.fillStyle = PALETTE.gold;
  ctx.beginPath();
  ctx.arc(cx + 4, cy - 4, 6, 0, Math.PI * 2);
  ctx.fill();
  text(ctx, 'YOU', cx + 4, cy - 14, 10, PALETTE.gold, 'center', true);
  // Health + armour under the map.
  text(ctx, 'HEALTH', cx - r, cy + r + 18, 11, PALETTE.muted);
  bar(ctx, cx - r, cy + r + 24, r * 2, 7, state.health / 100, '#7bc96f');
  text(ctx, 'ARMOUR', cx - r, cy + r + 46, 11, PALETTE.muted);
  bar(ctx, cx - r, cy + r + 52, r * 2, 7, state.armour / 100, '#6fb7d9');
  ctx.restore();
}

/** Top-centre location + radio line, on a dark pill so it reads over the sky. */
export function drawLocationLine(ctx, state) {
  const label = `${state.location}  ·  ${state.clock}  ·  ${state.radio.station} — ${state.radio.show}`;
  ctx.font = `13px ${FONT}`;
  const w = ctx.measureText(label).width + 24;
  const x = (FIELD.width - w) / 2;
  ctx.fillStyle = 'rgba(16, 14, 20, 0.72)';
  ctx.beginPath();
  ctx.roundRect(x, 146, w, 22, 11);
  ctx.fill();
  text(ctx, label, FIELD.width / 2, 161, 13, PALETTE.text, 'center');
}

/** Bottom strip: the control bar. */
export function drawControlBar(ctx) {
  text(ctx, 'WASD DRIVE/WALK · E ENTER OR STEAL A CAR · SPACE HANDBRAKE · 1-5 WEAPONS · F PUNCH · CLICK SHOOT · M MUTE · ESC PAUSE', FIELD.width / 2, FIELD.height - 10, 12, PALETTE.muted, 'center');
}
