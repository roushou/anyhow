/**
 * Reactive geolocation backed by Svelte 5 `$state`.
 *
 * Wraps the browser's `navigator.geolocation.watchPosition` API to track the
 * user's location reactively. SSR-safe — returns default values when
 * `navigator.geolocation` is unavailable.
 *
 * @param opts - Optional `PositionOptions` (high accuracy, timeout, etc.).
 * @returns `{ latitude, longitude, accuracy, altitude, heading, speed, error, loading }`.
 *
 * @example
 * ```svelte
 * <script>
 *   import { createGeolocation } from "@anyhow/svelte";
 *   const geo = createGeolocation({ enableHighAccuracy: true });
 * </script>
 *
 * {#if geo.loading}
 *   <p>Locating...</p>
 * {:else if geo.error}
 *   <p>Error: {geo.error.message}</p>
 * {:else}
 *   <p>Lat: {geo.latitude}, Lng: {geo.longitude}</p>
 * {/if}
 * ```
 */
export function createGeolocation(opts?: PositionOptions) {
  let latitude = $state<number | null>(null);
  let longitude = $state<number | null>(null);
  let accuracy = $state<number | null>(null);
  let altitude = $state<number | null>(null);
  let altitudeAccuracy = $state<number | null>(null);
  let heading = $state<number | null>(null);
  let speed = $state<number | null>(null);
  let error = $state<Error | undefined>(undefined);
  let loading = $state(true);

  $effect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      loading = false;
      error = new Error("Geolocation is not supported");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        latitude = pos.coords.latitude;
        longitude = pos.coords.longitude;
        accuracy = pos.coords.accuracy;
        altitude = pos.coords.altitude ?? null;
        altitudeAccuracy = pos.coords.altitudeAccuracy ?? null;
        heading = pos.coords.heading ?? null;
        speed = pos.coords.speed ?? null;
        error = undefined;
        loading = false;
      },
      (err) => {
        error = err;
        loading = false;
      },
      opts,
    );

    return () => navigator.geolocation.clearWatch(watchId);
  });

  return {
    /** Latitude in degrees. */
    get latitude() {
      return latitude;
    },
    /** Longitude in degrees. */
    get longitude() {
      return longitude;
    },
    /** Accuracy in meters. */
    get accuracy() {
      return accuracy;
    },
    /** Altitude in meters, or `null` if unavailable. */
    get altitude() {
      return altitude;
    },
    /** Altitude accuracy in meters, or `null` if unavailable. */
    get altitudeAccuracy() {
      return altitudeAccuracy;
    },
    /** Heading in degrees from true north, or `null` if unavailable. */
    get heading() {
      return heading;
    },
    /** Speed in meters/second, or `null` if unavailable. */
    get speed() {
      return speed;
    },
    /** Set when geolocation fails or is unsupported. */
    get error() {
      return error;
    },
    /** `true` while waiting for the first position. */
    get loading() {
      return loading;
    },
  };
}
