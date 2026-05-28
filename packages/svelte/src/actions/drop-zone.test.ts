import { describe, it, expect, vi } from "vitest";
import { createDropZone } from "./drop-zone.svelte.js";

describe("createDropZone", () => {
  function makeFile(name: string, type: string, size = 100): File {
    return new File(["x".repeat(size)], name, { type });
  }

  function makeEvent(type: string, files?: File[]): DragEvent {
    const dt = new DataTransfer();
    if (files) {
      for (const f of files) dt.items.add(f);
    }
    return new DragEvent(type, { dataTransfer: dt, bubbles: true });
  }

  it("returns isOver, isRejected, and action", () => {
    const dz = createDropZone({ onDrop: () => {} });
    expect(dz).toHaveProperty("isOver");
    expect(dz).toHaveProperty("isRejected");
    expect(dz).toHaveProperty("action");
  });

  it("action returns a destroy method", () => {
    const div = document.createElement("div");
    const dz = createDropZone({ onDrop: () => {} });
    const result = dz.action(div);
    expect(result).toHaveProperty("destroy");
    result.destroy();
  });

  it("sets isOver true on dragenter", () => {
    const div = document.createElement("div");
    const dz = createDropZone({ onDrop: () => {} });
    dz.action(div);

    div.dispatchEvent(makeEvent("dragenter"));

    expect(dz.isOver).toBe(true);
  });

  it("sets isOver false on dragleave", () => {
    const div = document.createElement("div");
    const dz = createDropZone({ onDrop: () => {} });
    dz.action(div);

    div.dispatchEvent(makeEvent("dragenter"));
    div.dispatchEvent(makeEvent("dragleave"));

    expect(dz.isOver).toBe(false);
  });

  it("calls onDrop with accepted files", () => {
    const div = document.createElement("div");
    const onDrop = vi.fn();
    const dz = createDropZone({ onDrop });
    dz.action(div);

    const file = makeFile("test.png", "image/png");
    div.dispatchEvent(makeEvent("drop", [file]));

    expect(onDrop).toHaveBeenCalledOnce();
    expect(onDrop.mock.calls[0]![0]).toHaveLength(1);
    expect(onDrop.mock.calls[0]![1]).toHaveLength(0);
  });

  it("rejects files by type", () => {
    const div = document.createElement("div");
    const onDrop = vi.fn();
    const dz = createDropZone({ onDrop, accept: [".pdf"] });
    dz.action(div);

    const file = makeFile("doc.png", "image/png");
    div.dispatchEvent(makeEvent("drop", [file]));

    const rejected = onDrop.mock.calls[0]![1];
    expect(rejected).toHaveLength(1);
    expect(rejected[0]!.reason).toBe("type");
  });

  it("rejects files by size", () => {
    const div = document.createElement("div");
    const onDrop = vi.fn();
    const dz = createDropZone({ onDrop, maxSize: 50 });
    dz.action(div);

    const file = makeFile("big.png", "image/png", 200);
    div.dispatchEvent(makeEvent("drop", [file]));

    const rejected = onDrop.mock.calls[0]![1];
    expect(rejected).toHaveLength(1);
    expect(rejected[0]!.reason).toBe("size");
  });
});
