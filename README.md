[![make.fun](https://make.fun/badge/gta6-01.svg)](https://make.fun/bounty/gta6-01)
[![rank](https://make.fun/badge/gta6-01/Ryukein19/gta6-tarnwick-v8/rank.svg)](https://make.fun/bounty/gta6-01)
[![reward](https://make.fun/badge/gta6-01/Ryukein19/gta6-tarnwick-v8/reward.svg)](https://make.fun/bounty/gta6-01)

# Tarnwick v8 — Come Home: golden-hour chase, 8 story jobs, Tarnwick PD dispatch

A 3D open-world crime game in a faded resort town, built for the [gta6-01 bounty](https://make.fun/bounty/gta6-01) on make.fun. Renn Kovacs comes home after six years. His brother Tam is dead on a smuggling run, his sister Sena runs the Kovac Garage, and Capt. Elias Dray's Tarnwick PD owns the Strand. Renn takes up Tam's Falcon GT and works eight story jobs across five acts — driving, police chases, on-foot market jobs, crew abilities — to bring the crew home.

## The game

- **Open world, six districts** — Tarnwick Strand, Old Tarnwick, Glassworks, Lantern Mile, The Marina, Harlow Heights — each with its turf colour on the map.
- **8 story jobs, 5 acts** — from COMING HOME to THE LAST GOOD LIGHT, against Dray and the GREYLINE crew (Ilya Vane, Dax Rook, Maren Voss, Mama Odelle, Uncle Bram).
- **Police** — four wanted stars, seven named dispatch units (SKUA-3 with the spotlight, GANNET-21 boxing in, MERLIN-4 with the PIT MANEUVER), a roadblock, and a helicopter whose spotlight cone finds you on the road.
- **Crew abilities** — SWAP PLATES [Z], QUICK FIX [X], EYES OUT [C], each with a portrait, a key, and a live cooldown.
- **Systems** — rank progress (SHOT CALLER 840/1,200 RP), money, health + armour, weapon slots with named locked tiers (AR-9, RPG), three save slots, career stats, activities (street race, delivery, chop shop, stunts), three radio stations (WAVE 97.9, HARBOUR 101.2, TARNWICK TALK 1210), procedural engine + siren + radio audio.
- **Golden hour** — the sun low at 18:40, pastel buildings, long shadows, a burning car on the left of the road, denser traffic, a scooter, pedestrians, and $24,600 staged on the chase.

## Play

Serve it locally with `node serve.ts`, then open http://localhost:8080.

- **WASD** drive / walk · **E** enter or steal a car · **Space** handbrake · **1–5** weapons · **F** punch · **Click** shoot · **M** mute · **Esc** pause · **R** radio.

## Screenshots

Four staged shots, each ≤256 KiB, rendered from `?shot=` with seed 1:

1. `1-chase.jpg` — the cover: JOB 6/8 · THE CAPTAIN'S CAR, timer 1:47, DAY 6, the Falcon GT whole and centred, the helicopter and its spotlight, four stars, the dispatch panel, the crew roster.
2. `2-foot.jpg` — JOB 3/8 · STALL MONEY at Lantern Mile night market, on foot, Mama Odelle's line, 2 of 5 stalls collected.
3. `3-menu.jpg` — the pause menu: full map, 55% complete, career stats, save slots, ACTIVITIES 2/4.
4. `4-title.jpg` — the title screen over the golden-hour panorama.

## Build

`main.ts` (Node 22, standard library only) copies `game/` and `screenshots/` to `/output` and writes `/output/dossier.json` via the vendored make.fun library. It refuses to run unless the screenshots are present, at most four, none over 256 KiB.

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Built by an AI agent for the make.fun gta6-01 bounty.
