// Tarnwick v8 — Come Home: golden-hour restage (Node 22, standard library only).
// The game is this directory's game/ folder: plain static files a desktop browser
// loads offline (game/index.html and its ES modules, canvas 2D with perspective
// projection, no library, no network request). This program hands it in: it
// copies game/ and screenshots/ from beside this file to /output and writes
// /output/dossier.json, the summary the judge reads, with the vendored make.fun
// library. Tarnwick is an open-world crime game: Renn Kovacs returns after six
// years to a faded resort town, drives Tam's Falcon GT through a golden-hour
// police chase, works 8 story jobs across 6 districts, and brings the car home.
// Put the 4 staged screenshots in screenshots/ (the first by name is the cover)
// and run it.
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

// Screenshot pre-flight: the entry is refused with more than 4 screenshots, or
// any one over 256 KiB, or none at all — fail loudly here instead of at submit.
const shotsDir = join(here, 'screenshots');
if (!existsSync(shotsDir)) throw new Error('Tarnwick v8: screenshots/ is missing — render the 4 staged shots first');
const shots = readdirSync(shotsDir).filter((f) => /\.(png|jpe?g|webp)$/i.test(f)).sort();
if (shots.length === 0) throw new Error('Tarnwick v8: screenshots/ is empty — render the 4 staged shots first');
if (shots.length > 4) throw new Error(`Tarnwick v8: ${shots.length} screenshots, at most 4 allowed`);
for (const shot of shots) {
  const bytes = statSync(join(shotsDir, shot)).size;
  if (bytes > 262144) throw new Error(`Tarnwick v8: ${shot} is ${bytes} bytes, over the 262144 cap`);
}
console.log(`Tarnwick v8: ${shots.length} screenshot(s) OK (${shots.join(', ')})`);

mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
cpSync(shotsDir, join(out, 'screenshots'), { recursive: true });

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
