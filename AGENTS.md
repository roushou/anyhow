# AGENTS.md

Guidance for AI coding agents (and humans) contributing to anyhow.

## Philosophy

anyhow is a **zero-dependency, TypeScript-first utility toolkit**. Every function should be:

- **Obvious** — a developer (or AI) reading just the signature and JSDoc should understand it completely.
- **Tree-shakeable** — each module is independently importable via subpath exports (`@anyhow/std/result`).
- **Boring** — no magic, no clever metaprogramming, no implicit global state. Predictable code wins.
- **Stable** — add, don't rename. Deprecate before removing.
- **Well-tested** — every public API has co-located `*.test.ts` files.

## Tech stack

| Concern                   | Tool                                          |
| ------------------------- | --------------------------------------------- |
| Runtime / package manager | [Bun](https://bun.sh) (`1.3.x`)               |
| Language                  | TypeScript `^6` (strict mode)                 |
| Linting                   | oxlint                                        |
| Formatting                | oxfmt                                         |
| Testing                   | `bun test` (built-in)                         |
| Testing (Svelte)          | `vitest` + `@testing-library/svelte`          |
| Build                     | `bun build` (ESM + CJS) via custom `build.ts` |
| CI                        | GitHub Actions (`oven-sh/setup-bun@v2`)       |

## Project structure

```
anyhow/
├── AGENTS.md              # This file
├── README.md              # Public-facing docs with usage examples
├── package.json           # Root workspace config
├── tsconfig.base.json     # Shared TypeScript settings
├── .oxfmtrc.json          # Formatter config
├── oxlintrc.json          # Linter config
└── packages/
    ├── std/               # @anyhow/std
    │   ├── package.json   # Subpath exports map
    │   ├── build.ts       # Dual ESM/CJS build script
    │   └── src/
    │       ├── result/    # Result<T, E> type + methods + Pipeline + Stepper
    │       ├── option/    # Option<T> type + methods + static combinators
    │       ├── guard/     # Runtime type guards + assertions
    │       ├── async/     # sleep, debounce, throttle, retry, concurrent, memoize
    │       ├── fmt/       # Human-readable formatting (strings, units, Intl wrappers)
    │       ├── iter/      # Lazy iterator combinators over Iterable
    │       ├── math/      # Interpolation + statistics + number theory
    │       ├── cache/     # LRU cache + memoization helpers
    │       ├── string/    # Case conversion, slugify, template, HTML escaping
    │       ├── random/    # Seeded PRNG with shuffle, pick, gaussian, uuid
    │       ├── schema/    # Runtime schema validation (Result-returning)
    │       ├── fs/        # Safe filesystem operations returning Result
    │       ├── env/       # Environment variable access
    │       ├── http/      # HTTP client helpers
    │       ├── data/      # Data transformation utilities
    │       └── collections/ # Immutable data structures
    └── cli/               # @anyhow/cli
        ├── package.json
        ├── build.ts
        └── src/
            └── cli/      # Declarative CLI framework
    └── svelte/            # @anyhow/svelte
        ├── package.json   # Subpath exports map (primitives, composables, actions)
        ├── build.ts       # Svelte compileModule + bun build per subpath
        └── src/
            ├── index.d.ts         # Hand-crafted root declarations
            ├── primitives/        # Reactive $state composables (26 exports)
            │   └── index.d.ts     # Hand-crafted primitives declarations
            ├── composables/       # SvelteKit form/load/action utilities (3 exports)
            │   └── index.d.ts     # Hand-crafted composables declarations
            └── actions/           # Svelte use: directives (4 exports)
                └── index.d.ts     # Hand-crafted actions declarations
```

## File conventions

- **File names**: `kebab-case.ts` for modules, `kebab-case.test.ts` for tests.
- **One concept per file**: e.g. `result/result.ts` for the core type, `result/static.ts` for static methods.
- **Barrel exports**: each module has an `index.ts` that re-exports only its public surface.
- **Source and tests co-located**: `src/result/result.ts` → `src/result/result.test.ts`.
- **Max ~150 lines per file**: if a file grows larger, split by sub-concept.

## Naming conventions

- **Functions**: `camelCase` — `andThen`, `safeJsonParse`, `memoizeAsync`.
- **Types/interfaces**: `PascalCase` — `Result`, `TruncateOpts`.
- **Type parameters**: single uppercase letters — `T`, `U`, `E`, `V`, `K`.
- **Follow Rust's stdlib naming** where applicable: `Result`, `ok`/`err`, `map`, `andThen`, `unwrapOr`, `match`.

## JSDoc requirements

Every **public export** must have a JSDoc comment with:

1. A one-line summary.
2. `@param` for each parameter (include the dot notation for nested opts: `@param opts.attempts`).
3. `@returns` describing the return value.
4. `@typeParam` for generic type parameters.
5. `@example` with a fenced code block showing realistic usage.

Example:

````ts
/**
 * Transforms the `Ok` value of a {@link Result} using `fn`, leaving `Err` untouched.
 *
 * @typeParam T - The input ok type.
 * @typeParam U - The output ok type.
 * @typeParam E - The error type (passed through unchanged).
 * @param r - The result to map over.
 * @param fn - The transformation applied to the ok value.
 * @returns A new `Result<U, E>`.
 *
 * @example
 * ```ts
 * const result = ok(5);
 * map(result, v => v * 2); // { ok: true, value: 10 }
 * ```
 */
````

## Testing conventions

- Tests go in `*.test.ts` alongside the source.
- Use `bun test` (no external test framework).
- Cover: happy path, edge cases, error branches, and type narrowing assertions.
- Test file names mirror source: `lru.ts` → `lru.test.ts`.

## Adding a new module to `@anyhow/std`

1. Create `packages/std/src/<name>/` with:
   - Implementation file(s) — one per concept.
   - `index.ts` barrel re-exporting all public APIs.
   - `*.test.ts` for each implementation file.
2. Add a subpath entry to `packages/std/package.json` `exports`:
   ```json
   "./<name>": {
     "import": "./dist/<name>/index.js",
     "require": "./dist/<name>/index.cjs",
     "types": "./dist/<name>/index.d.ts"
   }
   ```
3. Add `"<name>"` to the `modules` array in `packages/std/build.ts`.
4. Document in `README.md` under `## Modules`.

## Adding a new package

1. Create `packages/<name>/` mirroring the structure of `packages/std/`.
2. Add it to the root `package.json` `workspaces` array.
3. Follow the same conventions: zero dependencies, subpath exports, dual ESM/CJS, co-located tests.

### Framework packages (like `@anyhow/svelte`)

Framework packages may have peer dependencies (e.g. `svelte`), use the
framework's test runner (`vitest` + framework plugins instead of `bun test`),
and need build-time framework tooling (`svelte/compiler` for rune
compilation). Declarations are hand-crafted `.d.ts` files (since `tsc`
can't emit for `.svelte.ts` files). Tests for `$effect`-based modules use
`@testing-library/svelte` with `.svelte` wrapper components.

## Build system

The build script (`packages/std/build.ts`):

1. Runs `tsc -p tsconfig.build.json` for `.d.ts` declaration files.
2. Uses `Bun.build` to emit ESM (`.js`) and CJS (`.cjs`) for each module.
3. Declaration generation uses `tsconfig.build.json` which extends `tsconfig.json` and sets `declaration: true`.

## AI-specific guidance

- **Prefer reading `AGENTS.md` first** — it contains conventions and project structure.
- **Read the barrel `index.ts`** of a module to see its public surface, then read individual implementation files.
- **JSDoc is the source of truth** for behavior. Implementation details may change; the JSDoc describes the contract.
- **When adding a function**, always add JSDoc with `@example` and a test.
- **When fixing a bug**, add a test that reproduces it first.
- **Never introduce dependencies** — everything must be implemented from scratch or use only Node.js/Bun built-ins.
- **Keep files small** — if you're adding a lot of code, split it into multiple files.
- **Run `bun run check`** before considering work complete.
