import { describe, expect, it } from "bun:test";
import { dateRange, clampDate, minDate, maxDate } from "./range.js";

describe("dateRange", () => {
  it("iterates from start to end", () => {
    const start = new Date("2024-01-01T00:00:00Z");
    const end = new Date("2024-01-03T00:00:00Z");
    const dates = [...dateRange(start, end)];
    expect(dates).toHaveLength(3);
    expect(dates[0]!.getUTCDate()).toBe(1);
    expect(dates[1]!.getUTCDate()).toBe(2);
    expect(dates[2]!.getUTCDate()).toBe(3);
  });
  it("yields one date when start equals end", () => {
    const d = new Date("2024-01-01T00:00:00Z");
    expect([...dateRange(d, d)]).toHaveLength(1);
  });
  it("returns empty when start > end", () => {
    const start = new Date("2024-01-03T00:00:00Z");
    const end = new Date("2024-01-01T00:00:00Z");
    expect([...dateRange(start, end)]).toHaveLength(0);
  });
  it("returns empty when step is 0", () => {
    const d = new Date("2024-01-01T00:00:00Z");
    expect([...dateRange(d, new Date("2024-01-05T00:00:00Z"), 0)]).toHaveLength(0);
  });
  it("returns empty when step is negative", () => {
    const d = new Date("2024-01-01T00:00:00Z");
    expect([...dateRange(d, new Date("2024-01-05T00:00:00Z"), -1)]).toHaveLength(0);
  });
  it("steps by custom interval", () => {
    const start = new Date("2024-01-01T00:00:00Z");
    const end = new Date("2024-01-10T00:00:00Z");
    const dates = [...dateRange(start, end, 3)];
    expect(dates).toHaveLength(4);
    expect(dates[0]!.getUTCDate()).toBe(1);
    expect(dates[1]!.getUTCDate()).toBe(4);
    expect(dates[2]!.getUTCDate()).toBe(7);
    expect(dates[3]!.getUTCDate()).toBe(10);
  });
});

describe("clampDate", () => {
  const min = new Date("2024-01-01T00:00:00Z");
  const max = new Date("2024-12-31T23:59:59Z");

  it("returns date when within range", () => {
    const d = new Date("2024-06-15T00:00:00Z");
    expect(clampDate(d, min, max).getTime()).toBe(d.getTime());
  });
  it("returns min when date is before", () =>
    expect(clampDate(new Date("2023-01-01T00:00:00Z"), min, max).getTime()).toBe(min.getTime()));
  it("returns max when date is after", () =>
    expect(clampDate(new Date("2025-01-01T00:00:00Z"), min, max).getTime()).toBe(max.getTime()));
  it("returns min when date equals min", () =>
    expect(clampDate(new Date(min), min, max).getTime()).toBe(min.getTime()));
  it("returns max when date equals max", () =>
    expect(clampDate(new Date(max), min, max).getTime()).toBe(max.getTime()));
});

describe("minDate", () => {
  it("returns earliest date", () => {
    const a = new Date("2024-03-01T00:00:00Z");
    const b = new Date("2024-01-01T00:00:00Z");
    const c = new Date("2024-06-01T00:00:00Z");
    expect(minDate([a, b, c]).getTime()).toBe(b.getTime());
  });
  it("handles single element", () => {
    const d = new Date("2024-01-01T00:00:00Z");
    expect(minDate([d]).getTime()).toBe(d.getTime());
  });
});

describe("maxDate", () => {
  it("returns latest date", () => {
    const a = new Date("2024-03-01T00:00:00Z");
    const b = new Date("2024-01-01T00:00:00Z");
    const c = new Date("2024-06-01T00:00:00Z");
    expect(maxDate([a, b, c]).getTime()).toBe(c.getTime());
  });
  it("handles single element", () => {
    const d = new Date("2024-01-01T00:00:00Z");
    expect(maxDate([d]).getTime()).toBe(d.getTime());
  });
});
