/**
 * Svelte action that detects long-press / long-click interactions.
 *
 * Fires `handler` when the user presses and holds on the bound element for
 * at least `duration` milliseconds without moving the pointer. Uses
 * `pointerdown` / `pointerup` for cross-input (mouse + touch) support.
 *
 * @param node - The DOM node to monitor.
 * @param duration - Hold duration in milliseconds before the handler fires.
 * @param handler - Called when a long-press is detected.
 * @returns An action object with a `destroy` method for cleanup.
 *
 * @example
 * ```svelte
 * <script>
 *   import { createLongPress } from "@anyhow/svelte/actions";
 *   let message = $state("");
 * </script>
 *
 * <button use:longPress={{ duration: 800, handler: () => (message = "Long pressed!") }}>
 *   Hold me
 * </button>
 * ```
 */
export function createLongPress(
  node: HTMLElement,
  opts: { duration: number; handler: () => void },
): { destroy: () => void } {
  let timer: ReturnType<typeof setTimeout> | undefined;

  function onPointerDown(_e: PointerEvent) {
    timer = setTimeout(() => {
      opts.handler();
    }, opts.duration);
  }

  function onPointerUp() {
    if (timer !== undefined) {
      clearTimeout(timer);
      timer = undefined;
    }
  }

  node.addEventListener("pointerdown", onPointerDown);
  node.addEventListener("pointerup", onPointerUp);
  node.addEventListener("pointercancel", onPointerUp);

  return {
    destroy() {
      node.removeEventListener("pointerdown", onPointerDown);
      node.removeEventListener("pointerup", onPointerUp);
      node.removeEventListener("pointercancel", onPointerUp);
      onPointerUp();
    },
  };
}
