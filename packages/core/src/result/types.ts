/**
 * A discriminated union for type-safe error handling.
 *
 * Represents either a successful value (`Ok`) or an error (`Err`).
 * Use {@link ok} and {@link err} to construct, and combinators like
 * {@link map}, {@link andThen}, or {@link match} to operate on values.
 *
 * @typeParam T - The success value type.
 * @typeParam E - The error type (defaults to `Error`).
 *
 * @example
 * ```ts
 * function divide(a: number, b: number): Result<number, string> {
 *   if (b === 0) return err("division by zero");
 *   return ok(a / b);
 * }
 * ```
 */
export type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };
