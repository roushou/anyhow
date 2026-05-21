/**
 * Throws if `cond` is falsy.  Intended for runtime invariants that
 * should never be false — if they are, the program is in an invalid state.
 *
 * Use `invariant` for internal consistency checks ("this should never happen")
 * and {@link assert} for validating external input.
 *
 * @param cond - The condition to check.
 * @param msg - A message or a lazy message factory (only called on failure).
 *
 * @example
 * ```ts
 * invariant(limit > 0, "limit must be positive");
 * invariant(items.length === 0, () => `Expected empty but got ${items.length}`);
 * ```
 */
export function invariant(cond: unknown, msg?: string | (() => string)): asserts cond {
  if (cond) return;
  const m = typeof msg === "function" ? msg() : msg;
  throw new Error(m ? `Invariant: ${m}` : "Invariant failed");
}
