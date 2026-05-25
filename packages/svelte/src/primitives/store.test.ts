import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/svelte/svelte5";
import { tick } from "svelte";
import Wrapper from "./store.test-wrapper.svelte";

describe("createStore", () => {
  let localStore: Record<string, string>;
  let sessionStore: Record<string, string>;

  beforeEach(() => {
    localStore = {};
    sessionStore = {};
    vi.stubGlobal("localStorage", makeStoreMock(localStore));
    vi.stubGlobal("sessionStorage", makeStoreMock(sessionStore));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function makeStoreMock(store: Record<string, string>) {
    return {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        Object.keys(store).forEach((k) => delete store[k]);
      },
      get length() {
        return Object.keys(store).length;
      },
      key: (index: number) => Object.keys(store)[index] ?? null,
    };
  }

  it("defaults to localStorage", async () => {
    let api: any;
    render(Wrapper, { props: { key: "k1", initial: "hello", onReady: (a: any) => (api = a) } });
    expect(api.value).toBe("hello");
    api.value = "world";
    await tick();
    expect(localStore["k1"]).toBe(JSON.stringify("world"));
  });

  it("uses sessionStorage when specified", async () => {
    let api: any;
    render(Wrapper, {
      props: { key: "k2", initial: "x", storage: "session", onReady: (a: any) => (api = a) },
    });
    api.value = "y";
    await tick();
    expect(sessionStore["k2"]).toBe(JSON.stringify("y"));
    expect(localStore["k2"]).toBeUndefined();
  });

  it("reads existing value from storage", () => {
    localStore["k3"] = JSON.stringify("stored");
    let api: any;
    render(Wrapper, { props: { key: "k3", initial: "fallback", onReady: (a: any) => (api = a) } });
    expect(api.value).toBe("stored");
  });

  it("falls back to initial when storage has corrupt data", () => {
    localStore["k4"] = "{not valid";
    let api: any;
    render(Wrapper, { props: { key: "k4", initial: "safe", onReady: (a: any) => (api = a) } });
    expect(api.value).toBe("safe");
  });
});
