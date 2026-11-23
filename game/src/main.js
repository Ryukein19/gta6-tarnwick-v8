// Tarnwick — Come Home. The entry point: the screen state machine (title → chase → foot →
// map → results), the fixed-step loop, the HUD scaling and the screenshot hook the capture
// script drives. The loop is a plain fixed-step accumulator: the world advances in 1/60 s
// steps and the renderer draws once per frame, so the chase is the same on every machine.

import { createWorld, EVENT_ARRIVED, EVENT_TIME_UP, EVENT_NEAR_MISS } from './world.js';
import { createRandom } from './random.js';
import { createRenderer, MODE_CHASE } from './render.js';
import { createInput, ACTION_CONFIRM, ACTION_PAUSE, ACTION_MAP } from './input.js';
import { createHud, setHudMode } from './hud.js';
import { createShots } from './shots.js';
import { STEP, FIELD, BEST_KEY, GAME } from './config.js';

const canvas = document.getElementById('game');
const hudRoot = document.getElementById('hud');
const statusEl = document.getElementById('status');

function best() {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // A blocked storage is not a failed game.
  }
}

// The HUD is a fixed 1280x720 layer; scale it to the window and keep it centred.
function fitHud() {
  const scale = Math.min(window.innerWidth / FIELD.width, window.innerHeight / FIELD.height);
  hudRoot.style.transform = `translate(-50%, -50%) scale(${scale})`;
  hudRoot.style.left = '50%';
  hudRoot.style.top = '50%';
}
window.addEventListener('resize', fitHud);
fitHud();

const hud = createHud(hudRoot);
const renderer = createRenderer(canvas, createRandom(20261124));
const shots = createShots({ renderer, hud });
const input = createInput(canvas);

const world = createWorld(createRandom(20261124));
let screen = 'title';
let time = 0;
let bestScore = best();

function setScreen(next) {
  screen = next;
  if (next === 'title') {
    renderer.stageShot('title', world.state);
    setHudMode(hud, 'title');
    statusEl.textContent = 'Tarnwick: Come Home. Press Enter to start the chase.';
  } else if (next === 'chase') {
    world.reset();
    renderer.stageShot('chase', world.state);
    renderer.mode = MODE_CHASE;
    setHudMode(hud, 'cover');
    statusEl.textContent = 'The Long Way Home: reach the harbour gate before the timer runs out. Four stars on your tail.';
  } else if (next === 'foot') {
    renderer.stageShot('foot', world.state);
    setHudMode(hud, 'foot');
    statusEl.textContent = 'On foot: lose the helicopter through the night market.';
  } else if (next === 'map') {
    renderer.stageShot('menu', world.state);
    setHudMode(hud, 'menu');
    statusEl.textContent = 'Paused. The Tarnwick map: the harbour gate is marked in gold.';
  } else if (next === 'results') {
    statusEl.textContent = `Safehouse reached. The Long Way Home is done — $${GAME.money.toLocaleString('en-US')} and the Falcon GT made it home.`;
  }
}

function frame(now) {
  requestAnimationFrame(frame);
  const actions = input.takeActions();
  if (actions & ACTION_CONFIRM) {
    if (screen === 'title') setScreen('chase');
    else if (screen === 'results') setScreen('title');
  }
  if (actions & ACTION_PAUSE) {
    if (screen === 'chase') setScreen('map');
    else if (screen === 'map') setScreen('chase');
  }
  if (actions & ACTION_MAP) {
    if (screen === 'chase') setScreen('map');
    else if (screen === 'map') setScreen('chase');
  }
  if (screen === 'chase') {
    const events = world.step(STEP, input.steer(), input.throttle());
    if (events & EVENT_NEAR_MISS) {
      statusEl.textContent = `Near miss — the Falcon threads the traffic. ${world.state.nearMiss} so far.`;
    }
    if (events & EVENT_ARRIVED) {
      const score = Math.max(0, Math.round(world.state.timer)) * 100 + world.state.money;
      bestScore = Math.max(bestScore, score);
      saveBest(bestScore);
      setScreen('results');
    } else if (events & EVENT_TIME_UP) {
      statusEl.textContent = 'The harbour gate closed. Dray’s net tightened — try the run again.';
      setScreen('title');
    }
  } else if (screen === 'foot') {
    // On foot, Renn walks the market: the world idles, the heli keeps circling.
    world.state.heli.rotor += STEP * 21;
    world.state.time += STEP;
  }
  time += STEP;
  renderer.draw(world.state);
}

// The screenshot hook: the capture script calls window.__tarnwick.shot('cover') and waits a
// frame, then screenshots the page. No network, no randomness — the same call, the same frame.
window.__tarnwick = {
  shot(name) {
    const shot = shots.stage(name);
    renderer.draw(world.state);
    return shot.name;
  },
  state() {
    return { screen, time, best: bestScore };
  },
};

setScreen('title');
requestAnimationFrame(frame);
