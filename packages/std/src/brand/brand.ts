/**
 * A unique symbol used as the brand key so branded types don't pollute
 * IntelliSense with a visible property.
 */
declare const brandSym: unique symbol;

/**
 * A compile-time nominal (branded) type.
 *
 * Wraps a base type `T` with a phantom brand `B` so that two branded types
 * with the same structure are treated as incompatible by TypeScript.
 *
 * Use {@link brand} to create branded values from raw values.
 *
 * @typeParam T - The underlying (structural) type.
 * @typeParam B - The brand — typically a string literal like `"UserId"` or `"Meters"`.
 *
 * @example
 * ```ts
 * type UserId = Brand<string, "UserId">;
 * type OrderId = Brand<string, "OrderId">;
 *
 * const uid: UserId = "usr_1" as Brand<string, "UserId">;
 * const oid: OrderId = uid; // Type error — UserId !== OrderId
 * ```
 *
 * @example
 * ```ts
 * type Meters = Brand<number, "Meters">;
 * type Feet = Brand<number, "Feet">;
 *
 * const m: Meters = brand(5); // infers as Brand<number, "Meters">
 * const f: Feet = m;          // Type error
 * ```
 */
export type Brand<T, B extends string> = T & { [brandSym]: B };

/**
 * Extracts the underlying structural type from a branded type.
 *
 * If `T` is not a {@link Brand}, it is returned unchanged.
 *
 * @typeParam T - The branded (or unbranded) type.
 *
 * @example
 * ```ts
 * type UserId = Brand<string, "UserId">;
 * type Raw = Unbrand<UserId>; // string
 * ```
 */
export type Unbrand<T> = T extends Brand<infer U, string> ? U : T;

/**
 * Extracts the brand from a branded type.
 *
 * If `T` is not a {@link Brand}, the result is `never`.
 *
 * @typeParam T - The branded type.
 *
 * @example
 * ```ts
 * type UserId = Brand<string, "UserId">;
 * type B = BrandOf<UserId>; // "UserId"
 * ```
 */
export type BrandOf<T> = T extends Brand<any, infer B> ? B : never;

/**
 * Returns the value with a compile-time brand applied.
 *
 * This is a zero-cost identity function — at runtime it simply returns `value`.
 * The brand is purely a TypeScript-level wrapper for nominal typing.
 *
 * @typeParam T - The underlying type of the value.
 * @typeParam B - The brand string (e.g. `"UserId"`, `"Meters"`).
 * @param value - The value to brand.
 * @returns The same value, typed as `Brand<T, B>`.
 *
 * @example
 * ```ts
 * const uid = brand<string, "UserId">("usr_1");
 * // uid: Brand<string, "UserId">
 *
 * // With inference from an explicit type annotation:
 * type UserId = Brand<string, "UserId">;
 * const uid2: UserId = brand("usr_2");
 * ```
 */
export function brand<T, B extends string>(value: T): Brand<T, B> {
  return value as Brand<T, B>;
}
