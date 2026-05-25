/**
 * Debounced reactive state backed by Svelte 5 `$state`.
 *
 * Updates to `value` are debounced by `waitMs`. Rapid changes only commit
 * the last value after the quiet period elapses.
 *
 * @typeParam T - The type of the state value.
 * @param initial - The initial value.
 * @param waitMs - Debounce delay in milliseconds.
 * @returns An object with `value` (set immediately, reads debounced) and `flush`.
 *
 * @example
 * ```ts
 * import { createDebouncedState } from "@anyhow/svelte";
 *
 * const query = createDebouncedState("", 300);
 * // query.value = "foo"   → sets immediately, but reads the debounced value
 * // query.flush()         → forces the pending value through
 * ```
 */
export function createDebouncedState<T>(initial: T, waitMs: number) {
  let value = $state(initial);
  let pending: T | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;

  function flush() {
    if (timer !== undefined) {
      clearTimeout(timer);
      timer = undefined;
      if (pending !== undefined) {
        value = pending;
        pending = undefined;
      }
    }
  }

  return {
    get value() {
      return value;
    },
    set value(v: T) {
      pending = v;
      if (timer !== undefined) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        timer = undefined;
        value = pending!;
        pending = undefined;
      }, waitMs);
    },

    /** Immediately commits any pending debounced value. */
    flush,
  };
}
