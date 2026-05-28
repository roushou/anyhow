import { describe, it, expect } from "vitest";
import { createTextareaAutosize } from "./textarea-autosize.js";

describe("createTextareaAutosize", () => {
  function setup(value = "") {
    const textarea = document.createElement("textarea");
    textarea.value = value;
    // Simulate layout so scrollHeight returns a non-zero value
    Object.defineProperty(textarea, "scrollHeight", {
      value: 40,
      writable: true,
    });
    document.body.appendChild(textarea);
    return textarea;
  }

  it("returns an action with a destroy method", () => {
    const textarea = setup();
    const action = createTextareaAutosize(textarea);
    expect(action).toHaveProperty("destroy");
    action.destroy();
  });

  it("sets overflow and resize styles on mount", () => {
    const textarea = setup();
    const action = createTextareaAutosize(textarea);

    expect(textarea.style.overflow).toBe("hidden");
    expect(textarea.style.resize).toBe("none");

    action.destroy();
  });

  it("sets height based on scrollHeight", () => {
    const textarea = setup();
    Object.defineProperty(textarea, "scrollHeight", { value: 80, writable: true });

    const action = createTextareaAutosize(textarea);

    expect(textarea.style.height).toBe("80px");

    action.destroy();
  });

  it("clamps to minHeight", () => {
    const textarea = setup();
    Object.defineProperty(textarea, "scrollHeight", { value: 20, writable: true });

    const action = createTextareaAutosize(textarea, { minHeight: 50 });

    expect(textarea.style.height).toBe("50px");

    action.destroy();
  });

  it("clamps to maxHeight", () => {
    const textarea = setup();
    Object.defineProperty(textarea, "scrollHeight", { value: 200, writable: true });

    const action = createTextareaAutosize(textarea, { maxHeight: 100 });

    expect(textarea.style.height).toBe("100px");
    expect(textarea.style.overflowY).toBe("auto");

    action.destroy();
  });

  it("resizes on input", () => {
    const textarea = setup();
    Object.defineProperty(textarea, "scrollHeight", { value: 40, writable: true });

    const action = createTextareaAutosize(textarea);
    expect(textarea.style.height).toBe("40px");

    // Simulate content growth
    Object.defineProperty(textarea, "scrollHeight", { value: 120, writable: true });
    textarea.dispatchEvent(new Event("input", { bubbles: true }));

    expect(textarea.style.height).toBe("120px");

    action.destroy();
  });

  it("restores original styles on destroy", () => {
    const textarea = setup();
    textarea.style.overflow = "auto";
    textarea.style.resize = "both";
    textarea.style.height = "60px";

    const action = createTextareaAutosize(textarea);
    action.destroy();

    expect(textarea.style.overflow).toBe("auto");
    expect(textarea.style.resize).toBe("both");
    expect(textarea.style.height).toBe("60px");
  });
});
