# @anyhow/std

A batteries-included TypeScript utility toolkit featuring type-safe error handling, optional values, runtime guards, async primitives, iterator combinators, formatting, string utilities, math, random, and caching — all with zero dependencies.

## Quick start

```bash
bun add @anyhow/std
```

```ts
import { ok, err } from "@anyhow/std/result";

function divide(a: number, b: number) {
  if (b === 0) return err("division by zero");
  return ok(a / b);
}

divide(10, 2)
  .map(v => v * 2)
  .unwrapOr(0); // 10

import { some, none } from "@anyhow/std/option";

some(42)
  .filter(v => v > 0)
  .unwrapOr(0); // 42
```

## Modules

Each module is independently importable via subpath exports:

- [**result**](https://github.com/roushou/anyhow#result) — `Result<T, E>` with method chaining and static combinators
- [**option**](https://github.com/roushou/anyhow#option) — `Option<T>` for nullable values
- [**guard**](https://github.com/roushou/anyhow#guard) — Runtime type guards and assertions
- [**async**](https://github.com/roushou/anyhow#async) — `sleep`, `debounce`, `throttle`, `retry`, `concurrent`, `memoizeAsync`
- [**safe**](https://github.com/roushou/anyhow#safe) — Wrap throwy operations in `Result`
- [**fmt**](https://github.com/roushou/anyhow#fmt) — Human-readable formatting (strings, numbers, dates, units)
- [**iter**](https://github.com/roushou/anyhow#iter) — Lazy iterator combinators
- [**math**](https://github.com/roushou/anyhow#math) — Interpolation, statistics, number theory
- [**cache**](https://github.com/roushou/anyhow#cache) — LRU cache with TTL and memoization
- [**string**](https://github.com/roushou/anyhow#string) — Case conversion, slugify, template, HTML escaping
- [**random**](https://github.com/roushou/anyhow#random) — Seeded PRNG with shuffle, pick, gaussian, uuid

See the [main README](https://github.com/roushou/anyhow) for full documentation and examples.
