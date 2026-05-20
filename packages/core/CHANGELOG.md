# @anyhow/core

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
