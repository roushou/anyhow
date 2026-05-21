/**
 * Returns a new object containing only the given keys from `obj`.
 * Does not mutate the input.
 *
 * @typeParam T - The object type.
 * @typeParam K - The keys to keep.
 * @param obj - The source object.
 * @param keys - The keys to pick.
 * @returns A new object with only the picked keys.
 *
 * @example
 * ```ts
 * pick({ a: 1, b: 2, c: 3 }, ["a", "c"]); // { a: 1, c: 3 }
 * ```
 */
export function pick<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: readonly K[],
): Pick<T, K> {
  const result: Record<string, unknown> = {};
  for (let i = 0; i < keys.length; i++) {
    const k = keys[i]!;
    if (k in obj) {
      result[k as string] = obj[k];
    }
  }
  return result as Pick<T, K>;
}

/**
 * Returns a new object without the given keys from `obj`.
 * Does not mutate the input.
 *
 * @typeParam T - The object type.
 * @typeParam K - The keys to omit.
 * @param obj - The source object.
 * @param keys - The keys to omit.
 * @returns A new object without the omitted keys.
 *
 * @example
 * ```ts
 * omit({ a: 1, b: 2, c: 3 }, ["b"]); // { a: 1, c: 3 }
 * ```
 */
export function omit<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: readonly K[],
): Omit<T, K> {
  const keySet = new Set<K>(keys);
  const result: Record<string, unknown> = {};
  for (const k in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, k) && !keySet.has(k as unknown as K)) {
      result[k] = obj[k];
    }
  }
  return result as Omit<T, K>;
}

/**
 * Gets a nested property from an object via dot-path notation (`"a.b.c"`).
 * Returns `defaultValue` if any segment of the path is missing or if the
 * value at any intermediate segment is not an object.
 *
 * @typeParam T - The expected return type.
 * @param obj - The source object.
 * @param path - Dot-delimited path string.
 * @param defaultValue - Value returned when the path cannot be traversed (defaults to `undefined`).
 * @returns The value at the path, or `defaultValue`.
 *
 * @example
 * ```ts
 * get({ a: { b: { c: 42 } } }, "a.b.c"); // 42
 * get({ a: { b: { c: 42 } } }, "a.b.x", 99); // 99
 * get(null, "a.b", "fallback"); // "fallback"
 * ```
 */
export function get<T = unknown>(obj: unknown, path: string, defaultValue?: T): T | undefined {
  if (obj == null || typeof obj !== "object") {
    return defaultValue;
  }

  const segments = path.split(".");
  let current: unknown = obj;

  for (let i = 0; i < segments.length; i++) {
    if (current == null || typeof current !== "object") {
      return defaultValue;
    }
    current = (current as Record<string, unknown>)[segments[i]!];
  }

  return current === undefined ? defaultValue : (current as T);
}

/**
 * Returns a new object with a nested property set via dot-path notation (`"a.b.c"`).
 * Creates intermediate plain objects as needed. Does not mutate the input.
 *
 * @typeParam T - The object type.
 * @param obj - The source object.
 * @param path - Dot-delimited path string.
 * @param value - The value to set at the path.
 * @returns A new object with the value set at the specified path.
 *
 * @example
 * ```ts
 * set({ a: { b: {} } }, "a.b.c", 42); // { a: { b: { c: 42 } } }
 * set({}, "x.y", 1); // { x: { y: 1 } }
 * ```
 */
export function set<T extends Record<string, unknown>>(obj: T, path: string, value: unknown): T {
  if (path === "") return obj;
  const segments = path.split(".");

  return setAt(obj, segments, 0, value) as T;
}

function setAt(
  source: Record<string, unknown>,
  segments: string[],
  index: number,
  value: unknown,
): Record<string, unknown> {
  const key = segments[index]!;
  const isLeaf = index === segments.length - 1;

  if (isLeaf) {
    const result: Record<string, unknown> = {};
    for (const k in source) {
      if (Object.prototype.hasOwnProperty.call(source, k)) {
        result[k] = source[k];
      }
    }
    result[key] = value;
    return result;
  }

  const existing = source[key];
  const child: Record<string, unknown> =
    existing != null && typeof existing === "object" && !Array.isArray(existing)
      ? (existing as Record<string, unknown>)
      : {};

  const nested = setAt(child, segments, index + 1, value);

  const result: Record<string, unknown> = {};
  for (const k in source) {
    if (Object.prototype.hasOwnProperty.call(source, k)) {
      result[k] = source[k];
    }
  }
  result[key] = nested;
  return result;
}
