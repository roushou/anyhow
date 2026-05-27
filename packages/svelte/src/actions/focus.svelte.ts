/**
 * Svelte action that tracks focus state on an element.
 *
 * @returns An object with `focused` ($state) and `action` to bind.
 *
 * @example
 * ```svelte
 * <script>
 *   import { createFocus } from "@anyhow/svelte/actions";
 *   const focus = createFocus();
 * </script>
 *
 * <input use:focus.action class:focused={focus.focused} />
 * {#if focus.focused}
 *   <span class="hint">Press Enter to search</span>
 * {/if}
 * ```
 */
export function createFocus() {
  let focused = $state(false);

  function action(node: HTMLElement) {
    function onFocus() {
      focused = true;
    }
    function onBlur() {
      focused = false;
    }

    node.addEventListener("focus", onFocus);
    node.addEventListener("blur", onBlur);

    return {
      destroy() {
        node.removeEventListener("focus", onFocus);
        node.removeEventListener("blur", onBlur);
      },
    };
  }

  return {
    get focused() {
      return focused;
    },
    action,
  };
}
