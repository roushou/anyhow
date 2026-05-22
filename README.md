# anyhow

[![CI](https://github.com/roushou/anyhow/actions/workflows/ci.yml/badge.svg)](https://github.com/roushou/anyhow/actions/workflows/ci.yml)
![npm](https://img.shields.io/npm/v/@anyhow/std?color=blue)](https://www.npmjs.com/package/@anyhow/std)
[![license](https://img.shields.io/github/license/roushou/anyhow)](./LICENSE)

A batteries-included TypeScript utility toolkit featuring type-safe error handling, optional values, runtime guards, schema validation, async primitives, iterators, formatting, string utilities, math, random, and caching.

## Installation

```bash
bun add @anyhow/std
bun add @anyhow/cli
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

### Async

Primitives for timing, retries, concurrency, and memoization.

```ts
import { sleep, debounce, throttle, retry, concurrent, memoizeAsync } from "@anyhow/std/async";

// Debounce rapid calls (fire immediately on first call, then debounce)
const onChange = debounce((query: string) => search(query), 300, { leading: true });

// Throttle to at most one call per interval (fire trailing call at end)
const onScroll = throttle(() => updatePosition(), 100, { trailing: true });

// Retry with exponential backoff, returns a Result
const result = await retry(() => fetch("/api").then((r) => r.json()), {
  attempts: 5,
  backoff: 200, // starts at 200ms, then 400ms, 800ms, 1600ms
  shouldRetry: (e) => e instanceof TypeError || (e as any).status === 429, // only retry certain errors
  onRetry: (e, i) => console.warn(`Attempt ${i} failed:`, e),
  signal: AbortSignal.timeout(10_000), // give up after 10s total
});
if (result.ok) console.log(result.value);

// Run promises with a concurrency limit
const results = await concurrent(
  [fn1, fn2, fn3, fn4, fn5],
  2, // only 2 at a time
  { ordered: false }, // results in completion order
);

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
  lines,
  words,
  capitalize,
  randomString,
  decapitalize,
  reverse,
  padStart,
  padEnd,
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

// Split into lines or words
lines("a\nb\nc"); // ["a", "b", "c"]
words("hello  world"); // ["hello", "world"]

// Case manipulation
capitalize("hello"); // "Hello"
decapitalize("Hello"); // "hello"

// Padding and wrapping
padStart("42", 5, "0"); // "00042"
padEnd("42", 5, "0"); // "42000"
wrap("hello world", 5); // ["hello", "world"]

// Other utilities
reverse("hello"); // "olleh"
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
  isEven,
  isOdd,
  isInteger,
  isFloat,
  sign,
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
isEven(4); // true
isOdd(3); // true
isInteger(5.0); // true
isFloat(3.14); // true
sign(-5); // -1
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

Runtime schema validation that returns `Result<T, ValidationError>`. Composes with `@anyhow/std/result` and `@anyhow/std/safe`.

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
