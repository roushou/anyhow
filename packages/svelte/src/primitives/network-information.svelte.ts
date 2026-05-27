/**
 * Reactive Network Information API wrapper backed by Svelte 5 `$state`.
 *
 * Tracks `navigator.connection` (if available) and exposes the effective
 * connection type, estimated downlink speed, RTT, and data-saver preference.
 * SSR-safe — all values default to `undefined` when the API is unavailable.
 *
 * @returns `{ effectiveType, downlink, rtt, saveData, isSupported }`.
 *
 * @example
 * ```svelte
 * <script>
 *   import { createNetworkInformation } from "@anyhow/svelte";
 *   const net = createNetworkInformation();
 * </script>
 *
 * {#if net.saveData}
 *   <p>Data saver mode — low-res images loaded.</p>
 * {:else if net.effectiveType === "slow-2g"}
 *   <p>Slow connection detected.</p>
 * {/if}
 * ```
 */
export function createNetworkInformation() {
  let effectiveType = $state<string | undefined>(undefined);
  let downlink = $state<number | undefined>(undefined);
  let rtt = $state<number | undefined>(undefined);
  let saveData = $state<boolean | undefined>(undefined);
  const isSupported = typeof navigator !== "undefined" && "connection" in navigator;

  $effect(() => {
    if (!isSupported) return;

    const conn = (navigator as any).connection;
    if (!conn) return;

    function update() {
      effectiveType = conn.effectiveType;
      downlink = conn.downlink;
      rtt = conn.rtt;
      saveData = conn.saveData;
    }

    update();
    conn.addEventListener("change", update);
    return () => conn.removeEventListener("change", update);
  });

  return {
    /** The effective connection type: `"slow-2g"`, `"2g"`, `"3g"`, `"4g"`, or `undefined`. */
    get effectiveType() {
      return effectiveType;
    },
    /** Estimated downlink speed in Mbps. */
    get downlink() {
      return downlink;
    },
    /** Estimated round-trip time in milliseconds. */
    get rtt() {
      return rtt;
    },
    /** Whether the user has requested reduced data usage. */
    get saveData() {
      return saveData;
    },
    /** Whether the Network Information API is supported. */
    get isSupported() {
      return isSupported;
    },
  };
}
