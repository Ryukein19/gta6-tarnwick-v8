// Sound, kept small: a WebAudio engine hum and radio blips, all behind a
// guarded start (browsers need a gesture; headless shots run silent).

let ctx = null;
let engineOsc = null;
let engineGain = null;
let muted = false;

function ensure() {
  if (ctx) return ctx;
  try {
    const AC = window.AudioContext ?? window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    engineGain = ctx.createGain();
    engineGain.gain.value = 0;
    engineGain.connect(ctx.destination);
    engineOsc = ctx.createOscillator();
    engineOsc.type = 'sawtooth';
    engineOsc.frequency.value = 55;
    engineOsc.connect(engineGain);
    engineOsc.start();
  } catch {
    ctx = null;
  }
  return ctx;
}

/** Start audio (call on first user gesture). */
export function startAudio() {
  const c = ensure();
  if (c && c.state === 'suspended') c.resume().catch(() => {});
}

/** Engine hum follows speed: 0 (idle) .. 1 (flat out). */
export function setEngine(level) {
  if (!ctx || muted || !engineOsc || !engineGain) return;
  engineOsc.frequency.value = 55 + level * 90;
  engineGain.gain.value = 0.02 + level * 0.03;
}

/** One short blip (pickup, UI confirm). */
export function blip(freq = 660) {
  if (!ctx || muted) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.13);
  } catch {
    // Silent is fine.
  }
}

export function toggleMute() {
  muted = !muted;
  if (engineGain) engineGain.gain.value = 0;
  return muted;
}
