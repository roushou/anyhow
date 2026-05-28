import { describe, expect, it } from "bun:test";
import { Mutex, mutex, RwLock, rwlock } from "./mutex.js";
import { sleep } from "../async/timing.js";

describe("Mutex", () => {
  describe("lock / unlock", () => {
    it("grants exclusive access", async () => {
      const m = new Mutex(0);
      const guard = await m.lock();
      expect(guard.value).toBe(0);
      guard.value = 42;
      guard.unlock();
      expect(m.locked).toBe(false);
    });

    it("serialises concurrent access", async () => {
      const m = new Mutex(0);
      let running = 0;
      let maxConcurrent = 0;

      const tasks = Array.from({ length: 10 }, async () => {
        const g = await m.lock();
        running++;
        maxConcurrent = Math.max(maxConcurrent, running);
        await sleep(5);
        running--;
        g.unlock();
      });

      await Promise.all(tasks);
      expect(maxConcurrent).toBe(1);
      expect(m.locked).toBe(false);
    });

    it("preserves value across lock/unlock cycles", async () => {
      const m = new Mutex<string[]>([]);
      const g1 = await m.lock();
      g1.value.push("a");
      g1.unlock();

      const g2 = await m.lock();
      g2.value.push("b");
      g2.unlock();

      const g3 = await m.lock();
      expect(g3.value).toEqual(["a", "b"]);
      g3.unlock();
    });

    it("unlock is idempotent", async () => {
      const m = new Mutex(0);
      const g = await m.lock();
      g.unlock();
      g.unlock(); // second call should be a no-op
      expect(m.locked).toBe(false);
    });

    it("lock resolve is released to guard and unlock", async () => {
      const m = new Mutex(0);

      // Hold the lock
      const g1 = await m.lock();
      expect(m.locked).toBe(true);

      // Queue a waiter
      let g2: typeof g1 | null = null;
      const p = m.lock().then((g) => {
        g2 = g;
      });

      // Release
      g1.unlock();
      expect(m.locked).toBe(true); // still locked by queued waiter
      await p;
      expect(g2).not.toBeNull();
      expect(g2!.value).toBe(0);
      g2!.unlock();
      expect(m.locked).toBe(false);
    });
  });

  describe("tryLock", () => {
    it("returns some when not locked", () => {
      const m = new Mutex(42);
      const guard = m.tryLock();
      expect(guard.isSome()).toBe(true);
      expect(guard.unwrap().value).toBe(42);
      guard.unwrap().unlock();
    });

    it("returns none when locked", async () => {
      const m = new Mutex(42);
      const g = await m.lock();
      expect(m.tryLock().isNone()).toBe(true);
      g.unlock();
      expect(m.tryLock().isSome()).toBe(true);
    });
  });

  describe("locked", () => {
    it("reflects lock state", async () => {
      const m = new Mutex(0);
      expect(m.locked).toBe(false);
      const g = await m.lock();
      expect(m.locked).toBe(true);
      g.unlock();
      expect(m.locked).toBe(false);
    });
  });

  describe("mutex factory", () => {
    it("creates a Mutex instance", () => {
      const m = mutex("hello");
      expect(m).toBeInstanceOf(Mutex);
    });
  });

  describe("counter stress test", () => {
    it("100 concurrent increments produce the correct count", async () => {
      const counter = mutex(0);

      await Promise.all(
        Array.from({ length: 100 }, async () => {
          const g = await counter.lock();
          g.value += 1;
          g.unlock();
        }),
      );

      const g = await counter.lock();
      expect(g.value).toBe(100);
      g.unlock();
    });
  });
});

describe("RwLock", () => {
  describe("read lock", () => {
    it("allows concurrent reads", async () => {
      const lock = new RwLock({ x: 0 });
      let readers = 0;
      let maxReaders = 0;

      const tasks = Array.from({ length: 10 }, async () => {
        const g = await lock.read();
        readers++;
        maxReaders = Math.max(maxReaders, readers);
        await sleep(5);
        readers--;
        g.unlock();
      });

      await Promise.all(tasks);
      expect(maxReaders).toBeGreaterThan(1);
    });

    it("provides an immutable view", async () => {
      const lock = new RwLock({ x: 42 });
      const g = await lock.read();
      expect(g.value.x).toBe(42);
      g.unlock();
    });
  });

  describe("write lock", () => {
    it("grants exclusive write access", async () => {
      const lock = new RwLock({ x: 0 });
      let running = 0;
      let maxConcurrent = 0;

      const tasks = Array.from({ length: 5 }, async () => {
        const g = await lock.write();
        running++;
        maxConcurrent = Math.max(maxConcurrent, running);
        g.value.x += 1;
        await sleep(5);
        running--;
        g.unlock();
      });

      await Promise.all(tasks);
      expect(maxConcurrent).toBe(1);
    });

    it("prevents reads while writing", async () => {
      const lock = new RwLock({ x: 0 });
      const writeG = await lock.write();
      expect(lock.tryRead().isNone()).toBe(true);
      writeG.unlock();
      expect(lock.tryRead().isSome()).toBe(true);
    });
  });

  describe("tryRead / tryWrite", () => {
    it("tryRead succeeds when no writer", () => {
      const lock = new RwLock(42);
      const g = lock.tryRead();
      expect(g.isSome()).toBe(true);
      g.unwrap().unlock();
    });

    it("tryRead fails when writer holds the lock", async () => {
      const lock = new RwLock(42);
      const w = await lock.write();
      expect(lock.tryRead().isNone()).toBe(true);
      w.unlock();
      expect(lock.tryRead().isSome()).toBe(true);
    });

    it("tryWrite succeeds when no locks are held", () => {
      const lock = new RwLock(42);
      const g = lock.tryWrite();
      expect(g.isSome()).toBe(true);
      g.unwrap().unlock();
    });

    it("tryWrite fails when readers hold the lock", async () => {
      const lock = new RwLock(42);
      const r = await lock.read();
      expect(lock.tryWrite().isNone()).toBe(true);
      r.unlock();
      expect(lock.tryWrite().isSome()).toBe(true);
    });
  });

  describe("writer starvation prevention", () => {
    it("queued writer blocks new readers", async () => {
      const lock = new RwLock({ x: 0 });

      const r1 = await lock.read();

      // Queue a writer
      let writerRan = false;
      const wPromise = lock.write().then((g) => {
        writerRan = true;
        g.unlock();
      });

      // Queue a reader (should wait behind the writer)
      let reader2Ran = false;
      const r2Promise = lock.read().then((g) => {
        reader2Ran = true;
        g.unlock();
      });

      await sleep(5);
      expect(writerRan).toBe(false);
      expect(reader2Ran).toBe(false);

      // Release reader 1 — writer should acquire next, not reader 2
      r1.unlock();

      await sleep(5);
      // Writer should have run and released
      await wPromise;
      expect(writerRan).toBe(true);

      // Now reader 2 should run
      await r2Promise;
      expect(reader2Ran).toBe(true);
    });
  });

  describe("concurrent readers", () => {
    it("allows new readers to join while a reader is active", async () => {
      const lock = new RwLock({ x: 0 });

      // Hold a read lock
      const r1 = await lock.read();

      // Queue multiple readers — they should all run immediately (no writer)
      let count = 0;
      const reads = Array.from({ length: 5 }, () =>
        lock.read().then((g) => {
          count++;
          g.unlock();
        }),
      );

      await Promise.all(reads);
      expect(count).toBe(5); // all ran concurrently with r1

      r1.unlock();
    });
  });

  describe("locked", () => {
    it("reflects lock state", async () => {
      const lock = new RwLock(42);
      expect(lock.locked).toBe(false);

      const r = await lock.read();
      expect(lock.locked).toBe(true);
      r.unlock();
      expect(lock.locked).toBe(false);

      const w = await lock.write();
      expect(lock.locked).toBe(true);
      w.unlock();
      expect(lock.locked).toBe(false);
    });
  });

  describe("rwlock factory", () => {
    it("creates an RwLock instance", () => {
      const lock = rwlock("hello");
      expect(lock).toBeInstanceOf(RwLock);
    });
  });

  describe("read-heavy cache simulation", () => {
    it("allows many concurrent reads, rare writes", async () => {
      const cache = rwlock(new Map<string, number>());

      // Populate via write
      const w = await cache.write();
      w.value.set("a", 1);
      w.value.set("b", 2);
      w.unlock();

      // 50 concurrent reads
      const reads = Array.from({ length: 50 }, async () => {
        const g = await cache.read();
        const val = g.value.get("a");
        g.unlock();
        return val;
      });

      const results = await Promise.all(reads);
      expect(results.every((v) => v === 1)).toBe(true);
    });
  });
});
