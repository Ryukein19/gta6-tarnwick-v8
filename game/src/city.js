// The city of Tarnwick: six districts, sun-soaked pastel buildings lining both
// sides of the Strand, palms and lamps. Buildings are generated from the seeded
// random so the same seed always draws the same skyline.

import { DISTRICTS, PALETTE } from './config.js';
import { pick, range } from './random.js';
import { groundY, scaleAt, sidewalkAt } from './geom.js';

/** One building: which side of the road, how far down it, how tall and wide. */
function makeBuilding(random, side, index) {
  const t = 0.08 + index * 0.055 + random() * 0.03;
  const s = scaleAt(t);
  const base = pick(random, PALETTE.building);
  const dark = pick(random, PALETTE.buildingDark);
  return {
    side,
    t,
    x: 0, // filled in by layout()
    y: groundY(t),
    w: (90 + random() * 70) * s + 26,
    h: (150 + random() * 190) * s + 30,
    color: base,
    dark,
    floors: 3 + Math.floor(random() * 5),
    lit: random() < 0.55,
  };
}

/** Lay buildings out along both sidewalks, farthest first so near ones overlap. */
export function buildCity(random) {
  const buildings = [];
  for (let side = -1; side <= 1; side += 2) {
    for (let index = 0; index < 14; index += 1) {
      buildings.push(makeBuilding(random, side, index));
    }
  }
  for (const b of buildings) {
    const strip = sidewalkAt(b.t, b.side);
    const outer = b.side < 0 ? strip[0] : strip[1];
    b.x = b.side < 0 ? outer - b.w + range(random, 0, 20) : outer - range(random, 0, 20);
  }
  buildings.sort((a, b) => b.t - a.t);
  const palms = [];
  for (let index = 0; index < 10; index += 1) {
    const side = index % 2 === 0 ? -1 : 1;
    const t = 0.12 + index * 0.085;
    const strip = sidewalkAt(t, side);
    palms.push({ x: side < 0 ? strip[0] + 12 : strip[1] - 12, y: groundY(t), s: scaleAt(t), side });
  }
  const lamps = [];
  for (let index = 0; index < 8; index += 1) {
    const side = index % 2 === 0 ? 1 : -1;
    const t = 0.16 + index * 0.1;
    const strip = sidewalkAt(t, side);
    lamps.push({ x: side < 0 ? strip[1] - 6 : strip[0] + 6, y: groundY(t), s: scaleAt(t) });
  }
  return { buildings, palms, lamps, districts: DISTRICTS };
}

/** District lookup by name (for the pause-menu map). */
export function districtByName(name) {
  return DISTRICTS.find((d) => d.name === name) ?? DISTRICTS[0];
}
