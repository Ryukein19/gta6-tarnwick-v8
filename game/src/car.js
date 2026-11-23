// Vehicles as three.js geometry. The hero car is the whole point of the cover, so it is built
// to read at 300px: BRIGHT ORANGE body, gold stripe, a red tail-light bar, a spoiler, light
// rims and a readable plate. The paint is a bright standard material — with the scene's fill
// light it stays orange from every angle, never a black silhouette.

import * as THREE from 'three';
import { PALETTE, GAME } from './config.js';

function plateTexture(text) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#f5efe4';
  ctx.fillRect(0, 0, 256, 64);
  ctx.fillStyle = '#1a1a22';
  ctx.font = 'bold 44px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 128, 34);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function box(w, h, d, material, x, y, z) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  return mesh;
}

/** The Falcon GT — Tam's car, Renn's car. Bright orange, 3/4 rear staging. */
export function buildFalconGT() {
  const car = new THREE.Group();
  const paint = new THREE.MeshStandardMaterial({ color: PALETTE.carOrange, roughness: 0.32, metalness: 0.45 });
  const dark = new THREE.MeshStandardMaterial({ color: '#22242a', roughness: 0.6, metalness: 0.3 });
  const glass = new THREE.MeshStandardMaterial({ color: '#9fd4e8', roughness: 0.15, metalness: 0.6 });
  const gold = new THREE.MeshStandardMaterial({ color: PALETTE.carGold, roughness: 0.35, metalness: 0.6 });
  const tailGlow = new THREE.MeshBasicMaterial({ color: '#ff2a1a' });
  const headGlow = new THREE.MeshBasicMaterial({ color: '#fff6cf' });
  const rim = new THREE.MeshStandardMaterial({ color: '#d8dde2', roughness: 0.3, metalness: 0.8 });

  // Lower body, cabin, hood and trunk — a low wide GT silhouette.
  car.add(box(2.0, 0.55, 4.6, paint, 0, 0.55, 0));
  car.add(box(1.8, 0.5, 2.2, glass, 0, 1.05, 0.35)); // cabin glass
  car.add(box(1.84, 0.12, 2.3, paint, 0, 1.32, 0.35)); // roof
  car.add(box(1.9, 0.18, 1.0, paint, 0, 0.72, -1.9)); // hood slope
  // Gold stripe down the centre.
  car.add(box(0.34, 0.04, 4.62, gold, 0, 0.84, 0));
  car.add(box(0.34, 0.04, 2.32, gold, 0, 1.39, 0.35));
  // Spoiler and tail-light bar (the cover's most readable details).
  car.add(box(1.9, 0.08, 0.5, dark, 0, 1.02, 2.28));
  car.add(box(0.12, 0.28, 0.12, dark, -0.85, 0.85, 2.28));
  car.add(box(0.12, 0.28, 0.12, dark, 0.85, 0.85, 2.28));
  car.add(box(1.86, 0.14, 0.08, tailGlow, 0, 0.62, 2.32));
  // Headlights.
  car.add(box(0.42, 0.12, 0.06, headGlow, -0.62, 0.6, -2.32));
  car.add(box(0.42, 0.12, 0.06, headGlow, 0.62, 0.6, -2.32));
  // Plate.
  const plate = new THREE.Mesh(
    new THREE.PlaneGeometry(0.9, 0.22),
    new THREE.MeshBasicMaterial({ map: plateTexture(GAME.plate) }),
  );
  plate.position.set(0, 0.42, 2.37);
  car.add(plate);
  // Wheels: dark tyres, light rims — the rims are what make the car read as a car.
  const tyreGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.28, 18);
  const rimGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.3, 12);
  for (const [x, z] of [[-0.95, -1.45], [0.95, -1.45], [-0.95, 1.45], [0.95, 1.45]]) {
    const tyre = new THREE.Mesh(tyreGeo, dark);
    tyre.rotation.z = Math.PI / 2;
    tyre.position.set(x, 0.36, z);
    tyre.castShadow = true;
    car.add(tyre);
    const hub = new THREE.Mesh(rimGeo, rim);
    hub.rotation.z = Math.PI / 2;
    hub.position.set(x, 0.36, z);
    car.add(hub);
  }
  return car;
}

/** A traffic car in a bright colour. */
export function buildTrafficCar(colorKey) {
  const car = new THREE.Group();
  const paint = new THREE.MeshStandardMaterial({ color: PALETTE[colorKey] ?? '#e5484d', roughness: 0.4, metalness: 0.35 });
  const dark = new THREE.MeshStandardMaterial({ color: '#22242a', roughness: 0.6 });
  const glass = new THREE.MeshStandardMaterial({ color: '#9fd4e8', roughness: 0.2, metalness: 0.5 });
  const headGlow = new THREE.MeshBasicMaterial({ color: '#fff6cf' });
  car.add(box(1.9, 0.55, 4.2, paint, 0, 0.55, 0));
  car.add(box(1.7, 0.5, 2.0, glass, 0, 1.0, 0.3));
  car.add(box(1.74, 0.12, 2.1, paint, 0, 1.26, 0.3));
  car.add(box(0.4, 0.12, 0.06, headGlow, -0.6, 0.6, -2.12));
  car.add(box(0.4, 0.12, 0.06, headGlow, 0.6, 0.6, -2.12));
  const tyreGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.26, 14);
  for (const [x, z] of [[-0.9, -1.35], [0.9, -1.35], [-0.9, 1.35], [0.9, 1.35]]) {
    const tyre = new THREE.Mesh(tyreGeo, dark);
    tyre.rotation.z = Math.PI / 2;
    tyre.position.set(x, 0.34, z);
    car.add(tyre);
  }
  return car;
}

/** A police cruiser: white body, black doors, red/blue light bar. */
export function buildPoliceCar() {
  const car = buildTrafficCar('policeWhite');
  const black = new THREE.MeshStandardMaterial({ color: PALETTE.policeBlack, roughness: 0.5 });
  car.add(box(0.06, 0.5, 2.2, black, -0.96, 0.7, 0));
  car.add(box(0.06, 0.5, 2.2, black, 0.96, 0.7, 0));
  const red = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.14, 0.3), new THREE.MeshBasicMaterial({ color: '#ff2a1a' }));
  red.position.set(-0.4, 1.38, 0.3);
  car.add(red);
  const blue = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.14, 0.3), new THREE.MeshBasicMaterial({ color: '#2a6bff' }));
  blue.position.set(0.4, 1.38, 0.3);
  car.add(blue);
  return car;
}
