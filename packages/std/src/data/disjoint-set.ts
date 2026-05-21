/**
 * A disjoint-set (union-find) data structure with path compression and
 * union by rank.
 *
 * Each element is identified by its own value (of type `T`). Elements are
 * added via {@link makeSet} before they can be used with {@link find} or
 * {@link union}.
 *
 * @typeParam T - The type of elements stored. Must be usable as a `Map` key.
 *
 * @example
 * ```ts
 * const ds = new DisjointSet<number>();
 * ds.makeSet(1);
 * ds.makeSet(2);
 * ds.union(1, 2);
 * ds.connected(1, 2); // true
 * ```
 */
export class DisjointSet<T> {
  #parent = new Map<T, T>();
  #rank = new Map<T, number>();
  #count = 0;

  /**
   * Adds a new element as its own set (a singleton).
   *
   * If the item is already present, this is a no-op.
   *
   * @param item - The element to add.
   */
  makeSet(item: T): void {
    if (this.#parent.has(item)) return;
    this.#parent.set(item, item);
    this.#rank.set(item, 0);
    this.#count++;
  }

  /**
   * Finds the representative (root) of the set containing `item`.
   *
   * Applies path compression to flatten the tree for future lookups.
   *
   * @param item - The element to find.
   * @returns The representative element.
   * @throws If the item has not been added via {@link makeSet}.
   */
  find(item: T): T {
    const parent = this.#parent.get(item);
    if (parent === undefined) {
      throw new Error(`Item not found in DisjointSet: ${String(item)}`);
    }
    if (parent !== item) {
      this.#parent.set(item, this.find(parent));
    }
    return this.#parent.get(item)!;
  }

  /**
   * Merges the sets containing `a` and `b`. If they are already in the same
   * set, this is a no-op.
   *
   * @param a - An element in the first set.
   * @param b - An element in the second set.
   */
  union(a: T, b: T): void {
    const rootA = this.find(a);
    const rootB = this.find(b);
    if (rootA === rootB) return;

    const rankA = this.#rank.get(rootA)!;
    const rankB = this.#rank.get(rootB)!;
    if (rankA < rankB) {
      this.#parent.set(rootA, rootB);
    } else if (rankA > rankB) {
      this.#parent.set(rootB, rootA);
    } else {
      this.#parent.set(rootB, rootA);
      this.#rank.set(rootA, rankA + 1);
    }
    this.#count--;
  }

  /**
   * Checks whether two elements belong to the same set.
   *
   * @param a - The first element.
   * @param b - The second element.
   * @returns `true` if `a` and `b` are in the same set.
   */
  connected(a: T, b: T): boolean {
    return this.find(a) === this.find(b);
  }

  /** The number of disjoint sets. */
  get size(): number {
    return this.#count;
  }
}
