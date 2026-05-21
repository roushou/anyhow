// ── generators (lazy) ──

/**
 * Lazily transforms each element of an iterable using `fn`.
 *
 * @typeParam T - The input element type.
 * @typeParam U - The output element type.
 * @param iter - The source iterable.
 * @param fn - The transformation, receiving `(item, index)`.
 * @returns A generator yielding transformed values.
 *
 * @example
 * ```ts
 * [...map([1, 2, 3], n => n * 2)]; // [2, 4, 6]
 * ```
 */
export function* map<T, U>(iter: Iterable<T>, fn: (item: T, index: number) => U): Generator<U> {
  let i = 0;
  for (const item of iter) yield fn(item, i++);
}

/**
 * Lazily yields only elements that satisfy `pred`.
 *
 * @typeParam T - The element type.
 * @param iter - The source iterable.
 * @param pred - The predicate, receiving `(item, index)`.
 * @returns A generator yielding matching elements.
 *
 * @example
 * ```ts
 * [...filter([1, 2, 3, 4], n => n % 2 === 0)]; // [2, 4]
 * ```
 */
export function* filter<T>(
  iter: Iterable<T>,
  pred: (item: T, index: number) => boolean,
): Generator<T> {
  let i = 0;
  for (const item of iter) {
    if (pred(item, i++)) yield item;
  }
}

/**
 * Lazily maps each element to an iterable and flattens the result by one level.
 *
 * @typeParam T - The input element type.
 * @typeParam U - The output element type.
 * @param iter - The source iterable.
 * @param fn - The flat-mapping function, receiving `(item, index)`.
 * @returns A generator yielding flattened values.
 *
 * @example
 * ```ts
 * [...flatMap([1, 2], n => [n, n * 2])]; // [1, 2, 2, 4]
 * ```
 */
export function* flatMap<T, U>(
  iter: Iterable<T>,
  fn: (item: T, index: number) => Iterable<U>,
): Generator<U> {
  let i = 0;
  for (const item of iter) yield* fn(item, i++);
}

/**
 * Lazily yields at most `n` elements from the iterable.
 *
 * @typeParam T - The element type.
 * @param iter - The source iterable.
 * @param n - Maximum number of elements to yield.
 * @returns A generator yielding at most `n` elements.
 *
 * @example
 * ```ts
 * [...take([1, 2, 3, 4, 5], 3)]; // [1, 2, 3]
 * ```
 */
export function* take<T>(iter: Iterable<T>, n: number): Generator<T> {
  let i = 0;
  for (const item of iter) {
    if (i++ >= n) break;
    yield item;
  }
}

/**
 * Lazily skips the first `n` elements of an iterable.
 *
 * @typeParam T - The element type.
 * @param iter - The source iterable.
 * @param n - Number of elements to skip.
 * @returns A generator yielding elements after the first `n`.
 *
 * @example
 * ```ts
 * [...skip([1, 2, 3, 4, 5], 2)]; // [3, 4, 5]
 * ```
 */
export function* skip<T>(iter: Iterable<T>, n: number): Generator<T> {
  let i = 0;
  for (const item of iter) {
    if (i++ < n) continue;
    yield item;
  }
}

/**
 * Lazily yields `[index, element]` pairs from the iterable.
 *
 * @typeParam T - The element type.
 * @param iter - The source iterable.
 * @returns A generator yielding `[index, element]` tuples.
 *
 * @example
 * ```ts
 * [...enumerate(["a", "b"])]; // [[0, "a"], [1, "b"]]
 * ```
 */
export function* enumerate<T>(iter: Iterable<T>): Generator<[number, T]> {
  let i = 0;
  for (const item of iter) yield [i++, item];
}

/**
 * Lazily yields only the first occurrence of each element (or each key).
 *
 * @typeParam T - The element type.
 * @param iter - The source iterable.
 * @param key - Optional function to extract a uniqueness key.
 * @returns A generator yielding deduplicated values.
 *
 * @example
 * ```ts
 * [...unique([1, 2, 2, 3, 3, 3])]; // [1, 2, 3]
 * [...unique([{id:1}, {id:1}, {id:2}], x => x.id)]; // [{id:1}, {id:2}]
 * ```
 */
export function* unique<T>(iter: Iterable<T>, key?: (i: T) => unknown): Generator<T> {
  const seen = new Set();
  for (const item of iter) {
    const k = key ? key(item) : item;
    if (!seen.has(k)) {
      seen.add(k);
      yield item;
    }
  }
}

/**
 * Lazily zips two iterables together, stopping at the shorter one.
 *
 * @typeParam A - The first iterable's element type.
 * @typeParam B - The second iterable's element type.
 * @param a - The first iterable.
 * @param b - The second iterable.
 * @returns A generator yielding `[a, b]` tuples.
 *
 * @example
 * ```ts
 * [...zip(["a", "b"], [1, 2])]; // [["a", 1], ["b", 2]]
 * ```
 */
export function* zip<A, B>(a: Iterable<A>, b: Iterable<B>): Generator<[A, B]> {
  const ib = b[Symbol.iterator]();
  for (const a_ of a) {
    const { value, done } = ib.next();
    if (done) break;
    yield [a_, value];
  }
}

/**
 * Lazily yields arrays of at most `size` elements from the iterable.
 *
 * @typeParam T - The element type.
 * @param iter - The source iterable.
 * @param size - Maximum chunk size.
 * @returns A generator yielding arrays of elements.
 *
 * @example
 * ```ts
 * [...chunk([1, 2, 3, 4, 5], 2)]; // [[1, 2], [3, 4], [5]]
 * ```
 */
export function* chunk<T>(iter: Iterable<T>, size: number): Generator<T[]> {
  let buf: T[] = [];
  for (const item of iter) {
    buf.push(item);
    if (buf.length === size) {
      yield buf;
      buf = [];
    }
  }
  if (buf.length) yield buf;
}

/**
 * Lazily yields elements while `pred` returns `true`.
 * Stops at the first element that fails the predicate.
 *
 * @typeParam T - The element type.
 * @param iter - The source iterable.
 * @param pred - The predicate, receiving `(item, index)`.
 * @returns A generator yielding elements until `pred` returns `false`.
 *
 * @example
 * ```ts
 * [...takeWhile([1, 2, 3, 0, 4], n => n > 0)]; // [1, 2, 3]
 * ```
 */
export function* takeWhile<T>(
  iter: Iterable<T>,
  pred: (item: T, index: number) => boolean,
): Generator<T> {
  let i = 0;
  for (const item of iter) {
    if (!pred(item, i++)) break;
    yield item;
  }
}

/**
 * Lazily skips elements while `pred` returns `true`.
 * Yields every element after the first failure.
 *
 * @typeParam T - The element type.
 * @param iter - The source iterable.
 * @param pred - The predicate, receiving `(item, index)`.
 * @returns A generator yielding elements after `pred` returns `false`.
 *
 * @example
 * ```ts
 * [...skipWhile([0, 0, 1, 2], n => n === 0)]; // [1, 2]
 * ```
 */
export function* skipWhile<T>(
  iter: Iterable<T>,
  pred: (item: T, index: number) => boolean,
): Generator<T> {
  let i = 0;
  let skipping = true;
  for (const item of iter) {
    if (skipping && pred(item, i++)) continue;
    skipping = false;
    yield item;
  }
}

/**
 * Lazily yields intermediate reduction values.
 * Like {@link reduce}, but emits every accumulator value.
 *
 * @typeParam T - The element type.
 * @typeParam U - The accumulator type.
 * @param iter - The source iterable.
 * @param fn - The reducer, receiving `(accumulator, item, index)`.
 * @param initial - The initial accumulator value.
 * @returns A generator yielding the accumulator after each element.
 *
 * @example
 * ```ts
 * [...scan([1, 2, 3, 4], (sum, n) => sum + n, 0)]; // [1, 3, 6, 10]
 * ```
 */
export function* scan<T, U>(
  iter: Iterable<T>,
  fn: (acc: U, item: T, index: number) => U,
  initial: U,
): Generator<U> {
  let acc = initial;
  let i = 0;
  for (const item of iter) {
    acc = fn(acc, item, i++);
    yield acc;
  }
}

/**
 * Lazily repeats an iterable indefinitely. Combine with {@link take} to limit.
 *
 * @typeParam T - The element type.
 * @param iter - The source iterable.
 * @returns A generator that cycles through the iterable forever.
 *
 * @example
 * ```ts
 * [...take(cycle([1, 2, 3]), 5)]; // [1, 2, 3, 1, 2]
 * ```
 */
export function* cycle<T>(iter: Iterable<T>): Generator<T> {
  const cache: T[] = [];
  for (const item of iter) {
    cache.push(item);
    yield item;
  }
  while (cache.length > 0) {
    for (const item of cache) yield item;
  }
}

// ── terminal (eager) ──

/**
 * Returns the first element of an iterable, or `undefined` if empty.
 *
 * @typeParam T - The element type.
 * @param iter - The source iterable.
 * @returns The first element, or `undefined`.
 *
 * @example
 * ```ts
 * first([1, 2, 3]); // 1
 * first([]); // undefined
 * ```
 */
export function first<T>(iter: Iterable<T>): T | undefined {
  const { value } = iter[Symbol.iterator]().next();
  return value;
}

/**
 * Returns the last element of an iterable, or `undefined` if empty.
 * Consumes the entire iterable.
 *
 * @typeParam T - The element type.
 * @param iter - The source iterable.
 * @returns The last element, or `undefined`.
 *
 * @example
 * ```ts
 * last([1, 2, 3]); // 3
 * last([]); // undefined
 * ```
 */
export function last<T>(iter: Iterable<T>): T | undefined {
  let last: T | undefined;
  for (const item of iter) last = item;
  return last;
}

/**
 * Counts the number of elements in an iterable. Consumes the entire iterable.
 *
 * @param iter - The source iterable.
 * @returns The number of elements.
 *
 * @example
 * ```ts
 * count([1, 2, 3]); // 3
 * ```
 */
export function count(iter: Iterable<unknown>): number {
  let n = 0;
  for (const _ of iter) n++;
  return n;
}

/**
 * Returns the first element that satisfies `pred`, or `undefined`.
 *
 * @typeParam T - The element type.
 * @param iter - The source iterable.
 * @param pred - The predicate, receiving `(item, index)`.
 * @returns The first matching element, or `undefined`.
 *
 * @example
 * ```ts
 * find([1, 2, 3, 4], n => n > 2); // 3
 * ```
 */
export function find<T>(
  iter: Iterable<T>,
  pred: (item: T, index: number) => boolean,
): T | undefined {
  let i = 0;
  for (const item of iter) {
    if (pred(item, i++)) return item;
  }
}

/**
 * Returns `true` if any element satisfies `pred`. Short-circuits on first match.
 *
 * @typeParam T - The element type.
 * @param iter - The source iterable.
 * @param pred - The predicate, receiving `(item, index)`.
 * @returns `true` if at least one element matches.
 *
 * @example
 * ```ts
 * some([1, 2, 3], n => n > 2); // true
 * some([1, 2, 3], n => n > 5); // false
 * ```
 */
export function some<T>(iter: Iterable<T>, pred: (item: T, index: number) => boolean): boolean {
  let i = 0;
  for (const item of iter) {
    if (pred(item, i++)) return true;
  }
  return false;
}

/**
 * Returns `true` if every element satisfies `pred`. Short-circuits on first failure.
 *
 * @typeParam T - The element type.
 * @param iter - The source iterable.
 * @param pred - The predicate, receiving `(item, index)`.
 * @returns `true` if all elements match.
 *
 * @example
 * ```ts
 * every([2, 4, 6], n => n % 2 === 0); // true
 * every([2, 3, 6], n => n % 2 === 0); // false
 * ```
 */
export function every<T>(iter: Iterable<T>, pred: (item: T, index: number) => boolean): boolean {
  let i = 0;
  for (const item of iter) {
    if (!pred(item, i++)) return false;
  }
  return true;
}

/**
 * Reduces an iterable to a single value by repeatedly applying `fn`.
 *
 * @typeParam T - The element type.
 * @typeParam U - The accumulator type.
 * @param iter - The source iterable.
 * @param fn - The reducer, receiving `(accumulator, item, index)`.
 * @param initial - The initial accumulator value.
 * @returns The final accumulated value.
 *
 * @example
 * ```ts
 * reduce([1, 2, 3], (sum, n) => sum + n, 0); // 6
 * ```
 */
export function reduce<T, U>(
  iter: Iterable<T>,
  fn: (acc: U, item: T, index: number) => U,
  initial: U,
): U {
  let acc = initial;
  let i = 0;
  for (const item of iter) acc = fn(acc, item, i++);
  return acc;
}

/**
 * Calls `fn` for each element of the iterable.
 *
 * @typeParam T - The element type.
 * @param iter - The source iterable.
 * @param fn - The callback, receiving `(item, index)`.
 *
 * @example
 * ```ts
 * forEach([1, 2, 3], n => console.log(n));
 * ```
 */
export function forEach<T>(iter: Iterable<T>, fn: (item: T, index: number) => void): void {
  let i = 0;
  for (const item of iter) fn(item, i++);
}

/**
 * Groups elements of an iterable by a key function into a `Map`.
 *
 * @typeParam T - The element type.
 * @typeParam K - The key type.
 * @param iter - The source iterable.
 * @param key - The grouping function.
 * @returns A `Map<K, T[]>`.
 *
 * @example
 * ```ts
 * groupBy([1, 2, 3, 4, 5], n => n % 2 === 0 ? "even" : "odd");
 * // Map { "odd" => [1, 3, 5], "even" => [2, 4] }
 * ```
 */
export function groupBy<T, K extends PropertyKey>(
  iter: Iterable<T>,
  key: (i: T) => K,
): Map<K, T[]> {
  const m = new Map<K, T[]>();
  for (const item of iter) {
    const k = key(item);
    if (!m.has(k)) m.set(k, []);
    m.get(k)!.push(item);
  }
  return m;
}

/**
 * Sorts an iterable by a key function. Eager — consumes the iterable.
 *
 * @typeParam T - The element type.
 * @param iter - The source iterable.
 * @param key - A function extracting a sort key from each element.
 * @returns A sorted array.
 *
 * @example
 * ```ts
 * sortBy([{n:3}, {n:1}, {n:2}], x => x.n); // [{n:1}, {n:2}, {n:3}]
 * ```
 */
export function sortBy<T>(iter: Iterable<T>, key: (item: T) => number | string): T[] {
  return [...iter].sort((a, b) => {
    const ka = key(a);
    const kb = key(b);
    return ka < kb ? -1 : ka > kb ? 1 : 0;
  });
}

/**
 * Splits an iterable into two arrays based on a predicate. Eager.
 *
 * @typeParam T - The element type.
 * @param iter - The source iterable.
 * @param pred - The predicate, receiving `(item, index)`.
 * @returns `{ matching: T[]; rest: T[] }`.
 *
 * @example
 * ```ts
 * partition([1, 2, 3, 4], n => n % 2 === 0);
 * // { matching: [2, 4], rest: [1, 3] }
 * ```
 */
export function partition<T>(
  iter: Iterable<T>,
  pred: (item: T, index: number) => boolean,
): { matching: T[]; rest: T[] } {
  const matching: T[] = [];
  const rest: T[] = [];
  let i = 0;
  for (const item of iter) {
    if (pred(item, i++)) matching.push(item);
    else rest.push(item);
  }
  return { matching, rest };
}
