/**
 * A generic n-ary tree node with traversal, transformation, and query methods.
 *
 * Each node holds a value, a reference to its parent (null for the root),
 * and an array of child nodes.  Traversal is lazy via generators (DFS and BFS).
 *
 * @typeParam T - The type of value stored in each node.
 *
 * @example
 * ```ts
 * const root = new TreeNode("root", [
 *   new TreeNode("a"),
 *   new TreeNode("b"),
 * ]);
 *
 * for (const node of root.dfs()) {
 *   console.log(node.value); // "root", "a", "b"
 * }
 * ```
 */
export class TreeNode<T> {
  /** The value stored at this node. */
  value: T;
  /** The parent node, or `null` if this is the root. */
  parent: TreeNode<T> | null = null;
  /** The child nodes. */
  children: TreeNode<T>[];

  /**
   * Creates a tree node.
   *
   * @param value - The value to store.
   * @param children - Optional child nodes or values to add.
   *
   * @example
   * ```ts
   * const node = new TreeNode("parent", [
   *   new TreeNode("child1"),
   *   "child2", // plain value auto-wrapped
   * ]);
   * ```
   */
  constructor(value: T, children?: (T | TreeNode<T>)[]) {
    this.value = value;
    this.children = [];
    if (children) {
      for (const child of children) {
        this.addChild(child);
      }
    }
  }

  /**
   * Adds a child node (or wraps a plain value in a new node).
   * Sets the child's `parent` reference automatically.
   *
   * @param child - The child node or value to add.
   * @returns The added node.
   *
   * @example
   * ```ts
   * root.addChild("new");
   * root.addChild(new TreeNode("existing"));
   * ```
   */
  addChild(child: T | TreeNode<T>): TreeNode<T> {
    const node = child instanceof TreeNode ? child : new TreeNode(child);
    // If already parented, detach from old parent
    if (node.parent) {
      node.parent.removeChild(node);
    }
    node.parent = this;
    this.children.push(node);
    return node;
  }

  /**
   * Removes a child by reference.  Clears the child's `parent` reference.
   *
   * @param child - The child node to remove.
   * @returns `true` if the child was found and removed, `false` otherwise.
   */
  removeChild(child: TreeNode<T>): boolean {
    const idx = this.children.indexOf(child);
    if (idx === -1) return false;
    child.parent = null;
    this.children.splice(idx, 1);
    return true;
  }

  /** Total number of nodes in the subtree (including this one). */
  get size(): number {
    let count = 1;
    for (const child of this.children) {
      count += child.size;
    }
    return count;
  }

  /** Distance from the root (0 for the root). */
  get depth(): number {
    if (!this.parent) return 0;
    return this.parent.depth + 1;
  }

  /** Maximum distance from this node to any descendant leaf. */
  get height(): number {
    if (this.children.length === 0) return 0;
    let max = 0;
    for (const child of this.children) {
      max = Math.max(max, child.height + 1);
    }
    return max;
  }

  /** Whether this node has no children. */
  get isLeaf(): boolean {
    return this.children.length === 0;
  }

  /** Whether this node has no parent. */
  get isRoot(): boolean {
    return this.parent === null;
  }

  /**
   * Depth-first (pre-order) traversal of the subtree.
   *
   * @returns A generator yielding nodes in DFS order.
   *
   * @example
   * ```ts
   * for (const node of root.dfs()) {
   *   console.log(node.value);
   * }
   * ```
   */
  *dfs(): Generator<TreeNode<T>> {
    yield this;
    for (const child of this.children) {
      yield* child.dfs();
    }
  }

  /**
   * Breadth-first (level-order) traversal of the subtree.
   *
   * @returns A generator yielding nodes in BFS order.
   *
   * @example
   * ```ts
   * for (const node of root.bfs()) {
   *   console.log(node.value); // level by level
   * }
   * ```
   */
  *bfs(): Generator<TreeNode<T>> {
    const queue: TreeNode<T>[] = [this];
    while (queue.length > 0) {
      const node = queue.shift()!;
      yield node;
      for (const child of node.children) {
        queue.push(child);
      }
    }
  }

  /**
   * Transforms every node's value. Returns a new tree; the original is unmodified.
   *
   * @typeParam U - The output value type.
   * @param fn - The transformation, receives the value and the node.
   * @returns A new tree with transformed values.
   *
   * @example
   * ```ts
   * const upper = root.map((val) => val.toUpperCase());
   * ```
   */
  map<U>(fn: (value: T, node: TreeNode<T>) => U): TreeNode<U> {
    const newNode = new TreeNode(fn(this.value, this));
    for (const child of this.children) {
      newNode.addChild(child.map(fn));
    }
    return newNode;
  }

  /**
   * Keeps only nodes where `predicate` returns true.
   * A node that is removed also prunes its children.
   *
   * @param predicate - Called on each node.
   * @returns A new filtered node, or `null` if the root itself is removed.
   *
   * @example
   * ```ts
   * const active = root.filter(n => n.value.active);
   * ```
   */
  filter(predicate: (node: TreeNode<T>) => boolean): TreeNode<T> | null {
    if (!predicate(this)) return null;
    const filtered = new TreeNode(this.value);
    for (const child of this.children) {
      const kept = child.filter(predicate);
      if (kept) filtered.addChild(kept);
    }
    return filtered;
  }

  /**
   * Finds the first node (DFS) satisfying the predicate.
   *
   * @param predicate - Called on each node.
   * @returns The matching node, or `undefined`.
   *
   * @example
   * ```ts
   * const node = root.find(n => n.value === "target");
   * ```
   */
  find(predicate: (node: TreeNode<T>) => boolean): TreeNode<T> | undefined {
    if (predicate(this)) return this;
    for (const child of this.children) {
      const found = child.find(predicate);
      if (found) return found;
    }
    return undefined;
  }

  /**
   * Finds all nodes (DFS) satisfying the predicate.
   *
   * @param predicate - Called on each node.
   * @returns An array of matching nodes.
   *
   * @example
   * ```ts
   * const leaves = root.findAll(n => n.isLeaf);
   * ```
   */
  findAll(predicate: (node: TreeNode<T>) => boolean): TreeNode<T>[] {
    const results: TreeNode<T>[] = [];
    if (predicate(this)) results.push(this);
    for (const child of this.children) {
      results.push(...child.findAll(predicate));
    }
    return results;
  }

  /**
   * Walks up from this node to find the nearest ancestor satisfying
   * the predicate, or `undefined` if none matches.
   *
   * @param predicate - Called on each ancestor (including this node).
   * @returns The matching ancestor, or `undefined`.
   *
   * @example
   * ```ts
   * const section = leaf.closest(n => n.value.endsWith("/"));
   * ```
   */
  closest(predicate: (node: TreeNode<T>) => boolean): TreeNode<T> | undefined {
    if (predicate(this)) return this;
    return this.parent?.closest(predicate);
  }

  /**
   * Returns all ancestors from root to the parent of this node (excluding this).
   *
   * @returns An array of ancestor nodes, root-first.
   */
  ancestors(): TreeNode<T>[] {
    if (!this.parent) return [];
    return [...this.parent.ancestors(), this.parent];
  }

  /**
   * Flattens the subtree into an array using the given traversal order.
   *
   * @param traversal - `"dfs"` (default) or `"bfs"`.
   * @returns An array of values in traversal order.
   *
   * @example
   * ```ts
   * root.toArray("bfs"); // level-order values
   * ```
   */
  toArray(traversal: "dfs" | "bfs" = "dfs"): T[] {
    const nodes = traversal === "dfs" ? this.dfs() : this.bfs();
    return Array.from(nodes, (n) => n.value);
  }

  /**
   * Iterates over the subtree in depth-first (pre-order) order.
   *
   * @returns An iterator yielding tree nodes.
   */
  [Symbol.iterator](): Iterator<TreeNode<T>> {
    return this.dfs();
  }
}

/**
 * Convenience factory for creating a {@link TreeNode}. Accepts plain values
 * or existing nodes as children.
 *
 * @typeParam T - The value type.
 * @param value - The root value.
 * @param children - Optional child nodes or values.
 * @returns A new tree root node.
 *
 * @example
 * ```ts
 * const t = tree("root", [
 *   tree("a"),
 *   tree("b", [tree("b.1")]),
 * ]);
 * ```
 */
export function tree<T>(value: T, children?: (T | TreeNode<T>)[]): TreeNode<T> {
  return new TreeNode(value, children);
}
