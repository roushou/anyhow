/**
 * Reactive mouse position backed by Svelte 5 `$state`.
 *
 * Tracks `mousemove` on `window` and exposes page and client coordinates.
 * SSR-safe — defaults to `{ x: 0, y: 0 }` for both coordinate spaces.
 *
 * @returns `{ pageX, pageY, clientX, clientY }` — reactive mouse coordinates.
 *
 * @example
 * ```svelte
 * <script>
 *   import { createMousePosition } from "@anyhow/svelte";
 *   const mouse = createMousePosition();
 * </script>
 *
 * <div
 *   style="position:fixed;left:{mouse.clientX}px;top:{mouse.clientY}px"
 *   class="cursor"
 * ></div>
 * ```
 */
export function createMousePosition() {
  let pageX = $state(0);
  let pageY = $state(0);
  let clientX = $state(0);
  let clientY = $state(0);

  $effect(() => {
    if (typeof window === "undefined") return;

    function update(e: MouseEvent) {
      pageX = e.pageX;
      pageY = e.pageY;
      clientX = e.clientX;
      clientY = e.clientY;
    }

    window.addEventListener("mousemove", update);
    return () => window.removeEventListener("mousemove", update);
  });

  return {
    /** Current mouse X position relative to the page. */
    get pageX() {
      return pageX;
    },
    /** Current mouse Y position relative to the page. */
    get pageY() {
      return pageY;
    },
    /** Current mouse X position relative to the viewport. */
    get clientX() {
      return clientX;
    },
    /** Current mouse Y position relative to the viewport. */
    get clientY() {
      return clientY;
    },
  };
}
