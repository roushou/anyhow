/**
 * Typed reactive URL search params backed by Svelte 5 `$state`.
 *
 * Extends the string-only {@link createQueryParams} with per-param type
 * coercion via `parse` / `serialize` functions. Supports numbers,
 * booleans, enums, arrays, and custom types.
 *
 * Reads from `window.location.search` on init (SSR-safe) and syncs
 * changes back via `history.replaceState`.
 *
 * @typeParam T - A record mapping param names to their type config.
 * @param defs - Param definitions with default, parse, and serialize.
 * @returns `{ params, reset }`.
 *
 * @example
 * ```svelte
 * <script>
 *   import { createSearchParams } from "@anyhow/svelte";
 *
 *   const search = createSearchParams({
 *     page: { default: 1, parse: Number, serialize: String },
 *     tags: { default: [] as string[], parse: (v) => v.split(","), serialize: (v) => v.join(",") },
 *     active: { default: false, parse: (v) => v === "true", serialize: String },
 *   });
 * </script>
 *
 * <p>Page: {search.params.page}</p>
 * <!-- Toggling active updates the URL: /?active=true -->
 * ```
 */
export function createSearchParams<
  T extends Record<
    string,
    { default: any; parse: (v: string) => any; serialize: (v: any) => string }
  >,
>(defs: T) {
  type Values = { [K in keyof T]: ReturnType<T[K]["parse"]> };

  const keys = Object.keys(defs) as (keyof T)[];

  // Build initial values from URL + defaults
  const initial = {} as Values;
  const search = typeof window !== "undefined" ? window.location.search : "";
  const urlParams = new URLSearchParams(search);

  for (const key of keys) {
    const def = defs[key]!;
    const raw = urlParams.get(key as string);
    initial[key] = raw !== null ? def.parse(raw) : def.default;
  }

  let params = $state<Values>({ ...initial });

  // Sync to URL on change
  $effect(() => {
    if (typeof window === "undefined") return;

    const url = new URL(window.location.href);

    for (const key of keys) {
      const value = params[key];
      const def = defs[key]!;
      const defaultValue = def.default;

      if (
        value === defaultValue ||
        (Array.isArray(value) && Array.isArray(defaultValue) && value.length === 0)
      ) {
        url.searchParams.delete(key as string);
      } else {
        url.searchParams.set(key as string, def.serialize(value));
      }
    }

    try {
      history.replaceState(history.state, "", url.toString());
    } catch {
      // jsdom / restricted environments may reject replaceState
    }
  });

  return {
    /** Reactive typed params object. Assign to update the URL. */
    get params(): Values {
      return params;
    },
    set params(v: Values) {
      params = { ...v };
    },

    /** Resets all params to their defaults. */
    reset() {
      params = { ...initial } as Values;
    },
  };
}
