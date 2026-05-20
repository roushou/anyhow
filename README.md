# anyhow

[![CI](https://github.com/roushou/anyhow/actions/workflows/ci.yml/badge.svg)](https://github.com/roushou/anyhow/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@anyhow/core?color=blue)](https://www.npmjs.com/package/@anyhow/core)
[![license](https://img.shields.io/github/license/roushou/anyhow)](./LICENSE)

A batteries-included TypeScript utility toolkit featuring type-safe error handling, optional values, runtime guards, schema validation, async primitives, iterators, formatting, string utilities, math, random, and caching.

## Installation

```bash
bun add @anyhow/core
bun add @anyhow/schema
```

## Modules

### Result

A discriminated union for type-safe error handling. Instead of throwing, functions return `{ ok: true; value: T }` or `{ ok: false; error: E }`.

```ts
import { ok, err, map, andThen, unwrapOr, match } from "@anyhow/core/result";
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

// Fall back to an alternative
or(result, ok(0)); // use result if ok, else ok(0)
orElse(result, (e) => ok(`recovered: ${e}`)); // lazy fallback

// Expect a value or throw with a custom message
expect(result, "expected a value"); // throws if err
```

### Option

A discriminated union for optional values. `Some<T>` carries a value; `None` represents absence.

```ts
import { some, none, map, andThen, unwrapOr, match, or, orElse } from "@anyhow/core/option";
import type { Option } from "@anyhow/core/option";

const opt = some(42);

// Transform if present
map(opt, (v) => v * 2); // { some: true, value: 84 }

// Chain optional operations
andThen(opt, (v) => (v > 0 ? some(v) : none())); // { some: true, value: 42 }

// Extract with a fallback
unwrapOr(none(), 0); // 0

// Pattern match
match(
  opt,
  (v) => `Got ${v}`,
  () => "Nothing",
); // "Got 42"

// Fall back to another Option
or(none(), some(10)); // { some: true, value: 10 }
orElse(none(), () => some(10)); // lazy fallback
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

### Safe

Wraps unsafe JavaScript operations (throwy functions, `NaN`-returning parsers,
missing env vars) in {@link Result} or {@link Option}.

```ts
import { safe } from "@anyhow/core/safe";

// Wrap any throwy function
const parsed = safe.sync(() => JSON.parse('{"name":"Alice"}'));
const data = await safe.async(() => fetch("/api").then((r) => r.json()));

// JSON helpers
safe.json('{"name":"Alice"}'); // Result<unknown>
safe.jsonStringify({ name: "Alice" }); // Result<string>

// Parse without NaN
safe.parseInt("42"); // { ok: true, value: 42 }
safe.parseFloat("3.14"); // { ok: true, value: 3.14 }

// Safe URI decoding
safe.decodeURIComponent("hello%20world"); // { ok: true, value: "hello world" }

// Environment variables (Option — missing isn't an error)
safe.env("API_KEY"); // { some: true, value: "sk-abc123" }
```

### String

Case conversion, slugification, string templating, and indent stripping.

```ts
import {
  camelCase,
  pascalCase,
  snakeCase,
  kebabCase,
  slugify,
  stripIndent,
  template,
} from "@anyhow/core/string";

// Case conversion
camelCase("hello-world"); // "helloWorld"
pascalCase("hello-world"); // "HelloWorld"
snakeCase("helloWorld"); // "hello_world"
kebabCase("helloWorld"); // "hello-world"

// Slugify for URLs
slugify("Hello World!"); // "hello-world"

// Strip common leading whitespace
stripIndent(`
  hello
  world
`); // "hello\nworld"

// Simple template substitution
template("Hello {{name}}!", { name: "Alice" }); // "Hello Alice!"
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

### Random

Seeded PRNG (Mulberry32) with shuffle, pick, weighted choice, and a drop-in auto-seeded singleton.

```ts
import { random, createRandom } from "@anyhow/core/random";

// Drop-in use (auto-seeded)
random.int(1, 6); // 4
random.float(0, 1); // 0.573…
random.bool(); // true
random.pick(["a", "b", "c"]); // "b"
random.shuffle([1, 2, 3]); // [3, 1, 2]
random.weighted(["a", "b"], [0.9, 0.1]); // "a" most of the time

// Deterministic (same seed = same sequence)
const rng = createRandom(42);
rng.int(1, 10); // always the same for seed 42
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

// Iterate over entries (oldest first, skips expired)
for (const [key, value] of cache) {
  console.log(key, value);
}
console.log([...cache.keys()]); // ["user:42", ...]
console.log([...cache.values()]); // [User, ...]

// Memoize a sync function
const fib = memoizeSync(
  (n: number): number => {
    if (n <= 1) return n;
    return fib(n - 1) + fib(n - 2);
  },
  { maxSize: 1000 },
);
```

## Packages

### @anyhow/schema

Runtime schema validation that returns `Result<T, ValidationError>`. Composes with `@anyhow/core/result` and `@anyhow/core/safe`.

```ts
import { s, type Infer } from "@anyhow/schema";

// Primitives
s.string();
s.number();
s.boolean();
s.literal("hello");
s.enum(["a", "b", "c"]);

// Composites
const User = s.object({
  name: s.string(),
  age: s.number(),
  tags: s.array(s.string()).optional().default([]),
});
type User = Infer<typeof User>; // { name: string; age: number; tags: string[] }

// Parse
const result = User.parse({ name: "Alice", age: 30 });
// { ok: true, value: { name: "Alice", age: 30, tags: [] } }

User.parse({ name: 42 });
// { ok: false, error: { path: "name", expected: "string", ... } }

// Modifiers
s.string().optional(); // string | undefined
s.string().nullable(); // string | null
s.string().default(""); // fills undefined with ""

// More shapes
s.array(s.number()); // number[]
s.tuple([s.string(), s.number()]); // [string, number]
s.union([s.string(), s.number()]); // string | number
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
