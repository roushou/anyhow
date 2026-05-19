/**
 * Type guard: narrows `unknown` to `string`.
 *
 * @param v - The value to check.
 * @returns `true` if `v` is a string.
 *
 * @example
 * ```ts
 * if (isString(x)) x.toUpperCase(); // x is string
 * ```
 */
export const isString = (v: unknown): v is string => typeof v === "string";

/**
 * Type guard: narrows `unknown` to `number`.
 *
 * @param v - The value to check.
 * @returns `true` if `v` is a number.
 *
 * @example
 * ```ts
 * if (isNumber(x)) x.toFixed(2); // x is number
 * ```
 */
export const isNumber = (v: unknown): v is number => typeof v === "number";

/**
 * Type guard: narrows `unknown` to `boolean`.
 *
 * @param v - The value to check.
 * @returns `true` if `v` is a boolean.
 *
 * @example
 * ```ts
 * if (isBoolean(x)) console.log(x ? "yes" : "no"); // x is boolean
 * ```
 */
export const isBoolean = (v: unknown): v is boolean => typeof v === "boolean";

/**
 * Type guard: narrows `unknown` to `object` (excluding `null`).
 *
 * @param v - The value to check.
 * @returns `true` if `v` is a non-null object.
 *
 * @example
 * ```ts
 * if (isObject(x)) Object.keys(x); // x is object
 * ```
 */
export const isObject = (v: unknown): v is object => !!v && typeof v === "object";

/**
 * Type guard: narrows to {@link NonNullable}, excluding `null` and `undefined`.
 *
 * @typeParam T - The type of the value.
 * @param v - The value to check.
 * @returns `true` if `v` is not `null` and not `undefined`.
 *
 * @example
 * ```ts
 * const items: (number | null)[] = [1, null, 2];
 * const defined = items.filter(isDefined); // number[]
 * ```
 */
export const isDefined = <T>(v: T): v is NonNullable<T> => v !== null && v !== undefined;
