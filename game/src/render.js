// Drawing only: the world's state and the current screen in, pixels out. The
// 1280x720 playfield is scaled to fit the window and centred. Golden hour: a
// warm orange-pink sky, a low sun, sun-soaked pastel buildings, a road that
// converges on the horizon, the Falcon GT whole and large in the foreground,
// and the police helicopter's spotlight cone on the road ahead.

import { FIELD, FONT, PALETTE } from './config.js';
import { groundY, project, roadEdge, roadPolygon, scaleAt } from './geom.js';
import { drawCar, drawFlame, drawPed, drawScooter, drawSmoke } from './vehicles.js';
import { drawHeli } from './police.js';
import { heroPlacement } from './player.js';
import { drawDialogue } from './dialogue.js';
import {
  drawAbilityCards,
  drawControlBar,
  drawCrewPanel,
  drawDispatchPanel,
  drawDrivePanel,
  drawLocationLine,
  drawMinimap,
  drawMissionPanel,
  drawMoneyPanel,
} from './hud.js';
import { drawPauseMenu, drawTitleScreen } from './menu.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_OVER = 'over';

function text(ctx, value, x, y, size, color, align = 'left', bold = false) {
  ctx.font = `${bold ? 'bold ' : ''}${size}px ${FONT}`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(value, x, y);
}

export function createRenderer(canvas) {
  const context = canvas.getContext('2d');
  const view = { scale: 1, x: 0, y: 0 };

  function resize() {
    const ratio = window.devicePixelRatio || 1;
    const width = Math.round(window.innerWidth * ratio);
    const height = Math.round(window.innerHeight * ratio);
    canvas.width = width;
    canvas.height = height;
    view.scale = Math.min(width / FIELD.width, height / FIELD.height);
    view.x = (width - FIELD.width * view.scale) / 2;
    view.y = (height - FIELD.height * view.scale) / 2;
  }

  /** The golden-hour sky: gradient, sun disc + glow, a few warm clouds. */
  function drawSky(time) {
    const grad = context.createLinearGradient(0, 0, 0, FIELD.horizonY);
    grad.addColorStop(0, PALETTE.skyTop);
    grad.addColorStop(0.55, PALETTE.skyMid);
    grad.addColorStop(1, PALETTE.skyHorizon);
    context.fillStyle = grad;
    context.fillRect(0, 0, FIELD.width, FIELD.horizonY + 2);
    // Sun low near the horizon, right of centre.
    const sx = 950, sy = 236;
    const glow = context.createRadialGradient(sx, sy, 10, sx, sy, 150);
    glow.addColorStop(0, PALETTE.sunGlow);
    glow.addColorStop(1, 'rgba(255, 190, 110, 0)');
    context.fillStyle = glow;
    context.fillRect(sx - 150, sy - 150, 300, 300);
    context.fillStyle = PALETTE.sun;
    context.beginPath();
    context.arc(sx, sy, 34, 0, Math.PI * 2);
    context.fill();
    // Warm clouds.
    context.fillStyle = 'rgba(255, 225, 190, 0.5)';
    for (let i = 0; i < 3; i += 1) {
      const cx = 180 + i * 380 + Math.sin(time * 0.1 + i) * 8;
      const cy = 70 + i * 34;
      context.beginPath();
      context.ellipse(cx, cy, 90, 14, 0, 0, Math.PI * 2);
      context.fill();
    }
  }

  /** Buildings, palms and lamps along both sidewalks, farthest first. */
  function drawCity(city, time) {
    for (const b of city.buildings) {
      context.fillStyle = b.color;
      context.fillRect(b.x, b.y - b.h, b.w, b.h);
      // Roof edge.
      context.fillStyle = b.dark;
      context.fillRect(b.x, b.y - b.h, b.w, 6);
      // Windows: lit gold in the golden hour.
      const cols = Math.max(2, Math.floor(b.w / 18));
      const rows = Math.max(2, b.floors);
      const ww = (b.w - 10) / cols;
      const wh = (b.h - 20) / rows;
      for (let r = 0; r < rows; r += 1) {
        for (let c = 0; c < cols; c += 1) {
          if ((r * cols + c) % 3 === 0) continue;
          context.fillStyle = b.lit && (r + c) % 2 === 0 ? PALETTE.windowLit : PALETTE.windowDark;
          context.fillRect(b.x + 5 + c * ww, b.y - b.h + 10 + r * wh, ww - 5, wh - 6);
        }
      }
    }
    for (const lamp of city.lamps) {
      context.strokeStyle = '#3a2f26';
      context.lineWidth = Math.max(1, 3 * lamp.s);
      context.beginPath();
      context.moveTo(lamp.x, lamp.y);
      context.lineTo(lamp.x, lamp.y - 46 * lamp.s - 8);
      context.stroke();
      context.fillStyle = PALETTE.windowLit;
      context.beginPath();
      context.arc(lamp.x, lamp.y - 48 * lamp.s - 8, 4 * lamp.s + 1.5, 0, Math.PI * 2);
      context.fill();
    }
    for (const palm of city.palms) {
      const h = 64 * palm.s + 10;
      context.strokeStyle = '#5a4632';
      context.lineWidth = Math.max(1.5, 4 * palm.s);
      context.beginPath();
      context.moveTo(palm.x, palm.y);
      context.quadraticCurveTo(palm.x + 6 * palm.s, palm.y - h * 0.6, palm.x + 2 * palm.s, palm.y - h);
      context.stroke();
      context.strokeStyle = '#4a7a3a';
      context.lineWidth = Math.max(1, 3 * palm.s);
      for (let f = 0; f < 5; f += 1) {
        const a = -0.4 - f * 0.5;
        context.beginPath();
        context.moveTo(palm.x + 2 * palm.s, palm.y - h);
        context.quadraticCurveTo(
          palm.x + 2 * palm.s + Math.cos(a) * 26 * palm.s,
          palm.y - h - 10 * palm.s + Math.sin(a) * 8 * palm.s,
          palm.x + 2 * palm.s + Math.cos(a) * 34 * palm.s,
          palm.y - h + 14 * palm.s,
        );
        context.stroke();
      }
    }
  }

  /** The road: asphalt trapezoid, kerbs, converging lane dashes, sidewalks. */
  function drawRoad() {
    // Sidewalks.
    context.fillStyle = PALETTE.sidewalk;
    context.fillRect(0, FIELD.horizonY, FIELD.width, FIELD.groundY - FIELD.horizonY);
    // Asphalt.
    const poly = roadPolygon();
    context.fillStyle = PALETTE.road;
    context.beginPath();
    context.moveTo(poly[0][0], poly[0][1]);
    for (let i = 1; i < poly.length; i += 1) context.lineTo(poly[i][0], poly[i][1]);
    context.closePath();
    context.fill();
    // Kerb lines.
    context.strokeStyle = PALETTE.roadEdge;
    context.lineWidth = 3;
    context.beginPath();
    context.moveTo(roadEdge(0, -1), FIELD.groundY);
    context.lineTo(roadEdge(1, -1), FIELD.horizonY);
    context.moveTo(roadEdge(0, 1), FIELD.groundY);
    context.lineTo(roadEdge(1, 1), FIELD.horizonY);
    context.stroke();
    // Centre dashes, converging.
    context.fillStyle = PALETTE.lane;
    for (let i = 0; i < 9; i += 1) {
      const t = 0.08 + i * 0.1;
      const p = project(t, 0);
      const len = 26 * p.s + 4;
      context.fillRect(p.x - 2, p.y - len, 4, len);
    }
  }

  /** Traffic, the scooter, the wreck, pedestrians — farthest first. */
  function drawStreet(state, time) {
    const items = [];
    for (const car of state.traffic) items.push({ t: car.t, draw: () => drawTrafficCar(car, time) });
    for (const ped of state.peds) items.push({ t: ped.t, draw: () => drawPedestrian(ped, time) });
    items.sort((a, b) => b.t - a.t);
    for (const item of items) item.draw();
  }

  function drawTrafficCar(car, time) {
    const p = project(car.t, car.lane);
    const w = 150 * p.s + 18;
    if (car.kind === 'wreck') {
      drawCar(context, p.x, p.y, w, '#3a3a3a', { damage: true });
      drawFlame(context, p.x - w * 0.2, p.y - w * 0.3, p.s + 0.3, time);
      drawSmoke(context, p.x, p.y - w * 0.4, p.s + 0.4, time);
    } else if (car.kind === 'cruiser') {
      drawCar(context, p.x, p.y, w, '#22303e', {});
      context.fillStyle = '#ff3b30';
      context.fillRect(p.x - w * 0.1, p.y - w * 0.36, w * 0.08, w * 0.04);
      context.fillStyle = '#3a7bd9';
      context.fillRect(p.x + w * 0.02, p.y - w * 0.36, w * 0.08, w * 0.04);
    } else {
      drawCar(context, p.x, p.y, w, car.color, {});
    }
  }

  function drawPedestrian(ped, time) {
    const p = project(ped.t, ped.lane);
    drawPed(context, p.x, p.y, p.s + 0.25, ped.shirt, ped.walk + time);
  }

  /** The hero Falcon GT, whole and large, plus its smoke wisp. */
  function drawHero(state, time) {
    const place = heroPlacement();
    const x = place.x + (state.player.lane - 0.28) * 130;
    drawSmoke(context, x + 30, place.y - 96, 1, time);
    drawCar(context, x, place.y, place.w, PALETTE.hero, {
      spoiler: true,
      plate: 'TAM-6',
      damage: true,
    });
    // "FALCON GT" badge on the rear.
    text(context, 'FALCON GT', x, place.y - 118, 13, '#f4ede2', 'center', true);
  }

  /** The on-foot market scene: warm lantern light, lit stall awnings. */
  function drawMarket(state, time) {
    // Dusk-warm backdrop: deep blue top, warm market glow at the bottom.
    const grad = context.createLinearGradient(0, 0, 0, FIELD.height);
    grad.addColorStop(0, '#2a2a4a');
    grad.addColorStop(0.55, '#4a2f3a');
    grad.addColorStop(1, '#7a4a2a');
    context.fillStyle = grad;
    context.fillRect(0, 0, FIELD.width, FIELD.height);
    // String lights.
    for (let i = 0; i < 24; i += 1) {
      const x = 40 + i * 52;
      const y = 150 + Math.sin(i * 0.9) * 26;
      context.fillStyle = i % 3 === 0 ? '#ffdf8a' : i % 3 === 1 ? '#ff9e6b' : '#ffd9a0';
      context.beginPath();
      context.arc(x, y, 5, 0, Math.PI * 2);
      context.fill();
    }
    // Stalls with lit awnings.
    const stalls = [
      { x: 90, color: '#c94f43', label: 'SPICES' },
      { x: 330, color: '#e8b48f', label: 'FISH' },
      { x: 570, color: '#7bc96f', label: 'FRUIT' },
      { x: 810, color: '#6fb7d9', label: 'FLOWERS' },
      { x: 1030, color: '#c98ab8', label: 'CLOTH' },
    ];
    for (const stall of stalls) {
      context.fillStyle = '#3a2a20';
      context.fillRect(stall.x, 380, 170, 130);
      context.fillStyle = stall.color;
      context.beginPath();
      context.moveTo(stall.x - 10, 380);
      context.lineTo(stall.x + 180, 380);
      context.lineTo(stall.x + 165, 340);
      context.lineTo(stall.x + 5, 340);
      context.closePath();
      context.fill();
      context.fillStyle = PALETTE.windowLit;
      context.fillRect(stall.x + 14, 400, 142, 40);
      text(context, stall.label, stall.x + 85, 470, 16, PALETTE.text, 'center', true);
      text(context, '2/5 PAID', stall.x + 85, 494, 12, PALETTE.gold, 'center', true);
    }
    // Renn on foot, centre, clear of the dialogue box below and standing in
    // the gap between the FRUIT and FLOWERS stalls (not over a stall label).
    drawPed(context, 775, 500, 2.2, '#ff7a1a', time * 2);
    text(context, 'RENN — ON FOOT', 775, 536, 15, PALETTE.text, 'center', true);
    text(context, '0 KM/H', 775, 558, 13, PALETTE.muted, 'center');
  }

  /** Paint one frame for the screen the game is on. */
  function draw(state, city, screen, saves, time) {
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.fillStyle = '#141210';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.setTransform(view.scale, 0, 0, view.scale, view.x, view.y);

    if (screen === SCREEN_TITLE) {
      drawSky(time);
      drawRoad();
      drawCity(city, time);
      // Beach strip at the bottom + the Falcon GT parked on it.
      context.fillStyle = '#d9c2a8';
      context.fillRect(0, 640, FIELD.width, 80);
      drawCar(context, FIELD.width * 0.82, 700, 200, PALETTE.hero, { spoiler: true, plate: 'TAM-6' });
      drawTitleScreen(context, saves);
      return;
    }
    if (screen === SCREEN_PAUSED) {
      drawSky(time);
      drawRoad();
      drawCity(city, time);
      drawStreet(state, time);
      drawHero(state, time);
      drawPauseMenu(context, state, saves);
      return;
    }
    if (state.mode === 'foot') {
      drawMarket(state, time);
      if (state.dialogue) drawDialogue(context, 300, 596, 680, state.dialogue, FONT);
      drawMissionPanelFoot(context, state);
      drawControlBar(context);
      return;
    }
    // Chase (play / over).
    drawSky(time);
    drawRoad();
    drawCity(city, time);
    drawStreet(state, time);
    drawHero(state, time);
    const heli = state.heli;
    drawHeli(context, heli.x, heli.y, FIELD.width * 0.2, heli.rotor, { x: heli.spotlightX, y: heli.spotlightY });
    drawMissionPanel(context, state);
    drawMoneyPanel(context, state);
    drawCrewPanel(context, state);
    drawDispatchPanel(context, state);
    drawLocationLine(context, state);
    drawMinimap(context, state);
    drawDrivePanel(context, state);
    drawAbilityCards(context, state);
    // Dialogue sits top-centre, under the location line — clear of the HUD below.
    if (state.dialogue) drawDialogue(context, 300, 170, 680, state.dialogue, FONT);
    drawControlBar(context);
    if (screen === SCREEN_OVER) {
      context.fillStyle = 'rgba(12, 10, 14, 0.72)';
      context.fillRect(0, 0, FIELD.width, FIELD.height);
      text(context, 'WRECKED', FIELD.width / 2, 320, 64, '#ff6a4a', 'center', true);
      text(context, 'The Strand keeps the car. Renn walks home.', FIELD.width / 2, 366, 20, PALETTE.text, 'center');
      text(context, 'Press Space to try again', FIELD.width / 2, 410, 16, PALETTE.gold, 'center');
    }
  }

  /** Mission panel variant for the on-foot market shot. */
  function drawMissionPanelFoot(ctx, state) {
    ctx.fillStyle = PALETTE.panel;
    ctx.fillRect(16, 14, 372, 118);
    ctx.strokeStyle = PALETTE.panelEdge;
    ctx.strokeRect(16.5, 14.5, 371, 117);
    text(ctx, 'JOB 3/8 · STALL MONEY', 28, 40, 19, PALETTE.gold, 'left', true);
    text(ctx, '2:31', 376, 44, 30, '#ff6a4a', 'right', true);
    text(ctx, 'Collect 5 stall debts · 2/5', 28, 66, 15, PALETTE.text);
    text(ctx, 'STAGE 1/3 · LANTERN MILE', 28, 90, 13, PALETTE.muted);
    text(ctx, 'NEXT  Talk to Mama Odelle', 28, 114, 13, PALETTE.text);
    text(ctx, 'DAY 3 · 21:12', 376, 114, 13, PALETTE.muted, 'right');
  }

  resize();
  window.addEventListener('resize', resize);
  return { draw };
}
