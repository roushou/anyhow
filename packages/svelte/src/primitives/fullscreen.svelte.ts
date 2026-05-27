/**
 * Reactive Fullscreen API wrapper backed by Svelte 5 `$state`.
 *
 * Tracks whether the document (or a specific element) is in fullscreen mode
 * and provides `enter`, `exit`, and `toggle` methods. SSR-safe.
 *
 * @returns `{ isFullscreen, enter, exit, toggle }`.
 *
 * @example
 * ```svelte
 * <script>
 *   import { createFullscreen } from "@anyhow/svelte";
 *   const fs = createFullscreen();
 * </script>
 *
 * <button onclick={() => fs.toggle()}>
 *   {fs.isFullscreen ? "Exit" : "Enter"} Fullscreen
 * </button>
 * ```
 */
export function createFullscreen() {
  let isFullscreen = $state(false);

  $effect(() => {
    if (typeof document === "undefined") return;

    function update() {
      isFullscreen = !!document.fullscreenElement;
    }

    document.addEventListener("fullscreenchange", update);
    return () => document.removeEventListener("fullscreenchange", update);
  });

  return {
    /** Whether the document is currently in fullscreen mode. */
    get isFullscreen() {
      return isFullscreen;
    },
    /** Requests fullscreen on the given element (defaults to `document.documentElement`). */
    async enter(el?: HTMLElement) {
      const target = el ?? document.documentElement;
      try {
        await target.requestFullscreen();
      } catch {
        // Fullscreen may be denied (e.g., not triggered by user gesture).
      }
    },
    /** Exits fullscreen mode. */
    async exit() {
      try {
        await document.exitFullscreen();
      } catch {
        // Already not in fullscreen or not supported.
      }
    },
    /** Toggles fullscreen on `document.documentElement`. */
    async toggle() {
      if (isFullscreen) {
        await this.exit();
      } else {
        await this.enter();
      }
    },
  };
}
