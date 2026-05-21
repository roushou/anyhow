import { describe, expect, it } from "bun:test";
import { duration, filesize } from "./unit.js";

// ── filesize ──

describe("filesize", () => {
  it("returns '0 B' for zero", () => {
    expect(filesize(0)).toBe("0 B");
  });

  it("formats bytes < 1000", () => {
    expect(filesize(42)).toBe("42 B");
    expect(filesize(999)).toBe("999 B");
  });

  it("formats KB", () => {
    expect(filesize(1_500)).toBe("1.5 KB");
    expect(filesize(1_000_000)).toBe("1 MB");
  });

  it("formats MB", () => {
    expect(filesize(1_500_000)).toBe("1.5 MB");
  });

  it("formats GB", () => {
    expect(filesize(1_500_000_000)).toBe("1.5 GB");
  });

  it("formats TB", () => {
    expect(filesize(1_500_000_000_000)).toBe("1.5 TB");
  });

  it("uses binary units when { binary: true }", () => {
    expect(filesize(1_500, { binary: true })).toBe("1.5 KiB");
    expect(filesize(1_048_576, { binary: true })).toBe("1 MiB");
  });

  it("respects custom decimals", () => {
    expect(filesize(1_500_000, { decimals: 0 })).toBe("2 MB");
    expect(filesize(1_500_000, { decimals: 2 })).toBe("1.5 MB");
  });

  it("handles negative values", () => {
    expect(filesize(-1_500_000)).toBe("1.5 MB");
  });

  it("at exact unit boundary", () => {
    expect(filesize(1_000)).toBe("1 KB");
    expect(filesize(1_000_000)).toBe("1 MB");
  });
});

// ── duration ──

describe("duration", () => {
  it("returns '0ms' for zero", () => {
    expect(duration(0)).toBe("0ms");
  });

  it("formats milliseconds only", () => {
    expect(duration(500)).toBe("500ms");
    expect(duration(999)).toBe("999ms");
  });

  it("formats seconds", () => {
    expect(duration(1_000)).toBe("1s");
    expect(duration(5_000)).toBe("5s");
  });

  it("formats minutes", () => {
    expect(duration(60_000)).toBe("1m");
    expect(duration(120_000)).toBe("2m");
  });

  it("formats hours", () => {
    expect(duration(3_600_000)).toBe("1h");
    expect(duration(7_200_000)).toBe("2h");
  });

  it("formats days", () => {
    expect(duration(86_400_000)).toBe("1d");
  });

  it("formats compound durations", () => {
    expect(duration(3_661_000)).toBe("1h 1m 1s");
    expect(duration(86_461_000)).toBe("1d 1m 1s");
    expect(duration(3_600_500)).toBe("1h 500ms");
  });

  it("limits parts with maxParts", () => {
    expect(duration(3_661_000, { maxParts: 2 })).toBe("1h 1m");
    expect(duration(3_661_000, { maxParts: 1 })).toBe("1h");
  });

  it("handles negative values", () => {
    expect(duration(-3_600_000)).toBe("1h");
  });

  it("rounds sub-ms values", () => {
    expect(duration(1)).toBe("1ms");
    expect(duration(0.4)).toBe("0ms");
    expect(duration(0.5)).toBe("1ms");
  });
});
