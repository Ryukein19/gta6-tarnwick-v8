// The city in real three.js: a golden-hour sky dome, a halo sun low on the horizon,
// a dark road running into the distance, and 3D buildings on both sides — boxes with
// real depth, so the camera sees front faces AND side faces, never flat rectangles.
// Everything is placed from the seeded generator; the shot path never moves anything.
import * as THREE from 'three';
import { PALETTE } from './config.js';

/** A vertical gradient painted on a canvas, used as the sky texture. */
function skyTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 4;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, PALETTE.skyTop);
  grad.addColorStop(0.45, PALETTE.skyMid);
  grad.addColorStop(0.72, '#c65a3a');
  grad.addColorStop(0.88, PALETTE.skyHorizon);
  grad.addColorStop(1, '#ffb347');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 4, 512);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** A radial glow painted on a canvas, used for the sun halo sprite. */
function haloTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, 'rgba(255, 225, 140, 0.95)');
  grad.addColorStop(0.25, 'rgba(255, 179, 71, 0.55)');
  grad.addColorStop(0.6, 'rgba(255, 140, 60, 0.18)');
  grad.addColorStop(1, 'rgba(255, 140, 60, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Lit windows on the road-facing side and the street-facing (+Z) side of a building:
 * small warm planes, some dark. `side` is +1 for a right-hand building (road is -X)
 * and -1 for a left-hand building (road is +X). */
function addWindows(group, random, w, h, d, side) {
  const lit = new THREE.MeshBasicMaterial({ color: PALETTE.windowLit });
  const dark = new THREE.MeshBasicMaterial({ color: PALETTE.windowDark });
  const geo = new THREE.PlaneGeometry(1.1, 1.4);
  // Road-facing side: the face toward x = 0.
  const roadCols = Math.max(2, Math.floor(d / 2.2));
  const roadRows = Math.max(3, Math.floor(h / 2.6));
  for (let c = 0; c < roadCols; c += 1) {
    for (let r = 0; r < roadRows; r += 1) {
      if (random() < 0.22) continue;
      const win = new THREE.Mesh(geo, random() < 0.75 ? lit : dark);
      const u = (c + 0.5) / roadCols - 0.5;
      const v = (r + 0.5) / roadRows - 0.5;
      win.position.set(-side * (w / 2 + 0.03), v * (h - 1.6) + h / 2, u * (d - 1.4));
      win.rotation.y = -side * Math.PI / 2;
      group.add(win);
    }
  }
  // Street-facing side (+Z, toward the camera at the start of the street).
  const frontCols = Math.max(2, Math.floor(w / 2.2));
  const frontRows = Math.max(3, Math.floor(h / 2.6));
  for (let c = 0; c < frontCols; c += 1) {
    for (let r = 0; r < frontRows; r += 1) {
      if (random() < 0.22) continue;
      const win = new THREE.Mesh(geo, random() < 0.75 ? lit : dark);
      const u = (c + 0.5) / frontCols - 0.5;
      const v = (r + 0.5) / frontRows - 0.5;
      win.position.set(u * (w - 1.4), v * (h - 1.6) + h / 2, d / 2 + 0.03);
      group.add(win);
    }
  }
}

export function buildCity(scene, random) {
  // Warm dusk fog: the far end of the street melts into the horizon glow.
  scene.fog = new THREE.Fog(new THREE.Color('#4a2c33'), 70, 220);

  // Sky dome: a huge sphere, gradient texture, seen from inside.
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(320, 24, 16),
    new THREE.MeshBasicMaterial({ map: skyTexture(), side: THREE.BackSide, fog: false }),
  );
  scene.add(sky);

  // The sun: a bright disc low on the horizon, dead ahead down the road.
  const sun = new THREE.Mesh(
    new THREE.CircleGeometry(5.5, 40),
    new THREE.MeshBasicMaterial({ color: PALETTE.sunCore, fog: false }),
  );
  sun.position.set(-10, 11, -210);
  scene.add(sun);

  // The halo: a big soft additive glow around the sun — never a flat disc alone.
  const halo = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: haloTexture(),
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: false,
      transparent: true,
    }),
  );
  halo.scale.set(55, 55, 1);
  halo.position.set(-10, 11, -205);
  scene.add(halo);

  // Lights: warm low sun from ahead-left, cool ambient fill from the sky.
  const sunLight = new THREE.DirectionalLight(new THREE.Color('#ffb347'), 2.4);
  sunLight.position.set(-30, 26, -90);
  scene.add(sunLight);
  // A warm fill from behind the camera: it lights the backs of the hero car, Renn
  // and the street-facing building sides, which the low sun never reaches.
  const fillLight = new THREE.DirectionalLight(new THREE.Color('#ff9a5c'), 1.2);
  fillLight.position.set(12, 14, 40);
  scene.add(fillLight);
  scene.add(new THREE.HemisphereLight(new THREE.Color('#7a4a6e'), new THREE.Color('#241a20'), 1.1));
  const fill = new THREE.AmbientLight(new THREE.Color('#5a3a55'), 0.85);
  scene.add(fill);

  // The road: a long dark plane running down -Z, with a pale centre line and edge lines.
  const road = new THREE.Mesh(
    new THREE.PlaneGeometry(13, 260),
    new THREE.MeshLambertMaterial({ color: PALETTE.road }),
  );
  road.rotation.x = -Math.PI / 2;
  road.position.set(0, 0, -110);
  scene.add(road);

  const lineMat = new THREE.MeshBasicMaterial({ color: PALETTE.roadLine });
  for (let z = 10; z > -240; z -= 9) {
    const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 3.4), lineMat);
    dash.rotation.x = -Math.PI / 2;
    dash.position.set(0, 0.02, z);
    scene.add(dash);
  }
  for (const x of [-6.2, 6.2]) {
    const edge = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 260), lineMat);
    edge.rotation.x = -Math.PI / 2;
    edge.position.set(x, 0.02, -110);
    scene.add(edge);
  }

  // Sidewalks: raised strips along both sides of the road.
  const walkMat = new THREE.MeshLambertMaterial({ color: PALETTE.sidewalk });
  for (const x of [-8.4, 8.4]) {
    const walk = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.24, 260), walkMat);
    walk.position.set(x, 0.12, -110);
    scene.add(walk);
  }

  // Buildings: real boxes with depth, varied heights, warm-lit faces on the sun side
  // and deep shade on the other — the camera sees front AND side faces.
  const warm = new THREE.MeshLambertMaterial({ color: PALETTE.buildingWarm });
  const shade = new THREE.MeshLambertMaterial({ color: PALETTE.buildingShade });
  const dark = new THREE.MeshLambertMaterial({ color: PALETTE.buildingDark });
  const mats = [warm, shade, dark];
  let z = 14;
  while (z > -230) {
    for (const side of [-1, 1]) {
      if (random() < 0.12) continue;
      const w = 6 + random() * 7;
      const h = 9 + random() * 20;
      const d = 7 + random() * 9;
      const x = side * (11.5 + w / 2 + random() * 2);
      const box = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mats[Math.floor(random() * mats.length)]);
      box.position.set(x, h / 2, z - d / 2);
      scene.add(box);
      // Windows on the road-facing side and on the street-facing side.
      const group = new THREE.Group();
      group.position.copy(box.position);
      group.position.y = 0;
      addWindows(group, random, w, h, d, side);
      scene.add(group);
    }
    z -= 12 + random() * 8;
  }

  // Streetlights: thin poles with a warm lamp head, down both sides.
  const poleMat = new THREE.MeshLambertMaterial({ color: '#1a1a22' });
  const lampMat = new THREE.MeshBasicMaterial({ color: PALETTE.headLight });
  for (let i = 0; i < 10; i += 1) {
    const side = i % 2 === 0 ? -1 : 1;
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 6.4, 8), poleMat);
    pole.position.set(side * 7.4, 3.2, 8 - i * 24);
    scene.add(pole);
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 8), lampMat);
    lamp.position.set(side * 7.1, 6.5, 8 - i * 24);
    scene.add(lamp);
  }

  return { sun, halo };
}
