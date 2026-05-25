/**
 * Reactive `window.location.hash` backed by Svelte 5 `$state`.
 *
 * Listens to `hashchange` events and updates `hash` reactively (without the
 * leading `#`). Setting `hash` updates the URL and the reactive state.
 * SSR-safe.
 *
 * @returns `{ hash }`.
 *
 * @example
 * ```svelte
 * <script>
 *   import { createHash } from "@anyhow/svelte";
 *   const route = createHash();
 * </script>
 *
 * {#if route.hash === "settings"}<Settings />{/if}
 * ```
 */
export function createHash() {
  let hash = $state(typeof window !== "undefined" ? window.location.hash.replace(/^#/, "") : "");

  $effect(() => {
    if (typeof window === "undefined") return;

    function update() {
      hash = window.location.hash.replace(/^#/, "");
    }

    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  });

  return {
    /** The current URL hash without the leading `#`. */
    get hash() {
      return hash;
    },
    /** Sets the URL hash. */
    set hash(value: string) {
      hash = value;
      if (typeof window !== "undefined") {
        window.location.hash = value;
      }
    },
  };
}
