import { describe, expect, it } from "bun:test";
import { pipe, compose, flow } from "./index.js";

// ── pipe ──

describe("pipe", () => {
  it("passes value through a single function", () => {
    expect(pipe(5, (n) => n * 2)).toBe(10);
  });

  it("passes value through multiple functions", () => {
    const result = pipe(
      5,
      (n) => n + 3,
      (n) => n * 2,
      (n) => `val: ${n}`,
    );
    expect(result).toBe("val: 16");
  });

  it("infers types correctly", () => {
    const result: string = pipe(
      5,
      (n: number) => n + 3,
      (n: number) => n * 2,
      (n: number) => String(n),
    );
    expect(result).toBe("16");
  });

  it("handles object transformations", () => {
    const result = pipe(
      { name: "alice", age: 30 },
      (u) => ({ ...u, name: u.name.toUpperCase() }),
      (u) => `${u.name} is ${u.age}`,
    );
    expect(result).toBe("ALICE is 30");
  });

  it("handles 9 functions (max overload)", () => {
    const result = pipe(
      1,
      (n) => n + 1, // 2
      (n) => n * 2, // 4
      (n) => n + 1, // 5
      (n) => n * 2, // 10
      (n) => n + 1, // 11
      (n) => n * 2, // 22
      (n) => n + 1, // 23
      (n) => n * 2, // 46
      (n) => n + 1, // 47
    );
    expect(result).toBe(47);
  });
});

// ── compose ──

describe("compose", () => {
  it("composes two functions right-to-left", () => {
    const fn = compose(
      (s: string) => `[${s}]`,
      (n: number) => String(n * 2),
    );
    expect(fn(5)).toBe("[10]");
  });

  it("composes three functions", () => {
    const fn = compose(
      (s: string) => `<${s}>`,
      (s: string) => s.trim(),
      (s: string) => s.toUpperCase(),
    );
    expect(fn("  hello  ")).toBe("<HELLO>");
  });

  it("supports a single function", () => {
    const fn = compose((n: number) => n * 2);
    expect(fn(5)).toBe(10);
  });

  it("infers types correctly", () => {
    const fn = compose(
      (s: string) => s.length,
      (n: number) => String(n * 2),
    );
    const result: number = fn(5);
    expect(result).toBe(2);
  });
});

// ── flow ──

describe("flow", () => {
  it("composes two functions left-to-right", () => {
    const fn = flow(
      (n: number) => n * 2,
      (n: number) => String(n),
      (s: string) => `[${s}]`,
    );
    expect(fn(5)).toBe("[10]");
  });

  it("supports a single function", () => {
    const fn = flow((n: number) => n * 2);
    expect(fn(5)).toBe(10);
  });

  it("creates reusable pipelines", () => {
    const process = flow(
      (s: string) => s.trim(),
      (s: string) => s.toLowerCase(),
      (s: string) => s.replace(/\s+/g, "-"),
      (s: string) => `slug:${s}`,
    );
    expect(process("  Hello World  ")).toBe("slug:hello-world");
  });

  it("infers types correctly", () => {
    const fn = flow(
      (n: number) => n + 1,
      (n: number) => n * 2,
    );
    const result: number = fn(5);
    expect(result).toBe(12);
  });
});
