/**
 * Svelte action that detects touch swipe gestures.
 *
 * Tracks `touchstart` and `touchend` to compute swipe direction, distance,
 * and velocity. Fires the `onSwipe` callback when the distance exceeds
 * `threshold`.
 *
 * @param node - The DOM node to listen on.
 * @param opts.threshold - Minimum distance in pixels to trigger a swipe (default: `50`).
 * @param opts.onSwipe - Called with `{ direction, distance, velocity }` on swipe end.
 * @returns An action object with a `destroy` method.
 *
 * @example
 * ```svelte
 * <script>
 *   import { createSwipe } from "@anyhow/svelte/actions";
 * </script>
 *
 * <div use:createSwipe={{
 *   threshold: 50,
 *   onSwipe: ({ direction }) => {
 *     if (direction === "left") next();
 *     if (direction === "right") prev();
 *   }
 * }}>
 * ```
 */
import { listen } from "../listen.js";

export function createSwipe(
  node: HTMLElement,
  opts: {
    threshold?: number;
    onSwipe: (result: {
      direction: "left" | "right" | "up" | "down";
      distance: number;
      velocity: number;
    }) => void;
  },
): { destroy: () => void } {
  const threshold = opts.threshold ?? 50;
  let startX = 0;
  let startY = 0;
  let startTime = 0;

  function onTouchStart(e: TouchEvent) {
    const touch = e.touches[0]!;
    startX = touch.clientX;
    startY = touch.clientY;
    startTime = Date.now();
  }

  function onTouchEnd(e: TouchEvent) {
    const touch = e.changedTouches[0]!;
    const dx = touch.clientX - startX;
    const dy = touch.clientY - startY;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (Math.max(absDx, absDy) < threshold) return;

    const elapsed = (Date.now() - startTime) / 1000;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const velocity = elapsed > 0 ? distance / elapsed : 0;

    let direction: "left" | "right" | "up" | "down";
    if (absDx > absDy) {
      direction = dx > 0 ? "right" : "left";
    } else {
      direction = dy > 0 ? "down" : "up";
    }

    opts.onSwipe({ direction, distance, velocity });
  }

  const startListener = listen(node, "touchstart", onTouchStart, { passive: true });
  const endListener = listen(node, "touchend", onTouchEnd, { passive: true });

  return {
    destroy() {
      startListener.destroy();
      endListener.destroy();
    },
  };
}
