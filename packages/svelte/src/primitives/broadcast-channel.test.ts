import { describe, it, expect, vi, afterEach } from "vitest";
import { render } from "@testing-library/svelte/svelte5";
import TestUtil from "../test-util.svelte";
import { createBroadcastChannel } from "./broadcast-channel.svelte.js";

describe("createBroadcastChannel", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("starts with empty messages", () => {
    vi.stubGlobal(
      "BroadcastChannel",
      class {
        onmessage: any = null;
        close() {}
        postMessage(_data: any) {}
      },
    );

    let api: any;
    render(TestUtil, {
      props: {
        factory: createBroadcastChannel,
        args: ["test-channel"],
        onReady: (a: any) => (api = a),
      },
    });

    expect(api.messages).toEqual([]);
  });

  it("receives messages", () => {
    let handler: any = null;
    vi.stubGlobal(
      "BroadcastChannel",
      class {
        set onmessage(fn: any) {
          handler = fn;
        }
        get onmessage() {
          return handler;
        }
        close() {}
        postMessage(_data: any) {}
      },
    );

    let api: any;
    render(TestUtil, {
      props: {
        factory: createBroadcastChannel,
        args: ["test-channel"],
        onReady: (a: any) => (api = a),
      },
    });

    handler?.({ data: { type: "logout" } });
    expect(api.messages).toEqual([{ type: "logout" }]);
  });
});
