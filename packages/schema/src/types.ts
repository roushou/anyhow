/**
 * A structured validation error returned when a schema fails to parse.
 *
 * @property path - Dot-separated path to the field that failed (e.g. `"user.address.city"`).
 * @property message - Human-readable description of the failure.
 * @property expected - What the schema expected (e.g. `"string"`, `"number"`).
 * @property received - The actual value received, serialized as a string.
 * @property errors - For union schemas, all branch errors that were collected.
 */
export type ValidationError = {
  path: string;
  message: string;
  expected: string;
  received: string;
  /** Branch errors from a union schema (only set when all branches fail). */
  errors?: ValidationError[];
};

/**
 * A runtime schema that can parse `unknown` data into `T`, returning a
 * {@link Result} from `@anyhow/core`.
 *
 * @typeParam T - The TypeScript type this schema validates.
 */
export interface Schema<T> {
  /** Parses `data`, returning `Ok(T)` or `Err(ValidationError)`. */
  parse(data: unknown): import("@anyhow/core/result").Result<T, ValidationError>;

  /** Returns a schema that also accepts `undefined`. */
  optional(): Schema<T | undefined>;

  /** Returns a schema that also accepts `null`. */
  nullable(): Schema<T | null>;

  /** Returns a schema that fills in a default value when `undefined`. */
  default(value: T): Schema<T>;

  /**
   * Returns a schema that applies a predicate.  If the predicate returns
   * `false`, parsing fails with `message`.
   */
  refine(predicate: (value: T) => boolean, message: string): Schema<T>;

  /**
   * Returns a schema that transforms a successfully-parsed value.
   * The transform runs after all validation.
   */
  transform<U>(fn: (value: T) => U): Schema<U>;
}

/**
 * An object schema with additional modifiers that only apply to
 * object-shaped data.
 *
 * @typeParam T - The inferred object type.
 */
export interface ObjectSchema<T extends Record<string, unknown>> extends Schema<T> {
  /** Rejects properties not defined in the shape. */
  strict(): ObjectSchema<T>;

  /** Explicitly allows extra properties (the default behavior). */
  passthrough(): ObjectSchema<T>;

  /** Makes every field optional. */
  partial(): ObjectSchema<Partial<T>>;

  /** Rejects `undefined` for every field. */
  required(): ObjectSchema<T>;

  /** Returns a schema that keeps only the given keys. */
  pick<K extends keyof T>(keys: K[]): ObjectSchema<Pick<T, K>>;

  /** Returns a schema that drops the given keys. */
  omit<K extends keyof T>(keys: K[]): ObjectSchema<Omit<T, K>>;

  /** Returns a schema that adds new keys. */
  extend<U extends Record<string, Schema<any>>>(extra: U): ObjectSchema<T & InferShape<U>>;
}

/** Extracts the TypeScript type from a {@link Schema}. */
export type Infer<S> = S extends Schema<infer T> ? T : never;

/** Extracts the TypeScript types from an object of schemas. */
export type InferShape<T extends Record<string, Schema<any>>> = {
  [K in keyof T]: Infer<T[K]>;
};
