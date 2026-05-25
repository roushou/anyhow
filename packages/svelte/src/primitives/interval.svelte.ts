/**
 * Managed `setInterval` with auto-cleanup via Svelte 5 `$effect`.
 *
 * The interval runs while `running` is `true` (the default). Call `stop()`
 * to pause and `start()` to resume. The timer is automatically cleared when
 * the component is destroyed.
 *
 * @param fn - The callback to invoke on each interval tick.
 * @param ms - Interval duration in milliseconds.
 * @returns `{ running, start, stop }`.
 *
 * @example
 * ```svelte
 * <script>
 *   import { createInterval } from "@anyhow/svelte";
 *
 *   const poll = createInterval(async () => {
 *     await fetch("/api/status");
 *   }, 5000);
 * </script>
 *
 * <button onclick={poll.stop}>Pause</button>
 * <button onclick={poll.start}>Resume</button>
 * ```
 */
export function createInterval(fn: () => void, ms: number) {
  let running = $state(true);

  $effect(() => {
    if (!running) return;
    const id = setInterval(fn, ms);
    return () => clearInterval(id);
  });

  return {
    get running() {
      return running;
    },

    /** Starts (or resumes) the interval. */
    start() {
      running = true;
    },

    /** Stops (pauses) the interval. */
    stop() {
      running = false;
    },
  };
}
