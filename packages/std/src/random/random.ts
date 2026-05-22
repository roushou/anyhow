/**
 * Mulberry32 — a fast, high-quality 32-bit seeded PRNG.
 *
 * Returns a function that produces pseudorandom floats in `[0, 1)` on each call.
 * The same seed always produces the same sequence.
 *
 * @param seed - A 32-bit integer seed.
 * @returns A function `() => number` that advances the PRNG state and returns a float in `[0, 1)`.
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
 * A seeded pseudorandom number generator with convenience methods.
 *
 * Create a deterministic instance via {@link createRandom}, or use the
 * pre-built auto-seeded {@link random} singleton.
 *
 * @example
 * ```ts
 * const rng = createRandom(42);
 * rng.int(1, 6); // 5
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
   * random.float();       // 0.4302…
   * random.float(10, 20); // 14.753…
   * ```
   */
  float(min = 0, max = 1): number {
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
   * Returns a random element from a non-empty array. Throws if empty.
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
   * Returns a new array with the elements of `items` randomly reordered
   * using the Fisher-Yates shuffle. The input array is not mutated.
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
   * @param weights - The weight for each item. Must match `items` length.
   * @returns A randomly selected element.
   * @throws If `items` and `weights` have different lengths.
   *
   * @example
   * ```ts
   * random.weighted(["rare", "common"], [1, 9]); // "common" (90% of the time)
   * ```
   */
  weighted<T>(items: readonly T[], weights: readonly number[]): T {
    if (items.length !== weights.length)
      throw new Error("items and weights must have the same length");
    const total = weights.reduce((s, w) => s + w, 0);
    let r = this.#next() * total;
    for (let i = 0; i < items.length; i++) {
      r -= weights[i]!;
      if (r <= 0) return items[i]!;
    }
    return items[items.length - 1]!;
  }

  /**
   * Returns `n` random elements from the array without replacement.
   * If `n >= items.length`, returns a shuffled copy of the entire array.
   *
   * @typeParam T - The element type.
   * @param items - The array to sample from.
   * @param n - The number of elements to pick.
   * @returns A new array with `n` random elements.
   *
   * @example
   * ```ts
   * random.sample([1, 2, 3, 4, 5], 3); // [3, 1, 5]
   * ```
   */
  sample<T>(items: readonly T[], n: number): T[] {
    if (n <= 0) return [];
    if (n >= items.length) return this.shuffle(items);
    const result: T[] = [];
    const pool = [...items];
    for (let i = 0; i < n; i++) {
      const j = Math.floor(this.#next() * pool.length);
      result.push(pool.splice(j, 1)[0]!);
    }
    return result;
  }

  /**
   * Returns a normally-distributed random number using the Box-Muller transform.
   *
   * @param mean - The mean (default: `0`).
   * @param stddev - The standard deviation (default: `1`).
   * @returns A normally-distributed number.
   *
   * @example
   * ```ts
   * random.gaussian();       // mean 0, stddev 1
   * random.gaussian(100, 15); // IQ-like distribution
   * ```
   */
  gaussian(mean = 0, stddev = 1): number {
    const u1 = this.#next() || 1e-10;
    const u2 = this.#next();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return z * stddev + mean;
  }

  /**
   * Returns a random UUID v4 string.
   *
   * Uses the seeded PRNG for deterministic output — same seed produces
   * the same UUID sequence.
   *
   * @returns A UUID v4 string (e.g. `"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"`).
   *
   * @example
   * ```ts
   * random.uuid(); // "a3f1b2c0-1234-4abc-9def-0123456789ab"
   * ```
   */
  uuid(): string {
    const hex = () => Math.floor(this.#next() * 16).toString(16);
    return `${hex()}${hex()}${hex()}${hex()}${hex()}${hex()}${hex()}${hex()}-${hex()}${hex()}${hex()}${hex()}-4${hex()}${hex()}${hex()}-${(8 + Math.floor(this.#next() * 4)).toString(16)}${hex()}${hex()}${hex()}-${hex()}${hex()}${hex()}${hex()}${hex()}${hex()}${hex()}${hex()}${hex()}${hex()}${hex()}${hex()}`;
  }

  /**
   * Returns a random hex string of the given byte length using the seeded PRNG.
   * Each byte produces two hex characters.
   *
   * @param bytes - The number of random bytes (each yields two hex chars).
   * @returns A lowercase hex string of length `2 * bytes`.
   *
   * @example
   * ```ts
   * random.randomHex(4); // "a3f1b2c0"
   * ```
   */
  randomHex(bytes: number): string {
    let result = "";
    for (let i = 0; i < bytes; i++) {
      const byte = Math.floor(this.#next() * 256);
      result += byte.toString(16).padStart(2, "0");
    }
    return result;
  }

  /**
   * Returns a random hex color string like `"#a3f1b2"` using the seeded PRNG.
   *
   * @returns A hex color string.
   *
   * @example
   * ```ts
   * random.randomColor(); // "#ff8800"
   * ```
   */
  randomColor(): string {
    const r = Math.floor(this.#next() * 256)
      .toString(16)
      .padStart(2, "0");
    const g = Math.floor(this.#next() * 256)
      .toString(16)
      .padStart(2, "0");
    const b = Math.floor(this.#next() * 256)
      .toString(16)
      .padStart(2, "0");
    return `#${r}${g}${b}`;
  }

  /**
   * Returns an exponentially-distributed random number using inverse transform
   * sampling.
   *
   * @param lambda - The rate parameter (default: `1`). Higher values produce smaller numbers.
   * @returns An exponentially-distributed number with mean `1 / lambda`.
   *
   * @example
   * ```ts
   * random.exponential(2); // ~0.3 (mean = 0.5)
   * ```
   */
  exponential(lambda = 1): number {
    const u = this.#next() || 1e-10;
    return -Math.log(u) / lambda;
  }
}

/**
 * Creates a new {@link Random} instance with the given seed.
 * Same seed always produces the same sequence.
 *
 * @param seed - A 32-bit integer seed.
 * @returns A new `Random` instance.
 *
 * @example
 * ```ts
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
 * Use when reproducibility is not needed.
 *
 * @example
 * ```ts
 * import { random } from "@anyhow/core/random";
 * random.int(1, 6); // 4
 * ```
 */
export const random: Random = new Random((Date.now() * Math.random() * 2147483647) | 0);
