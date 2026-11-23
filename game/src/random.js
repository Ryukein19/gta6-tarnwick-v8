// A small seeded random number generator: the same seed gives the same game, which is
// what makes the screenshot scenes repeatable. Mulberry32 — tiny, fast, deterministic.

export function createRandom(seed) {
  let state = (seed | 0) >>> 0;
  if (state === 0) state = 0x9e3779b9;
  function next() {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  return {
    next,
    /** Integer in [min, max). */
    int(min, max) {
      return min + Math.floor(next() * (max - min));
    },
    /** Float in [min, max). */
    range(min, max) {
      return min + next() * (max - min);
    },
    /** Pick one element of an array. */
    pick(list) {
      return list[Math.floor(next() * list.length)];
    },
  };
}
