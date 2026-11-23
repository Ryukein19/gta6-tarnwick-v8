// Tarnwick v8 — Come Home. Boot and the one loop: input is read every frame,
// the world advances in fixed 1/60 s steps (several in a slow frame, none in a
// fast one), and the renderer paints what is there. The game moves between four
// screens: title, play, paused and game over. On foot, Renn walks the Lantern
// Mile market instead of driving.
//
// ?seed=N fixes the city and traffic. ?shot=chase|foot|menu|title (with
// &seed=N) stages that scene instead of running the loop, repaints it
// continuously (a late resize must never clear the canvas to black) and sets
// window.__shotReady for a screenshot.
import { STEP } from './config.js';
import { createRandom } from './random.js';
import { createWorld, EVENT_TIMER_END } from './world.js';
import { ACTION_CONFIRM, ACTION_ENTER, ACTION_MUTE, ACTION_PAUSE, createInput } from './input.js';
import { createRenderer, SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE } from './render.js';
import { stageShot } from './shots.js';
import { readSaves, saveToSlot } from './save.js';
import { blip, setEngine, startAudio, toggleMute } from './audio.js';
import { stepPlayer, takeHit } from './player.js';

/** The longest frame the loop catches up on; a longer stall (a hidden tab) is dropped, not replayed. */
const MAX_FRAME = 0.25;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const world = createWorld(createRandom(seed));
const renderer = createRenderer(canvas);
const saves = readSaves();

function runShot(name) {
  const staged = stageShot(name, world);
  let painted = 0;
  function paint() {
    renderer.draw(world.state, world.city, staged.screen, saves, world.state.time);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
    // Keep repainting: a resize after the shot would otherwise clear the canvas.
    if (painted < 30) requestAnimationFrame(paint);
  }
  requestAnimationFrame(paint);
}

function runGame() {
  const input = createInput(canvas);
  let screen = SCREEN_TITLE;
  let accumulator = 0;
  let last = performance.now();

  // Screen readers (and anyone watching the page's text) hear the screen changes.
  function announce(message) {
    status.textContent = message;
  }

  function startGame() {
    startAudio();
    world.reset();
    accumulator = 0;
    screen = SCREEN_PLAY;
    announce('Playing. Job 6 of 8, the Captain\'s car. Wreck Dray\'s sedan.');
  }

  function endGame() {
    screen = SCREEN_OVER;
    saveToSlot(1, 'ACT 3', 55, world.state.money, world.state.clock);
    announce(`Wrecked. The Strand keeps the car. Money $${world.state.money}.`);
  }

  function handleActions() {
    const actions = input.takeActions();
    if (actions & ACTION_MUTE) {
      toggleMute();
      return;
    }
    if (actions & ACTION_CONFIRM && (screen === SCREEN_TITLE || screen === SCREEN_OVER)) startGame();
    else if (actions & ACTION_PAUSE && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      announce('Paused.');
    } else if (actions & (ACTION_PAUSE | ACTION_CONFIRM) && screen === SCREEN_PAUSED) {
      screen = SCREEN_PLAY;
      announce('Playing.');
    } else if (actions & ACTION_ENTER && screen === SCREEN_PLAY) {
      world.state.player.onFoot = !world.state.player.onFoot;
      world.state.mode = world.state.player.onFoot ? 'foot' : 'chase';
      announce(world.state.player.onFoot ? 'On foot in Lantern Mile.' : 'Back in the Falcon GT.');
    }
    const weapon = input.takeWeapon();
    if (weapon) blip(440 + weapon * 80);
  }

  function step() {
    if (screen === SCREEN_TITLE) {
      world.step(STEP, 0, true);
      return;
    }
    const events = world.step(STEP, input.direction(), false);
    stepPlayer(world.state.player, input.direction(), false, STEP);
    setEngine(world.state.speed / 168);
    if (events & EVENT_TIMER_END) {
      takeHit(world.state.player, 40);
      if (world.state.player.damage >= 100) endGame();
    }
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
    renderer.draw(world.state, world.city, screen, saves, world.state.time);
  }

  // Leaving the tab pauses a running game rather than letting the timer run unseen.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      announce('Paused.');
    }
  });

  announce('Tarnwick. Come Home. Press Space or click to start.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
