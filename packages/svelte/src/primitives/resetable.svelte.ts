/**
 * Resettable state backed by Svelte 5 `$state`.
 *
 * Remembers the initial value so you can call `reset()` at any time.
 *
 * @typeParam T - The type of the state value.
 * @param initial - The initial value.
 * @returns An object with reactive `value` and a `reset` method.
 *
 * @example
 * ```ts
 * import { createResetable } from "@anyhow/svelte";
 *
 * const name = createResetable("Alice");
 * // name.value  → "Alice"
 * // name.value = "Bob"
 * // name.reset() → "Alice"
 * ```
 */
export function createResetable<T>(initial: T) {
  let value = $state(initial);

  return {
    get value() {
      return value;
    },
    set value(v: T) {
      value = v;
    },

    /** Resets `value` back to the initial value. */
    reset() {
      value = initial;
    },
  };
}
