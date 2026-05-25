/**
 * Wraps an async function with reactive `$state` for loading, data, and error.
 *
 * Call `execute(...)` to trigger the function. State updates are reactive so
 * templates re-render automatically. `reset()` clears all state.
 *
 * @typeParam T - The resolved value type.
 * @typeParam Args - The argument types of the wrapped function.
 * @param fn - The async function to wrap.
 * @returns `{ loading, data, error, execute, reset }`.
 *
 * @example
 * ```svelte
 * <script>
 *   import { createAsyncState } from "@anyhow/svelte";
 *
 *   const user = createAsyncState(async (id: string) => {
 *     const res = await fetch(`/api/users/${id}`);
 *     return res.json();
 *   });
 * </script>
 *
 * <button onclick={() => user.execute("abc")}>Load</button>
 * {#if user.loading}<p>Loading...</p>{/if}
 * {#if user.error}<p>Error: {user.error.message}</p>{/if}
 * {#if user.data}<p>{user.data.name}</p>{/if}
 * ```
 */
export function createAsyncState<T, Args extends any[]>(fn: (...args: Args) => Promise<T>) {
  let loading = $state(false);
  let data = $state<T | undefined>(undefined);
  let error = $state<Error | undefined>(undefined);

  async function execute(...args: Args): Promise<T | undefined> {
    loading = true;
    error = undefined;
    try {
      const result = await fn(...args);
      data = result;
      return result;
    } catch (e) {
      error = e instanceof Error ? e : new Error(String(e));
      return undefined;
    } finally {
      loading = false;
    }
  }

  function reset() {
    loading = false;
    data = undefined;
    error = undefined;
  }

  return {
    get loading() {
      return loading;
    },
    get data() {
      return data;
    },
    get error() {
      return error;
    },
    execute,
    reset,
  };
}
