// Drawing only: the world's state and the current screen in, pixels out. The 1280x720
// playfield is scaled to fit the window and centred, the margin filled with the backdrop
// colour. The chase scene is a golden-hour boulevard — sky, sun, pastel buildings, the
// road, the Falcon GT whole and large, the helicopter with its spotlight cone, dense
// traffic and the full HUD. The foot scene is the Lantern Mile night market, lit warm.

import { FIELD, FONT, PALETTE, DISTRICTS, RADIO } from './config.js';
import { drawSky, drawStreet, drawRoad } from './city.js';
import { drawCar, drawBurningCar, VEHICLES } from './vehicles.js';
import { drawHelicopter } from './police.js';
import { drawTraffic, drawPedestrians, drawCoverScooter, coverTraffic, coverPedestrians } from './traffic.js';
import { drawCoverHud, drawMissionPanel, drawControlBar, drawMinimap, drawSpeedBlock } from './hud.js';
import { drawDialogue, DIALOGUE } from './dialogue.js';
import { drawPauseMenu, drawTitle } from './menu.js';
import { drawPedestrian } from './people.js';
import { createRandom } from './random.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_OVER = 'over';

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

  function text(value, x, y, size, colour, align, weight) {
    context.font = `${weight ? `${weight} ` : ''}${size}px ${FONT}`;
    context.fillStyle = colour;
    context.textAlign = align;
    context.textBaseline = 'alphabetic';
    context.fillText(value, x, y);
  }

  /** The chase: golden-hour boulevard, hero car whole and large, helicopter dominant.
   * `withHud` false draws only the scene (used under the pause menu, so no HUD bleeds). */
  function drawChase(state, seed, withHud = true) {
    const random = createRandom(seed);
    drawSky(context, FIELD.width * 0.62, FIELD.horizonY - 30);
    drawStreet(context, random);
    drawRoad(context);
    // Burning car on the left, a dramatic beat.
    drawBurningCar(context, 235, 520, 170);
    // Traffic ahead (staged cover layout) + the two flanking cruisers.
    drawTraffic(context, coverTraffic());
    drawPedestrians(context, coverPedestrians());
    drawCoverScooter(context);
    // The hero car: whole, large, centred slightly right of middle.
    const speed = Math.round(state.speed);
    drawCar(context, 700, 530, 300, VEHICLES.falcon, { damage: state.damage, brake: speed < 20 });
    // The helicopter: large, top-centre, spotlight cone on the road ahead.
    drawHelicopter(context, 640, 140, 240);
    if (!withHud) return;
    // Ilya Vane's line, bottom-left above the minimap.
    drawDialogue(context, 16, 362, 360, DIALOGUE.ilya, FONT);
    drawCoverHud(context, DISTRICTS);
  }

  /** The foot scene: Lantern Mile night market, warm lantern light, on foot. */
  function drawFoot(state, seed) {
    const random = createRandom(seed);
    // Night sky, but warm — deep indigo up top, amber glow at the stalls.
    const g = context.createLinearGradient(0, 0, 0, FIELD.height);
    g.addColorStop(0, '#1a1a3a');
    g.addColorStop(0.5, '#3a2a4a');
    g.addColorStop(1, '#5a3a3a');
    context.fillStyle = g;
    context.fillRect(0, 0, FIELD.width, FIELD.height);
    // String lights across the top.
    for (let i = 0; i < 3; i += 1) {
      const y = 60 + i * 26;
      context.strokeStyle = 'rgba(255, 220, 150, 0.5)';
      context.lineWidth = 2;
      context.beginPath();
      context.moveTo(0, y);
      context.quadraticCurveTo(FIELD.width / 2, y + 26, FIELD.width, y);
      context.stroke();
      for (let x = 40; x < FIELD.width; x += 90) {
        const t = x / FIELD.width;
        const ly = y + 26 * 4 * t * (1 - t) * 2;
        context.fillStyle = i === 1 ? '#ffd97a' : '#ff9d5c';
        context.beginPath();
        context.arc(x, ly + 4, 5, 0, Math.PI * 2);
        context.fill();
      }
    }
    // Market floor: a warm cobbled plaza the stalls sit on.
    context.fillStyle = '#43302e';
    context.fillRect(0, 380, FIELD.width, 310);
    context.fillStyle = 'rgba(255, 200, 140, 0.10)';
    for (let gy = 400; gy < 680; gy += 28) {
      for (let gx = 20; gx < FIELD.width; gx += 44) {
        context.fillRect(gx + ((gy / 28) % 2) * 22, gy, 20, 3);
      }
    }
    // Market stalls: two neat rows of three, awnings lit warm, sitting on the plaza floor.
    // The middle lane stays clear between the rows.
    const awningColours = ['#c94c4c', '#f2c94c', '#4c7a5c', '#c98a4c'];
    const stallY = 250;
    for (let side = 0; side < 2; side += 1) {
      for (let i = 0; i < 3; i += 1) {
        const x = side === 0 ? 40 + i * 150 : FIELD.width - 40 - (i + 1) * 150;
        const y = stallY;
        const w = 140;
        const h = 130;
        const col = awningColours[(i + side * 2) % awningColours.length];
        // Stall body + goods.
        context.fillStyle = '#3a2a28';
        context.fillRect(x, y + 60, w, h - 60);
        context.fillStyle = col;
        context.beginPath();
        context.moveTo(x, y + 60);
        context.lineTo(x + 12, y + 18);
        context.lineTo(x + w - 12, y + 18);
        context.lineTo(x + w, y + 60);
        context.closePath();
        context.fill();
        // Awning stripes.
        context.fillStyle = 'rgba(255,255,255,0.35)';
        for (let s = 0; s < 4; s += 1) {
          context.fillRect(x + 14 + s * 32, y + 22, 12, 34);
        }
        // Warm lamp glow under the awning.
        const glow = context.createRadialGradient(x + w / 2, y + 70, 4, x + w / 2, y + 70, 90);
        glow.addColorStop(0, 'rgba(255, 217, 122, 0.5)');
        glow.addColorStop(1, 'rgba(255, 217, 122, 0)');
        context.fillStyle = glow;
        context.fillRect(x - 40, y - 10, w + 80, 160);
        // Goods on the table.
        context.fillStyle = '#e8b84c';
        for (let k = 0; k < 5; k += 1) {
          context.beginPath();
          context.arc(x + 20 + k * 24, y + 52, 7, 0, Math.PI * 2);
          context.fill();
        }
        // A shopper at the stall.
        drawPedestrian(context, x + w - 22, y + 132, 0.9, awningColours[(i + 1) % awningColours.length]);
      }
    }
    // The lane down the middle, cobbled and warm.
    context.fillStyle = '#4a3a34';
    context.beginPath();
    context.moveTo(FIELD.width / 2 - 90, 380);
    context.lineTo(FIELD.width / 2 + 90, 380);
    context.lineTo(FIELD.width / 2 + 190, FIELD.height);
    context.lineTo(FIELD.width / 2 - 190, FIELD.height);
    context.closePath();
    context.fill();
    // Renn on foot, centre-bottom, larger than the shoppers.
    drawPedestrian(context, FIELD.width / 2 + 10, 560, 2.2, '#ff7a1a');
    text('RENN', FIELD.width / 2 + 10, 600, 13, PALETTE.text, 'center', 'bold');
    // Market sign.
    text('LANTERN MILE — NIGHT MARKET', FIELD.width / 2, 180, 22, PALETTE.gold, 'center', 'bold');
    // Mama Odelle's dialogue.
    drawDialogue(context, 16, 340, 360, DIALOGUE.odelle, FONT);
    // HUD for the foot shot: mission, 2/5 counter, 0 KM/H ON FOOT, minimap, control bar.
    drawMissionPanel(context, { n: 3, name: 'STALL MONEY', stage: '3/8', objective: 'Collect protection money · STALLS 2/5', next: 'Mama Odelle is waiting' }, 214, 3);
    drawMinimap(context, DISTRICTS);
    drawSpeedBlock(context, 0, 'ON FOOT', 100, RADIO[1], 'LANTERN MILE', '21:15', 'CLEAR · 19°C');
    drawControlBar(context);
  }

  /** Paint one frame: the scene for the screen, then the HUD or a panel over it. */
  function draw(state, screen, best, seed) {
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.fillStyle = '#0c0e18';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.setTransform(view.scale, 0, 0, view.scale, view.x, view.y);
    const useSeed = Number.isInteger(seed) ? seed : 1;
    if (screen === SCREEN_TITLE) {
      drawTitle(context, useSeed);
      return;
    }
    if (screen === SCREEN_PAUSED) {
      drawChase(state, useSeed, false);
      drawPauseMenu(context);
      return;
    }
    if (screen === 'foot') {
      drawFoot(state, useSeed);
      return;
    }
    drawChase(state, useSeed);
    if (screen === SCREEN_OVER) {
      context.fillStyle = 'rgba(10, 12, 20, 0.72)';
      context.fillRect(0, 0, FIELD.width, FIELD.height);
      text('BUSTED', FIELD.width / 2, 320, 64, PALETTE.red, 'center', 'bold');
      text('Tarnwick PD caught up with you on the Strand.', FIELD.width / 2, 360, 18, PALETTE.text, 'center');
      text('Press Space or click to try again', FIELD.width / 2, 400, 16, PALETTE.gold, 'center');
    }
  }

  resize();
  window.addEventListener('resize', resize);
  return { draw };
}
