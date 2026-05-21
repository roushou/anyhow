import { describe, expect, it } from "bun:test";
import { currency, date, list, number, relativeTime } from "./intl.js";

describe("currency", () => {
  it("formats a number as currency", () => {
    expect(currency(1234.56, "USD", "en-US")).toContain("1,234.56");
  });
  it("handles zero", () => {
    const result = currency(0, "EUR", "en-US");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });
});

describe("number", () => {
  it("formats a number with defaults", () => {
    expect(number(1234567.89, undefined, "en-US")).toContain("1,234,567.89");
  });
  it("respects options", () => {
    expect(number(0.42, { style: "percent" }, "en-US")).toContain("42");
  });
});

describe("date", () => {
  const d = new Date(2024, 0, 15);

  it("formats a date with default options", () => {
    expect(date(d, undefined, "en-US")).toContain("2024");
  });
  it('formats a date with "full" style', () => {
    const result = date(d, "full", "en-US");
    expect(result).toContain("2024");
    expect(result).toContain("Monday");
  });
  it('formats a date with "short" style', () => {
    expect(date(d, "short", "en-US")).toContain("24");
  });
  it("formats a date with custom options", () => {
    const result = date(d, { year: "numeric", month: "long" }, "en-US");
    expect(result).toContain("January");
    expect(result).toContain("2024");
  });
});

describe("relativeTime", () => {
  it("formats relative time", () => {
    const result = relativeTime(-1, "day", "en-US");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });
  it("handles positive values", () => {
    const result = relativeTime(2, "month", "en-US");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });
});

describe("list", () => {
  it("formats a conjunction list", () => {
    const result = list(["a", "b", "c"], "conjunction", "en-US");
    expect(result).toContain("a");
    expect(result).toContain("b");
    expect(result).toContain("c");
  });
  it("formats a disjunction list", () => {
    const result = list(["x", "y"], "disjunction", "en-US");
    expect(result).toContain("x");
    expect(result).toContain("y");
  });
  it("defaults to conjunction", () => {
    const result = list(["one", "two"], undefined, "en-US");
    expect(result).toContain("one");
    expect(result).toContain("two");
  });
});
