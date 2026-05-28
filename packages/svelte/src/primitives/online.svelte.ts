/**
 * Reactive online/offline status backed by Svelte 5 `$state`.
 *
 * Listens to `window` `online`/`offline` events and updates `online`
 * reactively. SSR-safe — defaults to `true` when `window` is unavailable.
 *
 * @returns `{ online: boolean }`.
 *
 * @example
 * ```svelte
 * <script>
 *   import { createOnline } from "@anyhow/svelte";
 *   const net = createOnline();
 * </script>
 *
 * {#if !net.online}
 *   <p>You are offline. Changes will sync when you reconnect.</p>
 * {/if}
 * ```
 */
import { createEventListener } from "./event-listener.svelte.js";

export function createOnline() {
  let online = $state(typeof navigator !== "undefined" ? navigator.onLine : true);

  createEventListener(window, "online", () => {
    online = navigator.onLine;
  });
  createEventListener(window, "offline", () => {
    online = navigator.onLine;
  });

  return {
    /** Whether the browser currently reports an active network connection. */
    get online() {
      return online;
    },
  };
}
