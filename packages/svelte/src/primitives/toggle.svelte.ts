/**
 * A simple boolean toggle backed by Svelte 5 `$state`.
 *
 * @param initial - Initial value (defaults to `false`).
 * @returns An object with reactive `value` and helper methods.
 *
 * @example
 * ```ts
 * import { createToggle } from "@anyhow/svelte";
 *
 * const open = createToggle();
 * // open.value  → false
 * // open.toggle() → true
 * // open.off()   → false
 * ```
 */
export function createToggle(initial = false) {
  let value = $state(initial);

  return {
    /** The current reactive value. */
    get value() {
      return value;
    },
    set value(v: boolean) {
      value = v;
    },

    /** Flips the value. */
    toggle() {
      value = !value;
    },

    /** Sets the value to `true`. */
    on() {
      value = true;
    },

    /** Sets the value to `false`. */
    off() {
      value = false;
    },
  };
}
