/**
 * Reactive `document.activeElement` backed by Svelte 5 `$state`.
 *
 * Listens to `focusin` events on `document` and updates `element`
 * reactively. Auto-cleanup via `$effect`. SSR-safe.
 *
 * @returns `{ element }` — the currently focused DOM element, or `null`.
 *
 * @example
 * ```svelte
 * <script>
 *   import { createActiveElement } from "@anyhow/svelte";
 *   const focus = createActiveElement();
 * </script>
 *
 * {#if focus.element}
 *   <p>Focused: {focus.element.tagName}</p>
 * {/if}
 * ```
 */
import { createEventListener } from "./event-listener.svelte.js";

export function createActiveElement() {
  let element = $state<Element | null>(
    typeof document !== "undefined" ? document.activeElement : null,
  );

  createEventListener(document, "focusin", () => {
    element = document.activeElement;
  });

  return {
    /** The currently focused DOM element, or `null`. */
    get element() {
      return element;
    },
  };
}
