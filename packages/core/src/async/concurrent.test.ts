import { describe, expect, it } from "bun:test";
import { concurrent } from "./concurrent.js";
import { sleep } from "./timing.js";

describe("concurrent", () => {
  it("runs all tasks and returns results in order", async () => {
    const results = await concurrent(
      [() => Promise.resolve(1), () => Promise.resolve(2), () => Promise.resolve(3)],
      2,
    );
    expect(results).toEqual([1, 2, 3]);
  });

  it("respects the concurrency limit", async () => {
    let running = 0;
    let maxRunning = 0;

    const makeTask = (id: number) => async () => {
      running++;
      maxRunning = Math.max(maxRunning, running);
      await sleep(20);
      running--;
      return id;
    };

    const tasks = Array.from({ length: 6 }, (_, i) => makeTask(i));
    await concurrent(tasks, 2);
    expect(maxRunning).toBeLessThanOrEqual(2);
  });

  it("returns empty array for empty input", async () => {
    const results = await concurrent([], 3);
    expect(results).toEqual([]);
  });

  it("propagates errors from tasks", async () => {
    await expect(
      concurrent([() => Promise.resolve(1), () => Promise.reject(new Error("boom"))], 2),
    ).rejects.toThrow("boom");
  });
});
