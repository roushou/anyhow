/**
 * Svelte action that dismisses an element on Escape key and/or click outside.
 *
 * Composes the two most common dismissal patterns into a single action.
 * Both are enabled by default; disable either via `escape: false` or
 * `outside: false`.
 *
 * @param node - The DOM node to dismiss.
 * @param opts.handler - Called when dismissal is triggered.
 * @param opts.escape - Enable Escape key dismissal (default: `true`).
 * @param opts.outside - Enable click-outside dismissal (default: `true`).
 * @returns An action object with a `destroy` method for cleanup.
 *
 * @example
 * ```svelte
 * <script>
 *   import { createDismissible } from "@anyhow/svelte/actions";
 *   let open = $state(false);
 * </script>
 *
 * <button onclick={() => open = true}>Open</button>
 *
 * {#if open}
 *   <div
 *     use:createDismissible={{ handler: () => (open = false) }}
 *     role="dialog"
 *   >
 *     Modal content
 *   </div>
 * {/if}
 * ```
 */
import { listen } from "../listen.js";

export function createDismissible(
  node: HTMLElement,
  opts: {
    handler: () => void;
    escape?: boolean;
    outside?: boolean;
  },
): { destroy(): void } {
  const enableEscape = opts.escape !== false;
  const enableOutside = opts.outside !== false;
  const listeners: { destroy(): void }[] = [];

  if (enableEscape) {
    listeners.push(
      listen(node, "keydown", (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          opts.handler();
        }
      }),
    );
  }

  if (enableOutside) {
    // Use mousedown + setTimeout so the click that opened the element
    // doesn't immediately close it (common gotcha).
    let ignoreNext = false;

    function onPointerDown(e: PointerEvent) {
      const target = e.target as Node;
      if (node.contains(target) || !document.contains(target)) return;
      // Defer to the next microtask so that Svelte event handlers
      // (e.g. button onclick opening the element) run first.
      ignoreNext = false;
      queueMicrotask(() => {
        if (!ignoreNext) {
          opts.handler();
        }
      });
    }

    function onCaptureClick() {
      // If a click inside the node reached the document capture phase,
      // the element was opened by this click — suppress dismissal.
      ignoreNext = true;
    }

    listeners.push(listen(document, "pointerdown", onPointerDown, true));
    listeners.push(listen(node, "click", onCaptureClick, true));
  }

  return {
    destroy() {
      for (const l of listeners) l.destroy();
    },
  };
}
