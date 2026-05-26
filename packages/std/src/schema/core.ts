import type { Result } from "../result/result.js";
import { ok, err } from "../result/result.js";
import type { Schema, ValidationError } from "./types.js";

/**
 * Creates a {@link ValidationError} at the given path.
 *
 * @param path - The dot-separated path to the failing field.
 * @param expected - What the schema expected (e.g. `"string"`, `"number"`).
 * @param received - The actual value received.
 * @returns A structured `ValidationError`.
 *
 * @example
 * ```ts
 * fail("user.name", "string", 42);
 * // { path: "user.name", message: "Expected string at user.name", expected: "string", received: "42" }
 * ```
 */
export function fail(path: string, expected: string, received: unknown): ValidationError {
  return {
    path,
    message: `Expected ${expected} at ${path || "root"}`,
    expected,
    received: typeof received === "string" ? `"${received}"` : String(received),
  };
}

/**
 * Adds a segment to a dot-separated path.
 *
 * @param base - The existing path (empty string for root).
 * @param segment - The segment to append (string key or array index number).
 * @returns The joined path.
 *
 * @example
 * ```ts
 * joinPath("user", "name");   // "user.name"
 * joinPath("", "items");      // "items"
 * joinPath("items", 0);       // "items.0"
 * ```
 */
export function joinPath(base: string, segment: string | number): string {
  return base ? `${base}.${segment}` : String(segment);
}

/**
 * Creates a {@link Schema} from a parse function. The resulting schema has
 * chainable `.optional()`, `.nullable()`, and `.default()` modifiers.
 *
 * @typeParam T - The TypeScript type this schema validates.
 * @param parse - A function that validates `unknown` data.
 * @returns A schema with modifier methods.
 *
 * @example
 * ```ts
 * const nonEmptyString = createSchema<string>((data, path) => {
 *   if (typeof data === "string" && data.length > 0) return ok(data);
 *   return err(fail(path, "non-empty string", data));
 * });
 *
 * nonEmptyString.parse("hello"); // { ok: true, value: "hello" }
 * nonEmptyString.parse("");      // { ok: false, ... }
 * ```
 */
export function createSchema<T>(
  parse: (data: unknown, path: string) => Result<T, ValidationError>,
): Schema<T> {
  const schema: Schema<T> = {
    parse(data: unknown): Result<T, ValidationError> {
      return parse(data, "");
    },

    optional(): Schema<T | undefined> {
      return createSchema<T | undefined>((data, path) => {
        if (data === undefined) return ok(undefined);
        return parse(data, path);
      });
    },

    nullable(): Schema<T | null> {
      return createSchema<T | null>((data, path) => {
        if (data === null) return ok(null);
        return parse(data, path);
      });
    },

    default(value: T): Schema<T> {
      return createSchema<T>((data, path) => {
        if (data === undefined) return ok(value);
        return parse(data, path);
      });
    },

    refine(predicate: (value: T) => boolean, message: string): Schema<T> {
      return createSchema<T>((data, path) => {
        const result = parse(data, path);
        if (!result.ok) return result;
        if (!predicate(result.value))
          return err({ path, message, expected: message, received: String(result.value) });
        return result;
      });
    },

    transform<U>(fn: (value: T) => U): Schema<U> {
      return createSchema<U>((data, path) => {
        const result = parse(data, path);
        if (!result.ok) return result;
        return ok(fn(result.value));
      });
    },
  };

  return schema;
}
