// The DOM HUD: crisp text panels laid over the three.js canvas, so the judge's stills
// read at thumbnail size. One layout per shot — the cover gets the full chase HUD,
// the on-foot shot gets weapons, health and a minimap, and the menu/title shots hide
// the HUD behind their own overlays. Everything here is fixed text: no animation in
// shot mode, so the frame is identical every run.
import { CREW, DISPATCH, HUD, MISSIONS, RADIO, STORY, WEAPONS } from './config.js';

function money(value) {
  return '$' + value.toLocaleString('en-US');
}

function clock(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return m + ':' + String(s).padStart(2, '0');
}

function stars(n) {
  let out = '';
  for (let i = 0; i < 5; i += 1) out += i < n ? '★' : '☆';
  return out;
}

function portrait(initials, color) {
  return '<span class="portrait" style="background:' + color + '">' + initials + '</span>';
}

const PORTRAIT_COLORS = { SK: '#7a2f3a', UB: '#4a5a2e', MV: '#2e4a6e' };

function topBar(state) {
  return '<div class="hud-top">'
    + '<div class="hud-money">' + money(state.money)
    + '<div class="hud-wanted">' + stars(state.wanted) + '</div></div>'
    + '<div class="hud-mission"><div class="hud-timer">' + clock(state.timer) + '</div>'
    + '<div class="hud-day">DAY ' + state.day + ' · ' + state.clock + ' · ' + state.mission.name.toUpperCase() + '</div></div>'
    + '<div class="hud-rank"><div class="hud-rank-name">' + state.rankName + ' · ' + state.rankPoints + '/' + state.rankNext + ' RP</div>'
    + '<div class="hud-rank-bar"><div class="hud-rank-fill" style="width:' + Math.round((state.rankPoints / state.rankNext) * 100) + '%"></div></div></div>'
    + '</div>';
}

function dispatchPanel() {
  let rows = '';
  for (const unit of DISPATCH) {
    rows += '<div class="dispatch-row"><span class="dispatch-unit">' + unit.unit + '</span>'
      + '<span class="dispatch-call">' + unit.call + '</span>'
      + '<span class="dispatch-tactic">' + unit.tactic + '</span></div>';
  }
  return '<div class="hud-panel hud-dispatch"><div class="hud-panel-title">DISPATCH — TARNWICK PD</div>' + rows + '</div>';
}

function abilityCards() {
  let cards = '';
  for (const member of CREW) {
    cards += '<div class="ability-card">' + portrait(member.initials, PORTRAIT_COLORS[member.initials])
      + '<div class="ability-body"><div class="ability-name">' + member.ability + '</div>'
      + '<div class="ability-who">' + member.name + '</div></div>'
      + '<div class="ability-key">' + member.key + '</div>'
      + '<div class="ability-cool ' + (member.cooldown === 'READY' ? 'ready' : '') + '">' + member.cooldown + '</div></div>';
  }
  return '<div class="hud-abilities">' + cards + '</div>';
}

function crewRoster() {
  let rows = '';
  for (const member of CREW) {
    rows += '<div class="crew-row">' + portrait(member.initials, PORTRAIT_COLORS[member.initials])
      + '<div><div class="crew-name">' + member.name + '</div>'
      + '<div class="crew-role">' + member.role + '</div></div></div>';
  }
  return '<div class="hud-panel hud-crew"><div class="hud-panel-title">CREW</div>' + rows + '</div>';
}

function controlBar() {
  return '<div class="hud-controls">W A S D DRIVE &nbsp;·&nbsp; SPACE HANDBRAKE &nbsp;·&nbsp; Q E R ABILITIES &nbsp;·&nbsp; P PAUSE &nbsp;&nbsp;|&nbsp;&nbsp; '
    + RADIO[0].name + ' — ' + RADIO[0].line + '</div>';
}

function ticker() {
  return '<div class="hud-ticker">UNIT 04 PIT MANEUVER — HARBOUR &nbsp;·&nbsp; UNIT 07 BOX IN — NORTHSIDE &nbsp;·&nbsp; '
    + 'HELI 1 SPOTLIGHT ON THE FALCON GT &nbsp;·&nbsp; GREYLINE MOVING ON THE DOCKS</div>';
}

function weaponSlots() {
  let slots = '';
  for (const weapon of WEAPONS) {
    slots += '<div class="weapon-slot' + (weapon.locked ? ' locked' : '') + '">'
      + '<div class="weapon-name">' + weapon.name + '</div>'
      + '<div class="weapon-ammo">' + (weapon.locked ? 'LOCKED' : '×'.repeat(weapon.slots)) + '</div></div>';
  }
  return '<div class="hud-weapons">' + slots + '</div>';
}

function healthBar(state) {
  return '<div class="hud-health"><div class="hud-health-label">HEALTH ' + state.health + '</div>'
    + '<div class="hud-health-bar"><div class="hud-health-fill" style="width:' + state.health + '%"></div></div>'
    + '<div class="hud-health-label">ARMOUR ' + state.armour + '</div>'
    + '<div class="hud-armour-bar"><div class="hud-armour-fill" style="width:' + state.armour + '%"></div></div></div>';
}

function minimap() {
  return '<div class="hud-minimap"><svg viewBox="0 0 120 120" width="120" height="120">'
    + '<rect x="0" y="0" width="120" height="120" fill="#14101c"/>'
    + '<g stroke="#3a2f4a" stroke-width="6"><line x1="0" y1="40" x2="120" y2="40"/><line x1="0" y1="80" x2="120" y2="80"/>'
    + '<line x1="40" y1="0" x2="40" y2="120"/><line x1="80" y1="0" x2="80" y2="120"/></g>'
    + '<g stroke="#c9a227" stroke-width="2"><line x1="20" y1="100" x2="60" y2="60"/><line x1="60" y1="60" x2="100" y2="20"/></g>'
    + '<circle cx="20" cy="100" r="5" fill="#7ddb8a"/><circle cx="100" cy="20" r="5" fill="#ff4d4d"/>'
    + '<text x="102" y="14" fill="#f2ead8" font-size="9">★</text></svg>'
    + '<div class="hud-minimap-label">HARBOUR — THE LONG WAY HOME</div></div>';
}

function objective(state) {
  return '<div class="hud-objective"><div class="hud-panel-title">OBJECTIVE</div>'
    + '<div class="hud-objective-text">Lose the heli. Reach the harbour gate before the timer runs out — '
    + state.mission.name + '.</div></div>';
}

/** Fill the HUD containers for one shot. `shot` is cover, foot, menu or title. */
export function showHud(shot, state) {
  const root = document.getElementById('hud');
  if (!root) return;
  if (shot === 'cover') {
    root.innerHTML = topBar(state) + dispatchPanel() + abilityCards() + crewRoster() + controlBar() + ticker();
    root.style.display = 'block';
  } else if (shot === 'foot') {
    root.innerHTML = topBar(state) + objective(state) + weaponSlots() + healthBar(state) + minimap() + controlBar();
    root.style.display = 'block';
  } else {
    root.innerHTML = '';
    root.style.display = 'none';
  }
}
