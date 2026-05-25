import { describe, it, expect } from "vitest";
import { createCycle } from "./cycle.svelte.js";

describe("createCycle", () => {
  it("starts at the first value by default", () => {
    const c = createCycle(["a", "b", "c"]);
    expect(c.value).toBe("a");
  });

  it("accepts a custom start index", () => {
    const c = createCycle(["a", "b", "c"], 2);
    expect(c.value).toBe("c");
  });

  it("next advances forward", () => {
    const c = createCycle(["a", "b", "c"]);
    c.next();
    expect(c.value).toBe("b");
    c.next();
    expect(c.value).toBe("c");
  });

  it("next wraps around", () => {
    const c = createCycle(["a", "b"]);
    c.next();
    c.next();
    expect(c.value).toBe("a");
  });

  it("prev moves backward", () => {
    const c = createCycle(["a", "b", "c"], 1);
    c.prev();
    expect(c.value).toBe("a");
  });

  it("prev wraps around", () => {
    const c = createCycle(["a", "b", "c"]);
    c.prev();
    expect(c.value).toBe("c");
  });

  it("reset goes back to initial", () => {
    const c = createCycle(["a", "b", "c"], 1);
    c.next();
    c.next();
    c.reset();
    expect(c.value).toBe("b");
  });

  it("throws on empty array", () => {
    expect(() => createCycle([])).toThrow();
  });
});
