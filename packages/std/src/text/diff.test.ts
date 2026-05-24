import { describe, it, expect } from "bun:test";
import { diffLines, diffWords } from "./diff.js";

describe("diffLines", () => {
  it("returns equal for identical strings", () => {
    const result = diffLines("hello\nworld", "hello\nworld");
    expect(result).toEqual([
      { type: "equal", value: "hello" },
      { type: "equal", value: "world" },
    ]);
  });

  it("detects a single line change", () => {
    const result = diffLines("hello\nworld\nfoo", "hello\nWORLD\nfoo");
    expect(result).toEqual([
      { type: "equal", value: "hello" },
      { type: "delete", value: "world" },
      { type: "insert", value: "WORLD" },
      { type: "equal", value: "foo" },
    ]);
  });

  it("detects insertions", () => {
    const result = diffLines("hello\nworld", "hello\nWORLD\nfoo");
    expect(result).toEqual([
      { type: "equal", value: "hello" },
      { type: "delete", value: "world" },
      { type: "insert", value: "WORLD" },
      { type: "insert", value: "foo" },
    ]);
  });

  it("detects deletions", () => {
    const result = diffLines("hello\nworld\nfoo", "hello\nworld");
    expect(result).toEqual([
      { type: "equal", value: "hello" },
      { type: "equal", value: "world" },
      { type: "delete", value: "foo" },
    ]);
  });

  it("handles completely different content", () => {
    const result = diffLines("a\nb", "x\ny");
    expect(result).toEqual([
      { type: "delete", value: "a" },
      { type: "delete", value: "b" },
      { type: "insert", value: "x" },
      { type: "insert", value: "y" },
    ]);
  });

  it("handles empty input", () => {
    expect(diffLines("", "")).toEqual([]);
    expect(diffLines("", "hello")).toEqual([{ type: "insert", value: "hello" }]);
    expect(diffLines("hello", "")).toEqual([{ type: "delete", value: "hello" }]);
  });

  it("handles multiple empty lines", () => {
    // "\n\n".split("\n") = ["","",""], "\n".split("\n") = ["",""]
    // LCS picks 2 empty strings as equal, leaving one delete
    const result = diffLines("\n\n", "\n");
    expect(result).toEqual([
      { type: "equal", value: "" },
      { type: "equal", value: "" },
      { type: "delete", value: "" },
    ]);
  });
});

describe("diffWords", () => {
  it("returns equal for identical strings", () => {
    const result = diffWords("hello world", "hello world");
    // Both should be marked as equal
    expect(result.every((op) => op.type === "equal")).toBe(true);
  });

  it("detects a word change", () => {
    const result = diffWords("the quick brown fox", "the slow brown dog");
    // Tokenized as ["the"," ","quick"," ","brown"," ","fox"] vs ["the"," ","slow"," ","brown"," ","dog"]
    expect(result).toContainEqual({ type: "equal", value: "the" });
    expect(result).toContainEqual({ type: "equal", value: " " });
    expect(result).toContainEqual({ type: "delete", value: "quick" });
    expect(result).toContainEqual({ type: "insert", value: "slow" });
    expect(result).toContainEqual({ type: "equal", value: "brown" });
    expect(result).toContainEqual({ type: "delete", value: "fox" });
    expect(result).toContainEqual({ type: "insert", value: "dog" });
  });

  it("detects insertions", () => {
    const result = diffWords("hello world", "hello beautiful world");
    // Tokenized: ["hello"," ","world"] vs ["hello"," ","beautiful"," ","world"]
    // Inserted "beautiful" and its trailing space
    const insertOps = result.filter((op) => op.type === "insert");
    expect(insertOps.length).toBe(2);
    expect(insertOps[0]!.value).toBe("beautiful");
    expect(insertOps[1]!.value).toBe(" ");
  });

  it("detects deletions", () => {
    const result = diffWords("hello beautiful world", "hello world");
    // Tokenized: ["hello"," ","beautiful"," ","world"] vs ["hello"," ","world"]
    // Deleted "beautiful" and its trailing space
    const deleteOps = result.filter((op) => op.type === "delete");
    expect(deleteOps.length).toBe(2);
    expect(deleteOps[0]!.value).toBe("beautiful");
    expect(deleteOps[1]!.value).toBe(" ");
  });

  it("handles empty input", () => {
    expect(diffWords("", "")).toEqual([]);
    expect(diffWords("", "hello")).toEqual([{ type: "insert", value: "hello" }]);
    expect(diffWords("hello", "")).toEqual([{ type: "delete", value: "hello" }]);
  });

  it("preserves whitespace", () => {
    const result = diffWords("hello  world", "hello world");
    // The double-space vs single-space difference should be captured
    const hasSpaceDiff = result.some((op) => op.type !== "equal");
    expect(hasSpaceDiff).toBe(true);
  });
});
