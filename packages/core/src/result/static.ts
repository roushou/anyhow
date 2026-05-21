import { ok, err, type Result } from "./result.js";

/** Static combinators. Re-exported as `Result` from the barrel. */
export const ResultStatic = {
  ok,
  err,

  /** Wraps a synchronous function that may throw. */
  from<T>(fn: () => T): Result<T> {
    try {
      return ok(fn());
    } catch (e) {
      return err(e instanceof Error ? e : new Error(String(e)));
    }
  },

  /** Wraps an async function that may throw. */
  async fromAsync<T>(fn: () => Promise<T>): Promise<Result<T>> {
    try {
      return ok(await fn());
    } catch (e) {
      return err(e instanceof Error ? e : new Error(String(e)));
    }
  },

  /** Converts a nullable value to a Result. */
  fromNullable<T>(value: T | null | undefined, error: Error): Result<T, Error> {
    return value != null ? ok(value) : err(error);
  },

  /** Combines an array of Results. Returns Ok(values) or the first Err. */
  all<T, E>(results: Result<T, E>[]): Result<T[], E> {
    const values: T[] = [];
    for (const r of results) {
      if (!r.ok) return r as unknown as Result<T[], E>;
      values.push(r.value);
    }
    return ok(values);
  },

  /** Partitions Results into ok and err arrays. */
  partition<T, E>(results: Result<T, E>[]): { ok: T[]; err: E[] } {
    const o: T[] = [];
    const e: E[] = [];
    for (const r of results) {
      if (r.ok) o.push(r.value);
      else e.push(r.error);
    }
    return { ok: o, err: e };
  },

  /** Returns the first successful Result, or all errors. */
  any<T, E>(results: Result<T, E>[]): Result<T, E[]> {
    const errors: E[] = [];
    for (const r of results) {
      if (r.ok) return ok(r.value);
      errors.push(r.error);
    }
    return err(errors);
  },
};
