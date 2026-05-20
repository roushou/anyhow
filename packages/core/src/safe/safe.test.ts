import { describe, expect, it } from "bun:test";
import { safe } from "./safe.js";
import { isObject, hasProperty, isString, isNumber } from "../guard/index.js";

describe("safe.sync", () => {
  it("returns ok when the function succeeds", () => {
    const result = safe.sync(() => 42);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toBe(42);
  });

  it("returns err when the function throws", () => {
    const result = safe.sync(() => {
      throw new Error("boom");
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.message).toBe("boom");
  });

  it("wraps non-Error throws", () => {
    const result = safe.sync(() => {
      throw "raw string";
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBeInstanceOf(Error);
  });
});

describe("safe.async", () => {
  it("returns ok when the function succeeds", async () => {
    const result = await safe.async(() => Promise.resolve(42));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toBe(42);
  });

  it("returns err when the function rejects", async () => {
    const result = await safe.async(() => Promise.reject(new Error("boom")));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.message).toBe("boom");
  });
});

describe("safe.json", () => {
  it("returns ok with parsed value for valid JSON", () => {
    const result = safe.json<{ name: string }>('{"name":"Alice"}');
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.name).toBe("Alice");
  });

  it("returns ok with arrays", () => {
    const result = safe.json<number[]>("[1,2,3]");
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toEqual([1, 2, 3]);
  });

  it("returns err for invalid JSON", () => {
    const result = safe.json("{bad");
    expect(result.ok).toBe(false);
  });

  it("passes validation when validator matches", () => {
    const result = safe.json(
      '{"name":"Alice","age":30}',
      (v): v is { name: string; age: number } =>
        isObject(v) && hasProperty(v, "name", isString) && hasProperty(v, "age", isNumber),
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.name).toBe("Alice");
      expect(result.value.age).toBe(30);
    }
  });

  it("fails validation when validator rejects", () => {
    const result = safe.json(
      '{"name":"Alice"}',
      (v): v is { name: string; age: number } => isObject(v) && hasProperty(v, "age", isNumber),
    );
    expect(result.ok).toBe(false);
  });
});

describe("safe.jsonStringify", () => {
  it("returns ok with JSON string on success", () => {
    const result = safe.jsonStringify({ name: "Alice" });
    expect(result.ok).toBe(true);
    if (result.ok) expect(JSON.parse(result.value)).toEqual({ name: "Alice" });
  });

  it("respects the space parameter", () => {
    const result = safe.jsonStringify({ a: 1 }, 2);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toBe('{\n  "a": 1\n}');
  });

  it("returns err for circular references", () => {
    const obj: Record<string, unknown> = {};
    obj.self = obj;
    const result = safe.jsonStringify(obj);
    expect(result.ok).toBe(false);
  });
});

describe("safe.parseInt", () => {
  it("returns ok with the parsed integer", () => {
    const result = safe.parseInt("42");
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toBe(42);
  });

  it("respects radix", () => {
    const result = safe.parseInt("ff", 16);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toBe(255);
  });

  it("returns err for non-numeric input", () => {
    const result = safe.parseInt("hello");
    expect(result.ok).toBe(false);
  });
});

describe("safe.parseFloat", () => {
  it("returns ok with the parsed float", () => {
    const result = safe.parseFloat("3.14");
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toBe(3.14);
  });

  it("returns err for non-numeric input", () => {
    const result = safe.parseFloat("hello");
    expect(result.ok).toBe(false);
  });
});

describe("safe.decodeURIComponent", () => {
  it("returns ok with the decoded string", () => {
    const result = safe.decodeURIComponent("hello%20world");
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toBe("hello world");
  });

  it("returns err for malformed input", () => {
    const result = safe.decodeURIComponent("%ZZ");
    expect(result.ok).toBe(false);
  });
});

describe("safe.env", () => {
  it("returns some for an existing variable", () => {
    process.env._ANYHOW_TEST_VAR = "hello";
    const result = safe.env("_ANYHOW_TEST_VAR");
    expect(result.some).toBe(true);
    if (result.some) expect(result.value).toBe("hello");
    delete process.env._ANYHOW_TEST_VAR;
  });

  it("returns none for a missing variable", () => {
    const result = safe.env("_ANYHOW_DEFINITELY_MISSING");
    expect(result.some).toBe(false);
  });
});
