/**
 * Cycles through an array of values backed by Svelte 5 `$state`.
 *
 * @typeParam T - The type of values in the cycle.
 * @param values - The array of values to cycle through (must have at least one element).
 * @param startIndex - Optional starting index (defaults to `0`).
 * @returns An object with reactive `value` and navigation helpers.
 *
 * @example
 * ```ts
 * import { createCycle } from "@anyhow/svelte";
 *
 * const theme = createCycle(["light", "dark", "system"]);
 * // theme.value  → "light"
 * // theme.next()  → "dark"
 * // theme.prev()  → "light"
 * ```
 */
export function createCycle<T>(values: T[], startIndex = 0) {
  if (values.length === 0) {
    throw new Error("createCycle: values array must have at least one element");
  }

  let index = $state(startIndex % values.length);

  return {
    /** The current value from the cycle. */
    get value(): T {
      return values[index]!;
    },

    /** Moves to the next value (wraps around). */
    next() {
      index = (index + 1) % values.length;
    },

    /** Moves to the previous value (wraps around). */
    prev() {
      index = (index - 1 + values.length) % values.length;
    },

    /** Resets to the initial value. */
    reset() {
      index = startIndex % values.length;
    },
  };
}
