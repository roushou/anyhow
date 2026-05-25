import { describe, it, expect } from "vitest";
import { isBrowser } from "./browser.js";

describe("isBrowser", () => {
  it("returns true in jsdom environment", () => {
    expect(isBrowser()).toBe(true);
  });

  it("returns a boolean", () => {
    expect(typeof isBrowser()).toBe("boolean");
  });
});
