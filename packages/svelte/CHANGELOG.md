# @anyhow/svelte

## 0.1.0

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
