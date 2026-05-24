import { describe, expect, it } from "bun:test";
import { timeout, TimeoutError } from "./timeout.js";
import { sleep } from "./timing.js";

describe("timeout", () => {
  it("returns Ok when promise resolves before timeout", async () => {
    const result = await timeout(Promise.resolve(42), 100);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toBe(42);
  });

  it("returns Err with TimeoutError when promise takes too long", async () => {
    const result = await timeout(
      sleep(200).then(() => "late"),
      10,
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(TimeoutError);
      expect(result.error.message).toContain("Timed out after 10ms");
    }
  });

  it("returns Err when original promise rejects", async () => {
    const result = await timeout(Promise.reject(new Error("boom")), 100);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.message).toBe("boom");
  });

  it("returns Err for non-positive ms", async () => {
    const result = await timeout(Promise.resolve(42), 0);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.message).toContain("Timeout must be positive");
  });
});
