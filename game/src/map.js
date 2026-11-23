// The pause-menu map: a street grid over Tarnwick's five districts, each block tinted
// by turf, with the player's position, the mission marker and a gold route arrow
// between them. Built as one inline SVG so it stays crisp at any size.
import { DISTRICTS, MISSIONS } from './config.js';

/** The map's street grid: 5 columns by 4 rows of blocks, each one a district. */
const GRID = [
  ['Northside', 'Northside', 'Old Town', 'Old Town', 'Market Row'],
  ['Northside', 'Harbour', 'Old Town', 'Market Row', 'Market Row'],
  ['The Docks', 'Harbour', 'Harbour', 'Old Town', 'Market Row'],
  ['The Docks', 'The Docks', 'Harbour', 'Harbour', 'Old Town'],
];

const W = 640;
const H = 420;
const COLS = 5;
const ROWS = 4;
const CW = W / COLS;
const CH = H / ROWS;

function districtColor(name) {
  const found = DISTRICTS.find((d) => d.name === name);
  return found ? found.color : '#3a2f4a';
}

export function buildPauseMap() {
  let blocks = '';
  for (let r = 0; r < ROWS; r += 1) {
    for (let c = 0; c < COLS; c += 1) {
      const name = GRID[r][c];
      blocks += '<rect x="' + (c * CW + 5) + '" y="' + (r * CH + 5) + '" width="' + (CW - 10) + '" height="' + (CH - 10)
        + '" fill="' + districtColor(name) + '" fill-opacity="0.32" stroke="' + districtColor(name)
        + '" stroke-opacity="0.7" stroke-width="1.5" rx="4"/>';
    }
  }
  // District labels, one per district, at the centre of its biggest block.
  const labels = [
    { name: 'NORTHSIDE', x: 1.0 * CW, y: 0.5 * CH, turf: 'GREYLINE' },
    { name: 'OLD TOWN', x: 3.0 * CW, y: 0.5 * CH, turf: 'KOVACS' },
    { name: 'HARBOUR', x: 2.0 * CW, y: 2.5 * CH, turf: 'KOVACS' },
    { name: 'THE DOCKS', x: 0.5 * CW, y: 3.5 * CH, turf: 'CONTESTED' },
    { name: 'MARKET ROW', x: 4.0 * CW, y: 1.5 * CH, turf: 'KOVACS' },
  ];
  let labelSvg = '';
  for (const label of labels) {
    labelSvg += '<text x="' + label.x + '" y="' + (label.y - 4) + '" fill="#f2ead8" font-size="15" font-weight="bold" text-anchor="middle">' + label.name + '</text>'
      + '<text x="' + label.x + '" y="' + (label.y + 14) + '" fill="#b8a888" font-size="11" text-anchor="middle">' + label.turf + '</text>';
  }
  // The route: player at the Harbour gate, mission at the Old Town safehouse.
  const px = 1.6 * CW;
  const py = 2.7 * CH;
  const mx = 3.4 * CW;
  const my = 0.8 * CH;
  const route = '<defs><marker id="arrow" markerWidth="10" markerHeight="8" refX="8" refY="4" orient="auto">'
    + '<path d="M0,0 L10,4 L0,8 z" fill="#ffd76a"/></marker></defs>'
    + '<polyline points="' + px + ',' + py + ' ' + (px + 60) + ',' + (py - 70) + ' ' + (mx - 40) + ',' + (my + 50) + ' ' + mx + ',' + my
    + '" fill="none" stroke="#ffd76a" stroke-width="4" stroke-dasharray="12 6" marker-end="url(#arrow)"/>';
  const markers = '<circle cx="' + px + '" cy="' + py + '" r="9" fill="#7ddb8a" stroke="#0c0f14" stroke-width="2"/>'
    + '<text x="' + px + '" y="' + (py + 26) + '" fill="#7ddb8a" font-size="12" font-weight="bold" text-anchor="middle">RENN</text>'
    + '<path d="M' + mx + ',' + (my - 12) + ' l4,9 h-8 z" fill="#ff4d4d" stroke="#0c0f14" stroke-width="1.5"/>'
    + '<circle cx="' + mx + '" cy="' + (my - 12) + '" r="4" fill="#ff4d4d" stroke="#0c0f14" stroke-width="1.5"/>'
    + '<text x="' + (mx + 12) + '" y="' + (my - 8) + '" fill="#ff4d4d" font-size="12" font-weight="bold">SAFEHOUSE</text>';
  return '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" height="100%">'
    + '<rect x="0" y="0" width="' + W + '" height="' + H + '" fill="#14101c"/>'
    + blocks + route + markers + labelSvg + '</svg>';
}

/** The pause overlay's HTML: map on the left, missions and controls on the right. */
export function pauseOverlayHtml(state) {
  let missionRows = '';
  for (const mission of MISSIONS) {
    const cls = mission.status === 'ACTIVE' ? 'mission-active' : mission.status === 'DONE' ? 'mission-done' : 'mission-locked';
    missionRows += '<div class="mission-row ' + cls + '"><span class="mission-act">' + mission.act + '</span>'
      + '<span class="mission-name">' + mission.name + '</span>'
      + '<span class="mission-status">' + mission.status + '</span></div>';
  }
  return '<div class="pause-wrap">'
    + '<div class="pause-left"><div class="hud-panel-title">TARNWICK — STREET MAP</div>'
    + '<div class="pause-map">' + buildPauseMap() + '</div>'
    + '<div class="pause-activities">ACTIVITIES — Harbour races · Docks smuggling · Market Row dead drops · Talk 1210 call-ins</div></div>'
    + '<div class="pause-right"><div class="hud-panel-title">PAUSED — ' + state.mission.name.toUpperCase() + '</div>'
    + '<div class="pause-missions">' + missionRows + '</div>'
    + '<div class="pause-stats">DAY ' + state.day + ' · ' + state.clock + ' &nbsp;·&nbsp; ' + '$' + state.money.toLocaleString('en-US')
    + ' &nbsp;·&nbsp; ' + state.rankName + ' ' + state.rankPoints + '/' + state.rankNext + ' RP</div>'
    + '<div class="pause-controls">W A S D DRIVE &nbsp;·&nbsp; SPACE HANDBRAKE &nbsp;·&nbsp; Q E R ABILITIES &nbsp;·&nbsp; P RESUME &nbsp;·&nbsp; ESC QUIT TO TITLE</div>'
    + '<div class="pause-prompt">Press P to resume</div></div>'
    + '</div>';
}

/** The title overlay's HTML: the big name, the tagline, the menu. */
export function titleOverlayHtml() {
  return '<div class="title-wrap">'
    + '<div class="title-kicker">A TARNWICK STORY</div>'
    + '<div class="title-name">TARNWICK</div>'
    + '<div class="title-tag">COME HOME</div>'
    + '<div class="title-sub">Renn Kovacs is back after six years. His brother Tam is gone. '
    + 'The harbour remembers everything.</div>'
    + '<div class="title-menu"><div class="title-item title-item-active">CONTINUE — THE LONG WAY HOME</div>'
    + '<div class="title-item">NEW GAME</div><div class="title-item">MISSIONS</div><div class="title-item">SETTINGS</div></div>'
    + '<div class="title-foot">WAVE 97.9 · HARBOUR 101.2 · TARNWICK TALK 1210 &nbsp;&nbsp;|&nbsp;&nbsp; PRESS SPACE TO START</div>'
    + '</div>';
}
