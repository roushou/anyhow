import { describe, expect, it } from "bun:test";
import { Backoff } from "./backoff.js";

describe("Backoff.constant", () => {
  it("returns the same delay every time", () => {
    const s = Backoff.constant(500);
    expect(s(0)).toBe(500);
    expect(s(1)).toBe(500);
    expect(s(5)).toBe(500);
  });
});

describe("Backoff.linear", () => {
  it("increases by step each attempt", () => {
    const s = Backoff.linear({ initial: 100, step: 200 });
    expect(s(0)).toBe(100);
    expect(s(1)).toBe(300);
    expect(s(2)).toBe(500);
    expect(s(3)).toBe(700);
  });
});

describe("Backoff.exponential", () => {
  it("doubles each attempt", () => {
    const s = Backoff.exponential({ initial: 100 });
    expect(s(0)).toBe(100);
    expect(s(1)).toBe(200);
    expect(s(2)).toBe(400);
    expect(s(3)).toBe(800);
  });

  it("respects max cap", () => {
    const s = Backoff.exponential({ initial: 100, max: 500 });
    expect(s(0)).toBe(100);
    expect(s(1)).toBe(200);
    expect(s(2)).toBe(400);
    expect(s(3)).toBe(500); // capped
    expect(s(4)).toBe(500); // capped
  });
});

describe("Backoff.exponentialWithJitter", () => {
  it("returns delays between 50% and 100% of the exponential base", () => {
    const s = Backoff.exponentialWithJitter({ initial: 100 });
    for (let i = 0; i < 50; i++) {
      const attempt = Math.floor(Math.random() * 5);
      const delay = s(attempt);
      const base = 100 * 2 ** attempt;
      expect(delay).toBeGreaterThanOrEqual(base * 0.5);
      expect(delay).toBeLessThanOrEqual(base);
    }
  });

  it("respects max cap", () => {
    const s = Backoff.exponentialWithJitter({ initial: 100, max: 500 });
    for (let i = 0; i < 20; i++) {
      const delay = s(10); // well beyond max
      expect(delay).toBeGreaterThanOrEqual(250); // 500 * 0.5
      expect(delay).toBeLessThanOrEqual(500);
    }
  });
});

describe("Backoff.custom", () => {
  it("delegates to the custom function", () => {
    const s = Backoff.custom((attempt) => (attempt + 1) * 500);
    expect(s(0)).toBe(500);
    expect(s(1)).toBe(1000);
    expect(s(2)).toBe(1500);
  });
});
