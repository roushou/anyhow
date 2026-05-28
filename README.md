# anyhow

[![CI](https://github.com/roushou/anyhow/actions/workflows/ci.yml/badge.svg)](https://github.com/roushou/anyhow/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@anyhow/std?color=blue)](https://www.npmjs.com/package/@anyhow/std)
[![license](https://img.shields.io/github/license/roushou/anyhow)](./LICENSE)

A **zero-dependency, TypeScript-first utility toolkit** — 28 tree-shakeable modules covering error handling, validation, async primitives, data transformation, terminal output, CLI framework, and Svelte 5 reactivity.

## Design Principles

- **Zero dependencies** — every function is implemented from scratch or uses only built-in APIs.
- **Result-based** — functions return `Result<T, E>` instead of throwing. Errors are values you handle, not surprises you catch.
- **Tree-shakeable** — each module is independently importable via subpath exports (`@anyhow/std/result`). Import only what you use.
- **Rust-inspired** — naming follows Rust's stdlib conventions (`Result`, `Option`, `ok`/`err`, `some`/`none`, `map`, `andThen`, `unwrapOr`, `match`).
- **Boring** — no magic, no implicit global state, no clever metaprogramming. Predictable code wins.

## Quick Reference

| Category            | Module      | Import                    | Key exports                                                                                                                          |
| ------------------- | ----------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Core types**      | Result      | `@anyhow/std/result`      | `ok`, `err`, `Result`, `Pipeline`, `Stepper`                                                                                         |
|                     | Option      | `@anyhow/std/option`      | `some`, `none`, `Option`                                                                                                             |
|                     | Brand       | `@anyhow/std/brand`       | `brand`, `Brand`, `Unbrand`, `BrandOf`                                                                                               |
|                     | Pipe        | `@anyhow/std/pipe`        | `pipe`, `compose`, `flow`                                                                                                            |
| **Validation**      | Guard       | `@anyhow/std/guard`       | `isString`, `isObject`, `hasProperty`, `assert`, `assertDefined`, `assertNever`                                                      |
|                     | Schema      | `@anyhow/std/schema`      | `s.string()`, `s.number()`, `s.object()`, `s.array()`, `s.union()`, `s.brand()`                                                      |
| **Async**           | Async       | `@anyhow/std/async`       | `sleep`, `debounce`, `throttle`, `retry`, `Backoff`, `concurrent`, `RateLimiter`, `Semaphore`, `timeout`, `memoizeAsync`, `Deferred` |
|                     | Cache       | `@anyhow/std/cache`       | `LRU`, `memoizeSync`                                                                                                                 |
|                     | Event       | `@anyhow/std/event`       | `EventEmitter`, `createSignal`                                                                                                       |
|                     | Channel     | `@anyhow/std/channel`     | `channel`, `select`                                                                                                                  |
|                     | Mutex       | `@anyhow/std/mutex`       | `mutex`, `Mutex`, `rwlock`, `RwLock`                                                                                                 |
| **Transformation**  | Iter        | `@anyhow/std/iter`        | `map`, `filter`, `flatMap`, `take`, `chunk`, `zip`, `groupBy`, `partition`                                                           |
|                     | Math        | `@anyhow/std/math`        | `clamp`, `lerp`, `roundTo`, `sum`, `average`, `median`, `gcd`, `lcm`, `isPrime`                                                      |
|                     | Random      | `@anyhow/std/random`      | `random.int()`, `random.shuffle()`, `random.uuid()`, `createRandom`                                                                  |
|                     | String      | `@anyhow/std/string`      | `camelCase`, `snakeCase`, `kebabCase`, `slugify`, `template`, `escapeHtml`                                                           |
|                     | Fmt         | `@anyhow/std/fmt`         | `truncate`, `filesize`, `duration`, `currency`, `number`, `date`, `relativeTime`                                                     |
|                     | Date        | `@anyhow/std/date`        | `addDays`, `differenceInDays`, `isToday`, `startOfDay`, `dateRange`, `clampDate`                                                     |
|                     | Bytes       | `@anyhow/std/bytes`       | `toHex`, `fromHex`, `toBase64`, `fromBase64`, `toUTF8`, `fromUTF8`                                                                   |
|                     | Encoding    | `@anyhow/std/encoding`    | `toHex`, `fromHex`, `toBase58`, `fromBase58`, `toBase32`, `ALPHABETS`                                                                |
|                     | Codec       | `@anyhow/std/codec`       | `json`, `csv`, `csvCodec`, `base64`, `Codec`, `formData`                                                                             |
|                     | Color       | `@anyhow/std/color`       | `Color.fromHex()`, `.fromRgb()`, `.fromHsl()`, `.lighten()`, `.darken()`, `.contrast()`                                              |
|                     | Text        | `@anyhow/std/text`        | `levenshtein`, `fuzzyMatch`, `fuzzyFilter`, `diffLines`, `diffWords`                                                                 |
| **Data structures** | Collections | `@anyhow/std/collections` | `keyBy`, `uniqBy`, `range`, `deepMerge`, `deepEqual`, `pick`, `omit`, `get`, `set`                                                   |
|                     | Struct      | `@anyhow/std/struct`      | `Stack`, `Queue`, `Deque`, `PriorityQueue`, `BloomFilter`, `Trie`, `DisjointSet, `RingBuffer`, `TreeNode`, `tree``                   |
| **Platform / I/O**  | FS          | `@anyhow/std/fs`          | `readText`, `readJson`, `writeText`, `writeJson`, `ensureDir`, `remove`, `exists`, `glob`, `walk`                                    |
|                     | Env         | `@anyhow/std/env`         | `env.string()`, `env.number()`, `env.bool()`, `env.url()`, `env.prefix()`, `env.check()`, `env.loadFile()`                           |
|                     | HTTP        | `@anyhow/std/http`        | `get`, `post`, `put`, `del`, `http.create()`, `HttpClient`, `RequestBuilder`                                                         |
|                     | Term        | `@anyhow/std/term`        | `style.red()`, `wordWrap`, `columns`, `progress`, `Spinner`, `link`                                                                  |
|                     | Semver      | `@anyhow/std/semver`      | `semver()`, `.satisfies()`, `.bump()`, `semver.sort()`, `semver.max()`                                                               |
|                     | Log         | `@anyhow/std/log`         | `Logger`, `prettyFormatter`, `memorySink`, `LogLevel`                                                                                |
|                     | Config      | `@anyhow/std/config`      | `Config.load()`, `Config.file()`, `Config.env()`, `Config.args()`                                                                    |
| **Frameworks**      | CLI         | `@anyhow/cli`             | `defineCommand`, `defineCli`                                                                                                         |
|                     | Svelte      | `@anyhow/svelte`          | `createToggle`, `createAsyncState`, `createFormAction`, `createPagination`, `safeLoad`, `createFocusTrap`, `createClickOutside`      |

## Installation

```bash
bun add @anyhow/std
bun add @anyhow/cli
bun add @anyhow/svelte
```

## Modules

### Result

A class-based discriminated union for type-safe error handling. Methods chain
like Rust — no standalone functions needed.

```ts
import { ok, err, Result, Pipeline, pipeline } from "@anyhow/std/result";
import type { Result as R } from "@anyhow/std/result";

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
Result.json('{"name":"Alice"}'); // safe JSON parse → Result
Result.jsonStringify({ name: "Alice" }, 2); // safe stringify
Result.parseInt("42"); // safe parseInt → Result
Result.parseFloat("3.14"); // safe parseFloat → Result
Result.decodeURIComponent("hello%20world"); // safe URI decode

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

import { Stepper } from "@anyhow/std/result";

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
import { some, none, Option } from "@anyhow/std/option";
import type { Option as O } from "@anyhow/std/option";

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
  isArray,
  isFunction,
  isDate,
  isRegExp,
  isError,
  isSymbol,
  isBigInt,
  isPromise,
  isMap,
  isSet,
  isNull,
  isUndefined,
  isNotNullish,
  isTruthy,
  isFalsy,
  isPrimitive,
  isIterable,
  isAsyncIterable,
  hasProperty,
  isArrayOf,
  assert,
  assertDefined,
  assertNever,
  invariant,
} from "@anyhow/std/guard";

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
      return assertNever(s, `Unhandled shape kind: ${(s as any).kind}`);
  }
}

// Invariant checks (strippable for production)
invariant(limit > 0, "limit must be positive");
```

### Brand

Compile-time nominal (branded) types for type-safe domain modeling. Zero runtime cost — brands are erased at compile time.

```ts
import { type Brand, type Unbrand, type BrandOf, brand } from "@anyhow/std/brand";

// Create distinct types from the same base type
type UserId = Brand<string, "UserId">;
type OrderId = Brand<string, "OrderId">;

const uid: UserId = brand("usr_1");
const oid: OrderId = brand("ord_1");
// uid === oid; // Type error — UserId !== OrderId

// Works with any base type
type Meters = Brand<number, "Meters">;
type Feet = Brand<number, "Feet">;

const m: Meters = brand(100);
const f: Feet = brand(328);

// Extract the underlying type
type Raw = Unbrand<UserId>; // string

// Extract the brand
type B = BrandOf<UserId>; // "UserId"
```

Branded types are used as a primitive by `@anyhow/std/schema` via `s.brand()`.

### Pipe

Function composition helpers for building clean pipelines.

```ts
import { pipe, compose, flow } from "@anyhow/std/pipe";

// Pipe a value through functions left-to-right
const result = pipe(
  5,
  (n) => n + 3,
  (n) => n * 2,
  (n) => `val: ${n}`,
);
// "val: 16"

// Compose functions right-to-left into a reusable function
const addBrackets = compose(
  (s: string) => `[${s}]`,
  (s: string) => s.toUpperCase(),
);
addBrackets("hello"); // "[HELLO]"

// Flow functions left-to-right into a reusable function
const process = flow(
  (s: string) => s.trim(),
  (s: string) => s.toLowerCase(),
  (s: string) => `[${s}]`,
);
process("  Hello  "); // "[hello]"
```

### Async

Primitives for timing, retries, concurrency, and memoization.

```ts
import {
  sleep,
  debounce,
  throttle,
  retry,
  Backoff,
  timeout,
  TimeoutError,
  Deferred,
  RateLimiter,
  Semaphore,
  concurrent,
  memoizeAsync,
} from "@anyhow/std/async";

// Debounce rapid calls (fire immediately on first call, then debounce)
const save = debounce(flushToDisk, 300, { leading: true });
save();
save.flush(); // force pending call immediately
save.cancel(); // cancel pending call

// Throttle to at most one call per interval (fire trailing call at end)
const onScroll = throttle(() => updatePosition(), 100, { trailing: true });
onScroll.flush(); // force pending trailing call immediately
onScroll.cancel(); // cancel pending trailing call

// Retry with configurable backoff, returns a Result
const result = await retry(() => fetch("/api").then((r) => r.json()), {
  attempts: 5,
  backoff: 200,
  shouldRetry: (e) => e instanceof TypeError || (e as any).status === 429,
  onRetry: (e, i) => console.warn(`Attempt ${i} failed:`, e),
  signal: AbortSignal.timeout(10_000),
});

// Full control with a BackoffStrategy
const user = await retry(() => fetchUser(id), {
  attempts: 5,
  backoff: Backoff.exponentialWithJitter({ initial: 100, max: 30_000 }),
  shouldRetry: (e) => e instanceof NetworkError,
  onRetry: (e, i) => log.warn({ attempt: i, error: e }),
});

// Available strategies
Backoff.constant(500);
Backoff.linear({ initial: 100, step: 200 });
Backoff.exponential({ initial: 100, max: 30_000 });
Backoff.exponentialWithJitter({ initial: 100, max: 30_000 });
Backoff.custom((attempt) => (attempt + 1) * 500);

// Run promises with a concurrency limit
const results = await concurrent(
  [fn1, fn2, fn3, fn4, fn5],
  2, // only 2 at a time
  { ordered: false }, // results in completion order
);

// Semaphore — flexible concurrency limit for any async work
const api = new Semaphore(5);
const pages = await Promise.all(
  urls.map((url) => api.acquire(() => fetch(url).then((r) => r.json()))),
);

// Rate limiter — token bucket, limits calls over time
const limiter = new RateLimiter({ limit: 100, window: 1000 }); // 100 calls/sec
await limiter.acquire(); // waits if bucket is empty
const result = limiter.tryAcquire(); // Result<void, Error> — doesn't wait

// Timeout — wrap any promise with a deadline
const data = await timeout(fetch("/api/slow"), 5_000); // Result<T, Error>
if (data.ok) console.log(data.value);

// Deferred — externally resolvable promise
const d = new Deferred<string>();
emitter.once("message", (msg) => d.resolve(msg));
const msg = await d.promise;

// Memoize an expensive async function with a custom key resolver
const memoized = memoizeAsync(fetchUser, {
  maxSize: 100,
  ttlMs: 60_000,
  resolver: (userId: string) => userId, // use userId as key directly
});
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
  escapeHtml,
  unescapeHtml,
  escapeRegExp,
  words,
  capitalize,
  randomString,
  decapitalize,
  wrap,
  byteLength,
} from "@anyhow/std/string";

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

// Simple template substitution (returns Result)
const r = template("Hello {{name}}!", { name: "Alice" });
if (r.ok) console.log(r.value); // "Hello Alice!"

// HTML escaping
escapeHtml("<div>hello & goodbye</div>"); // "&lt;div&gt;hello &amp; goodbye&lt;/div&gt;"
unescapeHtml("&lt;div&gt;hello&amp;goodbye&lt;/div&gt;"); // "<div>hello&goodbye</div>"

// Escape for regex
escapeRegExp("1 + 1 = 2?"); // "1 \\+ 1 = 2\\?"

// Words
words("hello  world"); // ["hello", "world"]

// Case manipulation
capitalize("hello"); // "Hello"
decapitalize("Hello"); // "hello"

// Wrapping
wrap("hello world", 5); // ["hello", "world"]

// Other utilities
byteLength("hello"); // 5
randomString(8); // "a3f1b2c0"
```

### Fmt

Human-readable formatting for strings, numbers, dates, and units.

```ts
import {
  truncate,
  pluralize,
  filesize,
  duration,
  durationMs,
  currency,
  number,
  date,
  relativeTime,
  relativeTimeFromNow,
  list,
  ordinal,
  compact,
  percentage,
  durationHuman,
  scientific,
  engineering,
} from "@anyhow/std/fmt";

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
relativeTimeFromNow(Date.now() - 60_000); // "1 minute ago"
list(["Alice", "Bob", "Carol"]); // "Alice, Bob, and Carol"

// More formatters
ordinal(3); // "3rd"
compact(1_234_567); // "1.2M"
percentage(0.857, 2); // "85.70%"
percentage(0.5); // "50%"
durationMs(450); // "450ms"
durationHuman(3_661_000); // "1 hour 1 minute 1 second"
scientific(1_234_567); // "1.234567e6"
engineering(1_234_567); // "1.234567M"
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
  takeWhile,
  skipWhile,
  scan,
  cycle,
  repeat,
  intersperse,
  interleave,
  flatten,
  windows,
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
  sortBy,
  partition,
  minBy,
  maxBy,
} from "@anyhow/std/iter";

map([1, 2, 3], (n) => n * 2); // [2, 4, 6]
filter([1, 2, 3, 4], (n) => n % 2 === 0); // [2, 4]
take([1, 2, 3, 4, 5], 3); // [1, 2, 3]
chunk([1, 2, 3, 4, 5], 2); // [[1, 2], [3, 4], [5]]
zip(["a", "b"], [1, 2]); // [["a", 1], ["b", 2]]
unique([1, 2, 2, 3, 3, 3]); // [1, 2, 3]
groupBy([1, 2, 3, 4, 5], (n) => (n % 2 === 0 ? "even" : "odd"));
// Map { "odd" => [1, 3, 5], "even" => [2, 4] }

// Conditional iteration
takeWhile([1, 2, 3, 4, 5], (n) => n < 4); // [1, 2, 3]
skipWhile([1, 2, 3, 4, 5], (n) => n < 3); // [3, 4, 5]

// Accumulating scan
scan([1, 2, 3], (acc, n) => acc + n, 0); // [1, 3, 6]

// Cycling
cycle(["a", "b"], 5); // ["a", "b", "a", "b", "a"]

// Repeating a value
repeat(42, 3); // [42, 42, 42]

// Interleaving
intersperse([1, 2, 3], 0); // [1, 0, 2, 0, 3]
interleave([1, 3], [2, 4]); // [1, 2, 3, 4]

// Flattening and windows
flatten([
  [1, 2],
  [3, 4],
]); // [1, 2, 3, 4]
windows([1, 2, 3, 4], 2); // [[1, 2], [2, 3], [3, 4]]

// Sorting
sortBy([3, 1, 4, 1, 5]); // [1, 1, 3, 4, 5]
sortBy(["cat", "elephant", "dog"], (s) => s.length); // ["cat", "dog", "elephant"]

// Partition and extremum
partition([1, 2, 3, 4], (n) => n % 2 === 0);
// { matching: [2, 4], nonMatching: [1, 3] }
minBy(["cat", "elephant", "dog"], (s) => s.length); // "cat"
maxBy(["cat", "elephant", "dog"], (s) => s.length); // "elephant"
```

### Math

Interpolation, statistics, and numeric utilities.

```ts
import {
  clamp,
  lerp,
  normalize,
  mapRange,
  roundTo,
  degToRad,
  radToDeg,
  sum,
  average,
  median,
  mode,
  variance,
  stddev,
  min,
  max,
  product,
  isFloat,
  inRange,
  gcd,
  lcm,
  isPrime,
  factorial,
  fibonacci,
  isPowerOfTwo,
} from "@anyhow/std/math";

// Interpolation & scaling
clamp(150, 0, 100); // 100
lerp(0, 100, 0.5); // 50
normalize(50, 0, 100); // 0.5
mapRange(50, 0, 100, 0, 1); // 0.5
roundTo(3.14159, 2); // 3.14
degToRad(180); // 3.14159…
radToDeg(Math.PI); // 180

// Statistics
sum([1, 2, 3, 4, 5]); // 15
average([1, 2, 3, 4, 5]); // 3
median([1, 5, 2, 4, 3]); // 3
mode([1, 2, 2, 3]); // 2
variance([1, 2, 3, 4, 5]); // 2.5
stddev([1, 2, 3, 4, 5]); // 1.581…
min([3, 1, 4, 1, 5]); // 1
max([3, 1, 4, 1, 5]); // 5
product([2, 3, 4]); // 24

// Number predicates
isFloat(3.14); // true
inRange(5, 0, 10); // true
inRange(5, 0, 10, "()"); // true (exclusive bounds)

// Number theory
gcd(12, 8); // 4
lcm(4, 6); // 12
isPrime(17); // true
factorial(5); // 120
fibonacci(7); // 13
isPowerOfTwo(64); // true
```

### Random

Seeded PRNG (Mulberry32) with shuffle, pick, weighted choice, and a drop-in auto-seeded singleton.

```ts
import { random, createRandom } from "@anyhow/std/random";

// Drop-in use (auto-seeded)
random.int(1, 6); // 4
random.float(0, 1); // 0.573…
random.bool(); // true
random.pick(["a", "b", "c"]); // "b"
random.randomHex(4); // "a3f1b2c0"
random.randomColor(); // "#a3f1b2"
random.exponential(); // 0.573…
random.shuffle([1, 2, 3]); // [3, 1, 2]
random.weighted(["a", "b"], [0.9, 0.1]); // "a" most of the time
random.gaussian(100, 15); // normally-distributed (mean 100, stddev 15)
random.uuid(); // "a3f1b2c0-1234-4abc-9def-0123456789ab"
random.sample([1, 2, 3, 4, 5], 3); // [3, 1, 5]

// Deterministic (same seed = same sequence)
const rng = createRandom(42);
rng.int(1, 10); // always the same for seed 42
```

### Cache

An LRU cache with optional TTL, and a sync memoization helper.

```ts
import { LRU, memoizeSync } from "@anyhow/std/cache";

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

### Event

Typed event emitters and lightweight signals for pub/sub patterns.

```ts
import { EventEmitter, createSignal } from "@anyhow/std/event";

// Typed event emitter
type AppEvents = { request: { method: string }; error: Error };
const emitter = new EventEmitter<AppEvents>();
emitter.on("request", ({ method }) => console.log(method));
await emitter.emit("request", { method: "GET" });

// Lightweight single-event pub/sub
const onLogout = createSignal<string>();
onLogout.subscribe((msg) => console.log(msg));
await onLogout.emit("session expired");
```

### Channel

CSP-style async channels for message-passing between concurrent tasks.
Supports buffered and unbuffered channels, non-blocking `trySend`/`tryRecv`,
and multi-channel `select`.

```ts
import { channel, select } from "@anyhow/std/channel";

// Unbuffered — send blocks until a receiver is ready
const ch = channel<string>();

// Producer
(async () => {
  await ch.send("hello");
  ch.close();
})();

// Consumer
while (true) {
  const msg = await ch.recv();
  if (msg.isNone()) break;
  console.log(msg.unwrap()); // "hello"
}

// Buffered channel — up to 10 items without blocking
const buf = channel<number>({ capacity: 10 });
buf.trySend(42); // true — accepted immediately

// Multi-channel select
const orders = channel<Order>({ capacity: 5 });
const cancels = channel<string>({ capacity: 5 });

const result = await select(orders, cancels);
if (result.index === 0) processOrder(result.value.unwrap());
else cancelOrder(result.value.unwrap());
```

### Mutex

Async mutual exclusion and readers-writer locks that guard access to values.
The type system prevents accessing the guarded value without acquiring the lock.
`Mutex<T>` for exclusive access; `RwLock<T>` for many-readers / one-writer.

```ts
import { mutex, rwlock } from "@anyhow/std/mutex";

// Mutex — serialises access to a shared counter
const counter = mutex(0);

await Promise.all(
  Array.from({ length: 100 }, async () => {
    const guard = await counter.lock();
    guard.value += 1;
    guard.unlock();
  }),
);

const final = await counter.lock();
console.log(final.value); // 100
final.unlock();

// RwLock — concurrent reads, exclusive writes
const cache = rwlock(new Map<string, User>());

// Many readers run concurrently
const reader = await cache.read();
const user = reader.value.get("alice");
reader.unlock();

// Only one writer at a time
const writer = await cache.write();
writer.value.set("alice", updatedUser);
writer.unlock();

// Non-blocking attempts
const maybeWriter = cache.tryWrite();
if (maybeWriter.isSome()) {
  maybeWriter.unwrap().value.set("key", value);
  maybeWriter.unwrap().unlock();
}
```

### Date

Date arithmetic, comparison, boundaries, and queries. Zero-dependency date math
that fills the gap between `new Date()` and `Intl` formatting (which lives in `@anyhow/std/fmt`).

```ts
import {
  addDays,
  subDays,
  addMonths,
  addYears,
  differenceInDays,
  differenceInMonths,
  isBefore,
  isAfter,
  isSameDay,
  isToday,
  isPast,
  isFuture,
  startOfDay,
  endOfDay,
  startOfWeek,
  startOfMonth,
  daysInMonth,
  isLeapYear,
  getQuarter,
  dateRange,
  clampDate,
  minDate,
  maxDate,
  fromUnix,
  toUnix,
} from "@anyhow/std/date";

// Arithmetic — always returns a new Date
const nextWeek = addDays(new Date(), 7);
const lastMonth = subMonths(new Date(), 1);

// Feb 29 + 1 year correctly clamps to Feb 28 on non-leap years
const nextBirthday = addYears(new Date("2024-02-29"), 1); // 2025-02-28

// Differences
const age = differenceInYears(new Date(), new Date("1990-05-15"));
const daysUntil = differenceInDays(new Date("2025-01-01"), new Date());

// Comparisons
isBefore(new Date("2024-01-01"), new Date("2024-06-15")); // true
isToday(someDate);
isPast(deadline);
isWeekend(new Date("2024-01-06")); // true (Saturday)
isLeapYear(new Date("2024-01-01")); // true

// Boundaries
startOfDay(new Date()); // today at 00:00:00.000
endOfMonth(new Date("2024-03-15")); // 2024-03-31T23:59:59.999
startOfWeek(new Date("2024-01-03")); // Monday Jan 1 (ISO week)

// Queries
daysInMonth(new Date("2024-02-01")); // 29 (leap year)
getQuarter(new Date("2024-07-01")); // 3
dayOfYear(new Date("2024-12-31")); // 366

// Ranges
for (const d of dateRange(new Date("2024-01-01"), new Date("2024-01-07"))) {
  console.log(d); // Jan 1, Jan 2, ..., Jan 7
}

// Clamping & min/max
const safe = clampDate(userDate, new Date("2024-01-01"), new Date("2024-12-31"));
const earliest = minDate([d1, d2, d3]);

// Unix timestamps
const ts = toUnix(new Date()); // seconds
const d = fromUnix(1704067200); // Date
```

### Bytes

Hex, Base64, and UTF-8 encoding/decoding. Zero dependencies, works everywhere
`TextEncoder`/`TextDecoder` are available (browser, Node, Bun, Deno).

```ts
import {
  toHex,
  fromHex,
  toBase64,
  fromBase64,
  toBase64Url,
  fromBase64Url,
  toUTF8,
  fromUTF8,
} from "@anyhow/std/bytes";

// Hex
toHex(new Uint8Array([0, 255, 16])); // "00ff10"
fromHex("00ff10"); // Uint8Array [0, 255, 16]
fromHex("0x00ff"); // 0x prefix is stripped

// Standard Base64 (with +/ and = padding)
toBase64(toUTF8("hello")); // "aGVsbG8="
fromBase64("aGVsbG8="); // Uint8Array [104, 101, ...]

// URL-safe Base64 (with -_ and no padding) — safe in URLs, JWTs, etc.
toBase64Url(new Uint8Array([255])); // "_w" (vs "/w==" in standard)
toBase64Url(crypto.getRandomValues(new Uint8Array(32))); // "dGhpcyBpc..."

// UTF-8
const bytes = toUTF8("Hello, 世界!"); // Uint8Array
fromUTF8(bytes); // "Hello, 世界!"

// All to* functions accept Uint8Array, ArrayBuffer, or ArrayBufferView
const hash = await crypto.subtle.digest("SHA-256", toUTF8("data"));
toHex(hash); // works with ArrayBuffer directly

// fromHex / fromBase64 / fromBase64Url throw on invalid input
fromHex("xyz"); // throws
```

### Term

ANSI styling, word wrapping, columns, progress bars, cursor controls, and
hyperlink helpers for terminal output. Used by `@anyhow/cli` internally.

```ts
import {
  style,
  stripAnsi,
  supportsColor,
  wordWrap,
  columns,
  progress,
  clearScreen,
  clearLine,
  cursorTo,
  cursorHide,
  cursorShow,
  link,
  Spinner,
  SPINNER_FRAMES,
} from "@anyhow/std/term";

// Chainable style builder
style.red("error"); // "\x1b[31merror\x1b[39m"
style.bold.red("critical"); // "\x1b[1;31mcritical\x1b[22;39m"
style.bgBlue.white("info"); // blue background, white text
style.rgb(255, 128, 0)("custom"); // 24-bit true color
style.hex("#ff8800")("custom"); // hex-based true color

// Save reusable styles
const err = style.bold.red;
const ok = style.green;

// Strip ANSI codes
stripAnsi("\x1b[31merror\x1b[39m"); // "error"

// Color support detection (respects NO_COLOR, FORCE_COLOR, TTY, CI)
if (supportsColor()) console.log(style.green("✓"));

// ANSI-aware word wrapping (preserves colors across line breaks)
wordWrap(style.red("long message"), 20);
wordWrap(style.red("long message"), 20, { indent: 2 });

// Columns like `ls` output
console.log(columns(["index.ts", "README.md", "pkg.json"], 40));

// Stateless progress bar
for (let i = 0; i <= 100; i++) {
  process.stdout.write(`\r${progress(i / 100, 30)}`);
  await sleep(50);
}
progress(0.5, 20, { left: "Loading", right: "50/100", style: "dot" });

// Cursor controls
process.stdout.write(clearScreen());
process.stdout.write(clearLine());

// OSC 8 hyperlinks (clickable in modern terminals)
console.log(link("View docs", "https://example.com"));

// Spinner with start/stop or run pattern
const spinner = new Spinner("Installing dependencies...");
spinner.start();
await doWork();
spinner.stop("✓ Installed");

// Or use run() to auto-stop (even on error)
const result = await spinner.run(() => fetchData());

// Custom frames and interval
const dots = new Spinner({ text: "Thinking", frames: SPINNER_FRAMES.dots, interval: 80 });
```

### Semver

SemVer parsing, comparison, range matching (caret, tilde, wildcards, operators),
and version bumping.

```ts
import { semver } from "@anyhow/std/semver";

const v = semver("1.2.3");
v.major; // 1
v.lt("2.0.0"); // true (accepts strings)
v.satisfies("^1.0.0"); // true
const next = v.bump("minor"); // new SemVerObj
next.toString(); // "1.3.0"
next.bump("patch").toString(); // "1.3.1" — chains

// Static helpers
semver.valid("1.2.3"); // true
semver.coerce("v1.2"); // SemVerObj("1.2.0")
semver.sort(["2.0.0", "1.0.0"]); // ["1.0.0", "2.0.0"]
semver.max(["1.0.0", "2.0.0"]); // "2.0.0"
semver.diff("1.0.0", "1.0.1"); // "patch"

// Low-level functional API still available
import { parse, compare, satisfies, bump } from "@anyhow/std/semver";
```

### FS

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
} from "@anyhow/std/fs";

// Read and write safely
const text = await readText("./file.txt");
if (text.ok) console.log(text.value);

const config = await readJson<CliConfig>("./config.json");
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

### Schema

Runtime schema validation that returns `Result<T, ValidationError>`. Composes with `@anyhow/std/result`.

```ts
import { s, type Infer } from "@anyhow/std/schema";

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
// → Ok({ name: "Alice", age: 30, tags: [] })

User.parse({ name: 42 });
// → Err({ path: "name", expected: "string", ... })

// Modifiers
s.string().optional(); // string | undefined
s.string().nullable(); // string | null
s.string().default(""); // fills undefined with ""

// More shapes
s.array(s.number()); // number[]
s.tuple([s.string(), s.number()]); // [string, number]
s.union([s.string(), s.number()]); // string | number
s.record(s.number()); // Record<string, number>
s.date(); // Date
s.lazy(() => s.number()); // recursive schemas
s.coerce(s.string(), (v) => String(v)); // coerce values
s.brand(s.number(), "USD"); // branded (nominal) types
s.any(); // any value (no validation)
s.undefined(); // undefined only
s.null(); // null only
s.instanceof(Date); // instanceof check

// Object methods
const Admin = User.extend({ role: s.string() }); // add fields
const Public = User.omit(["age"]); // remove fields
const Subset = User.pick(["name"]); // keep only these fields
```

### Collections

Immutable data utilities — object accessors, array helpers, and deep operations.

```ts
import { pick, omit, get, set, deepMerge, deepEqual } from "@anyhow/std/collections";
import {
  keyBy,
  uniqBy,
  range,
  compact,
  difference,
  intersection,
  union,
} from "@anyhow/std/collections";

// Object helpers
pick({ a: 1, b: 2, c: 3 }, ["a", "c"]); // { a: 1, c: 3 }
omit({ a: 1, b: 2, c: 3 }, ["b"]); // { a: 1, c: 3 }
get({ user: { name: "Alice" } }, "user.name"); // "Alice"

// Array helpers
keyBy(
  [
    { id: 1, name: "A" },
    { id: 2, name: "B" },
  ],
  "id",
);
// → { "1": { id: 1, name: "A" }, "2": { id: 2, name: "B" } }
uniqBy([{ id: 1 }, { id: 2 }, { id: 1 }], "id"); // [{ id: 1 }, { id: 2 }]
range(0, 5); // [0, 1, 2, 3, 4]
compact([0, 1, false, 2, null, 3]); // [1, 2, 3]
difference([1, 2, 3], [2, 4]); // [1, 3]
intersection([1, 2, 3], [2, 3, 4]); // [2, 3]
union([1, 2], [2, 3]); // [1, 2, 3]

// Deep operations
deepMerge({ a: { b: 1 } }, { a: { c: 2 } }); // { a: { b: 1, c: 2 } }
deepEqual({ a: [1, 2] }, { a: [1, 2] }); // true
```

### Struct

Classic data structures — stacks, queues, bloom filters, tries, and disjoint sets.

```ts
import {
  Stack,
  Queue,
  BloomFilter,
  Trie,
  DisjointSet,
  RingBuffer,
  TreeNode,
  tree,
} from "@anyhow/std/struct";

// Stack (LIFO)
const stack = new Stack<number>();
stack.push(1);
stack.push(2);
stack.pop(); // 2

// Bloom filter (probabilistic set)
const filter = new BloomFilter(1000, 0.01);
filter.add("hello");
filter.has("hello"); // true

// Trie (prefix tree) for autocomplete / search
const trie = new Trie<number>();
trie.insert("foo", 1);
trie.insert("bar", 2);
trie.startsWith("fo"); // [1]

// Disjoint set (union-find) for connectivity
const ds = new DisjointSet(5);
ds.union(0, 1);
ds.connected(0, 1); // true

// RingBuffer — fixed-capacity circular buffer (last-N tracking)
const ring = new RingBuffer<string>(100);
ring.push("event");
ring.toArray(); // oldest to newest

// TreeNode — generic n-ary tree with traversal
const t = tree("root", [tree("a"), tree("b", [tree("c")])]);
for (const node of t.dfs()) console.log(node.value);
const found = t.find((n) => n.value === "c"); // TreeNode | undefined
```

### Env

Type-safe environment variable access. Every function returns an `EnvVar` (a lazy `Result`) that you can chain with `.default()`, `.optional()`, or batch-validate with `.check()`.

```ts
import { env } from "@anyhow/std/env";

// Read with type coercion
const host = env.string("HOST").unwrapOr("localhost");
const port = env.number("PORT").default(3000);
const debug = env.bool("DEBUG").optional();
const url = env.url("API_ENDPOINT");
const env = env.enum("NODE_ENV", ["development", "production", "test"] as const);
const config = env.json<{ hosts: string[] }>("CLUSTER_CONFIG");

// Prefixed (scoped) access
const db = env.prefix("DB_");
db.string("HOST"); // reads DB_HOST
db.number("PORT"); // reads DB_PORT

// Bulk validate an entire config at once
const appConfig = env.check({
  host: env.string("HOST"),
  port: env.number("PORT").default(3000),
  debug: env.bool("DEBUG").optional(),
});
if (appConfig.ok) console.log(appConfig.value.host);

// .env file support
env.loadFile(".env");

// Security: mask sensitive keys when dumping
env.mask("API_KEY", "DB_PASSWORD");
env.dump(); // → { API_KEY: "***", DB_PASSWORD: "***" }
```

### HTTP

Result-based HTTP client with middleware, retries, and type-safe request building.

```ts
import { get, post, put, del, http, HttpClient } from "@anyhow/std/http";

// Quick one-shot requests (return Result)
const user = await get("/users/42").json<User>();
const created = await post("/users").json({ name: "Alice" }).json<User>();

// Reusable client with shared defaults
const api = http.create({
  baseUrl: "https://api.example.com",
  headers: { Authorization: "Bearer tok" },
  timeout: 10_000,
});

const user = await api.get("/users/42").json<User>();
const orders = await api.get("/orders").query({ limit: 50 }).json<Order[]>();

// Request builder with method chaining
const result = await api
  .post("/users")
  .json({ name: "Alice" })
  .header("X-Idempotency-Key", key)
  .signal(AbortSignal.timeout(5_000))
  .send();

if (result.ok) console.log(result.value);
```

### Log

Structured, scoped logging with pluggable formatters and sinks.

```ts
import { Logger, LogLevel, prettyFormatter, memorySink } from "@anyhow/std/log";

// Create a scoped logger
const log = new Logger("app", { level: LogLevel.Debug });
log.info("server started", { port: 3000 });

// Child loggers inherit scope
const db = log.child("db", { pool: "main" });
db.info("connected"); // scope: "app:db", context: { pool: "main" }
db.warn("slow query", { durationMs: 250 });
db.error("connection lost", new Error("timeout"));

// Pluggable formatters and sinks
log.setFormatter(prettyFormatter());
log.addSink(memorySink(100)); // keep last 100 entries
```

### Config

Multi-source configuration loading with schema validation. Load from files, environment variables, and CLI args — validate with `@anyhow/std/schema`.

```ts
import { Config } from "@anyhow/std/config";
import { s } from "@anyhow/std/schema";

const AppConfig = s.object({
  port: s.number().default(3000),
  database: s.object({ url: s.string() }),
  logLevel: s.enum(["debug", "info", "warn"]).default("info"),
});

const result = await Config.load(AppConfig, {
  sources: [
    Config.file("defaults.json"),
    Config.file("local.json", { optional: true }),
    Config.env("APP_"),
    Config.args(),
  ],
});
// Later sources override earlier ones
if (result.ok) console.log(result.value.port);
```

### Text

String distance metrics, fuzzy matching (fzf-style), and diff utilities.

```ts
import {
  levenshtein,
  levenshteinRatio,
  fuzzyMatch,
  fuzzyFilter,
  diffLines,
  diffWords,
} from "@anyhow/std/text";

// Edit distance
levenshtein("kitten", "sitting"); // 3
levenshteinRatio("kitten", "sitting"); // ~0.57

// fzf-style fuzzy matching
fuzzyMatch("ah", "anyhow"); // { score: ~0.55, matchedRanges: ... }
fuzzyFilter("res", ["src/result/result.ts", "src/async/retry.ts"]);
// → [{ item: "src/result/result.ts", score: 0.63 }, ...]

// Line and word diffs (longest common subsequence)
diffLines("hello\nworld", "hello\nWORLD\nfoo");
// → [{ type: "equal", value: "hello" },
//    { type: "delete", value: "world" },
//    { type: "insert", value: "WORLD" },
//    { type: "insert", value: "foo" }]
```

### Color

Parse, convert, manipulate, and analyze colors — pure math, no DOM.

```ts
import { Color } from "@anyhow/std/color";

// Constructors
const brand = Color.fromHex("#3b82f6");
const coral = Color.fromRgb(255, 127, 80);
const pastel = Color.fromHsl(217, 91, 80);

// Converters
brand.toHex(); // "#3b82f6"
brand.toRgb(); // { r: 59, g: 130, b: 246 }
brand.toRgbString(); // "rgb(59,130,246)"
brand.toHsl(); // { h: 217, s: 91, l: 60 }

// Manipulation (returns new Color — immutable)
brand.lighten(0.15); // 15% toward white
brand.darken(0.1); // 10% toward black
brand.saturate(0.3); // 30% more saturated
brand.desaturate(0.5); // 50% less saturated
brand.mix(coral, 0.5); // blend with another color
brand.withAlpha(0.5); // set opacity

// WCAG accessibility
brand.luminance(); // 0.18 — relative luminance
brand.contrast(Color.fromHex("#ffffff")); // 4.5 — contrast ratio
```

### Encoding

Safe encoding/decoding returning `Result` — Hex, Base64, Base32, and Base58. Throws nothing; all errors are values.

```ts
import { toHex, fromHex, toBase58, fromBase58, toBase32, ALPHABETS } from "@anyhow/std/encoding";

// Hex (safe, Result-returning)
fromHex("00ff10"); // → Ok(Uint8Array [0, 255, 16])
fromHex("zzz"); // → Err({ code: "invalid_format", message: ... })

// Base58 (Bitcoin-style, no ambiguous characters like 0/O/I/l)
toBase58(new Uint8Array([1, 2, 3])); // "Ldp"

// Base32 with Crockford alphabet (human-friendly)
toBase32(data, { alphabet: ALPHABETS.BASE32_CROCKFORD });
```

### Codec

A codec framework for encoding/decoding between formats. Built-in codecs for JSON, CSV, FormData, Base64, and text. Compose custom codecs with `Codec.from()`.

```ts
import { json, csv, csvCodec, base64, formData, Codec } from "@anyhow/std/codec";

// JSON codec
json.decode('{"port":3000}'); // → Ok({ port: 3000 })
json.encode({ port: 3000 }); // → '{"port":3000}'

// CSV with configurable delimiter
const tsv = csvCodec({ delimiter: "\t" });
tsv.decode("name\tage\nAlice\t30"); // → Ok([{ name: "Alice", age: "30" }])
csv.encode([{ name: "Alice", age: "30" }]); // → "name,age\nAlice,30"

// FormData codec
formData.decode(new FormData());

// Build custom codecs
const hex = Codec.from({
  encode: (buf: Uint8Array) => Buffer.from(buf).toString("hex"),
  decode: (str) => ok(Uint8Array.from(Buffer.from(str, "hex"))),
});
```

### Svelte

SvelteKit 5 reactive primitives, composables, and form-action utilities. Builds on
Svelte 5 runes (`$state`, `$derived`, `$effect`) with zero dependencies on
`@anyhow/std` — but composes seamlessly with `@anyhow/std/schema` and
`@anyhow/std/result` via structural typing.

```bash
bun add @anyhow/svelte
```

Tree-shakeable subpath imports:

```ts
import { createToggle, createAsyncState } from "@anyhow/svelte/primitives";
import { createFormAction, safeLoad, createPagination } from "@anyhow/svelte/composables";
import { createClickOutside, createFocusTrap } from "@anyhow/svelte/actions";
```

#### Reactive primitives

Standalone reactive state utilities — no imports from `@anyhow/std` needed.

```ts
import {
  createToggle,
  createCycle,
  createPrevious,
  createResetable,
  createDebouncedState,
  createThrottledState,
  createPersistedState,
  createStore,
  createMediaQuery,
  createQueryParams,
  createAsyncState,
  createUndoRedo,
  createOnline,
  createInterval,
  createScrollPosition,
  createBreakpoints,
  createCopyToClipboard,
  createTimeout,
  createActiveElement,
  createPolling,
  createWindowSize,
  createHash,
  createIdle,
  createRaf,
  createEventSource,
  createColorScheme,
  createVisibility,
  createMousePosition,
  createWebSocket,
  createPageLeave,
  createGeolocation,
  createFullscreen,
  createReducedMotion,
  createTextSelection,
  createPreferredLanguages,
  createWakeLock,
  createNetworkInformation,
  createSpeechRecognition,
  createNotification,
  createPointerLock,
  createScreenOrientation,
  createBroadcastChannel,
  isBrowser,
} from "@anyhow/svelte";

const open = createToggle(false);
// open.value, open.toggle(), open.on(), open.off()

const theme = createCycle(["light", "dark", "system"]);
// theme.value, theme.next(), theme.prev(), theme.reset()

let count = $state(0);
const prev = createPrevious(() => count);
// prev.current — tracks the previous value

const name = createResetable("Alice");
// name.value = "Bob"; name.reset() → "Alice"

const query = createDebouncedState("", 300);
// query.value = … — debounced writes

const pos = createThrottledState({ x: 0, y: 0 }, 16);
// pos.value = … — throttled writes

// Browser storage (localStorage or sessionStorage)
const theme = createStore({ key: "theme", initial: "light" });
// theme.value — synced to localStorage
const draft = createStore({ key: "draft", initial: "", storage: "session" });
// draft.value — synced to sessionStorage (cleared on tab close)

const isMobile = createMediaQuery("(max-width: 767px)");
// isMobile.current — reactive boolean

const params = createQueryParams({ page: "1", sort: "name" });
// params.value — synced to URL search params

if (isBrowser()) {
  // SSR-safe guard
}

// Async operations
const user = createAsyncState(async (id: string) => {
  const res = await fetch(`/api/users/${id}`);
  return res.json();
});
// user.execute("abc"), user.loading, user.data, user.error, user.reset()

// Undo/redo
const history = createUndoRedo("Hello");
// history.push("World"), history.undo(), history.redo()
// history.canUndo, history.canRedo

// Online status
const net = createOnline();
// net.online — reactive boolean

// Managed interval (auto-cleanup)
const poll = createInterval(() => fetch("/api/status"), 5000);
// poll.stop(), poll.start(), poll.running

// Scroll position
const scroll = createScrollPosition();
// scroll.x, scroll.y, scroll.isScrolling

// Responsive breakpoints
const bp = createBreakpoints({ sm: 640, md: 768, lg: 1024 });
// bp.current — "sm" | "md" | "lg" | undefined

// Clipboard
const clipboard = createCopyToClipboard();
// clipboard.copy("text"), clipboard.copied, clipboard.error, clipboard.reset()

// Managed timeout
const toast = createTimeout(() => (show = false), 3000);
// toast.start(), toast.cancel(), toast.running

// Focus tracking
const focus = createActiveElement();
// focus.element — the currently focused DOM element

// Async polling (no overlapping calls)
const poll = createPolling(() => fetch("/api/status").then((r) => r.json()), 5000);
// poll.start(), poll.stop(), poll.data, poll.error, poll.running

// Window size
const size = createWindowSize();
// size.width, size.height — reactive innerWidth/innerHeight

// URL hash (client-side routing, tab state)
const route = createHash();
// route.hash, route.hash = "settings" — reactive location.hash

// User idle detection
const idle = createIdle(60_000);
// idle.idle — true after 60s of inactivity

// Animation frame loop (auto-cleanup)
const loop = createRaf((time) => {
  angle = (time / 1000) % 360;
});
// loop.start(), loop.stop(), loop.running

// OS color scheme
const cs = createColorScheme();
// cs.scheme — "light" | "dark"

// Page visibility (tab switch detection)
const vis = createVisibility();
// vis.visible — false when tab is hidden
```

#### Svelte actions (`use:` directives)

```ts
import {
  createClickOutside,
  createFocusTrap,
  createAutoFocus,
  createKeydown,
  createPortal,
  createElementSize,
  createIntersectionObserver,
  createLazyLoad,
  createLongPress,
  createSwipe,
  createMutationObserver,
  createHover,
  createFocus,
  createDraggable,
} from "@anyhow/svelte";

// Click outside detection
// <div use:clickOutside={() => (open = false)}>…</div>

// Focus trap (accessibility for modals/dialogs)
// <div use:createFocusTrap role="dialog">…</div>

// Auto-focus on mount
// <input use:createAutoFocus placeholder="Search…" />

// Keyboard shortcuts
// <div use:createKeydown={{ Escape: () => (open = false), "Control+s": save }}>…</div>

// Portal (render element in document.body)
const portal = createPortal();
// <div use:portal.action>I'm in body</div>

// Reactive element dimensions
const size = createElementSize();
// <div use:size.action>{size.width} × {size.height}</div>

// Intersection observer (lazy loading, scroll-spy)
const obs = createIntersectionObserver({ threshold: 0.5 });
// <div use:obs.action>{#if obs.isIntersecting}Visible!{/if}</div>

// Lazy load (trigger callback on enter)
const lazy = createLazyLoad({ onEnter: () => load() });
// <div use:lazy.action>…</div>

// Swipe detection
// <div use:createSwipe={{ onSwipe: ({ direction }) => … }}>…</div>

// Mutation observer
const mut = createMutationObserver({ childList: true });
// <div use:mut.action>…</div>

// Hover state
const hover = createHover();
// <div use:hover.action>{hover.isHovering ? "👋" : "Hover"}</div>

// Focus state
const focus = createFocus();
// <input use:focus.action />

// Draggable
const drag = createDraggable();
// <div use:drag.action style="transform:translate({drag.x}px,{drag.y}px)">…</div>

// Long press (touch / mouse)
// <button use:longPress={{ duration: 800, handler: () => deleteItem() }}>Hold to delete</button>
```

#### Form actions

Four paths, escalating from bare-bones to full `@anyhow/std` `Result` integration:

```ts
import { createFormAction } from "@anyhow/svelte";

// Path A — simple action (no validation)
// Return type: FormActionSimple<T>
const form = createFormAction(async (fd) => {
  const name = fd.get("name");
  return await api.submit(name);
});
// <form method="POST" use:enhance={form.enhance}>
// {form.pending}, {form.data}, {form.error}

// Path B — inline validation
// Return type: FormActionWithValidation<T>
const form = createFormAction({
  validate: (fd) => {
    const email = fd.get("email");
    if (!email) return "Email required";
    return { email: String(email) };
  },
  action: async (data) => await api.login(data.email),
});
// {form.validationError}

// Path C — schema (any `.parse()` lib: Zod, Valibot, etc.)
// Return type: FormActionWithSchema<T>
const form = createFormAction({
  schema: zodSchema,
  action: async (data) => await api.login(data),
});
// {form.validationErrors} — structured errors

// Path D — schema + Result (first-party @anyhow/std integration)
// Return type: FormActionStateWithResult<T, E>
import { s } from "@anyhow/std/schema";
import { ok, err } from "@anyhow/std/result";

const loginSchema = s.object({ email: s.string(), password: s.string() });

const form = createFormAction({
  schema: loginSchema,
  action: async (data) => {
    const user = await api.login(data);
    return ok(user);
  },
});
// {#if form.result?.ok}
//   Welcome, {form.result.value.name}
// {:else if form.result}
//   Error: {form.result.error}
// {/if}
// form.validationErrors — ValidationError[] with .path, .message
```

#### Load / actions safety

```ts
import { safeLoad, safeActions } from "@anyhow/svelte";

// Catches errors in load functions and returns _loadError
export const load = safeLoad(async (event) => {
  const user = await db.user.findUnique({ where: { id: event.params.id } });
  if (!user) throw new Error("Not found");
  return { user };
});
// data._loadError available in +page.svelte

// Catches errors in form actions and returns _actionError
export const actions = safeActions({
  default: async (event) => {
    // throws are caught → form._actionError
  },
});
```

#### Data composables

```ts
import { createPagination, createFilteredList, createInfiniteScroll } from "@anyhow/svelte";

// Pagination state
const pag = createPagination({ total: 250, perPage: 20 });
// pag.page, pag.totalPages, pag.prev(), pag.next(), pag.canPrev, pag.canNext

// Filtered & sorted list
const list = createFilteredList(allUsers, { searchFields: ["name", "email"], sortKey: "name" });
// list.search, list.filtered, list.setSearch("ali"), list.setSort("email")

// Infinite scroll (loads pages via IntersectionObserver sentinel)
const feed = createInfiniteScroll(async (page) =>
  fetch(`/api/posts?page=${page}`).then((r) => r.json()),
);
// feed.items, feed.loading, feed.hasMore, feed.loadMore(), <div use:feed.sentinel />
```

### CLI

Declarative CLI framework — define commands as plain objects with full type inference.

```bash
bun add @anyhow/cli
```

```ts
import { defineCommand, defineCli } from "@anyhow/cli";

const deploy = defineCommand({
  name: "deploy",
  description: "Deploy to environment",
  arguments: { env: { type: "string", required: true, description: "Target environment" } },
  options: { force: { type: "boolean", short: "f", description: "Skip confirmation" } },
  async action({ args, options }) {
    // args.env is string, options.force is boolean
    console.log(`Deploying to ${args.env}`);
  },
});

const cli = defineCli({
  name: "mycli",
  description: "A sample CLI",
  commands: [deploy],
});

await cli.run(process.argv.slice(2));
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
