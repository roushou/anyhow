// ── Primitives ──

/** @see isString */
const _isString = (v: unknown): v is string => typeof v === "string";

/** @see isNumber */
const _isNumber = (v: unknown): v is number => typeof v === "number";

/** @see isBoolean */
const _isBoolean = (v: unknown): v is boolean => typeof v === "boolean";

/** @see isSymbol */
const _isSymbol = (v: unknown): v is symbol => typeof v === "symbol";

/** @see isBigInt */
const _isBigInt = (v: unknown): v is bigint => typeof v === "bigint";

/** @see isFunction */
const _isFunction = (v: unknown): v is (...args: unknown[]) => unknown => typeof v === "function";

/** @see isObject */
const _isObject = (v: unknown): v is object => !!v && typeof v === "object";

/** @see isPrimitive */
const _isPrimitive = (
  v: unknown,
): v is string | number | boolean | symbol | bigint | null | undefined =>
  v === null || (typeof v !== "object" && typeof v !== "function");

// ── Structural ──

/** @see isArray */
const _isArray = (v: unknown): v is unknown[] => Array.isArray(v);

/** @see isDate */
const _isDate = (v: unknown): v is Date => v instanceof Date;

/** @see isRegExp */
const _isRegExp = (v: unknown): v is RegExp => v instanceof RegExp;

/** @see isError */
const _isError = (v: unknown): v is Error => v instanceof Error;

/** @see isMap */
const _isMap = (v: unknown): v is Map<unknown, unknown> => v instanceof Map;

/** @see isSet */
const _isSet = (v: unknown): v is Set<unknown> => v instanceof Set;

/** @see isPromise */
const _isPromise = (v: unknown): v is Promise<unknown> =>
  v instanceof Promise || (!!v && typeof (v as any).then === "function");

/** @see isIterable */
const _isIterable = (v: unknown): v is Iterable<unknown> =>
  !!v && typeof (v as any)[Symbol.iterator] === "function";

/** @see isAsyncIterable */
const _isAsyncIterable = (v: unknown): v is AsyncIterable<unknown> =>
  !!v && typeof (v as any)[Symbol.asyncIterator] === "function";

// ── Nullability ──

/** @see isNull */
const _isNull = (v: unknown): v is null => v === null;

/** @see isUndefined */
const _isUndefined = (v: unknown): v is undefined => v === undefined;

/** @see isDefined */
const _isDefined = <T>(v: T): v is NonNullable<T> => v !== null && v !== undefined;

/** @see isNotNullish */
const _isNotNullish = _isDefined;

/** @see isTruthy */
const _isTruthy = <T>(v: T): v is Exclude<T, 0 | "" | false | null | undefined> => !!v;

/** @see isFalsy */
const _isFalsy = (v: unknown): v is 0 | "" | false | null | undefined => !v;

// ── Re-exports with JSDoc ──

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
export const isString = _isString;

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
export const isNumber = _isNumber;

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
export const isBoolean = _isBoolean;

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
export const isObject = _isObject;

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
export const isDefined = _isDefined;

/**
 * Type guard: narrows `unknown` to `symbol`.
 *
 * @param v - The value to check.
 * @returns `true` if `v` is a symbol.
 *
 * @example
 * ```ts
 * if (isSymbol(x)) console.log(x.description); // x is symbol
 * ```
 */
export const isSymbol = _isSymbol;

/**
 * Type guard: narrows `unknown` to `bigint`.
 *
 * @param v - The value to check.
 * @returns `true` if `v` is a bigint.
 *
 * @example
 * ```ts
 * if (isBigInt(x)) console.log(x + 1n); // x is bigint
 * ```
 */
export const isBigInt = _isBigInt;

/**
 * Type guard: narrows `unknown` to a function.
 *
 * @param v - The value to check.
 * @returns `true` if `v` is a function.
 *
 * @example
 * ```ts
 * if (isFunction(x)) x(); // x is (...args: unknown[]) => unknown
 * ```
 */
export const isFunction = _isFunction;

/**
 * Type guard: narrows `unknown` to a primitive (string, number, boolean,
 * symbol, bigint, null, or undefined).
 *
 * @param v - The value to check.
 * @returns `true` if `v` is a primitive.
 *
 * @example
 * ```ts
 * if (isPrimitive(x)) { x; } // x is string | number | boolean | ...
 * ```
 */
export const isPrimitive = _isPrimitive;

/**
 * Type guard: narrows `unknown` to an array.
 *
 * @param v - The value to check.
 * @returns `true` if `v` is an array.
 *
 * @example
 * ```ts
 * if (isArray(x)) console.log(x.length); // x is unknown[]
 * ```
 */
export const isArray = _isArray;

/**
 * Type guard: narrows `unknown` to a `Date`.
 *
 * @param v - The value to check.
 * @returns `true` if `v` is a `Date` instance.
 *
 * @example
 * ```ts
 * if (isDate(x)) console.log(x.toISOString()); // x is Date
 * ```
 */
export const isDate = _isDate;

/**
 * Type guard: narrows `unknown` to a `RegExp`.
 *
 * @param v - The value to check.
 * @returns `true` if `v` is a `RegExp` instance.
 *
 * @example
 * ```ts
 * if (isRegExp(x)) console.log(x.source); // x is RegExp
 * ```
 */
export const isRegExp = _isRegExp;

/**
 * Type guard: narrows `unknown` to an `Error`.
 *
 * @param v - The value to check.
 * @returns `true` if `v` is an `Error` instance.
 *
 * @example
 * ```ts
 * if (isError(x)) console.log(x.message); // x is Error
 * ```
 */
export const isError = _isError;

/**
 * Type guard: narrows `unknown` to a `Map`.
 *
 * @param v - The value to check.
 * @returns `true` if `v` is a `Map` instance.
 *
 * @example
 * ```ts
 * if (isMap(x)) console.log(x.size); // x is Map<unknown, unknown>
 * ```
 */
export const isMap = _isMap;

/**
 * Type guard: narrows `unknown` to a `Set`.
 *
 * @param v - The value to check.
 * @returns `true` if `v` is a `Set` instance.
 *
 * @example
 * ```ts
 * if (isSet(x)) console.log(x.size); // x is Set<unknown>
 * ```
 */
export const isSet = _isSet;

/**
 * Type guard: narrows `unknown` to a `Promise`.
 *
 * @param v - The value to check.
 * @returns `true` if `v` is a `Promise` (or a thenable).
 *
 * @example
 * ```ts
 * if (isPromise(x)) x.then(v => console.log(v)); // x is Promise<unknown>
 * ```
 */
export const isPromise = _isPromise;

/**
 * Type guard: narrows `unknown` to an `Iterable`.
 *
 * @param v - The value to check.
 * @returns `true` if `v` is iterable.
 *
 * @example
 * ```ts
 * if (isIterable(x)) { for (const item of x) { ... } } // x is Iterable<unknown>
 * ```
 */
export const isIterable = _isIterable;

/**
 * Type guard: narrows `unknown` to an `AsyncIterable`.
 *
 * @param v - The value to check.
 * @returns `true` if `v` is an async iterable.
 *
 * @example
 * ```ts
 * if (isAsyncIterable(x)) { for await (const item of x) { ... } }
 * ```
 */
export const isAsyncIterable = _isAsyncIterable;

/**
 * Type guard: narrows to `null`.
 *
 * @param v - The value to check.
 * @returns `true` if `v` is `null`.
 *
 * @example
 * ```ts
 * if (isNull(x)) { ... } // x is null
 * ```
 */
export const isNull = _isNull;

/**
 * Type guard: narrows to `undefined`.
 *
 * @param v - The value to check.
 * @returns `true` if `v` is `undefined`.
 *
 * @example
 * ```ts
 * if (isUndefined(x)) { ... } // x is undefined
 * ```
 */
export const isUndefined = _isUndefined;

/**
 * Type guard: narrows to non-nullish values. Alias for {@link isDefined}.
 *
 * @typeParam T - The type of the value.
 * @param v - The value to check.
 * @returns `true` if `v` is not `null` and not `undefined`.
 *
 * @example
 * ```ts
 * if (isNotNullish(x)) x; // x is NonNullable<T>
 * ```
 */
export const isNotNullish = _isNotNullish;

/**
 * Type guard: narrows to truthy values (excludes `0`, `""`, `false`, `null`, `undefined`).
 *
 * @typeParam T - The type of the value.
 * @param v - The value to check.
 * @returns `true` if `v` is truthy.
 *
 * @example
 * ```ts
 * if (isTruthy(x)) x; // x is Exclude<T, 0 | "" | false | null | undefined>
 * ```
 */
export const isTruthy = _isTruthy;

/**
 * Type guard: narrows to falsy values (`0`, `""`, `false`, `null`, `undefined`).
 *
 * @param v - The value to check.
 * @returns `true` if `v` is falsy.
 *
 * @example
 * ```ts
 * if (isFalsy(x)) { ... } // x is 0 | "" | false | null | undefined
 * ```
 */
export const isFalsy = _isFalsy;
