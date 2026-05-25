/**
 * Reactive state persisted to browser storage, backed by Svelte 5 `$state`.
 *
 * Supports both `localStorage` and `sessionStorage`. Reads the initial value
 * from storage on creation (SSR-safe). Writes are automatically persisted
 * whenever `value` changes.
 *
 * @typeParam T - The type of the state value (must be JSON-serializable).
 * @param opts.key - The storage key.
 * @param opts.initial - The fallback initial value.
 * @param opts.storage - `"local"` (default) or `"session"`.
 * @returns An object with reactive `value`.
 *
 * @example
 * ```ts
 * import { createStore } from "@anyhow/svelte";
 *
 * // localStorage — survives tab close
 * const theme = createStore({ key: "theme", initial: "light" });
 *
 * // sessionStorage — cleared on tab close
 * const draft = createStore({ key: "draft", initial: "", storage: "session" });
 * ```
 */
export function createStore<T>(opts: { key: string; initial: T; storage?: "local" | "session" }) {
  const storage = resolveStorage(opts.storage ?? "local");
  const stored = read(storage, opts.key);
  let value = $state(stored !== undefined ? (stored as T) : opts.initial);

  $effect(() => {
    const v = value;
    write(storage, opts.key, v);
  });

  return {
    get value() {
      return value;
    },
    set value(v: T) {
      value = v;
    },
  };
}

function resolveStorage(type: "local" | "session"): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    const s = type === "local" ? localStorage : sessionStorage;
    // Verify the API is available (private browsing may block it)
    s.setItem("__test__", "1");
    s.removeItem("__test__");
    return s;
  } catch {
    return null;
  }
}

function read(storage: Storage | null, key: string): unknown {
  if (!storage) return undefined;
  try {
    const raw = storage.getItem(key);
    return raw !== null ? JSON.parse(raw) : undefined;
  } catch {
    return undefined;
  }
}

function write(storage: Storage | null, key: string, value: unknown): void {
  if (!storage) return;
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or access denied — silently ignore
  }
}
