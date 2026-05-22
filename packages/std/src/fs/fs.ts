import { readFile, writeFile, mkdir, rm, stat, readdir } from "node:fs/promises";
import { join, relative, dirname } from "node:path";
import { ResultStatic as R } from "../result/static.js";
import type { Result } from "../result/result.js";

/**
 * Reads a file as UTF-8 text.
 *
 * @param path - The file path.
 * @returns `Ok(contents)` or `Err(error)`.
 *
 * @example
 * ```ts
 * const text = fs.readText("./file.txt");
 * if (text.ok) console.log(text.value);
 * ```
 */
export function readText(path: string): Promise<Result<string>> {
  return R.fromAsync(() => readFile(path, "utf-8"));
}

/**
 * Reads and parses a JSON file.
 *
 * @param path - Path to the JSON file.
 * @returns `Ok(parsed)` on success, `Err` on read or parse failure.
 *
 * @example
 * ```ts
 * const config = fs.readJson<Config>("./config.json");
 * if (config.ok) console.log(config.value);
 * ```
 */
export async function readJson<T = unknown>(path: string): Promise<Result<T>> {
  const text = await readText(path);
  if (!text.ok) return text;
  return R.json<T>(text.value);
}

/**
 * Writes text to a file, creating parent directories as needed.
 *
 * @param path - The file path.
 * @param content - The string content to write.
 * @returns `Ok(void)` on success, `Err` on failure.
 *
 * @example
 * ```ts
 * const ok = await fs.writeText("./dir/file.txt", "hello");
 * ```
 */
export async function writeText(path: string, content: string): Promise<Result<void>> {
  await R.fromAsync(() => mkdir(dirname(path), { recursive: true }).then(() => {}));
  return R.fromAsync(() => writeFile(path, content, "utf-8"));
}

/**
 * Writes data as JSON to a file, creating parent directories as needed.
 *
 * @param path - The file path.
 * @param data - The value to serialize.
 * @param space - Optional indentation for pretty-printing.
 * @returns `Ok(void)` on success, `Err` on failure.
 *
 * @example
 * ```ts
 * await fs.writeJson("./out.json", { name: "Alice" }, 2);
 * ```
 */
export async function writeJson(
  path: string,
  data: unknown,
  space?: string | number,
): Promise<Result<void>> {
  const json = R.jsonStringify(data, space);
  if (!json.ok) return json;
  return writeText(path, json.value);
}

/**
 * Recursively creates a directory (like `mkdir -p`).
 *
 * @param path - The directory path.
 * @returns `Ok(void)` on success, `Err` on failure.
 *
 * @example
 * ```ts
 * await fs.ensureDir("./a/b/c");
 * ```
 */
export function ensureDir(path: string): Promise<Result<void>> {
  return R.fromAsync(() => mkdir(path, { recursive: true }).then(() => {}));
}

/**
 * Removes a file or directory (like `rm -rf`).
 *
 * @param path - The path to remove.
 * @returns `Ok(void)` on success, `Err` on failure.
 *
 * @example
 * ```ts
 * await fs.remove("./tmp");
 * ```
 */
export function remove(path: string): Promise<Result<void>> {
  return R.fromAsync(() => rm(path, { recursive: true, force: true }));
}

/**
 * Checks whether a file or directory exists.
 *
 * @param path - The path to check.
 * @returns `true` if the path exists, `false` otherwise.
 *
 * @example
 * ```ts
 * if (await fs.exists("./config.json")) { ... }
 * ```
 */
export async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

/**
 * Creates a temporary directory and returns its path.
 *
 * The directory is created within the system temp directory with a
 * random suffix.  The caller is responsible for cleanup via {@link remove}.
 *
 * @param prefix - Optional prefix for the directory name (default: `"anyhow-"`).
 * @returns `Ok(path)` on success, `Err` on failure.
 *
 * @example
 * ```ts
 * const dir = fs.tmpDir("build-");
 * if (dir.ok) {
 *   // use dir.value, then:
 *   await fs.remove(dir.value);
 * }
 * ```
 */
export async function tmpDir(prefix = "anyhow-"): Promise<Result<string>> {
  const { mkdtemp } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  return R.fromAsync(() => mkdtemp(join(tmpdir(), prefix)));
}

/**
 * Globs for files matching a pattern.
 *
 * Supports `**` for recursive matching and `*` for single-segment
 * wildcards.  Returns paths relative to the current working directory.
 *
 * @param pattern - The glob pattern (e.g. `"src/**\/*.ts"`).
 * @returns `Ok(paths)` sorted alphabetically, or `Err` on failure.
 *
 * @example
 * ```ts
 * const files = await fs.glob("src/**\/*.ts");
 * if (files.ok) console.log(files.value); // ["src/a.ts", "src/b.ts", ...]
 * ```
 */
export async function glob(pattern: string): Promise<Result<string[]>> {
  return R.fromAsync(async () => {
    // Handle absolute paths
    const isAbsolute = pattern.startsWith("/");
    const parts = pattern.split("/");
    if (isAbsolute) parts.shift(); // remove leading empty segment
    const results: string[] = [];
    await globWalk(isAbsolute ? "/" : "", parts, results);
    results.sort();
    return results;
  });
}

async function globWalk(base: string, parts: string[], results: string[]): Promise<void> {
  if (parts.length === 0) {
    results.push(base);
    return;
  }

  const [segment, ...rest] = parts as [string, ...string[]];

  if (segment === "**") {
    // ** matches zero or more directories
    // Try skipping it first (match zero dirs)
    if (rest.length > 0) {
      await globWalk(base, rest, results);
    } else {
      results.push(base);
    }

    // Then recurse into subdirectories
    try {
      const entries = await readdir(base || ".", { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const child = base ? join(base, entry.name) : entry.name;
          // Try matching ** again at this level, plus continue the rest
          await globWalk(child, parts as string[], results);
        }
      }
    } catch {
      // Directory doesn't exist or can't be read — skip
    }
    return;
  }

  if (segment.includes("*")) {
    // Wildcard in this segment
    const regex = new RegExp("^" + segment.replace(/\*/g, ".*").replace(/\?/g, ".") + "$");
    try {
      const parent = base || ".";
      const entries = await readdir(parent, { withFileTypes: true });
      for (const entry of entries) {
        if (regex.test(entry.name)) {
          if (rest.length === 0) {
            const isFile = entry.isFile() || (!entry.isDirectory() && !entry.isSymbolicLink());
            if (isFile || entry.isDirectory()) {
              results.push(base ? join(base, entry.name) : entry.name);
            }
          } else if (entry.isDirectory()) {
            const child = base ? join(base, entry.name) : entry.name;
            await globWalk(child, rest, results);
          }
        }
      }
    } catch {
      // Can't read directory — skip
    }
    return;
  }

  // Literal segment
  const next = base ? join(base, segment) : segment;
  if (rest.length === 0) {
    // Final segment — check if it exists
    try {
      await stat(next);
      results.push(next);
    } catch {
      // Doesn't exist
    }
  } else {
    await globWalk(next, rest, results);
  }
}

/**
 * Walk entry returned by {@link walk}.
 */
export interface WalkEntry {
  /** Full path relative to the starting directory. */
  path: string;
  /** Whether this entry is a directory. */
  isDir: boolean;
}

/**
 * Lazily walks a directory tree, yielding `{ path, isDir }` entries.
 *
 * @param dir - The directory to walk.
 * @returns An async iterable of {@link WalkEntry}.
 *
 * @example
 * ```ts
 * for await (const entry of fs.walk("./src")) {
 *   console.log(entry.path, entry.isDir ? "(dir)" : "(file)");
 * }
 * ```
 */
export async function* walk(dir: string): AsyncIterableIterator<WalkEntry> {
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = join(dir, entry.name);
      const rel = relative(dir, full) || entry.name;
      if (entry.isDirectory()) {
        yield { path: rel, isDir: true };
        yield* walk(full);
      } else {
        yield { path: rel, isDir: false };
      }
    }
  } catch {
    // Directory doesn't exist or can't be read
  }
}
