/** Submit context passed by SvelteKit's `use:enhance`. */
interface SubmitContext {
  formData: FormData;
  formElement: HTMLFormElement;
  action: URL;
  cancel(): void;
  submitter: HTMLElement | null;
}

/** Validation error detail. */
interface ValidationErrorLike {
  path: (string | number)[];
  message: string;
  expected?: string;
  received?: string;
}

/**
 * The reactive state returned by `createFormAction` Path A.
 */
export interface FormActionSimple<T = unknown> {
  readonly pending: boolean;
  readonly data: T | undefined;
  readonly error: string | undefined;
  enhance: () => (ctx: SubmitContext) => Promise<void>;
  reset(): void;
}

/**
 * The reactive state returned by `createFormAction` Path B.
 */
export interface FormActionWithValidation<T = unknown> {
  readonly pending: boolean;
  readonly data: T | undefined;
  readonly error: string | undefined;
  readonly validationError: string | undefined;
  enhance: () => (ctx: SubmitContext) => Promise<void>;
  reset(): void;
}

/**
 * The reactive state returned by `createFormAction` Path C.
 */
export interface FormActionWithSchema<T = unknown> {
  readonly pending: boolean;
  readonly data: T | undefined;
  readonly error: string | undefined;
  readonly validationErrors: ValidationErrorLike[] | undefined;
  enhance: () => (ctx: SubmitContext) => Promise<void>;
  reset(): void;
}

/** Options for Path B: validate + action. */
interface ValidateOpts<V, T> {
  validate: (fd: FormData) => V | string;
  action: (data: V) => Promise<T>;
}

/** Options for Path C: schema + action. */
interface SchemaOpts<V, T> {
  schema: { parse(value: unknown): { ok: boolean; value?: V; error?: unknown } };
  action: (data: V) => Promise<T>;
}

/**
 * Creates a reactive form action backed by Svelte 5 `$state`.
 *
 * Path A — Simple action (no validation).
 */
export function createFormAction<T>(action: (fd: FormData) => Promise<T>): FormActionSimple<T>;

/**
 * Creates a reactive form action backed by Svelte 5 `$state`.
 *
 * Path B — Inline validation with a `validate` function.
 */
export function createFormAction<V, T>(opts: ValidateOpts<V, T>): FormActionWithValidation<T>;

/**
 * Creates a reactive form action backed by Svelte 5 `$state`.
 *
 * Path C — Schema-based validation (compatible with `@anyhow/std/schema`).
 */
export function createFormAction<V, T>(opts: SchemaOpts<V, T>): FormActionWithSchema<T>;

/** Options for Path D: schema + action returning `Result`. */
interface SchemaResultOpts<V, T, E> {
  schema: import("@anyhow/std/schema").Schema<V>;
  action: (data: V) => Promise<import("@anyhow/std/result").Result<T, E>>;
}

/**
 * The reactive state returned by `createFormAction` Path D.
 */
export interface FormActionStateWithResult<T = unknown, E = Error> {
  readonly pending: boolean;
  readonly result: import("@anyhow/std/result").Result<T, E> | undefined;
  readonly error: string | undefined;
  readonly validationErrors: import("@anyhow/std/schema").ValidationError[] | undefined;
  enhance: () => (ctx: SubmitContext) => Promise<void>;
  reset(): void;
}

/**
 * Creates a reactive form action backed by Svelte 5 `$state`.
 *
 * Path D — Schema + `Result` (first-party `@anyhow/std` integration).
 */
export function createFormAction<V, T, E = Error>(
  opts: SchemaResultOpts<V, T, E>,
): FormActionStateWithResult<T, E>;

/**
 * Wraps a SvelteKit `load` function so thrown errors are returned as data.
 */
export function safeLoad<Args extends any[], R extends Record<string, unknown>>(
  loadFn: (...args: Args) => Promise<R>,
): (...args: Args) => Promise<R & { _loadError?: Error }>;

/**
 * Wraps SvelteKit form `actions` so that thrown errors are caught.
 */
export function safeActions<A extends Record<string, (...args: any[]) => Promise<any>>>(
  actions: A,
): {
  [K in keyof A]: A[K] extends (...args: infer Args) => Promise<infer R>
    ? (...args: Args) => Promise<R & { _actionError?: Error }>
    : A[K];
};
