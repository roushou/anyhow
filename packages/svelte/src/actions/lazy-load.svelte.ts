/**
 * Svelte action that triggers a callback when an element enters the viewport.
 *
 * Uses `IntersectionObserver` to detect when the bound element becomes
 * visible. The callback fires once per mount (or every time if `once`
 * is `false`).
 *
 * @param opts.onEnter - Called when the element enters the viewport.
 * @param opts.once - If `true` (default), unobserve after first trigger.
 * @returns An object with `isIntersecting` ($state), `entry`, and `action`.
 *
 * @example
 * ```svelte
 * <script>
 *   import { createLazyLoad } from "@anyhow/svelte/actions";
 *   const lazy = createLazyLoad({ onEnter: () => loadMore() });
 * </script>
 *
 * <div use:lazy.action>
 *   {lazy.isIntersecting ? "Visible!" : "Scroll down..."}
 * </div>
 * ```
 */
export function createLazyLoad(
  opts: {
    onEnter?: () => void;
    once?: boolean;
  } = {},
) {
  let isIntersecting = $state(false);
  let entry = $state<IntersectionObserverEntry | null>(null);
  const once = opts.once ?? true;

  function action(node: HTMLElement) {
    const observer = new IntersectionObserver(([e]) => {
      if (e?.isIntersecting) {
        isIntersecting = true;
        entry = e;
        opts.onEnter?.();
        if (once) observer.unobserve(node);
      } else if (!once) {
        isIntersecting = false;
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
    get isIntersecting() {
      return isIntersecting;
    },
    get entry() {
      return entry;
    },
    action,
  };
}
