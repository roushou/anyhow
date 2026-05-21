import { describe, expect, it } from "bun:test";
import { PriorityQueue } from "./priority-queue.js";

describe("PriorityQueue", () => {
  describe("enqueue / dequeue / peek", () => {
    it("dequeues items in ascending order (min-heap)", () => {
      const pq = new PriorityQueue<number>((a, b) => a - b);
      pq.enqueue(5);
      pq.enqueue(1);
      pq.enqueue(3);
      pq.enqueue(2);
      pq.enqueue(4);
      expect(pq.dequeue()).toBe(1);
      expect(pq.dequeue()).toBe(2);
      expect(pq.dequeue()).toBe(3);
      expect(pq.dequeue()).toBe(4);
      expect(pq.dequeue()).toBe(5);
    });

    it("dequeue returns undefined when empty", () => {
      const pq = new PriorityQueue<number>((a, b) => a - b);
      expect(pq.dequeue()).toBeUndefined();
    });

    it("peek returns the minimum without removing it", () => {
      const pq = new PriorityQueue<number>((a, b) => a - b);
      pq.enqueue(5);
      pq.enqueue(1);
      expect(pq.peek()).toBe(1);
      expect(pq.size).toBe(2);
    });

    it("peek returns undefined when empty", () => {
      const pq = new PriorityQueue<number>((a, b) => a - b);
      expect(pq.peek()).toBeUndefined();
    });
  });

  describe("max-heap", () => {
    it("works as a max-heap with inverted comparator", () => {
      const pq = new PriorityQueue<number>((a, b) => b - a);
      pq.enqueue(1);
      pq.enqueue(5);
      pq.enqueue(3);
      expect(pq.dequeue()).toBe(5);
      expect(pq.dequeue()).toBe(3);
      expect(pq.dequeue()).toBe(1);
    });
  });

  describe("custom comparator", () => {
    it("works with string length comparator", () => {
      const pq = new PriorityQueue<string>((a, b) => a.length - b.length);
      pq.enqueue("aaa");
      pq.enqueue("a");
      pq.enqueue("aa");
      expect(pq.dequeue()).toBe("a");
      expect(pq.dequeue()).toBe("aa");
      expect(pq.dequeue()).toBe("aaa");
    });
  });

  describe("size / isEmpty / clear", () => {
    it("tracks size correctly", () => {
      const pq = new PriorityQueue<number>((a, b) => a - b);
      expect(pq.size).toBe(0);
      pq.enqueue(1);
      expect(pq.size).toBe(1);
      pq.enqueue(2);
      expect(pq.size).toBe(2);
      pq.dequeue();
      expect(pq.size).toBe(1);
    });

    it("isEmpty works", () => {
      const pq = new PriorityQueue<number>((a, b) => a - b);
      expect(pq.isEmpty()).toBe(true);
      pq.enqueue(1);
      expect(pq.isEmpty()).toBe(false);
    });

    it("clear removes all items", () => {
      const pq = new PriorityQueue<number>((a, b) => a - b);
      pq.enqueue(1);
      pq.enqueue(2);
      pq.clear();
      expect(pq.size).toBe(0);
      expect(pq.dequeue()).toBeUndefined();
    });
  });

  describe("edge cases", () => {
    it("handles duplicate values", () => {
      const pq = new PriorityQueue<number>((a, b) => a - b);
      pq.enqueue(2);
      pq.enqueue(2);
      pq.enqueue(1);
      expect(pq.dequeue()).toBe(1);
      expect(pq.dequeue()).toBe(2);
      expect(pq.dequeue()).toBe(2);
    });

    it("handles many items in order", () => {
      const pq = new PriorityQueue<number>((a, b) => a - b);
      for (let i = 99; i >= 0; i--) {
        pq.enqueue(i);
      }
      for (let i = 0; i < 100; i++) {
        expect(pq.dequeue()).toBe(i);
      }
    });
  });
});
