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

  /** Retrieve a value, returning `undefined` if missing or expired. */
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
   * Insert or update a value.  Refreshes the key's position so it is
   * treated as recently used.
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
   * return it.  Useful for formatter / resource caches.
   */
  getOrSet(key: K, make: () => V): V {
    const existing = this.get(key);
    if (existing !== undefined) return existing;
    const value = make();
    this.set(key, value);
    return value;
  }

  has(key: K): boolean {
    return this.get(key) !== undefined;
  }

  delete(key: K): boolean {
    return this.#map.delete(key);
  }

  clear(): void {
    this.#map.clear();
  }

  get size(): number {
    return this.#map.size;
  }
}
