/**
 * A reactive form action composable for SvelteKit 5 with `use:enhance`.
 *
 * Bridges SvelteKit form submissions with reactive `$state` for `pending`,
 * `data`, `error`, and optional validation. Four paths provide an
 * escalation ladder from bare-bones to full `@anyhow/std` Result
 * integration:
 *
 * **Path A — Simple action (no validation)**
 * ```ts
 * const form = createFormAction(async (fd) => {
 *   const name = fd.get("name");
 *   return await api.submit(name);
 * });
 * // form: FormActionSimple<ResultType>
 * ```
 *
 * **Path B — Validate + action**
 * ```ts
 * const form = createFormAction({
 *   validate: (fd) => {
 *     const email = fd.get("email");
 *     if (!email) return "Email required";
 *     return { email: String(email) };
 *   },
 *   action: async (data) => await api.login(data.email),
 * });
 * // form: FormActionWithValidation<ResultType>
 * // form.validationError  → string | undefined
 * ```
 *
 * **Path C — Schema (structural, compatible with any `.parse()` lib)**
 * ```ts
 * const form = createFormAction({
 *   schema: zodSchema,  // or valibot, arktype, etc.
 *   action: async (data) => await api.login(data),
 * });
 * // form: FormActionWithSchema<ResultType>
 * // form.validationErrors  → structured errors
 * ```
 *
 * **Path D — Schema + `Result` (first-party `@anyhow/std` integration)**
 * ```ts
 * import { createFormAction } from "@anyhow/svelte";
 * import { s } from "@anyhow/std/schema";
 * import { ok, err } from "@anyhow/std/result";
 *
 * const form = createFormAction({
 *   schema: s.object({ email: s.string(), password: s.string() }),
 *   action: async (data) => {
 *     const user = await api.login(data);
 *     return ok(user);
 *   },
 * });
 * // form: FormActionStateWithResult<User, Error>
 * // form.result?.ok → narrow to form.result.value
 * // form.validationErrors → ValidationError[] with .path, .message
 * ```
 *
 * @module
 */

// ── Structural type aliases (compatible with @anyhow/std, no import needed) ──

/** A schema-like object with a `parse` method returning `{ ok, value?, error? }`. */
interface SchemaLike<V> {
  parse(value: unknown): { ok: boolean; value?: V; error?: unknown };
}

/** Validation error detail (structural match to @anyhow/std/schema). */
interface ValidationErrorLike {
  path: (string | number)[];
  message: string;
  expected?: string;
  received?: string;
}

// ── First-party types (imported from @anyhow/std) ──

import type { Schema, ValidationError } from "@anyhow/std/schema";
import type { Result } from "@anyhow/std/result";

// ── Submit context (compatible with SvelteKit's use:enhance) ──

/** The context passed to the submit handler by SvelteKit's `use:enhance`. */
interface SubmitContext {
  formData: FormData;
  formElement: HTMLFormElement;
  action: URL;
  cancel(): void;
  submitter: HTMLElement | null;
}

// ── Return types (narrow per path) ──

/** Return type for Path A — simple action. */
export interface FormActionSimple<T = unknown> {
  readonly pending: boolean;
  readonly data: T | undefined;
  readonly error: string | undefined;
  enhance: () => (ctx: SubmitContext) => Promise<void>;
  reset(): void;
}

/** Return type for Path B — inline validation. */
export interface FormActionWithValidation<T = unknown> {
  readonly pending: boolean;
  readonly data: T | undefined;
  readonly error: string | undefined;
  readonly validationError: string | undefined;
  enhance: () => (ctx: SubmitContext) => Promise<void>;
  reset(): void;
}

/** Return type for Path C — structural schema. */
export interface FormActionWithSchema<T = unknown> {
  readonly pending: boolean;
  readonly data: T | undefined;
  readonly error: string | undefined;
  readonly validationErrors: ValidationErrorLike[] | undefined;
  enhance: () => (ctx: SubmitContext) => Promise<void>;
  reset(): void;
}

/** Return type for Path D — `@anyhow/std` Result integration. */
export interface FormActionStateWithResult<T = unknown, E = Error> {
  readonly pending: boolean;
  readonly result: Result<T, E> | undefined;
  readonly error: string | undefined;
  readonly validationErrors: ValidationError[] | undefined;
  enhance: () => (ctx: SubmitContext) => Promise<void>;
  reset(): void;
}

// ── Options types (overloads) ──

/** Options for Path B: validate + action. */
interface ValidateOpts<V, T> {
  /** Validates raw `FormData` and returns typed data or an error string. */
  validate: (fd: FormData) => V | string;
  /** The async action that receives validated data. */
  action: (data: V) => Promise<T>;
}

/** Options for Path C: schema + action. */
interface SchemaOpts<V, T> {
  /** A schema-like object with a `parse` method. */
  schema: SchemaLike<V>;
  /** The async action that receives validated data. */
  action: (data: V) => Promise<T>;
}

// ── Path D: Result-integrated schema ──

/** Options for Path D: schema + action returning `Result`. */
interface SchemaResultOpts<V, T, E> {
  /** A `Schema` from `@anyhow/std/schema`. */
  schema: Schema<V>;
  /** The async action that returns a `Result`. */
  action: (data: V) => Promise<Result<T, E>>;
}

// ── Overload signatures ──

/**
 * Creates a reactive form action backed by Svelte 5 `$state`.
 *
 * Path A — Simple action (no validation).
 *
 * @typeParam T - The action's return type.
 * @param action - An async function that receives raw `FormData` and returns data.
 *
 * @example
 * ```ts
 * const form = createFormAction(async (fd) => {
 *   return await api.submit(fd.get("name"));
 * });
 * ```
 */
export function createFormAction<T>(action: (fd: FormData) => Promise<T>): FormActionSimple<T>;

/**
 * Creates a reactive form action backed by Svelte 5 `$state`.
 *
 * Path B — Inline validation with a `validate` function.
 *
 * @typeParam V - The validated data type.
 * @typeParam T - The action's return type.
 * @param opts.validate - Validates `FormData` and returns typed data or an error string.
 * @param opts.action - The async action receiving validated data.
 *
 * @example
 * ```ts
 * const form = createFormAction({
 *   validate: (fd) => {
 *     const email = fd.get("email");
 *     return email ? { email: String(email) } : "Email required";
 *   },
 *   action: async (data) => await api.login(data.email),
 * });
 * ```
 */
export function createFormAction<V, T>(opts: ValidateOpts<V, T>): FormActionWithValidation<T>;

/**
 * Creates a reactive form action backed by Svelte 5 `$state`.
 *
 * Path C — Schema-based validation (compatible with `@anyhow/std/schema`).
 *
 * @typeParam V - The validated data type.
 * @typeParam T - The action's return type.
 * @param opts.schema - A schema with a `parse` method (e.g. from `@anyhow/std/schema`).
 * @param opts.action - The async action receiving validated data.
 *
 * @example
 * ```ts
 * import { s } from "@anyhow/std/schema";
 * const loginSchema = s.object({ email: s.string, password: s.string });
 *
 * const form = createFormAction({
 *   schema: loginSchema,
 *   action: async (data) => await api.login(data),
 * });
 * ```
 */
export function createFormAction<V, T>(opts: SchemaOpts<V, T>): FormActionWithSchema<T>;

/**
 * Creates a reactive form action backed by Svelte 5 `$state`.
 *
 * Path D — Schema + `Result` (first-party `@anyhow/std` integration).
 * Returns `result: Result<T, E>` and typed `validationErrors: ValidationError[]`.
 *
 * @typeParam V - The validated data type.
 * @typeParam T - The `Ok` value type.
 * @typeParam E - The `Err` error type.
 * @param opts.schema - A `Schema` from `@anyhow/std/schema`.
 * @param opts.action - An async action returning `Result<T, E>`.
 *
 * @example
 * ```ts
 * import { createFormAction } from "@anyhow/svelte";
 * import { s } from "@anyhow/std/schema";
 * import { ok, err } from "@anyhow/std/result";
 *
 * const loginSchema = s.object({ email: s.string, password: s.string });
 *
 * const form = createFormAction({
 *   schema: loginSchema,
 *   action: async (data) => {
 *     const user = await api.login(data);
 *     return ok(user);
 *   },
 * });
 *
 * // {#if form.result?.ok}
 * //   Welcome, {form.result.value.name}
 * // {:else if form.result}
 * //   Error: {form.result.error}
 * // {/if}
 * ```
 */
export function createFormAction<V, T, E = Error>(
  opts: SchemaResultOpts<V, T, E>,
): FormActionStateWithResult<T, E>;

// ── Implementation ──

export function createFormAction<V, T, E = Error>(
  actionOrOpts:
    | ((fd: FormData) => Promise<T>)
    | ValidateOpts<V, T>
    | SchemaOpts<V, T>
    | SchemaResultOpts<V, T, E>,
):
  | FormActionSimple<T>
  | FormActionWithValidation<T>
  | FormActionWithSchema<T>
  | FormActionStateWithResult<T, E> {
  // ── Reactive state ──

  let pending = $state(false);
  let data = $state<T | undefined>(undefined);
  let result = $state<Result<T, E> | undefined>(undefined);
  let error = $state<string | undefined>(undefined);
  let validationError = $state<string | undefined>(undefined);
  let validationErrors = $state<ValidationErrorLike[] | undefined>(undefined);
  let isResultPath = false;

  // ── Normalize options ──

  let actionFn: (fd: FormData) => Promise<T>;

  if (typeof actionOrOpts === "function") {
    // Path A: simple action
    actionFn = actionOrOpts;
  } else if ("validate" in actionOrOpts) {
    // Path B: validate + action
    const opts = actionOrOpts as ValidateOpts<V, T>;
    actionFn = async (fd: FormData) => {
      const v = opts.validate(fd);
      if (typeof v === "string") throw v; // caught as validationError
      return opts.action(v as V);
    };
  } else if ("schema" in actionOrOpts) {
    // Path C: schema + action (structural), or Path D: schema + Result
    const opts = actionOrOpts as SchemaOpts<V, T>;
    isResultPath = true;
    actionFn = async (fd: FormData) => {
      const obj = formDataToObject(fd);
      const parsed = opts.schema.parse(obj);
      if (!parsed.ok) {
        throw { validation: parsed.error };
      }
      return opts.action(parsed.value as V);
    };
  } else {
    throw new Error("createFormAction: invalid options");
  }

  // ── Submit handler ──

  async function handleSubmit(ctx: SubmitContext): Promise<void> {
    pending = true;
    error = undefined;
    data = undefined;
    result = undefined;
    validationError = undefined;
    validationErrors = undefined;

    try {
      const actionResult = await actionFn(ctx.formData);
      // Auto-detect Result — if the action returned a Result-like object
      // (Path D), store it in `result`. Otherwise (Path C), store in `data`.
      if (
        isResultPath &&
        actionResult !== null &&
        typeof actionResult === "object" &&
        "ok" in actionResult
      ) {
        result = actionResult as Result<T, E>;
      } else {
        data = actionResult;
      }
      ctx.cancel();
    } catch (err: unknown) {
      ctx.cancel();

      if (err && typeof err === "object" && "validation" in err) {
        // Schema validation error
        validationErrors = normalizeValidationErrors((err as Record<string, unknown>).validation);
      } else if (typeof err === "string") {
        // Path B validation error
        validationError = err;
      } else {
        error = err instanceof Error ? err.message : String(err);
      }
    } finally {
      pending = false;
    }
  }

  // ── Public API ──

  return {
    get pending() {
      return pending;
    },
    get data() {
      return data;
    },
    get result() {
      return result;
    },
    get error() {
      return error;
    },
    get validationError() {
      return validationError;
    },
    get validationErrors() {
      return validationErrors;
    },

    enhance: () => {
      let destroyed = false;

      return async (ctx: SubmitContext) => {
        if (destroyed) return;
        await handleSubmit(ctx);
      };
    },

    reset() {
      pending = false;
      data = undefined;
      result = undefined;
      error = undefined;
      validationError = undefined;
      validationErrors = undefined;
    },
  };
}

// ── Helpers ──

/** Converts a `FormData` to a plain object. */
function formDataToObject(fd: FormData): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  for (const [key, val] of fd) {
    // Handle repeated keys as arrays
    if (key in obj) {
      const existing = obj[key];
      obj[key] = Array.isArray(existing) ? [...existing, val] : [existing, val];
    } else {
      obj[key] = val;
    }
  }
  return obj;
}

/** Normalizes various validation error shapes into a consistent array. */
function normalizeValidationErrors(error: unknown): ValidationErrorLike[] {
  if (error === null || error === undefined) return [];
  if (Array.isArray(error)) {
    return error.map((e) => {
      if (typeof e === "string") return { path: [], message: e };
      return {
        path: e.path ?? [],
        message: e.message ?? String(e),
        expected: e.expected,
        received: e.received,
      };
    });
  }
  if (typeof error === "object" && error !== null) {
    const e = error as Record<string, unknown>;
    return [{ path: (e.path as any) ?? [], message: (e.message as string) ?? String(error) }];
  }
  return [{ path: [], message: String(error) }];
}
