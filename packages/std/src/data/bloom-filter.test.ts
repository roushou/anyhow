import { describe, expect, it } from "bun:test";
import { BloomFilter } from "./bloom-filter.js";

describe("BloomFilter", () => {
  describe("add / has", () => {
    it("returns true for added items", () => {
      const filter = new BloomFilter(1000);
      filter.add("hello");
      filter.add("world");
      expect(filter.has("hello")).toBe(true);
      expect(filter.has("world")).toBe(true);
    });

    it("returns false for items not added (probably)", () => {
      const filter = new BloomFilter(1000);
      filter.add("hello");
      expect(filter.has("world")).toBe(false);
    });

    it("handles empty string", () => {
      const filter = new BloomFilter(100);
      filter.add("");
      expect(filter.has("")).toBe(true);
    });
  });

  describe("false positive rate", () => {
    it("has low false positive rate within expected capacity", () => {
      const n = 1000;
      const filter = new BloomFilter(n, 0.01);
      const added = new Set<string>();
      // Add n items
      for (let i = 0; i < n; i++) {
        const s = `item-${i}`;
        filter.add(s);
        added.add(s);
      }
      // Check all added items are found
      for (const s of added) {
        expect(filter.has(s)).toBe(true);
      }
      // Check false positive rate on non-added items
      let falsePositives = 0;
      const trials = 1000;
      for (let i = 0; i < trials; i++) {
        const s = `other-${i + n}`;
        if (filter.has(s)) falsePositives++;
      }
      // Should be roughly under 5% (allow generous margin)
      expect(falsePositives / trials).toBeLessThan(0.05);
    });
  });

  describe("estimatedSize", () => {
    it("starts at 0", () => {
      const filter = new BloomFilter(100);
      expect(filter.estimatedSize).toBe(0);
    });

    it("reflects inserted items", () => {
      const filter = new BloomFilter(1000);
      for (let i = 0; i < 100; i++) {
        filter.add(`item-${i}`);
      }
      // Should be roughly in the ballpark (allow 50% error)
      const est = filter.estimatedSize;
      expect(est).toBeGreaterThan(50);
      expect(est).toBeLessThan(200);
    });
  });

  describe("constructor options", () => {
    it("accepts custom false positive rate", () => {
      const filter = new BloomFilter(100, 0.001);
      filter.add("test");
      expect(filter.has("test")).toBe(true);
    });

    it("handles expectedItems of 0 gracefully", () => {
      const filter = new BloomFilter(0);
      filter.add("test");
      expect(filter.has("test")).toBe(true);
    });
  });
});
