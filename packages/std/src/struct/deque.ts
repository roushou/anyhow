/**
 * A double-ended queue (deque) with O(1) operations on both ends.
 *
 * Uses a growable circular buffer. When the buffer fills, it is reallocated
 * at double the capacity.
 *
 * @typeParam T - The type of elements stored in the deque.
 *
 * @example
 * ```ts
 * const deque = new Deque<number>();
 * deque.pushBack(1);
 * deque.pushFront(0);
 * deque.popFront(); // 0
 * deque.popBack(); // 1
 * ```
 */
export class Deque<T> {
  #buf: (T | undefined)[];
  #head = 0;
  #tail = 0;
  #mask = 0;

  constructor() {
    this.#buf = Array.from({ length: 4 }) as (T | undefined)[];
    this.#mask = 3;
  }

  /** The number of items in the deque. */
  get size(): number {
    return (this.#tail - this.#head) & this.#mask;
  }

  /** Whether the deque is empty. */
  isEmpty(): boolean {
    return this.size === 0;
  }

  #grow(): void {
    const old = this.#buf;
    const oldCap = old.length;
    const newCap = oldCap * 2;
    const newBuf = Array.from({ length: newCap }) as (T | undefined)[];
    for (let i = 0; i < oldCap; i++) {
      newBuf[i] = old[(this.#head + i) & this.#mask];
    }
    this.#buf = newBuf;
    this.#head = 0;
    this.#tail = oldCap;
    this.#mask = newCap - 1;
  }

  /**
   * Inserts an item at the front.
   *
   * @param item - The item to insert.
   */
  pushFront(item: T): void {
    this.#head = (this.#head - 1) & this.#mask;
    this.#buf[this.#head] = item;
    if (this.#head === this.#tail) this.#grow();
  }

  /**
   * Inserts an item at the back.
   *
   * @param item - The item to insert.
   */
  pushBack(item: T): void {
    this.#buf[this.#tail] = item;
    this.#tail = (this.#tail + 1) & this.#mask;
    if (this.#head === this.#tail) this.#grow();
  }

  /**
   * Removes and returns the front item, or `undefined` if empty.
   *
   * @returns The front item, or `undefined`.
   */
  popFront(): T | undefined {
    if (this.isEmpty()) return undefined;
    const item = this.#buf[this.#head]!;
    this.#buf[this.#head] = undefined;
    this.#head = (this.#head + 1) & this.#mask;
    return item;
  }

  /**
   * Removes and returns the back item, or `undefined` if empty.
   *
   * @returns The back item, or `undefined`.
   */
  popBack(): T | undefined {
    if (this.isEmpty()) return undefined;
    this.#tail = (this.#tail - 1) & this.#mask;
    const item = this.#buf[this.#tail]!;
    this.#buf[this.#tail] = undefined;
    return item;
  }

  /**
   * Returns the front item without removing it, or `undefined` if empty.
   *
   * @returns The front item, or `undefined`.
   */
  peekFront(): T | undefined {
    if (this.isEmpty()) return undefined;
    return this.#buf[this.#head];
  }

  /**
   * Returns the back item without removing it, or `undefined` if empty.
   *
   * @returns The back item, or `undefined`.
   */
  peekBack(): T | undefined {
    if (this.isEmpty()) return undefined;
    return this.#buf[(this.#tail - 1) & this.#mask];
  }

  /** Removes all items from the deque. */
  clear(): void {
    this.#buf = Array.from({ length: 4 }) as (T | undefined)[];
    this.#head = 0;
    this.#tail = 0;
    this.#mask = 3;
  }

  /**
   * Iterates over items from front to back.
   *
   * @returns An iterator yielding items in front-to-back order.
   */
  *[Symbol.iterator](): IterableIterator<T> {
    let pos = this.#head;
    while (pos !== this.#tail) {
      yield this.#buf[pos]!;
      pos = (pos + 1) & this.#mask;
    }
  }
}
