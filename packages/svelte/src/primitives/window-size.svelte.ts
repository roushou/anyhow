/**
 * Reactive window size backed by Svelte 5 `$state`.
 *
 * Tracks `window.innerWidth` and `window.innerHeight`, updating on resize
 * with auto-cleanup via `$effect`. SSR-safe.
 *
 * @returns `{ width, height }`.
 *
 * @example
 * ```svelte
 * <script>
 *   import { createWindowSize } from "@anyhow/svelte";
 *   const size = createWindowSize();
 * </script>
 *
 * <p>{size.width} × {size.height}</p>
 * ```
 */
export function createWindowSize() {
  let width = $state(typeof window !== "undefined" ? window.innerWidth : 0);
  let height = $state(typeof window !== "undefined" ? window.innerHeight : 0);

  $effect(() => {
    if (typeof window === "undefined") return;

    function update() {
      width = window.innerWidth;
      height = window.innerHeight;
    }

    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  });

  return {
    /** Window width in pixels. */
    get width() {
      return width;
    },
    /** Window height in pixels. */
    get height() {
      return height;
    },
  };
}
