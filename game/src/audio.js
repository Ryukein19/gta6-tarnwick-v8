// Audio: procedural WebAudio only — no assets, no network. An engine hum that follows
// the speed, a two-tone police siren, a punch thud, and the radio: three stations,
// each with a now-playing line and a tiny melodic loop the oscillator plays.

import { RADIO } from './config.js';

const SONGS = [
  [523, 659, 784, 659, 587, 659, 784, 1047],
  [440, 554, 659, 554, 494, 554, 659, 880],
  [392, 494, 587, 494, 440, 494, 587, 784],
];

export function createAudio() {
  let ctx = null;
  let engine = null;
  let engineGain = null;
  let siren = null;
  let sirenGain = null;
  let radioTimer = 0;
  let note = 0;
  let muted = false;
  let started = false;

  function ensure() {
    if (ctx) return true;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      ctx = new AC();
      engine = ctx.createOscillator();
      engine.type = 'sawtooth';
      engine.frequency.value = 55;
      engineGain = ctx.createGain();
      engineGain.gain.value = 0;
      engine.connect(engineGain);
      engineGain.connect(ctx.destination);
      engine.start();
      siren = ctx.createOscillator();
      siren.type = 'sine';
      siren.frequency.value = 700;
      sirenGain = ctx.createGain();
      sirenGain.gain.value = 0;
      siren.connect(sirenGain);
      sirenGain.connect(ctx.destination);
      siren.start();
      started = true;
      return true;
    } catch {
      return false;
    }
  }

  function tone(freq, dur, type, vol) {
    if (!ctx || muted) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(vol, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + dur);
  }

  return {
    get started() {
      return started;
    },
    get muted() {
      return muted;
    },
    unlock() {
      ensure();
      if (ctx && ctx.state === 'suspended') ctx.resume();
    },
    toggleMute() {
      muted = !muted;
      if (engineGain) engineGain.gain.value = 0;
      if (sirenGain) sirenGain.gain.value = 0;
      return muted;
    },
    /** Called every frame: engine follows speed, siren wails with the wanted level. */
    frame(speed, wanted, radio, dt) {
      if (!ctx || muted) return;
      if (engine) {
        engine.frequency.value = 50 + speed * 0.9;
        engineGain.gain.value = 0.02 + (speed / 142) * 0.03;
      }
      if (siren) {
        const t = ctx.currentTime;
        siren.frequency.setValueAtTime(wanted >= 3 ? 660 + 160 * Math.sin(t * 4) : 0, t);
        sirenGain.gain.value = wanted >= 3 ? 0.015 : 0;
      }
      // The radio plays one note of the station's loop every half second.
      radioTimer += dt;
      if (radioTimer > 0.5) {
        radioTimer = 0;
        const song = SONGS[radio % SONGS.length];
        tone(song[note % song.length], 0.45, 'triangle', 0.05);
        note += 1;
      }
    },
    punch() {
      tone(90, 0.15, 'square', 0.12);
    },
    crash() {
      tone(70, 0.4, 'sawtooth', 0.16);
      tone(50, 0.5, 'square', 0.1);
    },
    pickup() {
      tone(880, 0.12, 'sine', 0.1);
      tone(1320, 0.18, 'sine', 0.08);
    },
    stationName(radio) {
      return RADIO[radio % RADIO.length].freq;
    },
  };
}
