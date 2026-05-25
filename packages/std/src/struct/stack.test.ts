import { describe, expect, it } from "bun:test";
import { Stack } from "./stack.js";

describe("Stack", () => {
  describe("push / pop / peek", () => {
    it("pushes and pops items in LIFO order", () => {
      const stack = new Stack<number>();
      stack.push(1);
      stack.push(2);
      stack.push(3);
      expect(stack.pop()).toBe(3);
      expect(stack.pop()).toBe(2);
      expect(stack.pop()).toBe(1);
    });

    it("pop returns undefined when empty", () => {
      const stack = new Stack<number>();
      expect(stack.pop()).toBeUndefined();
    });

    it("peek returns the top item without removing it", () => {
      const stack = new Stack<number>();
      stack.push(42);
      expect(stack.peek()).toBe(42);
      expect(stack.size).toBe(1);
    });

    it("peek returns undefined when empty", () => {
      const stack = new Stack<string>();
      expect(stack.peek()).toBeUndefined();
    });
  });

  describe("size / isEmpty / clear", () => {
    it("tracks size correctly", () => {
      const stack = new Stack<string>();
      expect(stack.size).toBe(0);
      stack.push("a");
      expect(stack.size).toBe(1);
      stack.push("b");
      expect(stack.size).toBe(2);
      stack.pop();
      expect(stack.size).toBe(1);
    });

    it("isEmpty returns true for empty stack", () => {
      const stack = new Stack<number>();
      expect(stack.isEmpty()).toBe(true);
    });

    it("isEmpty returns false after push", () => {
      const stack = new Stack<number>();
      stack.push(1);
      expect(stack.isEmpty()).toBe(false);
    });

    it("clear removes all items", () => {
      const stack = new Stack<number>();
      stack.push(1);
      stack.push(2);
      stack.clear();
      expect(stack.size).toBe(0);
      expect(stack.isEmpty()).toBe(true);
      expect(stack.pop()).toBeUndefined();
    });
  });

  describe("iteration", () => {
    it("iterates in LIFO order (top to bottom)", () => {
      const stack = new Stack<number>();
      stack.push(1);
      stack.push(2);
      stack.push(3);
      expect([...stack]).toEqual([3, 2, 1]);
    });

    it("empty stack yields nothing", () => {
      const stack = new Stack<number>();
      expect([...stack]).toEqual([]);
    });

    it("single element", () => {
      const stack = new Stack<number>();
      stack.push(99);
      expect([...stack]).toEqual([99]);
    });
  });

  describe("mixed operations", () => {
    it("handles interleaved push and pop", () => {
      const stack = new Stack<number>();
      stack.push(1);
      stack.push(2);
      expect(stack.pop()).toBe(2);
      stack.push(3);
      expect(stack.pop()).toBe(3);
      expect(stack.pop()).toBe(1);
      expect(stack.pop()).toBeUndefined();
    });
  });
});
