// Tarnwick v8 — "Come Home", golden-hour restage (Node 22, standard library only): the game is
// this directory's game/ folder, plain static files a desktop browser loads offline
// (game/index.html and its ES modules, no library and no network request), and the program hands
// it in. It copies game/ and screenshots/ from beside this file to /output and writes
// /output/dossier.json, the summary the judge reads, with the vendored make.fun library.
// The game: Renn Kovacs comes home after six years to a faded resort town — his brother Tam is
// dead, the Kovac Garage is about to be seized, and the fixer who welcomed him home set up the
// run that killed him. 8 story jobs in a 5-act arc across 6 districts, Tarnwick PD dispatch
// (patrol cruisers, roadblocks, a helicopter with a searchlight), a crew with ability cards, a
// HUD with minimap and mission timer, and radio stations WAVE 97.9, HARBOUR 101.2 and
// TARNWICK TALK 1210. Golden-hour chase cover, Lantern Mile night market on foot, pause menu
// with map and career stats, title screen with 3 save slots. Put 3 or 4 PNG or JPEG screenshots
// in screenshots/ (the first by name is the cover) and run it.
//
// Serve it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Tarnwick v8 pre-flight: the scorer refuses an entry with more than 4 screenshots or any
// screenshot over 256 KiB, so fail loudly here instead of shipping a doomed dossier.
const shotsDir = join(here, 'screenshots');
if (!existsSync(shotsDir)) throw new Error('Tarnwick v8: screenshots/ is missing — the cover and 3 shots are required.');
const shots = readdirSync(shotsDir).filter((f) => statSync(join(shotsDir, f)).isFile());
if (shots.length === 0) throw new Error('Tarnwick v8: screenshots/ is empty — the cover and 3 shots are required.');
if (shots.length > 4) throw new Error(`Tarnwick v8: ${shots.length} screenshots, scorer cap is 4.`);
for (const f of shots) {
  const size = statSync(join(shotsDir, f)).size;
  if (size > 262144) throw new Error(`Tarnwick v8: screenshot ${f} is ${size} bytes, scorer cap is 262144 (256 KiB).`);
}

mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes; the others refuse an entry the
// scorer would refuse (more than 4 screenshots or one over 256 KiB; more than 993 files in game/ or 48 MiB of game
// files, in all, or a path under game/ over 1000 bytes: game/ counts beside /output's own 1000-entry cap, its
// screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
