/**
 * Reactive URL search params backed by Svelte 5 `$state`.
 *
 * Reads from `window.location.search` (SSR-safe). When `value` is set, it
 * updates both the reactive state and the browser URL via
 * `history.replaceState`.
 *
 * @typeParam T - A record type mapping param names to string values.
 * @param defaults - Default values for each param.
 * @returns An object with reactive `value` (merged params) and `reset`.
 *
 * @example
 * ```ts
 * import { createQueryParams } from "@anyhow/svelte";
 *
 * const params = createQueryParams({ page: "1", sort: "name" });
 * // params.value  → { page: "1", sort: "name" }
 * // params.value = { page: "2", sort: "name" }
 * ```
 */
export function createQueryParams<T extends Record<string, string>>(defaults: T) {
  const current = parseSearch();

  let value = $state<T>({ ...defaults, ...current } as T);

  function parseSearch(): Partial<T> {
    if (typeof window === "undefined") return {};
    const params = new URLSearchParams(window.location.search);
    const result: Record<string, string> = {};
    for (const [k, v] of params) {
      result[k] = v;
    }
    return result as Partial<T>;
  }

  function syncToURL(v: T) {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    for (const [k, val] of Object.entries(v)) {
      if (val === defaults[k as keyof T]) {
        url.searchParams.delete(k);
      } else {
        url.searchParams.set(k, String(val));
      }
    }
    history.replaceState(history.state, "", url.toString());
  }

  $effect(() => {
    syncToURL(value);
  });

  return {
    get value(): T {
      return value;
    },
    set value(v: T) {
      value = v;
    },

    /** Resets all params to their defaults. */
    reset() {
      value = { ...defaults } as T;
    },
  };
}
