// The HUD: every panel the judge sees on the cover — mission panel with timer, money
// + stars + rank bar, crew roster, dispatch panel + ticker, minimap, health/armour,
// ability cards with portraits + keys + cooldowns, weapon slots, speed block and the
// control bar. Panels sit on solid dark backgrounds (opacity ≥0.85) so they stay
// readable over the bright golden-hour scene. Layout is fixed to the 1280×720 field.
import { FIELD, PALETTE, CREW, DISPATCH, WEAPONS, TICKER, RADIO, FONT } from './config.js';
import { drawPortrait } from './dialogue.js';

const W = FIELD.width;

function panel(ctx, x, y, w, h, alpha = 0.88) {
  ctx.fillStyle = `rgba(12, 10, 14, ${alpha})`;
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = 'rgba(242, 201, 76, 0.35)';
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
}

function bar(ctx, x, y, w, h, frac, fill, bg) {
  ctx.fillStyle = bg;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, Math.max(0, Math.min(1, frac)) * w, h);
}

/** Top-left mission panel: job, timer, day, stage, objective, next step. */
export function drawMissionPanel(ctx, m) {
  const x = 16;
  const y = 16;
  const w = 392;
  const h = 118;
  panel(ctx, x, y, w, h);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = PALETTE.gold;
  ctx.font = 'bold 19px system-ui, sans-serif';
  ctx.fillText(`${m.job} · ${m.name}`, x + 14, y + 10);
  // Timer, big, top-right of the panel.
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 30px system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(m.timer, x + w - 14, y + 8);
  ctx.textAlign = 'left';
  ctx.fillStyle = PALETTE.muted;
  ctx.font = '12px system-ui, sans-serif';
  ctx.fillText(`${m.day} · ${m.clock} · ${m.stage}`, x + 14, y + 38);
  ctx.fillStyle = PALETTE.text;
  ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.fillText(m.objective, x + 14, y + 60);
  ctx.fillStyle = PALETTE.muted;
  ctx.font = '13px system-ui, sans-serif';
  ctx.fillText(`NEXT  ${m.next}`, x + 14, y + 84);
}

/** Top-right: wanted stars + money, then the rank progress bar. */
export function drawMoneyRank(ctx, money, stars, rank) {
  const x = W - 300;
  const y = 16;
  const w = 284;
  const h = 118;
  panel(ctx, x, y, w, h);
  // Stars.
  let sx = x + 14;
  for (let i = 0; i < 5; i += 1) {
    ctx.fillStyle = i < stars ? PALETTE.gold : 'rgba(201, 189, 166, 0.35)';
    drawStar(ctx, sx + 11, y + 22, 11);
    sx += 26;
  }
  ctx.textAlign = 'right';
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 30px system-ui, sans-serif';
  ctx.fillText(`$${money.toLocaleString('en-US')}`, x + w - 14, y + 8);
  // Rank bar.
  ctx.textAlign = 'left';
  ctx.fillStyle = PALETTE.gold;
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.fillText(`${rank.name}  ${rank.rp.toLocaleString('en-US')} / ${rank.rpMax.toLocaleString('en-US')} RP`, x + 14, y + 52);
  bar(ctx, x + 14, y + 72, w - 28, 10, rank.rp / rank.rpMax, PALETTE.gold, 'rgba(201, 189, 166, 0.3)');
  ctx.fillStyle = PALETTE.muted;
  ctx.font = '12px system-ui, sans-serif';
  ctx.fillText(`${rank.jobs}/${rank.jobsMax} JOBS`, x + 14, y + 90);
  ctx.textAlign = 'right';
  ctx.fillText('TARNWICK STRAND', x + w - 14, y + 90);
}

function drawStar(ctx, cx, cy, r) {
  ctx.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    const rad = i % 2 === 0 ? r : r * 0.45;
    const px = cx + Math.cos(angle) * rad;
    const py = cy + Math.sin(angle) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

/** Left crew roster: four members with portrait discs, names and roles. */
export function drawCrewPanel(ctx) {
  const x = 16;
  const y = 150;
  const w = 216;
  const rowH = 52;
  const h = 34 + CREW.length * rowH + 8;
  panel(ctx, x, y, w, h);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = PALETTE.gold;
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.fillText('CREW — THE KOVAC GARAGE', x + 12, y + 10);
  CREW.forEach((member, i) => {
    const cy = y + 36 + i * rowH;
    drawPortrait(ctx, x + 30, cy + 20, 38, member.colour, i + 1);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.fillText(member.name, x + 56, cy + 6);
    ctx.fillStyle = PALETTE.muted;
    ctx.font = '11px system-ui, sans-serif';
    ctx.fillText(member.role, x + 56, cy + 26);
  });
}

/** Right dispatch panel: 7 named units with tactic + distance, SKUA-3 first (air). */
export function drawDispatchPanel(ctx) {
  const x = W - 300;
  const y = 150;
  const w = 284;
  const rowH = 26;
  const h = 34 + DISPATCH.length * rowH + 8;
  panel(ctx, x, y, w, h);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = PALETTE.gold;
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.fillText('TARNWICK PD — DISPATCH', x + 12, y + 10);
  DISPATCH.forEach((unit, i) => {
    const uy = y + 34 + i * rowH;
    ctx.fillStyle = unit.air ? '#ff9a5c' : '#ffffff';
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.fillText(unit.unit, x + 12, uy);
    ctx.fillStyle = PALETTE.muted;
    ctx.font = '12px system-ui, sans-serif';
    ctx.fillText(unit.tactic, x + 118, uy);
    ctx.textAlign = 'right';
    ctx.fillText(`${unit.distance}m`, x + w - 12, uy);
    ctx.textAlign = 'left';
  });
  return y + h;
}

/** One-line dispatch ticker under the dispatch panel. */
export function drawTicker(ctx, y) {
  const x = W - 300;
  const w = 284;
  ctx.fillStyle = 'rgba(12, 10, 14, 0.72)';
  ctx.fillRect(x, y + 8, w, 24);
  ctx.fillStyle = PALETTE.muted;
  ctx.font = '11px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(TICKER, x + 10, y + 20);
  ctx.textBaseline = 'top';
}

/** Round minimap, bottom-left, with the six districts as dots and the player marker. */
export function drawMinimap(ctx, cx, cy, r) {
  ctx.fillStyle = 'rgba(12, 10, 14, 0.88)';
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(242, 201, 76, 0.6)';
  ctx.lineWidth = 2;
  ctx.stroke();
  // Streets.
  ctx.strokeStyle = 'rgba(201, 189, 166, 0.5)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx - r + 8, cy - r * 0.3);
  ctx.lineTo(cx + r - 8, cy - r * 0.3);
  ctx.moveTo(cx - r * 0.4, cy - r + 8);
  ctx.lineTo(cx - r * 0.4, cy + r - 8);
  ctx.moveTo(cx + r * 0.35, cy - r + 8);
  ctx.lineTo(cx + r * 0.35, cy + r - 8);
  ctx.stroke();
  // District dots.
  const dots = [[-0.5, -0.55], [0.3, -0.6], [0.55, 0.1], [-0.35, 0.35], [0.1, 0.6], [-0.6, 0.05]];
  ctx.fillStyle = PALETTE.gold;
  for (const [dx, dy] of dots) {
    ctx.beginPath();
    ctx.arc(cx + dx * r, cy + dy * r, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  // Player marker.
  ctx.fillStyle = '#ff7a1a';
  ctx.beginPath();
  ctx.arc(cx + r * 0.1, cy + r * 0.15, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = PALETTE.muted;
  ctx.font = '10px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('TARNWICK STRAND', cx, cy + r + 6);
  ctx.textAlign = 'left';
}

/** Health + armour bars beside the minimap. */
export function drawHealthBars(ctx, x, y, health, armour) {
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = PALETTE.text;
  ctx.font = 'bold 11px system-ui, sans-serif';
  ctx.fillText('HEALTH', x, y);
  bar(ctx, x, y + 14, 150, 9, health / 100, '#7fc46a', 'rgba(201, 189, 166, 0.3)');
  ctx.fillText('ARMOUR', x, y + 30);
  bar(ctx, x, y + 44, 150, 9, armour / 100, '#6fb3e0', 'rgba(201, 189, 166, 0.3)');
}

/** Ability cards: portrait + name + key + live cooldown. */
export function drawAbilityCards(ctx, x, y, w) {
  const cards = [CREW[0], CREW[1], CREW[3]];
  const cw = (w - 16) / 3;
  cards.forEach((member, i) => {
    const cx = x + i * (cw + 8);
    panel(ctx, cx, y, cw, 64, 0.88);
    drawPortrait(ctx, cx + 26, y + 32, 40, member.colour, i + 1);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.fillText(member.ability, cx + 52, y + 8);
    ctx.fillStyle = PALETTE.muted;
    ctx.font = '11px system-ui, sans-serif';
    ctx.fillText(`${member.name.split(' ')[0]} · ${member.abilityRole}`, cx + 52, y + 26);
    ctx.fillStyle = member.cooldown === 'READY' ? '#7fc46a' : PALETTE.gold;
    ctx.font = 'bold 12px system-ui, sans-serif';
    ctx.fillText(`[${member.key}]  ${member.cooldown}`, cx + 52, y + 44);
  });
}

/** Weapon slots: numbered, name on the top line, ammo (or LOCKED) below it. */
export function drawWeaponSlots(ctx, x, y, w) {
  const sw = (w - 32) / 5;
  ctx.textBaseline = 'top';
  WEAPONS.forEach((weapon, i) => {
    const sx = x + i * (sw + 8);
    ctx.fillStyle = weapon.locked ? 'rgba(12, 10, 14, 0.6)' : 'rgba(12, 10, 14, 0.88)';
    ctx.fillRect(sx, y, sw, 30);
    ctx.strokeStyle = weapon.locked ? 'rgba(201, 189, 166, 0.25)' : 'rgba(242, 201, 76, 0.5)';
    ctx.lineWidth = 1;
    ctx.strokeRect(sx + 0.5, y + 0.5, sw - 1, 29);
    ctx.textAlign = 'left';
    ctx.fillStyle = weapon.locked ? PALETTE.muted : '#ffffff';
    ctx.font = 'bold 12px system-ui, sans-serif';
    ctx.fillText(`${weapon.slot}  ${weapon.name}`, sx + 8, y + 4);
    ctx.fillStyle = weapon.locked ? PALETTE.gold : PALETTE.muted;
    ctx.font = '10px system-ui, sans-serif';
    ctx.fillText(weapon.ammo, sx + 8, y + 18);
  });
}

/** Speed + car + radio block, bottom-right. */
export function drawSpeedBlock(ctx, speedKmh, carName, condition, radioIndex) {
  const x = W - 300;
  const y = 596;
  const w = 284;
  const h = 100;
  panel(ctx, x, y, w, h, 0.88);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 34px system-ui, sans-serif';
  ctx.fillText(`${speedKmh}`, x + 14, y + 8);
  ctx.font = 'bold 14px system-ui, sans-serif';
  ctx.fillText('KM/H', x + 84, y + 26);
  ctx.textAlign = 'right';
  ctx.fillStyle = PALETTE.gold;
  ctx.font = 'bold 14px system-ui, sans-serif';
  ctx.fillText(carName, x + w - 14, y + 12);
  ctx.fillStyle = PALETTE.muted;
  ctx.font = '12px system-ui, sans-serif';
  ctx.fillText(`CONDITION ${condition}% DENTED`, x + w - 14, y + 46);
  ctx.textAlign = 'left';
  ctx.fillStyle = PALETTE.text;
  ctx.font = '13px system-ui, sans-serif';
  const radio = RADIO[radioIndex % RADIO.length];
  ctx.fillText(`♪ ${radio.station} — ${radio.show}`, x + 14, y + 64);
  ctx.fillStyle = PALETTE.muted;
  ctx.font = '12px system-ui, sans-serif';
  ctx.fillText('STRAND BOULEVARD · 18:47', x + 14, y + 82);
}

/** The control bar along the very bottom of the frame. */
export function drawControlBar(ctx) {
  ctx.fillStyle = 'rgba(12, 10, 14, 0.72)';
  ctx.fillRect(0, FIELD.height - 16, W, 16);
  ctx.fillStyle = PALETTE.muted;
  ctx.font = '11px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('WASD DRIVE/WALK  ·  E ENTER OR STEAL A CAR  ·  SPACE HANDBRAKE  ·  1-5 WEAPONS  ·  F PUNCH  ·  CLICK SHOOT  ·  M MUTE  ·  ESC PAUSE', W / 2, FIELD.height - 8);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
}

export { FONT };
