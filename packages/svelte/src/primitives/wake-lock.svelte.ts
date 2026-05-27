/**
 * Reactive Screen Wake Lock API wrapper backed by Svelte 5 `$state`.
 *
 * Manages a `WakeLockSentinel` to prevent the screen from dimming or locking.
 * SSR-safe — defaults to unsupported state when the API is unavailable.
 *
 * @returns `{ isActive, isSupported, request, release }`.
 *
 * @example
 * ```svelte
 * <script>
 *   import { createWakeLock } from "@anyhow/svelte";
 *   const wl = createWakeLock();
 * </script>
 *
 * {#if wl.isSupported}
 *   <button onclick={() => wl.isActive ? wl.release() : wl.request()}>
 *     {wl.isActive ? "Allow sleep" : "Keep screen on"}
 *   </button>
 * {/if}
 * ```
 */
export function createWakeLock() {
  let isActive = $state(false);
  let sentinel: WakeLockSentinel | null = null;
  const isSupported = typeof navigator !== "undefined" && "wakeLock" in navigator;

  $effect(() => {
    return () => {
      sentinel?.release().catch(() => {});
      sentinel = null;
      isActive = false;
    };
  });

  return {
    /** Whether the wake lock is currently active. */
    get isActive() {
      return isActive;
    },
    /** Whether the Wake Lock API is supported. */
    get isSupported() {
      return isSupported;
    },
    /** Requests a screen wake lock. */
    async request() {
      if (!isSupported) return;
      try {
        sentinel = await navigator.wakeLock.request("screen");
        isActive = true;
        sentinel.addEventListener("release", () => {
          isActive = false;
          sentinel = null;
        });
      } catch {
        isActive = false;
      }
    },
    /** Releases the current wake lock. */
    async release() {
      if (!sentinel) return;
      try {
        await sentinel.release();
      } catch {
        // Already released.
      }
      sentinel = null;
      isActive = false;
    },
  };
}
