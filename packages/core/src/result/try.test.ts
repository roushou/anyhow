import { describe, expect, it } from "bun:test";
import { tryAsync, trySync } from "./try.js";

describe("trySync", () => {
  it("returns ok when the function succeeds", () => {
    const r = trySync(() => 42);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(42);
  });

  it("returns err when the function throws", () => {
    const r = trySync(() => {
      throw new Error("boom");
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect((r.error as Error).message).toBe("boom");
  });

  it("wraps non-Error throws", () => {
    const r = trySync(() => {
      throw "raw string";
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect((r.error as Error).message).toBe("raw string");
  });
});

describe("tryAsync", () => {
  it("returns ok when the function succeeds", async () => {
    const r = await tryAsync(() => Promise.resolve("done"));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe("done");
  });

  it("returns err when the function rejects", async () => {
    const r = await tryAsync(() => Promise.reject(new Error("async boom")));
    expect(r.ok).toBe(false);
    if (!r.ok) expect((r.error as Error).message).toBe("async boom");
  });
});
