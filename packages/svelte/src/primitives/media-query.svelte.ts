/**
 * Reactive media query matcher backed by Svelte 5 `$state`.
 *
 * Automatically cleans up the `matchMedia` listener when the component
 * using it is destroyed.
 *
 * @param query - A CSS media query string (e.g. `"(min-width: 768px)"`).
 * @returns A reactive boolean `$state` that tracks whether the query matches.
 *
 * @example
 * ```ts
 * import { createMediaQuery } from "@anyhow/svelte";
 *
 * const isMobile = createMediaQuery("(max-width: 767px)");
 * // {#if isMobile.current}...{/if}
 * ```
 */
import { listen } from "../listen.js";

export function createMediaQuery(query: string) {
  let matches = $state(false);

  $effect(() => {
    if (typeof window === "undefined") return;

    const mql = window.matchMedia(query);
    matches = mql.matches;
    return listen(mql, "change", (e: MediaQueryListEvent) => {
      matches = e.matches;
    }).destroy;
  });

  return {
    /** Whether the media query currently matches. */
    get current() {
      return matches;
    },
  };
}
