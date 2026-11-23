// Boot and the one loop: input is read every frame, the world advances in fixed 1/60 s
// steps (several in a slow frame, none in a fast one), and the renderer paints what is
// there. The game moves between four screens: title, play, paused and game over.
// Renn Kovacs drives Tam's Falcon GT through Tarnwick; the police chase; the eight
// story jobs advance the arc. E steps out of the car to walk Lantern Mile on foot.
//
// ?seed=N fixes the street. ?shot=chase|foot|menu|title (with &seed=N) stages that
// scene instead of running the loop, paints it twice and sets window.__shotReady
// for a screenshot.
import { BEST_KEY, LIVES, STEP } from './config.js';
import { createRandom } from './random.js';
import { createCity } from './city.js';
import { createWorld, EVENT_HIT, EVENT_MISSION, EVENT_OVER } from './world.js';
import { createTraffic } from './traffic.js';
import { stepPlayer, useAbility } from './player.js';
import { ACTION_ABILITY_1, ACTION_ABILITY_2, ACTION_ABILITY_3, ACTION_CONFIRM, ACTION_EXIT, ACTION_PAUSE, ACTION_RADIO, createInput } from './input.js';
import { createRenderer, SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE } from './render.js';
import { createAudio } from './audio.js';
import { stageShot } from './shots.js';

/** The longest frame the loop catches up on; a longer stall (a hidden tab) is dropped. */
const MAX_FRAME = 0.25;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const random = createRandom(seed);
const world = createWorld(random);
const city = createCity(random);
const traffic = createTraffic(random);
world.state.city = city;
world.state.traffic = traffic;
world.state.shot = '';
const renderer = createRenderer(canvas);
const audio = createAudio();

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

function runShot(name) {
  // The status pill is an HTML overlay — hide it so it never lands on a screenshot.
  status.style.display = 'none';
  const scene = stageShot(name, world, city, traffic);
  let painted = 0;
  function paint() {
    renderer.draw(world.state, scene.screen, scene.best);
    painted += 1;
    if (painted >= 2) window.__shotReady = true;
    // Keep painting: a late resize clears the canvas, and a single stopped frame
    // would leave it blank. The loop is cheap and the shot is only for screenshots.
    requestAnimationFrame(paint);
  }
  requestAnimationFrame(paint);
}

function runGame() {
  const input = createInput(canvas);
  const wanted = { level: world.state.wanted };
  let screen = SCREEN_TITLE;
  let best = readBest();
  let accumulator = 0;
  let last = performance.now();

  function announce(message) {
    status.textContent = message;
  }

  function startGame() {
    world.reset();
    world.state.city = city;
    world.state.traffic = traffic;
    world.state.shot = '';
    wanted.level = world.state.wanted;
    accumulator = 0;
    screen = SCREEN_PLAY;
    audio.unlock();
    announce('Playing. Drive the Falcon GT. Lose the police, finish the job.');
  }

  function endGame(busted) {
    screen = SCREEN_OVER;
    world.state.busted = busted;
    if (world.state.score > best) {
      best = world.state.score;
      saveBest(best);
    }
    announce(busted ? 'Busted. Tarnwick PD took you in.' : 'Wrecked. The Falcon gave out.');
  }

  function handleActions() {
    const actions = input.takeActions();
    if (actions & ACTION_CONFIRM && (screen === SCREEN_TITLE || screen === SCREEN_OVER)) startGame();
    else if (actions & ACTION_PAUSE && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      announce('Paused.');
    } else if (actions & (ACTION_PAUSE | ACTION_CONFIRM) && screen === SCREEN_PAUSED) {
      screen = SCREEN_PLAY;
      announce('Playing.');
    }
    if (screen !== SCREEN_PLAY) return;
    if (actions & ACTION_EXIT) {
      world.state.onFoot = !world.state.onFoot;
      announce(world.state.onFoot ? 'On foot. Walk Lantern Mile.' : 'Back in the Falcon GT.');
    }
    if (actions & ACTION_RADIO) {
      world.state.radio = (world.state.radio + 1) % 3;
    }
    if (actions & ACTION_ABILITY_1) {
      const line = useAbility(world.state, wanted, 0);
      if (line) announce(line);
    }
    if (actions & ACTION_ABILITY_2) {
      const line = useAbility(world.state, wanted, 1);
      if (line) announce(line);
    }
    if (actions & ACTION_ABILITY_3) {
      const line = useAbility(world.state, wanted, 2);
      if (line) announce(line);
    }
  }

  function step() {
    if (screen === SCREEN_TITLE) {
      world.step(STEP, 0, true);
      return;
    }
    const direction = input.direction();
    const state = world.state;
    stepPlayer(state, STEP, direction, input.throttle(), input.brake());
    const events = world.step(STEP, direction, false);
    state.wanted = wanted.level;
    audio.frame(state.speed, state.wanted, state.radio, STEP);
    if (events & EVENT_OVER) endGame(false);
    else if (events & EVENT_HIT) announce('Hit. The Falcon took damage.');
    else if (events & EVENT_MISSION) announce('Time up — Dray’s sedan got away. The job goes on.');
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
    renderer.draw(world.state, screen, best);
  }

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
