/**
 * Reactive WebSocket connection backed by Svelte 5 `$state`.
 *
 * Manages a WebSocket connection with reactive `readyState`, `data`, and
 * `error`. Automatically cleans up (closes the socket) when the component
 * unmounts. SSR-safe — no connection is attempted when `WebSocket` is
 * unavailable.
 *
 * @param url - The WebSocket server URL (or a function returning one).
 * @param protocols - Optional WebSocket subprotocols.
 * @returns `{ data, readyState, error, send, close }`.
 *
 * @example
 * ```svelte
 * <script>
 *   import { createWebSocket } from "@anyhow/svelte";
 *   const ws = createWebSocket("wss://echo.example.com");
 * </script>
 *
 * {#if ws.readyState === WebSocket.OPEN}
 *   <button onclick={() => ws.send("ping")}>Ping</button>
 *   <p>Last message: {ws.data}</p>
 * {/if}
 * ```
 */
export function createWebSocket(url: string | (() => string), protocols?: string | string[]) {
  let data = $state<string | null>(null);
  let readyState = $state<number>(
    typeof WebSocket !== "undefined" ? WebSocket.CONNECTING : WebSocket.CLOSED,
  );
  let error = $state<Error | undefined>(undefined);
  let socket: WebSocket | null = null;

  $effect(() => {
    if (typeof WebSocket === "undefined") return;

    const resolved = typeof url === "function" ? url() : url;
    const ws = new WebSocket(resolved, protocols);
    socket = ws;

    readyState = ws.readyState;

    ws.onopen = () => {
      readyState = ws.readyState;
    };

    ws.onmessage = (e) => {
      data = typeof e.data === "string" ? e.data : null;
    };

    ws.onerror = () => {
      error = new Error("WebSocket error");
    };

    ws.onclose = () => {
      readyState = ws.readyState;
    };

    return () => {
      ws.onopen = null;
      ws.onmessage = null;
      ws.onerror = null;
      ws.onclose = null;
      socket = null;
      ws.close();
    };
  });

  return {
    /** The last received message string, or `null`. */
    get data() {
      return data;
    },
    /** The current `readyState` (`WebSocket.CONNECTING`, `OPEN`, `CLOSING`, `CLOSED`). */
    get readyState() {
      return readyState;
    },
    /** Set when the connection encounters an error. */
    get error() {
      return error;
    },
    /** Sends a string message through the socket. */
    send(message: string) {
      socket?.send(message);
    },
    /** Closes the WebSocket connection. */
    close(code?: number, reason?: string) {
      socket?.close(code, reason);
    },
  };
}
