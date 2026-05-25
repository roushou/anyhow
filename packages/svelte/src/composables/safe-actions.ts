/**
 * Wraps SvelteKit form `actions` so that thrown errors are caught and
 * returned in the action result instead of propagating to SvelteKit's
 * error boundary.
 *
 * Each wrapped action catches errors and returns `{ _actionError: Error }`
 * alongside any data the original action produced. The page component can
 * inspect `form?._actionError` to display error feedback.
 *
 * @typeParam A - A record of SvelteKit action functions.
 * @param actions - The original actions object.
 * @returns A wrapped actions object where each action never throws.
 *
 * @example
 * ```ts
 * import { safeActions } from "@anyhow/svelte";
 *
 * export const actions = safeActions({
 *   default: async (event) => {
 *     const data = await event.request.formData();
 *     const user = await createUser(data);
 *     return { user };
 *   },
 * });
 *
 * // In +page.svelte:
 * // let { form } = $props();
 * // {#if form?._actionError}<p>{form._actionError.message}</p>{/if}
 * ```
 */
export function safeActions<A extends Record<string, (...args: any[]) => Promise<any>>>(
  actions: A,
): {
  [K in keyof A]: A[K] extends (...args: infer Args) => Promise<infer R>
    ? (...args: Args) => Promise<R & { _actionError?: Error }>
    : A[K];
} {
  const wrapped: Record<string, (...args: any[]) => Promise<any>> = {};

  for (const [name, action] of Object.entries(actions)) {
    wrapped[name] = async (...args: any[]) => {
      try {
        return await (action as (...a: any[]) => any)(...args);
      } catch (err) {
        return {
          _actionError: err instanceof Error ? err : new Error(String(err)),
        };
      }
    };
  }

  return wrapped as any;
}
