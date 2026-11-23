// Sound, kept minimal and safe: short WebAudio bleeps for the siren, the radio blip
// and the pickup chime. Everything is created lazily on first user gesture and guarded,
// so a headless run or a muted tab never throws. M toggles mute.
export function createAudio() {
  let ctx = null;
  let muted = false;

  function ensure() {
    if (ctx !== null) return ctx;
    try {
      const AC = window.AudioContext ?? window.webkitAudioContext;
      ctx = AC ? new AC() : null;
    } catch {
      ctx = null;
    }
    return ctx;
  }

  function blip(freq, seconds, type, gainValue) {
    if (muted) return;
    const ac = ensure();
    if (ac === null) return;
    try {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(gainValue, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + seconds);
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.start();
      osc.stop(ac.currentTime + seconds);
    } catch {
      // Audio is decoration; a failure here must never break the game.
    }
  }

  return {
    siren() { blip(660, 0.28, 'sine', 0.05); },
    chime() { blip(880, 0.18, 'triangle', 0.06); },
    thud() { blip(120, 0.22, 'square', 0.08); },
    toggleMute() { muted = !muted; return muted; },
    isMuted() { return muted; },
  };
}
