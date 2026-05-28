/**
 * Reactive form composable backed by Svelte 5 `$state`.
 *
 * A single entrypoint that handles both client-side field state (value,
 * error, touched, dirty) and optional SvelteKit form action submission
 * via `use:enhance`.
 *
 * When `onSubmit` is provided the form gains `pending`, `result`,
 * `formError`, `enhance`, and `submit`. Without it the form is
 * client-only — field state and validation, nothing more.
 *
 * @module
 */

// ── Types ──

/** Submit context passed by SvelteKit's `use:enhance`. */
interface SubmitContext {
  formData: FormData;
  formElement: HTMLFormElement;
  action: URL;
  cancel(): void;
  submitter: HTMLElement | null;
}

/** Reactive state for a single form field. */
export interface FieldState<V> {
  /** The current value. */
  readonly value: V;
  /** The current error message, or `""` when valid. */
  readonly error: string;
  /** `true` after the field has been focused and blurred at least once. */
  readonly touched: boolean;
  /** `true` when the value differs from the initial value. */
  readonly dirty: boolean;
  /** Updates the value and optionally validates (see `validateOn`). */
  onChange(v: V): void;
  /** Marks the field as touched and runs validation. */
  onBlur(): void;
}

/** Return type when `onSubmit` is not provided — client-only form. */
export interface ClientForm<T extends Record<string, any>> {
  /** Per-field reactive state. */
  fields: { [K in keyof T]: FieldState<T[K]> };
  /** `true` when every field has an empty error. */
  readonly valid: boolean;
  /** `true` when any field value differs from its initial. */
  readonly dirty: boolean;
  /** Runs validation on all fields. Returns `true` when valid. */
  validate(): boolean;
  /** Merges external errors (e.g. from a server response) into fields. */
  setErrors(errors: Partial<Record<keyof T, string>>): void;
  /** Resets all fields to their initial values, clears errors/touched/dirty. */
  reset(): void;
  /** Returns a snapshot of current field values. */
  getValues(): T;
}

/** Return type when `onSubmit` is provided — SvelteKit-ready form. */
export interface SubmitForm<T extends Record<string, any>> extends ClientForm<T> {
  /** `true` while the submit handler is running. */
  readonly pending: boolean;
  /** The `Result` returned by `onSubmit`, if it resolved. */
  readonly result: import("@anyhow/std/result").Result<any, any> | undefined;
  /** Form-level error string (set when `onSubmit` throws). */
  readonly formError: string | undefined;
  /** Returns the callback for SvelteKit's `use:enhance`. */
  enhance: () => (ctx: SubmitContext) => Promise<void>;
  /** Programmatic submit (no FormData required — uses `getValues()`). */
  submit(): Promise<void>;
}

// ── Overloads ──

/**
 * Creates a reactive form backed by Svelte 5 `$state`.
 *
 * Client-only variant — no `onSubmit`. Returns field state, validation,
 * and helpers. Use this for forms that don't need SvelteKit action
 * integration.
 *
 * @typeParam T - A record of field names to initial values.
 * @param opts.initial - Initial values for every field.
 * @param opts.validate - Client-side validator. Receives all values,
 *   returns an object mapping field names to error strings (empty = valid).
 * @param opts.validateOn - When to run validation: `"blur"` (default),
 *   `"change"`, or `"submit"`.
 *
 * @example
 * ```ts
 * const form = createForm({
 *   initial: { email: "", name: "" },
 *   validate: (v) => {
 *     const errors: Partial<Record<keyof typeof v, string>> = {};
 *     if (!v.email.includes("@")) errors.email = "Invalid email";
 *     return errors;
 *   },
 * });
 * ```
 */
export function createForm<T extends Record<string, any>>(opts: {
  initial: T;
  validate?: (values: T) => Partial<Record<keyof T, string>>;
  validateOn?: "blur" | "change" | "submit";
}): ClientForm<T>;

/**
 * Creates a reactive form backed by Svelte 5 `$state`.
 *
 * SvelteKit variant — includes `onSubmit`. Returns everything from the
 * client-only variant plus `pending`, `result`, `formError`, `enhance`
 * (for `use:enhance`), and `submit` (programmatic).
 *
 * `onSubmit` receives the typed field values and should return a
 * `Result` from `@anyhow/std/result`. On `ok`, `form.result` is set.
 * On `err`, `form.result` is set to the error `Result`. On throw,
 * `form.formError` is set.
 *
 * @typeParam T - A record of field names to initial values.
 * @param opts.initial - Initial values for every field.
 * @param opts.validate - Client-side validator (runs before `onSubmit`).
 * @param opts.validateOn - When to run client validation.
 * @param opts.onSubmit - The async submit handler returning `Result`.
 *
 * @example
 * ```svelte
 * <script>
 *   import { createForm } from "@anyhow/svelte";
 *   import { ok, err } from "@anyhow/std/result";
 *
 *   const form = createForm({
 *     initial: { email: "", password: "" },
 *     validate: (v) => {
 *       const e: Partial<Record<keyof typeof v, string>> = {};
 *       if (!v.email) e.email = "Required";
 *       return e;
 *     },
 *     onSubmit: async (values) => {
 *       const user = await api.login(values);
 *       return ok(user);
 *     },
 *   });
 * </script>
 *
 * <form method="POST" use:form.enhance>
 *   <input name="email" value={form.fields.email.value}
 *     oninput={(e) => form.fields.email.onChange(e.currentTarget.value)}
 *     onblur={() => form.fields.email.onBlur()} />
 *   {#if form.fields.email.touched && form.fields.email.error}
 *     <span class="error">{form.fields.email.error}</span>
 *   {/if}
 *   <button type="submit" disabled={form.pending}>Login</button>
 * </form>
 * ```
 */
export function createForm<T extends Record<string, any>>(opts: {
  initial: T;
  validate?: (values: T) => Partial<Record<keyof T, string>>;
  validateOn?: "blur" | "change" | "submit";
  onSubmit?: (values: T) => Promise<import("@anyhow/std/result").Result<any, any>>;
}): SubmitForm<T>;

// ── Implementation ──

export function createForm<T extends Record<string, any>>(opts: {
  initial: T;
  validate?: (values: T) => Partial<Record<keyof T, string>>;
  validateOn?: "blur" | "change" | "submit";
  onSubmit?: (values: T) => Promise<import("@anyhow/std/result").Result<any, any>>;
}): ClientForm<T> | SubmitForm<T> {
  const initial = opts.initial;
  const validateFn = opts.validate;
  const validateOn = opts.validateOn ?? "blur";
  const onSubmit = opts.onSubmit;

  // ── Field state ──

  const fieldKeys = Object.keys(initial) as (keyof T)[];

  // Single $state object for deep reactivity — Svelte 5 requires
  // $state to be a declaration initializer, not an arbitrary assignment.
  let field = $state({
    values: { ...initial } as T,
    errors: {} as Record<keyof T, string>,
    touched: {} as Record<keyof T, boolean>,
    dirtyFlags: {} as Record<keyof T, boolean>,
  });

  for (const key of fieldKeys) {
    field.errors[key] = "";
    field.touched[key] = false;
    field.dirtyFlags[key] = false;
  }

  function runValidation(): boolean {
    if (!validateFn) return true;
    const currentValues = getValues();
    const fieldErrors = validateFn(currentValues);
    for (const key of fieldKeys) {
      field.errors[key] = fieldErrors[key] ?? "";
    }
    return fieldKeys.every((k) => !field.errors[k]);
  }

  // Build fields map lazily — bound getters/setters on the $state object
  const fields = {} as Record<keyof T, FieldState<any>>;
  for (const key of fieldKeys) {
    fields[key] = {
      get value() {
        return field.values[key];
      },
      get error() {
        return field.errors[key];
      },
      get touched() {
        return field.touched[key];
      },
      get dirty() {
        return field.dirtyFlags[key];
      },
      onChange(v: any) {
        field.values[key] = v;
        field.dirtyFlags[key] = v !== initial[key];
        if (validateOn === "change") runValidation();
      },
      onBlur() {
        field.touched[key] = true;
        if (validateOn !== "submit") runValidation();
      },
    };
  }

  // ── Derived state ──

  let valid = $derived(fieldKeys.every((k) => field.errors[k] === ""));
  let dirty = $derived(fieldKeys.some((k) => field.dirtyFlags[k]));

  // ── Public methods ──

  function getValues(): T {
    const snapshot = {} as T;
    for (const key of fieldKeys) {
      snapshot[key] = field.values[key];
    }
    return snapshot;
  }

  function validate(): boolean {
    // Mark all fields as touched so errors become visible
    for (const key of fieldKeys) {
      field.touched[key] = true;
    }
    return runValidation();
  }

  function setErrors(fieldErrors: Partial<Record<keyof T, string>>): void {
    for (const key of fieldKeys) {
      if (key in fieldErrors) {
        field.errors[key] = fieldErrors[key] ?? "";
      }
    }
  }

  function reset(): void {
    for (const key of fieldKeys) {
      field.values[key] = initial[key];
      field.errors[key] = "";
      field.touched[key] = false;
      field.dirtyFlags[key] = false;
    }
  }

  const base: ClientForm<T> = {
    fields: fields as any,
    get valid() {
      return valid;
    },
    get dirty() {
      return dirty;
    },
    validate,
    setErrors,
    reset,
    getValues,
  };

  if (!onSubmit) return base;

  // ── Submit state (only when onSubmit is provided) ──

  let pending = $state(false);
  let result = $state<import("@anyhow/std/result").Result<any, any> | undefined>(undefined);
  let formError = $state<string | undefined>(undefined);

  async function handleSubmit(values: T): Promise<void> {
    const valid = validate();
    if (!valid) return;

    pending = true;
    result = undefined;
    formError = undefined;

    try {
      const res = await onSubmit!(values);
      result = res;
    } catch (err: unknown) {
      formError = err instanceof Error ? err.message : String(err);
    } finally {
      pending = false;
    }
  }

  function enhance() {
    let destroyed = false;

    return async (ctx: SubmitContext) => {
      if (destroyed) return;
      ctx.cancel();

      const fdValues = formDataToObject(ctx.formData);
      const merged = { ...getValues(), ...fdValues } as T;
      await handleSubmit(merged);
    };
  }

  async function submit(): Promise<void> {
    await handleSubmit(getValues());
  }

  return {
    ...base,
    get pending() {
      return pending;
    },
    get result() {
      return result;
    },
    get formError() {
      return formError;
    },
    enhance,
    submit,
  };
}

// ── Helpers ──

/** Converts `FormData` to a plain object (repeated keys become arrays). */
function formDataToObject(fd: FormData): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  for (const [key, val] of fd) {
    if (key in obj) {
      const existing = obj[key];
      obj[key] = Array.isArray(existing) ? [...existing, val] : [existing, val];
    } else {
      obj[key] = val;
    }
  }
  return obj;
}
