interface Entry<V> {
  v: V;
  exp: number | null;
}

/**
 * A fixed-capacity LRU cache with optional per-entry TTL.
 *
 * When the cache exceeds `maxSize`, the oldest entry (by insertion order)
 * is evicted.  A get/set on an existing key refreshes its position.
 */
export class LRU<K = string, V = unknown> {
  readonly maxSize: number;
  readonly ttlMs?: number;

  #map = new Map<K, Entry<V>>();

  constructor(maxSize: number, ttlMs?: number) {
    this.maxSize = maxSize;
    this.ttlMs = ttlMs;
  }

  /**
   * Retrieve a value, returning `undefined` if missing or expired.
   * Refreshes the key's position so it is treated as recently used.
   *
   * @param key - The cache key to look up.
   * @returns The cached value, or `undefined` if missing or expired.
   *
   * @example
   * ```ts
   * const cache = new LRU<string, number>(100, 5000);
   * cache.set("a", 1);
   * cache.get("a"); // 1
   * cache.get("b"); // undefined
   * ```
   */
  get(key: K): V | undefined {
    const entry = this.#map.get(key);
    if (!entry) return undefined;
    if (entry.exp !== null && Date.now() > entry.exp) {
      this.#map.delete(key);
      return undefined;
    }
    // Refresh position – delete + re-insert
    this.#map.delete(key);
    this.#map.set(key, entry);
    return entry.v;
  }

  /**
   * Insert or update a value. Refreshes the key's position so it is
   * treated as recently used. When the cache exceeds `maxSize`, the
   * oldest entry is evicted.
   *
   * @param key - The cache key.
   * @param value - The value to store.
   *
   * @example
   * ```ts
   * const cache = new LRU<string, number>(2);
   * cache.set("a", 1);
   * cache.set("b", 2);
   * cache.set("c", 3); // evicts "a"
   * ```
   */
  set(key: K, value: V): void {
    this.#map.delete(key); // remove if present so re-insert puts it at the tail
    if (this.#map.size >= this.maxSize) {
      const oldest = this.#map.keys().next().value;
      if (oldest !== undefined) this.#map.delete(oldest);
    }
    this.#map.set(key, {
      v: value,
      exp: this.ttlMs ? Date.now() + this.ttlMs : null,
    });
  }

  /**
   * Retrieve the value for `key`, or compute it via `make`, store, and
   * return it. Useful for formatter / resource caches.
   *
   * @param key - The cache key to look up.
   * @param make - A factory that produces the value when `key` is missing or expired.
   * @returns The cached or newly-computed value.
   *
   * @example
   * ```ts
   * const cache = new LRU<string, string>(100);
   * const formatted = cache.getOrSet("greeting", () => "hello");
   * ```
   */
  getOrSet(key: K, make: () => V): V {
    const existing = this.get(key);
    if (existing !== undefined) return existing;
    const value = make();
    this.set(key, value);
    return value;
  }

  /**
   * Check whether a key exists and is not expired.
   *
   * @param key - The cache key to check.
   * @returns `true` if the key exists and hasn't expired.
   *
   * @example
   * ```ts
   * const cache = new LRU<string, number>(100);
   * cache.set("a", 1);
   * cache.has("a"); // true
   * cache.has("b"); // false
   * ```
   */
  has(key: K): boolean {
    return this.get(key) !== undefined;
  }

  /**
   * Remove a key from the cache.
   *
   * @param key - The cache key to remove.
   * @returns `true` if the key existed and was removed.
   *
   * @example
   * ```ts
   * const cache = new LRU<string, number>(100);
   * cache.set("a", 1);
   * cache.delete("a"); // true
   * cache.delete("b"); // false
   * ```
   */
  delete(key: K): boolean {
    return this.#map.delete(key);
  }

  /**
   * Remove all entries from the cache.
   *
   * @example
   * ```ts
   * const cache = new LRU<string, number>(100);
   * cache.set("a", 1);
   * cache.clear();
   * cache.size; // 0
   * ```
   */
  clear(): void {
    this.#map.clear();
  }

  /**
   * The number of entries in the cache.
   *
   * @example
   * ```ts
   * const cache = new LRU<string, number>(100);
   * cache.set("a", 1);
   * cache.size; // 1
   * ```
   */
  get size(): number {
    return this.#map.size;
  }

  /**
   * Iterates over `[key, value]` pairs in insertion order (oldest first).
   * Expired entries are skipped.
   *
   * @returns An iterator over `[key, value]` pairs.
   *
   * @example
   * ```ts
   * for (const [key, value] of cache.entries()) {
   *   console.log(key, value);
   * }
   * ```
   */
  *entries(): IterableIterator<[K, V]> {
    for (const [key, entry] of this.#map) {
      if (entry.exp !== null && Date.now() > entry.exp) continue;
      yield [key, entry.v];
    }
  }

  /**
   * Iterates over keys in insertion order (oldest first).
   * Expired entries are skipped.
   *
   * @returns An iterator over keys.
   *
   * @example
   * ```ts
   * for (const key of cache.keys()) {
   *   console.log(key);
   * }
   * ```
   */
  *keys(): IterableIterator<K> {
    for (const [key, entry] of this.#map) {
      if (entry.exp !== null && Date.now() > entry.exp) continue;
      yield key;
    }
  }

  /**
   * Iterates over values in insertion order (oldest first).
   * Expired entries are skipped.
   *
   * @returns An iterator over values.
   *
   * @example
   * ```ts
   * for (const value of cache.values()) {
   *   console.log(value);
   * }
   * ```
   */
  *values(): IterableIterator<V> {
    for (const [, entry] of this.#map) {
      if (entry.exp !== null && Date.now() > entry.exp) continue;
      yield entry.v;
    }
  }

  /**
   * Makes the cache iterable, yielding `[key, value]` pairs.
   *
   * @example
   * ```ts
   * for (const [key, value] of cache) {
   *   console.log(key, value);
   * }
   * ```
   */
  [Symbol.iterator](): IterableIterator<[K, V]> {
    return this.entries();
  }
}
