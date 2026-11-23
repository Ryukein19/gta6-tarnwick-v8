// The police helicopter: a big dark airframe with a main rotor, a tail boom and a
// searchlight — and the shot's signature, a BRIGHT WHITE spotlight cone cutting down
// onto the dark road. The cone is a translucent additive mesh plus a real SpotLight,
// so the pool of light on the asphalt reads even at thumbnail size.
import * as THREE from 'three';
import { PALETTE } from './config.js';

/** The helicopter airframe. The rotor is fixed: shots never spin it. */
export function buildHelicopter() {
  const heli = new THREE.Group();
  const bodyMat = new THREE.MeshLambertMaterial({ color: PALETTE.heliBody });
  const darkMat = new THREE.MeshLambertMaterial({ color: '#0c1118' });

  // Main body: a long rounded box.
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.8, 5.2), bodyMat);
  heli.add(body);
  // Glass nose: a dark canopy at the front (-Z).
  const nose = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.2, 1.4), darkMat);
  nose.position.set(0, 0.2, -2.8);
  heli.add(nose);
  // Tail boom: a long thin box stretching back (+Z).
  const boom = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.7, 6.4), bodyMat);
  boom.position.set(0, 0.35, 5.4);
  heli.add(boom);
  // Tail fin.
  const fin = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.6, 1.2), bodyMat);
  fin.position.set(0, 1.0, 8.4);
  heli.add(fin);
  // Tail rotor: a small cross at the end of the boom.
  const tailRotor = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.8, 0.16), darkMat);
  tailRotor.position.set(0.45, 0.5, 8.2);
  heli.add(tailRotor);
  // Main rotor mast + blades: one long blade pair, fixed at a slight angle.
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.9, 8), darkMat);
  mast.position.y = 1.3;
  heli.add(mast);
  const blades = new THREE.Mesh(new THREE.BoxGeometry(11.5, 0.09, 0.55), darkMat);
  blades.position.y = 1.8;
  blades.rotation.y = 0.35;
  heli.add(blades);
  // Skids: two rails under the body.
  for (const x of [-1.0, 1.0]) {
    const skid = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 4.6), darkMat);
    skid.position.set(x, -1.25, 0);
    heli.add(skid);
  }
  for (const [x, z] of [[-1.0, -1.6], [1.0, -1.6], [-1.0, 1.6], [1.0, 1.6]]) {
    const strut = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.5, 0.09), darkMat);
    strut.position.set(x, -1.0, z);
    heli.add(strut);
  }
  // Searchlight housing under the nose.
  const lamp = new THREE.Mesh(
    new THREE.CylinderGeometry(0.34, 0.42, 0.5, 12),
    new THREE.MeshBasicMaterial({ color: PALETTE.headLight }),
  );
  lamp.position.set(0, -1.05, -2.4);
  heli.add(lamp);
  return heli;
}

/**
 * The spotlight cone: apex at the helicopter, base a wide pool on the road.
 * `top` is the helicopter position, `groundY` the road height, `target` where the
 * pool lands. Returns the cone, the pool and a real SpotLight for the road.
 */
export function buildSpotlight(top, target, groundY) {
  const group = new THREE.Group();
  const height = top.y - groundY;
  const coneMat = new THREE.MeshBasicMaterial({
    color: PALETTE.cone,
    transparent: true,
    opacity: 0.3,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    depthWrite: false,
    fog: false,
  });
  // ConeGeometry: apex up, base down. Radius grows toward the road.
  const cone = new THREE.Mesh(new THREE.ConeGeometry(5.5, height, 24, 1, true), coneMat);
  cone.position.set(top.x, top.y - height / 2, top.z);
  // Tilt the cone toward the target: the pool lands ahead of the helicopter.
  const dx = target.x - top.x;
  const dz = target.z - top.z;
  cone.rotation.x = Math.atan2(dz, height);
  cone.rotation.z = -Math.atan2(dx, height);
  group.add(cone);

  // The pool: a bright disc where the cone meets the road.
  const pool = new THREE.Mesh(
    new THREE.CircleGeometry(5.0, 28),
    new THREE.MeshBasicMaterial({
      color: '#fff8e0',
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  pool.rotation.x = -Math.PI / 2;
  pool.position.set(target.x, groundY + 0.05, target.z);
  group.add(pool);

  // A real spotlight so the road and the hero car catch the beam.
  const light = new THREE.SpotLight(new THREE.Color('#fff3c4'), 900, 60, 0.42, 0.45, 1.2);
  light.position.set(top.x, top.y, top.z);
  light.target.position.set(target.x, groundY, target.z);
  group.add(light);
  group.add(light.target);
  return group;
}
