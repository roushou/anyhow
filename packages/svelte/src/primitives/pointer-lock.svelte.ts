/**
 * Reactive Pointer Lock API wrapper backed by Svelte 5 `$state`.
 *
 * Manages pointer lock state for capturing raw mouse movement (e.g., for
 * 3D camera controls or canvas drawing tools). SSR-safe.
 *
 * @returns `{ locked, movementX, movementY, isSupported, request, exit }`.
 *
 * @example
 * ```svelte
 * <script>
 *   import { createPointerLock } from "@anyhow/svelte";
 *   const lock = createPointerLock();
 * </script>
 *
 * <canvas
 *   onclick={() => lock.request()}
 *   style="cursor:{lock.locked ? 'none' : 'default'}"
 * />
 * ```
 */
export function createPointerLock() {
  let locked = $state(false);
  let movementX = $state(0);
  let movementY = $state(0);
  const isSupported = typeof document !== "undefined" && "pointerLockElement" in document;

  let target: Element | null = null;

  $effect(() => {
    if (!isSupported) return;

    function onLockChange() {
      locked = !!document.pointerLockElement;
      if (!locked) {
        target = null;
        movementX = 0;
        movementY = 0;
      }
    }

    function onMouseMove(e: MouseEvent) {
      if (!locked) return;
      movementX = e.movementX;
      movementY = e.movementY;
    }

    document.addEventListener("pointerlockchange", onLockChange);
    document.addEventListener("mousemove", onMouseMove);
    return () => {
      document.removeEventListener("pointerlockchange", onLockChange);
      document.removeEventListener("mousemove", onMouseMove);
      document.exitPointerLock();
    };
  });

  return {
    /** Whether the pointer is currently locked. */
    get locked() {
      return locked;
    },
    /** Raw horizontal mouse movement since the last event. */
    get movementX() {
      return movementX;
    },
    /** Raw vertical mouse movement since the last event. */
    get movementY() {
      return movementY;
    },
    /** Whether the Pointer Lock API is supported. */
    get isSupported() {
      return isSupported;
    },
    /** Requests a pointer lock on the given element. */
    async request(el?: Element) {
      if (!isSupported) return;
      target = el ?? document.body;
      await target.requestPointerLock();
    },
    /** Exits pointer lock. */
    exit() {
      if (!isSupported) return;
      document.exitPointerLock();
    },
  };
}
