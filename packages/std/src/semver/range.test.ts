import { describe, expect, it } from "bun:test";
import { satisfies } from "./range.js";

describe("satisfies", () => {
  // Exact
  it("matches exact version", () => expect(satisfies("1.2.3", "1.2.3")).toBe(true));
  it("rejects different exact version", () => expect(satisfies("1.2.4", "1.2.3")).toBe(false));

  // Caret
  it("caret matches compatible versions", () => {
    expect(satisfies("1.2.3", "^1.0.0")).toBe(true);
    expect(satisfies("1.9.9", "^1.0.0")).toBe(true);
    expect(satisfies("2.0.0", "^1.0.0")).toBe(false);
    expect(satisfies("0.2.3", "^0.2.0")).toBe(true);
    expect(satisfies("0.3.0", "^0.2.0")).toBe(false);
  });

  // Tilde
  it("tilde matches patch-level changes", () => {
    expect(satisfies("1.2.3", "~1.2.0")).toBe(true);
    expect(satisfies("1.2.9", "~1.2.0")).toBe(true);
    expect(satisfies("1.3.0", "~1.2.0")).toBe(false);
  });

  // Comparisons
  it("comparison operators", () => {
    expect(satisfies("1.2.3", ">=1.2.0")).toBe(true);
    expect(satisfies("1.1.0", ">=1.2.0")).toBe(false);
    expect(satisfies("1.2.3", "<=1.2.3")).toBe(true);
    expect(satisfies("1.2.3", ">1.2.0")).toBe(true);
    expect(satisfies("1.2.0", ">1.2.0")).toBe(false);
    expect(satisfies("1.2.3", "<1.3.0")).toBe(true);
  });

  // AND (space-separated)
  it("AND intersection", () => {
    expect(satisfies("1.5.0", ">=1.2.0 <2.0.0")).toBe(true);
    expect(satisfies("2.1.0", ">=1.2.0 <2.0.0")).toBe(false);
  });

  // OR
  it("OR union", () => {
    expect(satisfies("1.2.3", "1.2.3 || 2.0.0")).toBe(true);
    expect(satisfies("2.0.0", "1.2.3 || 2.0.0")).toBe(true);
    expect(satisfies("3.0.0", "1.2.3 || 2.0.0")).toBe(false);
  });

  // Ranges
  it("range expressions", () => {
    expect(satisfies("1.5.0", "1.0.0 - 2.0.0")).toBe(true);
    expect(satisfies("3.0.0", "1.0.0 - 2.0.0")).toBe(false);
  });

  // Wildcards
  it("wildcards", () => {
    expect(satisfies("1.2.3", "1.2.x")).toBe(true);
    expect(satisfies("1.3.0", "1.2.x")).toBe(false);
    expect(satisfies("1.2.3", "1.x")).toBe(true);
    expect(satisfies("2.0.0", "1.x")).toBe(false);
    expect(satisfies("1.2.3", "*")).toBe(true);
    expect(satisfies("99.0.0", "*")).toBe(true);
  });

  // Edge cases
  it("rejects invalid version", () => expect(satisfies("abc", "1.0.0")).toBe(false));
  it("empty range returns false", () => expect(satisfies("1.0.0", "")).toBe(false));
});
