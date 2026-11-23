// Audio: no assets, no network — a tiny WebAudio synth for engine hum, sirens and UI
// clicks, plus the three radio stations (names + shows only; the "music" is a soft synth
// pad per station). Everything is optional: if AudioContext is unavailable the game is
// simply silent.

import { RADIO } from './config.js';

let audioCtx = null;
let muted = false;
let currentStation = 0;

function ensureCtx() {
  if (audioCtx) return audioCtx;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
  } catch {
    return null;
  }
  return audioCtx;
}

/** A short blip: used for UI clicks and pickups. */
export function blip(freq = 660, seconds = 0.08) {
  if (muted) return;
  const ctx = ensureCtx();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = freq;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + seconds);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + seconds);
  } catch {
    // Audio is best-effort; a failure never breaks the game.
  }
}

/** The two-tone police siren, quiet, for the chase. */
export function siren() {
  if (muted) return;
  const ctx = ensureCtx();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(620, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(880, ctx.currentTime + 0.5);
    osc.frequency.linearRampToValueAtTime(620, ctx.currentTime + 1.0);
    gain.gain.setValueAtTime(0.03, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.0);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 1.0);
  } catch {
    // Best-effort.
  }
}

export function toggleMute() {
  muted = !muted;
  return muted;
}

export function isMuted() {
  return muted;
}

/** Switch radio station (1, 2 or 3); returns the station now playing. */
export function setStation(index) {
  currentStation = ((index % RADIO.length) + RADIO.length) % RADIO.length;
  blip(520 + currentStation * 80, 0.12);
  return RADIO[currentStation];
}

export function currentRadio() {
  return RADIO[currentStation];
}
