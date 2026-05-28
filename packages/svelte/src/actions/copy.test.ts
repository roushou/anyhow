import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createCopy } from "./copy.svelte.js";

describe("createCopy", () => {
  let writeText: ReturnType<typeof vi.fn>;
  let originalClipboard: any;

  beforeEach(() => {
    writeText = vi.fn().mockResolvedValue(undefined);
    originalClipboard = (navigator as any).clipboard;
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: originalClipboard,
      writable: true,
      configurable: true,
    });
  });

  it("returns copied and an action", () => {
    const copy = createCopy();
    expect(copy).toHaveProperty("copied");
    expect(copy).toHaveProperty("action");
  });

  it("action returns a destroy method", () => {
    const div = document.createElement("div");
    const copy = createCopy();
    const result = copy.action(div);
    expect(result).toHaveProperty("destroy");
    result.destroy();
  });

  it("copies static text on click", async () => {
    const div = document.createElement("div");
    const copy = createCopy({ text: "hello" });
    copy.action(div);

    div.click();

    await vi.waitFor(() => expect(writeText).toHaveBeenCalledWith("hello"));
    // Flush microtasks so `copied = true` after the await resolves
    await new Promise((r) => setTimeout(r, 0));
    expect(copy.copied).toBe(true);
  });

  it("reads from target element", async () => {
    const target = document.createElement("pre");
    target.textContent = "code here";
    document.body.appendChild(target);

    const button = document.createElement("button");
    const copy = createCopy({ target: () => target });
    copy.action(button);

    button.click();

    await vi.waitFor(() => expect(writeText).toHaveBeenCalledWith("code here"));
  });

  it("copied resets after resetMs", async () => {
    vi.useFakeTimers();

    const div = document.createElement("div");
    const copy = createCopy({ text: "x", resetMs: 100 });
    copy.action(div);

    div.click();
    // Drain microtasks so onClick completes (sets copied=true, schedules reset timer)
    await vi.advanceTimersByTimeAsync(0);
    expect(copy.copied).toBe(true);

    vi.advanceTimersByTime(100);
    expect(copy.copied).toBe(false);

    vi.useRealTimers();
  });

  it("calls onError when clipboard fails", async () => {
    writeText.mockRejectedValue(new Error("denied"));

    const onError = vi.fn();
    const div = document.createElement("div");
    const copy = createCopy({ text: "x", onError });
    copy.action(div);

    div.click();

    await vi.waitFor(() => expect(onError).toHaveBeenCalledOnce());
  });
});
