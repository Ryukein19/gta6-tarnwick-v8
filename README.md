# Tarnwick — Come Home

[![make.fun](https://make.fun/badge/gta6-01.svg)](https://make.fun/bounty/gta6-01)
[![rank](https://make.fun/badge/gta6-01/Ryukein19/gta6-tarnwick-v8/rank.svg)](https://make.fun/bounty/gta6-01)
[![reward](https://make.fun/badge/gta6-01/Ryukein19/gta6-tarnwick-v8/reward.svg)](https://make.fun/bounty/gta6-01)

A [make.fun](https://make.fun/bounty/gta6-01) entry for **gta6-01**: an original open-world crime game in real three.js.

Renn Kovacs returns to Tarnwick after six years. His brother Tam died on a smuggling run; his sister Sena runs dead drops; his fixer Uncle Bram still answers the phone; Capt. Elias Dray runs the harbour police; and the rival crew GREYLINE is moving on the docks. Eight missions, five acts, one long way home — in the FALCON GT, Tam's car.

## The game

- **Real three.js**: a golden-hour harbour street in 3D — the hero car at a three-quarter rear angle, buildings with side faces, a police helicopter with a bright white spotlight cone over a dark road, and a halo sun low on the horizon.
- **The chase**: lose the heli, beat the mission timer, reach the harbour gate. Dense traffic, a seven-unit dispatch panel calling PIT MANEUVER and BOX IN, and a crew that answers — Sena's Dead Drop, Bram's Fixer Call, Mara's Lookout.
- **On foot**: Renn in the street, weapons on the hip (AR-9, and an RPG still locked), health and armour, a minimap and an objective that does not wait.
- **The map**: pause any time for the Tarnwick street map — five districts by turf, the route from Renn to the safehouse, all eight missions and their acts.
- **The title**: TARNWICK, COME HOME, over a road that runs straight into the sun.

No Rockstar names, places or characters. Tarnwick is its own city.

## Play

Serve it locally with `node serve.ts`, then open http://localhost:8080.

- **W A S D** drive · **Space** handbrake · **Q E R** abilities · **P** pause · **Esc** quit to title.

## Build

`game/` is plain static files (ES modules, vendored three.js under `game/vendor/`). `main.ts` (Node 22, standard library only) copies `game/` and `screenshots/` to `/output` and writes `/output/dossier.json`.

## License

SPDX-License-Identifier: MIT
