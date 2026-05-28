# @anyhow/core

## 0.5.0

### Minor Changes

- f2a3d08: ---

  "@anyhow/std": minor
  "@anyhow/svelte": minor

  ***

  - **New `color` module** — `Color.fromHex`, `fromRgb`, `fromHsl` constructors; `toHex`, `toRgb`, `toRgbString`, `toHsl` converters; `lighten`, `darken`, `saturate`, `desaturate`, `mix`, `withAlpha` manipulation; `luminance` and `contrast` for WCAG 2.0 accessibility checks. Pure math, zero DOM dependencies.
  - **New `Result.zip` and `Result.zipWith`** — combine two independent results into a tuple or apply a function, short-circuiting on the first `Err`.
  - **Removed unnecessary type casts** from `Result` and `Option` implementations — cleaner internals, no API change.

  ### @anyhow/svelte

  #### Reactive primitives (46 total)

  **New in this release (20):**
  `createMousePosition`, `createWebSocket`, `createPageLeave`, `createGeolocation`, `createFullscreen`, `createReducedMotion`, `createTextSelection`, `createPreferredLanguages`, `createWakeLock`, `createNetworkInformation`, `createSpeechRecognition`, `createNotification`, `createPointerLock`, `createScreenOrientation`, `createBroadcastChannel`, `createStateMachine`, `createEventListener`, `createBattery`, `createMediaDevices`, `createPerformanceObserver`

  **Previously available (26):**
  `createToggle`, `createCycle`, `createPrevious`, `createResetable`, `createDebouncedState`, `createThrottledState`, `createStore`, `createMediaQuery`, `createQueryParams`, `createAsyncState`, `createUndoRedo`, `createOnline`, `createInterval`, `createTimeout`, `createScrollPosition`, `createBreakpoints`, `createCopyToClipboard`, `createActiveElement`, `createPolling`, `createWindowSize`, `createHash`, `createIdle`, `createRaf`, `createEventSource`, `createColorScheme`, `createVisibility`

  #### Svelte actions (21 total)

  **New in this release (17):**
  `createFocusTrap`, `createAutoFocus`, `createKeydown`, `createPortal`, `createSwipe`, `createLazyLoad`, `createMutationObserver`, `createHover`, `createFocus`, `createDraggable`, `createDismissible`, `createTextareaAutosize`, `createTooltip`, `createPaste`, `createCopy`, `createDropZone`, `createPreloadData`

  **Previously available (4):**
  `createClickOutside`, `createElementSize`, `createIntersectionObserver`, `createLongPress`

  #### Composables

  - **`createForm`** — unified form builder with per-field reactive state (value, error, touched, dirty), client-side validation on blur/change/submit, and optional SvelteKit `use:enhance` integration via `onSubmit`. **Replaces** `createFormAction` (removed).
  - **`createViewTransition`** — reactive SvelteKit `onNavigate` wrapper with navigation type, source/destination URLs, and in-progress flag. Dependency-injected for tree-shakeability.
  - **`createSearchParams`** — typed URL search params with per-param parse/serialize coercion. Supports numbers, booleans, arrays, and custom types. Syncs to `window.location` via `history.replaceState`.
  - **`createPagination`** — reactive pagination state with prev/next, page clamping, and total pages.
  - **`createFilteredList`** — reactive search + sort over a list with configurable search fields.
  - **`createInfiniteScroll`** — page-based async loading with sentinel action for IntersectionObserver-based trigger.
  - **`safeLoad`** / **`safeActions`** — error-boundary wrappers for SvelteKit load functions and form actions.

  #### Internal

  - **`listen()` utility** — internal typed event listener helper returning `{ destroy() }`. Used by `createEventListener` and all actions. Refactored 19 primitives and 8 actions to use it instead of hand-rolled `addEventListener`/`removeEventListener` pairs.

  #### Fixes

  - `createStateMachine` is now exported from the root `@anyhow/svelte` barrel (was only available via `@anyhow/svelte/primitives`).
  - Removed stale `createPersistedState` declaration from type definitions (was renamed to `createStore`).

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
