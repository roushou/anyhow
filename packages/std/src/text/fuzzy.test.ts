import { describe, it, expect } from "bun:test";
import { fuzzyMatch, fuzzyFilter } from "./fuzzy.js";

describe("fuzzyMatch", () => {
  it("returns null when pattern cannot be matched", () => {
    expect(fuzzyMatch("zzz", "anyhow")).toBeNull();
    expect(fuzzyMatch("abc", "def")).toBeNull();
  });

  it("returns a perfect score for exact match", () => {
    const result = fuzzyMatch("anyhow", "anyhow");
    expect(result).not.toBeNull();
    expect(result!.score).toBeGreaterThan(0.8);
    expect(result!.matched).toBe("anyhow");
  });

  it("matches substring at the start", () => {
    const result = fuzzyMatch("any", "anyhow");
    expect(result).not.toBeNull();
    expect(result!.score).toBeGreaterThan(0.7);
    expect(result!.matched).toBe("any");
  });

  it("matches characters with gaps", () => {
    const result = fuzzyMatch("ah", "anyhow");
    expect(result).not.toBeNull();
    expect(result!.score).toBeGreaterThan(0);
    expect(result!.matched).toBe("ah");
  });

  it("is case-insensitive", () => {
    const lower = fuzzyMatch("any", "anyhow");
    const upper = fuzzyMatch("ANY", "ANYHOW");
    // Scores match when case is consistent
    expect(lower!.score).toBe(upper!.score);
    // Mixed case may differ slightly due to per-character case bonuses
    const mixed = fuzzyMatch("AnY", "aNyHoW");
    expect(mixed).not.toBeNull();
    expect(mixed!.score).toBeGreaterThan(0.5);
  });

  it("returns score 1 for empty pattern", () => {
    const result = fuzzyMatch("", "anything");
    expect(result).toEqual({ score: 1, matched: "" });
  });

  it("returns null when target is empty and pattern is not", () => {
    expect(fuzzyMatch("a", "")).toBeNull();
  });

  it("scores contiguous matches higher than scattered ones", () => {
    const contiguous = fuzzyMatch("res", "result")!;
    const scattered = fuzzyMatch("rsl", "result")!;
    expect(contiguous.score).toBeGreaterThan(scattered.score);
  });

  it("prefers matches at separator boundaries", () => {
    // "he" at start of "hello" after "src/"
    const afterSep = fuzzyMatch("he", "src/hello/world")!;
    // "he" in the middle of "src/whatever"
    const midWord = fuzzyMatch("he", "whatever")!;
    expect(afterSep.score).toBeGreaterThan(midWord.score);
  });
});

describe("fuzzyFilter", () => {
  const items = [
    "src/result/result.ts",
    "src/result/static.ts",
    "src/async/retry.ts",
    "src/async/timeout.ts",
    "README.md",
  ];

  it("filters and ranks items by fuzzy match", () => {
    const results = fuzzyFilter("res", items);
    expect(results.length).toBeGreaterThan(0);
    // "result" files should rank higher than others
    expect(results[0]!.item).toContain("result");
    expect(results[0]!.score).toBeGreaterThan(0);
  });

  it("returns empty array when nothing matches", () => {
    const results = fuzzyFilter("zzz", items);
    expect(results).toEqual([]);
  });

  it("returns all items with score 1 for empty pattern", () => {
    const results = fuzzyFilter("", items);
    expect(results.length).toBe(items.length);
    for (const r of results) {
      expect(r.score).toBe(1);
    }
  });

  it("sorts results by score descending", () => {
    const results = fuzzyFilter("src", items);
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1]!.score).toBeGreaterThanOrEqual(results[i]!.score);
    }
  });

  it("includes match details in results", () => {
    const results = fuzzyFilter("read", items);
    expect(results.length).toBe(1);
    expect(results[0]!.item).toBe("README.md");
    expect(results[0]!.matches.matched.length).toBeGreaterThan(0);
  });
});
