/**
 * Mulberry32 — a fast, high-quality 32-bit seeded PRNG.
 *
 * Returns a function that produces pseudorandom floats in `[0, 1)` on each call.
 * The same seed always produces the same sequence.
 *
 * @param seed - A 32-bit integer seed.
 * @returns A function `() => number` that advances the PRNG state and returns a float in `[0, 1)`.
 *
 * @see {@link https://gist.github.com/tommyettinger/46a874533244883189143505d203312c}
 */
function mulberry32(seed: number): () => number {
  let state = seed | 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * A seeded pseudorandom number generator with convenience methods for common
 * randomization tasks.
 *
 * Create a deterministic instance via {@link createRandom}, or use the pre-built
 * auto-seeded {@link random} singleton.
 *
 * @example
 * ```ts
 * import { createRandom } from "@anyhow/core/random";
 * const rng = createRandom(42);
 * rng.int(1, 6); // 5
 * rng.shuffle(["a", "b", "c"]); // ["c", "a", "b"]
 * ```
 */
export class Random {
  readonly #next: () => number;

  constructor(seed: number) {
    this.#next = mulberry32(seed);
  }

  /**
   * Returns a random integer in `[min, max]` (inclusive).
   *
   * @param min - The lower bound (inclusive).
   * @param max - The upper bound (inclusive).
   * @returns A random integer between `min` and `max`.
   *
   * @example
   * ```ts
   * random.int(1, 6); // 4
   * random.int(0, 1); // 0 | 1
   * ```
   */
  int(min: number, max: number): number {
    return Math.floor(this.#next() * (max - min + 1)) + min;
  }

  /**
   * Returns a random float in `[min, max)`. Defaults to `[0, 1)`.
   *
   * @param min - The lower bound (inclusive, default `0`).
   * @param max - The upper bound (exclusive, default `1`).
   * @returns A random float between `min` and `max`.
   *
   * @example
   * ```ts
   * random.float(); // 0.4302…
   * random.float(10, 20); // 14.753…
   * ```
   */
  float(min: number = 0, max: number = 1): number {
    return this.#next() * (max - min) + min;
  }

  /**
   * Returns a random boolean with roughly 50/50 distribution.
   *
   * @returns `true` or `false`.
   *
   * @example
   * ```ts
   * random.bool(); // true
   * ```
   */
  bool(): boolean {
    return this.#next() < 0.5;
  }

  /**
   * Returns a random element from a non-empty array.
   *
   * @typeParam T - The element type.
   * @param items - The array to pick from.
   * @returns A random element from `items`.
   * @throws If `items` is empty.
   *
   * @example
   * ```ts
   * random.pick(["red", "green", "blue"]); // "green"
   * ```
   */
  pick<T>(items: readonly T[]): T {
    if (items.length === 0) throw new Error("Cannot pick from an empty array");
    return items[Math.floor(this.#next() * items.length)]!;
  }

  /**
   * Returns a new array with the elements of `items` randomly reordered using
   * the Fisher-Yates shuffle. The input array is not mutated.
   *
   * @typeParam T - The element type.
   * @param items - The array to shuffle.
   * @returns A new array with the same elements in random order.
   *
   * @example
   * ```ts
   * random.shuffle([1, 2, 3, 4]); // [3, 1, 4, 2]
   * ```
   */
  shuffle<T>(items: readonly T[]): T[] {
    const arr = [...items];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(this.#next() * (i + 1));
      const tmp = arr[i]!;
      arr[i] = arr[j]!;
      arr[j] = tmp;
    }
    return arr;
  }

  /**
   * Returns a random element from `items` using the provided `weights` for
   * weighted probability. Higher weights increase selection likelihood.
   *
   * @typeParam T - The element type.
   * @param items - The array of items to select from.
   * @param weights - The weight for each item. Must be the same length as `items`.
   * @returns A randomly selected element.
   * @throws If `items` and `weights` have different lengths.
   *
   * @example
   * ```ts
   * random.weighted(["rare", "common"], [1, 9]); // "common" (90% of the time)
   * ```
   */
  weighted<T>(items: readonly T[], weights: readonly number[]): T {
    if (items.length !== weights.length) {
      throw new Error("items and weights must have the same length");
    }
    const total = weights.reduce((sum, w) => sum + w, 0);
    let r = this.#next() * total;
    for (let i = 0; i < items.length; i++) {
      r -= weights[i]!;
      if (r <= 0) return items[i]!;
    }
    return items[items.length - 1]!;
  }
}

/**
 * Creates a new {@link Random} instance with the given seed.
 *
 * Same seed always produces the same sequence — useful for deterministic
 * generation in tests, procedural content, or reproducible simulations.
 *
 * @param seed - A 32-bit integer seed.
 * @returns A new `Random` instance.
 *
 * @example
 * ```ts
 * import { createRandom } from "@anyhow/core/random";
 * const a = createRandom(123);
 * const b = createRandom(123);
 * a.int(0, 100) === b.int(0, 100); // true
 * ```
 */
export function createRandom(seed: number): Random {
  return new Random(seed);
}

/**
 * An auto-seeded {@link Random} instance.
 *
 * Seeded from `Date.now()` and `Math.random()` at import time — no setup
 * required. Use when reproducibility is not needed.
 *
 * @example
 * ```ts
 * import { random } from "@anyhow/core/random";
 * random.int(1, 6); // 4
 * random.shuffle(["a", "b"]); // ["b", "a"]
 * ```
 */
export const random: Random = new Random((Date.now() * Math.random() * 2147483647) | 0);
