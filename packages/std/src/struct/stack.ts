/**
 * An array-backed LIFO (last-in-first-out) stack.
 *
 * @typeParam T - The type of elements stored in the stack.
 *
 * @example
 * ```ts
 * const stack = new Stack<number>();
 * stack.push(1);
 * stack.push(2);
 * stack.pop(); // 2
 * stack.peek(); // 1
 * ```
 */
export class Stack<T> {
  #items: T[] = [];

  /**
   * Pushes an item onto the top of the stack.
   *
   * @param item - The item to push.
   */
  push(item: T): void {
    this.#items.push(item);
  }

  /**
   * Removes and returns the top item, or `undefined` if the stack is empty.
   *
   * @returns The top item, or `undefined`.
   */
  pop(): T | undefined {
    return this.#items.pop();
  }

  /**
   * Returns the top item without removing it, or `undefined` if empty.
   *
   * @returns The top item, or `undefined`.
   */
  peek(): T | undefined {
    return this.#items.at(-1);
  }

  /** The number of items in the stack. */
  get size(): number {
    return this.#items.length;
  }

  /** Whether the stack is empty. */
  isEmpty(): boolean {
    return this.#items.length === 0;
  }

  /** Removes all items from the stack. */
  clear(): void {
    this.#items.length = 0;
  }

  /**
   * Iterates over items from top to bottom.
   *
   * @returns An iterator yielding items in LIFO order.
   */
  *[Symbol.iterator](): IterableIterator<T> {
    for (let i = this.#items.length - 1; i >= 0; i--) {
      yield this.#items[i]!;
    }
  }
}
