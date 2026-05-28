/**
 * Reactive Battery Status API wrapper backed by Svelte 5 `$state`.
 *
 * Tracks `navigator.getBattery()` and exposes charging status, level,
 * and charging time estimates. SSR-safe — all values default when the API
 * is unavailable.
 *
 * @returns `{ charging, level, chargingTime, dischargingTime, isSupported }`.
 *
 * @example
 * ```svelte
 * <script>
 *   import { createBattery } from "@anyhow/svelte";
 *   const battery = createBattery();
 * </script>
 *
 * {#if battery.isSupported}
 *   <p>Battery: {battery.level * 100}% {battery.charging ? "⚡" : "🔋"}</p>
 * {:else}
 *   <p>Battery API not supported</p>
 * {/if}
 * ```
 */
import { listen } from "../listen.js";

export function createBattery() {
  let charging = $state(false);
  let level = $state(0);
  let chargingTime = $state(0);
  let dischargingTime = $state(0);
  const isSupported = typeof navigator !== "undefined" && "getBattery" in (navigator as any);

  $effect(() => {
    if (!isSupported) return;

    let cleanup: (() => void) | undefined;

    (navigator as any).getBattery().then((b: any) => {
      function update() {
        charging = b.charging;
        level = b.level;
        chargingTime = b.chargingTime;
        dischargingTime = b.dischargingTime;
      }

      update();
      const listeners = [
        listen(b, "chargingchange", update),
        listen(b, "levelchange", update),
        listen(b, "chargingtimechange", update),
        listen(b, "dischargingtimechange", update),
      ];

      cleanup = () => {
        for (const l of listeners) l.destroy();
      };
    });

    return () => cleanup?.();
  });

  return {
    /** Whether the battery is currently charging. */
    get charging() {
      return charging;
    },
    /** Battery level from `0` (empty) to `1` (full). */
    get level() {
      return level;
    },
    /** Seconds until fully charged, or `0` if already full. */
    get chargingTime() {
      return chargingTime;
    },
    /** Seconds until empty, or `Infinity` if charging. */
    get dischargingTime() {
      return dischargingTime;
    },
    /** Whether the Battery Status API is supported. */
    get isSupported() {
      return isSupported;
    },
  };
}
