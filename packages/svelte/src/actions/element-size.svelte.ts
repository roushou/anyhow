/**
 * Svelte action that tracks an element's dimensions via `ResizeObserver`.
 *
 * Returns reactive `$state` for `width` and `height`, plus the action
 * function to bind to the target element. The observer is automatically
 * disconnected when the element is removed.
 *
 * @returns An object with `width`, `height` ($state), and the `action` to bind.
 *
 * @example
 * ```svelte
 * <script>
 *   import { createElementSize } from "@anyhow/svelte/actions";
 *   const size = createElementSize();
 * </script>
 *
 * <div use:size.action>
 *   {size.width} × {size.height}
 * </div>
 * ```
 */
export function createElementSize() {
  let width = $state(0);
  let height = $state(0);

  function action(node: HTMLElement) {
    const observer = new ResizeObserver(([entry]) => {
      if (entry) {
        width = entry.contentRect.width;
        height = entry.contentRect.height;
      }
    });
    observer.observe(node);

    return {
      destroy() {
        observer.disconnect();
      },
    };
  }

  return {
    get width() {
      return width;
    },
    get height() {
      return height;
    },
    action,
  };
}
