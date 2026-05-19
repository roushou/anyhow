import { describe, expect, it, mock } from "bun:test";
import { LRU } from "./lru.js";

describe("LRU", () => {
  describe("get / set", () => {
    it("stores and retrieves values", () => {
      const cache = new LRU<string, number>(10);
      cache.set("a", 1);
      expect(cache.get("a")).toBe(1);
    });

    it("returns undefined for missing keys", () => {
      const cache = new LRU<string, number>(10);
      expect(cache.get("missing")).toBeUndefined();
    });

    it("updates existing keys", () => {
      const cache = new LRU<string, number>(10);
      cache.set("a", 1);
      cache.set("a", 2);
      expect(cache.get("a")).toBe(2);
    });
  });

  describe("eviction", () => {
    it("evicts the oldest entry when capacity is exceeded", () => {
      const cache = new LRU<string, number>(2);
      cache.set("a", 1);
      cache.set("b", 2);
      cache.set("c", 3); // "a" should be evicted
      expect(cache.get("a")).toBeUndefined();
      expect(cache.get("b")).toBe(2);
      expect(cache.get("c")).toBe(3);
    });

    it("refreshes position on get", () => {
      const cache = new LRU<string, number>(2);
      cache.set("a", 1);
      cache.set("b", 2);
      cache.get("a"); // refresh "a" — now "b" is oldest
      cache.set("c", 3); // "b" should be evicted
      expect(cache.get("a")).toBe(1);
      expect(cache.get("b")).toBeUndefined();
      expect(cache.get("c")).toBe(3);
    });

    it("refreshes position on set", () => {
      const cache = new LRU<string, number>(2);
      cache.set("a", 1);
      cache.set("b", 2);
      cache.set("a", 99); // update "a" — now "b" is oldest
      cache.set("c", 3); // "b" should be evicted
      expect(cache.get("a")).toBe(99);
      expect(cache.get("b")).toBeUndefined();
      expect(cache.get("c")).toBe(3);
    });
  });

  describe("TTL", () => {
    it("returns undefined for expired entries", async () => {
      const cache = new LRU<string, number>(10, 30);
      cache.set("a", 1);
      expect(cache.get("a")).toBe(1);
      await new Promise((r) => setTimeout(r, 50));
      expect(cache.get("a")).toBeUndefined();
    });

    it("returns undefined for expired entries via has", async () => {
      const cache = new LRU<string, number>(10, 20);
      cache.set("a", 1);
      expect(cache.has("a")).toBe(true);
      await new Promise((r) => setTimeout(r, 40));
      expect(cache.has("a")).toBe(false);
    });

    it("does not expire when TTL is not set", async () => {
      const cache = new LRU<string, number>(10);
      cache.set("a", 1);
      await new Promise((r) => setTimeout(r, 50));
      expect(cache.get("a")).toBe(1);
    });
  });

  describe("getOrSet", () => {
    it("returns cached value and does not call make", () => {
      const cache = new LRU<string, number>(10);
      cache.set("a", 42);
      const make = mock(() => 99);
      expect(cache.getOrSet("a", make)).toBe(42);
      expect(make).not.toHaveBeenCalled();
    });

    it("calls make and stores on cache miss", () => {
      const cache = new LRU<string, number>(10);
      const make = mock(() => 99);
      expect(cache.getOrSet("a", make)).toBe(99);
      expect(make).toHaveBeenCalledTimes(1);
      // Second call should be cached
      expect(cache.getOrSet("a", make)).toBe(99);
      expect(make).toHaveBeenCalledTimes(1);
    });

    it("honors maxSize during getOrSet", () => {
      const cache = new LRU<string, number>(2);
      cache.getOrSet("a", () => 1);
      cache.getOrSet("b", () => 2);
      cache.getOrSet("c", () => 3);
      expect(cache.get("a")).toBeUndefined();
      expect(cache.get("b")).toBe(2);
      expect(cache.get("c")).toBe(3);
    });
  });

  describe("delete / clear / size", () => {
    it("deletes a key", () => {
      const cache = new LRU<string, number>(10);
      cache.set("a", 1);
      expect(cache.delete("a")).toBe(true);
      expect(cache.get("a")).toBeUndefined();
      expect(cache.delete("a")).toBe(false);
    });

    it("clears all entries", () => {
      const cache = new LRU<string, number>(10);
      cache.set("a", 1);
      cache.set("b", 2);
      cache.clear();
      expect(cache.size).toBe(0);
      expect(cache.get("a")).toBeUndefined();
    });

    it("tracks size correctly", () => {
      const cache = new LRU<string, number>(10);
      expect(cache.size).toBe(0);
      cache.set("a", 1);
      expect(cache.size).toBe(1);
      cache.set("b", 2);
      expect(cache.size).toBe(2);
      cache.delete("a");
      expect(cache.size).toBe(1);
    });
  });
});
