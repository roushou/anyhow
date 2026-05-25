/**
 * A min-heap priority queue backed by an array.
 *
 * The ordering is determined by a comparator function `compare(a, b)` that
 * returns a negative number when `a` should come before `b`, zero when they
 * are equal, and a positive number when `a` should come after `b`.
 *
 * To create a max-heap, simply invert the comparator.
 *
 * @typeParam T - The type of elements stored in the queue.
 *
 * @example
 * ```ts
 * const pq = new PriorityQueue<number>((a, b) => a - b);
 * pq.enqueue(5);
 * pq.enqueue(1);
 * pq.enqueue(3);
 * pq.dequeue(); // 1
 * pq.dequeue(); // 3
 * ```
 */
export class PriorityQueue<T> {
  #heap: T[] = [];
  #compare: (a: T, b: T) => number;

  /**
   * @param compare - Comparator: negative if `a` before `b`, positive if `a` after `b`.
   */
  constructor(compare: (a: T, b: T) => number) {
    this.#compare = compare;
  }

  /**
   * Adds an item to the queue.
   *
   * @param item - The item to enqueue.
   */
  enqueue(item: T): void {
    this.#heap.push(item);
    this.#siftUp(this.#heap.length - 1);
  }

  /**
   * Removes and returns the highest-priority (minimum by comparator) item,
   * or `undefined` if the queue is empty.
   *
   * @returns The minimum item, or `undefined`.
   */
  dequeue(): T | undefined {
    if (this.#heap.length === 0) return undefined;
    const top = this.#heap[0]!;
    const last = this.#heap.pop()!;
    if (this.#heap.length > 0) {
      this.#heap[0] = last;
      this.#siftDown(0);
    }
    return top;
  }

  /**
   * Returns the highest-priority item without removing it, or `undefined` if empty.
   *
   * @returns The minimum item, or `undefined`.
   */
  peek(): T | undefined {
    return this.#heap[0];
  }

  /** The number of items in the queue. */
  get size(): number {
    return this.#heap.length;
  }

  /** Whether the queue is empty. */
  isEmpty(): boolean {
    return this.#heap.length === 0;
  }

  /** Removes all items from the queue. */
  clear(): void {
    this.#heap.length = 0;
  }

  #siftUp(idx: number): void {
    const item = this.#heap[idx]!;
    while (idx > 0) {
      const parentIdx = (idx - 1) >> 1;
      const parent = this.#heap[parentIdx]!;
      if (this.#compare(item, parent) >= 0) break;
      this.#heap[idx] = parent;
      idx = parentIdx;
    }
    this.#heap[idx] = item;
  }

  #siftDown(idx: number): void {
    const item = this.#heap[idx]!;
    const half = this.#heap.length >> 1;
    while (idx < half) {
      let childIdx = (idx << 1) + 1;
      let child = this.#heap[childIdx]!;
      const rightIdx = childIdx + 1;
      if (rightIdx < this.#heap.length && this.#compare(this.#heap[rightIdx]!, child) < 0) {
        childIdx = rightIdx;
        child = this.#heap[rightIdx]!;
      }
      if (this.#compare(item, child) <= 0) break;
      this.#heap[idx] = child;
      idx = childIdx;
    }
    this.#heap[idx] = item;
  }
}
