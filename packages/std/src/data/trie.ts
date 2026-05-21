/**
 * A prefix tree (trie) that stores values at nodes keyed by string paths.
 *
 * @typeParam V - The type of values stored in the trie.
 *
 * @example
 * ```ts
 * const trie = new Trie<number>();
 * trie.insert("foo", 1);
 * trie.insert("foobar", 2);
 * trie.search("foo"); // 1
 * trie.startsWith("foo"); // [1, 2]
 * ```
 */
export class Trie<V> {
  #root: TrieNode<V> = { children: new Map() };
  #count = 0;

  /**
   * Inserts a key-value pair. Overwrites the value if the key already exists.
   *
   * @param key - The string key.
   * @param value - The value to store.
   */
  insert(key: string, value: V): void {
    let node = this.#root;
    for (let i = 0; i < key.length; i++) {
      const ch = key[i]!;
      let child = node.children.get(ch);
      if (!child) {
        child = { children: new Map() };
        node.children.set(ch, child);
      }
      node = child;
    }
    if (!node.value) this.#count++;
    node.value = value;
  }

  /**
   * Looks up the value for an exact key.
   *
   * @param key - The key to search for.
   * @returns The stored value, or `undefined`.
   */
  search(key: string): V | undefined {
    const node = this.#traverse(key);
    return node?.value;
  }

  /**
   * Collects all values whose keys start with the given prefix.
   *
   * @param prefix - The prefix to search for.
   * @returns An array of all matching values (order is not guaranteed).
   */
  startsWith(prefix: string): V[] {
    const node = this.#traverse(prefix);
    if (!node) return [];
    const results: V[] = [];
    this.#collect(node, results);
    return results;
  }

  /**
   * Deletes a key and its value from the trie.
   *
   * @param key - The key to delete.
   * @returns `true` if the key was found and deleted, `false` otherwise.
   */
  delete(key: string): boolean {
    const path: { node: TrieNode<V>; ch: string }[] = [];
    let node = this.#root;
    for (let i = 0; i < key.length; i++) {
      const ch = key[i]!;
      const child = node.children.get(ch);
      if (!child) return false;
      path.push({ node, ch });
      node = child;
    }
    if (!node.value) return false;
    node.value = undefined;
    this.#count--;
    // Prune empty branches going backwards
    for (let i = path.length - 1; i >= 0; i--) {
      const { node: parent, ch } = path[i]!;
      const child = parent.children.get(ch);
      if (child && !child.value && child.children.size === 0) {
        parent.children.delete(ch);
      } else {
        break;
      }
    }
    return true;
  }

  /** The number of keys stored in the trie. */
  get size(): number {
    return this.#count;
  }

  #traverse(key: string): TrieNode<V> | undefined {
    let node: TrieNode<V> | undefined = this.#root;
    for (let i = 0; i < key.length && node; i++) {
      node = node.children.get(key[i]!);
    }
    return node;
  }

  #collect(node: TrieNode<V>, results: V[]): void {
    if (node.value !== undefined) results.push(node.value);
    for (const child of node.children.values()) {
      this.#collect(child, results);
    }
  }
}

interface TrieNode<V> {
  children: Map<string, TrieNode<V>>;
  value?: V;
}
