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
import { listen } from "../listen.js";

export function createFocus() {
  let focused = $state(false);

  function action(node: HTMLElement) {
    function onFocus() {
      focused = true;
    }
    function onBlur() {
      focused = false;
    }

    const focusListener = listen(node, "focus", onFocus);
    const blurListener = listen(node, "blur", onBlur);

    return {
      destroy() {
        focusListener.destroy();
        blurListener.destroy();
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
