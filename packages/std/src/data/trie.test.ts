import { describe, expect, it } from "bun:test";
import { Trie } from "./trie.js";

describe("Trie", () => {
  describe("insert / search", () => {
    it("stores and retrieves values by exact key", () => {
      const trie = new Trie<number>();
      trie.insert("foo", 1);
      trie.insert("bar", 2);
      expect(trie.search("foo")).toBe(1);
      expect(trie.search("bar")).toBe(2);
    });

    it("returns undefined for missing keys", () => {
      const trie = new Trie<number>();
      expect(trie.search("nope")).toBeUndefined();
    });

    it("overwrites existing key", () => {
      const trie = new Trie<number>();
      trie.insert("key", 1);
      trie.insert("key", 99);
      expect(trie.search("key")).toBe(99);
    });

    it("handles empty string key", () => {
      const trie = new Trie<string>();
      trie.insert("", "root");
      expect(trie.search("")).toBe("root");
    });
  });

  describe("startsWith", () => {
    it("finds all values with a given prefix", () => {
      const trie = new Trie<number>();
      trie.insert("foo", 1);
      trie.insert("foobar", 2);
      trie.insert("foobaz", 3);
      trie.insert("bar", 4);
      const results = trie.startsWith("foo");
      expect(results.sort()).toEqual([1, 2, 3]);
    });

    it("returns empty array for unmatched prefix", () => {
      const trie = new Trie<number>();
      trie.insert("foo", 1);
      expect(trie.startsWith("xyz")).toEqual([]);
    });

    it("returns single value for exact prefix match", () => {
      const trie = new Trie<number>();
      trie.insert("hello", 1);
      trie.insert("help", 2);
      expect(trie.startsWith("hell")).toEqual([1]);
    });
  });

  describe("delete", () => {
    it("deletes a key and returns true", () => {
      const trie = new Trie<number>();
      trie.insert("foo", 1);
      expect(trie.delete("foo")).toBe(true);
      expect(trie.search("foo")).toBeUndefined();
    });

    it("returns false for non-existent key", () => {
      const trie = new Trie<number>();
      expect(trie.delete("nope")).toBe(false);
    });

    it("does not affect other keys sharing a prefix", () => {
      const trie = new Trie<number>();
      trie.insert("foo", 1);
      trie.insert("foobar", 2);
      trie.delete("foo");
      expect(trie.search("foo")).toBeUndefined();
      expect(trie.search("foobar")).toBe(2);
    });

    it("prunes empty branches", () => {
      const trie = new Trie<number>();
      trie.insert("foo", 1);
      trie.delete("foo");
      expect(trie.size).toBe(0);
      // After pruning, startsWith for "f" should find nothing
      expect(trie.startsWith("f")).toEqual([]);
    });
  });

  describe("size", () => {
    it("tracks the number of keys", () => {
      const trie = new Trie<number>();
      expect(trie.size).toBe(0);
      trie.insert("a", 1);
      expect(trie.size).toBe(1);
      trie.insert("b", 2);
      expect(trie.size).toBe(2);
      trie.insert("a", 99); // overwrite — no size change
      expect(trie.size).toBe(2);
      trie.delete("a");
      expect(trie.size).toBe(1);
    });
  });

  describe("edge cases", () => {
    it("handles single character keys", () => {
      const trie = new Trie<string>();
      trie.insert("a", "val");
      expect(trie.search("a")).toBe("val");
      expect(trie.startsWith("a")).toEqual(["val"]);
    });

    it("handles unicode characters", () => {
      const trie = new Trie<number>();
      trie.insert("café", 1);
      trie.insert("café au lait", 2);
      expect(trie.search("café")).toBe(1);
      expect(trie.startsWith("café").sort()).toEqual([1, 2]);
    });
  });
});
