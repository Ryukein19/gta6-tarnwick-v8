// Tarnwick PD: the helicopter SKUA-3 with its spotlight cone, the flanking cruisers,
// and the 7-unit dispatch board. The helicopter circles slowly above the road; its
// spotlight cone is a translucent wedge that visibly hits the road ahead of the hero
// car. The wanted level holds at 4 stars while the chase is live.
import { DISPATCH, WANTED_STARS } from './config.js';

export function createPolice(random) {
  const state = {
    units: DISPATCH,
    wanted: WANTED_STARS,
    heliAngle: 0.6,
    heliX: 640,
    heliY: 118,
    rotor: 0,
    cruisers: [
      { lane: -2.4, depth: 0.34 },
      { lane: 2.5, depth: 0.4 },
    ],
  };

  function reset() {
    state.heliAngle = 0.6;
    state.heliX = 640;
    state.heliY = 118;
    state.rotor = 0;
    state.cruisers[0].lane = -2.4;
    state.cruisers[0].depth = 0.34;
    state.cruisers[1].lane = 2.5;
    state.cruisers[1].depth = 0.4;
  }

  function step(dt) {
    state.heliAngle += dt * 0.12;
    state.heliX = 640 + Math.sin(state.heliAngle) * 90;
    state.heliY = 118 + Math.sin(state.heliAngle * 2.3) * 10;
    state.rotor += dt * 22;
    for (const cruiser of state.cruisers) {
      cruiser.depth -= dt * 0.004;
      if (cruiser.depth < 0.2) cruiser.depth = 0.55;
    }
  }

  return { state, reset, step };
}

/** Draw the helicopter: body, tail, rotor disc, skids, and the spotlight cone down to
 * the road ahead of the hero car. `targetX` is where the cone lands on the road. */
export function drawHelicopter(ctx, heli, targetX, targetY, t) {
  const x = heli.heliX;
  const y = heli.heliY;
  const w = 150;
  const h = 34;

  // Spotlight cone: a wide translucent wedge from the heli to the road.
  const grad = ctx.createLinearGradient(x, y + h * 0.4, targetX, targetY);
  grad.addColorStop(0, 'rgba(255, 244, 190, 0.65)');
  grad.addColorStop(1, 'rgba(255, 244, 190, 0.08)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(x - 12, y + h * 0.4);
  ctx.lineTo(x + 12, y + h * 0.4);
  ctx.lineTo(targetX + 110, targetY);
  ctx.lineTo(targetX - 110, targetY);
  ctx.closePath();
  ctx.fill();
  // Bright pool where the cone hits the road.
  ctx.fillStyle = 'rgba(255, 244, 190, 0.35)';
  ctx.beginPath();
  ctx.ellipse(targetX, targetY, 110, 16, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tail boom + fin.
  ctx.fillStyle = '#20242c';
  ctx.fillRect(x - w * 0.62, y - h * 0.1, w * 0.42, h * 0.22);
  ctx.beginPath();
  ctx.moveTo(x - w * 0.62, y - h * 0.1);
  ctx.lineTo(x - w * 0.72, y - h * 0.7);
  ctx.lineTo(x - w * 0.52, y - h * 0.1);
  ctx.closePath();
  ctx.fill();
  // Body.
  ctx.fillStyle = '#2b313c';
  ctx.beginPath();
  ctx.ellipse(x, y, w * 0.32, h * 0.52, 0, 0, Math.PI * 2);
  ctx.fill();
  // Cockpit glass.
  ctx.fillStyle = '#9fc6d8';
  ctx.beginPath();
  ctx.ellipse(x + w * 0.16, y - h * 0.08, w * 0.13, h * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();
  // Skids.
  ctx.strokeStyle = '#14100e';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x - w * 0.24, y + h * 0.62);
  ctx.lineTo(x + w * 0.24, y + h * 0.62);
  ctx.stroke();
  // Rotor disc (blurred by rotation) + mast.
  ctx.strokeStyle = 'rgba(20, 16, 12, 0.55)';
  ctx.lineWidth = 5;
  ctx.beginPath();
  const tilt = Math.sin(heli.rotor) * 0.12;
  ctx.moveTo(x - w * 0.62, y - h * 0.62 + tilt * 30);
  ctx.lineTo(x + w * 0.62, y - h * 0.62 - tilt * 30);
  ctx.stroke();
  ctx.fillStyle = '#14100e';
  ctx.fillRect(x - 3, y - h * 0.62, 6, h * 0.5);
  // Searchlight housing under the nose.
  ctx.fillStyle = '#fff3c4';
  ctx.beginPath();
  ctx.arc(x + w * 0.2, y + h * 0.42, 7, 0, Math.PI * 2);
  ctx.fill();
}
