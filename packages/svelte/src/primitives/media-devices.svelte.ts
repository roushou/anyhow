/**
 * Reactive MediaDevices API wrapper backed by Svelte 5 `$state`.
 *
 * Provides `getUserMedia` access to camera and microphone streams,
 * enumerates available devices, and tracks permission state. All values
 * are reactive `$state`. SSR-safe — the API is only accessed in the
 * browser.
 *
 * @returns `{ stream, devices, error, loading, isSupported, request, stop }`.
 *
 * @example
 * ```svelte
 * <script>
 *   import { createMediaDevices } from "@anyhow/svelte";
 *
 *   const media = createMediaDevices();
 *
 *   async function startCamera() {
 *     await media.request({ video: true, audio: false });
 *   }
 * </script>
 *
 * <button onclick={startCamera} disabled={media.loading}>
 *   Start Camera
 * </button>
 *
 * {#if media.stream}
 *   <video autoplay srcObject={media.stream}></video>
 * {:else if media.error}
 *   <p class="error">{media.error}</p>
 * {/if}
 * ```
 */
import { listen } from "../listen.js";

export function createMediaDevices() {
  let stream = $state<MediaStream | null>(null);
  let devices = $state<MediaDeviceInfo[]>([]);
  let error = $state<string | undefined>(undefined);
  let loading = $state(false);
  const isSupported = typeof navigator !== "undefined" && "mediaDevices" in navigator;

  async function request(constraints?: MediaStreamConstraints) {
    if (!isSupported) return;

    loading = true;
    error = undefined;

    try {
      const s = await navigator.mediaDevices.getUserMedia(
        constraints ?? { video: true, audio: true },
      );
      stream = s;
    } catch (err: unknown) {
      error = err instanceof Error ? err.message : String(err);
    } finally {
      loading = false;
    }
  }

  async function enumerate() {
    if (!isSupported) return;

    try {
      const list = await navigator.mediaDevices.enumerateDevices();
      devices = list;
    } catch {
      // enumerateDevices may fail if permissions are denied
    }
  }

  function stop() {
    if (stream) {
      for (const track of stream.getTracks()) {
        track.stop();
      }
      stream = null;
    }
  }

  // Enumerate on creation (in browser)
  $effect(() => {
    if (isSupported) enumerate();
  });

  // Listen for device changes
  $effect(() => {
    if (!isSupported) return;
    return listen(navigator.mediaDevices, "devicechange", () => enumerate()).destroy;
  });

  return {
    /** The active `MediaStream`, or `null`. */
    get stream() {
      return stream;
    },
    /** Available media devices (cameras, microphones, speakers). */
    get devices() {
      return devices;
    },
    /** Error message from the last `request()` call. */
    get error() {
      return error;
    },
    /** `true` while requesting media access. */
    get loading() {
      return loading;
    },
    /** Whether the MediaDevices API is supported. */
    get isSupported() {
      return isSupported;
    },
    /** Requests media access with optional constraints. */
    request,
    /** Stops all active media tracks. */
    stop,
  };
}
