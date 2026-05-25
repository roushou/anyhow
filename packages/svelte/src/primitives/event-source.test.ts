import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/svelte/svelte5";
import { tick } from "svelte";
import TestUtil from "../test-util.svelte";
import { createEventSource } from "./event-source.svelte.js";

describe("createEventSource", () => {
  beforeEach(() => {
    (window as any).EventSource = class {
      static CONNECTING = 0;
      static OPEN = 1;
      static CLOSED = 2;
      readyState = 0; // CONNECTING
      onopen: (() => void) | null = null;
      onmessage: ((e: MessageEvent) => void) | null = null;
      onerror: (() => void) | null = null;
      url: string;
      private closed = false;

      constructor(url: string, _opts?: EventSourceInit) {
        this.url = url;
        queueMicrotask(() => {
          if (!this.closed) {
            this.readyState = 1; // OPEN
            this.onopen?.();
          }
        });
      }

      close() {
        this.closed = true;
        this.readyState = 2; // CLOSED
      }

      dispatchMessage(data: string) {
        if (!this.closed) {
          this.onmessage?.(new MessageEvent("message", { data }));
        }
      }

      dispatchError() {
        if (!this.closed) {
          this.onerror?.();
        }
      }
    } as any;
  });

  afterEach(() => {
    delete (window as any).EventSource;
  });

  it("starts with null data and no error", () => {
    let api: any;
    render(TestUtil, {
      props: { factory: createEventSource, args: ["/events"], onReady: (a: any) => (api = a) },
    });
    expect(api.data).toBeNull();
    expect(api.error).toBeUndefined();
  });

  it("opens the connection", async () => {
    let api: any;
    render(TestUtil, {
      props: { factory: createEventSource, args: ["/events"], onReady: (a: any) => (api = a) },
    });
    await tick();
    expect(api.readyState).toBe(1); // OPEN
  });

  it("receives messages", async () => {
    let api: any;
    let instance: any;
    (window as any).EventSource = class {
      static CONNECTING = 0;
      static OPEN = 1;
      static CLOSED = 2;
      readyState = 1;
      onopen: any = null;
      onmessage: any = null;
      onerror: any = null;
      constructor() {
        // oxlint-disable typescript/no-this-alias
        instance = this;
        queueMicrotask(() => this.onopen?.());
      }
      close() {
        this.readyState = 2;
      }
    } as any;

    render(TestUtil, {
      props: { factory: createEventSource, args: ["/events"], onReady: (a: any) => (api = a) },
    });
    await tick();
    instance.onmessage?.(new MessageEvent("message", { data: "hello" }));
    expect(api.data).toBe("hello");
  });

  it("close stops the connection", async () => {
    let api: any;
    render(TestUtil, {
      props: { factory: createEventSource, args: ["/events"], onReady: (a: any) => (api = a) },
    });
    await tick();
    api.close();
    expect(api.readyState).toBe(2); // CLOSED
  });
});
