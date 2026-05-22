/**
 * Configuration for a single positional argument.
 *
 * @typeParam T - The value type (`"string"` or `"number"`).
 */
export type ArgConfig =
  | { type: "string"; required: true; description?: string }
  | { type: "string"; required?: false; default?: string; description?: string }
  | { type: "number"; required: true; description?: string }
  | { type: "number"; required?: false; default?: number; description?: string };

/**
 * Configuration for a single option (flag like `--name` or `-n`).
 *
 * @typeParam T - The value type (`"string"`, `"number"`, or `"boolean"`).
 */
export type OptConfig =
  | { type: "string"; short?: string; required: true; description?: string }
  | { type: "string"; short?: string; default?: string; description?: string }
  | { type: "number"; short?: string; required: true; description?: string }
  | { type: "number"; short?: string; default?: number; description?: string }
  | { type: "boolean"; short?: string; default?: boolean; description?: string };

/** Extracts the TypeScript runtime type from an {@link ArgConfig}. */
export type InferArg<T> = T extends { type: "string" }
  ? string
  : T extends { type: "number" }
    ? number
    : never;

/** Extracts the TypeScript runtime type from an {@link OptConfig}. */
export type InferOpt<T> = T extends { type: "string" }
  ? string
  : T extends { type: "number" }
    ? number
    : T extends { type: "boolean" }
      ? boolean
      : never;

/**
 * Maps a record of {@link ArgConfig}s to their inferred types.
 * Required args are always `T`; optional args are `T | undefined`.
 */
export type InferArgs<T extends Record<string, ArgConfig>> = {
  [K in keyof T]: T[K] extends { required: true } ? InferArg<T[K]> : InferArg<T[K]> | undefined;
};

/**
 * Maps a record of {@link OptConfig}s to their inferred types.
 * Required opts are always `T`; optional opts get their non-nullable type
 * (every non-required opt variant carries a `default`).
 */
export type InferOpts<T extends Record<string, OptConfig>> = {
  [K in keyof T]: T[K] extends { required: true } ? InferOpt<T[K]> : NonNullable<InferOpt<T[K]>>;
};
