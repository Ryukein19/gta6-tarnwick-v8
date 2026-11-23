// Boot and the one loop: input is read every frame, the world advances in fixed 1/60 s
// steps (several in a slow frame, none in a fast one), and the renderer paints what is
// there. The game moves between four screens: title, play, paused and game over.
//
// ?seed=N fixes the city and the traffic. ?shot=chase|foot|menu|title (with &seed=N)
// stages that scene instead of running the loop, repaints it continuously (a late resize
// must never leave a black canvas) and sets window.__shotReady for a screenshot.
import { STEP } from './config.js';
import { createRandom } from './random.js';
import { createCity } from './city.js';
import { createWorld, EVENT_ESCAPED, EVENT_WRECKED } from './world.js';
import {
  ACTION_CONFIRM, ACTION_PAUSE, ACTION_RADIO, ACTION_MUTE, createInput,
} from './input.js';
import {
  createRenderer, SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE,
} from './render.js';
import { stageShot } from './shots.js';

/** The longest frame the loop catches up on; a longer stall (a hidden tab) is dropped, not replayed. */
const MAX_FRAME = 0.25;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const random = createRandom(seed);
const city = createCity(random);
const world = createWorld(random);
const renderer = createRenderer(canvas);

function runShot(name) {
  const scene = stageShot(name, world);
  let painted = 0;
  // Fixed t: the staged frame is deterministic — the same seed gives the same frame
  // on every render, so the shipped screenshot is exactly what the game produces.
  const t = 1.5;
  // Repaint continuously: the shot is a living frame, and a canvas cleared by a late
  // resize is repainted on the next frame instead of staying black.
  function paint() {
    renderer.draw(world.state, city, scene.screen, t);
    painted += 1;
    if (painted === 2) window.__shotReady = true;
    requestAnimationFrame(paint);
  }
  requestAnimationFrame(paint);
}

function runGame() {
  const input = createInput(canvas);
  let screen = SCREEN_TITLE;
  let radioIndex = 0;
  let accumulator = 0;
  let last = performance.now();
  let t = 0;

  // Screen readers (and anyone watching the page's text) hear the screen changes.
  function announce(message) {
    status.textContent = message;
  }

  function startGame() {
    world.reset();
    accumulator = 0;
    screen = SCREEN_PLAY;
    announce('Playing. Job 6 of 8: The Captain’s Car. Wreck Dray’s sedan.');
  }

  function endGame(busted) {
    screen = SCREEN_OVER;
    announce(busted ? 'Busted. Tarnwick PD caught up with you.' : 'Job done. The sedan is smoking on the Strand.');
  }

  function handleActions() {
    const actions = input.takeActions();
    if (actions & ACTION_MUTE) {
      const muted = input.audio.toggleMute();
      announce(muted ? 'Muted.' : 'Sound on.');
    }
    if (actions & ACTION_RADIO) {
      radioIndex = (radioIndex + 1) % 3;
      announce(`Radio: ${['WAVE 97.9', 'HARBOUR 101.2', 'TARNWICK TALK 1210'][radioIndex]}.`);
    }
    if (actions & ACTION_CONFIRM && (screen === SCREEN_TITLE || screen === SCREEN_OVER)) startGame();
    else if (actions & ACTION_PAUSE && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      announce('Paused.');
    } else if (actions & (ACTION_PAUSE | ACTION_CONFIRM) && screen === SCREEN_PAUSED) {
      screen = SCREEN_PLAY;
      announce('Playing.');
    }
  }

  function step() {
    if (screen === SCREEN_TITLE) return;
    const events = world.step(STEP, input.direction());
    if (events & EVENT_WRECKED) endGame(false);
    else if (events & EVENT_ESCAPED) endGame(true);
  }

  function frame(now) {
    requestAnimationFrame(frame);
    accumulator += Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    t += 1 / 60;
    handleActions();
    if (screen === SCREEN_TITLE || screen === SCREEN_PLAY) {
      while (accumulator >= STEP && (screen === SCREEN_TITLE || screen === SCREEN_PLAY)) {
        step();
        accumulator -= STEP;
      }
    } else {
      accumulator = 0;
    }
    renderer.draw(world.state, city, screen, t);
  }

  // Leaving the tab pauses a running game rather than letting the timer run unseen.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      announce('Paused.');
    }
  });

  announce('Tarnwick. Press Space or click to start.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
