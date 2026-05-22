import { describe, expect, it } from "bun:test";
import { link } from "./link.js";

describe("link", () => {
  it("wraps text in OSC 8 sequence", () => {
    const result = link("click", "https://example.com");
    expect(result).toBe("\x1b]8;;https://example.com\x07click\x1b]8;;\x07");
  });

  it("handles empty text", () => {
    const result = link("", "https://example.com");
    expect(result).toContain("\x1b]8;;https://example.com\x07");
  });
});
