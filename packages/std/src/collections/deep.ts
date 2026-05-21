/**
 * Deeply merges `source` into `target`. Arrays are concatenated.
 * Plain objects are merged recursively. Primitives are replaced by `source` values.
 * Neither input is mutated.
 *
 * @typeParam T - The object type.
 * @param target - The base object.
 * @param source - The object whose values take precedence.
 * @returns A new deeply-merged object.
 *
 * @example
 * ```ts
 * deepMerge({ a: 1, b: { x: 1 } }, { b: { y: 2 }, c: 3 });
 * // { a: 1, b: { x: 1, y: 2 }, c: 3 }
 * deepMerge({ arr: [1, 2] }, { arr: [3, 4] });
 * // { arr: [1, 2, 3, 4] }
 * ```
 */
export function deepMerge<T extends Record<string, unknown>>(target: T, source: T): T {
  const result: Record<string, unknown> = {};

  const allKeys = new Set<string>([...Object.keys(target), ...Object.keys(source)]);

  for (const key of allKeys) {
    const tv = target[key];
    const sv = source[key];

    if (key in source === false) {
      result[key] = tv;
    } else if (key in target === false) {
      result[key] = sv;
    } else if (Array.isArray(tv) && Array.isArray(sv)) {
      result[key] = [...tv, ...sv];
    } else if (isPlainObject(tv) && isPlainObject(sv)) {
      result[key] = deepMerge(tv as Record<string, unknown>, sv as Record<string, unknown>);
    } else {
      result[key] = sv;
    }
  }

  return result as T;
}

/**
 * Returns a structurally identical deep clone of `value`.
 * Handles objects, arrays, `Date`, `RegExp`, `Map`, and `Set`.
 * Primitives are returned as-is. Supports circular references.
 *
 * @typeParam T - The type of the value to clone.
 * @param value - The value to deeply clone.
 * @returns A new deep clone of `value`.
 *
 * @example
 * ```ts
 * const original = { a: 1, b: { c: [1, 2, 3] } };
 * const cloned = deepClone(original);
 * cloned.b.c.push(4);
 * original.b.c; // [1, 2, 3] — original is untouched
 * ```
 */
export function deepClone<T>(value: T): T {
  const refs = new WeakMap<object, object>();
  return cloneInternal(value, refs);
}

function cloneInternal<T>(value: T, refs: WeakMap<object, object>): T {
  if (value == null || typeof value !== "object") {
    return value;
  }

  const existing = refs.get(value as object);
  if (existing !== undefined) {
    return existing as T;
  }

  if (value instanceof Date) {
    const copy = new Date(value.getTime());
    refs.set(value as Date, copy);
    return copy as T;
  }

  if (value instanceof RegExp) {
    const copy = new RegExp(value.source, value.flags);
    refs.set(value as RegExp, copy);
    return copy as T;
  }

  if (value instanceof Map) {
    const copy = new Map<unknown, unknown>();
    refs.set(value as Map<unknown, unknown>, copy);
    for (const [k, v] of value) {
      copy.set(cloneInternal(k, refs), cloneInternal(v, refs));
    }
    return copy as T;
  }

  if (value instanceof Set) {
    const copy = new Set<unknown>();
    refs.set(value as Set<unknown>, copy);
    for (const v of value) {
      copy.add(cloneInternal(v, refs));
    }
    return copy as T;
  }

  if (Array.isArray(value)) {
    const copy: unknown[] = [];
    refs.set(value, copy);
    for (let i = 0; i < value.length; i++) {
      copy.push(cloneInternal(value[i], refs));
    }
    return copy as T;
  }

  if (isPlainObject(value)) {
    const copy: Record<string, unknown> = {};
    refs.set(value as Record<string, unknown>, copy);
    for (const k in value) {
      if (Object.prototype.hasOwnProperty.call(value, k)) {
        copy[k] = cloneInternal((value as Record<string, unknown>)[k], refs);
      }
    }
    return copy as T;
  }

  return value;
}

/**
 * Returns `true` if `a` and `b` are structurally equal.
 * Handles objects, arrays, `Date`, `RegExp`, `Map`, and `Set`.
 * Primitives use `===`. Supports circular references.
 *
 * @param a - The first value to compare.
 * @param b - The second value to compare.
 * @returns `true` if the values are structurally equal.
 *
 * @example
 * ```ts
 * deepEqual({ a: 1, b: [2, 3] }, { a: 1, b: [2, 3] }); // true
 * deepEqual({ a: 1 }, { a: 1, b: 2 }); // false
 * deepEqual(new Date(1000), new Date(1000)); // true
 * ```
 */
export function deepEqual(a: unknown, b: unknown): boolean {
  const seen = new Map<object, Set<object>>();
  return equalInternal(a, b, seen);
}

function equalInternal(a: unknown, b: unknown, seen: Map<object, Set<object>>): boolean {
  // Same reference (handles primitives and identical objects)
  if (a === b) return true;

  // NaN !== NaN, so handle it explicitly
  if (typeof a === "number" && typeof b === "number" && Number.isNaN(a) && Number.isNaN(b)) {
    return true;
  }

  // Null/undefined checks (typeof null === "object")
  if (a == null || b == null) return a === b;

  if (typeof a !== "object" || typeof b !== "object") return false;

  // Circular reference detection
  if (seen.has(a as object)) {
    return seen.get(a as object)!.has(b as object);
  }
  let pair = seen.get(a as object);
  if (!pair) {
    pair = new Set<object>();
    seen.set(a as object, pair);
  }
  pair.add(b as object);

  // Different constructors
  if (a.constructor !== b.constructor) return false;

  if (a instanceof Date) {
    return (a as Date).getTime() === (b as Date).getTime();
  }

  if (a instanceof RegExp) {
    return a.source === (b as RegExp).source && a.flags === (b as RegExp).flags;
  }

  if (a instanceof Map) {
    const ma = a as Map<unknown, unknown>;
    const mb = b as Map<unknown, unknown>;
    if (ma.size !== mb.size) return false;
    for (const [k, v] of ma) {
      if (!mb.has(k) || !equalInternal(v, mb.get(k), seen)) return false;
    }
    return true;
  }

  if (a instanceof Set) {
    const sa = a as Set<unknown>;
    const sb = b as Set<unknown>;
    if (sa.size !== sb.size) return false;
    const sbArr = [...sb];
    for (const va of sa) {
      let found = false;
      for (let i = 0; i < sbArr.length; i++) {
        if (equalInternal(va, sbArr[i]!, seen)) {
          found = true;
          break;
        }
      }
      if (!found) return false;
    }
    return true;
  }

  if (Array.isArray(a)) {
    if (!Array.isArray(b)) return false;
    const aa = a as unknown[];
    const ab = b as unknown[];
    if (aa.length !== ab.length) return false;
    for (let i = 0; i < aa.length; i++) {
      if (!equalInternal(aa[i], ab[i], seen)) return false;
    }
    return true;
  }

  if (isPlainObject(a)) {
    const oa = a as Record<string, unknown>;
    const ob = b as Record<string, unknown>;
    const keysA = Object.keys(oa);
    const keysB = Object.keys(ob);
    if (keysA.length !== keysB.length) return false;
    for (let i = 0; i < keysA.length; i++) {
      const k = keysA[i]!;
      if (!Object.prototype.hasOwnProperty.call(ob, k)) return false;
      if (!equalInternal(oa[k], ob[k], seen)) return false;
    }
    return true;
  }

  return false;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value == null || typeof value !== "object") return false;
  const proto = Object.getPrototypeOf(value);
  return proto === null || proto === Object.prototype;
}
