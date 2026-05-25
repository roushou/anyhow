import { describe, it, expect } from "vitest";
import { safeLoad } from "./safe-load.js";

describe("safeLoad", () => {
  it("returns data unchanged on success", async () => {
    const load = safeLoad(async (id: string) => {
      return { item: `value-${id}` };
    });

    const result = await load("abc");
    expect(result.item).toBe("value-abc");
    expect(result._loadError).toBeUndefined();
  });

  it("catches thrown errors and attaches _loadError", async () => {
    const load = safeLoad(async (_id: string): Promise<{ item: string }> => {
      throw new Error("boom");
    });

    const result = await load("abc");
    expect(result._loadError).toBeInstanceOf(Error);
    expect(result._loadError!.message).toBe("boom");
  });

  it("converts non-Error throws to Error instances", async () => {
    const load = safeLoad(async (): Promise<{ item: string }> => {
      throw "raw string";
    });

    const result = await load();
    expect(result._loadError).toBeInstanceOf(Error);
    expect(result._loadError!.message).toBe("raw string");
  });
});
