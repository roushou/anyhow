import { describe, it, expect, mock } from "bun:test";
import { createSignal } from "./signal.js";

describe("createSignal", () => {
  it("calls subscribers on emit", async () => {
    const sig = createSignal<string>();
    const fn = mock();
    sig.subscribe(fn);
    await sig.emit("hello");
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("hello");
  });

  it("calls multiple subscribers in registration order", async () => {
    const sig = createSignal<string>();
    const calls: number[] = [];
    sig.subscribe(() => {
      calls.push(1);
    });
    sig.subscribe(() => {
      calls.push(2);
    });
    await sig.emit("x");
    expect(calls).toEqual([1, 2]);
  });

  it("unsubscribe removes the subscriber", async () => {
    const sig = createSignal<string>();
    const fn1 = mock();
    const fn2 = mock();
    const off = sig.subscribe(fn1);
    sig.subscribe(fn2);
    off();
    await sig.emit("x");
    expect(fn1).not.toHaveBeenCalled();
    expect(fn2).toHaveBeenCalledTimes(1);
  });

  it("removes subscriber via AbortSignal", async () => {
    const sig = createSignal<string>();
    const fn = mock();
    const ctrl = new AbortController();
    sig.subscribe(fn, { signal: ctrl.signal });
    ctrl.abort();
    await sig.emit("x");
    expect(fn).not.toHaveBeenCalled();
  });

  it("never calls subscriber when signal is already aborted", async () => {
    const sig = createSignal<string>();
    const fn = mock();
    const ctrl = new AbortController();
    ctrl.abort();
    sig.subscribe(fn, { signal: ctrl.signal });
    await new Promise((r) => setTimeout(r, 0));
    await sig.emit("x");
    expect(fn).not.toHaveBeenCalled();
  });

  it("awaits async subscribers in order", async () => {
    const sig = createSignal<string>();
    const order: number[] = [];
    sig.subscribe(async () => {
      await new Promise((r) => setTimeout(r, 10));
      order.push(1);
    });
    sig.subscribe(() => {
      order.push(2);
    });
    await sig.emit("x");
    expect(order).toEqual([1, 2]);
  });

  it("works with void payload type", async () => {
    const sig = createSignal<void>();
    const fn = mock();
    sig.subscribe(fn);
    await sig.emit(undefined);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("works with object payloads", async () => {
    const sig = createSignal<{ userId: string }>();
    const fn = mock();
    sig.subscribe(fn);
    await sig.emit({ userId: "abc" });
    expect(fn).toHaveBeenCalledWith({ userId: "abc" });
  });
});
