// The pause-menu map: the real city viewed from above (a top-down orthographic camera over
// the actual street grid) plus DOM district labels projected through that camera and a gold
// dashed route from Renn to the safehouse. The map is the city itself, not flat rectangles —
// the street grid is the roads and blocks city.js built.

import * as THREE from 'three';
import { DISTRICTS } from './config.js';

// District centres in world coordinates (matching the blocks city.js lays out).
const DISTRICT_CENTRES = [
  { name: 'NORTHSIDE', owner: 'GREYLINE', color: '#8a7f8a', x: 0, z: -168 },
  { name: 'OLD TOWN', owner: 'KOVACS', color: '#f2c94c', x: -62, z: -28 },
  { name: 'MARKET ROW', owner: 'KOVACS', color: '#3aa88f', x: -16, z: -58 },
  { name: 'HARBOUR', owner: 'KOVACS', color: '#4a90d9', x: 62, z: -28 },
  { name: 'THE DOCKS', owner: 'CONTESTED', color: '#e5484d', x: 35, z: -140 },
];

export function createMap(scene) {
  // The gold route to the safehouse: a flat ribbon laid on the road, Renn's position to the
  // harbour. A line would render 1px wide; the ribbon reads from the top-down map.
  const routePoints = [
    new THREE.Vector3(0, 0.6, 0),
    new THREE.Vector3(0, 0.6, -40),
    new THREE.Vector3(20, 0.6, -60),
    new THREE.Vector3(48, 0.6, -60),
    new THREE.Vector3(62, 0.6, -40),
  ];
  const route = new THREE.Group();
  const routeMat = new THREE.MeshBasicMaterial({ color: 0xf2c94c });
  for (let i = 0; i < routePoints.length - 1; i += 1) {
    const a = routePoints[i];
    const b = routePoints[i + 1];
    const dx = b.x - a.x;
    const dz = b.z - a.z;
    const len = Math.hypot(dx, dz);
    const seg = new THREE.Mesh(new THREE.PlaneGeometry(1.6, len), routeMat);
    seg.rotation.x = -Math.PI / 2;
    seg.rotation.z = Math.atan2(dx, dz);
    seg.position.set((a.x + b.x) / 2, 0.6, (a.z + b.z) / 2);
    route.add(seg);
  }
  // Dashed feel: gold chevrons at each waypoint.
  for (const p of routePoints) {
    const dot = new THREE.Mesh(new THREE.CircleGeometry(1.1, 16), routeMat);
    dot.rotation.x = -Math.PI / 2;
    dot.position.set(p.x, 0.62, p.z);
    route.add(dot);
  }
  scene.add(route);

  // "YOU" marker: a bright orange cone at Renn's spot, pointing down the road.
  const you = new THREE.Mesh(
    new THREE.ConeGeometry(2.2, 5, 4),
    new THREE.MeshBasicMaterial({ color: 0xff6a00 }),
  );
  you.rotation.x = Math.PI / 2;
  you.rotation.y = Math.PI / 4;
  you.position.set(0, 1.2, 0);
  scene.add(you);

  // Safehouse marker: a gold ring at the harbour.
  const safe = new THREE.Mesh(
    new THREE.TorusGeometry(3, 0.5, 10, 28),
    new THREE.MeshBasicMaterial({ color: 0xf2c94c }),
  );
  safe.rotation.x = Math.PI / 2;
  safe.position.set(62, 0.8, -40);
  scene.add(safe);

  return { route, you, safe };
}

/** Position the DOM district labels over the top-down map camera. */
export function layoutMapLabels(hud, camera) {
  const labels = hud.labels;
  labels.innerHTML = '';
  // The camera is not in the scene, so its matrices are only refreshed when it renders:
  // update them here or every projection lands at the wrong place.
  camera.updateMatrixWorld();
  const v = new THREE.Vector3();
  for (const d of DISTRICT_CENTRES) {
    v.set(d.x, 0, d.z).project(camera);
    const x = (v.x * 0.5 + 0.5) * 1280;
    const y = (-v.y * 0.5 + 0.5) * 720;
    const label = document.createElement('div');
    label.style.cssText = `position:absolute; left:${x}px; top:${y}px; transform:translate(-50%,-50%); text-align:center;`;
    label.innerHTML = `<div style="font-size:15px; font-weight:800; letter-spacing:1px; text-shadow:0 1px 4px rgba(0,0,0,0.8);">${d.name}</div>
      <div style="font-size:11px; font-weight:700; color:${d.color}; text-shadow:0 1px 4px rgba(0,0,0,0.8);">${d.owner}</div>`;
    labels.appendChild(label);
  }
  // "YOU" and "SAFEHOUSE" tags beside their markers.
  const tags = [
    { text: 'RENN', x: 0, z: 8, color: '#ff6a00' },
    { text: 'SAFEHOUSE', x: 62, z: -30, color: '#f2c94c' },
  ];
  for (const t of tags) {
    v.set(t.x, 0, t.z).project(camera);
    const x = (v.x * 0.5 + 0.5) * 1280;
    const y = (-v.y * 0.5 + 0.5) * 720;
    const label = document.createElement('div');
    label.style.cssText = `position:absolute; left:${x}px; top:${y}px; transform:translate(-50%,-50%); font-size:12px; font-weight:800; color:${t.color}; text-shadow:0 1px 4px rgba(0,0,0,0.9);`;
    label.textContent = t.text;
    labels.appendChild(label);
  }
}

export { DISTRICTS };
