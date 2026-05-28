/**
 * Svelte action that tracks hover state on an element.
 *
 * @returns An object with `isHovering` ($state) and `action` to bind.
 *
 * @example
 * ```svelte
 * <script>
 *   import { createHover } from "@anyhow/svelte/actions";
 *   const hover = createHover();
 * </script>
 *
 * <div use:hover.action class:hovered={hover.isHovering}>
 *   {hover.isHovering ? "👋" : "Hover me"}
 * </div>
 * ```
 */
import { listen } from "../listen.js";

export function createHover() {
  let isHovering = $state(false);

  function action(node: HTMLElement) {
    function onEnter() {
      isHovering = true;
    }
    function onLeave() {
      isHovering = false;
    }

    const enterListener = listen(node, "mouseenter", onEnter);
    const leaveListener = listen(node, "mouseleave", onLeave);

    return {
      destroy() {
        enterListener.destroy();
        leaveListener.destroy();
      },
    };
  }

  return {
    get isHovering() {
      return isHovering;
    },
    action,
  };
}
