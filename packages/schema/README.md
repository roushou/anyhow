# @anyhow/schema

Runtime schema validation that returns `Result<T, ValidationError>` from `@anyhow/std`. Compose with `@anyhow/std/result` and `@anyhow/std/safe` for ergonomic validation at API boundaries.

## Quick start

```bash
bun add @anyhow/schema
```

```ts
import { s, type Infer } from "@anyhow/schema";

const User = s.object({
  name: s.string(),
  age: s.number(),
  tags: s.array(s.string()).optional().default([]),
});
type User = Infer<typeof User>;

const result = User.parse({ name: "Alice", age: 30 });
if (result.ok) {
  console.log(result.value.name); // "Alice"
}
```

## Features

- Primitives: `s.string()`, `s.number()`, `s.boolean()`, `s.literal()`, `s.enum()`
- Composites: `s.object()`, `s.array()`, `s.tuple()`, `s.union()`, `s.record()`
- Specialized: `s.date()`, `s.lazy()`, `s.coerce()`, `s.brand()`, `s.any()`, `s.undefined()`, `s.null()`, `s.instanceof()`
- Modifiers: `.optional()`, `.nullable()`, `.default()`
- Object helpers: `.pick()`, `.omit()`, `.extend()`
- Composition with `@anyhow/std`: `safe.json(text, User.parse)`

See the [main README](https://github.com/roushou/anyhow#anyhowschema) for full documentation.
