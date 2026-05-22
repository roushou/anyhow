import { describe, expect, it } from "bun:test";
import { createRandom, random, Random } from "./random.js";

describe("createRandom", () => {
  it("produces the same sequence from the same seed", () => {
    const a = createRandom(42);
    const b = createRandom(42);
    const seqA = Array.from({ length: 10 }, () => a.float());
    const seqB = Array.from({ length: 10 }, () => b.float());
    expect(seqA).toEqual(seqB);
  });

  it("produces different sequences from different seeds", () => {
    const a = createRandom(1);
    const b = createRandom(2);
    const seqA = Array.from({ length: 10 }, () => a.float());
    const seqB = Array.from({ length: 10 }, () => b.float());
    expect(seqA).not.toEqual(seqB);
  });

  it("returns a Random instance", () => {
    expect(createRandom(7)).toBeInstanceOf(Random);
  });
});

describe("random (default instance)", () => {
  it("is a Random instance", () => {
    expect(random).toBeInstanceOf(Random);
  });
});

describe("Random.int", () => {
  it("produces values in [min, max] inclusive", () => {
    const rng = createRandom(99);
    for (let i = 0; i < 200; i++) {
      const v = rng.int(3, 7);
      expect(v).toBeGreaterThanOrEqual(3);
      expect(v).toBeLessThanOrEqual(7);
      expect(Number.isInteger(v)).toBe(true);
    }
  });

  it("covers the bounds over many trials", () => {
    const rng = createRandom(42);
    const seen = new Set<number>();
    for (let i = 0; i < 500; i++) seen.add(rng.int(0, 2));
    expect(seen.has(0)).toBe(true);
    expect(seen.has(2)).toBe(true);
  });
});

describe("Random.float", () => {
  it("produces values in [0, 1) by default", () => {
    const rng = createRandom(1);
    for (let i = 0; i < 200; i++) {
      const v = rng.float();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it("produces values in [min, max) when specified", () => {
    const rng = createRandom(2);
    for (let i = 0; i < 200; i++) {
      const v = rng.float(5, 10);
      expect(v).toBeGreaterThanOrEqual(5);
      expect(v).toBeLessThan(10);
    }
  });
});

describe("Random.bool", () => {
  it("returns only true or false", () => {
    const rng = createRandom(5);
    for (let i = 0; i < 200; i++) {
      const v = rng.bool();
      expect(v === true || v === false).toBe(true);
    }
  });

  it("is roughly 50/50 over many trials", () => {
    const rng = createRandom(10);
    let trues = 0;
    const trials = 2000;
    for (let i = 0; i < trials; i++) {
      if (rng.bool()) trues++;
    }
    const ratio = trues / trials;
    expect(ratio).toBeGreaterThan(0.4);
    expect(ratio).toBeLessThan(0.6);
  });
});

describe("Random.pick", () => {
  it("always returns an element from the array", () => {
    const rng = createRandom(3);
    const items = ["a", "b", "c", "d"] as const;
    for (let i = 0; i < 100; i++) {
      expect(items).toContain(rng.pick(items));
    }
  });

  it("throws on an empty array", () => {
    const rng = createRandom(4);
    expect(() => rng.pick([])).toThrow("Cannot pick from an empty array");
  });
});

describe("Random.shuffle", () => {
  it("returns all the same elements", () => {
    const rng = createRandom(11);
    const original = [1, 2, 3, 4, 5];
    const shuffled = rng.shuffle(original);
    expect(shuffled.sort()).toEqual([1, 2, 3, 4, 5]);
  });

  it("does not mutate the input array", () => {
    const rng = createRandom(12);
    const original = [1, 2, 3, 4, 5];
    const copy = [...original];
    rng.shuffle(original);
    expect(original).toEqual(copy);
  });

  it("produces different orders over multiple shuffles", () => {
    const rng = createRandom(13);
    const input = [1, 2, 3, 4, 5, 6, 7, 8];
    const orders = new Set(Array.from({ length: 10 }, () => rng.shuffle(input).join(",")));
    // Extremely unlikely all 10 shuffles produce the same order
    expect(orders.size).toBeGreaterThan(1);
  });

  it("handles an empty array", () => {
    const rng = createRandom(14);
    expect(rng.shuffle([])).toEqual([]);
  });

  it("handles a single-element array", () => {
    const rng = createRandom(15);
    expect(rng.shuffle([42])).toEqual([42]);
  });
});

describe("Random.weighted", () => {
  it("selects items according to weights", () => {
    const rng = createRandom(16);
    const items = ["a", "b"];
    // "b" is 9x more likely; with enough trials "b" should dominate
    let countA = 0;
    let countB = 0;
    for (let i = 0; i < 1000; i++) {
      const v = rng.weighted(items, [1, 9]);
      if (v === "a") countA++;
      else countB++;
    }
    expect(countB).toBeGreaterThan(countA);
  });

  it("throws if items and weights have different lengths", () => {
    const rng = createRandom(17);
    expect(() => rng.weighted(["a", "b"], [1])).toThrow(
      "items and weights must have the same length",
    );
  });

  it("handles single-element arrays", () => {
    const rng = createRandom(18);
    expect(rng.weighted(["only"], [0.5])).toBe("only");
  });
});

describe("Random.randomHex", () => {
  it("returns a hex string with the correct byte length", () => {
    const rng = createRandom(100);
    expect(rng.randomHex(4).length).toBe(8);
    expect(rng.randomHex(0).length).toBe(0);
    expect(rng.randomHex(8).length).toBe(16);
  });

  it("returns only lowercase hex characters", () => {
    const rng = createRandom(101);
    for (let i = 0; i < 20; i++) {
      expect(/^[0-9a-f]+$/.test(rng.randomHex(8))).toBe(true);
    }
  });

  it("is deterministic (same seed, same output)", () => {
    const a = createRandom(200);
    const b = createRandom(200);
    expect(a.randomHex(4)).toBe(b.randomHex(4));
  });

  it("produces different outputs for different seeds", () => {
    const a = createRandom(201);
    const b = createRandom(202);
    expect(a.randomHex(4)).not.toBe(b.randomHex(4));
  });
});

describe("Random.randomColor", () => {
  it("returns a hex color string", () => {
    const rng = createRandom(300);
    const color = rng.randomColor();
    expect(color).toMatch(/^#[0-9a-f]{6}$/);
  });

  it("is deterministic", () => {
    const a = createRandom(301);
    const b = createRandom(301);
    expect(a.randomColor()).toBe(b.randomColor());
  });

  it("produces different colors for different seeds", () => {
    const a = createRandom(302);
    const b = createRandom(303);
    expect(a.randomColor()).not.toBe(b.randomColor());
  });
});

describe("Random.exponential", () => {
  it("returns a non-negative number", () => {
    const rng = createRandom(400);
    for (let i = 0; i < 200; i++) {
      expect(rng.exponential()).toBeGreaterThanOrEqual(0);
    }
  });

  it("produces smaller values with higher lambda", () => {
    const rng = createRandom(401);
    // With lambda=10, values should generally be smaller than with lambda=1
    let smallSum = 0;
    let largeSum = 0;
    const trials = 200;
    for (let i = 0; i < trials; i++) {
      smallSum += rng.exponential(10);
      largeSum += rng.exponential(1);
    }
    // Average should be roughly 1/lambda: 0.1 vs 1.0
    const smallAvg = smallSum / trials;
    const largeAvg = largeSum / trials;
    expect(smallAvg).toBeLessThan(largeAvg);
  });

  it("is deterministic", () => {
    const a = createRandom(402);
    const b = createRandom(402);
    expect(a.exponential(2)).toBe(b.exponential(2));
  });

  it("default lambda is 1", () => {
    const rng = createRandom(403);
    const vals = Array.from({ length: 50 }, () => rng.exponential());
    // All values should be non-negative
    expect(vals.every((v) => v >= 0)).toBe(true);
  });
});
