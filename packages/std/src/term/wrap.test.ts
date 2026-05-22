import { describe, expect, it } from "bun:test";
import { wordWrap } from "./wrap.js";
import { style, stripAnsi } from "./ansi.js";

describe("wordWrap", () => {
  it("returns text unchanged when it fits", () => expect(wordWrap("hello", 10)).toBe("hello"));

  it("wraps at word boundaries", () => expect(wordWrap("hello world", 6)).toBe("hello\nworld"));

  it("indents continuation lines", () =>
    expect(wordWrap("hello world", 6, { indent: 2 })).toBe("hello\n  world"));

  it("handles long words in soft mode (no break)", () =>
    expect(wordWrap("supercalifragilistic", 6)).toBe("supercalifragilistic"));

  it("hard-wraps long words", () =>
    expect(wordWrap("supercalifragilistic", 6, { hard: true })).toBe("superc\nalifra\ngilist\nic"));

  it("preserves ANSI codes across wrapped lines", () => {
    const text = style.red("hello world from mars");
    const result = wordWrap(text, 15);
    const lines = result.split("\n");
    // Each line should have ANSI styling (close at end, re-open at start)
    for (const line of lines) {
      expect(line).toContain("\x1b[");
    }
    // Visible text should be correct
    expect(stripAnsi(result)).toBe("hello world\nfrom mars");
  });

  it("handles multiple words", () =>
    expect(wordWrap("the quick brown fox", 10)).toBe("the quick\nbrown fox"));

  it("handles indent with ANSI codes", () => {
    const text = style.red("hello world from mars");
    const result = wordWrap(text, 15, { indent: 2 });
    const lines = result.split("\n");
    // Visible text should be correct
    expect(stripAnsi(lines[0]!)).toBe("hello world");
    expect(stripAnsi(lines[1]!)).toBe("  from mars");
    // Continuation lines should have indent and re-emit ANSI codes
    expect(lines[1]!.startsWith("  \x1b")).toBe(true);
  });
});
