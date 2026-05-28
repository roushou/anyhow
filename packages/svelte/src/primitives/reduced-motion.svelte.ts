/**
 * Reactive reduced-motion preference backed by Svelte 5 `$state`.
 *
 * Tracks the `prefers-reduced-motion` media query and returns `true` when
 * the user has requested reduced motion at the OS level. SSR-safe — defaults
 * to `false`.
 *
 * @returns `{ reduced }` — `true` when reduced motion is preferred.
 *
 * @example
 * ```svelte
 * <script>
 *   import { createReducedMotion } from "@anyhow/svelte";
 *   const motion = createReducedMotion();
 * </script>
 *
 * {#if motion.reduced}
 *   <p>Animations disabled per your system preferences.</p>
 * {:else}
 *   <div class="animated-banner" />
 * {/if}
 * ```
 */
import { listen } from "../listen.js";

export function createReducedMotion() {
  let reduced = $state(false);

  $effect(() => {
    if (typeof window === "undefined") return;

    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    reduced = mql.matches;
    return listen(mql, "change", () => {
      reduced = mql.matches;
    }).destroy;
  });

  return {
    /** `true` when the user prefers reduced motion. */
    get reduced() {
      return reduced;
    },
  };
}
