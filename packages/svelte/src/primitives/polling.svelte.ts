/**
 * Async polling with reactive `$state` for loading, data, and error.
 *
 * Call `start()` to begin polling `fn` every `ms` milliseconds. `stop()`
 * pauses. Unlike `createInterval`, the callback won't fire again until the
 * previous invocation has resolved — preventing overlapping requests.
 *
 * @typeParam T - The resolved value type.
 * @param fn - The async function to invoke on each tick.
 * @param ms - Polling interval in milliseconds.
 * @returns `{ running, data, error, start, stop }`.
 *
 * @example
 * ```svelte
 * <script>
 *   import { createPolling } from "@anyhow/svelte";
 *
 *   const poll = createPolling(() => fetch("/api/status").then(r => r.json()), 5000);
 *   poll.start();
 * </script>
 *
 * {#if poll.data}<pre>{JSON.stringify(poll.data)}</pre>{/if}
 * ```
 */
export function createPolling<T>(fn: () => Promise<T>, ms: number) {
  let running = $state(false);
  let data = $state<T | undefined>(undefined);
  let error = $state<Error | undefined>(undefined);
  let timer: ReturnType<typeof setTimeout> | undefined;

  async function tick() {
    if (!running) return;
    try {
      const result = await fn();
      data = result;
      error = undefined;
    } catch (e) {
      error = e instanceof Error ? e : new Error(String(e));
    }
    if (running) {
      timer = setTimeout(tick, ms);
    }
  }

  function start() {
    if (running) return;
    running = true;
    tick();
  }

  function stop() {
    running = false;
    if (timer !== undefined) {
      clearTimeout(timer);
      timer = undefined;
    }
  }

  return {
    get running() {
      return running;
    },
    get data() {
      return data;
    },
    get error() {
      return error;
    },
    start,
    stop,
  };
}
