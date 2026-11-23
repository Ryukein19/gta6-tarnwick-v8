// The cars in real three.js. The FALCON GT — Tam's car — is a low, wide coupe built
// from boxes, cylinders and emissive strips: a full-width tail-light bar, a rear spoiler,
// gold side stripes and real wheels with hubs. Traffic cars are simpler boxes with the
// same bones, so the street reads as one fleet. Every car faces -Z, down the road.
import * as THREE from 'three';
import { PALETTE } from './config.js';

function wheel(radius, width) {
  const group = new THREE.Group();
  const tyre = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, width, 18),
    new THREE.MeshLambertMaterial({ color: '#0c0c0e' }),
  );
  tyre.rotation.z = Math.PI / 2;
  group.add(tyre);
  const hub = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 0.55, radius * 0.55, width + 0.04, 12),
    new THREE.MeshLambertMaterial({ color: '#c8c8d0' }),
  );
  hub.rotation.z = Math.PI / 2;
  group.add(hub);
  return group;
}

/** The hero car: the FALCON GT, Tam's car. Built once, posed by the caller. */
export function buildHeroCar() {
  const car = new THREE.Group();
  const bodyMat = new THREE.MeshLambertMaterial({ color: PALETTE.carBody });
  const glassMat = new THREE.MeshLambertMaterial({ color: '#0e1620' });
  const accentMat = new THREE.MeshBasicMaterial({ color: PALETTE.carAccent });

  // Main body: low and wide.
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.55, 4.6), bodyMat);
  body.position.y = 0.62;
  car.add(body);
  // Nose: a lower wedge at the front (-Z).
  const nose = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.34, 0.9), bodyMat);
  nose.position.set(0, 0.5, -2.5);
  car.add(nose);
  // Cabin: set back, dark glass, slightly narrower.
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.5, 2.1), glassMat);
  cabin.position.set(0, 1.12, 0.35);
  car.add(cabin);
  // Roof panel over the cabin.
  const roof = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 1.9), bodyMat);
  roof.position.set(0, 1.4, 0.35);
  car.add(roof);
  // Rear spoiler on two struts.
  const spoiler = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.07, 0.42), bodyMat);
  spoiler.position.set(0, 1.28, 2.15);
  car.add(spoiler);
  for (const x of [-0.7, 0.7]) {
    const strut = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.3, 0.08), bodyMat);
    strut.position.set(x, 1.1, 2.15);
    car.add(strut);
  }
  // Gold side stripes: the car's signature.
  for (const x of [-1.01, 1.01]) {
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.1, 4.2), accentMat);
    stripe.position.set(x, 0.62, 0);
    car.add(stripe);
  }
  // Full-width tail-light bar at the rear (+Z is the rear: the camera sees it).
  const tail = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 0.14, 0.06),
    new THREE.MeshBasicMaterial({ color: PALETTE.tailLight }),
  );
  tail.position.set(0, 0.78, 2.32);
  car.add(tail);
  // Headlights at the front.
  for (const x of [-0.62, 0.62]) {
    const lamp = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.1, 0.06),
      new THREE.MeshBasicMaterial({ color: PALETTE.headLight }),
    );
    lamp.position.set(x, 0.62, -2.96);
    car.add(lamp);
  }
  // Wheels: four, with hubs, tucked under the body.
  const wheelPos = [
    [-0.95, -1.55], [0.95, -1.55], [-0.95, 1.55], [0.95, 1.55],
  ];
  for (const [x, z] of wheelPos) {
    const w = wheel(0.36, 0.28);
    w.position.set(x, 0.36, z);
    car.add(w);
  }
  // A soft dark shadow ellipse under the car, so it sits on the road.
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(1.9, 24),
    new THREE.MeshBasicMaterial({ color: '#000000', transparent: true, opacity: 0.45 }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.scale.set(1, 2.4, 1);
  shadow.position.y = 0.02;
  car.add(shadow);
  return car;
}

/** A traffic car: same bones as the hero, plain paint, no spoiler, no stripes. */
export function buildTrafficCar(color) {
  const car = new THREE.Group();
  const bodyMat = new THREE.MeshLambertMaterial({ color });
  const glassMat = new THREE.MeshLambertMaterial({ color: '#101820' });
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.6, 4.1), bodyMat);
  body.position.y = 0.6;
  car.add(body);
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.52, 1.9), glassMat);
  cabin.position.set(0, 1.12, 0.2);
  car.add(cabin);
  const tail = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 0.12, 0.06),
    new THREE.MeshBasicMaterial({ color: PALETTE.tailLight }),
  );
  tail.position.set(0, 0.72, 2.07);
  car.add(tail);
  for (const x of [-0.55, 0.55]) {
    const lamp = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 0.1, 0.06),
      new THREE.MeshBasicMaterial({ color: PALETTE.headLight }),
    );
    lamp.position.set(x, 0.6, -2.07);
    car.add(lamp);
  }
  for (const [x, z] of [[-0.88, -1.4], [0.88, -1.4], [-0.88, 1.4], [0.88, 1.4]]) {
    const w = wheel(0.33, 0.24);
    w.position.set(x, 0.33, z);
    car.add(w);
  }
  return car;
}
