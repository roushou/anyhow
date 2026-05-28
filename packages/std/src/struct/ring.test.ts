import { describe, expect, it } from "bun:test";
import { RingBuffer } from "./ring.js";

describe("RingBuffer", () => {
  describe("constructor", () => {
    it("throws on invalid capacity", () => {
      expect(() => new RingBuffer(0)).toThrow(RangeError);
      expect(() => new RingBuffer(-1)).toThrow(RangeError);
      expect(() => new RingBuffer(1.5)).toThrow(RangeError);
    });

    it("accepts valid capacity", () => {
      const ring = new RingBuffer<number>(5);
      expect(ring.capacity).toBe(5);
      expect(ring.size).toBe(0);
    });
  });

  describe("push / pop", () => {
    it("pushes and pops in FIFO order", () => {
      const ring = new RingBuffer<number>(10);
      ring.push(1);
      ring.push(2);
      ring.push(3);
      expect(ring.pop()).toBe(1);
      expect(ring.pop()).toBe(2);
      expect(ring.pop()).toBe(3);
    });

    it("pop returns undefined when empty", () => {
      const ring = new RingBuffer<number>(5);
      expect(ring.pop()).toBeUndefined();
    });

    it("overwrites oldest items when full", () => {
      const ring = new RingBuffer<number>(3);
      ring.push(1);
      ring.push(2);
      ring.push(3);
      ring.push(4); // overwrites 1
      ring.push(5); // overwrites 2
      expect(ring.toArray()).toEqual([3, 4, 5]);
    });
  });

  describe("peek / peekLast", () => {
    it("peek returns the oldest item without removing", () => {
      const ring = new RingBuffer<number>(5);
      ring.push(10);
      ring.push(20);
      expect(ring.peek()).toBe(10);
      expect(ring.size).toBe(2);
    });

    it("peek returns undefined when empty", () => {
      const ring = new RingBuffer<number>(5);
      expect(ring.peek()).toBeUndefined();
    });

    it("peekLast returns the newest item without removing", () => {
      const ring = new RingBuffer<number>(5);
      ring.push(10);
      ring.push(20);
      expect(ring.peekLast()).toBe(20);
      expect(ring.size).toBe(2);
    });

    it("peekLast returns undefined when empty", () => {
      const ring = new RingBuffer<number>(5);
      expect(ring.peekLast()).toBeUndefined();
    });
  });

  describe("size / isEmpty / isFull", () => {
    it("tracks size correctly", () => {
      const ring = new RingBuffer<number>(5);
      expect(ring.size).toBe(0);
      ring.push(1);
      expect(ring.size).toBe(1);
      ring.push(2);
      expect(ring.size).toBe(2);
      ring.pop();
      expect(ring.size).toBe(1);
    });

    it("isEmpty works", () => {
      const ring = new RingBuffer<number>(3);
      expect(ring.isEmpty()).toBe(true);
      ring.push(1);
      expect(ring.isEmpty()).toBe(false);
      ring.pop();
      expect(ring.isEmpty()).toBe(true);
    });

    it("isFull works", () => {
      const ring = new RingBuffer<number>(2);
      expect(ring.isFull()).toBe(false);
      ring.push(1);
      expect(ring.isFull()).toBe(false);
      ring.push(2);
      expect(ring.isFull()).toBe(true);
    });

    it("isFull stays true after overwrites", () => {
      const ring = new RingBuffer<number>(2);
      ring.push(1);
      ring.push(2);
      expect(ring.isFull()).toBe(true);
      ring.push(3); // overwrites 1
      expect(ring.isFull()).toBe(true);
    });
  });

  describe("clear", () => {
    it("removes all items", () => {
      const ring = new RingBuffer<number>(5);
      ring.push(1);
      ring.push(2);
      ring.clear();
      expect(ring.size).toBe(0);
      expect(ring.isEmpty()).toBe(true);
      expect(ring.pop()).toBeUndefined();
    });

    it("allows reuse after clear", () => {
      const ring = new RingBuffer<number>(3);
      ring.push(1);
      ring.push(2);
      ring.clear();
      ring.push(3);
      expect(ring.toArray()).toEqual([3]);
    });
  });

  describe("toArray", () => {
    it("returns items oldest to newest", () => {
      const ring = new RingBuffer<number>(5);
      ring.push(1);
      ring.push(2);
      ring.push(3);
      expect(ring.toArray()).toEqual([1, 2, 3]);
    });

    it("returns a copy, not a reference", () => {
      const ring = new RingBuffer<number>(5);
      ring.push(1);
      const arr = ring.toArray();
      arr.push(99);
      expect(ring.toArray()).toEqual([1]);
    });

    it("handles wrap-around correctly", () => {
      const ring = new RingBuffer<number>(3);
      ring.push(1);
      ring.push(2);
      ring.push(3);
      ring.push(4);
      ring.push(5);
      expect(ring.toArray()).toEqual([3, 4, 5]);
    });
  });

  describe("iteration", () => {
    it("iterates oldest to newest", () => {
      const ring = new RingBuffer<number>(5);
      ring.push(1);
      ring.push(2);
      ring.push(3);
      expect([...ring]).toEqual([1, 2, 3]);
    });

    it("empty ring yields nothing", () => {
      const ring = new RingBuffer<number>(3);
      expect([...ring]).toEqual([]);
    });

    it("iterates correctly after wrap-around", () => {
      const ring = new RingBuffer<number>(3);
      ring.push(1);
      ring.push(2);
      ring.push(3);
      ring.push(4); // overwrites 1
      expect([...ring]).toEqual([2, 3, 4]);
    });

    it("single element", () => {
      const ring = new RingBuffer<string>(10);
      ring.push("only");
      expect([...ring]).toEqual(["only"]);
    });
  });

  describe("sliding window use case", () => {
    it("maintains last N values", () => {
      const lastErrors = new RingBuffer<string>(3);
      lastErrors.push("err1");
      lastErrors.push("err2");
      lastErrors.push("err3");
      lastErrors.push("err4");
      expect(lastErrors.toArray()).toEqual(["err2", "err3", "err4"]);
    });

    it("can be used as a simple moving average", () => {
      const ring = new RingBuffer<number>(3);
      const averages: number[] = [];

      for (const val of [10, 20, 30, 40, 50]) {
        ring.push(val);
        let sum = 0;
        for (const v of ring) sum += v;
        averages.push(sum / ring.size);
      }

      expect(averages).toEqual([10, 15, 20, 30, 40]);
    });
  });
});
