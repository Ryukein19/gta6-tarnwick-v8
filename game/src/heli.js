// The police helicopter. It is the cover's second subject, so it is built to be VISIBLE:
// a LIGHT GREY/WHITE body against the bright sky, a dark rotor disc that reads as motion, and
// a BRIGHT WHITE spotlight cone — the brightest thing in the frame — hitting a white pool on
// the road below. In v9 the heli was a black silhouette; here the body is near-white and the
// scene's fill light keeps it that way.

import * as THREE from 'three';
import { PALETTE } from './config.js';

function box(w, h, d, material, x, y, z) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  return mesh;
}

export function buildHeli() {
  const heli = new THREE.Group();
  const body = new THREE.MeshStandardMaterial({ color: PALETTE.heliWhite, roughness: 0.45, metalness: 0.25 });
  const grey = new THREE.MeshStandardMaterial({ color: PALETTE.heliGrey, roughness: 0.5, metalness: 0.3 });
  const dark = new THREE.MeshStandardMaterial({ color: '#3a3f44', roughness: 0.5, metalness: 0.4 });
  const glass = new THREE.MeshStandardMaterial({ color: '#bfe3f2', roughness: 0.15, metalness: 0.6 });
  const stripe = new THREE.MeshStandardMaterial({ color: '#2a6bff', roughness: 0.4, metalness: 0.3 });
  const lampGlow = new THREE.MeshBasicMaterial({ color: '#fff6cf' });

  // Main body: a rounded cabin (box + nose), a blue cheatline, glass nose.
  heli.add(box(2.2, 1.7, 3.4, body, 0, 0, 0));
  heli.add(box(2.24, 0.5, 3.42, stripe, 0, -0.35, 0));
  heli.add(box(1.7, 1.1, 1.0, glass, 0, 0.1, -1.9)); // cockpit glass
  // Tail boom + tail fin + tail rotor.
  heli.add(box(0.55, 0.55, 4.2, grey, 0, 0.25, 3.6));
  heli.add(box(0.18, 1.5, 1.1, body, 0, 0.8, 5.5));
  const tailRotor = new THREE.Group();
  const tailBladeGeo = new THREE.BoxGeometry(0.08, 1.5, 0.12);
  const tb1 = new THREE.Mesh(tailBladeGeo, dark);
  const tb2 = new THREE.Mesh(tailBladeGeo, dark);
  tb2.rotation.z = Math.PI / 2;
  tailRotor.add(tb1);
  tailRotor.add(tb2);
  tailRotor.position.set(0.35, 0.7, 5.5);
  heli.add(tailRotor);
  // Skids.
  heli.add(box(0.14, 0.14, 3.0, dark, -0.9, -1.05, 0));
  heli.add(box(0.14, 0.14, 3.0, dark, 0.9, -1.05, 0));
  heli.add(box(0.14, 0.5, 0.14, dark, -0.9, -0.8, -1.0));
  heli.add(box(0.14, 0.5, 0.14, dark, 0.9, -0.8, -1.0));
  heli.add(box(0.14, 0.5, 0.14, dark, -0.9, -0.8, 1.0));
  heli.add(box(0.14, 0.5, 0.14, dark, 0.9, -0.8, 1.0));
  // Searchlight housing under the nose.
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 10), lampGlow);
  lamp.position.set(0, -0.95, -1.4);
  heli.add(lamp);

  // Main rotor: four long blades + a translucent disc so the spin reads at any angle.
  const rotor = new THREE.Group();
  const bladeGeo = new THREE.BoxGeometry(0.32, 0.06, 4.6);
  for (let i = 0; i < 4; i += 1) {
    const blade = new THREE.Mesh(bladeGeo, dark);
    blade.rotation.y = (i * Math.PI) / 4;
    rotor.add(blade);
  }
  const disc = new THREE.Mesh(
    new THREE.CircleGeometry(4.6, 32),
    new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.10, side: THREE.DoubleSide }),
  );
  disc.rotation.x = -Math.PI / 2;
  rotor.add(disc);
  rotor.position.set(0, 1.15, 0);
  heli.add(rotor);

  // The spotlight cone: BRIGHT WHITE, additive, from the belly to the road. It must be the
  // brightest thing in the frame, so it is a basic (unlit) material at high opacity.
  // ConeGeometry puts its apex at +Y: apex up at the lamp, base down on the road. The heli
  // flies at y=14, so the cone spans local y -1 (lamp) to -14 (road).
  const coneGeo = new THREE.ConeGeometry(3.4, 13, 24, 1, true);
  const coneMat = new THREE.MeshBasicMaterial({
    color: '#ffffff',
    transparent: true,
    opacity: 0.42,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const cone = new THREE.Mesh(coneGeo, coneMat);
  cone.position.set(0, -7.5, -1.4);
  heli.add(cone);
  // The pool where the cone hits the road (local y -13.9 = world y 0.1, just above the road).
  const pool = new THREE.Mesh(
    new THREE.CircleGeometry(3.4, 28),
    new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false }),
  );
  pool.rotation.x = -Math.PI / 2;
  pool.position.set(0, -13.9, -1.4);
  heli.add(pool);

  return { group: heli, rotor, tailRotor, cone, pool };
}
