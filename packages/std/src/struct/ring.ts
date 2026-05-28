/**
 * A fixed-capacity circular buffer with O(1) push and pop.
 *
 * When full, pushing a new item silently overwrites the oldest item.
 * Useful for sliding-window tracking: last-N errors, moving averages,
 * rate-limiting windows, and debug rings.
 *
 * @typeParam T - The type of elements stored in the ring buffer.
 *
 * @example
 * ```ts
 * const ring = new RingBuffer<number>(3);
 * ring.push(1);
 * ring.push(2);
 * ring.push(3);
 * ring.push(4); // overwrites 1
 * ring.toArray(); // [2, 3, 4]
 * ```
 */
export class RingBuffer<T> {
  #buf: (T | undefined)[];
  #head = 0;
  #tail = 0;
  #mask: number;
  #size = 0;

  /**
   * Creates a ring buffer with the given capacity.
   *
   * @param capacity - The maximum number of items (must be >= 1).
   *
   * @example
   * ```ts
   * const ring = new RingBuffer<string>(100);
   * ```
   */
  constructor(readonly capacity: number) {
    if (!Number.isInteger(capacity) || capacity < 1) {
      throw new RangeError("capacity must be a positive integer");
    }
    // Round up to the next power of 2 for efficient masking
    let cap = 1;
    while (cap < capacity) cap <<= 1;
    this.#buf = Array.from({ length: cap }) as (T | undefined)[];
    this.#mask = cap - 1;
  }

  /** The number of items currently in the buffer. */
  get size(): number {
    return this.#size;
  }

  /** Whether the buffer is empty. */
  isEmpty(): boolean {
    return this.#size === 0;
  }

  /** Whether the buffer is at capacity. */
  isFull(): boolean {
    return this.#size === this.capacity;
  }

  /**
   * Adds an item. If the buffer is full, silently overwrites the oldest item.
   *
   * @param item - The item to add.
   */
  push(item: T): void {
    this.#buf[this.#tail] = item;
    this.#tail = (this.#tail + 1) & this.#mask;
    if (this.#size === this.capacity) {
      // Overwrite — advance head past the oldest item
      this.#head = (this.#head + 1) & this.#mask;
    } else {
      this.#size++;
    }
  }

  /**
   * Removes and returns the oldest item, or `undefined` if empty.
   *
   * @returns The oldest item, or `undefined`.
   */
  pop(): T | undefined {
    if (this.#size === 0) return undefined;
    const item = this.#buf[this.#head]!;
    this.#buf[this.#head] = undefined;
    this.#head = (this.#head + 1) & this.#mask;
    this.#size--;
    return item;
  }

  /**
   * Returns the oldest item without removing it, or `undefined` if empty.
   *
   * @returns The oldest item, or `undefined`.
   */
  peek(): T | undefined {
    if (this.#size === 0) return undefined;
    return this.#buf[this.#head];
  }

  /**
   * Returns the newest item without removing it, or `undefined` if empty.
   *
   * @returns The newest item, or `undefined`.
   */
  peekLast(): T | undefined {
    if (this.#size === 0) return undefined;
    return this.#buf[(this.#tail - 1) & this.#mask];
  }

  /** Removes all items from the buffer. */
  clear(): void {
    this.#buf.fill(undefined);
    this.#head = 0;
    this.#tail = 0;
    this.#size = 0;
  }

  /**
   * Returns a snapshot of the buffer as an array, oldest to newest.
   *
   * @returns A new array with the current items.
   */
  toArray(): T[] {
    const result: T[] = [];
    let pos = this.#head;
    for (let i = 0; i < this.#size; i++) {
      result.push(this.#buf[pos]!);
      pos = (pos + 1) & this.#mask;
    }
    return result;
  }

  /**
   * Iterates over items from oldest to newest.
   *
   * @returns An iterator yielding items in insertion order.
   */
  *[Symbol.iterator](): IterableIterator<T> {
    let pos = this.#head;
    for (let i = 0; i < this.#size; i++) {
      yield this.#buf[pos]!;
      pos = (pos + 1) & this.#mask;
    }
  }
}
