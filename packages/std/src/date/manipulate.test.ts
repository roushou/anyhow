import { describe, expect, it } from "bun:test";
import {
  addMilliseconds,
  addSeconds,
  addMinutes,
  addHours,
  addDays,
  addWeeks,
  addMonths,
  addYears,
  subMilliseconds,
  subSeconds,
  subMinutes,
  subHours,
  subDays,
  subWeeks,
  subMonths,
  subYears,
} from "./manipulate.js";

const jan1 = new Date("2024-01-01T00:00:00.000Z");

describe("addMilliseconds", () => {
  it("adds milliseconds", () =>
    expect(addMilliseconds(jan1, 500).getTime()).toBe(jan1.getTime() + 500));
  it("returns a new date", () => expect(addMilliseconds(jan1, 0)).not.toBe(jan1));
});

describe("addSeconds", () => {
  it("adds seconds", () => expect(addSeconds(jan1, 30).getTime()).toBe(jan1.getTime() + 30_000));
  it("handles negative", () =>
    expect(addSeconds(jan1, -30).getTime()).toBe(jan1.getTime() - 30_000));
});

describe("addMinutes", () => {
  it("adds minutes", () => expect(addMinutes(jan1, 30).getTime()).toBe(jan1.getTime() + 1_800_000));
});

describe("addHours", () => {
  it("adds hours", () => expect(addHours(jan1, 2).getTime()).toBe(jan1.getTime() + 7_200_000));
});

describe("addDays", () => {
  it("adds days", () => {
    const result = addDays(jan1, 5);
    expect(result.getUTCDate()).toBe(6);
    expect(result.getUTCMonth()).toBe(0);
  });
  it("crosses month boundary", () => {
    const result = addDays(new Date("2024-01-30T00:00:00Z"), 2);
    expect(result.getUTCMonth()).toBe(1); // Feb
    expect(result.getUTCDate()).toBe(1);
  });
});

describe("addWeeks", () => {
  it("adds weeks", () => {
    const result = addWeeks(jan1, 2);
    expect(result.getUTCDate()).toBe(15);
  });
});

describe("addMonths", () => {
  it("adds months", () => {
    const result = addMonths(jan1, 1);
    expect(result.getUTCMonth()).toBe(1);
  });
  it("clamps day for short months", () => {
    const d = new Date("2024-01-31T12:00:00Z");
    const result = addMonths(d, 1);
    expect(result.getUTCMonth()).toBe(1); // Feb
    expect(result.getUTCDate()).toBe(29); // 2024 is leap year
  });
  it("clamps day for non-leap year", () => {
    const d = new Date("2025-01-31T12:00:00Z");
    const result = addMonths(d, 1);
    expect(result.getUTCMonth()).toBe(1);
    expect(result.getUTCDate()).toBe(28);
  });
  it("preserves time", () => {
    const d = new Date("2024-01-15T12:30:45.500Z");
    const result = addMonths(d, 1);
    expect(result.getUTCHours()).toBe(12);
    expect(result.getUTCMinutes()).toBe(30);
    expect(result.getUTCSeconds()).toBe(45);
    expect(result.getUTCMilliseconds()).toBe(500);
  });
});

describe("addYears", () => {
  it("adds years", () => {
    const result = addYears(jan1, 1);
    expect(result.getUTCFullYear()).toBe(2025);
  });
  it("clamps Feb 29 on non-leap year", () => {
    const d = new Date("2024-02-29T12:00:00Z");
    const result = addYears(d, 1);
    expect(result.getUTCMonth()).toBe(1);
    expect(result.getUTCDate()).toBe(28);
  });
  it("preserves Feb 29 on leap year", () => {
    const d = new Date("2024-02-29T12:00:00Z");
    const result = addYears(d, 4);
    expect(result.getUTCMonth()).toBe(1);
    expect(result.getUTCDate()).toBe(29);
  });
});

describe("sub functions", () => {
  it("subMilliseconds", () =>
    expect(subMilliseconds(jan1, 500).getTime()).toBe(jan1.getTime() - 500));
  it("subSeconds", () => expect(subSeconds(jan1, 30).getTime()).toBe(jan1.getTime() - 30_000));
  it("subMinutes", () => expect(subMinutes(jan1, 30).getTime()).toBe(jan1.getTime() - 1_800_000));
  it("subHours", () => expect(subHours(jan1, 2).getTime()).toBe(jan1.getTime() - 7_200_000));
  it("subDays", () => {
    const result = subDays(new Date("2024-01-05T00:00:00Z"), 4);
    expect(result.getUTCDate()).toBe(1);
  });
  it("subWeeks", () => {
    const result = subWeeks(new Date("2024-01-15T00:00:00Z"), 2);
    expect(result.getUTCDate()).toBe(1);
  });
  it("subMonths", () => {
    const result = subMonths(new Date("2024-03-31T12:00:00Z"), 1);
    expect(result.getUTCMonth()).toBe(1);
    expect(result.getUTCDate()).toBe(29);
  });
  it("subYears", () => {
    const result = subYears(new Date("2025-01-01T00:00:00Z"), 1);
    expect(result.getUTCFullYear()).toBe(2024);
  });
});
