/**
 * Reactive breakpoint matching backed by Svelte 5 `$state`.
 *
 * Given a map of breakpoint names to minimum widths (e.g. `{ sm: 640, md:
 * 768, lg: 1024 }`), returns the name of the largest matching breakpoint.
 * Updates reactively on window resize. SSR-safe.
 *
 * @typeParam T - A record of breakpoint names to minimum pixel widths.
 * @param breakpoints - The breakpoint definitions (sorted automatically).
 * @returns `{ current, above, below }` where `current` is the matching breakpoint
 * name, and `above(name)` / `below(name)` compare against the current breakpoint.
 *
 * @example
 * ```svelte
 * <script>
 *   import { createBreakpoints } from "@anyhow/svelte";
 *   const bp = createBreakpoints({ sm: 640, md: 768, lg: 1024 });
 * </script>
 *
 * {#if bp.current === "sm"}Mobile layout{/if}
 * {#if bp.current === "md"}Tablet layout{/if}
 * {#if bp.current === "lg"}Desktop layout{/if}
 * ```
 */
import { createEventListener } from "./event-listener.svelte.js";

export function createBreakpoints<T extends Record<string, number>>(breakpoints: T) {
  const sorted = Object.entries(breakpoints).sort(([, a], [, b]) => b - a) as [
    keyof T & string,
    number,
  ][];

  let current = $state<keyof T | undefined>(undefined);

  function compute() {
    if (typeof window === "undefined") return;
    const width = window.innerWidth;
    for (const [name, min] of sorted) {
      if (width >= min) {
        current = name;
        return;
      }
    }
    current = undefined;
  }

  $effect(() => {
    compute();
  });
  createEventListener(window, "resize", compute);

  /** Returns `true` if the current breakpoint is larger than `name`. */
  function above(name: keyof T & string): boolean {
    const idx = sorted.findIndex(([n]) => n === name);
    if (idx === -1 || current === undefined) return false;
    return sorted.findIndex(([n]) => n === current) < idx;
  }

  /** Returns `true` if the current breakpoint is smaller than `name`. */
  function below(name: keyof T & string): boolean {
    const idx = sorted.findIndex(([n]) => n === name);
    if (idx === -1 || current === undefined) return false;
    return sorted.findIndex(([n]) => n === current) > idx;
  }

  return {
    /** The name of the largest matching breakpoint. */
    get current() {
      return current;
    },
    above,
    below,
  };
}
