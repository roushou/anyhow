import { describe, expect, it } from "bun:test";
import {
  isBefore,
  isAfter,
  isEqual,
  isSameDay,
  isSameMonth,
  isSameYear,
  isToday,
  isYesterday,
  isTomorrow,
  isPast,
  isFuture,
  isWeekend,
  isWeekday,
  isLeapYear,
} from "./compare.js";
import { addDays } from "./manipulate.js";

const jan1 = new Date("2024-01-01T00:00:00Z");
const jan2 = new Date("2024-01-02T00:00:00Z");

describe("isBefore", () => {
  it("returns true when date < other", () => expect(isBefore(jan1, jan2)).toBe(true));
  it("returns false when equal", () => expect(isBefore(jan1, new Date(jan1))).toBe(false));
  it("returns false when date > other", () => expect(isBefore(jan2, jan1)).toBe(false));
});

describe("isAfter", () => {
  it("returns true when date > other", () => expect(isAfter(jan2, jan1)).toBe(true));
  it("returns false when equal", () => expect(isAfter(jan1, new Date(jan1))).toBe(false));
  it("returns false when date < other", () => expect(isAfter(jan1, jan2)).toBe(false));
});

describe("isEqual", () => {
  it("returns true for same timestamp", () => expect(isEqual(jan1, new Date(jan1))).toBe(true));
  it("returns false for different timestamps", () => expect(isEqual(jan1, jan2)).toBe(false));
});

describe("isSameDay", () => {
  it("returns true for same day", () => {
    const a = new Date("2024-01-01T08:00:00Z");
    const b = new Date("2024-01-01T20:00:00Z");
    expect(isSameDay(a, b)).toBe(true);
  });
  it("returns false for different days", () => expect(isSameDay(jan1, jan2)).toBe(false));
});

describe("isSameMonth", () => {
  it("returns true for same month", () => {
    const a = new Date("2024-01-01T00:00:00Z");
    const b = new Date("2024-01-31T23:59:59Z");
    expect(isSameMonth(a, b)).toBe(true);
  });
  it("returns false for different months", () =>
    expect(isSameMonth(jan1, new Date("2024-02-01T00:00:00Z"))).toBe(false));
});

describe("isSameYear", () => {
  it("returns true for same year", () => {
    const a = new Date("2024-01-01T00:00:00Z");
    const b = new Date("2024-12-31T23:59:59Z");
    expect(isSameYear(a, b)).toBe(true);
  });
  it("returns false for different years", () =>
    expect(isSameYear(jan1, new Date("2025-01-01T00:00:00Z"))).toBe(false));
});

describe("isToday", () => {
  it("returns true for today", () => expect(isToday(new Date())).toBe(true));
  it("returns false for yesterday", () => expect(isToday(addDays(new Date(), -1))).toBe(false));
});

describe("isYesterday", () => {
  it("returns true for yesterday", () => expect(isYesterday(addDays(new Date(), -1))).toBe(true));
  it("returns false for today", () => expect(isYesterday(new Date())).toBe(false));
});

describe("isTomorrow", () => {
  it("returns true for tomorrow", () => expect(isTomorrow(addDays(new Date(), 1))).toBe(true));
  it("returns false for today", () => expect(isTomorrow(new Date())).toBe(false));
});

describe("isPast", () => {
  it("returns true for dates in the past", () => expect(isPast(new Date("2020-01-01"))).toBe(true));
  it("returns false for dates in the future", () =>
    expect(isPast(new Date("2099-01-01"))).toBe(false));
});

describe("isFuture", () => {
  it("returns true for dates in the future", () =>
    expect(isFuture(new Date("2099-01-01"))).toBe(true));
  it("returns false for dates in the past", () =>
    expect(isFuture(new Date("2020-01-01"))).toBe(false));
});

describe("isWeekend", () => {
  it("returns true for Saturday", () =>
    expect(isWeekend(new Date("2024-01-06T00:00:00Z"))).toBe(true));
  it("returns true for Sunday", () =>
    expect(isWeekend(new Date("2024-01-07T00:00:00Z"))).toBe(true));
  it("returns false for Monday", () =>
    expect(isWeekend(new Date("2024-01-08T00:00:00Z"))).toBe(false));
});

describe("isWeekday", () => {
  it("returns true for Monday", () =>
    expect(isWeekday(new Date("2024-01-08T00:00:00Z"))).toBe(true));
  it("returns false for Saturday", () =>
    expect(isWeekday(new Date("2024-01-06T00:00:00Z"))).toBe(false));
});

describe("isLeapYear", () => {
  it("returns true for leap years", () => {
    expect(isLeapYear(new Date("2024-01-01"))).toBe(true);
    expect(isLeapYear(new Date("2000-01-01"))).toBe(true);
  });
  it("returns false for non-leap years", () => {
    expect(isLeapYear(new Date("2025-01-01"))).toBe(false);
    expect(isLeapYear(new Date("1900-01-01"))).toBe(false);
  });
});
