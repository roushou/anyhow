/**
 * An array-backed FIFO (first-in-first-out) queue using a two-pointer technique
 * for amortized O(1) dequeue.
 *
 * @typeParam T - The type of elements stored in the queue.
 *
 * @example
 * ```ts
 * const queue = new Queue<number>();
 * queue.enqueue(1);
 * queue.enqueue(2);
 * queue.dequeue(); // 1
 * queue.peek(); // 2
 * ```
 */
export class Queue<T> {
  #buf: T[] = [];
  #head = 0;

  /**
   * Adds an item to the back of the queue.
   *
   * @param item - The item to enqueue.
   */
  enqueue(item: T): void {
    this.#buf.push(item);
  }

  /**
   * Removes and returns the front item, or `undefined` if the queue is empty.
   *
   * @returns The front item, or `undefined`.
   */
  dequeue(): T | undefined {
    if (this.#head >= this.#buf.length) return undefined;
    const item = this.#buf[this.#head];
    this.#buf[this.#head] = undefined!;
    this.#head++;
    // Compact when more than half of the buffer is wasted
    if (this.#head > 0 && this.#head * 2 >= this.#buf.length) {
      this.#buf = this.#buf.slice(this.#head);
      this.#head = 0;
    }
    return item;
  }

  /**
   * Returns the front item without removing it, or `undefined` if empty.
   *
   * @returns The front item, or `undefined`.
   */
  peek(): T | undefined {
    if (this.#head >= this.#buf.length) return undefined;
    return this.#buf[this.#head];
  }

  /** The number of items in the queue. */
  get size(): number {
    return this.#buf.length - this.#head;
  }

  /** Whether the queue is empty. */
  isEmpty(): boolean {
    return this.size === 0;
  }

  /** Removes all items from the queue. */
  clear(): void {
    this.#buf.length = 0;
    this.#head = 0;
  }

  /**
   * Iterates over items from front to back.
   *
   * @returns An iterator yielding items in FIFO order.
   */
  *[Symbol.iterator](): IterableIterator<T> {
    for (let i = this.#head; i < this.#buf.length; i++) {
      yield this.#buf[i]!;
    }
  }
}
