import { describe, expect, it } from "bun:test";
import {
  startOfDay,
  endOfDay,
  startOfHour,
  endOfHour,
  startOfMinute,
  endOfMinute,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from "./boundary.js";

describe("startOfDay", () => {
  it("resets to start of day", () => {
    const d = new Date("2024-01-01T15:30:45.500Z");
    const result = startOfDay(d);
    expect(result.getUTCHours()).toBe(0);
    expect(result.getUTCMinutes()).toBe(0);
    expect(result.getUTCSeconds()).toBe(0);
    expect(result.getUTCMilliseconds()).toBe(0);
  });
  it("returns new date", () => {
    const d = new Date();
    expect(startOfDay(d)).not.toBe(d);
  });
});

describe("endOfDay", () => {
  it("resets to end of day", () => {
    const d = new Date("2024-01-01T15:30:45.000Z");
    const result = endOfDay(d);
    expect(result.getUTCHours()).toBe(23);
    expect(result.getUTCMinutes()).toBe(59);
    expect(result.getUTCSeconds()).toBe(59);
    expect(result.getUTCMilliseconds()).toBe(999);
  });
});

describe("startOfHour", () => {
  it("resets minutes and below", () => {
    const d = new Date("2024-01-01T15:30:45.500Z");
    const result = startOfHour(d);
    expect(result.getUTCHours()).toBe(15);
    expect(result.getUTCMinutes()).toBe(0);
    expect(result.getUTCSeconds()).toBe(0);
    expect(result.getUTCMilliseconds()).toBe(0);
  });
});

describe("endOfHour", () => {
  it("resets to end of hour", () => {
    const d = new Date("2024-01-01T15:30:45.000Z");
    const result = endOfHour(d);
    expect(result.getUTCHours()).toBe(15);
    expect(result.getUTCMinutes()).toBe(59);
    expect(result.getUTCSeconds()).toBe(59);
    expect(result.getUTCMilliseconds()).toBe(999);
  });
});

describe("startOfMinute", () => {
  it("resets seconds and below", () => {
    const d = new Date("2024-01-01T15:30:45.500Z");
    const result = startOfMinute(d);
    expect(result.getUTCMinutes()).toBe(30);
    expect(result.getUTCSeconds()).toBe(0);
    expect(result.getUTCMilliseconds()).toBe(0);
  });
});

describe("endOfMinute", () => {
  it("resets to end of minute", () => {
    const d = new Date("2024-01-01T15:30:45.000Z");
    const result = endOfMinute(d);
    expect(result.getUTCMinutes()).toBe(30);
    expect(result.getUTCSeconds()).toBe(59);
    expect(result.getUTCMilliseconds()).toBe(999);
  });
});

describe("startOfWeek", () => {
  it("returns Monday for Wednesday", () => {
    const d = new Date("2024-01-03T15:30:00Z"); // Wednesday
    const result = startOfWeek(d);
    expect(result.getUTCDate()).toBe(1); // Monday
    expect(result.getUTCDay()).toBe(1);
  });
  it("returns Monday when already Monday", () => {
    const d = new Date("2024-01-01T15:30:00Z"); // Monday
    const result = startOfWeek(d);
    expect(result.getUTCDate()).toBe(1);
  });
  it("returns previous Monday for Sunday", () => {
    const d = new Date("2024-01-07T15:30:00Z"); // Sunday
    const result = startOfWeek(d);
    expect(result.getUTCDate()).toBe(1); // Previous Monday
  });
});

describe("endOfWeek", () => {
  it("returns Sunday for Wednesday", () => {
    const d = new Date("2024-01-03T15:30:00Z"); // Wednesday
    const result = endOfWeek(d);
    expect(result.getUTCDate()).toBe(7); // Sunday
    expect(result.getUTCDay()).toBe(0);
  });
  it("returns same Sunday when already Sunday", () => {
    const d = new Date("2024-01-07T15:30:00Z"); // Sunday Jan 7
    const result = endOfWeek(d);
    expect(result.getUTCDate()).toBe(7);
  });
});

describe("startOfMonth", () => {
  it("returns first day of month", () => {
    const d = new Date("2024-03-15T12:30:00Z");
    const result = startOfMonth(d);
    expect(result.getUTCMonth()).toBe(2);
    expect(result.getUTCDate()).toBe(1);
    expect(result.getUTCHours()).toBe(0);
  });
});

describe("endOfMonth", () => {
  it("returns last day of month", () => {
    const d = new Date("2024-03-15T12:30:00Z");
    const result = endOfMonth(d);
    expect(result.getUTCMonth()).toBe(2);
    expect(result.getUTCDate()).toBe(31);
    expect(result.getUTCHours()).toBe(23);
  });
  it("handles February leap year", () => {
    const d = new Date("2024-02-15T12:00:00Z");
    const result = endOfMonth(d);
    expect(result.getUTCDate()).toBe(29);
  });
  it("handles February non-leap year", () => {
    const d = new Date("2025-02-15T12:00:00Z");
    const result = endOfMonth(d);
    expect(result.getUTCDate()).toBe(28);
  });
});

describe("startOfYear", () => {
  it("returns Jan 1", () => {
    const d = new Date("2024-06-15T12:30:00Z");
    const result = startOfYear(d);
    expect(result.getUTCMonth()).toBe(0);
    expect(result.getUTCDate()).toBe(1);
    expect(result.getUTCHours()).toBe(0);
  });
});

describe("endOfYear", () => {
  it("returns Dec 31", () => {
    const d = new Date("2024-06-15T12:30:00Z");
    const result = endOfYear(d);
    expect(result.getUTCMonth()).toBe(11);
    expect(result.getUTCDate()).toBe(31);
    expect(result.getUTCHours()).toBe(23);
  });
});
