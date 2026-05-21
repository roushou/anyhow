import { describe, expect, it } from "bun:test";
import { Queue } from "./queue.js";

describe("Queue", () => {
  describe("enqueue / dequeue / peek", () => {
    it("enqueues and dequeues in FIFO order", () => {
      const queue = new Queue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      expect(queue.dequeue()).toBe(1);
      expect(queue.dequeue()).toBe(2);
      expect(queue.dequeue()).toBe(3);
    });

    it("dequeue returns undefined when empty", () => {
      const queue = new Queue<number>();
      expect(queue.dequeue()).toBeUndefined();
    });

    it("peek returns the front item without removing it", () => {
      const queue = new Queue<string>();
      queue.enqueue("first");
      queue.enqueue("second");
      expect(queue.peek()).toBe("first");
      expect(queue.size).toBe(2);
    });

    it("peek returns undefined when empty", () => {
      const queue = new Queue<number>();
      expect(queue.peek()).toBeUndefined();
    });
  });

  describe("size / isEmpty / clear", () => {
    it("tracks size correctly", () => {
      const queue = new Queue<number>();
      expect(queue.size).toBe(0);
      queue.enqueue(1);
      expect(queue.size).toBe(1);
      queue.enqueue(2);
      expect(queue.size).toBe(2);
      queue.dequeue();
      expect(queue.size).toBe(1);
    });

    it("isEmpty works", () => {
      const queue = new Queue<number>();
      expect(queue.isEmpty()).toBe(true);
      queue.enqueue(1);
      expect(queue.isEmpty()).toBe(false);
      queue.dequeue();
      expect(queue.isEmpty()).toBe(true);
    });

    it("clear removes all items", () => {
      const queue = new Queue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.clear();
      expect(queue.size).toBe(0);
      expect(queue.dequeue()).toBeUndefined();
    });
  });

  describe("two-pointer compaction", () => {
    it("compacts after many dequeues", () => {
      const queue = new Queue<number>();
      for (let i = 0; i < 100; i++) {
        queue.enqueue(i);
      }
      for (let i = 0; i < 90; i++) {
        expect(queue.dequeue()).toBe(i);
      }
      // Should still work after compaction
      expect(queue.peek()).toBe(90);
      expect(queue.size).toBe(10);
    });

    it("handles enqueue after dequeue", () => {
      const queue = new Queue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.dequeue();
      queue.enqueue(3);
      expect([...queue]).toEqual([2, 3]);
    });
  });

  describe("iteration", () => {
    it("iterates in FIFO order", () => {
      const queue = new Queue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      expect([...queue]).toEqual([1, 2, 3]);
    });

    it("empty queue yields nothing", () => {
      const queue = new Queue<number>();
      expect([...queue]).toEqual([]);
    });

    it("single element", () => {
      const queue = new Queue<string>();
      queue.enqueue("only");
      expect([...queue]).toEqual(["only"]);
    });
  });
});
