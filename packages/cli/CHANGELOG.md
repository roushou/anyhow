# @anyhow/cli

## 0.4.1

### Patch Changes

- Updated dependencies [f2a3d08]
  - @anyhow/std@0.5.0

## 0.4.0

### Minor Changes

- 55ce3ef: ---

  "@anyhow/std": minor
  "@anyhow/cli": patch
  "@anyhow/svelte": minor

  ***

  - **brand** — Compile-time branded types. `brand()`, `Brand<T, B>`, `Unbrand<T>`, `BrandOf<T>`.
  - **pipe** — Function composition. `pipe()`, `compose()`, `flow()` with overloaded arity.
  - **log** — Structured scoped logger. `Logger` with child scopes, `prettyFormatter`, `memorySink`, `jsonFormatter`, `consoleSink`.
  - **text** — Edit distance, fuzzy matching, diffs. `levenshtein()`, `fuzzyMatch()`, `fuzzyFilter()`, `diffLines()`, `diffWords()`.
  - **encoding** — Safe encode/decode returning `Result`. Hex, Base64, Base32 (Crockford), Base58. `toHex()`, `fromHex()`, `toBase58()`, etc.
  - **event** — Typed pub/sub. `EventEmitter<T>`, `createSignal()`.
  - **config** — Multi-source config loading. `Config.load()` with `Config.file()`, `Config.env()`, `Config.args()` sources and schema validation.
  - **codec** — Codec framework. `Codec<T>` with `json`, `csv`, `csvCodec()`, `base64`, `formData`, `text`, plus `Codec.from()` and `Codec.pipeline()`.

  - **Backoff strategies** — `Backoff.constant()`, `Backoff.linear()`, `Backoff.exponential()`, `Backoff.exponentialWithJitter()`, `Backoff.custom()`.
  - **timeout()** — Wrap any promise with a deadline, returns `Result`.
  - **Deferred** — Externally resolvable promise. `new Deferred<T>()`.
  - **RateLimiter** — Token-bucket rate limiter. `acquire()`, `tryAcquire()`.
  - **debounce/throttle** — Now return objects with `.flush()` and `.cancel()`.

  - **`data` renamed to `struct`** — Import path changed from `@anyhow/std/data` to `@anyhow/std/struct`. Exports unchanged.
  - **Removed thin wrappers** that duplicated native APIs (`isArray`, `isNull`, `isUndefined`, `isBoolean`, `isNumber`, `isString`, `isFunction`, `isSymbol`, `isBigInt` from `guard`; `deepClone` from `collections`).

  - Guarded `process` access in `config/args` and `term/spinner` for browser compatibility.
  - Moved misplaced `memoize.test.ts` from `cache/` to `async/`.
  - `codec/base64` now delegates to `encoding/safe` instead of duplicating logic.

  - README: Added Design Principles, Quick Reference table, and 10 previously-undocumented module sections.
  - package READMEs: Rewrote `@anyhow/std` index with 28 categorized modules. Improved `@anyhow/cli` example.
  - package.json: Added `description` field to all three packages.
  - JSDoc: Completed missing `@example`, `@typeParam`, `@returns`, and `@param` blocks on 38 public exports across 10 files.

  ***

  First release of `@anyhow/svelte` — SvelteKit 5 reactive utilities built on runes.

  `createToggle`, `createCycle`, `createPrevious`, `createResetable`, `createDebouncedState`, `createThrottledState`, `createStore`, `createMediaQuery`, `createQueryParams`, `createAsyncState`, `createUndoRedo`, `createOnline`, `createInterval`, `createTimeout`, `createScrollPosition`, `createBreakpoints`, `createCopyToClipboard`, `createActiveElement`, `createPolling`, `createWindowSize`, `createHash`, `createIdle`, `createRaf`, `createEventSource`, `createColorScheme`, `createVisibility`, `isBrowser`.

  `createClickOutside`, `createElementSize`, `createIntersectionObserver`, `createLongPress`.

  `createFormAction` — four progressive tiers from bare-bones to full `@anyhow/std/schema` + `Result` integration.

  `safeLoad`, `safeActions` — error-boundary wrappers for SvelteKit load functions and form actions.

  ***

  - Fixed "clilication" → "application" typos in JSDoc.
  - Improved README example and added package.json description.

### Patch Changes

- Updated dependencies [55ce3ef]
  - @anyhow/std@0.4.0

## 0.3.0

### Minor Changes

- d7635c6: ## "@anyhow/std": minor

### Patch Changes

- Updated dependencies [d7635c6]
  - @anyhow/std@0.3.0

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

### Patch Changes

- Updated dependencies [472bd31]
  - @anyhow/std@0.2.0
