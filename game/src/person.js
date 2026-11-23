// Renn Kovacs on foot: a stylised figure built from boxes — dark jacket, jeans, boots,
// short dark hair — standing in the street, seen from behind at a three-quarter angle.
// No face is modelled: the shot is about the street, the stance and the light.
import * as THREE from 'three';

const JACKET = '#3a2f28';
const JEANS = '#2c3440';
const BOOT = '#14100c';
const SKIN = '#c9a184';
const HAIR = '#1a1210';
const SHIRT = '#8a2f2f';

export function buildRenn() {
  const person = new THREE.Group();
  const jacket = new THREE.MeshLambertMaterial({ color: JACKET });
  const jeans = new THREE.MeshLambertMaterial({ color: JEANS });
  const boot = new THREE.MeshLambertMaterial({ color: BOOT });
  const skin = new THREE.MeshLambertMaterial({ color: SKIN });
  const hair = new THREE.MeshLambertMaterial({ color: HAIR });
  const shirt = new THREE.MeshLambertMaterial({ color: SHIRT });

  // Boots + legs.
  for (const x of [-0.14, 0.14]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.78, 0.22), jeans);
    leg.position.set(x, 0.49, 0);
    person.add(leg);
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.12, 0.34), boot);
    foot.position.set(x, 0.06, -0.05);
    person.add(foot);
  }
  // Torso: the jacket, with a shirt V at the front (-Z faces away from camera).
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.72, 0.34), jacket);
  torso.position.y = 1.24;
  person.add(torso);
  const chest = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.5, 0.04), shirt);
  chest.position.set(0, 1.28, -0.18);
  person.add(chest);
  // Arms: hanging at the sides, one hand slightly forward.
  for (const x of [-0.4, 0.4]) {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.66, 0.2), jacket);
    arm.position.set(x, 1.22, 0);
    person.add(arm);
    const hand = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.16), skin);
    hand.position.set(x, 0.84, -0.02);
    person.add(hand);
  }
  // Head + hair.
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.34, 0.3), skin);
  head.position.y = 1.78;
  person.add(head);
  const hairTop = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.12, 0.32), hair);
  hairTop.position.y = 1.98;
  person.add(hairTop);
  const hairBack = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.22, 0.08), hair);
  hairBack.position.set(0, 1.86, 0.15);
  person.add(hairBack);
  // A soft shadow under the figure.
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.55, 20),
    new THREE.MeshBasicMaterial({ color: '#000000', transparent: true, opacity: 0.4 }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.02;
  person.add(shadow);
  return person;
}
