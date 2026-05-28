# @anyhow/std

A **zero-dependency, TypeScript-first utility toolkit** — 31 tree-shakeable modules covering error handling, validation, async primitives, data transformation, and more.

Every function returns `Result` instead of throwing. Import only what you use via subpath exports.

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
  .map((v) => v * 2)
  .unwrapOr(0); // → 10

import { some, none } from "@anyhow/std/option";

some(42)
  .filter((v) => v > 0)
  .unwrapOr(0); // → 42
```

## Modules

Each module is independently importable via subpath exports:

### Core types

- [**result**](https://github.com/roushou/anyhow#result) — `Result<T, E>` with method chaining and static combinators
- [**option**](https://github.com/roushou/anyhow#option) — `Option<T>` for nullable values
- [**brand**](https://github.com/roushou/anyhow#brand) — Compile-time branded types for domain modeling
- [**pipe**](https://github.com/roushou/anyhow#pipe) — Function composition (`pipe`, `compose`, `flow`)

### Validation

- [**guard**](https://github.com/roushou/anyhow#guard) — Runtime type guards and assertions
- [**schema**](https://github.com/roushou/anyhow#schema) — Runtime schema validation returning `Result`

### Async & concurrency

- [**async**](https://github.com/roushou/anyhow#async) — `sleep`, `debounce`, `throttle`, `retry`, `concurrent`, `memoizeAsync`, `RateLimiter`, `Semaphore`
- [**cache**](https://github.com/roushou/anyhow#cache) — LRU cache with TTL and sync memoization
- [**event**](https://github.com/roushou/anyhow#event) — Typed event emitters and signals
- [**channel**](https://github.com/roushou/anyhow#channel) — CSP-style async channels with `select()`
- [**mutex**](https://github.com/roushou/anyhow#mutex) — `Mutex<T>` and `RwLock<T>` async locks
- [**state**](https://github.com/roushou/anyhow#state) — Finite state machine with guards and lifecycle hooks

### Data transformation

- [**iter**](https://github.com/roushou/anyhow#iter) — Lazy iterator combinators
- [**math**](https://github.com/roushou/anyhow#math) — Interpolation, statistics, number theory
- [**random**](https://github.com/roushou/anyhow#random) — Seeded PRNG with shuffle, pick, gaussian, uuid
- [**string**](https://github.com/roushou/anyhow#string) — Case conversion, slugify, template, HTML escaping
- [**fmt**](https://github.com/roushou/anyhow#fmt) — Human-readable formatting (strings, numbers, dates, units)
- [**date**](https://github.com/roushou/anyhow#date) — Date arithmetic, comparison, boundaries
- [**bytes**](https://github.com/roushou/anyhow#bytes) — Hex, Base64, and UTF-8 encoding/decoding
- [**encoding**](https://github.com/roushou/anyhow#encoding) — Safe Hex, Base64, Base32, Base58 encode/decode returning `Result`
- [**codec**](https://github.com/roushou/anyhow#codec) — Codec framework for JSON, CSV, FormData, Base64, and custom formats
- [**text**](https://github.com/roushou/anyhow#text) — Edit distance, fuzzy matching, diffs

### Data structures

- [**collections**](https://github.com/roushou/anyhow#collections) — Object/array helpers, deep merge, deep equal
- [**struct**](https://github.com/roushou/anyhow#struct) — Stack, Queue, Deque, RingBuffer, TreeNode, BloomFilter, Trie, DisjointSet

### Platform & I/O

- [**fs**](https://github.com/roushou/anyhow#fs) — Safe filesystem operations returning `Result` (browser-aware)
- [**env**](https://github.com/roushou/anyhow#env) — Type-safe environment variable access with `.check()`, `.prefix()`, and `.loadFile()`
- [**http**](https://github.com/roushou/anyhow#http) — Result-based HTTP client with middleware and retries
- [**term**](https://github.com/roushou/anyhow#term) — ANSI styling, spinners, progress bars, hyperlinks
- [**semver**](https://github.com/roushou/anyhow#semver) — Semantic version parsing, comparison, and bumping
- [**log**](https://github.com/roushou/anyhow#log) — Structured scoped logging with pluggable formatters and sinks
- [**config**](https://github.com/roushou/anyhow#config) — Multi-source config loading with schema validation

See the [main README](https://github.com/roushou/anyhow) for full documentation and examples.
