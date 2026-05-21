import { describe, expect, it } from "bun:test";
import { clamp, lerp, mapRange, normalize, roundTo } from "./interpolation.js";

describe("clamp", () => {
  it("returns the value when within range", () => expect(clamp(5, 0, 10)).toBe(5));
  it("returns min when value is below range", () => expect(clamp(-5, 0, 10)).toBe(0));
  it("returns max when value is above range", () => expect(clamp(15, 0, 10)).toBe(10));
  it("returns min when value equals min", () => expect(clamp(0, 0, 10)).toBe(0));
  it("returns max when value equals max", () => expect(clamp(10, 0, 10)).toBe(10));
});

describe("lerp", () => {
  it("returns a at t=0", () => expect(lerp(0, 10, 0)).toBe(0));
  it("returns b at t=1", () => expect(lerp(0, 10, 1)).toBe(10));
  it("returns midpoint at t=0.5", () => expect(lerp(0, 10, 0.5)).toBe(5));
  it("clamps t outside [0,1]", () => {
    expect(lerp(0, 10, -0.5)).toBe(0);
    expect(lerp(0, 10, 1.5)).toBe(10);
  });
});

describe("normalize", () => {
  it("returns 0 for min value", () => expect(normalize(0, 0, 100)).toBe(0));
  it("returns 1 for max value", () => expect(normalize(100, 0, 100)).toBe(1));
  it("returns 0.5 for midpoint", () => expect(normalize(50, 0, 100)).toBe(0.5));
  it("clamps values outside range", () => {
    expect(normalize(-10, 0, 100)).toBe(0);
    expect(normalize(200, 0, 100)).toBe(1);
  });
});

describe("mapRange", () => {
  it("maps from one range to another", () => expect(mapRange(0.5, 0, 1, 0, 100)).toBe(50));
  it("handles min value", () => expect(mapRange(0, 0, 10, 100, 200)).toBe(100));
  it("handles max value", () => expect(mapRange(10, 0, 10, 100, 200)).toBe(200));
});

describe("roundTo", () => {
  it("rounds to specified decimal places", () => expect(roundTo(3.14159, 2)).toBe(3.14));
  it("rounds to 0 decimal places", () => expect(roundTo(3.6, 0)).toBe(4));
  it("handles negative numbers", () => expect(roundTo(-3.14159, 2)).toBe(-3.14));
  it("rounds up correctly", () => expect(roundTo(2.675, 2)).toBe(2.68));
});
