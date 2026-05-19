import type { Result } from "./types.js";

/**
 * Creates a successful {@link Result}.
 *
 * @typeParam T - The success value type.
 * @typeParam E - The error type (defaults to `never`).
 * @param value - The value to wrap.
 * @returns A `Result` with `ok: true`.
 *
 * @example
 * ```ts
 * ok(42); // { ok: true, value: 42 }
 * ok("hello"); // { ok: true, value: "hello" }
 * ```
 */
export const ok = <T, E = never>(value: T): Result<T, E> => ({ ok: true, value });

/**
 * Creates a failed {@link Result}.
 *
 * @typeParam T - The success value type (defaults to `never`).
 * @typeParam E - The error type.
 * @param error - The error to wrap.
 * @returns A `Result` with `ok: false`.
 *
 * @example
 * ```ts
 * err("something went wrong"); // { ok: false, error: "something went wrong" }
 * err(new Error("boom")); // { ok: false, error: Error("boom") }
 * ```
 */
export const err = <T = never, E = unknown>(error: E): Result<T, E> => ({ ok: false, error });
