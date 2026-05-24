import { describe, it, expect } from "bun:test";
import { levenshtein, levenshteinRatio } from "./levenshtein.js";

describe("levenshtein", () => {
  it("returns 0 for identical strings", () => {
    expect(levenshtein("abc", "abc")).toBe(0);
    expect(levenshtein("", "")).toBe(0);
  });

  it("returns the right distance for known cases", () => {
    expect(levenshtein("kitten", "sitting")).toBe(3);
    expect(levenshtein("book", "back")).toBe(2);
    expect(levenshtein("flaw", "lawn")).toBe(2);
    expect(levenshtein("sunday", "saturday")).toBe(3);
  });

  it("handles empty strings", () => {
    expect(levenshtein("", "hello")).toBe(5);
    expect(levenshtein("hello", "")).toBe(5);
  });

  it("handles completely different strings", () => {
    expect(levenshtein("abc", "xyz")).toBe(3);
  });

  it("handles single character edits", () => {
    expect(levenshtein("a", "b")).toBe(1); // substitution
    expect(levenshtein("a", "")).toBe(1); // deletion
    expect(levenshtein("", "a")).toBe(1); // insertion
    expect(levenshtein("a", "ab")).toBe(1); // insertion
    expect(levenshtein("ab", "a")).toBe(1); // deletion
  });

  it("handles unicode", () => {
    expect(levenshtein("café", "cafe")).toBe(1);
    expect(levenshtein("你好", "你好吗")).toBe(1);
  });
});

describe("levenshteinRatio", () => {
  it("returns 1 for identical strings", () => {
    expect(levenshteinRatio("abc", "abc")).toBe(1);
  });

  it("returns 1 for two empty strings", () => {
    expect(levenshteinRatio("", "")).toBe(1);
  });

  it("returns 0 for completely different same-length strings", () => {
    expect(levenshteinRatio("abc", "xyz")).toBe(0);
  });

  it("returns a value between 0 and 1 for partial matches", () => {
    const ratio = levenshteinRatio("kitten", "sitting");
    expect(ratio).toBeGreaterThan(0.4);
    expect(ratio).toBeLessThan(0.7);
  });

  it("returns 0 when one string is empty", () => {
    expect(levenshteinRatio("", "hello")).toBe(0);
    expect(levenshteinRatio("hello", "")).toBe(0);
  });
});
