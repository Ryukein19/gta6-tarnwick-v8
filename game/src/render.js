// The three.js renderer: the scene, the BRIGHT golden-hour lighting, the sky, the sun, the
// cameras and the shot staging. Lighting is the whole fix for v9: a warm key sun, a strong
// hemisphere fill and — decisively — a warm fill light from the CAMERA, so the hero car and the
// helicopter (which face away from the sun) are lit, not black silhouettes. Nothing important
// is allowed to render black.

import * as THREE from 'three';
import { PALETTE } from './config.js';
import { createCity } from './city.js';
import { buildFalconGT, buildTrafficCar, buildPoliceCar } from './car.js';
import { buildHeli } from './heli.js';
import { buildPerson, buildRenn } from './person.js';
import { createMap } from './map.js';

export const MODE_CHASE = 'chase';
export const MODE_FOOT = 'foot';
export const MODE_MAP = 'map';
export const MODE_TITLE = 'title';

function skyTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0, PALETTE.skyTop); // zenith: bright blue
  g.addColorStop(0.45, PALETTE.skyMid); // mid: peach
  g.addColorStop(0.72, PALETTE.skyHorizon); // horizon: warm orange
  g.addColorStop(1, '#ff7e5f'); // below horizon: deep warm
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 16, 512);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function glowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, 'rgba(255,243,196,1)');
  g.addColorStop(0.25, 'rgba(255,207,125,0.85)');
  g.addColorStop(0.6, 'rgba(255,160,90,0.28)');
  g.addColorStop(1, 'rgba(255,140,66,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createRenderer(canvas, random) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(PALETTE.fog, 70, 280);

  // Sky dome: a big gradient sphere, never fogged.
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(380, 24, 16),
    new THREE.MeshBasicMaterial({ map: skyTexture(), side: THREE.BackSide, fog: false }),
  );
  scene.add(sky);

  // --- Lights: the v9 fix in three lights + ambient.
  // Key sun: warm, low from the west, casts the shadows.
  const sun = new THREE.DirectionalLight(0xffc07a, 2.4);
  sun.position.set(-45, 26, -50);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -45;
  sun.shadow.camera.right = 45;
  sun.shadow.camera.top = 45;
  sun.shadow.camera.bottom = -45;
  sun.shadow.camera.near = 5;
  sun.shadow.camera.far = 180;
  sun.shadow.bias = -0.0004;
  scene.add(sun);
  scene.add(sun.target);
  // Hemisphere: warm sky above, warm ground below — the base fill that keeps nothing black.
  scene.add(new THREE.HemisphereLight(0xffd9b0, 0x8a6f5a, 1.5));
  // Camera fill: warm white from the camera direction, no shadows. This is what lights the
  // hero car's rear and the helicopter's belly — the two objects v9 rendered black.
  const fill = new THREE.DirectionalLight(0xfff2dd, 1.5);
  scene.add(fill);
  scene.add(fill.target);
  // A warm ambient floor so no surface ever reads pure black.
  scene.add(new THREE.AmbientLight(0xffe0b8, 0.5));

  // The sun disc + halo, low on the horizon ahead, slightly left — visible down the road
  // corridor between the buildings, never hidden behind them.
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTexture(), blending: THREE.AdditiveBlending, depthWrite: false, fog: false,
  }));
  glow.scale.set(90, 90, 1);
  glow.position.set(-10, 20, -170);
  scene.add(glow);
  const sunDisc = new THREE.Mesh(
    new THREE.CircleGeometry(5.5, 32),
    new THREE.MeshBasicMaterial({ color: PALETTE.sunCore, fog: false }),
  );
  sunDisc.position.set(-10, 20, -169);
  sunDisc.lookAt(0, 2, 10);
  scene.add(sunDisc);

  // --- The world: city, hero car, traffic, heli, people.
  const city = createCity(random);
  scene.add(city.group);

  const hero = buildFalconGT();
  scene.add(hero);

  const traffic = [];
  const trafficMeshes = [];
  for (let i = 0; i < 9; i += 1) {
    const mesh = i === 2 ? buildPoliceCar() : buildTrafficCar(['trafficRed', 'trafficBlue', 'trafficYellow', 'trafficTeal', 'trafficWhite'][i % 5]);
    scene.add(mesh);
    trafficMeshes.push(mesh);
  }

  const heli = buildHeli();
  scene.add(heli.group);

  /** Place the helicopter and size its spotlight cone so it always reaches the road. The cone
   *  geometry is 13 units tall centred on its origin; scale it to the lamp-to-road distance
   *  and put the pool on the road, whatever height the heli flies at. */
  function placeHeli(x, y, z, rotorAngle, showCone) {
    heli.group.position.set(x, y, z);
    heli.group.rotation.y = 0.3;
    heli.rotor.rotation.y = rotorAngle;
    heli.tailRotor.rotation.x = rotorAngle * 2.2;
    const h = y - 1; // lamp (local y -1) to the road (world y 0)
    heli.cone.scale.y = h / 13;
    heli.cone.position.y = -(y + 1) / 2;
    heli.pool.position.y = 0.1 - y;
    heli.cone.visible = showCone;
    heli.pool.visible = showCone;
  }

  const renn = buildRenn();
  scene.add(renn);
  const pedMeshes = [];
  for (let i = 0; i < 12; i += 1) {
    const ped = buildPerson(['#e5484d', '#4a90d9', '#f2c94c', '#3aa88f', '#e5488a', '#f5efe4'][i % 6], false);
    scene.add(ped);
    pedMeshes.push(ped);
  }

  const map = createMap(scene);

  // --- Cameras.
  const chaseCam = new THREE.PerspectiveCamera(50, 16 / 9, 0.1, 500);
  const footCam = new THREE.PerspectiveCamera(50, 16 / 9, 0.1, 500);
  const titleCam = new THREE.PerspectiveCamera(50, 16 / 9, 0.1, 500);
  const mapCam = new THREE.OrthographicCamera(-110, 110, 110, -110, 1, 400);
  mapCam.position.set(0, 150, -80);
  mapCam.up.set(0, 0, -1); // north (-Z) is up on the map
  mapCam.lookAt(0, 0, -80);

  let activeCam = chaseCam;
  let mode = MODE_CHASE;

  function resize() {
    const ratio = window.devicePixelRatio || 1;
    const width = Math.round(window.innerWidth * ratio);
    const height = Math.round(window.innerHeight * ratio);
    renderer.setSize(width, height, false);
    const aspect = window.innerWidth / window.innerHeight;
    chaseCam.aspect = aspect;
    footCam.aspect = aspect;
    titleCam.aspect = aspect;
    chaseCam.updateProjectionMatrix();
    footCam.updateProjectionMatrix();
    titleCam.updateProjectionMatrix();
  }

  /** Place every dynamic object for the named shot, at the fixed shot time. */
  function stageShot(name, state) {
    // The map overlays (route, YOU cone, safehouse ring) are only for the pause-menu map.
    const isMap = name === 'menu';
    map.route.visible = isMap;
    map.you.visible = isMap;
    map.safe.visible = isMap;
    // The sun is a sky effect: from the top-down map it would read as a white stain, so hide
    // it there and show it everywhere else.
    glow.visible = !isMap;
    sunDisc.visible = !isMap;
    if (name === 'cover' || name === 'chase') {
      mode = MODE_CHASE;
      activeCam = chaseCam;
      // Hero car at 3/4 rear: yawed so its side reads, large in the lower frame.
      hero.position.set(0, 0, 0);
      hero.rotation.y = 0.42;
      // Traffic ahead, dense.
      trafficMeshes.forEach((mesh) => { mesh.visible = true; });
      state.traffic.forEach((car, i) => {
        const mesh = trafficMeshes[i];
        mesh.position.set(car.lane, 0, car.z);
        mesh.rotation.y = 0;
      });
      // Heli large, upper frame, spotlight on the road ahead of the car.
      placeHeli(state.heli.x, state.heli.y, state.heli.z, state.heli.rotor, true);
      // Peds on the sidewalks.
      state.peds.forEach((ped, i) => {
        pedMeshes[i].position.set(ped.x, 0, ped.z);
        pedMeshes[i].rotation.y = ped.x < 0 ? Math.PI / 2 : -Math.PI / 2;
      });
      renn.position.set(-14, 0, -46);
      renn.visible = false; // Renn is not in the chase frame
      chaseCam.position.set(5.5, 2.8, 7.5);
      chaseCam.lookAt(0, 2.0, -14);
    } else if (name === 'foot') {
      mode = MODE_FOOT;
      activeCam = footCam;
      // Renn on foot in the night market, stalls to his left, peds ahead. He walks the market
      // street itself (x -10), clear of the stall line (x -14) so the awnings never hide him.
      renn.visible = true;
      renn.position.set(-10, 0, -52);
      renn.rotation.y = Math.PI; // back to camera, walking away down the market
      state.peds.forEach((ped, i) => {
        pedMeshes[i].position.set(-13 + (i % 4) * 2.2, 0, -58 - Math.floor(i / 4) * 9);
        pedMeshes[i].rotation.y = Math.PI;
      });
      // The traffic stays off the market street for this shot: the cars would block Renn.
      trafficMeshes.forEach((mesh) => { mesh.visible = false; });
      hero.position.set(2, 0, -30);
      hero.rotation.y = 0.3;
      hero.visible = false; // the Falcon is parked behind the camera here
      placeHeli(10, 16, -70, state.heli.rotor, true);
      // The camera stands on the road looking down the market street: Renn in the middle
      // distance, the stalls receding behind him. It sits between the lamp posts (x -8.2,
      // z -42) — a camera on a lamp reads as a black bar filling the frame.
      footCam.position.set(-2, 2.4, -50);
      footCam.lookAt(-10, 1.2, -52); // Renn dead centre, the market receding behind him
    } else if (name === 'menu') {
      mode = MODE_MAP;
      activeCam = mapCam;
      hero.position.set(0, 0, 0);
      hero.rotation.y = 0;
      hero.visible = true;
      trafficMeshes.forEach((mesh) => { mesh.visible = true; });
      placeHeli(10, 16, -70, state.heli.rotor, false); // the cone would read as a white stain on the map
      renn.visible = false;
    } else { // title
      mode = MODE_TITLE;
      activeCam = titleCam;
      hero.position.set(1.5, 0, -3);
      hero.rotation.y = 0.15;
      hero.visible = true;
      trafficMeshes.forEach((mesh) => { mesh.visible = true; });
      placeHeli(10, 16, -50, state.heli.rotor, false); // the heli in the sky; its cone would read as a white sail
      renn.visible = false;
      titleCam.position.set(0, 2.0, 8);
      titleCam.lookAt(0, 1.6, -30);
    }
    // The fill light follows the active camera, so the subjects facing it are always lit.
    fill.position.copy(activeCam.position);
    fill.target.position.copy(activeCam.position).add(new THREE.Vector3(0, 0, -10).applyQuaternion(activeCam.quaternion));
    sun.target.position.set(0, 0, -40);
  }

  /** One frame: in chase mode place the dynamic objects from the live state and follow the
   *  car; in a staged shot mode just render what stageShot placed (draw must not move it). */
  function draw(state) {
    if (mode === MODE_CHASE) {
      hero.visible = true;
      hero.position.set(state.carX, 0, 0);
      hero.rotation.y = 0.42 + state.carAngle;
      trafficMeshes.forEach((mesh) => { mesh.visible = true; });
      state.traffic.forEach((car, i) => {
        trafficMeshes[i].position.set(car.lane, 0, car.z);
        trafficMeshes[i].rotation.y = 0;
      });
      placeHeli(state.heli.x, state.heli.y, state.heli.z, state.heli.rotor, true);
      state.peds.forEach((ped, i) => {
        pedMeshes[i].position.set(ped.x, 0, ped.z);
        pedMeshes[i].rotation.y = ped.x < 0 ? Math.PI / 2 : -Math.PI / 2;
      });
      renn.visible = false;
      chaseCam.position.set(state.carX + 5.5, 2.8, 7.5);
      chaseCam.lookAt(state.carX, 2.0, -14);
      activeCam = chaseCam;
      fill.position.copy(activeCam.position);
      fill.target.position.copy(activeCam.position).add(new THREE.Vector3(0, 0, -10).applyQuaternion(activeCam.quaternion));
    }
    renderer.render(scene, activeCam);
  }

  resize();
  window.addEventListener('resize', resize);
  return { draw, stageShot, resize, scene, get mode() { return mode; }, set mode(m) { mode = m; }, mapCam, map };
}
