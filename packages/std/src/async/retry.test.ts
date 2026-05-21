import { describe, expect, it, mock } from "bun:test";
import { retry } from "./retry.js";

describe("retry", () => {
  it("returns Ok on first success", async () => {
    const fn = mock(() => Promise.resolve(42));
    const result = await retry(fn);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toBe(42);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("retries on failure and returns Ok", async () => {
    const fn = mock()
      .mockRejectedValueOnce(new Error("fail"))
      .mockRejectedValueOnce(new Error("fail"))
      .mockResolvedValueOnce("ok");

    const result = await retry(fn, { attempts: 3, backoff: 10 });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("returns Err after exhausting attempts", async () => {
    const fn = mock(() => Promise.reject(new Error("always fails")));
    const result = await retry(fn, { attempts: 3, backoff: 10 });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.message).toBe("always fails");
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("uses default attempts of 3", async () => {
    const fn = mock(() => Promise.reject(new Error("nope")));
    const result = await retry(fn, { backoff: 10 });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.message).toBe("nope");
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("wraps non-Error throws", async () => {
    const fn = mock(() => Promise.reject("string error"));
    const result = await retry(fn, { attempts: 1, backoff: 10 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error.message).toBe("string error");
    }
  });
});
