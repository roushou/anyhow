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
export function createHover() {
  let isHovering = $state(false);

  function action(node: HTMLElement) {
    function onEnter() {
      isHovering = true;
    }
    function onLeave() {
      isHovering = false;
    }

    node.addEventListener("mouseenter", onEnter);
    node.addEventListener("mouseleave", onLeave);

    return {
      destroy() {
        node.removeEventListener("mouseenter", onEnter);
        node.removeEventListener("mouseleave", onLeave);
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
