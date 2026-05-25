/**
 * Managed `requestAnimationFrame` loop with auto-cleanup via Svelte 5
 * `$effect`.
 *
 * The loop runs while `running` is `true` (the default). Call `stop()` to
 * pause and `start()` to resume. The RAF handle is automatically cancelled
 * when the component is destroyed.
 *
 * @param fn - The callback to invoke on each animation frame (receives
 * `DOMHighResTimeStamp`).
 * @returns `{ running, start, stop }`.
 *
 * @example
 * ```svelte
 * <script>
 *   import { createRaf } from "@anyhow/svelte";
 *
 *   let angle = $state(0);
 *   const loop = createRaf((time) => {
 *     angle = (time / 1000) % 360;
 *   });
 * </script>
 *
 * <div style="transform: rotate({angle}deg)">spinning</div>
 * ```
 */
export function createRaf(fn: (time: DOMHighResTimeStamp) => void) {
  let running = $state(true);
  let handle: number | undefined;

  function loop(time: DOMHighResTimeStamp) {
    if (!running) return;
    fn(time);
    handle = requestAnimationFrame(loop);
  }

  $effect(() => {
    if (!running) return;
    handle = requestAnimationFrame(loop);
    return () => {
      if (handle !== undefined) cancelAnimationFrame(handle);
    };
  });

  return {
    get running() {
      return running;
    },

    /** Starts (or resumes) the animation loop. */
    start() {
      running = true;
    },

    /** Stops (pauses) the animation loop. */
    stop() {
      running = false;
    },
  };
}
