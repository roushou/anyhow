# anyhow

[![CI](https://github.com/roushou/anyhow/actions/workflows/ci.yml/badge.svg)](https://github.com/roushou/anyhow/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@anyhow/core?color=blue)](https://www.npmjs.com/package/@anyhow/core)
[![license](https://img.shields.io/github/license/roushou/anyhow)](./LICENSE)

A batteries-included TypeScript utility toolkit featuring type-safe error handling, optional values, runtime guards, schema validation, async primitives, iterators, formatting, string utilities, math, random, and caching.

## Installation

```bash
bun add @anyhow/core
bun add @anyhow/schema
bun add @anyhow/fs
```

## Modules

### Result

A class-based discriminated union for type-safe error handling. Methods chain
like Rust — no standalone functions needed.

```ts
import { ok, err, Result, Pipeline, pipeline } from "@anyhow/core/result";
import type { Result as R } from "@anyhow/core/result";

function divide(a: number, b: number): R<number, string> {
  if (b === 0) return err("division by zero");
  return ok(a / b);
}

// ── Method chaining ──

divide(10, 2)
  .map((v) => v * 2) // Ok(10)
  .andThen((v) => divide(v, 5)) // Ok(1)
  .tap(console.log) // side effect, passes through
  .unwrapOr(0); // 1

// ── Pattern matching ──

const label = divide(10, 0).match(
  (v) => `Got ${v}`,
  (e) => `Error: ${e}`,
); // "Error: division by zero"

// ── Fallback chains ──

divide(10, 0)
  .or(ok(0)) // fall back to 0
  .orElse((e) => ok(`recovered: ${e}`)); // lazy fallback

// ── Transform the error ──

divide(10, 0)
  .mapErr((e) => new Error(e)) // wrap the error
  .expect("should have a value"); // throws with custom message

// ── Static combinators ──

Result.from(() => JSON.parse(text)); // wrap throwy sync
Result.fromAsync(() => fetch("/api")); // wrap throwy async
Result.fromNullable(env.PORT, new Error("…")); // nullable → Result

Result.all([ok(1), ok(2), ok(3)]); // Ok([1, 2, 3])
Result.partition([ok(1), err("a"), ok(2)]); // { ok: [1,2], err: ["a"] }
Result.any([err("a"), ok(42)]); // Ok(42)

// ── Pipeline (reusable, observable stages) ──

const orderPipe = pipeline<RawOrder>()
  .pipe("parse", parseOrder)
  .pipe("validate", validateOrder)
  .pipeWithRecovery("save", saveOrder, (err, input) => ok(queueForRetry(input)));

orderPipe.run(rawOrder);
orderPipe.describe(); // ["parse", "validate", "save"]

// ── Stepper (state machine for wizards / checkouts) ──

import { Stepper } from "@anyhow/core/result";

const checkout = new Stepper<"cart" | "ship" | "pay", CartData, string>()
  .step("cart", validateCart)
  .step("ship", validateShipping)
  .after("cart", ["ship"])
  .after("ship", ["pay", "cart"]);

checkout.run("cart", initialData, ["ship", "pay"]);
checkout.nextSteps("cart"); // ["ship"]
```

### Option

A class-based discriminated union for optional values. `Some<T>` carries a value;
`None` represents absence. Methods chain like Rust.

```ts
import { some, none, Option } from "@anyhow/core/option";
import type { Option as O } from "@anyhow/core/option";

const opt = some(42);

// ── Method chaining ──

some(42)
  .map((v) => v * 2) // Some(84)
  .filter((v) => v > 0) // Some(84) (would be None if ≤ 0)
  .andThen((v) => some(v + 1)) // Some(85)
  .unwrapOr(0); // 85

// ── Fallback chains ──

none()
  .or(some(10)) // Some(10)
  .orElse(() => some(20)) // lazy fallback
  .match(
    (v) => `Got ${v}`,
    () => "Nothing",
  ); // "Got 10"

// ── Type-narrowing guards ──

const o: O<number> = some(42);
if (o.isSome()) {
  o.value; // number (narrowed)
}
if (o.isNone()) {
  // o is None here
}

// ── Zip ──

some("a").zip(some(1)); // Some(["a", 1])
some(2).zipWith(some(3), (a, b) => a * b); // Some(6)

// ── Flatten ──

some(some(5)).flatten(); // Some(5)
some(none()).flatten(); // None

// ── Static combinators ──

Option.fromNullable(maybeNull); // Some(value) or None
Option.okOr(some(5), "missing"); // Ok(5)
Option.transpose(some(ok(5))); // Ok(Some(5))
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

// Retry with exponential backoff, returns a Result
const result = await retry(() => fetch("/api").then((r) => r.json()), {
  attempts: 5,
  backoff: 200, // starts at 200ms, then 400ms, 800ms, 1600ms
});
if (result.ok) console.log(result.value);

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

`safe.sync` and `safe.async` delegate to {@link Result.from} and
{@link Result.fromAsync} — use either API.

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
// Map { "odd" => [1, 3, 5], "even" => [2, 4] }
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

### @anyhow/fs

Safe filesystem operations that return {@link Result} instead of throwing.
All functions auto-create parent directories as needed and never leave
you to guess which errors Node might throw.

```ts
import {
  readText,
  readJson,
  writeText,
  writeJson,
  ensureDir,
  remove,
  exists,
  tmpDir,
  glob,
  walk,
} from "@anyhow/fs";

// Read and write safely
const text = await readText("./file.txt");
if (text.ok) console.log(text.value);

const config = await readJson<AppConfig>("./config.json");
if (!config.ok) {
  console.error("Bad config:", config.error);
  process.exit(1);
}

await writeJson("./out/data.json", { name: "Alice" }, 2);

// Directory helpers
await ensureDir("./a/b/c"); // mkdir -p
await remove("./tmp"); // rm -rf
if (await exists("./file.txt")) {
} // fs.existsSync, but async

// Create a temp directory (caller cleans up)
const tmp = await tmpDir("build-");
if (tmp.ok) {
  await writeText(`${tmp.value}/out.txt`, "...");
  await remove(tmp.value);
}

// Glob matching
const files = await glob("src/**/*.ts");
if (files.ok) {
  for (const file of files.value) {
    console.log(file); // "src/a.ts", "src/lib/b.ts", ...
  }
}

// Lazy directory walking
for await (const entry of walk("./src")) {
  console.log(entry.path, entry.isDir ? "(dir)" : "(file)");
}
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
