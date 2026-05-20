---
"@anyhow/core": minor
---

Added `option`, `random`, `string`, and `safe` modules:

- **option** — `Option<T>` discriminated union with `some`/`none` constructors and `map`, `andThen`, `unwrapOr`, `match`, `or`, `orElse`, `expect` combinators
- **random** — seeded PRNG (Mulberry32) with `int`, `float`, `bool`, `pick`, `shuffle`, and `weighted`; auto-seeded `random` singleton plus `createRandom(seed)` factory
- **string** — `camelCase`, `pascalCase`, `snakeCase`, `kebabCase`, `slugify`, `stripIndent`, and `template`
- **safe** — unified wrappers for unsafe operations: `safe.sync`, `safe.async`, `safe.json` (with optional validation), `safe.jsonStringify`, `safe.parseInt`, `safe.parseFloat`, `safe.decodeURIComponent`, `safe.env` (returns `Option`)

Enhanced `result` with `or`, `orElse`, and `expect` combinators. LRU cache now supports `entries()`, `keys()`, `values()`, and `for...of` iteration. Removed `trySync`, `tryAsync`, and `safeJsonParse` — migrated to the `safe` module. Full JSDoc coverage on all public APIs.
