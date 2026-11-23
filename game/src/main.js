// Boot and the one loop: input is read every frame, the world advances in fixed 1/60 s
// steps, and the three.js renderer paints what is there. The game moves between four
// screens: title, play, paused and game over. The DOM HUD and the overlays sit above
// the WebGL canvas.
//
// ?seed=N fixes the street and the traffic. ?shot=cover|foot|menu|title (with &seed=N)
// stages that scene instead of running the loop, paints it twice and sets
// window.__shotReady for a screenshot. Shots never move: every value in the frame is
// a function of the seed and the fixed shot time.
import { BEST_KEY, SHOT_TIME, STEP } from './config.js';
import { createRandom } from './random.js';
import { createWorld, EVENT_OVER } from './world.js';
import { ACTION_CONFIRM, ACTION_PAUSE, createInput } from './input.js';
import { createRenderer, SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE } from './render.js';
import { stageShot } from './shots.js';
import { showHud } from './hud.js';
import { pauseOverlayHtml, titleOverlayHtml } from './map.js';

/** The longest frame the loop catches up on; a longer stall (a hidden tab) is dropped, not replayed. */
const MAX_FRAME = 0.25;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const pauseOverlay = document.getElementById('pauseOverlay');
const titleOverlay = document.getElementById('titleOverlay');
const random = createRandom(seed);
const world = createWorld(random);
world.reset(seed);
const renderer = createRenderer(canvas, random, world.state);

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off (private windows): the best score then lasts this visit only.
  }
}

function showOverlay(which) {
  if (pauseOverlay) pauseOverlay.style.display = which === 'pause' ? 'flex' : 'none';
  if (titleOverlay) titleOverlay.style.display = which === 'title' ? 'flex' : 'none';
}

function runShot(name) {
  const scene = stageShot(name, world);
  if (scene.hud === 'menu' && pauseOverlay) {
    pauseOverlay.innerHTML = pauseOverlayHtml(world.state);
    showOverlay('pause');
  } else if (scene.hud === 'title' && titleOverlay) {
    titleOverlay.innerHTML = titleOverlayHtml();
    showOverlay('title');
  } else {
    showOverlay('none');
  }
  showHud(scene.hud, world.state);
  let painted = 0;
  function paint() {
    renderer.draw(world.state, scene.screen, scene.hud, SHOT_TIME);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  const input = createInput(canvas);
  let screen = SCREEN_TITLE;
  let shotName = 'title';
  let best = readBest();
  let accumulator = 0;
  let last = performance.now();

  function announce(message) {
    status.textContent = message;
  }

  function paint() {
    renderer.draw(world.state, screen, shotName, world.state.time);
    showHud(screen === SCREEN_PLAY ? 'cover' : 'none', world.state);
    if (screen === SCREEN_TITLE && titleOverlay) {
      titleOverlay.innerHTML = titleOverlayHtml();
      showOverlay('title');
    } else if (screen === SCREEN_PAUSED && pauseOverlay) {
      pauseOverlay.innerHTML = pauseOverlayHtml(world.state);
      showOverlay('pause');
    } else {
      showOverlay('none');
    }
  }

  function startGame() {
    world.reset(seed);
    accumulator = 0;
    screen = SCREEN_PLAY;
    shotName = 'cover';
    announce('Playing. Lose the heli. Reach the harbour gate.');
  }

  function endGame() {
    screen = SCREEN_OVER;
    shotName = 'cover';
    if (world.state.money > best) {
      best = world.state.money;
      saveBest(best);
    }
    announce('Game over. The run is done.');
  }

  function handleActions() {
    const actions = input.takeActions();
    if (actions & ACTION_CONFIRM && (screen === SCREEN_TITLE || screen === SCREEN_OVER)) startGame();
    else if (actions & ACTION_PAUSE && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      shotName = 'menu';
      announce('Paused.');
    } else if (actions & (ACTION_PAUSE | ACTION_CONFIRM) && screen === SCREEN_PAUSED) {
      screen = SCREEN_PLAY;
      shotName = 'cover';
      announce('Playing.');
    }
  }

  function step() {
    if (screen === SCREEN_TITLE) return;
    const events = world.step(STEP);
    if (events & EVENT_OVER) endGame();
  }

  function frame(now) {
    requestAnimationFrame(frame);
    accumulator += Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    handleActions();
    if (screen === SCREEN_TITLE || screen === SCREEN_PLAY) {
      while (accumulator >= STEP && (screen === SCREEN_TITLE || screen === SCREEN_PLAY)) {
        step();
        accumulator -= STEP;
      }
    } else {
      accumulator = 0;
    }
    paint();
  }

  // Leaving the tab pauses a running game rather than letting the timer run unseen.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      shotName = 'menu';
      announce('Paused.');
    }
  });

  announce('Tarnwick. Press Space or click to start.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
