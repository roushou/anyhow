/**
 * Reactive page visibility backed by Svelte 5 `$state`.
 *
 * Tracks `document.visibilityState`. Returns `visible: true` when the tab
 * is active and `false` when hidden (tab switch, minimize). SSR-safe —
 * defaults to `true`.
 *
 * @returns `{ visible }`.
 *
 * @example
 * ```svelte
 * <script>
 *   import { createVisibility, createInterval } from "@anyhow/svelte";
 *
 *   const vis = createVisibility();
 *   const poll = createInterval(() => fetch("/api/status"), 5000);
 *
 *   $effect(() => {
 *     if (vis.visible) poll.start();
 *     else poll.stop();
 *   });
 * </script>
 * ```
 */
export function createVisibility() {
  let visible = $state(
    typeof document !== "undefined" ? document.visibilityState === "visible" : true,
  );

  $effect(() => {
    if (typeof document === "undefined") return;

    function update() {
      visible = document.visibilityState === "visible";
    }

    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  });

  return {
    /** `true` when the tab is active, `false` when hidden. */
    get visible() {
      return visible;
    },
  };
}
