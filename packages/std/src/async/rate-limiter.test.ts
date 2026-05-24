import { describe, expect, it } from "bun:test";
import { RateLimiter } from "./rate-limiter.js";
import { sleep } from "./timing.js";

describe("RateLimiter", () => {
  it("throws on invalid opts", () => {
    expect(() => new RateLimiter({ limit: 0, window: 1000 })).toThrow(RangeError);
    expect(() => new RateLimiter({ limit: 10, window: 0 })).toThrow(RangeError);
  });

  it("starts with full tokens", () => {
    const limiter = new RateLimiter({ limit: 10, window: 1000 });
    expect(limiter.available).toBe(10);
  });

  it("acquire consumes a token", async () => {
    const limiter = new RateLimiter({ limit: 10, window: 1000 });
    await limiter.acquire();
    expect(limiter.available).toBe(9);
  });

  it("tryAcquire returns Ok when token available", () => {
    const limiter = new RateLimiter({ limit: 10, window: 1000 });
    const result = limiter.tryAcquire();
    expect(result.ok).toBe(true);
    expect(limiter.available).toBe(9);
  });

  it("tryAcquire returns Err when no tokens", () => {
    const limiter = new RateLimiter({ limit: 1, window: 10_000 });
    limiter.tryAcquire();
    const result = limiter.tryAcquire();
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.message).toContain("Rate limit exceeded");
  });

  it("refills tokens over time", async () => {
    const limiter = new RateLimiter({ limit: 5, window: 100 });
    // Consume all tokens
    for (let i = 0; i < 5; i++) await limiter.acquire();
    expect(limiter.available).toBe(0);

    // Wait for refill
    await sleep(60);
    // Should have refilled ~3 tokens (rate = 5/100 = 0.05 per ms, * 60ms = 3)
    expect(limiter.available).toBeGreaterThanOrEqual(2);
    expect(limiter.available).toBeLessThanOrEqual(4);
  });

  it("acquire waits when no tokens available", async () => {
    const limiter = new RateLimiter({ limit: 1, window: 100 });
    await limiter.acquire(); // consume the only token

    let resolved = false;
    const p = limiter.acquire().then(() => {
      resolved = true;
    });

    expect(resolved).toBe(false); // still waiting

    // Wait for token to refill
    await sleep(120);
    await p;
    expect(resolved).toBe(true);
  });
});
