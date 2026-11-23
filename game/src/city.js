// The city of Tarnwick: six districts along one boulevard, generated once per seed.
// Buildings line both sides of the Strand, palms and lamps dot the sidewalks, and a
// far skyline sits on the horizon. Everything is data — the renderer draws it. No
// drawing and no browser in this file.
import { DISTRICTS, PALETTE } from './config.js';
import { pick, range } from './random.js';

const BUILDING_COLOURS = [
  PALETTE.buildingCream,
  PALETTE.buildingPeach,
  PALETTE.buildingTeal,
  PALETTE.buildingRose,
];

/**
 * Build the city for a seed. Returns:
 * near: buildings close to the road, each { side (-1 left, 1 right), depth, widthM, heightM, colour, lit }
 * far: skyline blocks on the horizon, each { x, width, height, colour }
 * palms: { side, depth, heightM } and lamps: { side, depth } along the sidewalks.
 */
export function createCity(random) {
  const near = [];
  const far = [];
  const palms = [];
  const lamps = [];

  // Near buildings: two rows, one per side, receding from depth 0.08 to 0.95.
  for (const side of [-1, 1]) {
    let depth = 0.06;
    while (depth < 0.95) {
      const widthM = range(random, 2.2, 4.6);
      const heightM = range(random, 1.6, 4.4);
      near.push({
        side,
        depth,
        widthM,
        heightM,
        colour: pick(random, BUILDING_COLOURS),
        lit: random() < 0.55,
        district: DISTRICTS[Math.floor(random() * DISTRICTS.length)].name,
      });
      depth += range(random, 0.09, 0.16);
    }
  }

  // Far skyline: a row of blocks strung across the horizon.
  let x = -40;
  while (x < 1320) {
    const width = range(random, 46, 130);
    const height = range(random, 26, 92);
    far.push({ x, width, height, colour: pick(random, [PALETTE.skylineFar, PALETTE.skylineNear]) });
    x += width + range(random, 2, 18);
  }

  // Palms and lamps along both sidewalks.
  for (const side of [-1, 1]) {
    let depth = 0.1;
    while (depth < 0.9) {
      if (random() < 0.6) palms.push({ side, depth, heightM: range(random, 2.2, 3.4) });
      if (random() < 0.7) lamps.push({ side, depth, lit: true });
      depth += range(random, 0.11, 0.2);
    }
  }

  return { near, far, palms, lamps };
}
