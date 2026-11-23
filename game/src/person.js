// People as three.js geometry: Renn on foot and the pedestrians. Blocky figures with volume
// and bright shirts, so they read as people at thumbnail size — never flat paper cutouts and
// never black silhouettes. Renn wears a dark blue jacket over a light shirt; the fill light
// keeps his back readable from behind.

import * as THREE from 'three';

function box(w, h, d, material, x, y, z) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  return mesh;
}

function makeMaterials(shirtColor) {
  return {
    shirt: new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.8 }),
    skin: new THREE.MeshStandardMaterial({ color: '#e8b88a', roughness: 0.7 }),
    hair: new THREE.MeshStandardMaterial({ color: '#2a1f16', roughness: 0.9 }),
    pants: new THREE.MeshStandardMaterial({ color: '#2a2e33', roughness: 0.85 }),
    jacket: new THREE.MeshStandardMaterial({ color: '#2a4a7a', roughness: 0.75 }),
  };
}

/** A blocky person, ~1.8 units tall, facing -Z (away from the camera by default). */
export function buildPerson(shirtColor, withJacket) {
  const person = new THREE.Group();
  const m = makeMaterials(shirtColor);
  // Legs.
  person.add(box(0.22, 0.8, 0.24, m.pants, -0.14, 0.4, 0));
  person.add(box(0.22, 0.8, 0.24, m.pants, 0.14, 0.4, 0));
  // Torso: jacket over shirt when asked, else the shirt itself.
  person.add(box(0.62, 0.7, 0.34, withJacket ? m.jacket : m.shirt, 0, 1.15, 0));
  if (withJacket) person.add(box(0.4, 0.6, 0.06, m.shirt, 0, 1.15, -0.19));
  // Arms.
  person.add(box(0.16, 0.62, 0.18, withJacket ? m.jacket : m.shirt, -0.4, 1.12, 0));
  person.add(box(0.16, 0.62, 0.18, withJacket ? m.jacket : m.shirt, 0.4, 1.12, 0));
  // Head + hair.
  person.add(box(0.34, 0.34, 0.32, m.skin, 0, 1.68, 0));
  person.add(box(0.36, 0.14, 0.34, m.hair, 0, 1.88, 0));
  return person;
}

/** Renn Kovacs, on foot: dark blue jacket, light shirt, dark hair. */
export function buildRenn() {
  return buildPerson('#f5efe4', true);
}
