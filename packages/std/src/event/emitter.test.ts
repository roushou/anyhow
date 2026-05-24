import { describe, it, expect, mock } from "bun:test";
import { EventEmitter } from "./emitter.js";

type TestEvents = {
  data: { id: number; value: string };
  error: Error;
  close: void;
};

describe("EventEmitter", () => {
  it("calls listeners on emit", async () => {
    const ee = new EventEmitter<TestEvents>();
    const fn = mock();
    ee.on("data", fn);
    await ee.emit("data", { id: 1, value: "hello" });
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith({ id: 1, value: "hello" });
  });

  it("calls multiple listeners in registration order", async () => {
    const ee = new EventEmitter<TestEvents>();
    const calls: number[] = [];
    ee.on("data", () => {
      calls.push(1);
    });
    ee.on("data", () => {
      calls.push(2);
    });
    await ee.emit("data", { id: 1, value: "x" });
    expect(calls).toEqual([1, 2]);
  });

  it("once() removes listener after first call", async () => {
    const ee = new EventEmitter<TestEvents>();
    const fn = mock();
    ee.once("data", fn);
    await ee.emit("data", { id: 1, value: "a" });
    await ee.emit("data", { id: 2, value: "b" });
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("off() removes a specific listener", async () => {
    const ee = new EventEmitter<TestEvents>();
    const fn1 = mock();
    const fn2 = mock();
    ee.on("data", fn1);
    ee.on("data", fn2);
    ee.off("data", fn1);
    await ee.emit("data", { id: 1, value: "x" });
    expect(fn1).not.toHaveBeenCalled();
    expect(fn2).toHaveBeenCalledTimes(1);
  });

  it("unsubscribe function removes the listener", async () => {
    const ee = new EventEmitter<TestEvents>();
    const fn = mock();
    const off = ee.on("data", fn);
    off();
    await ee.emit("data", { id: 1, value: "x" });
    expect(fn).not.toHaveBeenCalled();
  });

  it("listenerCount returns correct counts", () => {
    const ee = new EventEmitter<TestEvents>();
    expect(ee.listenerCount("data")).toBe(0);
    ee.on("data", () => {});
    expect(ee.listenerCount("data")).toBe(1);
    ee.on("data", () => {});
    expect(ee.listenerCount("data")).toBe(2);
  });

  it("does nothing when emitting to an event with no listeners", async () => {
    const ee = new EventEmitter<TestEvents>();
    await ee.emit("data", { id: 1, value: "x" }); // should not throw
  });

  it("throws on 'error' event with no listeners", async () => {
    const ee = new EventEmitter<TestEvents>();
    const err = new Error("boom");
    await expect(ee.emit("error", err)).rejects.toBe(err);
  });

  it("does not throw on 'error' event when listeners exist", async () => {
    const ee = new EventEmitter<TestEvents>();
    const err = new Error("boom");
    ee.on("error", () => {});
    await expect(ee.emit("error", err)).resolves.toBeUndefined();
  });

  it("awaits async listeners in order", async () => {
    const ee = new EventEmitter<TestEvents>();
    const order: number[] = [];
    ee.on("data", async () => {
      await new Promise((r) => setTimeout(r, 10));
      order.push(1);
    });
    ee.on("data", () => {
      order.push(2);
    });
    await ee.emit("data", { id: 1, value: "x" });
    expect(order).toEqual([1, 2]);
  });

  it("removes listener via AbortSignal", async () => {
    const ee = new EventEmitter<TestEvents>();
    const fn = mock();
    const ctrl = new AbortController();
    ee.on("data", fn, { signal: ctrl.signal });
    ctrl.abort();
    await ee.emit("data", { id: 1, value: "x" });
    expect(fn).not.toHaveBeenCalled();
  });

  it("never calls listener when signal is already aborted", async () => {
    const ee = new EventEmitter<TestEvents>();
    const fn = mock();
    const ctrl = new AbortController();
    ctrl.abort();
    ee.on("data", fn, { signal: ctrl.signal });
    // Wait for microtask
    await new Promise((r) => setTimeout(r, 0));
    await ee.emit("data", { id: 1, value: "x" });
    expect(fn).not.toHaveBeenCalled();
  });

  it("void events work with undefined payload", async () => {
    const ee = new EventEmitter<TestEvents>();
    const fn = mock();
    ee.on("close", fn);
    await ee.emit("close", undefined);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(undefined);
  });
});
