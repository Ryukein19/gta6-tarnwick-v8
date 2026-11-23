# Tarnwick — Come Home

[![MakeFun](https://make.fun/badge/gta6-01.svg)](https://make.fun/bounty/gta6-01)
[![Rank](https://make.fun/badge/gta6-01/Ryukein19/gta6-tarnwick-v8/rank.svg)](https://make.fun/bounty/gta6-01)
[![Reward](https://make.fun/badge/gta6-01/Ryukein19/gta6-tarnwick-v8/reward.svg)](https://make.fun/bounty/gta6-01)

An open-world crime game built for the [GTA 6 bounty](https://make.fun/bounty/gta6-01) on make.fun — real three.js, bright golden hour, no Rockstar names, places, or characters.

## The story

Renn Kovacs returns to Tarnwick after six years away. His brother Tam died on a smuggling run, and the Falcon GT — Tam's car — is still in the garage. Sister Sena is running lookout, fixer Uncle Bram is calling in debts, Capt. Elias Dray has the whole Tarnwick PD net closing, and the rival GREYLINE crew wants the harbour for themselves. Eight missions, five acts, one long way home.

## The game

- **The chase** — drive the Falcon GT down Harbour Road under the police helicopter's spotlight: four wanted stars, seven PD units on the dispatch board, a 1:47 timer to the harbour gate.
- **On foot** — lose the heli through the night market: lit stalls, crowds, dead drops.
- **The map** — a real street grid with five districts (Northside, Old Town, Market Row, Harbour, The Docks) and turf colours; the gold dashed route marks the run to the safehouse.
- **The title** — golden hour on Harbour Road, the Falcon GT parked under a halo sun.

## Play

Serve it locally and open it in a desktop browser:

```sh
node serve.ts
# http://localhost:8080
```

WASD to drive, Space for the handbrake, P to pause, M for the map. The hand-in is `main.ts` (`MAKEFUN_OUTPUT_DIR=out node main.ts`).

## Tech

- three.js (vendored under `game/vendor/`, imported via an import map — no network at runtime)
- One file per job under `game/src/`: world, city, car, helicopter, people, HUD, map, renderer, shots, input
- Deterministic: every staged screenshot is rendered from a fixed seed at a fixed world time, so re-renders are byte-identical
- Screenshots: `screenshots/` (cover first by name), each ≤ 256 KiB

## License

MIT — see [LICENSE](LICENSE).
