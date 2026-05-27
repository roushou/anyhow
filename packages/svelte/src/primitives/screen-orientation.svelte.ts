/**
 * Reactive Screen Orientation API wrapper backed by Svelte 5 `$state`.
 *
 * Tracks the current screen orientation type and angle, and provides
 * `lock`/`unlock` methods. SSR-safe.
 *
 * @returns `{ type, angle, isSupported, lock, unlock }`.
 *
 * @example
 * ```svelte
 * <script>
 *   import { createScreenOrientation } from "@anyhow/svelte";
 *   const orient = createScreenOrientation();
 * </script>
 *
 * <button onclick={() => orient.lock("landscape")}>Lock Landscape</button>
 * ```
 */
export function createScreenOrientation() {
  let type = $state<string>("");
  let angle = $state(0);
  const isSupported = typeof screen !== "undefined" && "orientation" in screen;

  $effect(() => {
    if (!isSupported) return;

    const orientation = screen.orientation;

    function update() {
      type = orientation.type;
      angle = orientation.angle;
    }

    update();
    orientation.addEventListener("change", update);
    return () => orientation.removeEventListener("change", update);
  });

  return {
    /** The current orientation type: e.g. `"portrait-primary"`, `"landscape-primary"`. */
    get type() {
      return type;
    },
    /** The current orientation angle in degrees. */
    get angle() {
      return angle;
    },
    /** Whether the Screen Orientation API is supported. */
    get isSupported() {
      return isSupported;
    },
    /** Locks the screen to the given orientation. */
    async lock(orientation: OrientationLockType) {
      if (!isSupported) return;
      await screen.orientation.lock(orientation);
    },
    /** Unlocks the screen orientation. */
    unlock() {
      if (!isSupported) return;
      screen.orientation.unlock();
    },
  };
}
