/**
 * Type-narrowing guard: proves that `obj` has a property `key`.
 *
 * ```ts
 * const data: unknown = { name: "Alice" };
 * if (hasProperty(data, "name")) {
 *   data.name; // unknown — you know it exists
 * }
 * ```
 *
 * Pass a second guard to narrow the property's value type:
 *
 * ```ts
 * if (hasProperty(data, "name", isString)) {
 *   data.name; // string
 * }
 * ```
 */
export function hasProperty<K extends string>(obj: unknown, key: K): obj is Record<K, unknown>;
export function hasProperty<K extends string, V>(
  obj: unknown,
  key: K,
  guard: (v: unknown) => v is V,
): obj is Record<K, V>;
export function hasProperty<K extends string, V>(
  obj: unknown,
  key: K,
  guard?: (v: unknown) => v is V,
): obj is Record<K, V> {
  if (typeof obj !== "object" || obj === null) return false;
  if (!(key in obj)) return false;
  if (guard) {
    return guard((obj as Record<K, unknown>)[key]);
  }
  return true;
}

/**
 * Type-narrowing guard: proves that `arr` is an array and every element
 * passes `guard`.
 *
 * ```ts
 * const data: unknown = [1, 2, 3];
 * if (isArrayOf(data, isNumber)) {
 *   data; // number[]
 * }
 * ```
 */
export function isArrayOf<T>(arr: unknown, guard: (v: unknown) => v is T): arr is T[] {
  return Array.isArray(arr) && arr.every(guard);
}
