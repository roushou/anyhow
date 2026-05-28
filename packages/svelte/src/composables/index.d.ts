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
  readonly value: V;
  readonly error: string;
  readonly touched: boolean;
  readonly dirty: boolean;
  onChange(v: V): void;
  onBlur(): void;
}

/** Return type when `onSubmit` is not provided — client-only form. */
export interface ClientForm<T extends Record<string, any>> {
  fields: { [K in keyof T]: FieldState<T[K]> };
  readonly valid: boolean;
  readonly dirty: boolean;
  validate(): boolean;
  setErrors(errors: Partial<Record<keyof T, string>>): void;
  reset(): void;
  getValues(): T;
}

/** Return type when `onSubmit` is provided — SvelteKit-ready form. */
export interface SubmitForm<T extends Record<string, any>> extends ClientForm<T> {
  readonly pending: boolean;
  readonly result: import("@anyhow/std/result").Result<any, any> | undefined;
  readonly formError: string | undefined;
  enhance: () => (ctx: SubmitContext) => Promise<void>;
  submit(): Promise<void>;
}

/**
 * Creates a reactive form backed by Svelte 5 `$state`.
 *
 * Client-only variant — no `onSubmit`.
 */
export function createForm<T extends Record<string, any>>(opts: {
  initial: T;
  validate?: (values: T) => Partial<Record<keyof T, string>>;
  validateOn?: "blur" | "change" | "submit";
}): ClientForm<T>;

/**
 * Creates a reactive form backed by Svelte 5 `$state`.
 *
 * SvelteKit variant — includes `onSubmit`.
 */
export function createForm<T extends Record<string, any>>(opts: {
  initial: T;
  validate?: (values: T) => Partial<Record<keyof T, string>>;
  validateOn?: "blur" | "change" | "submit";
  onSubmit?: (values: T) => Promise<import("@anyhow/std/result").Result<any, any>>;
}): SubmitForm<T>;

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

/** Reactive pagination state backed by Svelte 5 `$state`. */
export function createPagination(opts: {
  total: number;
  perPage?: number;
  page?: number;
}): {
  page: number;
  perPage: number;
  total: number;
  readonly totalPages: number;
  readonly canPrev: boolean;
  readonly canNext: boolean;
  setPage(n: number): void;
  prev(): void;
  next(): void;
  reset(): void;
};

/** Reactive filtered list backed by Svelte 5 `$state`. */
export function createFilteredList<T extends Record<string, any>>(
  items: T[],
  opts: { searchFields: string[]; sortKey?: string },
): {
  search: string;
  readonly sortKey: string;
  readonly sortDir: "asc" | "desc";
  readonly filtered: T[];
  setSearch(q: string): void;
  setSort(key: string): void;
};

/** Reactive infinite scroll composable backed by Svelte 5 `$state`. */
export function createInfiniteScroll<T>(
  fetcher: (page: number) => Promise<T[]>,
): {
  readonly items: T[];
  readonly loading: boolean;
  readonly hasMore: boolean;
  readonly error: Error | undefined;
  loadMore(): Promise<void>;
  reset(): void;
  sentinel: (node: HTMLElement) => { destroy(): void };
};
