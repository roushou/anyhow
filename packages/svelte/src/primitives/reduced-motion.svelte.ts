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
export function createReducedMotion() {
  let reduced = $state(false);

  $effect(() => {
    if (typeof window === "undefined") return;

    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");

    function update(e?: MediaQueryListEvent) {
      reduced = (e ?? mql).matches;
    }

    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  });

  return {
    /** `true` when the user prefers reduced motion. */
    get reduced() {
      return reduced;
    },
  };
}
