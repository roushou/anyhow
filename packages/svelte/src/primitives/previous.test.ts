import { describe, it, expect } from "vitest";
import { render } from "@testing-library/svelte/svelte5";
import { tick } from "svelte";
import PrevWrapper from "./previous.test-wrapper.svelte";

describe("createPrevious", () => {
  it("returns undefined before any change", () => {
    let api: any;
    render(PrevWrapper, { props: { onReady: (a: any) => (api = a) } });
    expect(api.prev.current).toBeUndefined();
  });

  it("tracks the previous value after a change", async () => {
    let api: any;
    render(PrevWrapper, { props: { initial: "a", onReady: (a: any) => (api = a) } });

    api.state.value = "b";
    await tick();

    expect(api.prev.current).toBe("a");
  });

  it("tracks multiple changes", async () => {
    let api: any;
    render(PrevWrapper, { props: { initial: 1, onReady: (a: any) => (api = a) } });

    api.state.value = 2;
    await tick();
    expect(api.prev.current).toBe(1);

    api.state.value = 3;
    await tick();
    expect(api.prev.current).toBe(2);
  });

  it("works with object values", async () => {
    let api: any;
    render(PrevWrapper, { props: { initial: { x: 0 }, onReady: (a: any) => (api = a) } });

    api.state.value = { x: 1 };
    await tick();

    expect(api.prev.current).toEqual({ x: 0 });
  });
});
