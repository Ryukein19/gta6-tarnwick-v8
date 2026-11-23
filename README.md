# Tarnwick v8 — Come Home

[![make.fun](https://make.fun/badge/gta6-01.svg)](https://make.fun/bounty/gta6-01)
[![rank](https://make.fun/badge/gta6-01/Ryukein19/gta6-tarnwick-v8/rank.svg)](https://make.fun/bounty/gta6-01)
[![reward](https://make.fun/badge/gta6-01/Ryukein19/gta6-tarnwick-v8/reward.svg)](https://make.fun/bounty/gta6-01)

A 3D open-world crime game — **Tarnwick: Come Home**. Renn Kovacs returns after six
years to a faded resort town. His brother Tam is dead on a smuggling run; his sister
Sena runs the Kovac Garage; the fixer Uncle Bram holds the Strand together; Capt.
Elias Dray and the GREYLINE crew own the night. One way home: drive Tam's orange
Falcon GT through a golden-hour police chase and work 8 story jobs across 6 districts.

## What is in the game

- **Golden-hour chase (the cover):** the whole Falcon GT, large and centred, under a
  big police helicopter with a spotlight cone on the road; mission timer 1:47, DAY 6,
  $24,600, 4 wanted stars, SHOT CALLER 840/1,200 RP.
- **Tarnwick PD dispatch:** 7 named units with distance and tactic (SKUA-3 SPOTLIGHT,
  MERLIN-4 PIT MANEUVER, GANNET-21 BOX IN…), plus a live dispatch ticker.
- **Crew system:** Sena, Uncle Bram, Dax Rook and Maren Voss, each with an ability card
  (portrait + key + cooldown: SWAP PLATES [Z] READY, QUICK FIX [X] 12S, EYES OUT [C] 30S).
- **8 story jobs, 5-act arc,** from HOMECOMING to COME HOME, across Tarnwick Strand,
  Old Tarnwick, Glassworks, Lantern Mile, The Marina and Harlow Heights.
- **On foot in Lantern Mile:** the night market, Mama Odelle, stall money 2/5.
- **Pause menu** with the full six-district map, 55% COMPLETE, career stats and 3 save
  slots; **title screen** over a golden-hour panorama.
- **Radio:** WAVE 97.9 Harbour Lights, HARBOUR 101.2 Low Tide, TARNWICK TALK 1210.

## How to play

Serve it locally with `node serve.ts`, then open http://localhost:8080.

- **WASD** drive / walk · **E** enter or steal a car · **SPACE** handbrake
- **1–5** weapons · **F** punch · **CLICK** shoot · **R** radio · **M** mute · **ESC** pause

Screenshots are staged with `?shot=chase|foot|menu|title&seed=N` (see `shots.json`).
The game is plain static files — canvas 2D, ES modules, no library, no network.

## License

MIT — see [LICENSE](LICENSE).
