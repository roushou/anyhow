/**
 * Svelte action that binds keyboard shortcuts to a DOM node.
 *
 * Accepts a map of key combos to handlers. Supports modifiers: `Control`,
 * `Shift`, `Alt`, `Meta`. Combo format: `"Control+s"`, `"Shift+?"`, etc.
 *
 * @param node - The DOM node to listen on.
 * @param shortcuts - A map of key combos to handler functions.
 * @returns An action object with a `destroy` method.
 *
 * @example
 * ```svelte
 * <script>
 *   import { createKeydown } from "@anyhow/svelte/actions";
 *   const shortcuts = {
 *     Escape: () => close(),
 *     "Control+s": () => save(),
 *   };
 * </script>
 *
 * <svelte:window use:createKeydown={shortcuts} />
 * ```
 */
import { listen } from "../listen.js";

export function createKeydown(
  node: HTMLElement,
  shortcuts: Record<string, (e: KeyboardEvent) => void>,
): { destroy: () => void } {
  function onKeydown(e: KeyboardEvent) {
    const parts: string[] = [];
    if (e.ctrlKey) parts.push("Control");
    if (e.shiftKey) parts.push("Shift");
    if (e.altKey) parts.push("Alt");
    if (e.metaKey) parts.push("Meta");
    parts.push(e.key);

    const combo = parts.join("+");
    const handler = shortcuts[combo];
    if (handler) {
      e.preventDefault();
      handler(e);
    }
  }

  return listen(node, "keydown", onKeydown);
}
