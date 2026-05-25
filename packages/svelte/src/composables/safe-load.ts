/**
 * Wraps a SvelteKit `load` function so thrown errors are returned as data
 * instead of hitting SvelteKit's error boundary.
 *
 * The wrapped function catches any error thrown by `loadFn`, attaches it
 * under `_loadError`, and returns the merged result. The page component can
 * then inspect `data._loadError` and render a fallback instead of crashing.
 *
 * @typeParam F - The load function type `(event) => Promise<Record<string, any>>`.
 * @param loadFn - The original SvelteKit load function.
 * @returns A wrapped load function that never throws.
 *
 * @example
 * ```ts
 * import { safeLoad } from "@anyhow/svelte";
 *
 * export const load = safeLoad(async (event) => {
 *   const user = await db.user.findUnique({ where: { id: event.params.id } });
 *   if (!user) throw new Error("User not found");
 *   return { user };
 * });
 *
 * // In +page.svelte:
 * // let { data } = $props();
 * // {#if data._loadError}<p>Failed to load</p>{:else}...
 * ```
 */
export function safeLoad<Args extends any[], R extends Record<string, unknown>>(
  loadFn: (...args: Args) => Promise<R>,
): (...args: Args) => Promise<R & { _loadError?: Error }> {
  return async (...args) => {
    try {
      return await loadFn(...args);
    } catch (err) {
      return {
        ...({} as R),
        _loadError: err instanceof Error ? err : new Error(String(err)),
      };
    }
  };
}
