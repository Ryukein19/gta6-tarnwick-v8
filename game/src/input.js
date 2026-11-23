// Keyboard and pointer input. Held keys give a steering direction and a throttle; one-shot
// presses (start, pause, handbrake, punch, radio, mute, weapon slots) are queued as bit
// flags and taken once by the loop, so a press between two frames is never lost and never
// counted twice. WASD drives and walks, E enters or steals a car, Space is the handbrake,
// 1-5 switch weapons, F punches, Click shoots, M mutes, R changes the radio, Esc pauses.

export const ACTION_CONFIRM = 1;
export const ACTION_PAUSE = 2;
export const ACTION_HANDBRAKE = 4;
export const ACTION_PUNCH = 8;
export const ACTION_RADIO = 16;
export const ACTION_MUTE = 32;

const LEFT = new Set(['ArrowLeft', 'KeyA']);
const RIGHT = new Set(['ArrowRight', 'KeyD']);
const UP = new Set(['ArrowUp', 'KeyW']);
const DOWN = new Set(['ArrowDown', 'KeyS']);
const CONFIRM = new Set(['Space', 'Enter']);
const PAUSE = new Set(['Escape', 'KeyP']);
const WEAPONS = new Set(['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5']);

export function createInput(target) {
  let left = false;
  let right = false;
  let up = false;
  let down = false;
  let actions = 0;
  let weapon = 1;

  window.addEventListener('keydown', (event) => {
    if (LEFT.has(event.code)) left = true;
    else if (RIGHT.has(event.code)) right = true;
    else if (UP.has(event.code)) up = true;
    else if (DOWN.has(event.code)) down = true;
    else if (CONFIRM.has(event.code)) {
      if (!event.repeat) actions |= ACTION_CONFIRM;
    } else if (PAUSE.has(event.code)) {
      if (!event.repeat) actions |= ACTION_PAUSE;
    } else if (event.code === 'Space') {
      if (!event.repeat) actions |= ACTION_HANDBRAKE;
    } else if (event.code === 'KeyF') {
      if (!event.repeat) actions |= ACTION_PUNCH;
    } else if (event.code === 'KeyR') {
      if (!event.repeat) actions |= ACTION_RADIO;
    } else if (event.code === 'KeyM') {
      if (!event.repeat) actions |= ACTION_MUTE;
    } else if (WEAPONS.has(event.code)) {
      weapon = Number(event.code.slice(-1));
    } else return;
    event.preventDefault();
  });
  window.addEventListener('keyup', (event) => {
    if (LEFT.has(event.code)) left = false;
    else if (RIGHT.has(event.code)) right = false;
    else if (UP.has(event.code)) up = false;
    else if (DOWN.has(event.code)) down = false;
  });
  // A key released while the tab is hidden never sends keyup: let go of everything on blur.
  window.addEventListener('blur', () => {
    left = false;
    right = false;
    up = false;
    down = false;
  });
  target.addEventListener('pointerdown', () => {
    actions |= ACTION_CONFIRM;
  });

  return {
    /** -1 for left, 1 for right, 0 for neither or both. */
    direction() {
      return (right ? 1 : 0) - (left ? 1 : 0);
    },
    /** 1 when the throttle is held, 0 otherwise. */
    throttle() {
      return up || down ? 1 : 0;
    },
    /** The selected weapon slot (1–5). */
    weapon() {
      return weapon;
    },
    /** The one-shot presses since the last call, as ACTION_* flags. */
    takeActions() {
      const taken = actions;
      actions = 0;
      return taken;
    },
  };
}
