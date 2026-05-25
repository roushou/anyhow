/**
 * Tracks the previous value of a reactive expression via Svelte 5 `$effect`
 * and `$state`.
 *
 * @typeParam T - The type of the tracked value.
 * @param getter - A function returning the current value (typically a `$derived` or `$state` read).
 * @returns A `$state` holding the previous value, or `undefined` on the first run.
 *
 * @example
 * ```ts
 * import { createPrevious } from "@anyhow/svelte";
 *
 * let count = $state(0);
 * const prev = createPrevious(() => count);
 *
 * count = 5;
 * // prev.current  → 0 (the previous value)
 * ```
 */
export function createPrevious<T>(getter: () => T) {
  let current: T | undefined;
  let previous = $state<T | undefined>(undefined);

  $effect(() => {
    previous = current;
    current = getter();
  });

  return {
    /** The previous value (or `undefined` on first run). */
    get current() {
      return previous;
    },
  };
}
