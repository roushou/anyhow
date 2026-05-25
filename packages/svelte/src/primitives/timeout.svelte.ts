/**
 * Managed `setTimeout` with reactive `$state`.
 *
 * Call `start()` to begin timing. `cancel()` stops the timer. `running`
 * tracks whether the timer is active. This is manual — no `$effect`
 * auto-start — so the caller controls exactly when the timer begins.
 *
 * @param fn - The callback to invoke when the timeout fires.
 * @param ms - Delay in milliseconds.
 * @returns `{ running, start, cancel }`.
 *
 * @example
 * ```svelte
 * <script>
 *   import { createTimeout } from "@anyhow/svelte";
 *
 *   const toast = createTimeout(() => (show = false), 3000);
 *
 *   function showToast() {
 *     show = true;
 *     toast.start();
 *   }
 * </script>
 * ```
 */
export function createTimeout(fn: () => void, ms: number) {
  let running = $state(false);
  let timer: ReturnType<typeof setTimeout> | undefined;

  function start(): void {
    cancel();
    running = true;
    timer = setTimeout(() => {
      running = false;
      timer = undefined;
      fn();
    }, ms);
  }

  function cancel(): void {
    if (timer !== undefined) {
      clearTimeout(timer);
      timer = undefined;
    }
    running = false;
  }

  return {
    get running() {
      return running;
    },

    /** Starts the timer. Cancels any running timer first. */
    start,

    /** Cancels the timer if it's currently running. */
    cancel,
  };
}
