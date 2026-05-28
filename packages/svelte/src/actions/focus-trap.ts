/**
 * Svelte action that traps keyboard focus within a DOM node.
 *
 * On mount, finds all focusable elements inside the node and ensures Tab
 * and Shift+Tab wrap within the container. Optionally restores focus to the
 * previously focused element on destroy.
 *
 * @param node - The DOM node to trap focus within.
 * @returns An action object with a `destroy` method.
 *
 * @example
 * ```svelte
 * <script>
 *   import { createFocusTrap } from "@anyhow/svelte/actions";
 *   let open = $state(false);
 * </script>
 *
 * {#if open}
 *   <div use:createFocusTrap role="dialog" aria-modal="true">
 *     <button onclick={() => open = false}>Close</button>
 *     <input placeholder="Email" />
 *   </div>
 * {/if}
 * ```
 */
import { listen } from "../listen.js";

export function createFocusTrap(node: HTMLElement): { destroy: () => void } {
  const previous = document.activeElement;

  function getFocusable(): HTMLElement[] {
    const selectors = [
      "a[href]",
      "button:not([disabled])",
      "input:not([disabled]):not([type=hidden])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      "[tabindex]:not([tabindex='-1'])",
    ];
    return Array.from(node.querySelectorAll(selectors.join(",")));
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key !== "Tab") return;
    const focusable = getFocusable();
    if (focusable.length === 0) return;

    const first = focusable[0]!;
    const last = focusable[focusable.length - 1]!;

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  // Focus the first focusable element (or the node itself)
  const focusable = getFocusable();
  if (focusable.length > 0) {
    focusable[0]!.focus();
  } else {
    node.setAttribute("tabindex", "-1");
    node.focus();
  }

  const keyListener = listen(node, "keydown", onKeydown);

  return {
    destroy() {
      keyListener.destroy();
      if (previous instanceof HTMLElement) previous.focus();
    },
  };
}
