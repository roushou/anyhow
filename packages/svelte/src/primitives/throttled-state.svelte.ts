/**
 * Throttled reactive state backed by Svelte 5 `$state`.
 *
 * Updates to `value` are throttled: the first write commits immediately,
 * and subsequent writes within `waitMs` are dropped.
 *
 * @typeParam T - The type of the state value.
 * @param initial - The initial value.
 * @param waitMs - Throttle window in milliseconds.
 * @returns An object with `value` (throttled writes).
 *
 * @example
 * ```ts
 * import { createThrottledState } from "@anyhow/svelte";
 *
 * const pos = createThrottledState({ x: 0, y: 0 }, 16);
 * // pos.value = { x: 10, y: 20 }  → commits immediately
 * // pos.value = { x: 11, y: 21 }  → ignored (within 16ms)
 * ```
 */
export function createThrottledState<T>(initial: T, waitMs: number) {
  let value = $state(initial);
  let lastCommit = 0;
  let pending: T | undefined;

  return {
    get value() {
      return value;
    },
    set value(v: T) {
      const now = Date.now();
      if (now - lastCommit >= waitMs) {
        lastCommit = now;
        value = v;
        pending = undefined;
      } else {
        pending = v;
      }
    },

    /** Forces any pending throttled value to commit immediately. */
    flush() {
      if (pending !== undefined) {
        value = pending;
        pending = undefined;
        lastCommit = Date.now();
      }
    },
  };
}
