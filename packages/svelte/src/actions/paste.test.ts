import { describe, it, expect, vi } from "vitest";
import { createPaste } from "./paste.js";

describe("createPaste", () => {
  it("returns an action with a destroy method", () => {
    const div = document.createElement("div");
    const action = createPaste(div, { onPaste: () => {} });
    expect(action).toHaveProperty("destroy");
    action.destroy();
  });

  it("calls onPaste with text items", async () => {
    const div = document.createElement("div");
    const onPaste = vi.fn();
    const action = createPaste(div, { onPaste });

    const event = new ClipboardEvent("paste", {
      clipboardData: new DataTransfer(),
    });
    event.clipboardData!.setData("text/plain", "hello");

    div.dispatchEvent(event);

    // onPaste is async — wait for microtask
    await vi.waitFor(() => expect(onPaste).toHaveBeenCalledOnce());

    const items = onPaste.mock.calls[0]![0];
    expect(items).toHaveLength(1);
    expect(items[0]!.kind).toBe("text");
    expect(items[0]!.text).toBe("hello");

    action.destroy();
  });

  it("respects accept: text filter", async () => {
    const div = document.createElement("div");
    const onPaste = vi.fn();
    const action = createPaste(div, { onPaste, accept: "text" });

    // Use setData for plain text — items.add with kind:"string" works too
    const dt = new DataTransfer();
    dt.items.add("hello", "text/plain");

    const event = new ClipboardEvent("paste", { clipboardData: dt });
    div.dispatchEvent(event);

    await vi.waitFor(() => expect(onPaste).toHaveBeenCalledOnce());
    const items = onPaste.mock.calls[0]![0];
    expect(items[0]!.kind).toBe("text");

    action.destroy();
  });

  it("destroy removes the listener", () => {
    const div = document.createElement("div");
    const onPaste = vi.fn();
    const action = createPaste(div, { onPaste });
    action.destroy();

    const event = new ClipboardEvent("paste", { clipboardData: new DataTransfer() });
    div.dispatchEvent(event);

    expect(onPaste).not.toHaveBeenCalled();
  });
});
