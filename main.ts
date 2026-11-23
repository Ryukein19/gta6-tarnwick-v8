// Tarnwick v8 — Come Home: golden-hour restage (Node 22, standard library only).
// The game is this directory's game/ folder: plain static files a desktop browser
// loads offline (game/index.html and its ES modules, no library, no network request).
// This program hands it in: it copies game/ and screenshots/ from beside this file
// to /output and writes /output/dossier.json, the summary the judge reads, with the
// vendored make.fun library.
//
// The game itself is an open-world crime game in a faded resort town: Renn Kovacs
// comes home after six years, takes up Tam's Falcon GT, and works eight story jobs
// across five acts against Capt. Elias Dray and the GREYLINE crew — driving, police
// chases with a helicopter spotlight, on-foot market jobs, crew abilities, a radio,
// saves. Golden hour throughout: the sun low at 18:40, pastel buildings, long shadows.
//
// Screenshots: four staged JPEGs in screenshots/ — 1-chase.jpg (the cover), 2-foot.jpg
// (Lantern Mile on foot), 3-menu.jpg (the pause menu), 4-title.jpg (the title screen).
// The first by name is the cover. This program refuses to run unless the screenshots
// are exactly as the scorer expects them: present, one to four of them, none over
// 256 KiB — a silent bad build is worse than a loud refusal.
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

const MAX_SCREENSHOTS = 4;
const MAX_SCREENSHOT_BYTES = 262144; // 256 KiB, the scorer's cap per screenshot.

/**
 * The screenshot pre-flight: fail loudly before anything is copied, so a broken
 * entry never reaches the judge. The scorer refuses an entry with no screenshots,
 * more than four, or any single one over 256 KiB — and a missing screenshots/
 * folder would silently hand in a game with no cover at all.
 */
function checkScreenshots() {
  const shotsDir = join(here, 'screenshots');
  if (!existsSync(shotsDir)) {
    throw new Error('Tarnwick v8: screenshots/ is missing — the entry needs its four staged shots (1-chase, 2-foot, 3-menu, 4-title).');
  }
  const shots = readdirSync(shotsDir)
    .filter((name) => /\.(png|jpe?g)$/i.test(name))
    .sort();
  if (shots.length === 0) {
    throw new Error('Tarnwick v8: screenshots/ is empty — the entry needs its four staged shots (1-chase, 2-foot, 3-menu, 4-title).');
  }
  if (shots.length > MAX_SCREENSHOTS) {
    throw new Error(`Tarnwick v8: ${shots.length} screenshots in screenshots/ — the scorer allows at most ${MAX_SCREENSHOTS}.`);
  }
  for (const name of shots) {
    const size = statSync(join(shotsDir, name)).size;
    if (size > MAX_SCREENSHOT_BYTES) {
      throw new Error(`Tarnwick v8: screenshots/${name} is ${size} bytes — over the scorer's ${MAX_SCREENSHOT_BYTES} byte (256 KiB) cap.`);
    }
  }
  return shots;
}

const shots = checkScreenshots();
console.log(`Tarnwick v8: ${shots.length} screenshot(s) OK — ${shots.join(', ')}`);

mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes;
// the others refuse an entry the scorer would refuse (more than 4 screenshots or one
// over 256 KiB; more than 993 files in game/ or 48 MiB of game files, in all, or a
// path under game/ over 1000 bytes: game/ counts beside /output's own 1000-entry cap,
// its screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: MAX_SCREENSHOTS, max_bytes: MAX_SCREENSHOT_BYTES },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);

console.log(`Tarnwick v8: wrote ${join(out, 'dossier.json')}`);
