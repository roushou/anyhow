/**
 * Svelte action that tracks element visibility via `IntersectionObserver`.
 *
 * Returns reactive `$state` for `isIntersecting` and the raw observer
 * `entry`, plus the action function to bind to the target element.
 *
 * @param opts.root - The element used as the viewport (defaults to browser viewport).
 * @param opts.rootMargin - Margin around the root (CSS string, e.g. `"100px"`).
 * @param opts.threshold - Visibility ratio to trigger (0–1, or array).
 * @returns An object with `isIntersecting`, `entry` ($state), and `action` to bind.
 *
 * @example
 * ```svelte
 * <script>
 *   import { createIntersectionObserver } from "@anyhow/svelte/actions";
 *   const obs = createIntersectionObserver({ threshold: 0.5 });
 * </script>
 *
 * <div use:obs.action>
 *   {#if obs.isIntersecting}
 *     I'm visible!
 *   {/if}
 * </div>
 * ```
 */
export function createIntersectionObserver(opts?: IntersectionObserverInit) {
  let isIntersecting = $state(false);
  let entry = $state<IntersectionObserverEntry | null>(null);

  function action(node: HTMLElement) {
    const observer = new IntersectionObserver(([e]) => {
      if (e) {
        isIntersecting = e.isIntersecting;
        entry = e;
      }
    }, opts);
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
