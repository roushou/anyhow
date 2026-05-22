import { describe, expect, it } from "bun:test";
import {
  differenceInMilliseconds,
  differenceInSeconds,
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
  differenceInWeeks,
  differenceInMonths,
  differenceInYears,
} from "./difference.js";

const jan1 = new Date("2024-01-01T00:00:00.000Z");
const jan2 = new Date("2024-01-02T00:00:00.000Z");
const feb1 = new Date("2024-02-01T00:00:00.000Z");

describe("differenceInMilliseconds", () => {
  it("returns positive when left > right", () =>
    expect(differenceInMilliseconds(jan2, jan1)).toBe(86_400_000));
  it("returns negative when left < right", () =>
    expect(differenceInMilliseconds(jan1, jan2)).toBe(-86_400_000));
  it("returns 0 when equal", () => {
    expect(differenceInMilliseconds(jan1, new Date(jan1))).toBe(0);
  });
});

describe("differenceInSeconds", () => {
  it("returns whole seconds", () => expect(differenceInSeconds(jan2, jan1)).toBe(86_400));
  it("truncates fractional seconds", () => {
    const a = new Date("2024-01-01T00:00:01.500Z");
    const b = new Date("2024-01-01T00:00:00.000Z");
    expect(differenceInSeconds(a, b)).toBe(1);
  });
});

describe("differenceInMinutes", () => {
  it("returns whole minutes", () => expect(differenceInMinutes(jan2, jan1)).toBe(1_440));
});

describe("differenceInHours", () => {
  it("returns whole hours", () => expect(differenceInHours(jan2, jan1)).toBe(24));
});

describe("differenceInDays", () => {
  it("returns whole days", () => expect(differenceInDays(jan2, jan1)).toBe(1));
  it("handles same-day with different times", () => {
    const a = new Date("2024-01-01T23:59:59Z");
    const b = new Date("2024-01-01T00:00:00Z");
    expect(differenceInDays(a, b)).toBe(0);
  });
  it("handles negative", () => expect(differenceInDays(jan1, jan2)).toBe(-1));
  it("crosses month boundary", () => expect(differenceInDays(feb1, jan1)).toBe(31));
});

describe("differenceInWeeks", () => {
  it("returns whole weeks", () => {
    const a = new Date("2024-01-15T00:00:00Z");
    expect(differenceInWeeks(a, jan1)).toBe(2);
  });
  it("truncates partial weeks", () => {
    const a = new Date("2024-01-13T00:00:00Z");
    expect(differenceInWeeks(a, jan1)).toBe(1);
  });
});

describe("differenceInMonths", () => {
  it("returns whole months", () => expect(differenceInMonths(feb1, jan1)).toBe(1));
  it("returns 0 for partial month", () => {
    const a = new Date("2024-01-15T00:00:00Z");
    expect(differenceInMonths(a, jan1)).toBe(0);
  });
  it("handles negative", () => expect(differenceInMonths(jan1, feb1)).toBe(-1));
  it("crosses year boundary", () => {
    const a = new Date("2025-03-01T00:00:00Z");
    expect(differenceInMonths(a, jan1)).toBe(14);
  });
});

describe("differenceInYears", () => {
  it("returns whole years", () => {
    const a = new Date("2025-01-01T00:00:00Z");
    expect(differenceInYears(a, jan1)).toBe(1);
  });
  it("returns 0 for partial year", () => {
    const a = new Date("2024-06-01T00:00:00Z");
    expect(differenceInYears(a, jan1)).toBe(0);
  });
  it("handles negative", () =>
    expect(differenceInYears(jan1, new Date("2025-01-01T00:00:00Z"))).toBe(-1));
  it("handles same-month-day boundary", () => {
    const a = new Date("2025-01-01T00:00:00Z");
    const b = new Date("2024-01-02T00:00:00Z");
    expect(differenceInYears(a, b)).toBe(0);
  });
});
