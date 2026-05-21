/**
 * Groups array elements by a key function into a plain object.
 * Unlike iter.groupBy (which returns `Map`), this returns a plain `Record`.
 *
 * @typeParam T - The array element type.
 * @typeParam K - The key type (must be a valid property key).
 * @param arr - The array to group.
 * @param key - A function that extracts the grouping key from each element.
 * @returns A plain object mapping keys to arrays of elements.
 *
 * @example
 * ```ts
 * groupBy([{ type: "a", n: 1 }, { type: "b", n: 2 }, { type: "a", n: 3 }], item => item.type);
 * // { a: [{ type: "a", n: 1 }, { type: "a", n: 3 }], b: [{ type: "b", n: 2 }] }
 * ```
 */
export function groupBy<T, K extends PropertyKey>(
  arr: readonly T[],
  key: (item: T) => K,
): Record<K, T[]> {
  const result = {} as Record<K, T[]>;
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i]!;
    const k = key(item);
    if (result[k] === undefined) {
      result[k] = [];
    }
    result[k]!.push(item);
  }
  return result;
}

/**
 * Indexes array elements by a key function into a plain object.
 * When multiple elements share the same key, the last one wins.
 *
 * @typeParam T - The array element type.
 * @typeParam K - The key type (must be a valid property key).
 * @param arr - The array to index.
 * @param key - A function that extracts the key from each element.
 * @returns A plain object mapping keys to elements.
 *
 * @example
 * ```ts
 * keyBy([{ id: "a", v: 1 }, { id: "b", v: 2 }, { id: "a", v: 3 }], item => item.id);
 * // { a: { id: "a", v: 3 }, b: { id: "b", v: 2 } }
 * ```
 */
export function keyBy<T, K extends PropertyKey>(
  arr: readonly T[],
  key: (item: T) => K,
): Record<K, T> {
  const result = {} as Record<K, T>;
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i]!;
    result[key(item)] = item;
  }
  return result;
}

/**
 * Sorts an array by a key function that returns a comparable value (`number` or `string`).
 * Uses `<` / `>` comparison. Does not mutate the input array.
 *
 * @typeParam T - The array element type.
 * @param arr - The array to sort.
 * @param key - A function that extracts a sortable value from each element.
 * @returns A new sorted array.
 *
 * @example
 * ```ts
 * sortBy([{ n: 3 }, { n: 1 }, { n: 2 }], item => item.n); // [{ n: 1 }, { n: 2 }, { n: 3 }]
 * sortBy(["apple", "banana", "cherry"], s => s.length); // ["apple", "cherry", "banana"]
 * ```
 */
export function sortBy<T>(arr: readonly T[], key: (item: T) => number | string): T[] {
  const copy = arr.slice();
  copy.sort((a: T, b: T) => {
    const ka = key(a);
    const kb = key(b);
    if (ka < kb) return -1;
    if (ka > kb) return 1;
    return 0;
  });
  return copy;
}

/**
 * Deduplicates an array by a key function, keeping the first occurrence of each key.
 *
 * @typeParam T - The array element type.
 * @param arr - The array to deduplicate.
 * @param key - A function that extracts a uniqueness key from each element.
 * @returns A new array with only the first occurrence of each key.
 *
 * @example
 * ```ts
 * uniqBy([{ id: 1, v: "a" }, { id: 2, v: "b" }, { id: 1, v: "c" }], item => item.id);
 * // [{ id: 1, v: "a" }, { id: 2, v: "b" }]
 * ```
 */
export function uniqBy<T>(arr: readonly T[], key: (item: T) => unknown): T[] {
  const seen = new Set<unknown>();
  const result: T[] = [];
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i]!;
    const k = key(item);
    if (!seen.has(k)) {
      seen.add(k);
      result.push(item);
    }
  }
  return result;
}

/**
 * Generates an array of numbers from `start` (inclusive) to `end` (exclusive).
 * If `step` is provided, increments by `step` instead of `1`. Stops before exceeding `end`.
 *
 * @param start - The starting number (inclusive).
 * @param end - The ending number (exclusive).
 * @param step - The step between consecutive numbers (defaults to `1`). Must be positive when `start < end`.
 * @returns An array of numbers in the range.
 *
 * @example
 * ```ts
 * range(0, 5); // [0, 1, 2, 3, 4]
 * range(0, 10, 2); // [0, 2, 4, 6, 8]
 * range(5, 0, -1); // [5, 4, 3, 2, 1]
 * ```
 */
export function range(start: number, end: number, step = 1): number[] {
  const result: number[] = [];
  if (step > 0) {
    for (let i = start; i < end; i += step) {
      result.push(i);
    }
  } else if (step < 0) {
    for (let i = start; i > end; i += step) {
      result.push(i);
    }
  }
  return result;
}

/**
 * Zips two arrays into a plain object where `keys[i]` maps to `values[i]`.
 * Extra keys or values beyond the shorter array are ignored.
 *
 * @typeParam K - The key type (must be a valid property key).
 * @typeParam V - The value type.
 * @param keys - The array of keys.
 * @param values - The array of values.
 * @returns A plain object mapping keys to values.
 *
 * @example
 * ```ts
 * zipObject(["a", "b", "c"], [1, 2, 3]); // { a: 1, b: 2, c: 3 }
 * ```
 */
export function zipObject<K extends PropertyKey, V>(
  keys: readonly K[],
  values: readonly V[],
): Record<K, V> {
  const result = {} as Record<K, V>;
  const len = Math.min(keys.length, values.length);
  for (let i = 0; i < len; i++) {
    result[keys[i]!] = values[i]!;
  }
  return result;
}

/**
 * Removes falsy values (`null`, `undefined`, `""`, `0`, `false`, `NaN`) from an array.
 *
 * @typeParam T - The non-falsy element type.
 * @param arr - The array to compact.
 * @returns A new array containing only truthy elements.
 *
 * @example
 * ```ts
 * compact([0, 1, false, 2, "", 3, null, undefined, NaN]); // [1, 2, 3]
 * ```
 */
export function compact<T>(arr: readonly (T | null | undefined | false | "" | 0)[]): T[] {
  const result: T[] = [];
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i]!;
    if (item) {
      result.push(item as T);
    }
  }
  return result;
}

/**
 * Returns elements in `a` that are not present in `b` (set difference).
 *
 * @typeParam T - The array element type.
 * @param a - The source array.
 * @param b - The array of values to exclude.
 * @returns A new array with elements from `a` not found in `b`.
 *
 * @example
 * ```ts
 * difference([1, 2, 3, 4], [2, 4]); // [1, 3]
 * ```
 */
export function difference<T>(a: readonly T[], b: readonly T[]): T[] {
  const bSet = new Set(b);
  const result: T[] = [];
  for (let i = 0; i < a.length; i++) {
    const item = a[i]!;
    if (!bSet.has(item)) {
      result.push(item);
    }
  }
  return result;
}

/**
 * Returns elements present in both `a` and `b` (set intersection).
 *
 * @typeParam T - The array element type.
 * @param a - The first array.
 * @param b - The second array.
 * @returns A new array with elements present in both arrays.
 *
 * @example
 * ```ts
 * intersection([1, 2, 3], [2, 3, 4]); // [2, 3]
 * ```
 */
export function intersection<T>(a: readonly T[], b: readonly T[]): T[] {
  const bSet = new Set(b);
  const result: T[] = [];
  for (let i = 0; i < a.length; i++) {
    const item = a[i]!;
    if (bSet.has(item)) {
      result.push(item);
    }
  }
  return result;
}

/**
 * Returns unique elements from both `a` and `b` combined (set union).
 *
 * @typeParam T - The array element type.
 * @param a - The first array.
 * @param b - The second array.
 * @returns A new array with unique elements from both arrays.
 *
 * @example
 * ```ts
 * union([1, 2], [2, 3]); // [1, 2, 3]
 * ```
 */
export function union<T>(a: readonly T[], b: readonly T[]): T[] {
  const seen = new Set(a);
  const result: T[] = [];
  for (let i = 0; i < a.length; i++) {
    result.push(a[i]!);
  }
  for (let i = 0; i < b.length; i++) {
    const item = b[i]!;
    if (!seen.has(item)) {
      seen.add(item);
      result.push(item);
    }
  }
  return result;
}
