import { describe, it, expect, vi, afterEach } from "vitest";
import { render } from "@testing-library/svelte/svelte5";
import TestUtil from "../test-util.svelte";
import { createWebSocket } from "./websocket.svelte.js";

class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  readyState = MockWebSocket.CONNECTING;
  onopen: (() => void) | null = null;
  onmessage: ((e: { data: string }) => void) | null = null;
  onerror: (() => void) | null = null;
  onclose: (() => void) | null = null;

  constructor(readonly url: string) {}

  send(_data: string) {}
  close() {
    this.readyState = MockWebSocket.CLOSED;
    this.onclose?.();
  }
}

describe("createWebSocket", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("starts in CONNECTING state", () => {
    vi.stubGlobal("WebSocket", MockWebSocket);
    let api: any;
    render(TestUtil, {
      props: {
        factory: createWebSocket,
        args: ["wss://test.example.com"],
        onReady: (a: any) => (api = a),
      },
    });
    expect(api.readyState).toBe(MockWebSocket.CONNECTING);
  });

  it("handles messages", () => {
    const instances: MockWebSocket[] = [];
    const SpyingSocket = class extends MockWebSocket {
      constructor(url: string) {
        super(url);
        instances.push(this);
      }
    };
    vi.stubGlobal("WebSocket", SpyingSocket);

    let api: any;
    render(TestUtil, {
      props: {
        factory: createWebSocket,
        args: ["wss://test.example.com"],
        onReady: (a: any) => (api = a),
      },
    });

    instances[0]?.onmessage?.({ data: "hello" });
    expect(api.data).toBe("hello");
  });

  it("tracks open state", () => {
    const OpenSocket = class extends MockWebSocket {
      constructor(url: string) {
        super(url);
        this.readyState = MockWebSocket.OPEN;
      }
    };
    vi.stubGlobal("WebSocket", OpenSocket);

    let api: any;
    render(TestUtil, {
      props: {
        factory: createWebSocket,
        args: ["wss://test.example.com"],
        onReady: (a: any) => (api = a),
      },
    });

    expect(api.readyState).toBe(MockWebSocket.OPEN);
  });

  it("tracks errors", () => {
    const instances: MockWebSocket[] = [];
    const SpyingSocket = class extends MockWebSocket {
      constructor(url: string) {
        super(url);
        instances.push(this);
      }
    };
    vi.stubGlobal("WebSocket", SpyingSocket);

    let api: any;
    render(TestUtil, {
      props: {
        factory: createWebSocket,
        args: ["wss://test.example.com"],
        onReady: (a: any) => (api = a),
      },
    });

    instances[0]?.onerror?.();
    expect(api.error).toBeInstanceOf(Error);
  });

  it("resolves URL from function", () => {
    const urls: string[] = [];
    const UrlSpy = class extends MockWebSocket {
      constructor(url: string) {
        super(url);
        urls.push(url);
      }
    };
    vi.stubGlobal("WebSocket", UrlSpy);

    render(TestUtil, {
      props: {
        factory: createWebSocket,
        args: [() => "wss://dynamic.example.com"],
        onReady: () => {},
      },
    });
    expect(urls).toEqual(["wss://dynamic.example.com"]);
  });
});
