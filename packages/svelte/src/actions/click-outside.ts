/**
 * Svelte action that detects clicks outside a DOM node.
 *
 * The handler is called when a `click` event fires on an element that is
 * **not** inside the bound node. Uses capture-phase listening to catch
 * events before they bubble.
 *
 * @param node - The DOM node to monitor.
 * @param handler - Called with the `MouseEvent` when a click outside is detected.
 * @returns An action object with a `destroy` method for cleanup.
 *
 * @example
 * ```svelte
 * <script>
 *   import { createClickOutside } from "@anyhow/svelte/actions";
 *   let open = $state(false);
 * </script>
 *
 * <button onclick={() => open = !open}>Toggle</button>
 * {#if open}
 *   <div use:clickOutside={() => open = false}>
 *     Dropdown content
 *   </div>
 * {/if}
 * ```
 */
import { listen } from "../listen.js";

export function createClickOutside(
  node: HTMLElement,
  handler: (event: MouseEvent) => void,
): { destroy: () => void } {
  function onClick(event: MouseEvent) {
    if (!node.contains(event.target as Node) && !event.defaultPrevented) {
      handler(event);
    }
  }

  return listen(document, "click", onClick, true);
}
