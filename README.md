# Tarnwick v8 — Come Home

[![MakeFun](https://make.fun/badge/gta6-01.svg)](https://make.fun/bounty/gta6-01)
[![Rank](https://make.fun/badge/gta6-01/Ryukein19/gta6-tarnwick-v8/rank.svg)](https://make.fun/bounty/gta6-01)
[![Reward](https://make.fun/badge/gta6-01/Ryukein19/gta6-tarnwick-v8/reward.svg)](https://make.fun/bounty/gta6-01)

An open-world crime game for the [gta6-01 bounty](https://make.fun/bounty/gta6-01):
**Tarnwick — Come Home**. Renn Kovacs returns after six years to a faded resort
town. His brother Tam died on a smuggling run; his sister Sena runs the Kovac
Garage; fixer Uncle Bram holds the Strand; Capt. Elias Dray and the rival crew
GREYLINE own the harbour. Drive Tam's Falcon GT through a golden-hour police
chase, work **8 story jobs** across **6 districts**, and bring the car home.

## What is in the game

- **Golden-hour chase** — low sun, pastel buildings, a whole Falcon GT centred
  in frame, a large police helicopter with a spotlight cone on the road, 7 named
  Tarnwick PD dispatch units, a mission timer (1:47), DAY 6, $24,600, 4 stars.
- **Crew systems** — ability cards with portraits, keys and live cooldowns
  (SWAP PLATES [Z], QUICK FIX [X], EYES OUT [C]); a bright crew roster;
  rank progress (SHOT CALLER 840/1,200 RP); named LOCKED weapon tiers.
- **On foot** — the Lantern Mile night market (JOB 3/8 · STALL MONEY) with Mama
  Odelle, warm lantern light, lit stall awnings.
- **Pause menu** — the full Tarnwick map (6 districts, turf colours, route,
  YOU marker), 55% COMPLETE, progress bars, career stats, ACTIVITIES 2/4,
  3 save slots.
- **Title screen** — "— THE LAST GOOD LIGHT — / TARNWICK", golden-hour panorama
  over the beach, NEW GAME / CONTINUE / LOAD GAME, 3 save slots.
- **Radio** — WAVE 97.9 Harbour Lights, HARBOUR 101.2 Low Tide, TARNWICK TALK
  1210. **Controls** — WASD drive/walk, E enter or steal a car, SPACE handbrake,
  1–5 weapons, F punch, CLICK shoot, M mute, ESC pause.

## Play it

```sh
node serve.ts   # then open http://localhost:8080
```

Staged screenshots: `?shot=chase|foot|menu|title&seed=N`.

## Tech

Canvas 2D with perspective projection (pseudo-3D), ES modules, one file per
subsystem (`game/src/`), seeded RNG + fixed 1/60 s timestep, procedural canvas
art (no image assets, no network). `main.ts` (Node 22 stdlib) copies `game/` +
`screenshots/` to `/output` and writes `dossier.json`.

## License

MIT — see [LICENSE](LICENSE).
