/**
 * Reactive BroadcastChannel wrapper backed by Svelte 5 `$state`.
 *
 * Enables same-origin cross-tab communication. Messages are pushed into a
 * reactive array. Automatically closes the channel on cleanup. SSR-safe.
 *
 * @param name - The channel name (must match across tabs).
 * @returns `{ messages, postMessage, close }`.
 *
 * @example
 * ```svelte
 * <script>
 *   import { createBroadcastChannel } from "@anyhow/svelte";
 *   const channel = createBroadcastChannel("app-state");
 * </script>
 *
 * <button onclick={() => channel.postMessage({ type: "logout" })}>
 *   Logout everywhere
 * </button>
 * ```
 */
export function createBroadcastChannel(name: string) {
  let messages = $state<any[]>([]);
  const isSupported = typeof BroadcastChannel !== "undefined";
  let bc: BroadcastChannel | null = null;

  $effect(() => {
    if (!isSupported) return;

    bc = new BroadcastChannel(name);
    bc.onmessage = (e) => {
      messages = [...messages, e.data];
    };

    return () => {
      bc?.close();
      bc = null;
    };
  });

  return {
    /** Messages received on this channel, newest last. */
    get messages() {
      return messages;
    },
    /** Sends a message to all other tabs listening on this channel. */
    postMessage(data: any) {
      bc?.postMessage(data);
    },
    /** Closes the channel. */
    close() {
      bc?.close();
      bc = null;
    },
  };
}
