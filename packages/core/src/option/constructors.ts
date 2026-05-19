import type { Option } from "./types.js";

/**
 * Creates a `Some` variant of {@link Option}.
 *
 * @typeParam T - The value type.
 * @param value - The value to wrap in `Some`.
 * @returns An `Option<T>` with `some: true`.
 *
 * @example
 * ```ts
 * some(42); // { some: true, value: 42 }
 * some("hello"); // { some: true, value: "hello" }
 * ```
 */
export const some = <T>(value: T): Option<T> => ({ some: true, value });

/** Internal singleton used by {@link none}. */
const NONE: Option<never> = { some: false };

/**
 * Creates a `None` variant of {@link Option}, representing absence.
 *
 * Returns a singleton — every call to `none()` returns the same object,
 * so `none() === none()` is `true`.
 *
 * @returns A singleton `Option<never>` with `some: false`.
 *
 * @example
 * ```ts
 * none(); // { some: false }
 * none() === none(); // true
 * ```
 */
export const none = (): Option<never> => NONE;
