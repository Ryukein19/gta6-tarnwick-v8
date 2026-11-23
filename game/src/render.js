// Drawing only: the world's state and the current screen in, pixels out. The
// 1280x720 playfield is scaled to fit the window and centred, the margin filled with
// the backdrop colour. The chase is drawn in depth order — sky, skyline, road,
// buildings, traffic, cruisers, the Falcon, pedestrians, helicopter, spotlight —
// then the HUD. Golden hour throughout: warm sun, long shadows, pastel buildings.

import { FIELD, FONT, MISSIONS, PALETTE } from './config.js';
import { project, roadHalfWidth, roadX, roadY } from './geom.js';
import { drawBuilding, drawLamp, drawPalm, drawSkyline } from './city.js';
import { drawPed, drawScooter, drawTrafficCar } from './traffic.js';
import { drawBurningCar, drawCruiser, drawFalcon } from './vehicles.js';
import { drawHelicopter, drawSpotlight } from './police.js';
import { drawChaseHud, drawLocation } from './hud.js';
import { drawOver, drawPause, drawTitle } from './menu.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_OVER = 'over';

/** The sun's screen position: low on the horizon, right of centre. */
const SUN = { x: 0.68, y: 0.42 };

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

  function drawSky(time) {
    const sky = context.createLinearGradient(0, 0, 0, FIELD.horizonY + 60);
    sky.addColorStop(0, PALETTE.skyTop);
    sky.addColorStop(0.5, PALETTE.skyMid);
    sky.addColorStop(1, PALETTE.skyLow);
    context.fillStyle = sky;
    context.fillRect(0, 0, FIELD.width, FIELD.horizonY + 60);
    // The sun: a big warm disc with a halo, low on the horizon.
    const sx = FIELD.width * SUN.x;
    const sy = FIELD.horizonY - 42;
    context.fillStyle = 'rgba(255, 243, 196, 0.35)';
    context.beginPath();
    context.arc(sx, sy, 110, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = PALETTE.sun;
    context.beginPath();
    context.arc(sx, sy, 66, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = PALETTE.sunCore;
    context.beginPath();
    context.arc(sx, sy, 44, 0, Math.PI * 2);
    context.fill();
    // A few warm clouds catching the light.
    context.fillStyle = 'rgba(255, 220, 180, 0.5)';
    for (let i = 0; i < 4; i += 1) {
      const cx = 120 + i * 300 + Math.sin(time * 0.05 + i) * 10;
      const cy = 90 + (i % 2) * 46;
      context.beginPath();
      context.ellipse(cx, cy, 90, 14, 0, 0, Math.PI * 2);
      context.fill();
    }
    void time;
  }

  function drawRoad(state, time) {
    // The road surface: a trapezoid from the bottom of the screen to the horizon.
    const bl = roadX(-1, 0);
    const br = roadX(1, 0);
    const tl = roadX(-1, 1);
    const tr = roadX(1, 1);
    context.fillStyle = PALETTE.road;
    context.beginPath();
    context.moveTo(bl, FIELD.groundY);
    context.lineTo(br, FIELD.groundY);
    context.lineTo(tr, FIELD.horizonY);
    context.lineTo(tl, FIELD.horizonY);
    context.closePath();
    context.fill();
    // Sidewalks: lighter strips on both sides.
    context.fillStyle = PALETTE.sidewalk;
    context.beginPath();
    context.moveTo(bl, FIELD.groundY);
    context.lineTo(tl, FIELD.horizonY);
    context.lineTo(tl - 70, FIELD.horizonY);
    context.lineTo(bl - 150, FIELD.groundY);
    context.closePath();
    context.fill();
    context.beginPath();
    context.moveTo(br, FIELD.groundY);
    context.lineTo(tr, FIELD.horizonY);
    context.lineTo(tr + 70, FIELD.horizonY);
    context.lineTo(br + 150, FIELD.groundY);
    context.closePath();
    context.fill();
    // Lane dashes, scrolling with the speed so the road feels alive.
    const scroll = (time * state.speed * 0.06) % 0.09;
    context.fillStyle = PALETTE.lane;
    for (let z = 0.06 + scroll; z < 0.96; z += 0.09) {
      const p = project(0, z);
      const w = Math.max(2, 7 * p.s);
      const h = Math.max(3, 26 * p.s);
      context.fillRect(p.x - w / 2, p.y - h, w, h);
      // Side lane lines.
      for (const lane of [-0.5, 0.5]) {
        const lx = roadX(lane, z);
        context.fillRect(lx - w / 2, p.y - h, w, h);
      }
    }
    // A crosswalk near the bottom of the frame.
    const cz = 0.04;
    const cy = roadY(cz);
    const half = roadHalfWidth(cz);
    context.fillStyle = 'rgba(247, 242, 232, 0.85)';
    for (let i = -4; i <= 4; i += 1) {
      const sx = FIELD.width / 2 + (i * half) / 4.4;
      context.fillRect(sx - half * 0.07, cy, half * 0.14, 10);
    }
  }

  function drawCity(state) {
    // Far to near, so near buildings overlap far ones.
    const sorted = [...state.city.buildings].sort((a, b) => b.z - a.z);
    for (const b of sorted) drawBuilding(context, b, state.elapsed);
    for (const p of state.city.palms) drawPalm(context, p);
    for (const l of state.city.lamps) drawLamp(context, l);
  }

  function drawChaseScene(state, time) {
    drawSky(time);
    drawSkyline(context, 7);
    drawRoad(state, time);
    drawCity(state);
    // The burning car on the left, mid-depth, big enough to read.
    const burn = project(-0.68, 0.38);
    drawBurningCar(context, burn.x, burn.y, 200 * burn.s + 60, time);
    // Traffic, far to near.
    const traffic = [...state.traffic.cars].sort((a, b) => b.z - a.z);
    for (const car of traffic) drawTrafficCar(context, car, time);
    // Police cruisers flanking the hero, just above the dialogue box.
    const c1 = project(-0.85, 0.35);
    drawCruiser(context, c1.x, c1.y, 260 * c1.s + 40, time, 0);
    const c2 = project(1.0, 0.35);
    drawCruiser(context, c2.x, c2.y, 260 * c2.s + 40, time, 1);
    // The hero Falcon GT: whole, large, centred slightly right of middle, its base
    // just above the dialogue box so the car is never hidden behind the HUD.
    const heroX = roadX(state.lane, 0.1);
    drawFalcon(context, heroX, 510, 330, time);
    // Pedestrians and the scooter on the sidewalks.
    for (const ped of state.traffic.peds) drawPed(context, ped, time);
    drawScooter(context, state.traffic.scooter, time);
    // The helicopter, large, top-centre below the location line, with its spotlight
    // cone falling on the road just ahead of the hero car.
    const hx = FIELD.width * 0.56;
    const hy = 120;
    drawHelicopter(context, hx, hy, 256, time);
    const pool = project(state.lane + 0.1, 0.72);
    drawSpotlight(context, hx, hy + 10, pool.x, pool.y, 210, time);
  }

  function drawFootScene(state, time) {
    // Lantern Mile night market: warm lanterns, lit awnings, string lights.
    const sky = context.createLinearGradient(0, 0, 0, FIELD.height);
    sky.addColorStop(0, '#2a1a3a');
    sky.addColorStop(0.6, '#6b3a4a');
    sky.addColorStop(1, '#c96b3a');
    context.fillStyle = sky;
    context.fillRect(0, 0, FIELD.width, FIELD.height);
    // String lights across the street.
    context.strokeStyle = '#3a2c22';
    context.lineWidth = 2;
    for (let row = 0; row < 3; row += 1) {
      const y = 150 + row * 60;
      context.beginPath();
      context.moveTo(0, y);
      context.quadraticCurveTo(FIELD.width / 2, y + 40, FIELD.width, y);
      context.stroke();
      for (let i = 0; i < 12; i += 1) {
        const x = (i / 11) * FIELD.width;
        const ly = y + 40 * Math.sin((i / 11) * Math.PI) * 0.5 + 8;
        const glow = 0.6 + 0.4 * Math.sin(time * 2 + i);
        context.fillStyle = `rgba(255, 220, 130, ${glow})`;
        context.beginPath();
        context.arc(x, ly, 7, 0, Math.PI * 2);
        context.fill();
      }
    }
    // Market stalls lining both sides of the street, receding toward the horizon:
    // far first, then near, each stall smaller and closer to the centre than the one
    // before it, so the near stall overlaps the far ones correctly.
    const stallRow = (side) => {
      const spots = [
        { x: side < 0 ? 170 : 980, y: 300, w: 120 },
        { x: side < 0 ? 110 : 1000, y: 395, w: 165 },
        { x: side < 0 ? 40 : 1020, y: 500, w: 215 },
      ];
      for (const s of spots) {
        const bodyH = Math.round(s.w * 0.5);
        const awnH = Math.round(s.w * 0.12);
        // Stall body.
        context.fillStyle = '#4a3226';
        context.fillRect(s.x, s.y, s.w, bodyH);
        // Awning: warm stripes.
        context.fillStyle = '#e5534b';
        context.fillRect(s.x - 8, s.y - awnH, s.w + 16, awnH);
        context.fillStyle = '#f7f2e8';
        for (let stripe = 0; stripe < 5; stripe += 1) {
          context.fillRect(s.x - 8 + (stripe * (s.w + 16)) / 5, s.y - awnH, (s.w + 16) / 10, awnH);
        }
        // Warm light spilling out onto the cobbles.
        context.fillStyle = 'rgba(255, 220, 130, 0.22)';
        context.fillRect(s.x - 8, s.y + bodyH, s.w + 16, 30);
        // Goods on the stall.
        context.fillStyle = '#f2c94c';
        context.fillRect(s.x + 12, s.y + bodyH - 22, 26, 16);
        context.fillStyle = '#7ac74f';
        context.fillRect(s.x + 52, s.y + bodyH - 22, 26, 16);
        context.fillStyle = '#e88bb0';
        context.fillRect(s.x + 92, s.y + bodyH - 22, 26, 16);
      }
    };
    stallRow(-1);
    stallRow(1);
    // The cobbled street.
    context.fillStyle = '#3a2c26';
    context.fillRect(0, 560, FIELD.width, 160);
    context.fillStyle = 'rgba(255, 220, 130, 0.12)';
    context.fillRect(0, 560, FIELD.width, 160);
    // Renn on foot, back to the camera, centre frame.
    const px = FIELD.width / 2;
    const py = 620;
    context.fillStyle = 'rgba(20, 10, 5, 0.4)';
    context.beginPath();
    context.ellipse(px, py + 4, 34, 8, 0, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = '#2a2a33';
    context.fillRect(px - 16, py - 90, 32, 60);
    context.fillStyle = '#ff6b1a';
    context.fillRect(px - 20, py - 96, 40, 14);
    context.fillStyle = '#e8c39a';
    context.beginPath();
    context.arc(px, py - 104, 13, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = '#2a2a33';
    context.fillRect(px - 14, py - 30, 10, 30);
    context.fillRect(px + 4, py - 30, 10, 30);
    // Shoppers browsing the stalls.
    const shoppers = [
      { x: 300, y: 600, c: '#4fc3f7' },
      { x: 420, y: 640, c: '#e5534b' },
      { x: 880, y: 620, c: '#7ac74f' },
      { x: 1000, y: 650, c: '#f2c94c' },
    ];
    for (const s of shoppers) {
      context.fillStyle = 'rgba(20, 10, 5, 0.35)';
      context.beginPath();
      context.ellipse(s.x, s.y + 2, 18, 5, 0, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = s.c;
      context.fillRect(s.x - 11, s.y - 56, 22, 36);
      context.fillStyle = '#e8c39a';
      context.beginPath();
      context.arc(s.x, s.y - 64, 9, 0, Math.PI * 2);
      context.fill();
    }
    // "MARKET" sign, warm and lit, centred over the street clear of the panels.
    context.fillStyle = '#f2c94c';
    context.font = `bold 30px ${FONT}`;
    context.textAlign = 'center';
    context.textBaseline = 'alphabetic';
    context.fillText('LANTERN MILE · NIGHT MARKET', FIELD.width / 2, 90);
  }

  /** Paint one frame: the scene for the screen, then the HUD or a panel. */
  function draw(state, screen, best) {
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.fillStyle = '#17120e';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.setTransform(view.scale, 0, 0, view.scale, view.x, view.y);
    const time = state.elapsed;
    if (screen === SCREEN_TITLE) {
      drawTitle(context, state, time);
      return;
    }
    if (state.shot === 'foot') {
      drawFootScene(state, time);
      drawFootHud(state);
      return;
    }
    drawChaseScene(state, time);
    if (screen === SCREEN_PLAY) {
      drawChaseHud(context, state, time);
      return;
    }
    if (screen === SCREEN_PAUSED) {
      drawChaseHud(context, state, time);
      drawPause(context, state);
      return;
    }
    // Game over.
    drawChaseHud(context, state, time);
    drawOver(context, state, best);
  }

  /** The on-foot HUD: job, cash counter, on-foot state, dialogue, controls. */
  function drawFootHud(state) {
    const m = MISSIONS[state.mission - 1];
    context.fillStyle = 'rgba(23, 18, 14, 0.88)';
    context.fillRect(16, 14, 360, 110);
    context.fillStyle = PALETTE.gold;
    context.fillRect(16, 14, 4, 110);
    context.fillStyle = PALETTE.text;
    context.font = `bold 19px ${FONT}`;
    context.textAlign = 'left';
    context.textBaseline = 'alphabetic';
    context.fillText(`JOB ${m.id}/8 · ${m.name}`, 32, 40);
    context.fillStyle = PALETTE.muted;
    context.font = `13px ${FONT}`;
    context.fillText(`DAY ${state.day} · 21:12 · LANTERN MILE`, 32, 62);
    context.fillStyle = PALETTE.text;
    context.font = `15px ${FONT}`;
    context.fillText(m.objective, 32, 86);
    context.fillStyle = PALETTE.gold;
    context.font = `bold 13px ${FONT}`;
    context.fillText(`COLLECTED ${state.stallCash}/${state.stallCashMax}`, 32, 108);
    // On-foot state + money, top-right.
    context.fillStyle = 'rgba(23, 18, 14, 0.88)';
    context.fillRect(FIELD.width - 316, 14, 300, 84);
    context.fillStyle = PALETTE.text;
    context.font = `bold 28px ${FONT}`;
    context.textAlign = 'right';
    context.fillText('0 KM/H', FIELD.width - 32, 48);
    context.font = `13px ${FONT}`;
    context.fillStyle = PALETTE.muted;
    context.fillText('ON FOOT', FIELD.width - 32, 68);
    context.fillStyle = PALETTE.gold;
    context.font = `bold 18px ${FONT}`;
    context.fillText(`$${state.money.toLocaleString('en-US')}`, FIELD.width - 32, 88);
    // Mama Odelle's line, bottom-centre.
    const line = { who: 'MAMA ODELLE', role: 'market matriarch', line: 'Two stalls paid, three to go. The lanterns stay lit, child.', colour: '#f2a56b', initials: 'MO' };
    context.fillStyle = 'rgba(23, 18, 14, 0.88)';
    context.fillRect((FIELD.width - 620) / 2, FIELD.height - 120, 620, 86);
    context.fillStyle = '#3a2c22';
    context.fillRect((FIELD.width - 620) / 2, FIELD.height - 120, 4, 86);
    context.fillStyle = line.colour;
    context.beginPath();
    context.arc((FIELD.width - 620) / 2 + 44, FIELD.height - 77, 28, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = '#f7f2e8';
    context.font = `bold 20px ${FONT}`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('MO', (FIELD.width - 620) / 2 + 44, FIELD.height - 79);
    context.textAlign = 'left';
    context.textBaseline = 'alphabetic';
    context.fillStyle = '#f7f2e8';
    context.font = `bold 17px ${FONT}`;
    context.fillText(line.who, (FIELD.width - 620) / 2 + 84, FIELD.height - 90);
    context.fillStyle = PALETTE.gold;
    context.font = `12px ${FONT}`;
    context.fillText(line.role, (FIELD.width - 620) / 2 + 84, FIELD.height - 72);
    context.fillStyle = '#f7f2e8';
    context.font = `italic 15px ${FONT}`;
    context.fillText(line.line, (FIELD.width - 620) / 2 + 84, FIELD.height - 50);
    // Control bar.
    context.fillStyle = PALETTE.muted;
    context.font = `12px ${FONT}`;
    context.textAlign = 'center';
    context.fillText('WASD WALK · E ENTER A CAR · F PUNCH · CLICK SHOOT · ESC PAUSE', FIELD.width / 2, FIELD.height - 16);
  }

  resize();
  window.addEventListener('resize', resize);
  return { draw };
}
