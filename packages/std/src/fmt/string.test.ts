import { describe, expect, it } from "bun:test";
import { pluralize, truncate } from "./string.js";

// ── truncate ──

describe("truncate", () => {
  it("returns the string unchanged when shorter than maxLen", () => {
    expect(truncate("hello", 10)).toBe("hello");
  });

  it("returns the string unchanged when equal to maxLen", () => {
    expect(truncate("hello", 5)).toBe("hello");
  });

  it("truncates with default ellipsis", () => {
    // 8 chars: keep 7 + 1-char ellipsis "…"
    expect(truncate("hello world", 8)).toBe("hello w…");
  });

  it("accepts a custom ellipsis string as the third arg", () => {
    expect(truncate("hello world", 8, "...")).toBe("hello...");
  });

  it("accepts an options object", () => {
    expect(truncate("hello world", 8, { ellipsis: "…" })).toBe("hello w…");
  });

  it("truncates from the start", () => {
    expect(truncate("hello world", 8, { position: "start" })).toBe("…o world");
  });

  it("truncates from the middle", () => {
    // 8 chars: keep 7, split ceil(7/2)=4 left, 3 right
    expect(truncate("hello world", 8, { position: "middle" })).toBe("hell…rld");
  });

  it("handles maxLen smaller than ellipsis", () => {
    expect(truncate("hello", 2, "...")).toBe("..");
  });

  it("handles maxLen equal to ellipsis length", () => {
    expect(truncate("hello", 3, "...")).toBe("...");
  });

  it("handles empty string", () => {
    expect(truncate("", 5)).toBe("");
  });
});

// ── pluralize ──

describe("pluralize", () => {
  it("returns singular for count 1", () => {
    expect(pluralize(1, "cat")).toBe("1 cat");
  });

  it("auto-appends 's' for count > 1", () => {
    expect(pluralize(3, "cat")).toBe("3 cats");
  });

  it("auto-appends 's' for count 0", () => {
    expect(pluralize(0, "cat")).toBe("0 cats");
  });

  it("uses explicit plural form", () => {
    expect(pluralize(1, "child", "children")).toBe("1 child");
    expect(pluralize(3, "child", "children")).toBe("3 children");
  });

  it("uses Intl.PluralRules with a forms record", () => {
    // Russian: "кот" (one), "кота" (few), "котов" (many/other)
    const result = pluralize(5, { one: "кот", few: "кота", other: "котов" }, { locale: "ru" });
    expect(result).toBe("5 котов");
  });

  it("falls back to 'one' when the plural category is not in the record", () => {
    const result = pluralize(1, { one: "item", other: "items" }, { locale: "en" });
    expect(result).toBe("1 item");
  });

  it("falls back to 'other' when category and 'one' are missing", () => {
    const result = pluralize(5, { other: "things" } as any, { locale: "en" });
    expect(result).toBe("5 things");
  });

  it("handles negative counts", () => {
    expect(pluralize(-1, "cat")).toBe("-1 cat");
  });

  it("handles count 0 with forms record", () => {
    // English uses "other" for 0
    const result = pluralize(0, { one: "item", other: "items" }, { locale: "en" });
    expect(result).toBe("0 items");
  });
});
