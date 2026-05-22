import { describe, expect, it } from "bun:test";
import { Semaphore } from "./semaphore.js";
import { sleep } from "./timing.js";

describe("Semaphore", () => {
  it("throws on invalid permits", () => {
    expect(() => new Semaphore(0)).toThrow(RangeError);
    expect(() => new Semaphore(-1)).toThrow(RangeError);
    expect(() => new Semaphore(1.5)).toThrow(RangeError);
  });

  it("reports permits and available", () => {
    const s = new Semaphore(3);
    expect(s.permits).toBe(3);
    expect(s.available).toBe(3);
  });

  it("acquire runs the function and returns its result", async () => {
    const s = new Semaphore(1);
    const result = await s.acquire(() => Promise.resolve(42));
    expect(result).toBe(42);
  });

  it("acquire releases the permit after success", async () => {
    const s = new Semaphore(1);
    await s.acquire(() => Promise.resolve(1));
    expect(s.available).toBe(1);
  });

  it("acquire releases the permit after error", async () => {
    const s = new Semaphore(1);
    await expect(s.acquire(() => Promise.reject(new Error("boom")))).rejects.toThrow("boom");
    expect(s.available).toBe(1);
  });

  it("limits concurrency", async () => {
    const s = new Semaphore(2);
    let running = 0;
    let max = 0;

    const tasks = Array.from({ length: 6 }, () =>
      s.acquire(async () => {
        running++;
        max = Math.max(max, running);
        await sleep(20);
        running--;
      }),
    );

    await Promise.all(tasks);
    expect(max).toBe(2);
  });

  it("queues tasks when all permits are busy", async () => {
    const s = new Semaphore(1);
    const order: number[] = [];

    const p1 = s.acquire(async () => {
      await sleep(30);
      order.push(1);
    });
    const p2 = s.acquire(async () => {
      order.push(2);
    });

    await Promise.all([p1, p2]);
    expect(order).toEqual([1, 2]);
    expect(s.available).toBe(1);
  });

  it("lock returns a release function for manual control", async () => {
    const s = new Semaphore(1);
    const release = await s.lock();
    expect(s.available).toBe(0);
    release();
    expect(s.available).toBe(1);
  });

  it("release is idempotent", async () => {
    const s = new Semaphore(1);
    const release = await s.lock();
    release();
    release(); // second call should be a no-op
    expect(s.available).toBe(1);
  });

  it("handles semaphore with permits > 1 correctly", async () => {
    const s = new Semaphore(3);
    let running = 0;
    let max = 0;

    const tasks = Array.from({ length: 9 }, () =>
      s.acquire(async () => {
        running++;
        max = Math.max(max, running);
        await sleep(15);
        running--;
      }),
    );

    await Promise.all(tasks);
    expect(max).toBe(3);
  });
});
