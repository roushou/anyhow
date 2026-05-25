import { describe, expect, it } from "bun:test";
import { Deque } from "./deque.js";

describe("Deque", () => {
  describe("pushFront / popFront / peekFront", () => {
    it("adds and removes from the front", () => {
      const deque = new Deque<number>();
      deque.pushFront(1);
      deque.pushFront(2);
      expect(deque.popFront()).toBe(2);
      expect(deque.popFront()).toBe(1);
    });

    it("popFront returns undefined when empty", () => {
      const deque = new Deque<number>();
      expect(deque.popFront()).toBeUndefined();
    });

    it("peekFront returns front item without removing", () => {
      const deque = new Deque<number>();
      deque.pushFront(42);
      expect(deque.peekFront()).toBe(42);
      expect(deque.size).toBe(1);
    });

    it("peekFront returns undefined when empty", () => {
      const deque = new Deque<number>();
      expect(deque.peekFront()).toBeUndefined();
    });
  });

  describe("pushBack / popBack / peekBack", () => {
    it("adds and removes from the back", () => {
      const deque = new Deque<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      expect(deque.popBack()).toBe(2);
      expect(deque.popBack()).toBe(1);
    });

    it("popBack returns undefined when empty", () => {
      const deque = new Deque<number>();
      expect(deque.popBack()).toBeUndefined();
    });

    it("peekBack returns back item without removing", () => {
      const deque = new Deque<number>();
      deque.pushBack(10);
      deque.pushBack(20);
      expect(deque.peekBack()).toBe(20);
      expect(deque.size).toBe(2);
    });

    it("peekBack returns undefined when empty", () => {
      const deque = new Deque<number>();
      expect(deque.peekBack()).toBeUndefined();
    });
  });

  describe("mixed operations", () => {
    it("interleaves front and back operations", () => {
      const deque = new Deque<number>();
      deque.pushBack(1);
      deque.pushFront(0);
      deque.pushBack(2);
      // deque: [0, 1, 2]
      expect(deque.popFront()).toBe(0);
      expect(deque.popBack()).toBe(2);
      expect(deque.popFront()).toBe(1);
    });

    it("pushFront then popBack", () => {
      const deque = new Deque<number>();
      deque.pushFront(1);
      deque.pushFront(2);
      expect(deque.popBack()).toBe(1);
      expect(deque.popBack()).toBe(2);
    });

    it("pushBack then popFront", () => {
      const deque = new Deque<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      expect(deque.popFront()).toBe(1);
      expect(deque.popFront()).toBe(2);
    });
  });

  describe("size / isEmpty / clear", () => {
    it("tracks size through mixed operations", () => {
      const deque = new Deque<number>();
      expect(deque.size).toBe(0);
      deque.pushBack(1);
      expect(deque.size).toBe(1);
      deque.pushFront(0);
      expect(deque.size).toBe(2);
      deque.popFront();
      expect(deque.size).toBe(1);
    });

    it("isEmpty works", () => {
      const deque = new Deque<number>();
      expect(deque.isEmpty()).toBe(true);
      deque.pushBack(1);
      expect(deque.isEmpty()).toBe(false);
    });

    it("clear resets everything", () => {
      const deque = new Deque<number>();
      deque.pushBack(1);
      deque.pushFront(2);
      deque.clear();
      expect(deque.size).toBe(0);
      expect(deque.isEmpty()).toBe(true);
      expect(deque.popFront()).toBeUndefined();
      expect(deque.popBack()).toBeUndefined();
    });
  });

  describe("grow", () => {
    it("grows beyond initial capacity", () => {
      const deque = new Deque<number>();
      for (let i = 0; i < 100; i++) {
        deque.pushBack(i);
      }
      expect(deque.size).toBe(100);
      expect(deque.peekFront()).toBe(0);
      expect(deque.peekBack()).toBe(99);
    });

    it("grows with interleaved operations", () => {
      const deque = new Deque<number>();
      for (let i = 0; i < 50; i++) {
        deque.pushBack(i);
        deque.pushFront(-i - 1);
      }
      expect(deque.size).toBe(100);
      expect(deque.peekFront()).toBe(-50);
      expect(deque.peekBack()).toBe(49);
    });
  });

  describe("iteration", () => {
    it("iterates front to back", () => {
      const deque = new Deque<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      expect([...deque]).toEqual([1, 2, 3]);
    });

    it("iterates after mixed pushes", () => {
      const deque = new Deque<number>();
      deque.pushBack(2);
      deque.pushFront(1);
      deque.pushBack(3);
      expect([...deque]).toEqual([1, 2, 3]);
    });

    it("empty deque yields nothing", () => {
      const deque = new Deque<number>();
      expect([...deque]).toEqual([]);
    });
  });
});
