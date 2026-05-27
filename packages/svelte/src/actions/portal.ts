/**
 * Svelte action that moves an element's DOM position to another container.
 *
 * Appends the bound node to `target` (defaults to `document.body`) on mount
 * and returns it to its original position on destroy. Preserves Svelte's
 * reactivity and event handling.
 *
 * @param target - The container to move the element into (default: `document.body`).
 * @returns An object with the `action` to bind and the current `target` element.
 *
 * @example
 * ```svelte
 * <script>
 *   import { createPortal } from "@anyhow/svelte/actions";
 *   const portal = createPortal();
 * </script>
 *
 * {#if open}
 *   <div use:portal.action class="modal-overlay">
 *     <div class="modal">I'm in document.body</div>
 *   </div>
 * {/if}
 * ```
 */
export function createPortal(target?: HTMLElement) {
  const destination = target ?? (typeof document !== "undefined" ? document.body : null);

  function action(node: HTMLElement) {
    if (!destination) return { destroy() {} };

    const parent = node.parentNode;
    const nextSibling = node.nextSibling;

    destination.appendChild(node);

    return {
      destroy() {
        if (parent) {
          if (nextSibling) {
            parent.insertBefore(node, nextSibling);
          } else {
            parent.appendChild(node);
          }
        }
      },
    };
  }

  return {
    get target() {
      return destination;
    },
    action,
  };
}
