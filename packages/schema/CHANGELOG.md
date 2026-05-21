# @anyhow/schema

## 0.2.0

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

### Patch Changes

- Updated dependencies [68fd1f8]
  - @anyhow/std@0.1.0

## 0.1.6

### Patch Changes

- fc60fea: This is attempt 5 to fix the Release workflow
- Updated dependencies [fc60fea]
  - @anyhow/core@0.2.5

## 0.1.5

### Patch Changes

- 0d37a76: This is the 4th attempt to fix the Release workflow
- Updated dependencies [0d37a76]
  - @anyhow/core@0.2.4

## 0.1.4

### Patch Changes

- e581c09: This is another attempt to fix the release workflow
- Updated dependencies [e581c09]
  - @anyhow/core@0.2.3

## 0.1.3

### Patch Changes

- 27aec87: This is another attempt to fix the Release workflow
- Updated dependencies [27aec87]
  - @anyhow/core@0.2.2

## 0.1.2

### Patch Changes

- 7ab2063: This release an attempt to fix the publishing from the Github Action to NPM
- Updated dependencies [7ab2063]
  - @anyhow/core@0.2.1

## 0.1.1

### Patch Changes

- Updated dependencies [7870cbd]
  - @anyhow/core@0.2.0

## 0.1.1

### Patch Changes

- Updated dependencies [fef0b0d]
  - @anyhow/core@0.2.0
