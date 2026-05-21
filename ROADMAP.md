# anyhow — Roadmap & Analysis

A comprehensive analysis of the anyhow toolkit, cataloging bugs, missing primitives,
new abstractions, and packages to build. The goal is to become the ultimate
TypeScript utility toolkit with support for Node.js and Bun.

---

## 🔴 Bugs & Inconsistencies

### 1. ~~Option/Result naming collision in barrel~~ — FIXED

~~Both `result` and `option` exported identically-named functions (`map`, `andThen`,
`unwrapOr`, `match`, `or`, `orElse`, `expect`). The barrel re-exported option's
functions with renames, and some option combinators were silently shadowed.~~

**Fix**: Removed the root barrel file. Users import from subpaths (`@anyhow/std/result`,
`@anyhow/std/option`). Added `Result` and `Option` namespace objects for
collision-free access when both are used in the same file.

### 2. `groupBy` README example is wrong — FIXED

The README showed `groupBy` returning `{ odd: [1,3,5], even: [2,4] }` (a plain object),
but the implementation returns a `Map<K, T[]>`. The example now shows `Map` output.

### 3. ~~`retry` throws instead of returning `Result`~~ — FIXED

~~Inconsistent with the library's philosophy of type-safe error handling.~~

**Fix**: `retry` now returns `Result<T>` — `Ok(value)` on success or `Err(lastError)`
if all attempts are exhausted. Non-`Error` throws are wrapped.

### 4. `memoizeAsync` has no concurrent-call deduplication

Two simultaneous calls with the same key both execute the underlying function.
A proper memoizer should queue the second caller on the first's in-flight promise.

### 5. `concurrent` has no `ordered: false` option

Always preserves insertion order, but sometimes callers want results as they resolve
for lower latency.

### 6. Schema `union` error is unhelpful

When no branch matches, the error just says `"union"` — it should aggregate errors
from all branches.

### 7. `template` function throws on missing keys

Should conform to the Result pattern (or offer a safe variant).

### 8. `debounce` / `throttle` only support trailing-edge

Missing `leading` option for `debounce` and `trailing` option for `throttle`.

### 9. `safe.json` doesn't integrate with `@anyhow/std/schema`

Currently accepts a raw type guard, but should accept a `Schema` for richer validation
with proper error messages.

---

## 🟡 Missing Primitives — @anyhow/std

### Result combinators

Most Result combinators are now built as instance methods and static helpers:

| Function       | Status                                          | Rust equivalent |
| -------------- | ----------------------------------------------- | --------------- |
| `isOk`/`isErr` | Use `if (r.ok)` narrowing on class instances    | `is_ok()`       |
| `flatten`      | `.flatten()` instance method                    | `flatten()`     |
| `tap`          | `.tap(fn)` instance method                      | `inspect()`     |
| `tapErr`       | `.tapErr(fn)` instance method                   | `inspect_err()` |
| `all`          | `Result.all(results)` static method             | N/A             |
| `partition`    | `Result.partition(results)` static method       | N/A             |
| `any`          | `Result.any(results)` — first successful Result | N/A             |
| `from`         | `Result.from(fn)` — wrap throwy sync            | N/A             |
| `fromAsync`    | `Result.fromAsync(fn)` — wrap throwy async      | N/A             |
| `fromNullable` | `Result.fromNullable(v, error)`                 | N/A             |
| `Pipeline`     | `Pipeline` class + `pipeline()` factory         | N/A             |
| `Stepper`      | `Stepper` class for wizard/checkout flows       | N/A             |

### Option combinators

All Option combinators are now instance methods or static helpers:

| Function       | Status                                    | Rust equivalent |
| -------------- | ----------------------------------------- | --------------- |
| `unwrap`       | `.unwrap()` on Option instance            | `unwrap()`      |
| `flatten`      | `.flatten()`                              | `flatten()`     |
| `filter`       | `.filter(pred)`                           | `filter()`      |
| `zip`          | `.zip(other)`                             | `zip()`         |
| `zipWith`      | `.zipWith(other, fn)`                     | `zip_with()`    |
| `okOr`         | `Option.okOr(opt, error)` static          | `ok_or()`       |
| `okOrElse`     | `Option.okOrElse(opt, fn)` static         | `ok_or_else()`  |
| `transpose`    | `Option.transpose(opt)` static            | `transpose()`   |
| `fromNullable` | `Option.fromNullable(v)` static           | `Option::from`  |
| `isSome`       | `.isSome()` type guard on Option instance | `is_some()`     |
| `isNone`       | `.isNone()` type guard on Option instance | `is_none()`     |

### Async primitives

| Function                | Purpose                                                      |
| ----------------------- | ------------------------------------------------------------ |
| `race`                  | Like `Promise.race` with Result awareness                    |
| `allSettled`            | Returns `Result<T[], AggregateError>`                        |
| `timeout`               | `timeout(promise, ms)` → rejects with TimeoutError or Result |
| `Deferred<T>`           | `{ promise: Promise<T>; resolve; reject }`                   |
| `Semaphore`             | Concurrency limiter for arbitrary async work                 |
| `Mutex`                 | Async mutual exclusion                                       |
| `debounce` + leading    | Fire immediately then debounce trailing calls                |
| `throttle` + trailing   | Fire last call after interval ends                           |
| `retry` + `shouldRetry` | `(error: unknown) => boolean` to skip certain errors         |
| `retry` + `onRetry`     | Callback `(error: unknown, attempt: number) => void`         |
| `retry` + `signal`      | AbortSignal support for cancellation                         |

### Guard primitives

Missing type guards for every JS primitive:

```ts
(isArray,
  isFunction,
  isPromise,
  isDate,
  isRegExp,
  isError,
  isSymbol,
  isBigInt,
  isMap,
  isSet,
  isWeakMap,
  isWeakSet,
  isNull,
  isUndefined,
  isNotNullish,
  isTruthy,
  isFalsy,
  isPrimitive,
  isIterable,
  isAsyncIterable,
  isGenerator);
```

Also missing: `assertDefined` returning the value (like an unwrap), `assertString`, `assertNumber` etc.

### String utilities

```ts
(capitalize,
  decapitalize,
  reverse,
  escapeHtml,
  unescapeHtml,
  escapeRegExp,
  byteLength,
  lines,
  words,
  chars,
  graphemes,
  padStart,
  padEnd,
  wrap,
  indent,
  toTitleCase,
  toSentenceCase,
  swapCase,
  randomString,
  truncateWords);
```

### Math additions

```ts
// Statistics
(variance, stddev, mode, min, max, percentile, product);

// Number theory
(factorial, gcd, lcm, isPrime, primesUpTo, fibonacci);

// Trigonometry
(degToRad, radToDeg);

// Misc
(sign, inRange, isEven, isOdd, isInteger, isFloat, isPowerOfTwo);
```

### Iter additions

```ts
// Lazy generators
cycle, repeat, intersperse, interleave, flatten (deep),
takeWhile, skipWhile, scan, windows (sliding window of size N)

// Terminal
minBy, maxBy, sortBy, partition, unzip,
toMap, toSet, toObject, join, frequencies
```

### Fmt additions

```ts
// Time
relativeTimeFromNow(date), timeAgo(date),
durationMs (compact: "1h 2m 3s"), durationHuman (long: "1 hour, 2 minutes"),
interval (start → end)

// Units
bitrate, throughput, percentage, ordinal (1st, 2nd, 3rd),
bits (kb, mbit, gbit — currently only bytes)

// Numbers
compact (1.2K, 3.4M), scientific, engineering notation
```

### Random additions

```ts
// Distributions
gaussian (Box-Muller), exponential, poisson, uniform

// Sampling
sample (without replacement), sampleSize

// Generators
uuid/v4, nanoid, randomHex, randomString, randomColor
```

### Cache additions

```ts
// TTL cache (simpler than LRU for pure TTL use)
// FIFO cache
// TLRU (Time-aware LRU)
// WeakRef-based cache for memory-sensitive workloads
// Lazy async value cache (populate on first await)
```

---

## 🟠 Schema Improvements — @anyhow/std/schema

### Missing base schemas

```ts
s.record(keySchema, valueSchema); // Record<K, V>
s.date(); // Date instances
s.bigint(); // BigInt
s.symbol(); // Symbol
s.undefined(); // explicit undefined
s.null(); // explicit null
s.any(); // passes everything
s.unknown(); // passes everything
s.never(); // fails everything
s.instanceof(Constructor); // instanceof check
s.lazy(() => Schema); // recursive schemas
s.coerce(baseSchema, fn); // pre-parse coercion (string → number)
s.effect(schema, fn); // side-effect on parse (logging, etc.)
s.promise(schema); // validates Promise<T>
s.brand(schema); // nominal branding
```

### Missing schema methods

```ts
s.object().pick(["a", "b"]); // keep only these keys
s.object().omit(["a", "b"]); // drop these keys
s.object().extend({ c: schema }); // add keys
s.object().merge(otherObject); // combine two object schemas
s.schema().describe("text"); // attach description metadata
s.schema().meta({ key: "val" }); // generic metadata
s.schema().toJsonSchema(); // export as JSON Schema
s.and([a, b]); // intersection — must satisfy both
s.not(schema); // negation — must NOT satisfy schema
s.or([a, b]); // alias for union
```

### Union improvements

Collect and expose **all** branch errors. Each branch error should be wrapped
in a `UnionError` listing every failure, rather than just `"union"`.

### Object schema path improvements

Nested error paths should use the key name as a prefix, not replace the
path entirely. Currently `joinPath` concatenates with `.` but the base path
from `parse` is always `""` for nested schemas.

---

## 🟢 New Packages to Build

### ~~`@anyhow/result-ext`~~ — BUILT-IN

~~Lightweight `chain()` wrappers.~~ Method chaining is now built into the
core `Result` and `Option` classes — no wrapper needed.

### `@anyhow/data` — Data Structures

```
Stack, Queue, Deque, PriorityQueue (binary heap),
Trie, BloomFilter, DisjointSet (Union-Find),
RingBuffer, SortedArray, BinarySearchTree,
Graph (adjacency list), DirectedGraph
```

### `@anyhow/collections` — Object & Array Utilities

```ts
deepMerge, deepClone, deepEqual, deepFreeze,
pick, omit, get (dot-path access), set (dot-path),
groupBy (object-returning), keyBy, sortBy, partition,
uniqBy, difference, intersection, union, xor,
range, zipObject, compact (remove falsy),
shuffle (unseeded)
```

### `@anyhow/cli` — CLI Toolkit

```ts
// Argument parsing
parseArgs, command, option, flag

// Output
spinner, progress, prompt, confirm, select,
table, box (bordered text), hr (horizontal rule)

// Terminal
colors (no deps, ANSI escapes), stripAnsi,
terminalSize, cursor (hide/show/move)
```

### `@anyhow/http` — Safe HTTP Client

```ts
// fetch wrapper returning Result
get, post, put, patch, delete,
request(config) with retry, timeout, interceptors,
middleware pipeline (auth, logging, rate-limit)
```

### `@anyhow/crypto` — Hashing & Security

```ts
hash (sha256, sha512 via Web Crypto / node:crypto),
hmac, randomBytes, randomUUID, nanoid,
base64, base64url, hex, base32 encode/decode,
constantTimeEqual (timing-safe comparison)
```

### `@anyhow/datetime` — Date/Time Utilities

```ts
add, subtract, difference, startOf, endOf,
isBefore, isAfter, isBetween, isLeapYear,
daysInMonth, weekOfYear, quarter,
format (lightweight), parse (ISO 8601),
now (number), today (Date at midnight UTC)
```

### `@anyhow/env` — Environment Configuration

```ts
// Typed env loading with schema validation
env.string("KEY"), env.number("PORT"),
env.bool("DEBUG"), env.enum(["a", "b"]),
env.url("ENDPOINT"), env.json("CONFIG"),
load({ schema }) → Result<T>
```

### `@anyhow/path` — Cross-platform Path Utilities

```ts
join, resolve, relative, dirname, basename, extname,
normalize, isAbsolute, parse, format, commonAncestor,
relativePath (from → to), withoutExt, withExt, parts
```

### `@anyhow/stream` — Stream Processing

```ts
// Async iterable transforms
map, filter, flatMap, take, skip, batch, throttle,
fromReadable, toWritable, pipe, through,
split (by newline / newline-delimited JSON)
```

### `@anyhow/sql` — SQL Template Tag

```ts
// Safe SQL with parameterized queries
sql`SELECT * FROM users WHERE id = ${userId}`;
// Returns { text: string; values: unknown[] }
```

---

## 🔵 Architecture & Design

### Type utilities module

```ts
// packages/core/src/types/
export type { Pretty, Prettify }       // flatten intersections
export type { DeepReadonly, DeepPartial, DeepRequired, DeepMutable }
export type { Path, PathValue }        // dot-notation path types
export type { Brand, Opaque }          // nominal typing
export type { MaybePromise<T> }
export type { Fn, AsyncFn, Predicate, Guard }
export type { Entries, Keys, Values }
export type { UnionToIntersection }
```

### `safe` namespace expansion

```ts
safe.boolean(text)           // "true"/"false" → Result<boolean>
safe.url(text)               // new URL() → Result<URL>
safe.date(text)              // Date.parse → Result<Date> (no NaN)
safe.regex(pattern, flags?)  // new RegExp() → Result<RegExp>
safe.promise(promise)        // Promise → Promise<Result<T>>
```

### LRU improvements

- `peek(key)` — get without refreshing position
- `resize(maxSize)` — change capacity at runtime
- `toArray()` — snapshot as `[K, V][]`
- Background expiration sweep (optional interval)

### `memoizeAsync` improvements

- `resolver?: (...args: A) => string` for custom key generation
- Concurrent call deduplication (store pending promises)
- `staleWhileRevalidate` option

### `assertNever` message parameter

Currently hardcodes the message. Allow: `assertNever(x, "Unexpected shape kind")`.

### `concurrent` ordered/unordered toggle

Add `{ ordered?: boolean }` option. When `ordered: false`, populate results
as promises resolve for lower latency.

---

## 🔴 Cross-cutting

### Testing gaps

- Property-based testing for `random`, `LRU`, `retry`, `sort`
- Fuzz testing for `safe.json`, `glob`
- `memoizeAsync` concurrent deduplication
- `duration` sub-millisecond, negative, very large
- `filesize` boundary thresholds (e.g. exactly 1000, 1024)
- `iter` with empty, infinite, one-element collections
- `debounce`/`throttle` with async functions

### Documentation

- Migration guide / comparison with other libraries (zod, neverthrow, lodash, fp-ts)
- "Common patterns" cookbook section in README
- Each module's complete API surface documented (currently only highlights)

### Developer experience

- `bun run watch` script for development
- `bun run bench` with benchmark suite
- Root-level `CHANGELOG.md` aggregating package changelogs
