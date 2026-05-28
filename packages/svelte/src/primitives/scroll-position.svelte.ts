/**
 * Reactive scroll position backed by Svelte 5 `$state`.
 *
 * Tracks `window.scrollX` / `window.scrollY` and an `isScrolling` flag that
 * stays `true` while the user is actively scrolling (debounced with a 150ms
 * quiet period). SSR-safe.
 *
 * @returns `{ x, y, direction, isScrolling }`.
 *
 * @example
 * ```svelte
 * <script>
 *   import { createScrollPosition } from "@anyhow/svelte";
 *   const scroll = createScrollPosition();
 * </script>
 *
 * <button class:visible={scroll.y > 300} onclick={() => window.scrollTo(0, 0)}>
 *   Back to top
 * </button>
 * ```
 */
import { listen } from "../listen.js";

export function createScrollPosition() {
  let x = $state(0);
  let y = $state(0);
  let isScrolling = $state(false);
  let direction = $state<"up" | "down" | undefined>(undefined);

  $effect(() => {
    if (typeof window === "undefined") return;

    let timer: ReturnType<typeof setTimeout>;

    function onScroll() {
      const prevY = y;
      x = window.scrollX;
      y = window.scrollY;
      direction = y > prevY ? "down" : y < prevY ? "up" : undefined;
      isScrolling = true;
      clearTimeout(timer);
      timer = setTimeout(() => {
        isScrolling = false;
      }, 150);
    }

    const scrollListener = listen(window, "scroll", onScroll, { passive: true });
    // Capture initial position without triggering isScrolling
    x = window.scrollX;
    y = window.scrollY;
    return () => {
      scrollListener.destroy();
      clearTimeout(timer);
    };
  });

  return {
    /** Horizontal scroll offset in pixels. */
    get x() {
      return x;
    },
    /** Vertical scroll offset in pixels. */
    get y() {
      return y;
    },
    /** `true` while the user is actively scrolling. */
    get isScrolling() {
      return isScrolling;
    },
    /** Current scroll direction: `"up"`, `"down"`, or `undefined` at rest. */
    get direction() {
      return direction;
    },
  };
}
