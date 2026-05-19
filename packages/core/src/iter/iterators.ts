// ── generators (lazy) ──

export function* map<T, U>(iter: Iterable<T>, fn: (item: T, index: number) => U): Generator<U> {
  let i = 0;
  for (const item of iter) yield fn(item, i++);
}

export function* filter<T>(
  iter: Iterable<T>,
  pred: (item: T, index: number) => boolean,
): Generator<T> {
  let i = 0;
  for (const item of iter) {
    if (pred(item, i++)) yield item;
  }
}

export function* flatMap<T, U>(
  iter: Iterable<T>,
  fn: (item: T, index: number) => Iterable<U>,
): Generator<U> {
  let i = 0;
  for (const item of iter) yield* fn(item, i++);
}

export function* take<T>(iter: Iterable<T>, n: number): Generator<T> {
  let i = 0;
  for (const item of iter) {
    if (i++ >= n) break;
    yield item;
  }
}

export function* skip<T>(iter: Iterable<T>, n: number): Generator<T> {
  let i = 0;
  for (const item of iter) {
    if (i++ < n) continue;
    yield item;
  }
}

export function* enumerate<T>(iter: Iterable<T>): Generator<[number, T]> {
  let i = 0;
  for (const item of iter) yield [i++, item];
}

export function* unique<T>(iter: Iterable<T>, key?: (i: T) => unknown): Generator<T> {
  const seen = new Set();
  for (const item of iter) {
    const k = key ? key(item) : item;
    if (!seen.has(k)) {
      seen.add(k);
      yield item;
    }
  }
}

export function* zip<A, B>(a: Iterable<A>, b: Iterable<B>): Generator<[A, B]> {
  const ib = b[Symbol.iterator]();
  for (const a_ of a) {
    const { value, done } = ib.next();
    if (done) break;
    yield [a_, value];
  }
}

export function* chunk<T>(iter: Iterable<T>, size: number): Generator<T[]> {
  let buf: T[] = [];
  for (const item of iter) {
    buf.push(item);
    if (buf.length === size) {
      yield buf;
      buf = [];
    }
  }
  if (buf.length) yield buf;
}

// ── terminal (eager) ──

export function first<T>(iter: Iterable<T>): T | undefined {
  const { value } = iter[Symbol.iterator]().next();
  return value;
}

export function last<T>(iter: Iterable<T>): T | undefined {
  let last: T | undefined;
  for (const item of iter) last = item;
  return last;
}

export function count(iter: Iterable<unknown>): number {
  let n = 0;
  for (const _ of iter) n++;
  return n;
}

export function find<T>(
  iter: Iterable<T>,
  pred: (item: T, index: number) => boolean,
): T | undefined {
  let i = 0;
  for (const item of iter) {
    if (pred(item, i++)) return item;
  }
}

export function some<T>(iter: Iterable<T>, pred: (item: T, index: number) => boolean): boolean {
  let i = 0;
  for (const item of iter) {
    if (pred(item, i++)) return true;
  }
  return false;
}

export function every<T>(iter: Iterable<T>, pred: (item: T, index: number) => boolean): boolean {
  let i = 0;
  for (const item of iter) {
    if (!pred(item, i++)) return false;
  }
  return true;
}

export function reduce<T, U>(
  iter: Iterable<T>,
  fn: (acc: U, item: T, index: number) => U,
  initial: U,
): U {
  let acc = initial;
  let i = 0;
  for (const item of iter) acc = fn(acc, item, i++);
  return acc;
}

export function forEach<T>(iter: Iterable<T>, fn: (item: T, index: number) => void): void {
  let i = 0;
  for (const item of iter) fn(item, i++);
}

export function groupBy<T, K extends PropertyKey>(
  iter: Iterable<T>,
  key: (i: T) => K,
): Map<K, T[]> {
  const m = new Map<K, T[]>();
  for (const item of iter) {
    const k = key(item);
    if (!m.has(k)) m.set(k, []);
    m.get(k)!.push(item);
  }
  return m;
}
