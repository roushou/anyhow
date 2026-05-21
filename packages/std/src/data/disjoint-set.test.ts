import { describe, expect, it } from "bun:test";
import { DisjointSet } from "./disjoint-set.js";

describe("DisjointSet", () => {
  describe("makeSet / find", () => {
    it("creates a singleton set and finds the element", () => {
      const ds = new DisjointSet<number>();
      ds.makeSet(1);
      expect(ds.find(1)).toBe(1);
    });

    it("makeSet is idempotent", () => {
      const ds = new DisjointSet<number>();
      ds.makeSet(1);
      ds.makeSet(1);
      expect(ds.size).toBe(1);
    });

    it("find throws for unknown elements", () => {
      const ds = new DisjointSet<number>();
      expect(() => ds.find(99)).toThrow();
    });
  });

  describe("union / connected", () => {
    it("merges two sets", () => {
      const ds = new DisjointSet<number>();
      ds.makeSet(1);
      ds.makeSet(2);
      ds.union(1, 2);
      expect(ds.connected(1, 2)).toBe(true);
      expect(ds.find(1)).toBe(ds.find(2));
    });

    it("union is a no-op when already connected", () => {
      const ds = new DisjointSet<number>();
      ds.makeSet(1);
      ds.makeSet(2);
      ds.union(1, 2);
      const sizeAfter = ds.size;
      ds.union(1, 2);
      expect(ds.size).toBe(sizeAfter);
      expect(ds.connected(1, 2)).toBe(true);
    });

    it("connected returns false for separate sets", () => {
      const ds = new DisjointSet<number>();
      ds.makeSet(1);
      ds.makeSet(2);
      ds.makeSet(3);
      ds.union(1, 2);
      expect(ds.connected(1, 3)).toBe(false);
    });

    it("transitive union", () => {
      const ds = new DisjointSet<number>();
      ds.makeSet(1);
      ds.makeSet(2);
      ds.makeSet(3);
      ds.union(1, 2);
      ds.union(2, 3);
      expect(ds.connected(1, 3)).toBe(true);
    });
  });

  describe("size", () => {
    it("tracks number of disjoint sets", () => {
      const ds = new DisjointSet<string>();
      ds.makeSet("a");
      ds.makeSet("b");
      ds.makeSet("c");
      expect(ds.size).toBe(3);
      ds.union("a", "b");
      expect(ds.size).toBe(2);
      ds.union("b", "c");
      expect(ds.size).toBe(1);
    });
  });

  describe("path compression", () => {
    it("compresses paths after finds", () => {
      const ds = new DisjointSet<number>();
      for (let i = 0; i < 10; i++) {
        ds.makeSet(i);
      }
      // Chain unions: 0-1, 1-2, ..., 8-9
      for (let i = 1; i < 10; i++) {
        ds.union(i - 1, i);
      }
      // After find on leaf, all should have same root
      const root = ds.find(9);
      for (let i = 0; i < 9; i++) {
        expect(ds.find(i)).toBe(root);
        expect(ds.connected(i, 9)).toBe(true);
      }
    });
  });

  describe("edge cases", () => {
    it("works with object keys", () => {
      const ds = new DisjointSet<object>();
      const a = {};
      const b = {};
      ds.makeSet(a);
      ds.makeSet(b);
      ds.union(a, b);
      expect(ds.connected(a, b)).toBe(true);
    });

    it("works with string keys", () => {
      const ds = new DisjointSet<string>();
      ds.makeSet("x");
      ds.makeSet("y");
      ds.union("x", "y");
      expect(ds.connected("x", "y")).toBe(true);
    });

    it("connected throws for unknown elements", () => {
      const ds = new DisjointSet<number>();
      ds.makeSet(1);
      expect(() => ds.connected(1, 2)).toThrow();
    });
  });
});
