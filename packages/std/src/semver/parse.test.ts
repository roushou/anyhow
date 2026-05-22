import { describe, expect, it } from "bun:test";
import { parse, valid, coerce } from "./parse.js";

describe("parse", () => {
  it("parses simple version", () => {
    expect(parse("1.2.3")).toEqual({ major: 1, minor: 2, patch: 3, prerelease: [], build: [] });
  });
  it("parses with v prefix", () => expect(parse("v1.2.3")!.major).toBe(1));
  it("parses with prerelease", () => {
    const r = parse("1.2.3-alpha.1");
    expect(r!.prerelease).toEqual(["alpha", "1"]);
  });
  it("parses with build metadata", () => {
    const r = parse("1.2.3+build.123");
    expect(r!.build).toEqual(["build", "123"]);
  });
  it("parses prerelease and build together", () => {
    const r = parse("1.2.3-alpha.1+build.123");
    expect(r!.prerelease).toEqual(["alpha", "1"]);
    expect(r!.build).toEqual(["build", "123"]);
  });
  it("returns null for invalid input", () => {
    expect(parse("abc")).toBeNull();
    expect(parse("1")).toBeNull();
    expect(parse("")).toBeNull();
  });
});

describe("valid", () => {
  it("returns true for valid versions", () => {
    expect(valid("1.2.3")).toBe(true);
    expect(valid("v1.0.0")).toBe(true);
    expect(valid("1.0.0-beta")).toBe(true);
  });
  it("returns false for invalid versions", () => {
    expect(valid("abc")).toBe(false);
    expect(valid("1")).toBe(false);
  });
});

describe("coerce", () => {
  it("coerces v prefix", () => expect(coerce("v1.2.3")).toBe("1.2.3"));
  it("coerces missing patch", () => expect(coerce("1.2")).toBe("1.2.0"));
  it("coerces missing minor", () => expect(coerce("1")).toBe("1.0.0"));
  it("coerces = prefix", () => expect(coerce("=1.2.3")).toBe("1.2.3"));
  it("returns null for garbage", () => expect(coerce("garbage")).toBeNull());
  it("extracts version from prefixed strings", () => expect(coerce("v1.2.3-beta")).toBeTruthy());
});
