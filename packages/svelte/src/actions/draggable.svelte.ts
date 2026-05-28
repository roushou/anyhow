/**
 * Svelte action that tracks pointer-based drag with position deltas.
 *
 * Tracks `pointerdown`, `pointermove`, and `pointerup` to compute drag
 * offsets from the starting position.
 *
 * @returns An object with `x`, `y`, `dragging` ($state) and `action` to bind.
 *
 * @example
 * ```svelte
 * <script>
 *   import { createDraggable } from "@anyhow/svelte/actions";
 *   const drag = createDraggable();
 * </script>
 *
 * <div
 *   use:drag.action
 *   style="transform:translate({drag.x}px,{drag.y}px);cursor:grab"
 *   class:grabbing={drag.dragging}
 * >
 *   Drag me
 * </div>
 * ```
 */
import { listen } from "../listen.js";

export function createDraggable() {
  let x = $state(0);
  let y = $state(0);
  let dragging = $state(false);
  let startX = 0;
  let startY = 0;

  function action(node: HTMLElement) {
    function onPointerDown(e: PointerEvent) {
      dragging = true;
      startX = e.clientX - x;
      startY = e.clientY - y;
      node.setPointerCapture(e.pointerId);
    }

    function onPointerMove(e: PointerEvent) {
      if (!dragging) return;
      x = e.clientX - startX;
      y = e.clientY - startY;
    }

    function onPointerUp() {
      dragging = false;
    }

    const listeners = [
      listen(node, "pointerdown", onPointerDown),
      listen(node, "pointermove", onPointerMove),
      listen(node, "pointerup", onPointerUp),
    ];

    return {
      destroy() {
        for (const l of listeners) l.destroy();
      },
    };
  }

  return {
    get x() {
      return x;
    },
    get y() {
      return y;
    },
    get dragging() {
      return dragging;
    },
    action,
  };
}
