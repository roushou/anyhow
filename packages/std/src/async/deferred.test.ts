import { describe, expect, it } from "bun:test";
import { Deferred } from "./deferred.js";

describe("Deferred", () => {
  it("resolves via .resolve()", async () => {
    const d = new Deferred<number>();
    d.resolve(42);
    expect(await d.promise).toBe(42);
  });

  it("rejects via .reject()", async () => {
    const d = new Deferred<number>();
    d.reject(new Error("boom"));
    await expect(d.promise).rejects.toThrow("boom");
  });

  it("ignores subsequent resolve calls", async () => {
    const d = new Deferred<number>();
    d.resolve(1);
    d.resolve(2);
    expect(await d.promise).toBe(1);
  });

  it("ignores subsequent reject calls", async () => {
    const d = new Deferred<number>();
    d.reject(new Error("first"));
    d.reject(new Error("second"));
    await expect(d.promise).rejects.toThrow("first");
  });

  it("tracks settled state", () => {
    const d = new Deferred<number>();
    expect(d.settled).toBe(false);
    d.resolve(1);
    expect(d.settled).toBe(true);
  });

  it("works as a bridge from callback to promise", async () => {
    const d = new Deferred<string>();
    // Simulate an event-based API
    setTimeout(() => d.resolve("event-data"), 10);
    const result = await d.promise;
    expect(result).toBe("event-data");
  });

  it("reports settled=true after reject", () => {
    const d = new Deferred<void>();
    d.promise.catch(() => {}); // prevent unhandled rejection
    expect(d.settled).toBe(false);
    d.reject(new Error("nope"));
    expect(d.settled).toBe(true);
  });
});
