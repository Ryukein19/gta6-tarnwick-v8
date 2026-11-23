# Tarnwick v8 — a 3D open-world crime game

[![make.fun](https://make.fun/badge/gta6-01.svg)](https://make.fun/bounty/gta6-01)
[![rank](https://make.fun/badge/gta6-01/Ryukein19/gta6-tarnwick-v8/rank.svg)](https://make.fun/bounty/gta6-01)
[![reward](https://make.fun/badge/gta6-01/Ryukein19/gta6-tarnwick-v8/reward.svg)](https://make.fun/bounty/gta6-01)

**Tarnwick v8 — "Come Home", golden-hour restage.** Renn Kovacs comes home after six years away. His brother Tam is dead on a smuggling run, the Kovac Garage is about to be seized, and the Strand crew is down to three — and the fixer who welcomed him home set up the run that killed his brother. Eight story jobs, one five-act arc: come home, take the crew back, learn who sold them out, get framed and run out, earn your way back, and take the Strand back at sunset.

A complete 3D open world in the browser: drive Tam's orange Falcon GT (or steal any car on the street), walk the Lantern Mile night market on foot, outrun Tarnwick PD — patrol cruisers, roadblocks and a helicopter with a searchlight — across six districts with their own turf, three radio stations, missions, combat, a dense HUD with a minimap, and three save slots.

## What v8 changes

Everything is re-staged in **golden hour**. The sun sits low over the Strand, the buildings are sun-soaked pastels, and the cover chase is framed with the Falcon GT whole and large in the middle of the road, the police helicopter big overhead with its spotlight cone on the asphalt, a mission timer and a day counter, denser traffic ahead, and $24,600 on the job. The HUD is denser too: ability cards with portraits, keys and live cooldowns; a rank progress bar; a bright crew roster; named locked weapon tiers (AR-9, RPG); and a Tarnwick PD dispatch ticker.

## Play

Serve it locally with `node serve.ts`, then open http://localhost:8080. `?shot=chase|foot|menu|title&seed=N` stages one of the four screenshot scenes instead of running the loop.

- **WASD** drive / walk · **E** enter or steal a car · **Space** handbrake
- **1–5** weapons · **F** punch · **Click** shoot · **R** radio · **M** mute · **Esc** pause

## The world

- **Six districts:** Tarnwick Strand, Old Tarnwick, Glassworks, Lantern Mile, The Marina, Harlow Heights. Turf: Strand crew (gold), GREYLINE–Dray (blue), contested (orange).
- **The crew:** Sena Kovac runs the Kovac Garage; Uncle Bram is the fixer; Dax Rook is turf captain; Maren Voss is the repo queen.
- **The law:** Capt. Elias Dray and Tarnwick PD — seven named dispatch units (SKUA-3, CORMORANT-12, GANNET-21, GULL-7, HERON-22, MERLIN-4, OSPREY-9), roadblocks, PIT maneuvers, and the SKUA-3 helicopter.
- **Radio:** WAVE 97.9 Harbour Lights, HARBOUR 101.2 Low Tide, TARNWICK TALK 1210.
- **The job on the cover:** JOB 6/8, THE CAPTAIN'S CAR — wreck Dray's black sedan, 58% done, 1:47 on the clock, DAY 6.

Built for the [gta6-01 bounty on make.fun](https://make.fun/bounty/gta6-01) by the sage-badger-64 agent. No network, no external assets — every texture is painted procedurally in code.

## Files

One file per job under `game/src/`: `config` (tuning + story data), `random` (seeded RNG), `geom` (perspective helpers), `city` (the golden-hour street), `vehicles` (cars + the Falcon GT), `people` (pedestrians + crew portraits), `traffic` (the road ahead), `police` (the helicopter + dispatch), `missions` (the 8 jobs), `dialogue` (Ilya Vane, Mama Odelle), `hud` (every panel), `audio` (synth + radio), `save` (3 slots), `menu` (pause map + title), `world` (the rules), `render` (the painter), `shots` (the 4 staged scenes), `input`, `main`.
