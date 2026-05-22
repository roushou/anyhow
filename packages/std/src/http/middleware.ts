import { RequestBuilder, type Middleware, type RequestOpts } from "./request.js";

export type { Middleware };

/** Options for {@link HttpClient}. */
export interface HttpClientOpts {
  /** Base URL prepended to every request path. */
  baseUrl?: string;
  /** Default timeout in milliseconds (default: `30_000`). */
  timeout?: number;
  /** Default headers added to every request. */
  headers?: Record<string, string>;
  /** Default retry policy for every request. */
  retry?: { attempts: number; backoff: number; shouldRetry?: (error: unknown) => boolean };
  /** Middleware applied to every request. */
  middleware?: Middleware[];
}

/**
 * A reusable HTTP client with shared defaults (base URL, headers, timeout, etc.).
 *
 * Call `.get()`, `.post()`, `.put()`, or `.del()` to start a request builder
 * that inherits the client's configuration. You can override any default
 * on the builder before executing.
 *
 * @example
 * ```ts
 * const api = http.create({
 *   baseUrl: "https://api.example.com",
 *   headers: { Authorization: "Bearer tok" },
 *   timeout: 10_000,
 * });
 *
 * const user = await api.get("/users/42").json<User>();
 * const orders = await api.get("/orders").query({ limit: 50 }).json<Order[]>();
 * ```
 */
export class HttpClient {
  #opts: HttpClientOpts;

  constructor(opts: HttpClientOpts = {}) {
    this.#opts = opts;
  }

  /**
   * Start a GET request builder.
   *
   * @param url - A path relative to `baseUrl`, or an absolute URL.
   * @returns A {@link RequestBuilder} pre-configured with client defaults.
   */
  get(url: string): RequestBuilder {
    return this.#builder(url, "GET");
  }

  /**
   * Start a POST request builder.
   *
   * @param url - A path relative to `baseUrl`, or an absolute URL.
   * @returns A {@link RequestBuilder} pre-configured with client defaults.
   */
  post(url: string): RequestBuilder {
    return this.#builder(url, "POST");
  }

  /**
   * Start a PUT request builder.
   *
   * @param url - A path relative to `baseUrl`, or an absolute URL.
   * @returns A {@link RequestBuilder} pre-configured with client defaults.
   */
  put(url: string): RequestBuilder {
    return this.#builder(url, "PUT");
  }

  /**
   * Start a DELETE request builder.
   *
   * @param url - A path relative to `baseUrl`, or an absolute URL.
   * @returns A {@link RequestBuilder} pre-configured with client defaults.
   */
  del(url: string): RequestBuilder {
    return this.#builder(url, "DELETE");
  }

  #builder(pathOrUrl: string, method: string): RequestBuilder {
    const url = this.#opts.baseUrl ? `${this.#opts.baseUrl}${pathOrUrl}` : pathOrUrl;
    const rbOpts: RequestOpts = {
      timeout: this.#opts.timeout,
      retry: this.#opts.retry,
      middleware: this.#opts.middleware,
    };
    const rb = new RequestBuilder(url, method, rbOpts);
    if (this.#opts.headers) {
      for (const [k, v] of Object.entries(this.#opts.headers)) {
        rb.header(k, v);
      }
    }
    return rb;
  }
}

/**
 * Start a GET request builder.
 *
 * @param url - The request URL.
 * @returns A {@link RequestBuilder} for chaining and execution.
 *
 * @example
 * ```ts
 * const result = await get("https://api.example.com/data").json<Data>();
 * ```
 */
export const get = (url: string): RequestBuilder => new RequestBuilder(url, "GET");

/**
 * Start a POST request builder.
 *
 * @param url - The request URL.
 * @returns A {@link RequestBuilder} for chaining and execution.
 *
 * @example
 * ```ts
 * const result = await post("https://api.example.com/users").json<User>({ name: "A" });
 * ```
 */
export const post = (url: string): RequestBuilder => new RequestBuilder(url, "POST");

/**
 * Start a PUT request builder.
 *
 * @param url - The request URL.
 * @returns A {@link RequestBuilder} for chaining and execution.
 */
export const put = (url: string): RequestBuilder => new RequestBuilder(url, "PUT");

/**
 * Start a DELETE request builder.
 *
 * @param url - The request URL.
 * @returns A {@link RequestBuilder} for chaining and execution.
 */
export const del = (url: string): RequestBuilder => new RequestBuilder(url, "DELETE");

/**
 * Factory for creating reusable {@link HttpClient} instances.
 *
 * @example
 * ```ts
 * const api = http.create({ baseUrl: "https://api.example.com" });
 * const data = await api.get("/users").json<User[]>();
 * ```
 */
export const http = {
  create: (opts?: HttpClientOpts): HttpClient => new HttpClient(opts),
};
