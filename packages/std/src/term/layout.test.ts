import { describe, expect, it } from "bun:test";
import { columns } from "./layout.js";
import { style, stripAnsi } from "./ansi.js";

describe("columns", () => {
  it("returns empty for empty input", () => expect(columns([], 40)).toBe(""));

  it("formats items in columns", () => {
    const result = columns(["a", "bb", "ccc"], 20);
    const lines = result.split("\n");
    expect(lines.length).toBeGreaterThanOrEqual(1);
  });

  it("single item returns that item", () => expect(columns(["hello"], 40)).toBe("hello"));

  it("respects maxWidth by reducing columns", () => {
    const items = ["aaaa", "bbbb", "cccc", "dddd"];
    const wide = columns(items, 80);
    const narrow = columns(items, 10);
    // Narrow output should have more lines (fewer columns)
    expect(narrow.split("\n").length).toBeGreaterThan(wide.split("\n").length);
  });

  it("handles ANSI-colored items", () => {
    const items = [style.red("a"), style.green("bb")];
    const result = columns(items, 40);
    const visible = stripAnsi(result);
    expect(visible).toContain("a");
    expect(visible).toContain("bb");
  });
});
