import { describe, expect, it, mock } from "bun:test";
import { get, post, put, del, http, HttpClient } from "./index.js";

// ── helpers ──

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function textResponse(text: string, status = 200): Response {
  return new Response(text, { status });
}

/** Assign a mock to `globalThis.fetch`, working around Bun's `preconnect` type. */
function mockFetch(fn: (...args: any[]) => any): any {
  return ((globalThis as any).fetch = mock(fn));
}

// ── GET ──

describe("get", () => {
  it("returns Ok with parsed JSON", async () => {
    mockFetch(() => Promise.resolve(jsonResponse({ id: 1, name: "Alice" })));

    const result = await get("https://api.example.com/users/1").json<{
      id: number;
      name: string;
    }>();
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toEqual({ id: 1, name: "Alice" });
  });

  it("returns Err on non-2xx status", async () => {
    mockFetch(() => Promise.resolve(textResponse("Not Found", 404)));

    const result = await get("https://api.example.com/missing").json();
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toContain("404");
    }
  });

  it("returns Err on network error", async () => {
    mockFetch(() => Promise.reject(new TypeError("Failed to fetch")));

    const result = await get("https://api.example.com/data").json();
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.message).toContain("Failed to fetch");
  });

  it("sets query parameters on the URL", async () => {
    let capturedUrl = "";
    mockFetch((url: string) => {
      capturedUrl = url;
      return Promise.resolve(jsonResponse({ ok: true }));
    });

    await get("https://api.example.com/search").query({ q: "test", page: 1 }).json();
    expect(capturedUrl).toContain("?q=test&page=1");
  });

  it("appends query to URL that already has params", async () => {
    let capturedUrl = "";
    mockFetch((url: string) => {
      capturedUrl = url;
      return Promise.resolve(jsonResponse({ ok: true }));
    });

    await get("https://api.example.com/search?existing=1").query({ extra: 2 }).json();
    expect(capturedUrl).toContain("existing=1&extra=2");
  });

  it("sets headers", async () => {
    let capturedInit: RequestInit = {};
    mockFetch((_url: string, init: RequestInit) => {
      capturedInit = init;
      return Promise.resolve(jsonResponse({ ok: true }));
    });

    await get("https://api.example.com/data").header("Authorization", "Bearer tok").json();
    const headers = capturedInit.headers as Record<string, string>;
    expect(headers["authorization"]).toBe("Bearer tok");
  });
});

// ── POST ──

describe("post", () => {
  it("sends JSON body and parses response", async () => {
    let capturedInit: RequestInit = {};
    mockFetch((_url: string, init: RequestInit) => {
      capturedInit = init;
      return Promise.resolve(jsonResponse({ created: true, id: 42 }));
    });

    const result = await post("https://api.example.com/users").json<{
      created: boolean;
      id: number;
    }>({
      name: "Alice",
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toEqual({ created: true, id: 42 });

    expect(capturedInit.method).toBe("POST");
    expect(capturedInit.body).toBe(JSON.stringify({ name: "Alice" }));
    const headers = capturedInit.headers as Record<string, string>;
    expect(headers["content-type"]).toBe("application/json");
  });
});

// ── PUT / DELETE ──

describe("put", () => {
  it("sends PUT request", async () => {
    let capturedInit: RequestInit = {};
    mockFetch((_url: string, init: RequestInit) => {
      capturedInit = init;
      return Promise.resolve(jsonResponse({ updated: true }));
    });

    const result = await put("https://api.example.com/users/1").json<{ updated: boolean }>({
      name: "Bob",
    });
    expect(result.ok).toBe(true);
    expect(capturedInit.method).toBe("PUT");
  });
});

describe("del", () => {
  it("sends DELETE request", async () => {
    let capturedInit: RequestInit = {};
    mockFetch((_url: string, init: RequestInit) => {
      capturedInit = init;
      return Promise.resolve(jsonResponse({ deleted: true }));
    });

    const result = await del("https://api.example.com/users/1").json<{ deleted: boolean }>();
    expect(result.ok).toBe(true);
    expect(capturedInit.method).toBe("DELETE");
  });
});

// ── raw response / stream ──

describe("response()", () => {
  it("returns Ok with the raw Response", async () => {
    const res = textResponse("hello");
    mockFetch(() => Promise.resolve(res));

    const result = await get("https://api.example.com/data").response();
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBeInstanceOf(Response);
      expect(await result.value.text()).toBe("hello");
    }
  });
});

describe("stream()", () => {
  it("returns Ok with a ReadableStream", async () => {
    const stream = new ReadableStream<Uint8Array>({
      start(ctrl) {
        ctrl.enqueue(new TextEncoder().encode("data"));
        ctrl.close();
      },
    });
    mockFetch(() => Promise.resolve(new Response(stream)));

    const result = await get("https://api.example.com/data").stream();
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toBeInstanceOf(ReadableStream);
  });

  it("returns Err when response has no body", async () => {
    mockFetch(() => Promise.resolve(new Response(null, { status: 204 })));

    const result = await get("https://api.example.com/data").stream();
    // 204 is ok so response() passes, but body is null
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.message).toBe("Response has no body");
  });
});

// ── timeout ──

describe("timeout", () => {
  it("returns Err when request exceeds timeout", async () => {
    mockFetch((_url: string, init?: RequestInit) => {
      return new Promise((_resolve, reject) => {
        const signal = init?.signal;
        if (signal?.aborted) {
          reject(signal.reason ?? new DOMException("Aborted", "AbortError"));
          return;
        }
        signal?.addEventListener("abort", () => {
          reject(signal.reason ?? new DOMException("Aborted", "AbortError"));
        });
      });
    });

    const result = await get("https://api.example.com/slow").timeout(50).json();
    expect(result.ok).toBe(false);
  });
});

// ── retry ──

describe("retry", () => {
  it("retries on failure and returns Ok on success", async () => {
    const fn = mock()
      .mockRejectedValueOnce(new TypeError("fail"))
      .mockRejectedValueOnce(new TypeError("fail"))
      .mockResolvedValueOnce(textResponse("ok"));

    (globalThis as any).fetch = fn;

    const result = await get("https://api.example.com/flaky")
      .retry({ attempts: 3, backoff: 10 })
      .response();

    expect(result.ok).toBe(true);
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("returns Err after exhausting retries", async () => {
    mockFetch(() => Promise.reject(new TypeError("always fails")));

    const result = await get("https://api.example.com/broken")
      .retry({ attempts: 2, backoff: 10 })
      .json();

    expect(result.ok).toBe(false);
  });

  it("stops retrying when shouldRetry returns false", async () => {
    mockFetch(() => Promise.reject(new TypeError("no")));

    const result = await get("https://api.example.com/data")
      .retry({ attempts: 3, backoff: 10, shouldRetry: () => false })
      .json();

    expect(result.ok).toBe(false);
    expect((globalThis as any).fetch).toHaveBeenCalledTimes(1);
  });
});

// ── HttpClient ──

describe("HttpClient", () => {
  it("resolves relative URLs with baseUrl", async () => {
    let capturedUrl = "";
    mockFetch((url: string) => {
      capturedUrl = url;
      return Promise.resolve(jsonResponse({ ok: true }));
    });

    const api = http.create({ baseUrl: "https://api.example.com/v1" });
    await api.get("/users").json();
    expect(capturedUrl).toBe("https://api.example.com/v1/users");
  });

  it("applies default headers", async () => {
    let capturedInit: RequestInit = {};
    mockFetch((_url: string, init: RequestInit) => {
      capturedInit = init;
      return Promise.resolve(jsonResponse({ ok: true }));
    });

    const api = http.create({
      baseUrl: "https://api.example.com",
      headers: { Authorization: "Bearer default", "X-Version": "1" },
    });
    await api.get("/data").json();

    const headers = capturedInit.headers as Record<string, string>;
    expect(headers["authorization"]).toBe("Bearer default");
    expect(headers["x-version"]).toBe("1");
  });

  it("applies default timeout", async () => {
    mockFetch((_url: string, init?: RequestInit) => {
      return new Promise((_resolve, reject) => {
        const signal = init?.signal;
        if (signal?.aborted) {
          reject(signal.reason ?? new DOMException("Aborted", "AbortError"));
          return;
        }
        signal?.addEventListener("abort", () => {
          reject(signal.reason ?? new DOMException("Aborted", "AbortError"));
        });
      });
    });

    const api = http.create({ baseUrl: "https://api.example.com", timeout: 50 });
    const result = await api.get("/slow").json();
    expect(result.ok).toBe(false);
  });

  it("allows overriding defaults on the builder", async () => {
    let capturedInit: RequestInit = {};
    mockFetch((_url: string, init: RequestInit) => {
      capturedInit = init;
      return Promise.resolve(jsonResponse({ ok: true }));
    });

    const api = http.create({
      baseUrl: "https://api.example.com",
      headers: { Authorization: "Bearer default" },
    });

    await api.get("/data").header("Authorization", "Bearer override").json();

    const headers = capturedInit.headers as Record<string, string>;
    expect(headers["authorization"]).toBe("Bearer override");
  });

  it("executes middleware", async () => {
    const calls: string[] = [];
    const mw: import("./index.js").Middleware = async (req, next) => {
      calls.push("before");
      const res = await next(req);
      calls.push("after");
      return res;
    };

    mockFetch(() => {
      calls.push("fetch");
      return Promise.resolve(jsonResponse({ ok: true }));
    });

    const api = http.create({ baseUrl: "https://api.example.com", middleware: [mw] });
    const result = await api.get("/test").json();
    expect(result.ok).toBe(true);
    expect(calls).toEqual(["before", "fetch", "after"]);
  });

  it("constructs directly via new HttpClient", async () => {
    mockFetch(() => Promise.resolve(jsonResponse({ hello: "world" })));

    const client = new HttpClient({ baseUrl: "https://api.example.com" });
    const result = await client.get("/hello").json<{ hello: string }>();
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toEqual({ hello: "world" });
  });
});

// ── JSON parse failure ──

describe("json parse failure", () => {
  it("returns Err when response is not valid JSON", async () => {
    mockFetch(() => Promise.resolve(textResponse("not json", 200)));

    const result = await get("https://api.example.com/bad").json();
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.message).toContain("Failed to parse JSON");
  });
});
