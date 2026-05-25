import { describe, it, expect } from "vitest";
import { createAsyncState } from "./async-state.svelte.js";

describe("createAsyncState", () => {
  it("starts with no data, not loading, no error", () => {
    const state = createAsyncState(async () => "ok");
    expect(state.loading).toBe(false);
    expect(state.data).toBeUndefined();
    expect(state.error).toBeUndefined();
  });

  it("sets loading to true while executing", async () => {
    let captured = false;
    const state = createAsyncState(async () => {
      captured = state.loading;
      return "ok";
    });

    await state.execute();
    expect(captured).toBe(true);
    expect(state.loading).toBe(false);
  });

  it("sets data after successful execution", async () => {
    const state = createAsyncState(async (name: string) => name.toUpperCase());
    await state.execute("alice");
    expect(state.data).toBe("ALICE");
    expect(state.error).toBeUndefined();
  });

  it("sets error when the function throws", async () => {
    const state = createAsyncState(async () => {
      throw new Error("boom");
    });
    await state.execute();
    expect(state.data).toBeUndefined();
    expect(state.error).toBeInstanceOf(Error);
    expect(state.error!.message).toBe("boom");
  });

  it("returns the result from execute", async () => {
    const state = createAsyncState(async (x: number) => x * 2);
    const result = await state.execute(21);
    expect(result).toBe(42);
  });

  it("reset clears all state", async () => {
    const state = createAsyncState(async () => "ok");
    await state.execute();
    state.reset();

    expect(state.loading).toBe(false);
    expect(state.data).toBeUndefined();
    expect(state.error).toBeUndefined();
  });

  it("clears previous error on re-execute", async () => {
    let shouldThrow = true;
    const state = createAsyncState(async () => {
      if (shouldThrow) throw new Error("fail");
      return "ok";
    });

    await state.execute();
    expect(state.error).toBeInstanceOf(Error);

    shouldThrow = false;
    await state.execute();
    expect(state.error).toBeUndefined();
    expect(state.data).toBe("ok");
  });
});
