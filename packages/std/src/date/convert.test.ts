import { describe, expect, it } from "bun:test";
import { fromUnix, fromUnixMs, toUnix, toUnixMs } from "./convert.js";

describe("fromUnix", () => {
  it("creates date from seconds", () => {
    const d = fromUnix(1704067200);
    expect(d.getTime()).toBe(1704067200000);
    expect(d.toISOString()).toBe("2024-01-01T00:00:00.000Z");
  });
  it("handles negative timestamps", () => {
    const d = fromUnix(-1);
    expect(d.getTime()).toBe(-1000);
  });
});

describe("fromUnixMs", () => {
  it("creates date from milliseconds", () => {
    const d = fromUnixMs(1704067200000);
    expect(d.toISOString()).toBe("2024-01-01T00:00:00.000Z");
  });
});

describe("toUnix", () => {
  it("converts to seconds", () => {
    const d = new Date("2024-01-01T00:00:00.000Z");
    expect(toUnix(d)).toBe(1704067200);
  });
  it("truncates fractional seconds", () => {
    const d = new Date("2024-01-01T00:00:00.500Z");
    expect(toUnix(d)).toBe(1704067200);
  });
});

describe("toUnixMs", () => {
  it("converts to milliseconds", () => {
    const d = new Date("2024-01-01T00:00:00.000Z");
    expect(toUnixMs(d)).toBe(1704067200000);
  });
});
