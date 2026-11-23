// Drawing only: the three.js renderer, the cameras and the lights. One scene holds the
// whole street — city, hero car, traffic, helicopter, Renn — and each shot is just a
// camera and a visibility choice. The cover camera sits behind and to the side of the
// FALCON GT, so the frame shows the car's rear quarter, its side, its shadow and the
// road ahead: a 3/4 rear view, never dead-on. Shots render at a fixed time, so the
// frame is identical every run.
import * as THREE from 'three';
import { FIELD } from './config.js';
import { buildCity } from './city.js';
import { buildHeroCar, buildTrafficCar } from './car.js';
import { buildHelicopter, buildSpotlight } from './heli.js';
import { buildRenn } from './person.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_OVER = 'over';

export function createRenderer(canvas, random, state) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    preserveDrawingBuffer: true,
  });
  renderer.setPixelRatio(1);
  renderer.setSize(FIELD.width, FIELD.height, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.3;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, FIELD.width / FIELD.height, 0.1, 700);

  // The street is built once, from the fixed seed, and never rebuilt.
  buildCity(scene, random);

  const hero = buildHeroCar();
  hero.position.set(1.5, 0, 0);
  scene.add(hero);

  // The helicopter: scaled up and parked close enough to fill ~35% of the frame.
  const heli = buildHelicopter();
  heli.scale.setScalar(1.7);
  heli.position.set(3.5, 9.5, -30);
  scene.add(heli);
  const beam = buildSpotlight(new THREE.Vector3(3.5, 8.5, -30), new THREE.Vector3(2, 0, -8), 0);
  scene.add(beam);

  // Renn, on foot: hidden except in the foot shot.
  const person = buildRenn();
  person.position.set(1.2, 0, 6);
  person.rotation.y = Math.PI;
  person.visible = false;
  scene.add(person);

  // Traffic: one three.js car per world traffic entry, placed from the state.
  const trafficCars = [];
  for (const entry of state.traffic) {
    const car = buildTrafficCar(entry.color);
    car.position.set(entry.x, 0, entry.z);
    scene.add(car);
    trafficCars.push(car);
  }
  // One parked car near Renn for the foot shot's depth.
  const parked = buildTrafficCar('#3a3a3a');
  parked.position.set(-3.5, 0, -2);
  parked.rotation.y = 0.06;
  parked.visible = false;
  scene.add(parked);

  function setCamera(shot) {
    if (shot === 'cover') {
      // 3/4 rear chase: close behind and to the right of the hero, looking down the road.
      camera.position.set(5.5, 2.8, 7.5);
      camera.lookAt(0, 2.5, -16);
    } else if (shot === 'foot') {
      // Third person behind Renn, down the street.
      camera.position.set(2.8, 2.0, 9.5);
      camera.lookAt(0.5, 1.3, -4);
    } else if (shot === 'menu') {
      // A wide street view, dimmed behind the pause overlay.
      camera.position.set(0, 5.0, 14);
      camera.lookAt(0, 2.0, -40);
    } else {
      // Title: low and wide, the road running to the halo sun. The camera looks
      // slightly left, so the sun sits high in the frame above the title block.
      camera.position.set(0.5, 1.7, 15);
      camera.lookAt(-3, 5, -80);
    }
  }

  /** Paint one frame for a shot. `time` is fixed in shot mode, live in play mode. */
  function draw(worldState, screen, shot, time) {
    const isCover = shot === 'cover';
    const isFoot = shot === 'foot';
    const isTitle = shot === 'title';
    hero.visible = !isFoot;
    heli.visible = isCover;
    beam.visible = isCover;
    person.visible = isFoot;
    parked.visible = isFoot;
    for (const car of trafficCars) car.visible = isCover || isTitle;
    if (isTitle) {
      // The hero car parked at the kerb for the title, angled toward the road.
      hero.position.set(2.0, 0, 1);
      hero.rotation.y = -0.28;
    } else {
      hero.position.set(1.5, 0, 0);
      hero.rotation.y = 0;
    }
    if (isCover) {
      // The rotor holds a fixed angle and the beam holds a fixed target in shots.
      heli.rotation.y = 0.35;
    }
    void worldState;
    void screen;
    void time;
    setCamera(shot);
    renderer.render(scene, camera);
  }

  function resize() {
    renderer.setSize(FIELD.width, FIELD.height, false);
  }

  window.addEventListener('resize', resize);
  return { draw };
}
