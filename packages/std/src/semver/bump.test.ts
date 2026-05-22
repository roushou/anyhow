import { describe, expect, it } from "bun:test";
import { bump } from "./bump.js";

describe("bump", () => {
  it("bumps patch", () => expect(bump("1.2.3", "patch")).toBe("1.2.4"));
  it("bumps minor", () => expect(bump("1.2.3", "minor")).toBe("1.3.0"));
  it("bumps major", () => expect(bump("1.2.3", "major")).toBe("2.0.0"));
  it("handles v prefix", () => expect(bump("v1.2.3", "patch")).toBe("1.2.4"));
  it("handles prerelease versions", () => expect(bump("1.2.3-alpha", "patch")).toBe("1.2.4"));
  it("returns null for invalid input", () => expect(bump("abc", "patch")).toBeNull());
});
