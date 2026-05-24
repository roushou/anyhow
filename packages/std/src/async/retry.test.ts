import { describe, expect, it, mock } from "bun:test";
import { retry } from "./retry.js";
import { Backoff } from "./backoff.js";

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

describe("retry with BackoffStrategy", () => {
  it("works with Backoff.constant", async () => {
    let attempt = 0;
    const fn = mock(() => {
      attempt++;
      if (attempt < 3) return Promise.reject(new Error("fail"));
      return Promise.resolve(42);
    });

    const result = await retry(fn, { attempts: 3, backoff: Backoff.constant(5) });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toBe(42);
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("works with Backoff.exponential", async () => {
    const fn = mock().mockRejectedValueOnce(new Error("fail")).mockResolvedValueOnce("ok");

    const result = await retry(fn, {
      attempts: 2,
      backoff: Backoff.exponential({ initial: 10 }),
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("works with Backoff.exponentialWithJitter", async () => {
    const fn = mock().mockRejectedValueOnce(new Error("fail")).mockResolvedValueOnce("ok");

    const result = await retry(fn, {
      attempts: 2,
      backoff: Backoff.exponentialWithJitter({ initial: 10 }),
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("works with Backoff.custom", async () => {
    const delays: number[] = [];
    const s = Backoff.custom((n) => {
      const d = (n + 1) * 5;
      delays.push(d);
      return d;
    });

    const fn = mock()
      .mockRejectedValueOnce(new Error("fail"))
      .mockRejectedValueOnce(new Error("fail"))
      .mockResolvedValueOnce("ok");

    const result = await retry(fn, { attempts: 3, backoff: s });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toBe("ok");
    // Called on attempts 0 and 1 (failures before retry delay)
    expect(delays).toEqual([5, 10]);
  });
});
