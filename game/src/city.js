// The city of Tarnwick as three.js geometry: a real street grid (roads every 40 units, blocks
// between them), bright buildings with lit windows on every face, lamps, signs and market
// stalls. The grid is the pause menu's map: viewed from above it reads as streets, districts
// and blocks, not flat rectangles. All textures are canvas textures made at boot — no file
// outside game/ is loaded.

import * as THREE from 'three';
import { PALETTE } from './config.js';

const BLOCK = 40; // the street grid pitch: roads every 40 units

/** A facade texture: a wall colour with a grid of warm lit windows. One texture per colour. */
function facadeTexture(color, litRatio, random) {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 128, 256);
  // Slight vertical shading so the wall is not flat.
  const shade = ctx.createLinearGradient(0, 0, 0, 256);
  shade.addColorStop(0, 'rgba(255,255,255,0.14)');
  shade.addColorStop(1, 'rgba(0,0,0,0.12)');
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, 128, 256);
  for (let row = 0; row < 8; row += 1) {
    for (let col = 0; col < 4; col += 1) {
      const lit = random() < litRatio;
      ctx.fillStyle = lit ? PALETTE.windowLit : PALETTE.windowDark;
      ctx.fillRect(10 + col * 30, 12 + row * 30, 18, 20);
      if (lit) {
        ctx.fillStyle = 'rgba(255,215,106,0.35)';
        ctx.fillRect(10 + col * 30, 12 + row * 30, 18, 4);
      }
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** A striped awning texture for the market stalls. */
function awningTexture(colorA, colorB) {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  for (let col = 0; col < 8; col += 1) {
    ctx.fillStyle = col % 2 === 0 ? colorA : colorB;
    ctx.fillRect(col * 16, 0, 16, 64);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** A sign texture with big readable text on a bright board. */
function signTexture(text, bg, fg) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 96;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 512, 96);
  ctx.fillStyle = fg;
  ctx.font = 'bold 52px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 256, 50);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function box(w, h, d, material, x, y, z) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

export function createCity(random) {
  const group = new THREE.Group();
  const mats = {
    ground: new THREE.MeshStandardMaterial({ color: PALETTE.ground, roughness: 0.95 }),
    road: new THREE.MeshStandardMaterial({ color: PALETTE.road, roughness: 0.9 }),
    sidewalk: new THREE.MeshStandardMaterial({ color: PALETTE.sidewalk, roughness: 0.95 }),
    line: new THREE.MeshBasicMaterial({ color: PALETTE.roadEdge }),
  };
  const facades = [
    facadeTexture(PALETTE.buildingTan, 0.55, random),
    facadeTexture(PALETTE.buildingPeach, 0.5, random),
    facadeTexture(PALETTE.buildingBrick, 0.45, random),
    facadeTexture(PALETTE.buildingSage, 0.5, random),
    facadeTexture(PALETTE.buildingCream, 0.6, random),
  ];
  const buildingMats = facades.map((t) => new THREE.MeshStandardMaterial({ map: t, roughness: 0.85 }));
  const awningMat = new THREE.MeshStandardMaterial({ map: awningTexture(PALETTE.awningRed, PALETTE.awningCream), roughness: 0.8 });
  const crateMat = new THREE.MeshStandardMaterial({ color: '#8a6a42', roughness: 0.95 });
  const lampMat = new THREE.MeshStandardMaterial({ color: '#2a2e33', roughness: 0.6, metalness: 0.5 });
  const lampGlow = new THREE.MeshBasicMaterial({ color: '#ffe9a8' });

  // Ground and the main chase road (along -Z) plus cross streets (along X).
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(360, 360), mats.ground);
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0, -0.05, -80);
  ground.receiveShadow = true;
  group.add(ground);

  const road = new THREE.Mesh(new THREE.PlaneGeometry(14, 300), mats.road);
  road.rotation.x = -Math.PI / 2;
  road.position.set(0, 0, -80);
  road.receiveShadow = true;
  group.add(road);
  for (const z of [-40, -80, -120, -160]) {
    const cross = new THREE.Mesh(new THREE.PlaneGeometry(200, 12), mats.road);
    cross.rotation.x = -Math.PI / 2;
    cross.position.set(0, 0.01, z);
    cross.receiveShadow = true;
    group.add(cross);
  }
  // Sidewalks flanking the chase road.
  for (const side of [-1, 1]) {
    const walk = new THREE.Mesh(new THREE.PlaneGeometry(5, 300), mats.sidewalk);
    walk.rotation.x = -Math.PI / 2;
    walk.position.set(side * 9.5, 0.02, -80);
    walk.receiveShadow = true;
    group.add(walk);
  }
  // Lane markings: a dashed centre line and solid edges down the chase road.
  for (let z = 8; z > -220; z -= 8) {
    group.add(box(0.35, 0.02, 3.2, mats.line, 0, 0.03, z));
  }
  for (const side of [-1, 1]) {
    group.add(box(0.3, 0.02, 300, mats.line, side * 6.8, 0.03, -80));
  }
  // A crosswalk where the chase begins.
  for (let x = -6; x <= 6; x += 2) {
    group.add(box(1.2, 0.02, 2.4, mats.line, x, 0.03, 4));
  }

  // Buildings fill the blocks between the roads. Each block holds 2-4 bright towers; their
  // facades carry lit windows on every face, so the depth reads from any angle.
  const blocks = [];
  for (let bx = -3; bx <= 2; bx += 1) {
    for (let bz = 0; bz >= -4; bz -= 1) {
      if (bx === -1 || bx === 0) continue; // the chase road runs here
      const cx = bx * BLOCK + (bx < 0 ? -8 : 8);
      const cz = bz * BLOCK - 20;
      const count = 2 + Math.floor(random() * 3);
      for (let i = 0; i < count; i += 1) {
        const w = 10 + random() * 8;
        const d = 10 + random() * 8;
        const h = 9 + random() * 22;
        const x = cx + (random() - 0.5) * 12;
        const z = cz + (random() - 0.5) * 12;
        const mat = buildingMats[Math.floor(random() * buildingMats.length)];
        const b = box(w, h, d, mat, x, h / 2, z);
        group.add(b);
        blocks.push({ x, z, w, d, h });
      }
    }
  }

  // Street lamps along the chase road, warm and lit.
  for (let z = 6; z > -200; z -= 24) {
    for (const side of [-1, 1]) {
      const pole = box(0.25, 6, 0.25, lampMat, side * 8.2, 3, z);
      group.add(pole);
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.45, 10, 8), lampGlow);
      head.position.set(side * 8.2, 6.2, z);
      group.add(head);
    }
  }

  // Big readable signs over the road and the market.
  const signDefs = [
    { text: 'TARNWICK', x: 0, y: 11, z: -30, w: 18 },
    { text: 'HARBOUR  ·  420 m', x: 0, y: 10, z: -90, w: 18 },
    { text: 'MARKET ROW', x: -30, y: 8, z: -58, w: 14 },
  ];
  for (const def of signDefs) {
    const mat = new THREE.MeshBasicMaterial({ map: signTexture(def.text, '#241a20', '#f2c94c') });
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(def.w, def.w * 0.19), mat);
    sign.position.set(def.x, def.y, def.z);
    group.add(sign);
    for (const side of [-1, 1]) {
      group.add(box(0.3, def.y, 0.3, lampMat, def.x + (side * def.w) / 2, def.y / 2, def.z));
    }
  }

  // The night market: striped stalls, crates and lanterns on the west sidewalk (x ≈ -14),
  // where the on-foot shot is staged.
  const stalls = [];
  for (let i = 0; i < 5; i += 1) {
    const z = -46 - i * 9;
    const stall = new THREE.Group();
    const counter = box(4.4, 1.1, 2.2, crateMat, 0, 0.55, 0);
    stall.add(counter);
    const awn = new THREE.Mesh(new THREE.BoxGeometry(5, 0.25, 3), awningMat);
    awn.position.set(0, 2.6, 0);
    awn.rotation.x = 0.25;
    awn.castShadow = true;
    stall.add(awn);
    for (const px of [-2, 2]) {
      stall.add(box(0.18, 2.6, 0.18, lampMat, px, 1.3, -1.2));
    }
    // Goods on the counter: bright fruit crates.
    const goods = new THREE.Mesh(
      new THREE.BoxGeometry(3.6, 0.5, 1.6),
      new THREE.MeshStandardMaterial({ color: i % 2 === 0 ? '#e5484d' : '#f2c94c', roughness: 0.8 }),
    );
    goods.position.set(0, 1.35, 0);
    stall.add(goods);
    const lantern = new THREE.Mesh(new THREE.SphereGeometry(0.35, 10, 8), lampGlow);
    lantern.position.set(0, 3.1, 0.6);
    stall.add(lantern);
    stall.position.set(-14, 0, z);
    group.add(stall);
    stalls.push(stall);
  }

  return { group, blocks, stalls };
}
