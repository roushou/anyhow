/**
 * A space-efficient probabilistic set for testing membership of strings.
 *
 * False positives are possible, but false negatives are not. Uses a bit array
 * backed by `Uint8Array` and the Kirsch-Mitzenmacher double-hashing scheme
 * to simulate multiple hash functions from two base hashes.
 *
 * @example
 * ```ts
 * const filter = new BloomFilter(1000, 0.01);
 * filter.add("hello");
 * filter.has("hello"); // true
 * filter.has("world"); // false (probably)
 * ```
 */
export class BloomFilter {
  #bits: Uint8Array;
  #bitSize: number;
  #hashCount: number;
  #insertions = 0;

  /**
   * @param expectedItems - Estimated number of items to be inserted.
   * @param falsePositiveRate - Desired false positive rate (default 0.01 = 1%).
   */
  constructor(expectedItems: number, falsePositiveRate: number = 0.01) {
    // Calculate optimal bit array size and hash count
    const n = Math.max(1, expectedItems);
    const p = falsePositiveRate;
    // m = -(n * ln(p)) / (ln(2)^2)
    const m = Math.ceil(-(n * Math.log(p)) / (Math.LN2 * Math.LN2));
    // k = (m / n) * ln(2)
    const k = Math.max(1, Math.round((m / n) * Math.LN2));
    this.#bitSize = Math.max(1, m);
    this.#hashCount = k;
    this.#bits = new Uint8Array(Math.ceil(this.#bitSize / 8));
  }

  /**
   * Adds a string to the set.
   *
   * @param item - The string to add.
   */
  add(item: string): void {
    const [h1, h2] = this.#hashPair(item);
    for (let i = 0; i < this.#hashCount; i++) {
      const bit = (((h1 + i * h2) % this.#bitSize) + this.#bitSize) % this.#bitSize;
      this.#bits[bit >> 3]! |= 1 << (bit & 7);
    }
    this.#insertions++;
  }

  /**
   * Tests whether a string may have been added.
   *
   * May return `true` for items that were never added (false positive), but
   * never returns `false` for items that were added.
   *
   * @param item - The string to test.
   * @returns `true` if the item might be in the set, `false` if it is definitely not.
   */
  has(item: string): boolean {
    const [h1, h2] = this.#hashPair(item);
    for (let i = 0; i < this.#hashCount; i++) {
      const bit = (((h1 + i * h2) % this.#bitSize) + this.#bitSize) % this.#bitSize;
      if (!(this.#bits[bit >> 3]! & (1 << (bit & 7)))) {
        return false;
      }
    }
    return true;
  }

  /**
   * Approximate count of items that have been added.
   *
   * This is an estimate based on set bits, not an exact count.
   */
  get estimatedSize(): number {
    if (this.#insertions === 0) return 0;
    let setBits = 0;
    for (let i = 0; i < this.#bits.length; i++) {
      let b = this.#bits[i]!;
      // Count set bits in this byte (popcount)
      b = b - ((b >> 1) & 0x55);
      b = (b & 0x33) + ((b >> 2) & 0x33);
      setBits += (b + (b >> 4)) & 0x0f;
    }
    const prop = setBits / this.#bitSize;
    if (prop === 0) return 0;
    return Math.round(-(this.#bitSize / this.#hashCount) * Math.log(1 - prop));
  }

  /** FNV-1a hash, returning two 32-bit hashes with different seeds. */
  #hashPair(str: string): [number, number] {
    let h1 = 0x811c9dc5;
    let h2 = 0xcbf29ce4;
    for (let i = 0; i < str.length; i++) {
      h1 ^= str.charCodeAt(i);
      h1 = Math.imul(h1, 0x01000193);
      h2 ^= str.charCodeAt(i);
      h2 = Math.imul(h2, 0x01000193);
    }
    return [h1 >>> 0, ((h2 ^ (h2 >>> 16)) * 0x85ebca6b) >>> 0];
  }
}
