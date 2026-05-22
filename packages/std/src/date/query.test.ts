import { describe, expect, it } from "bun:test";
import { daysInMonth, daysInYear, dayOfYear, weekOfYear, getQuarter } from "./query.js";

describe("daysInMonth", () => {
  it("returns 31 for January", () => expect(daysInMonth(new Date("2024-01-01"))).toBe(31));
  it("returns 29 for February in leap year", () =>
    expect(daysInMonth(new Date("2024-02-01"))).toBe(29));
  it("returns 28 for February in non-leap year", () =>
    expect(daysInMonth(new Date("2025-02-01"))).toBe(28));
  it("returns 30 for April", () => expect(daysInMonth(new Date("2024-04-01"))).toBe(30));
});

describe("daysInYear", () => {
  it("returns 366 for leap year", () => expect(daysInYear(new Date("2024-01-01"))).toBe(366));
  it("returns 365 for non-leap year", () => expect(daysInYear(new Date("2025-01-01"))).toBe(365));
});

describe("dayOfYear", () => {
  it("returns 1 for Jan 1", () => expect(dayOfYear(new Date("2024-01-01T12:00:00Z"))).toBe(1));
  it("returns 32 for Feb 1", () => expect(dayOfYear(new Date("2024-02-01T00:00:00Z"))).toBe(32));
  it("returns 366 for Dec 31 in leap year", () =>
    expect(dayOfYear(new Date("2024-12-31T00:00:00Z"))).toBe(366));
  it("returns 365 for Dec 31 in non-leap year", () =>
    expect(dayOfYear(new Date("2025-12-31T00:00:00Z"))).toBe(365));
});

describe("weekOfYear", () => {
  it("returns 1 for Jan 1 2024 (Monday)", () =>
    expect(weekOfYear(new Date("2024-01-01T00:00:00Z"))).toBe(1));
  it("returns 53 for last week of 2020", () =>
    expect(weekOfYear(new Date("2020-12-31T00:00:00Z"))).toBe(53));
  it("returns 1 for Dec 31 2024 (belongs to 2025 by ISO)", () =>
    expect(weekOfYear(new Date("2024-12-31T00:00:00Z"))).toBe(1));
});

describe("getQuarter", () => {
  it("returns 1 for January", () => expect(getQuarter(new Date("2024-01-15"))).toBe(1));
  it("returns 2 for April", () => expect(getQuarter(new Date("2024-04-01"))).toBe(2));
  it("returns 3 for July", () => expect(getQuarter(new Date("2024-07-01"))).toBe(3));
  it("returns 4 for October", () => expect(getQuarter(new Date("2024-10-01"))).toBe(4));
  it("returns 4 for December", () => expect(getQuarter(new Date("2024-12-31"))).toBe(4));
});
