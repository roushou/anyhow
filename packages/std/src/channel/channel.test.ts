import { describe, expect, it } from "bun:test";
import { channel, select } from "./channel.js";

describe("channel", () => {
  describe("unbuffered (capacity 0)", () => {
    it("send blocks until recv", async () => {
      const ch = channel<number>();
      const p = ch.recv();
      await ch.send(42);
      const v = await p;
      expect(v.isSome()).toBe(true);
      expect(v.unwrap()).toBe(42);
    });

    it("recv blocks until send", async () => {
      const ch = channel<number>();
      const p = ch.recv();
      // Yield microtask to let recv queue
      await Promise.resolve();
      await ch.send(99);
      const v = await p;
      expect(v.unwrap()).toBe(99);
    });

    it("multiple producers and consumers", async () => {
      const ch = channel<number>();
      const results: number[] = [];

      const producer = async () => {
        for (let i = 0; i < 10; i++) {
          await ch.send(i);
        }
        ch.close();
      };

      const consumer = async () => {
        while (true) {
          const v = await ch.recv();
          if (v.isNone()) break;
          results.push(v.unwrap());
        }
      };

      await Promise.all([producer(), consumer()]);
      expect(results).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });
  });

  describe("buffered", () => {
    it("does not block send when buffer has room", async () => {
      const ch = channel<number>({ capacity: 3 });
      await ch.send(1);
      await ch.send(2);
      await ch.send(3);
      expect(ch.size).toBe(3);
    });

    it("blocks send when buffer is full", async () => {
      const ch = channel<number>({ capacity: 1 });
      await ch.send(1);
      let sent = false;
      ch.send(2).then(() => {
        sent = true;
      });
      await Promise.resolve(); // let the send queue
      expect(sent).toBe(false);
    });

    it("unblocks queued sender when receiver arrives", async () => {
      const ch = channel<number>({ capacity: 1 });
      await ch.send(1);
      let sent = false;
      const p = ch.send(2).then(() => {
        sent = true;
      });
      await Promise.resolve();
      expect(sent).toBe(false);

      const v1 = await ch.recv();
      expect(v1.unwrap()).toBe(1);
      await p;
      expect(sent).toBe(true);

      const v2 = await ch.recv();
      expect(v2.unwrap()).toBe(2);
    });

    it("recv resolves immediately when buffer has items", async () => {
      const ch = channel<number>({ capacity: 2 });
      ch.trySend(10);
      ch.trySend(20);
      expect((await ch.recv()).unwrap()).toBe(10);
      expect((await ch.recv()).unwrap()).toBe(20);
    });
  });

  describe("close", () => {
    it("recv returns none after close and drain", async () => {
      const ch = channel<number>({ capacity: 1 });
      ch.trySend(42);
      ch.close();
      expect((await ch.recv()).unwrap()).toBe(42);
      expect((await ch.recv()).isNone()).toBe(true);
    });

    it("queued receivers get none on close", async () => {
      const ch = channel<number>();
      const p = ch.recv();
      await Promise.resolve();
      ch.close();
      const v = await p;
      expect(v.isNone()).toBe(true);
    });

    it("send rejects after close", async () => {
      const ch = channel<number>();
      ch.close();
      await expect(ch.send(1)).rejects.toThrow("channel closed");
    });

    it("pending senders reject on close", async () => {
      const ch = channel<number>({ capacity: 1 });
      await ch.send(1);
      const p = ch.send(2);
      await Promise.resolve();
      ch.close();
      await expect(p).rejects.toThrow("channel closed");
    });

    it("close is idempotent", () => {
      const ch = channel<number>();
      ch.close();
      expect(() => ch.close()).not.toThrow();
    });
  });

  describe("trySend / tryRecv", () => {
    it("trySend succeeds when buffer has room", () => {
      const ch = channel<number>({ capacity: 2 });
      expect(ch.trySend(1)).toBe(true);
      expect(ch.trySend(2)).toBe(true);
      expect(ch.trySend(3)).toBe(false);
    });

    it("trySend fails when closed", () => {
      const ch = channel<number>();
      ch.close();
      expect(ch.trySend(1)).toBe(false);
    });

    it("trySend succeeds when receiver is waiting (unbuffered)", async () => {
      const ch = channel<number>();
      const p = ch.recv();
      await Promise.resolve();
      expect(ch.trySend(42)).toBe(true);
      expect((await p).unwrap()).toBe(42);
    });

    it("tryRecv returns some when data available", () => {
      const ch = channel<number>({ capacity: 1 });
      ch.trySend(7);
      const v = ch.tryRecv();
      expect(v.isSome()).toBe(true);
      expect(v.unwrap()).toBe(7);
    });

    it("tryRecv returns none when empty", () => {
      const ch = channel<number>();
      expect(ch.tryRecv().isNone()).toBe(true);
    });

    it("tryRecv returns none when closed and drained", () => {
      const ch = channel<number>();
      ch.close();
      expect(ch.tryRecv().isNone()).toBe(true);
    });
  });

  describe("select", () => {
    it("resolves with the first ready channel", async () => {
      const a = channel<string>({ capacity: 1 });
      const b = channel<string>({ capacity: 1 });

      a.trySend("from-a");

      const result = await select(a, b);
      expect(result.index).toBe(0);
      expect(result.value.unwrap()).toBe("from-a");
    });

    it("selects between a slow and a fast channel", async () => {
      const a = channel<string>();
      const b = channel<string>();

      // Schedule a delayed send to b
      setTimeout(() => {
        b.trySend("from-b");
      }, 10);

      const result = await select(a, b);
      expect(result.index).toBe(1);
      expect(result.value.unwrap()).toBe("from-b");
    });

    it("returns none for a closed channel", async () => {
      const a = channel<string>();
      a.close();

      const result = await select(a);
      expect(result.index).toBe(0);
      expect(result.value.isNone()).toBe(true);
    });
  });

  describe("capacity validation", () => {
    it("throws on negative capacity", () => {
      expect(() => channel({ capacity: -1 })).toThrow(RangeError);
    });

    it("throws on non-integer capacity", () => {
      expect(() => channel({ capacity: 1.5 })).toThrow(RangeError);
    });

    it("defaults to unbuffered", () => {
      const ch = channel();
      expect(ch.capacity).toBe(0);
    });
  });

  describe("closed property", () => {
    it("is true only after close and drain", () => {
      const ch = channel<number>({ capacity: 1 });
      expect(ch.closed).toBe(false);
      ch.trySend(1);
      ch.close();
      expect(ch.closed).toBe(false); // still buffered
      ch.tryRecv();
      expect(ch.closed).toBe(true);
    });
  });

  describe("concurrent multi-producer multi-consumer", () => {
    it("delivers all values exactly once", async () => {
      const ch = channel<number>({ capacity: 3 });
      const N = 50;

      // 4 producers
      const producers = Array.from({ length: 4 }, (_, pi) =>
        (async () => {
          for (let i = 0; i < N; i++) {
            await ch.send(pi * 1000 + i);
          }
        })(),
      );

      // 4 consumers
      const received: number[] = [];
      const consumers = Array.from({ length: 4 }, () =>
        (async () => {
          while (true) {
            const v = await ch.recv();
            if (v.isNone()) break;
            received.push(v.unwrap());
          }
        })(),
      );

      // Wait for producers to finish, then close
      await Promise.all(producers);
      ch.close();
      await Promise.all(consumers);

      expect(received.length).toBe(N * 4);
      expect(new Set(received).size).toBe(N * 4); // all unique
    });
  });
});
