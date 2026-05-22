import { ok, err, type Result } from "../result/result.js";
import { sleep } from "../async/timing.js";

/**
 * Middleware that intercepts and potentially modifies an HTTP request.
 *
 * The `req` object contains the URL, method, and all {@link RequestInit}
 * fields (headers, body, signal, etc.). Call `next(req)` to pass the
 * (possibly modified) request to the next middleware or the actual
 * `fetch` call.
 *
 * @param req - The outgoing request.
 * @param next - The next middleware in the chain (or the final `fetch`).
 * @returns The {@link Response} from downstream.
 */
export type Middleware = (
  req: RequestInit & { url: string; method: string },
  next: (req: RequestInit & { url: string; method: string }) => Promise<Response>,
) => Promise<Response>;

/** Options passed through to {@link RequestBuilder} from {@link HttpClient}. */
export interface RequestOpts {
  timeout?: number;
  retry?: { attempts: number; backoff: number; shouldRetry?: (error: unknown) => boolean };
  middleware?: Middleware[];
}

/**
 * Builder for an HTTP request that returns a {@link Result}.
 *
 * Created via the convenience functions (`get`, `post`, `put`, `del`) or
 * an {@link HttpClient} instance. Call `.json()`, `.response()`, or
 * `.stream()` to execute.
 *
 * @example
 * ```ts
 * const result = await get("https://api.example.com/data")
 *   .header("Authorization", "Bearer tok")
 *   .timeout(5_000)
 *   .json<{ id: number }>();
 * ```
 */
export class RequestBuilder {
  #url: string;
  #method: string;
  #headers: Record<string, string>;
  #query: Record<string, string | number | boolean>;
  #body: string | null;
  #timeoutMs: number;
  #retryOpts?: RequestOpts["retry"];
  #middleware: Middleware[];

  constructor(url: string, method: string, opts?: RequestOpts) {
    this.#url = url;
    this.#method = method;
    this.#headers = {};
    this.#query = {};
    this.#body = null;
    this.#timeoutMs = opts?.timeout ?? 30_000;
    this.#retryOpts = opts?.retry;
    this.#middleware = opts?.middleware ?? [];
  }

  /**
   * Set a request header.
   *
   * @param key - Header name (lowercased automatically).
   * @param value - Header value.
   * @returns `this` for chaining.
   */
  header(key: string, value: string): this {
    this.#headers[key.toLowerCase()] = value;
    return this;
  }

  /**
   * Append query parameters to the URL.
   *
   * @param params - Key-value pairs appended as `?key=value`.
   * @returns `this` for chaining.
   */
  query(params: Record<string, string | number | boolean>): this {
    Object.assign(this.#query, params);
    return this;
  }

  /**
   * Set request timeout in milliseconds (default: `30_000`).
   *
   * @param ms - Timeout duration.
   * @returns `this` for chaining.
   */
  timeout(ms: number): this {
    this.#timeoutMs = ms;
    return this;
  }

  /**
   * Configure automatic retry on failure with exponential backoff.
   *
   * @param opts.attempts - Maximum number of attempts.
   * @param opts.backoff - Initial delay in milliseconds, doubles each attempt.
   * @param opts.shouldRetry - Optional predicate; return `false` to stop retrying.
   * @returns `this` for chaining.
   */
  retry(opts: {
    attempts: number;
    backoff: number;
    shouldRetry?: (error: unknown) => boolean;
  }): this {
    this.#retryOpts = opts;
    return this;
  }

  /**
   * Execute the request and parse the response body as JSON.
   *
   * When `body` is provided it is serialized as the JSON request body and
   * the `Content-Type` header is set to `application/json`.
   *
   * @typeParam T - The expected shape of the JSON response.
   * @param body - Optional JSON-serializable request body.
   * @returns A `Result<T>`.
   *
   * @example
   * ```ts
   * const user = await get("/api/users/1").json<User>();
   * if (user.ok) console.log(user.value.name);
   * ```
   */
  async json<T>(body?: unknown): Promise<Result<T>> {
    if (body !== undefined) {
      this.#body = JSON.stringify(body);
      this.#headers["content-type"] ??= "application/json";
    }
    const res = await this.#execute();
    if (!res.ok) return res;
    try {
      return ok((await res.value.json()) as T);
    } catch (e) {
      return err(new Error(`Failed to parse JSON: ${e instanceof Error ? e.message : String(e)}`));
    }
  }

  /**
   * Execute the request and return the raw {@link Response}.
   *
   * @returns A `Result<Response>`.
   */
  async response(): Promise<Result<Response>> {
    return this.#execute();
  }

  /**
   * Execute the request and return a {@link ReadableStream} of the response body.
   *
   * @returns A `Result<ReadableStream<Uint8Array>>`.
   */
  async stream(): Promise<Result<ReadableStream<Uint8Array>>> {
    const res = await this.#execute();
    if (!res.ok) return res;
    const body = res.value.body;
    if (!body) return err(new Error("Response has no body"));
    return ok(body);
  }

  // ── internals ──

  #buildUrl(): string {
    const keys = Object.keys(this.#query);
    if (keys.length === 0) return this.#url;
    const params = new URLSearchParams();
    for (const k of keys) params.set(k, String(this.#query[k]));
    return `${this.#url}${this.#url.includes("?") ? "&" : "?"}${params}`;
  }

  async #execute(): Promise<Result<Response>> {
    return this.#retryOpts ? this.#executeWithRetry() : this.#executeOnce();
  }

  async #executeOnce(): Promise<Result<Response>> {
    const url = this.#buildUrl();
    const signal = AbortSignal.timeout(this.#timeoutMs);
    const init: RequestInit = {
      method: this.#method,
      headers: this.#headers,
      body: this.#body,
      signal,
    };
    const doFetch = () => fetch(url, init);

    if (this.#middleware.length === 0) {
      try {
        const response = await doFetch();
        return response.ok
          ? ok(response)
          : err(new HttpError(response.status, response.statusText));
      } catch (e) {
        return err(wrapError(e));
      }
    }

    const baseReq: RequestInit & { url: string; method: string } = {
      url,
      method: this.#method,
      headers: this.#headers,
      body: this.#body,
    };
    let dispatch: (r: RequestInit & { url: string; method: string }) => Promise<Response> = () =>
      doFetch();
    for (let i = this.#middleware.length - 1; i >= 0; i--) {
      const prev = dispatch;
      dispatch = (r) => this.#middleware[i]!(r, prev);
    }

    try {
      const response = await dispatch(baseReq);
      return response.ok ? ok(response) : err(new HttpError(response.status, response.statusText));
    } catch (e) {
      return err(wrapError(e));
    }
  }

  async #executeWithRetry(): Promise<Result<Response>> {
    const { attempts, backoff, shouldRetry } = this.#retryOpts!;
    for (let i = 0; i < attempts; i++) {
      const result = await this.#executeOnce();
      if (result.ok) return result;
      if (i === attempts - 1) return result;
      if (shouldRetry && !shouldRetry(result.error)) return result;
      await sleep(backoff * 2 ** i);
    }
    return err(new Error("Retry exhausted"));
  }
}

/** HTTP error carrying the response status. */
class HttpError extends Error {
  constructor(
    readonly status: number,
    statusText: string,
  ) {
    super(`${status} ${statusText}`);
    this.name = "HttpError";
  }
}

function wrapError(e: unknown): Error {
  return e instanceof Error ? e : new Error(String(e));
}
