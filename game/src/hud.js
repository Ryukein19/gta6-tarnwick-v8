// The DOM HUD: money, stars, timer, rank, dispatch, crew, abilities, weapon slots, minimap,
// health/armour, dialogue, radio and controls. The cover carries the FULL HUD — weapon slots,
// minimap and health/armour included (v9 dropped all three from the cover and paid for it).
// The overlay is a fixed 1280x720 layer scaled to the window by main.js, so the layout is
// identical in every screenshot.

import { GAME, CREW, ABILITIES, DISPATCH, WEAPONS, MISSIONS, DISTRICTS, RADIO, DIALOGUE } from './config.js';

function el(tag, cls, html) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (html !== undefined) node.innerHTML = html;
  return node;
}

function fmtTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** Draw the round minimap: street grid, district tints, the gold route, the player and the heli. */
function drawMinimap(canvas, state) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#241a20';
  ctx.fillRect(0, 0, W, H);
  // District tints.
  const tints = ['#8a7f8a', '#f2c94c', '#3aa88f', '#4a90d9', '#e5484d'];
  for (let i = 0; i < 5; i += 1) {
    ctx.globalAlpha = 0.28;
    ctx.fillStyle = tints[i];
    ctx.fillRect(8 + (i % 3) * 58, 8 + Math.floor(i / 3) * 58, 56, 56);
  }
  ctx.globalAlpha = 1;
  // Street grid.
  ctx.strokeStyle = '#f7ead0';
  ctx.lineWidth = 2;
  for (let x = 20; x < W; x += 28) {
    ctx.beginPath(); ctx.moveTo(x, 6); ctx.lineTo(x, H - 6); ctx.stroke();
  }
  for (let y = 20; y < H; y += 28) {
    ctx.beginPath(); ctx.moveTo(6, y); ctx.lineTo(W - 6, y); ctx.stroke();
  }
  // The gold route to the safehouse.
  ctx.strokeStyle = '#f2c94c';
  ctx.lineWidth = 3;
  ctx.setLineDash([7, 5]);
  ctx.beginPath(); ctx.moveTo(W / 2, H / 2 + 30); ctx.lineTo(W / 2, 26); ctx.stroke();
  ctx.setLineDash([]);
  // Safehouse marker.
  ctx.fillStyle = '#f2c94c';
  ctx.beginPath(); ctx.arc(W / 2, 22, 6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#241a20';
  ctx.font = 'bold 9px system-ui, sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('H', W / 2, 22);
  // Police dots.
  ctx.fillStyle = '#2a6bff';
  for (const [x, y] of [[52, 84], [120, 60], [140, 130], [70, 150]]) {
    ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();
  }
  // The heli.
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.arc(96, 62, 7, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#241a20';
  ctx.fillText('H', 96, 62);
  // The player: a bright orange arrow, centre.
  ctx.fillStyle = '#ff6a00';
  ctx.beginPath();
  ctx.moveTo(W / 2, H / 2 - 2);
  ctx.lineTo(W / 2 - 9, H / 2 + 12);
  ctx.lineTo(W / 2 + 9, H / 2 + 12);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

export function createHud(root) {
  root.innerHTML = '';
  const hud = {};

  // --- Top-left: money + wanted stars.
  const money = el('div', 'panel');
  money.style.cssText = 'position:absolute; left:16px; top:16px; padding:10px 14px;';
  money.innerHTML = `<div style="font-size:30px; font-weight:800; line-height:1;">$${GAME.money.toLocaleString('en-US')}</div>
    <div style="font-size:20px; letter-spacing:2px; margin-top:2px;"><span class="gold">★★★★</span><span class="muted">☆</span> <span style="font-size:13px; font-weight:700;">${GAME.wanted}</span></div>`;
  root.appendChild(money);
  hud.money = money;

  // --- Top-centre: mission + timer + day/clock.
  const mission = el('div', 'panel');
  mission.style.cssText = 'position:absolute; left:50%; top:16px; transform:translateX(-50%); padding:8px 18px; text-align:center;';
  mission.innerHTML = `<div style="font-size:13px; font-weight:700; letter-spacing:2px;" class="gold">${GAME.mission}</div>
    <div style="font-size:26px; font-weight:800; line-height:1.1;">${fmtTime(GAME.timerSeconds)}</div>
    <div style="font-size:12px;" class="muted">DAY ${GAME.day} · ${GAME.clock}</div>`;
  root.appendChild(mission);
  hud.mission = mission;

  // --- Top-right: rank + progress bar.
  const rank = el('div', 'panel');
  rank.style.cssText = 'position:absolute; right:16px; top:16px; padding:10px 14px; width:210px;';
  const pct = Math.round((GAME.rank / GAME.rankMax) * 100);
  rank.innerHTML = `<div style="font-size:13px; font-weight:700;">${GAME.rankTitle} <span class="gold">${GAME.rank}/${GAME.rankMax} RP</span></div>
    <div class="bar" style="margin-top:6px;"><div style="width:${pct}%"></div></div>
    <div style="font-size:11px; margin-top:4px;" class="muted">5/8 JOBS · NEXT: FIXER 1,200 RP</div>`;
  root.appendChild(rank);
  hud.rank = rank;

  // --- Left: dispatch panel + ticker.
  const dispatch = el('div', 'panel');
  dispatch.style.cssText = 'position:absolute; left:16px; top:118px; padding:10px 12px; width:250px;';
  let dispatchHtml = `<div style="font-size:13px; font-weight:800; letter-spacing:1px;">TARNWICK PD <span class="gold">· 7 UNITS</span></div>`;
  for (const unit of DISPATCH) {
    dispatchHtml += `<div style="font-size:12px; margin-top:5px;"><b>${unit.unit}</b> <span class="muted">— ${unit.tactic}</span></div>`;
  }
  dispatchHtml += `<div style="font-size:11px; margin-top:8px; border-top:1px solid rgba(255,210,140,0.3); padding-top:6px;" class="gold">▶ CONDOR-1 has the Falcon in the light — all units converge on Harbour Rd</div>`;
  dispatch.innerHTML = dispatchHtml;
  root.appendChild(dispatch);
  hud.dispatch = dispatch;

  // --- Right: crew panel + ability cards.
  const crew = el('div', 'panel');
  crew.style.cssText = 'position:absolute; right:16px; top:118px; padding:10px 12px; width:250px;';
  let crewHtml = `<div style="font-size:13px; font-weight:800; letter-spacing:1px;">CREW <span class="gold">· KOVACS</span></div>`;
  for (const member of CREW) {
    crewHtml += `<div style="display:flex; align-items:center; gap:8px; margin-top:5px;">
      <span style="display:inline-block; width:28px; height:28px; border-radius:50%; background:${member.color}; color:#fff; font-weight:800; font-size:11px; line-height:28px; text-align:center;">${member.initial}</span>
      <span><b style="font-size:12px;">${member.name}</b><br><span class="muted" style="font-size:11px;">${member.role}</span></span></div>`;
  }
  crewHtml += `<div style="margin-top:8px; border-top:1px solid rgba(255,210,140,0.3); padding-top:6px;">`;
  for (const ability of ABILITIES) {
    crewHtml += `<div style="display:flex; align-items:center; gap:8px; margin-top:4px;">
      <span style="display:inline-block; width:26px; height:26px; border-radius:6px; background:#2a2230; border:1px solid #8b93a3; color:#fff; font-weight:800; font-size:11px; line-height:26px; text-align:center;">${ability.key}</span>
      <span style="flex:1; font-size:12px;"><b>${ability.name}</b></span>
      <span class="key">${ability.keyCap}</span>
      <span class="${ability.stateClass}" style="font-size:12px; font-weight:800;">${ability.state}</span></div>`;
  }
  crewHtml += `</div>`;
  crew.innerHTML = crewHtml;
  root.appendChild(crew);
  hud.crew = crew;

  // --- Bottom-left: weapon slots (with LOCKED tiers).
  const weapons = el('div', 'panel');
  weapons.style.cssText = 'position:absolute; left:16px; bottom:16px; padding:8px 10px; display:flex; gap:6px;';
  let weaponsHtml = '';
  for (const weapon of WEAPONS) {
    weaponsHtml += `<div style="width:64px; text-align:center; padding:6px 2px; border-radius:6px; background:rgba(255,255,255,0.07); border:1px solid ${weapon.locked ? 'rgba(255,90,78,0.6)' : 'rgba(255,210,140,0.4)'};">
      <div style="font-size:11px; font-weight:800;">${weapon.slot}</div>
      <div style="font-size:12px; font-weight:700;">${weapon.name}</div>
      <div style="font-size:11px;" class="${weapon.locked ? 'locked' : 'muted'}">${weapon.ammo}</div></div>`;
  }
  weapons.innerHTML = weaponsHtml;
  root.appendChild(weapons);
  hud.weapons = weapons;

  // --- Bottom-right: minimap + health/armour.
  const mapWrap = el('div', 'panel');
  mapWrap.style.cssText = 'position:absolute; right:16px; bottom:16px; padding:10px; text-align:center;';
  const minimap = document.createElement('canvas');
  minimap.width = 170;
  minimap.height = 170;
  minimap.style.cssText = 'display:block; border-radius:50%; border:2px solid rgba(255,210,140,0.5);';
  mapWrap.appendChild(minimap);
  const vitals = el('div');
  vitals.style.cssText = 'margin-top:8px; text-align:left;';
  vitals.innerHTML = `<div style="font-size:12px; font-weight:700;">HEALTH ${GAME.health} <span style="float:right;">ARMOUR ${GAME.armour}</span></div>
    <div class="bar" style="margin-top:3px;"><div style="width:${GAME.health}%; background:#7ee787;"></div></div>
    <div class="bar" style="margin-top:3px;"><div style="width:${GAME.armour}%; background:#6fb7e8;"></div></div>
    <div style="font-size:11px; margin-top:5px;" class="muted">${GAME.speedKmh} KM/H · ${GAME.carName} · CONDITION ${GAME.carCondition}%</div>`;
  mapWrap.appendChild(vitals);
  root.appendChild(mapWrap);
  hud.mapWrap = mapWrap;
  hud.minimap = minimap;

  // --- Bottom-centre: dialogue, radio, controls.
  const bottom = el('div');
  bottom.style.cssText = 'position:absolute; left:50%; bottom:14px; transform:translateX(-50%); text-align:center; width:640px;';
  bottom.innerHTML = `<div id="hud-dialogue" class="panel" style="display:inline-block; padding:7px 12px; font-size:13px;"><b class="gold">${DIALOGUE.cover.who}</b> <span>“${DIALOGUE.cover.text}”</span></div>
    <div style="font-size:12px; margin-top:6px;" class="muted">♪ ${RADIO[0].station} — ${RADIO[0].line}</div>
    <div style="font-size:12px; margin-top:3px;"><span class="key">W A S D</span> DRIVE &nbsp; <span class="key">SPACE</span> HANDBRAKE &nbsp; <span class="key">P</span> PAUSE &nbsp; <span class="key">M</span> MAP</div>`;
  root.appendChild(bottom);
  hud.bottom = bottom;
  hud.dialogue = bottom.querySelector('#hud-dialogue');

  // --- Objective panel (on-foot shot).
  const objective = el('div', 'panel');
  objective.style.cssText = 'position:absolute; left:50%; top:16px; transform:translateX(-50%); padding:10px 18px; text-align:center; display:none;';
  objective.innerHTML = `<div style="font-size:13px; font-weight:700; letter-spacing:2px;" class="gold">OBJECTIVE — LOSE THE HELI</div>
    <div style="font-size:15px; font-weight:700; margin-top:3px;">Reach the harbour gate before the timer runs out</div>
    <div style="font-size:12px; margin-top:2px;" class="muted">The Long Way Home · DAY 6 · 18:47 · ${fmtTime(GAME.timerSeconds)}</div>`;
  root.appendChild(objective);
  hud.objective = objective;

  // --- Pause menu panel (mission list + stats).
  const pause = el('div', 'panel');
  pause.style.cssText = 'position:absolute; right:16px; top:16px; width:330px; padding:14px; display:none;';
  let pauseHtml = `<div style="font-size:22px; font-weight:800;">PAUSED</div>
    <div style="font-size:13px; font-weight:700;" class="gold">${GAME.missionAct}</div>
    <div style="font-size:12px; margin-top:4px;" class="muted">DAY ${GAME.day} · ${GAME.clock} · $${GAME.money.toLocaleString('en-US')} · ${GAME.rankTitle} ${GAME.rank}/${GAME.rankMax} RP</div>
    <div style="margin-top:10px; border-top:1px solid rgba(255,210,140,0.3); padding-top:8px;">`;
  for (const mission of MISSIONS) {
    const color = mission.state === 'DONE' ? '#7ee787' : mission.state === 'ACTIVE' ? '#f2c94c' : '#8b93a3';
    pauseHtml += `<div style="display:flex; justify-content:space-between; font-size:12px; margin-top:5px;"><span><b>${mission.name}</b> <span class="muted">· ${mission.act}</span></span><b style="color:${color};">${mission.state}</b></div>`;
  }
  pauseHtml += `</div>
    <div style="font-size:12px; margin-top:10px; border-top:1px solid rgba(255,210,140,0.3); padding-top:8px;" class="muted">ACTIVITIES — Harbour races · Docks smuggling · Market Row dead drops · Talk 1210 call-ins</div>
    <div style="font-size:12px; margin-top:8px; text-align:center;">Press <span class="key">P</span> to resume</div>`;
  pause.innerHTML = pauseHtml;
  root.appendChild(pause);
  hud.pause = pause;

  // --- Title screen (lower third).
  const title = el('div');
  title.style.cssText = 'position:absolute; left:0; right:0; bottom:0; height:300px; display:none; background:linear-gradient(to top, rgba(16,10,18,0.88) 0%, rgba(16,10,18,0.55) 55%, rgba(16,10,18,0) 100%); text-align:center;';
  title.innerHTML = `<div style="position:absolute; left:0; right:0; bottom:118px;">
      <div style="font-size:15px; letter-spacing:6px; font-weight:700;" class="gold">A TARNWICK STORY</div>
      <div style="font-size:72px; font-weight:900; line-height:0.95; letter-spacing:2px;">TARNWICK</div>
      <div style="font-size:26px; font-weight:700; letter-spacing:8px;" class="gold">COME HOME</div></div>
    <div style="position:absolute; left:0; right:0; bottom:34px; font-size:16px; line-height:1.9;">
      <div><span class="gold">▸ CONTINUE — THE LONG WAY HOME</span></div>
      <div class="muted">NEW GAME &nbsp;·&nbsp; MISSIONS &nbsp;·&nbsp; SETTINGS</div>
      <div style="font-size:12px;" class="muted">♪ ${RADIO[0].station} — ${RADIO[0].line}</div></div>`;
  root.appendChild(title);
  hud.title = title;

  // District labels for the pause map (positioned by map.js through the camera).
  const labels = el('div');
  labels.style.cssText = 'position:absolute; inset:0; display:none; pointer-events:none;';
  root.appendChild(labels);
  hud.labels = labels;

  hud.state = { money: GAME.money, timer: GAME.timerSeconds };
  drawMinimap(minimap, hud.state);
  return hud;
}

/** Show one HUD mode: 'cover' | 'foot' | 'menu' | 'title'. */
export function setHudMode(hud, mode) {
  const show = (node, on) => { node.style.display = on ? '' : 'none'; };
  show(hud.money, mode === 'cover');
  show(hud.mission, mode === 'cover');
  show(hud.rank, mode === 'cover');
  show(hud.dispatch, mode === 'cover');
  show(hud.crew, mode === 'cover');
  show(hud.weapons, mode === 'cover' || mode === 'foot');
  show(hud.mapWrap, mode === 'cover' || mode === 'foot');
  show(hud.bottom, mode === 'cover');
  show(hud.objective, mode === 'foot');
  show(hud.pause, mode === 'menu');
  show(hud.title, mode === 'title');
  show(hud.labels, mode === 'menu');
  if (mode === 'foot') {
    hud.dialogue.innerHTML = `<b class="gold">${DIALOGUE.foot.who}</b> <span>“${DIALOGUE.foot.text}”</span>`;
    hud.bottom.style.display = '';
    hud.bottom.querySelector('#hud-dialogue').style.display = '';
  }
}
