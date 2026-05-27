/**
 * Svelte action that auto-focuses an element on mount.
 *
 * @param node - The element to focus.
 * @returns An action object with a `destroy` method.
 *
 * @example
 * ```svelte
 * <script>
 *   import { createAutoFocus } from "@anyhow/svelte/actions";
 * </script>
 *
 * <input use:createAutoFocus placeholder="Search..." />
 * ```
 */
export function createAutoFocus(node: HTMLElement): { destroy: () => void } {
  node.focus();

  return {
    destroy() {},
  };
}
