import { describe, expect, it } from "bun:test";
import { compare, eq, lt, gt, lte, gte } from "./compare.js";
import { parse } from "./parse.js";

const v1 = parse("1.0.0")!;
const v2 = parse("2.0.0")!;
const v1_2_3 = parse("1.2.3")!;
const v1_2_3_alpha = parse("1.2.3-alpha")!;
const v1_2_3_beta = parse("1.2.3-beta")!;
const v1_2_3_alpha1 = parse("1.2.3-alpha.1")!;
const v1_2_3_alpha2 = parse("1.2.3-alpha.2")!;

describe("compare", () => {
  it("returns 0 for equal", () => expect(compare(v1, parse("1.0.0")!)).toBe(0));
  it("returns 1 when a > b (major)", () => expect(compare(v2, v1)).toBe(1));
  it("returns -1 when a < b", () => expect(compare(v1, v2)).toBe(-1));
  it("compares minor", () => expect(compare(parse("1.2.0")!, parse("1.1.0")!)).toBe(1));
  it("compares patch", () => expect(compare(parse("1.0.1")!, v1)).toBe(1));
  it("prerelease is less than release", () => expect(compare(v1_2_3_alpha, v1_2_3)).toBe(-1));
  it("compares prerelease identifiers lexicographically", () =>
    expect(compare(v1_2_3_beta, v1_2_3_alpha)).toBe(1));
  it("compares prerelease numeric identifiers numerically", () =>
    expect(compare(v1_2_3_alpha2, v1_2_3_alpha1)).toBe(1));
  it("numeric prerelease is less than string prerelease", () =>
    expect(compare(parse("1.0.0-1")!, parse("1.0.0-alpha")!)).toBe(-1));
  it("shorter prerelease set is smaller", () =>
    expect(compare(parse("1.0.0-alpha")!, parse("1.0.0-alpha.1")!)).toBe(-1));
});

describe("eq", () => {
  it("returns true for equal", () => expect(eq(v1, parse("1.0.0")!)).toBe(true));
  it("returns false for different", () => expect(eq(v1, v2)).toBe(false));
});

describe("lt", () => {
  it("returns true when less", () => expect(lt(v1, v2)).toBe(true));
  it("returns false when equal", () => expect(lt(v1, parse("1.0.0")!)).toBe(false));
});

describe("gt", () => {
  it("returns true when greater", () => expect(gt(v2, v1)).toBe(true));
});

describe("lte", () => {
  it("returns true when less or equal", () => {
    expect(lte(v1, v2)).toBe(true);
    expect(lte(v1, parse("1.0.0")!)).toBe(true);
  });
});

describe("gte", () => {
  it("returns true when greater or equal", () => {
    expect(gte(v2, v1)).toBe(true);
    expect(gte(v1, parse("1.0.0")!)).toBe(true);
  });
});
