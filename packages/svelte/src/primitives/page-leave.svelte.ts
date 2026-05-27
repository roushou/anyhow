/**
 * Reactive page-leave guard backed by Svelte 5 `$state`.
 *
 * Registers a `beforeunload` listener on `window` that prompts the user
 * when they try to navigate away or close the tab. The guard is activated
 * when `dirty` is `true`. SSR-safe.
 *
 * @returns `{ setDirty, setMessage, disable }`.
 *
 * @example
 * ```svelte
 * <script>
 *   import { createPageLeave } from "@anyhow/svelte";
 *   const guard = createPageLeave();
 *
 *   let formData = $state("");
 *   $effect(() => {
 *     guard.setDirty(formData.length > 0);
 *   });
 * </script>
 *
 * <form>
 *   <input bind:value={formData} />
 * </form>
 * ```
 */
export function createPageLeave() {
  let dirty = $state(false);

  $effect(() => {
    if (typeof window === "undefined") return;

    if (!dirty) return;

    function handler(e: BeforeUnloadEvent) {
      e.preventDefault();
    }

    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  });

  return {
    /** Marks the page as "dirty" — activates the leave guard. */
    setDirty(value: boolean) {
      dirty = value;
    },
    /** Disables the guard (sets dirty to `false`). */
    disable() {
      dirty = false;
    },
  };
}
