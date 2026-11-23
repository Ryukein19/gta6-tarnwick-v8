// The renderer: paints the golden-hour city, the chase, the market, the map and the
// title. Canvas 2D with a perspective projection (see geom.js): the road runs from the
// camera at the bottom to the horizon, buildings and cars shrink with depth, the hero
// car is the big foreground subject. Draw order is far-to-near so nearer things occlude
// farther ones. The canvas is a fixed 1280x720 logical area; CSS scales it to the window.
import { FIELD, PALETTE } from './config.js';
import { project, roadHalfWidth, roadY } from './geom.js';
import { drawCar, drawHero, drawCruiser, drawSedan, drawBurningCar } from './vehicles.js';
import { drawHelicopter } from './police.js';
import {
  drawMissionPanel, drawMoneyRank, drawCrewPanel, drawDispatchPanel, drawTicker,
  drawMinimap, drawHealthBars, drawAbilityCards, drawWeaponSlots, drawSpeedBlock,
  drawControlBar,
} from './hud.js';
import { drawDialogueBox } from './dialogue.js';
import { drawPauseMenu, drawTitleScreen } from './menu.js';
import { coverMission, footMission } from './missions.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_OVER = 'over';
export const SCREEN_CHASE = 'chase';
export const SCREEN_FOOT = 'foot';
export const SCREEN_MENU = 'menu';

const W = FIELD.width;
const H = FIELD.height;

export function createRenderer(canvas) {
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  function drawSky(t, dusk) {
    const grad = ctx.createLinearGradient(0, 0, 0, FIELD.horizonY + 40);
    if (dusk) {
      grad.addColorStop(0, '#2b2a55');
      grad.addColorStop(0.55, '#7a4a7d');
      grad.addColorStop(1, '#e08a5c');
    } else {
      grad.addColorStop(0, PALETTE.skyTop);
      grad.addColorStop(0.55, PALETTE.skyMid);
      grad.addColorStop(1, PALETTE.skyHorizon);
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, FIELD.horizonY + 40);
    // Sun disc, low on the horizon.
    const sunX = dusk ? 880 : 920;
    const sunY = dusk ? 250 : 232;
    const sunGrad = ctx.createRadialGradient(sunX, sunY, 4, sunX, sunY, 90);
    sunGrad.addColorStop(0, PALETTE.sunCore);
    sunGrad.addColorStop(0.35, PALETTE.sun);
    sunGrad.addColorStop(1, 'rgba(255, 243, 196, 0)');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 90, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = PALETTE.sunCore;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 26, 0, Math.PI * 2);
    ctx.fill();
    // Slow clouds.
    ctx.fillStyle = 'rgba(255, 235, 205, 0.5)';
    for (let i = 0; i < 4; i += 1) {
      const cx = ((i * 340 + t * 6) % 1400) - 60;
      const cy = 60 + i * 42;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 90, 14, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawSkyline(city) {
    for (const b of city.far) {
      ctx.fillStyle = b.colour;
      ctx.fillRect(b.x, FIELD.horizonY - b.height, b.width, b.height + 4);
      // Lit windows on the skyline.
      ctx.fillStyle = 'rgba(255, 220, 130, 0.55)';
      for (let wy = FIELD.horizonY - b.height + 8; wy < FIELD.horizonY - 8; wy += 14) {
        for (let wx = b.x + 8; wx < b.x + b.width - 8; wx += 16) {
          if ((wx * 7 + wy * 13) % 23 < 9) ctx.fillRect(wx, wy, 5, 7);
        }
      }
    }
  }

  function drawRoad() {
    // Ground: warm pavement on both sides of the road.
    ctx.fillStyle = '#8a6f4d';
    ctx.fillRect(0, FIELD.horizonY, W, H - FIELD.horizonY);
    // Sidewalks.
    ctx.fillStyle = PALETTE.sidewalk;
    const leftTop = roadHalfWidth(1);
    ctx.beginPath();
    ctx.moveTo(0, FIELD.horizonY);
    ctx.lineTo(W, FIELD.horizonY);
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fill();
    // Road trapezoid.
    ctx.fillStyle = PALETTE.road;
    ctx.beginPath();
    ctx.moveTo(W / 2 - roadHalfWidth(1), FIELD.horizonY);
    ctx.lineTo(W / 2 + roadHalfWidth(1), FIELD.horizonY);
    ctx.lineTo(W / 2 + roadHalfWidth(0), H);
    ctx.lineTo(W / 2 - roadHalfWidth(0), H);
    ctx.closePath();
    ctx.fill();
    // Edge lines.
    ctx.strokeStyle = PALETTE.roadEdge;
    ctx.lineWidth = 3;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(W / 2 + side * roadHalfWidth(1), FIELD.horizonY);
      ctx.lineTo(W / 2 + side * roadHalfWidth(0), H);
      ctx.stroke();
    }
    // Centre dashes, converging with depth.
    ctx.fillStyle = PALETTE.lane;
    for (let d = 0.06; d < 1; d += 0.09) {
      const p = roadY(d);
      const w = 3 + 7 * (1 - d);
      const h = 6 + 16 * (1 - d);
      ctx.fillRect(W / 2 - w / 2, p - h, w, h);
    }
  }

  function drawBuildings(city) {
    const sorted = [...city.near].sort((a, b) => b.depth - a.depth);
    for (const b of sorted) {
      const lateral = b.side * (4.6 + b.widthM * 0.4);
      const p = project(lateral, 0, b.depth);
      const w = b.widthM * 150 * p.s;
      const h = b.heightM * 95 * p.s;
      const x = p.x - w / 2;
      const y = p.y - h;
      ctx.fillStyle = b.colour;
      ctx.fillRect(x, y, w, h);
      // Roof line.
      ctx.fillStyle = 'rgba(20, 16, 12, 0.35)';
      ctx.fillRect(x, y, w, Math.max(2, h * 0.05));
      // Windows: lit warm rectangles in a grid.
      const cols = Math.max(2, Math.floor(w / 26));
      const rows = Math.max(2, Math.floor(h / 30));
      for (let r = 0; r < rows; r += 1) {
        for (let c = 0; c < cols; c += 1) {
          if ((r * 5 + c * 3 + (b.side > 0 ? 1 : 0)) % 4 === 0) {
            ctx.fillStyle = b.lit ? 'rgba(255, 214, 120, 0.85)' : 'rgba(40, 48, 66, 0.8)';
            ctx.fillRect(x + 8 + c * ((w - 16) / cols), y + 10 + r * ((h - 18) / rows), (w - 16) / cols - 6, (h - 18) / rows - 8);
          }
        }
      }
      // Shop awning at street level.
      if (b.depth < 0.6) {
        ctx.fillStyle = b.side > 0 ? '#c94f6d' : '#4a7fb5';
        ctx.fillRect(x, p.y - Math.max(6, h * 0.12), w, Math.max(6, h * 0.12));
      }
    }
  }

  function drawPalmsLamps(city, t) {
    for (const palm of city.palms) {
      const p = project(palm.side * 3.9, 0, palm.depth);
      const h = palm.heightM * 95 * p.s;
      ctx.strokeStyle = '#6b4a2f';
      ctx.lineWidth = Math.max(2, 4 * p.s);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.quadraticCurveTo(p.x + 6 * p.s, p.y - h * 0.6, p.x - 4 * p.s, p.y - h);
      ctx.stroke();
      ctx.fillStyle = '#3f7a44';
      for (let i = 0; i < 5; i += 1) {
        const a = (i / 5) * Math.PI * 2 + t * 0.2;
        ctx.beginPath();
        ctx.ellipse(p.x - 4 * p.s + Math.cos(a) * 12 * p.s, p.y - h + Math.sin(a) * 5 * p.s, 12 * p.s, 4 * p.s, a, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    for (const lamp of city.lamps) {
      const p = project(lamp.side * 3.5, 0, lamp.depth);
      const h = 2.6 * 95 * p.s;
      ctx.strokeStyle = '#2b2b2e';
      ctx.lineWidth = Math.max(1.5, 3 * p.s);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x, p.y - h);
      ctx.stroke();
      ctx.fillStyle = 'rgba(255, 220, 130, 0.95)';
      ctx.beginPath();
      ctx.arc(p.x, p.y - h, Math.max(2.5, 5 * p.s), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawPedestrian(ped) {
    const p = project(ped.lane, 0, ped.depth);
    const h = 1.75 * 95 * p.s;
    const w = h * 0.32;
    const bob = Math.sin(ped.walk) * 2 * p.s;
    ctx.fillStyle = ped.colour;
    ctx.fillRect(p.x - w / 2, p.y - h + bob, w, h * 0.55);
    ctx.fillStyle = '#e8b98a';
    ctx.beginPath();
    ctx.arc(p.x, p.y - h * 0.72 + bob, h * 0.16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#241a12';
    ctx.fillRect(p.x - w * 0.35, p.y - h + bob * 0.5, w * 0.28, h * 0.5);
    ctx.fillRect(p.x + w * 0.07, p.y - h + bob * 0.5, w * 0.28, h * 0.5);
  }

  function drawChaseScene(state, city, t) {
    drawSky(t, false);
    drawSkyline(city);
    drawRoad();
    drawBuildings(city);
    drawPalmsLamps(city, t);
    // Spotlight cone from the helicopter to the road ahead (behind the cars).
    const heli = state.police;
    const coneTarget = project(0.6, 0, 0.52);
    drawHelicopter(ctx, heli, coneTarget.x, coneTarget.y, t);
    // Traffic, far to near.
    const cars = [...state.traffic.cars].sort((a, b) => b.depth - a.depth);
    for (const car of cars) drawCar(ctx, car.lane, car.depth, car.kind === 'van' ? 2.3 : 1.9, car.colour, {});
    // Dray's black sedan, just ahead of the hero.
    drawSedan(ctx, 0.9, 0.48);
    // Flanking cruisers.
    for (const cruiser of state.police.cruisers) drawCruiser(ctx, cruiser.lane, cruiser.depth);
    // Burning car on the left.
    drawBurningCar(ctx, state.traffic.burning.lane, state.traffic.burning.depth, t);
    // Scooter on the right sidewalk.
    const sc = state.traffic.scooter;
    const sp = project(sc.lane, 0, sc.depth);
    ctx.fillStyle = '#c9d4dc';
    ctx.fillRect(sp.x - 8 * sp.s, sp.y - 14 * sp.s, 16 * sp.s, 14 * sp.s);
    // Pedestrians.
    for (const ped of state.traffic.peds) drawPedestrian(ped);
    // The hero, last and largest.
    drawHero(ctx, state.player.lateral, state.player.depth);
  }

  function drawFootScene(state, city, t) {
    // Lantern Mile at dusk: purple-blue sky, warm stalls.
    drawSky(t, true);
    drawSkyline(city);
    // Market street: cobbles.
    ctx.fillStyle = '#5a4632';
    ctx.fillRect(0, FIELD.horizonY, W, H - FIELD.horizonY);
    // Stalls in a row, near to far on both sides.
    const stallColours = ['#c94f6d', '#e08a3c', '#4a7fb5', '#7a9e4f'];
    for (let i = 0; i < 7; i += 1) {
      const depth = 0.25 + i * 0.1;
      const side = i % 2 === 0 ? -1 : 1;
      const p = project(side * 3.2, 0, depth);
      const w = 2.6 * 150 * p.s;
      const h = 1.9 * 95 * p.s;
      const x = p.x - w / 2;
      const y = p.y - h;
      // Stall awning (striped).
      ctx.fillStyle = stallColours[i % stallColours.length];
      ctx.fillRect(x, y, w, h * 0.3);
      ctx.fillStyle = 'rgba(255, 235, 200, 0.85)';
      for (let s = 0; s < 5; s += 1) ctx.fillRect(x + (s * 2 + 1) * (w / 10), y, w / 10, h * 0.3);
      // Counter + goods.
      ctx.fillStyle = '#6b4a2f';
      ctx.fillRect(x + w * 0.06, y + h * 0.55, w * 0.88, h * 0.45);
      ctx.fillStyle = '#f2c94c';
      ctx.fillRect(x + w * 0.12, y + h * 0.48, w * 0.16, h * 0.1);
      ctx.fillStyle = '#e2574c';
      ctx.fillRect(x + w * 0.42, y + h * 0.48, w * 0.16, h * 0.1);
      ctx.fillStyle = '#7fc46a';
      ctx.fillRect(x + w * 0.7, y + h * 0.48, w * 0.16, h * 0.1);
      // Warm lantern glow.
      const glow = ctx.createRadialGradient(p.x, y + h * 0.2, 4, p.x, y + h * 0.2, w * 0.7);
      glow.addColorStop(0, 'rgba(255, 190, 90, 0.4)');
      glow.addColorStop(1, 'rgba(255, 190, 90, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(x - w * 0.4, y - h * 0.4, w * 1.8, h * 1.6);
    }
    // String lights across the street.
    ctx.strokeStyle = 'rgba(255, 220, 130, 0.8)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(60, 300);
    ctx.quadraticCurveTo(W / 2, 360, W - 60, 300);
    ctx.stroke();
    for (let i = 0; i < 12; i += 1) {
      const lx = 60 + (i / 11) * (W - 120);
      const ly = 300 + Math.sin((i / 11) * Math.PI) * 55;
      ctx.fillStyle = i % 3 === 0 ? '#ff9a5c' : i % 3 === 1 ? '#f2c94c' : '#c94f6d';
      ctx.beginPath();
      ctx.arc(lx, ly, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    // Renn on foot, centre-bottom, and a stall keeper.
    drawPerson(ctx, 620, 640, 150, '#2b4a6b', '#e8b98a');
    drawPerson(ctx, 420, 560, 110, '#c94f6d', '#e8b98a');
    drawPerson(ctx, 880, 580, 105, '#7a9e4f', '#d8a878');
  }

  function drawPerson(ctx, x, baseY, h, clothes, skin) {
    ctx.fillStyle = clothes;
    ctx.fillRect(x - h * 0.16, baseY - h * 0.62, h * 0.32, h * 0.62);
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.arc(x, baseY - h * 0.74, h * 0.13, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#241a12';
    ctx.beginPath();
    ctx.arc(x, baseY - h * 0.8, h * 0.12, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#1c1a18';
    ctx.fillRect(x - h * 0.14, baseY - h * 0.06, h * 0.1, h * 0.06);
    ctx.fillRect(x + h * 0.04, baseY - h * 0.06, h * 0.1, h * 0.06);
  }

  function drawTitlePanorama(city, t) {
    drawSky(t, false);
    drawSkyline(city);
    // Sea on the right, beach at the bottom.
    ctx.fillStyle = '#e08a5c';
    ctx.fillRect(0, FIELD.horizonY, W, H - FIELD.horizonY);
    ctx.fillStyle = '#d98a6a';
    ctx.beginPath();
    ctx.moveTo(0, 470);
    ctx.lineTo(W, 420);
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#e8c98f';
    ctx.beginPath();
    ctx.moveTo(0, 560);
    ctx.lineTo(W, 520);
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fill();
    // The Falcon GT parked on the beach, silhouette in the sun (far left, clear of the save slots).
    ctx.fillStyle = '#1c1a18';
    ctx.beginPath();
    ctx.ellipse(110, 655, 100, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(30, 612, 170, 38);
    ctx.fillRect(60, 588, 105, 28);
    ctx.fillStyle = '#ff7a1a';
    ctx.fillRect(30, 609, 170, 6);
  }

  function drawHudChase(state) {
    const m = coverMission();
    m.timer = formatTimer(state.timerSeconds);
    drawMissionPanel(ctx, m);
    drawMoneyRank(ctx, state.money, state.police.wanted, state.rank);
    drawCrewPanel(ctx);
    const dispatchBottom = drawDispatchPanel(ctx);
    drawTicker(ctx, dispatchBottom);
    drawMinimap(ctx, 86, 628, 48);
    drawHealthBars(ctx, 158, 606, state.player.health, state.player.armour);
    drawWeaponSlots(ctx, 430, 592, 470);
    drawAbilityCards(ctx, 430, 632, 470);
    drawSpeedBlock(ctx, Math.round(state.speedKmh), 'FALCON GT', 62, 0);
    drawDialogueBox(ctx, 16, 500, 400, 'chase');
    drawControlBar(ctx);
  }

  function drawHudFoot(state) {
    const m = footMission();
    drawMissionPanel(ctx, m);
    drawMoneyRank(ctx, state.money, 2, state.rank);
    drawCrewPanel(ctx);
    const dispatchBottom = drawDispatchPanel(ctx);
    drawTicker(ctx, dispatchBottom);
    drawMinimap(ctx, 86, 628, 48);
    drawHealthBars(ctx, 158, 606, state.player.health, state.player.armour);
    drawWeaponSlots(ctx, 430, 592, 470);
    drawAbilityCards(ctx, 430, 632, 470);
    // On-foot speed block.
    ctx.fillStyle = 'rgba(12, 10, 14, 0.88)';
    ctx.fillRect(W - 300, 596, 284, 100);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 34px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('0', W - 286, 604);
    ctx.font = 'bold 14px system-ui, sans-serif';
    ctx.fillText('KM/H — ON FOOT', W - 236, 622);
    ctx.fillStyle = '#f2c94c';
    ctx.fillText('2/5 STALLS COLLECTED', W - 286, 652);
    ctx.fillStyle = '#c9bda6';
    ctx.font = '12px system-ui, sans-serif';
    ctx.fillText('LANTERN MILE — Night Market · 21:05', W - 286, 676);
    drawDialogueBox(ctx, 16, 500, 400, 'foot');
    drawControlBar(ctx);
  }

  function formatTimer(seconds) {
    const s = Math.max(0, Math.ceil(seconds));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  }

  function draw(state, city, screen, t) {
    ctx.clearRect(0, 0, W, H);
    if (screen === SCREEN_TITLE) {
      drawTitlePanorama(city, t);
      drawTitleScreen(ctx);
      return;
    }
    if (screen === SCREEN_MENU || screen === SCREEN_PAUSED) {
      drawChaseScene(state, city, t);
      drawPauseMenu(ctx, state);
      return;
    }
    if (screen === SCREEN_FOOT) {
      drawFootScene(state, city, t);
      drawHudFoot(state);
      return;
    }
    if (screen === SCREEN_OVER) {
      drawChaseScene(state, city, t);
      ctx.fillStyle = 'rgba(10, 8, 10, 0.6)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 52px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('BUSTED', W / 2, 300);
      ctx.font = '18px system-ui, sans-serif';
      ctx.fillText('Tarnwick PD caught up with you. SPACE — try again.', W / 2, 350);
      ctx.textAlign = 'left';
      return;
    }
    // SCREEN_PLAY and SCREEN_CHASE: the golden-hour chase + full HUD.
    drawChaseScene(state, city, t);
    drawHudChase(state);
  }

  return { draw };
}
