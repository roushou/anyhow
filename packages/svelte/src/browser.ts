/**
 * Returns `true` when running in a browser environment.
 *
 * Useful for SSR-safe guards in universal SvelteKit code.
 *
 * @returns `true` if `window` is defined.
 *
 * @example
 * ```ts
 * import { isBrowser } from "@anyhow/svelte";
 *
 * if (isBrowser()) {
 *   localStorage.setItem("key", "value");
 * }
 * ```
 */
export function isBrowser(): boolean {
  return typeof window !== "undefined";
}
