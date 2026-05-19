/**
 * A discriminated union for representing an optional value.
 *
 * Represents either a present value (`Some`) or an absence (`None`).
 * Use {@link some} and {@link none} to construct, and combinators like
 * {@link map}, {@link andThen}, or {@link match} to operate on values.
 *
 * @typeParam T - The value type.
 *
 * @example
 * ```ts
 * function findUser(id: string): Option<User> {
 *   const user = db.get(id);
 *   return user ? some(user) : none();
 * }
 * ```
 */
export type Option<T> = { some: true; value: T } | { some: false };
