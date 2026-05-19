import { describe, expect, it, mock } from "bun:test";
import { retry } from "./retry.js";

describe("retry", () => {
  it("returns the result on first success", async () => {
    const fn = mock(() => Promise.resolve(42));
    const result = await retry(fn);
    expect(result).toBe(42);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("retries on failure and succeeds", async () => {
    const fn = mock()
      .mockRejectedValueOnce(new Error("fail"))
      .mockRejectedValueOnce(new Error("fail"))
      .mockResolvedValueOnce("ok");

    const result = await retry(fn, { attempts: 3, backoff: 10 });
    expect(result).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("throws after exhausting attempts", async () => {
    const fn = mock(() => Promise.reject(new Error("always fails")));
    await expect(retry(fn, { attempts: 3, backoff: 10 })).rejects.toThrow("always fails");
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("uses default attempts of 3", async () => {
    const fn = mock(() => Promise.reject(new Error("nope")));
    await expect(retry(fn, { backoff: 10 })).rejects.toThrow("nope");
    expect(fn).toHaveBeenCalledTimes(3);
  });
});
