# @anyhow/fs

Safe filesystem operations that return `Result<T, E>` from `@anyhow/std` instead of throwing. All functions auto-create parent directories and provide clear error types.

## Quick start

```bash
bun add @anyhow/fs
```

```ts
import { readText, readJson, writeJson, ensureDir, exists } from "@anyhow/fs";

// Read text safely
const text = await readText("./file.txt");
if (text.ok) console.log(text.value);

// Read and parse JSON
const config = await readJson("./config.json");
if (!config.ok) {
  console.error("Bad config:", config.error);
  process.exit(1);
}

// Write JSON (creates parent dirs automatically)
await writeJson("./out/data.json", { name: "Alice" }, 2);

// Check existence
if (await exists("./file.txt")) {
  // ...
}
```

## Features

- `readText`, `readJson` — safe file reading
- `writeText`, `writeJson` — safe file writing with auto-created parent dirs
- `ensureDir`, `remove`, `exists` — directory and existence helpers
- `tmpDir` — create temporary directories
- `glob` — pattern-based file matching
- `walk` — async iterable for recursive directory traversal

See the [main README](https://github.com/roushou/anyhow#anyhowfs) for full documentation.
