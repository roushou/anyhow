# anyhow

A batteries-included TypeScript utility toolkit featuring type-safe error handling, runtime guards, async primitives, iterators, formatting, math, and caching.

## Installation

```bash
bun add @anyhow/core
```

## Modules

### Result

A discriminated union for type-safe error handling. Instead of throwing, functions return `{ ok: true; value: T }` or `{ ok: false; error: E }`.

```ts
import { ok, err, trySync, tryAsync, map, andThen, unwrapOr, match } from "@anyhow/core/result";
import type { Result } from "@anyhow/core/result";

function divide(a: number, b: number): Result<number, string> {
  if (b === 0) return err("division by zero");
  return ok(a / b);
}

const result = divide(10, 2);

// Transform the value if ok
map(result, (v) => v * 2); // { ok: true, value: 10 }

// Chain fallible operations
andThen(result, (v) => divide(v, 5)); // { ok: true, value: 1 }

// Extract with a fallback
unwrapOr(result, 0); // 5

// Pattern match on both branches
match(
  result,
  (v) => `Got ${v}`,
  (e) => `Error: ${e}`,
); // "Got 5"

// Wrap throwing functions
const parsed = trySync(() => JSON.parse('{"name":"Alice"}'));
const data = await tryAsync(() => fetch("/api").then((r) => r.json()));
```

### Guard

Runtime type guards and assertions for validating unknown data at the boundary.

```ts
import {
  isString,
  isNumber,
  isBoolean,
  isObject,
  isDefined,
  hasProperty,
  isArrayOf,
  assert,
  assertDefined,
  assertNever,
  invariant,
  safeJsonParse,
} from "@anyhow/core/guard";

// Type guards
const data: unknown = { name: "Alice", scores: [1, 2, 3] };

if (isObject(data) && hasProperty(data, "name", isString)) {
  data.name; // string
}

if (isObject(data) && hasProperty(data, "scores", (v): v is number[] => isArrayOf(v, isNumber))) {
  data.scores; // number[]
}

// Assertions (throw on failure)
assertDefined(process.env.API_KEY, "API_KEY");

// Exhaustiveness check
type Shape = { kind: "circle"; radius: number } | { kind: "square"; side: number };

function area(s: Shape): number {
  switch (s.kind) {
    case "circle":
      return Math.PI * s.radius ** 2;
    case "square":
      return s.side ** 2;
    default:
      return assertNever(s);
  }
}

// Invariant checks (strippable for production)
invariant(limit > 0, "limit must be positive");

// Safe JSON parsing
const parsed = safeJsonParse<{ name: string }>('{"name":"Alice"}');
if (parsed.ok) {
  parsed.value.name; // string
}
```

### Async

Primitives for timing, retries, concurrency, and memoization.

```ts
import { sleep, debounce, throttle, retry, concurrent, memoizeAsync } from "@anyhow/core/async";

// Debounce rapid calls
const onChange = debounce((query: string) => search(query), 300);

// Throttle to at most one call per interval
const onScroll = throttle(() => updatePosition(), 100);

// Retry with exponential backoff
const data = await retry(() => fetch("/api").then((r) => r.json()), {
  attempts: 5,
  backoff: 200, // starts at 200ms, then 400ms, 800ms, 1600ms
});

// Run promises with a concurrency limit
const results = await concurrent(
  [fn1, fn2, fn3, fn4, fn5],
  2, // only 2 at a time
);

// Memoize an expensive async function
const memoized = memoizeAsync(fetchUser, { maxSize: 100, ttlMs: 60_000 });
```

### Fmt

Human-readable formatting for strings, numbers, dates, and units.

```ts
import {
  truncate,
  pluralize,
  filesize,
  duration,
  currency,
  number,
  date,
  relativeTime,
  list,
} from "@anyhow/core/fmt";

// Strings
truncate("hello world", 8); // "hello w…"
truncate("hello world", 8, { position: "middle" }); // "hel…rld"
pluralize(1, "cat"); // "1 cat"
pluralize(3, "cat"); // "3 cats"

// Units
filesize(1_500_000); // "1.5 MB"
filesize(1_500_000, { binary: true }); // "1.4 MiB"
duration(3_661_000); // "1h 1m 1s"
duration(3_661_000, { maxParts: 2 }); // "1h 1m"

// Intl wrappers
currency(9.99, "USD"); // "$9.99"
number(1_234_567.89); // "1,234,567.89"
date(new Date(), "full"); // "Monday, January 1, 2024"
relativeTime(-3, "day"); // "3 days ago"
list(["Alice", "Bob", "Carol"]); // "Alice, Bob, and Carol"
```

### Iter

Lazy iterator combinators over arrays.

```ts
import {
  map,
  filter,
  flatMap,
  take,
  skip,
  enumerate,
  unique,
  zip,
  chunk,
  first,
  last,
  count,
  find,
  some,
  every,
  reduce,
  forEach,
  groupBy,
} from "@anyhow/core/iter";

map([1, 2, 3], (n) => n * 2); // [2, 4, 6]
filter([1, 2, 3, 4], (n) => n % 2 === 0); // [2, 4]
take([1, 2, 3, 4, 5], 3); // [1, 2, 3]
chunk([1, 2, 3, 4, 5], 2); // [[1, 2], [3, 4], [5]]
zip(["a", "b"], [1, 2]); // [["a", 1], ["b", 2]]
unique([1, 2, 2, 3, 3, 3]); // [1, 2, 3]
groupBy([1, 2, 3, 4, 5], (n) => (n % 2 === 0 ? "even" : "odd"));
// { odd: [1, 3, 5], even: [2, 4] }
```

### Math

Interpolation, statistics, and numeric utilities.

```ts
import { clamp, lerp, normalize, mapRange, roundTo, sum, average, median } from "@anyhow/core/math";

clamp(150, 0, 100); // 100
lerp(0, 100, 0.5); // 50
normalize(50, 0, 100); // 0.5
mapRange(50, 0, 100, 0, 1); // 0.5
roundTo(3.14159, 2); // 3.14

sum([1, 2, 3, 4, 5]); // 15
average([1, 2, 3, 4, 5]); // 3
median([1, 5, 2, 4, 3]); // 3
```

### Cache

An LRU cache with optional TTL, and a sync memoization helper.

```ts
import { LRU, memoizeSync } from "@anyhow/core/cache";

const cache = new LRU<string, User>(256, 60_000); // max 256 entries, 1 min TTL

cache.set("user:42", user);

const user = cache.get("user:42"); // User | undefined

// Auto-compute on miss
const user = cache.getOrSet("user:42", () => fetchUser("42"));

// Memoize a sync function
const fib = memoizeSync(
  (n: number): number => {
    if (n <= 1) return n;
    return fib(n - 1) + fib(n - 2);
  },
  { maxSize: 1000 },
);
```

## Development

```bash
# Install dependencies
bun install

# Build all packages
bun run build

# Run tests
bun test

# Lint & format
bun run lint
bun run format

# Check everything
bun run check
```

## License

MIT
