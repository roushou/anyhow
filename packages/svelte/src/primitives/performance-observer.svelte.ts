/**
 * Reactive PerformanceObserver wrapper backed by Svelte 5 `$state`.
 *
 * Observes performance metrics (LCP, FCP, CLS, INP, etc.) via the
 * PerformanceObserver API and exposes the latest entries reactively.
 * Auto-cleanup via `$effect`. SSR-safe.
 *
 * @param opts.type - The performance entry type to observe (e.g. `"largest-contentful-paint"`).
 * @param opts.buffered - Use buffered entries (default: `true`).
 * @returns `{ entries, isSupported }`.
 *
 * @example
 * ```svelte
 * <script>
 *   import { createPerformanceObserver } from "@anyhow/svelte";
 *
 *   const lcp = createPerformanceObserver({ type: "largest-contentful-paint" });
 * </script>
 *
 * {#if lcp.entries.length > 0}
 *   <p>LCP: {lcp.entries[0].startTime.toFixed(0)}ms</p>
 * {/if}
 * ```
 */
export function createPerformanceObserver(opts: { type: string; buffered?: boolean }) {
  let entries = $state<PerformanceEntry[]>([]);
  const isSupported = typeof window !== "undefined" && "PerformanceObserver" in window;

  $effect(() => {
    if (!isSupported) return;

    try {
      const observer = new PerformanceObserver((list) => {
        entries = list.getEntries();
      });

      observer.observe({ type: opts.type, buffered: opts.buffered ?? true });

      return () => observer.disconnect();
    } catch {
      // Some entry types are not supported in all browsers
    }
  });

  return {
    /** The latest performance entries of the observed type. */
    get entries() {
      return entries;
    },
    /** Whether the PerformanceObserver API is supported. */
    get isSupported() {
      return isSupported;
    },
  };
}
