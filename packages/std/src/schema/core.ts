import type { Result } from "../result/result.js";
import { ok, err } from "../result/result.js";
import type { Schema, ValidationError } from "./types.js";

/** Creates a {@link ValidationError} at the given path. */
export function fail(path: string, expected: string, received: unknown): ValidationError {
  return {
    path,
    message: `Expected ${expected} at ${path || "root"}`,
    expected,
    received: typeof received === "string" ? `"${received}"` : String(received),
  };
}

/** Adds a segment to a dot-separated path. */
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
