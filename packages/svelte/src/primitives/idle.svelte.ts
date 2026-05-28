/**
 * User idle detection backed by Svelte 5 `$state`.
 *
 * Monitors pointer move, keydown, and scroll events. Sets `idle` to `true`
 * after `ms` of inactivity. Resets on any monitored event. SSR-safe.
 *
 * @param ms - Idle timeout in milliseconds.
 * @returns `{ idle }`.
 *
 * @example
 * ```svelte
 * <script>
 *   import { createIdle } from "@anyhow/svelte";
 *   const idle = createIdle(60_000);
 * </script>
 *
 * {#if idle.idle}
 *   <p>You've been inactive for a while.</p>
 * {/if}
 * ```
 */
import { listen } from "../listen.js";

export function createIdle(ms: number) {
  let idle = $state(false);

  $effect(() => {
    if (typeof window === "undefined") return;

    let timer: ReturnType<typeof setTimeout>;

    function reset() {
      idle = false;
      clearTimeout(timer);
      timer = setTimeout(() => {
        idle = true;
      }, ms);
    }

    const listeners = [
      listen(window, "pointermove", reset, { passive: true }),
      listen(window, "keydown", reset, { passive: true }),
      listen(window, "scroll", reset, { passive: true }),
    ];
    reset();

    return () => {
      clearTimeout(timer);
      for (const l of listeners) l.destroy();
    };
  });

  return {
    /** `true` when the user has been inactive for the specified duration. */
    get idle() {
      return idle;
    },
  };
}
