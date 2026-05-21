import { describe, expect, it } from "bun:test";
import { average, median, sum } from "./statistics.js";

describe("sum", () => {
  it("sums numbers", () => {
    expect(sum([1, 2, 3, 4])).toBe(10);
  });

  it("returns 0 for empty array", () => {
    expect(sum([])).toBe(0);
  });

  it("handles negative numbers", () => {
    expect(sum([-1, 1, -2, 2])).toBe(0);
  });
});

describe("average", () => {
  it("computes the average", () => {
    expect(average([2, 4, 6])).toBe(4);
  });

  it("returns the value for single-element array", () => {
    expect(average([5])).toBe(5);
  });

  it("returns NaN for empty array", () => {
    expect(average([])).toBeNaN();
  });

  it("handles negative numbers", () => {
    expect(average([-2, 0, 2])).toBe(0);
  });
});

describe("median", () => {
  it("returns the middle element for odd-length arrays", () => {
    expect(median([1, 3, 2])).toBe(2);
  });

  it("returns the average of two middle elements for even-length arrays", () => {
    expect(median([1, 4, 2, 3])).toBe(2.5);
  });

  it("returns the element for single-element array", () => {
    expect(median([7])).toBe(7);
  });

  it("handles unsorted input", () => {
    expect(median([5, 1, 3, 2, 4])).toBe(3);
  });

  it("returns NaN for empty array", () => {
    expect(median([])).toBeNaN();
  });
});
