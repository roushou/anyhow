# @anyhow/core

## 0.3.0

### Minor Changes

- d7635c6: ## "@anyhow/std": minor

## 0.2.0

### Minor Changes

- 472bd31: ---

  ## "@anyhow/std": minor

  **Renamed from `@anyhow/core` to `@anyhow/std`.** Single package now includes everything that was previously `@anyhow/core`, `@anyhow/schema`, and `@anyhow/fs`.

  - **Result & Option**: Class-based with Rust-style method chaining. `static.ts` combinators (`Result.from`, `Result.all`, `Option.transpose`), `Pipeline`, `Stepper`.
  - **Guard**: 24 type guards + `assertNever` with custom message.
  - **Async**: `debounce`/`throttle` with edge options, `retry` returning `Result` with `shouldRetry`/`onRetry`/`signal`, `concurrent` ordered toggle, `memoizeAsync` dedup and custom resolver.
  - **Schema**: `s.record()`, `s.date()`, `s.lazy()`, `s.coerce()`, `s.brand()`, `s.any()`, `s.undefined()`, `s.null()`, `s.instanceof()`, `.pick()`, `.omit()`, `.extend()`, union error aggregation.
  - **Data**: `Stack`, `Queue`, `Deque`, `PriorityQueue`, `BloomFilter`, `Trie`, `DisjointSet`.
  - **Collections**: `pick`, `omit`, `get`, `set`, `groupBy`, `keyBy`, `sortBy`, `uniqBy`, `deepMerge`, `deepClone`, `deepEqual`, `range`, `zipObject`, `compact`, `difference`, `intersection`, `union`.
  - **HTTP**: Builder-pattern client wrapping `fetch`, returning `Result`. Middleware, retry, timeout.
  - **Env**: Typed env var loading with `env.string()`, `env.number()`, `env.bool()`, `env.check()`, `.env` file loading.
  - **FS**: Safe filesystem operations returning `Result`. Browser stub.
  - **Iter**: `takeWhile`, `skipWhile`, `scan`, `cycle`, `repeat`, `intersperse`, `interleave`, `flatten`, `windows`, `sortBy`, `partition`, `minBy`, `maxBy`.
  - **String**: `escapeHtml`, `unescapeHtml`, `escapeRegExp`, `lines`, `words`, `capitalize`, `randomString`, `decapitalize`, `reverse`, `padStart`, `padEnd`, `wrap`, `byteLength`.
  - **Fmt**: `ordinal`, `compact`, `durationMs`, `durationHuman`, `percentage`, `scientific`, `engineering`, `relativeTimeFromNow`.
  - **Math**: `min`, `max`, `product`, `mode`, `variance`, `stddev`, `degToRad`, `radToDeg`, `isEven`, `isOdd`, `isInteger`, `isFloat`, `sign`, `inRange`, `gcd`, `lcm`, `isPrime`, `factorial`, `fibonacci`, `isPowerOfTwo`.
  - **Random**: `.sample()`, `.gaussian()`, `.uuid()`, `.randomHex()`, `.randomColor()`, `.exponential()`.
  - **Cache**: `LRU` with TTL. `memoizeAsync` (dedup + resolver), `memoizeSync`.
  - `safe` module merged into `Result`. `template()` returns `Result`.

  - BREAKING: `@anyhow/core` → `@anyhow/std`. `@anyhow/schema` and `@anyhow/fs` are now `@anyhow/std/schema` and `@anyhow/std/fs`. Result/Option are class-based. `retry()` returns `Result`. `template()` returns `Result`.

  ***

  ## "@anyhow/cli": minor

  Declarative CLI framework — define commands as plain objects with full type inference. `defineCommand`, `defineCli`, argument/option parsing, ANSI output helpers (`table`, `box`, `hr`, `bold`, `red`, `green`, etc.), zero dependencies.

## 0.1.0

### Minor Changes

- 68fd1f8: ---

  ## "@anyhow/std": minor

  **Renamed from `@anyhow/core` to `@anyhow/std`.** All imports change from `@anyhow/core/*` to `@anyhow/std/*`.

  **Result and Option are now class-based with method chaining.** `ok(5).map(v => v * 2).andThen(v => ok(v + 1)).unwrapOr(0)` replaces standalone functions. Static combinators live on `Result.from()`, `Result.all()`, `Option.okOr()`, etc.

  **New primitives: Pipeline and Stepper.** `Pipeline<TIn, TOut, E>` builds reusable, observable stage chains with error recovery. `Stepper<TStep, TData, E>` is a state machine for wizard/checkout flows.

  **retry returns `Result`** instead of throwing. Added `shouldRetry`, `onRetry`, and `signal` (AbortSignal) options.

  **debounce and throttle** gain `leading` and `trailing` options.

  **concurrent** gains `{ ordered: false }` for results-as-they-resolve.

  **memoizeAsync** now deduplicates concurrent calls and supports a custom `resolver`.

  **template** wraps its logic in `Result` instead of throwing on missing keys.

  **Guard** expanded: 19 new type guards (`isArray`, `isFunction`, `isDate`, `isError`, `isPromise`, `isMap`, `isSet`, ...). `assertNever` gains an optional message parameter.

  **Iter** expanded: `takeWhile`, `skipWhile`, `scan`, `cycle`, `sortBy`, `partition`.

  **String** expanded: `escapeHtml`, `unescapeHtml`, `escapeRegExp`, `lines`, `words`.

  **Fmt** expanded: `ordinal`, `compact`, `durationMs`, `percentage`, `relativeTimeFromNow`.

  **Math** expanded: `min`, `max`, `product`, `mode`, `variance`, `stddev`, `degToRad`, `radToDeg`, `isEven`, `isOdd`, `isInteger`, `isFloat`, `sign`, `inRange`, `gcd`, `lcm`, `isPrime`, `factorial`, `fibonacci`, `isPowerOfTwo`.

  **Random** expanded: `.sample()`, `.gaussian()`, `.uuid()`.

  **safe.json** now accepts `Result`-returning validators (Schema integration).

  **Root barrel removed.** Users import from subpaths (`@anyhow/std/result`, etc.).

  ***

  ## "@anyhow/schema": minor

  **New schemas:** `s.record()`, `s.date()`, `s.lazy()`, `s.coerce()`, `s.brand()`, `s.any()`, `s.undefined()`, `s.null()`, `s.instanceof()`.

  **New ObjectSchema methods:** `.pick()`, `.omit()`, `.extend()`.

  **Union errors now aggregate all branch failures** in `error.errors`.

  **Dependency renamed** from `@anyhow/core` to `@anyhow/std`.

  ***

  ## "@anyhow/fs": minor

  **Dependency renamed** from `@anyhow/core` to `@anyhow/std`.

## 0.2.5

### Patch Changes

- fc60fea: This is attempt 5 to fix the Release workflow

## 0.2.4

### Patch Changes

- 0d37a76: This is the 4th attempt to fix the Release workflow

## 0.2.3

### Patch Changes

- e581c09: This is another attempt to fix the release workflow

## 0.2.2

### Patch Changes

- 27aec87: This is another attempt to fix the Release workflow

## 0.2.1

### Patch Changes

- 7ab2063: This release an attempt to fix the publishing from the Github Action to NPM

## 0.2.0

### Minor Changes

- 7870cbd: Added `option`, `random`, `string`, and `safe` modules:

  - **option** — `Option<T>` discriminated union with `some`/`none` constructors and `map`, `andThen`, `unwrapOr`, `match`, `or`, `orElse`, `expect` combinators
  - **random** — seeded PRNG (Mulberry32) with `int`, `float`, `bool`, `pick`, `shuffle`, and `weighted`; auto-seeded `random` singleton plus `createRandom(seed)` factory
  - **string** — `camelCase`, `pascalCase`, `snakeCase`, `kebabCase`, `slugify`, `stripIndent`, and `template`
  - **safe** — unified wrappers for unsafe operations: `safe.sync`, `safe.async`, `safe.json` (with optional validation), `safe.jsonStringify`, `safe.parseInt`, `safe.parseFloat`, `safe.decodeURIComponent`, `safe.env` (returns `Option`)

  Enhanced `result` with `or`, `orElse`, and `expect` combinators. LRU cache now supports `entries()`, `keys()`, `values()`, and `for...of` iteration. Removed `trySync`, `tryAsync`, and `safeJsonParse` — migrated to the `safe` module. Full JSDoc coverage on all public APIs.

## 0.2.0

### Minor Changes

- fef0b0d: Added `option`, `random`, `string`, and `safe` modules. Added `or`, `orElse`, and `expect` combinators to `result`. LRU cache now supports `entries()`, `keys()`, `values()`, and `for...of` iteration. Full JSDoc coverage on all public APIs. Removed `trySync`, `tryAsync`, and `safeJsonParse` — migrated to the new `safe` module.
