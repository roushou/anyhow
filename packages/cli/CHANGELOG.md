# @anyhow/cli

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
