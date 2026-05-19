import { ok, err } from "./constructors.js";
import type { Result } from "./types.js";

/**
 * Wraps a synchronous function that may throw, returning a {@link Result}
 * instead of letting the error propagate.
 *
 * If the thrown value is not an `Error`, it is converted to one.
 *
 * @typeParam T - The return type of `fn`.
 * @param fn - A synchronous function that may throw.
 * @returns `Ok(fn())` on success, `Err(error)` on failure.
 *
 * @example
 * ```ts
 * const parsed = trySync(() => JSON.parse('{"name":"Alice"}'));
 * if (parsed.ok) console.log(parsed.value.name);
 * ```
 */
export function trySync<T>(fn: () => T): Result<T> {
  try {
    return ok(fn());
  } catch (e) {
    return err(e instanceof Error ? e : new Error(String(e)));
  }
}

/**
 * Wraps an asynchronous function that may throw, returning a promise of a
 * {@link Result} instead of letting the error propagate.
 *
 * If the thrown value is not an `Error`, it is converted to one.
 *
 * @typeParam T - The return type of `fn`.
 * @param fn - An async function that may throw.
 * @returns A promise resolving to `Ok(value)` or `Err(error)`.
 *
 * @example
 * ```ts
 * const data = await tryAsync(() => fetch("/api").then(r => r.json()));
 * if (data.ok) console.log(data.value);
 * ```
 */
export async function tryAsync<T>(fn: () => Promise<T>): Promise<Result<T>> {
  try {
    return ok(await fn());
  } catch (e) {
    return err(e instanceof Error ? e : new Error(String(e)));
  }
}
