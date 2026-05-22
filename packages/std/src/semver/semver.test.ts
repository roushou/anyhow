import { describe, expect, it } from "bun:test";
import { semver } from "./semver.js";
import { parse } from "./parse.js";

describe("semver()", () => {
  it("returns null for invalid input", () => expect(semver("abc")).toBeNull());

  it("returns an object for valid input", () => {
    const v = semver("1.2.3")!;
    expect(v.major).toBe(1);
    expect(v.minor).toBe(2);
    expect(v.patch).toBe(3);
  });

  it("exposes prerelease and build", () => {
    const v = semver("1.2.3-alpha.1+build.123")!;
    expect(v.prerelease).toEqual(["alpha", "1"]);
    expect(v.build).toEqual(["build", "123"]);
  });

  it("toString returns canonical form", () => {
    expect(semver("1.2.3")!.toString()).toBe("1.2.3");
    expect(semver("1.2.3-alpha.1+build.123")!.toString()).toBe("1.2.3-alpha.1+build.123");
  });

  it("toJSON returns string", () => {
    expect(JSON.stringify(semver("1.2.3")!)).toBe('"1.2.3"');
  });

  // Comparison — string args
  it("lt with string", () => expect(semver("1.0.0")!.lt("2.0.0")).toBe(true));
  it("gt with string", () => expect(semver("2.0.0")!.gt("1.0.0")).toBe(true));
  it("eq with string", () => expect(semver("1.0.0")!.eq("1.0.0")).toBe(true));
  it("lte with string", () => expect(semver("1.0.0")!.lte("1.0.0")).toBe(true));
  it("gte with string", () => expect(semver("1.0.0")!.gte("1.0.0")).toBe(true));

  // Comparison — SemVerObj args
  it("compare with SemVerObj", () => {
    const a = semver("1.0.0")!;
    const b = semver("2.0.0")!;
    expect(a.lt(b)).toBe(true);
    expect(b.gt(a)).toBe(true);
    expect(a.compare(b)).toBe(-1);
  });

  // Comparison — plain SemVer args
  it("compare with plain SemVer", () => {
    const v = semver("1.0.0")!;
    const plain = parse("2.0.0")!;
    expect(v.lt(plain)).toBe(true);
  });

  // Range
  it("satisfies range", () => {
    const v = semver("1.2.3")!;
    expect(v.satisfies("^1.0.0")).toBe(true);
    expect(v.satisfies("^2.0.0")).toBe(false);
    expect(v.satisfies(">=1.0.0 <2.0.0")).toBe(true);
  });

  // Bump
  it("bump returns new SemVerObj", () => {
    const v = semver("1.2.3")!;
    const next = v.bump("minor");
    expect(next.toString()).toBe("1.3.0");
    expect(next).not.toBe(v);
  });

  it("bump chains", () => {
    const v = semver("1.2.3")!;
    expect(v.bump("major").bump("patch").toString()).toBe("2.0.1");
  });

  // Static: valid
  it("semver.valid", () => {
    expect(semver.valid("1.2.3")).toBe(true);
    expect(semver.valid("abc")).toBe(false);
  });

  // Static: coerce
  it("semver.coerce", () => {
    const v = semver.coerce("v1.2")!;
    expect(v.toString()).toBe("1.2.0");
    expect(semver.coerce("garbage")).toBeNull();
  });

  // Static: sort
  it("semver.sort", () => {
    expect(semver.sort(["2.0.0", "1.0.0", "1.5.0"])).toEqual(["1.0.0", "1.5.0", "2.0.0"]);
    expect(semver.sort([])).toEqual([]);
  });

  // Static: max
  it("semver.max", () => {
    expect(semver.max(["1.0.0", "3.0.0", "2.0.0"])).toBe("3.0.0");
    expect(semver.max([])).toBeNull();
  });

  // Static: min
  it("semver.min", () => {
    expect(semver.min(["1.0.0", "3.0.0", "2.0.0"])).toBe("1.0.0");
    expect(semver.min([])).toBeNull();
  });

  // Static: diff
  it("semver.diff", () => {
    expect(semver.diff("1.0.0", "2.0.0")).toBe("major");
    expect(semver.diff("1.0.0", "1.1.0")).toBe("minor");
    expect(semver.diff("1.0.0", "1.0.1")).toBe("patch");
    expect(semver.diff("1.0.0-alpha", "1.0.0")).toBe("prerelease");
    expect(semver.diff("1.0.0", "1.0.0")).toBeNull();
  });

  it("eq returns false for invalid other", () => {
    expect(semver("1.0.0")!.eq("abc" as any)).toBe(false);
  });

  it("is immutable", () => {
    const v = semver("1.2.3")!;
    const next = v.bump("patch");
    expect(v.toString()).toBe("1.2.3");
    expect(next.toString()).toBe("1.2.4");
  });
});
