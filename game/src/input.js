// Keyboard and pointer input. Held keys give a steering direction; one-shot presses
// (start or restart, pause, abilities, radio) are queued as bit flags and taken once
// by the loop, so a press between two frames is never lost and never counted twice.

export const ACTION_CONFIRM = 1;
export const ACTION_PAUSE = 2;
export const ACTION_ABILITY_1 = 4;
export const ACTION_ABILITY_2 = 8;
export const ACTION_ABILITY_3 = 16;
export const ACTION_RADIO = 32;
export const ACTION_EXIT = 64;

const LEFT = new Set(['ArrowLeft', 'KeyA']);
const RIGHT = new Set(['ArrowRight', 'KeyD']);
const UP = new Set(['ArrowUp', 'KeyW']);
const DOWN = new Set(['ArrowDown', 'KeyS']);
const CONFIRM = new Set(['Space', 'Enter']);
const PAUSE = new Set(['KeyP', 'Escape']);
const ABILITY_1 = new Set(['KeyZ']);
const ABILITY_2 = new Set(['KeyX']);
const ABILITY_3 = new Set(['KeyC']);
const RADIO = new Set(['KeyR']);
const EXIT = new Set(['KeyE']);

export function createInput(target) {
  let left = false;
  let right = false;
  let up = false;
  let down = false;
  let actions = 0;

  window.addEventListener('keydown', (event) => {
    if (LEFT.has(event.code)) left = true;
    else if (RIGHT.has(event.code)) right = true;
    else if (UP.has(event.code)) up = true;
    else if (DOWN.has(event.code)) down = true;
    else if (CONFIRM.has(event.code)) {
      if (!event.repeat) actions |= ACTION_CONFIRM;
    } else if (PAUSE.has(event.code)) {
      if (!event.repeat) actions |= ACTION_PAUSE;
    } else if (ABILITY_1.has(event.code)) {
      if (!event.repeat) actions |= ACTION_ABILITY_1;
    } else if (ABILITY_2.has(event.code)) {
      if (!event.repeat) actions |= ACTION_ABILITY_2;
    } else if (ABILITY_3.has(event.code)) {
      if (!event.repeat) actions |= ACTION_ABILITY_3;
    } else if (RADIO.has(event.code)) {
      if (!event.repeat) actions |= ACTION_RADIO;
    } else if (EXIT.has(event.code)) {
      if (!event.repeat) actions |= ACTION_EXIT;
    } else return;
    event.preventDefault();
  });
  window.addEventListener('keyup', (event) => {
    if (LEFT.has(event.code)) left = false;
    else if (RIGHT.has(event.code)) right = false;
    else if (UP.has(event.code)) up = false;
    else if (DOWN.has(event.code)) down = false;
  });
  // A key released while the tab is hidden never sends keyup: let go on blur.
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
    /** 1 when the player holds the accelerator, 0 otherwise. */
    throttle() {
      return up ? 1 : 0.6;
    },
    /** True while the brake key is held. */
    brake() {
      return down;
    },
    /** The one-shot presses since the last call, as ACTION_* flags. */
    takeActions() {
      const taken = actions;
      actions = 0;
      return taken;
    },
  };
}
