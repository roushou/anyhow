# @anyhow/svelte

## 0.2.0

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

### Patch Changes

- Updated dependencies [f2a3d08]
  - @anyhow/std@0.5.0

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
