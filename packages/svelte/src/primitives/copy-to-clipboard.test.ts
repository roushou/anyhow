import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createCopyToClipboard } from "./copy-to-clipboard.svelte.js";

describe("createCopyToClipboard", () => {
  beforeEach(() => {
    vi.stubGlobal("navigator", {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("starts with copied=false and no error", () => {
    const c = createCopyToClipboard();
    expect(c.copied).toBe(false);
    expect(c.error).toBeUndefined();
  });

  it("sets copied to true on success", async () => {
    const c = createCopyToClipboard();
    const ok = await c.copy("hello");
    expect(ok).toBe(true);
    expect(c.copied).toBe(true);
    expect(c.error).toBeUndefined();
  });

  it("sets error on failure", async () => {
    vi.stubGlobal("navigator", {
      clipboard: {
        writeText: vi.fn().mockRejectedValue(new Error("denied")),
      },
    });

    const c = createCopyToClipboard();
    const ok = await c.copy("hello");
    expect(ok).toBe(false);
    expect(c.copied).toBe(false);
    expect(c.error).toBeInstanceOf(Error);
    expect(c.error!.message).toBe("denied");
  });

  it("reset clears both copied and error", async () => {
    const c = createCopyToClipboard();
    await c.copy("hello");
    c.reset();
    expect(c.copied).toBe(false);
    expect(c.error).toBeUndefined();
  });

  it("clears previous error on successful retry", async () => {
    let calls = 0;
    vi.stubGlobal("navigator", {
      clipboard: {
        writeText: vi.fn().mockImplementation(() => {
          calls++;
          if (calls === 1) return Promise.reject(new Error("fail"));
          return Promise.resolve(undefined);
        }),
      },
    });

    const c = createCopyToClipboard();
    await c.copy("first");
    expect(c.error).toBeInstanceOf(Error);

    await c.copy("second");
    expect(c.copied).toBe(true);
    expect(c.error).toBeUndefined();
  });
});
