/**
 * Throws if `cond` is falsy.  Acts as an assertion function, narrowing
 * the type of `cond` to truthy in the surrounding scope.
 *
 * @param cond - The condition to assert.
 * @param msg - The error message if the assertion fails.
 *
 * @example
 * ```ts
 * assert(user !== null, "user is required");
 * user; // narrowed to non-null
 * ```
 */
export function assert(cond: unknown, msg = "Assertion failed"): asserts cond {
  if (!cond) throw new Error(msg);
}

/**
 * Throws if `val` is `null` or `undefined`, narrowing to `NonNullable<T>`
 * in the surrounding scope.
 *
 * @typeParam T - The type of the value.
 * @param val - The value to check.
 * @param name - The name to include in the error message.
 *
 * @example
 * ```ts
 * assertDefined(process.env.API_KEY, "API_KEY");
 * process.env.API_KEY; // narrowed to string
 * ```
 */
export function assertDefined<T>(val: T, name = "value"): asserts val is NonNullable<T> {
  if (val === null || val === undefined) throw new Error(`${name} is not defined`);
}

/**
 * Exhaustiveness check for discriminated unions.  Place in the `default`
 * branch of a `switch` to get a compile-time error when a case is unhandled.
 *
 * @param x - The value that should be of type `never`.
 * @param msg - Optional custom error message.
 * @returns Never returns (always throws).
 *
 * @example
 * ```ts
 * type Shape = { kind: "circle" } | { kind: "square" };
 * function area(s: Shape): number {
 *   switch (s.kind) {
 *     case "circle": return 1;
 *     case "square": return 2;
 *     default: return assertNever(s, `Unexpected kind: ${(s as any).kind}`);
 *   }
 * }
 * ```
 */
export function assertNever(x: never, msg?: string): never {
  throw new Error(msg ?? `Unhandled case: ${JSON.stringify(x)}`);
}
