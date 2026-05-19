import { trySync } from "../result/try.js";
import type { Result } from "../result/types.js";

/**
 * Parse JSON text into a {@link Result} instead of throwing.
 *
 * ```ts
 * const parsed = safeJsonParse<{ name: string }>('{"name": "Alice"}');
 * if (parsed.ok) {
 *   parsed.value.name; // string (structurally typed — not validated)
 * }
 * ```
 *
 * Pass a type guard as the second argument to validate the parsed value:
 *
 * ```ts
 * import { isObject, hasProperty, isString } from "@anyhow/core/guard";
 *
 * const parsed = safeJsonParse(
 *   '{"name": "Alice"}',
 *   (v): v is { name: string } =>
 *     isObject(v) && hasProperty(v, "name", isString),
 * );
 * if (parsed.ok) {
 *   parsed.value.name; // string (fully validated)
 * }
 * ```
 */
export function safeJsonParse<T = unknown>(text: string): Result<T>;
export function safeJsonParse<T>(text: string, validator: (v: unknown) => v is T): Result<T>;
export function safeJsonParse<T>(text: string, validator?: (v: unknown) => v is T): Result<T> {
  const result = trySync(() => JSON.parse(text) as T);
  if (!result.ok) return result;
  if (validator) {
    if (!validator(result.value)) {
      return {
        ok: false,
        error: new Error("JSON validation failed: value did not match the expected shape"),
      };
    }
  }
  return result;
}
