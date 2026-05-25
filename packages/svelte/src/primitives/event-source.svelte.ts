/**
 * Reactive Server-Sent Events wrapper backed by Svelte 5 `$state`.
 *
 * Connects to an `EventSource` endpoint and exposes `data` (the last
 * received message), `error`, and `readyState` as reactive `$state`. The
 * connection is automatically closed when the component is destroyed.
 *
 * If `url` is a getter function, the `EventSource` reconnects with the new
 * URL whenever the returned value changes.
 *
 * @param url - The SSE endpoint URL, or a getter that returns the URL.
 * @param opts.withCredentials - Whether to send credentials (defaults to `false`).
 * @returns `{ data, error, readyState, close }`.
 *
 * @example
 * ```svelte
 * <script>
 *   import { createEventSource } from "@anyhow/svelte";
 *
 *   const stream = createEventSource("/api/events");
 * </script>
 *
 * {#if stream.data}
 *   <pre>{stream.data}</pre>
 * {:else if stream.error}
 *   <p>Disconnected</p>
 * {/if}
 * ```
 */
export function createEventSource(url: string | (() => string), opts: EventSourceInit = {}) {
  let data = $state<string | null>(null);
  let error = $state<Error | undefined>(undefined);
  let readyState = $state<number>(typeof EventSource !== "undefined" ? EventSource.CLOSED : 2);
  let source: EventSource | null = null;

  $effect(() => {
    if (typeof EventSource === "undefined") return;

    const resolved = typeof url === "function" ? url() : url;
    source = new EventSource(resolved, opts);

    source.onopen = () => {
      readyState = EventSource.OPEN;
      error = undefined;
    };

    source.onmessage = (event: MessageEvent) => {
      data = event.data;
    };

    source.onerror = () => {
      error = new Error("EventSource connection error");
      readyState = source?.readyState ?? EventSource.CLOSED;
    };

    return () => {
      source?.close();
      source = null;
      readyState = EventSource.CLOSED;
    };
  });

  function close() {
    source?.close();
    source = null;
    readyState = EventSource.CLOSED;
  }

  return {
    /** The last received message data, or `null` if nothing received yet. */
    get data() {
      return data;
    },
    /** The last connection error, or `undefined`. */
    get error() {
      return error;
    },
    /** The `EventSource.readyState`: `0` CONNECTING, `1` OPEN, `2` CLOSED. */
    get readyState() {
      return readyState;
    },
    /** Closes the connection. */
    close,
  };
}
