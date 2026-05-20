import { describe, expect, it } from "bun:test";
import { s } from "./index.js";
import type { Infer } from "./types.js";

// ── Primitives ──

describe("s.string", () => {
  it("returns ok for strings", () => {
    const r = s.string().parse("hello");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe("hello");
  });

  it("returns err for non-strings", () => {
    const r = s.string().parse(42);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.expected).toBe("string");
  });

  it("supports optional modifier", () => {
    const r = s.string().optional().parse(undefined);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBeUndefined();
  });

  it("supports default modifier", () => {
    const r = s.string().default("fallback").parse(undefined);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe("fallback");
  });

  it("still validates non-undefined after optional", () => {
    const r = s.string().optional().parse(42);
    expect(r.ok).toBe(false);
  });
});

describe("s.number", () => {
  it("returns ok for numbers", () => {
    const r = s.number().parse(42);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(42);
  });

  it("returns err for NaN", () => {
    const r = s.number().parse(NaN);
    expect(r.ok).toBe(false);
  });

  it("returns err for strings", () => {
    const r = s.number().parse("42");
    expect(r.ok).toBe(false);
  });
});

describe("s.boolean", () => {
  it("returns ok for true", () => {
    const r = s.boolean().parse(true);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(true);
  });

  it("returns ok for false", () => {
    const r = s.boolean().parse(false);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(false);
  });

  it("returns err for strings", () => {
    const r = s.boolean().parse("true");
    expect(r.ok).toBe(false);
  });
});

describe("s.literal", () => {
  it("returns ok for matching value", () => {
    const r = s.literal("hello").parse("hello");
    expect(r.ok).toBe(true);
  });

  it("returns err for different value", () => {
    const r = s.literal("hello").parse("world");
    expect(r.ok).toBe(false);
  });
});

describe("s.enum", () => {
  it("returns ok for allowed values", () => {
    const r = s.enum(["a", "b"]).parse("a");
    expect(r.ok).toBe(true);
  });

  it("returns err for disallowed values", () => {
    const r = s.enum(["a", "b"]).parse("c");
    expect(r.ok).toBe(false);
  });
});

// ── Composites ──

describe("s.object", () => {
  const User = s.object({
    name: s.string(),
    age: s.number(),
  });

  it("returns ok for valid objects", () => {
    const r = User.parse({ name: "Alice", age: 30 });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.name).toBe("Alice");
      expect(r.value.age).toBe(30);
    }
  });

  it("returns err for missing keys", () => {
    const r = User.parse({ name: "Alice" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.path).toContain("age");
  });

  it("returns err for wrong types", () => {
    const r = User.parse({ name: 42, age: 30 });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.path).toContain("name");
  });

  it("returns err for non-objects", () => {
    const r = User.parse("not an object");
    expect(r.ok).toBe(false);
  });

  it("returns err for null", () => {
    const r = User.parse(null);
    expect(r.ok).toBe(false);
  });

  it("nested path is correct in errors", () => {
    const Profile = s.object({
      user: s.object({ name: s.string() }),
    });
    const r = Profile.parse({ user: { name: 42 } });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.path).toBe("user.name");
  });
});

describe("s.array", () => {
  it("returns ok for valid arrays", () => {
    const r = s.array(s.number()).parse([1, 2, 3]);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toEqual([1, 2, 3]);
  });

  it("returns err for non-arrays", () => {
    const r = s.array(s.number()).parse("not an array");
    expect(r.ok).toBe(false);
  });

  it("returns err when an element fails", () => {
    const r = s.array(s.number()).parse([1, "two", 3]);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.path).toBe("1");
  });
});

describe("s.tuple", () => {
  const Pair = s.tuple([s.string(), s.number()]);

  it("returns ok for valid tuples", () => {
    const r = Pair.parse(["hello", 42]);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toEqual(["hello", 42]);
  });

  it("returns err for wrong length", () => {
    const r = Pair.parse(["hello"]);
    expect(r.ok).toBe(false);
  });

  it("returns err for wrong element type", () => {
    const r = Pair.parse(["hello", "world"]);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.path).toBe("1");
  });
});

describe("s.union", () => {
  const StrOrNum = s.union([s.string(), s.number()]);

  it("returns ok for first matching schema", () => {
    const r = StrOrNum.parse("hello");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe("hello");
  });

  it("returns ok for second matching schema", () => {
    const r = StrOrNum.parse(42);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(42);
  });

  it("returns err when no schema matches", () => {
    const r = StrOrNum.parse(true);
    expect(r.ok).toBe(false);
  });
});

// ── Modifiers ──

describe("modifiers", () => {
  it("optional allows undefined", () => {
    const r = s.string().optional().parse(undefined);
    expect(r.ok).toBe(true);
  });

  it("nullable allows null", () => {
    const r = s.string().nullable().parse(null);
    expect(r.ok).toBe(true);
  });

  it("default fills undefined", () => {
    const r = s.string().default("hello").parse(undefined);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe("hello");
  });

  it("default passes through defined values", () => {
    const r = s.string().default("hello").parse("world");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe("world");
  });

  it("chained optional + nullable works", () => {
    const schema = s.string().optional().nullable();
    expect(schema.parse(undefined).ok).toBe(true);
    expect(schema.parse(null).ok).toBe(true);
    expect(schema.parse("hello").ok).toBe(true);
  });
});

// ── Object modifiers ──

describe("strict", () => {
  const User = s.object({ name: s.string() });

  it("rejects extra keys", () => {
    const schema = User.strict();
    const r = schema.parse({ name: "Alice", extra: true });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.path).toBe("extra");
  });

  it("accepts exact keys", () => {
    const schema = User.strict();
    const r = schema.parse({ name: "Alice" });
    expect(r.ok).toBe(true);
  });

  it("passthrough after strict goes back to permissive", () => {
    const schema = User.strict().passthrough();
    const r = schema.parse({ name: "Alice", extra: true });
    expect(r.ok).toBe(true);
  });
});

describe("passthrough", () => {
  it("allows extra keys (default behavior)", () => {
    const schema = s.object({ name: s.string() });
    const r = schema.parse({ name: "Alice", extra: true });
    expect(r.ok).toBe(true);
  });
});

describe("partial", () => {
  const User = s.object({
    name: s.string(),
    age: s.number(),
  });

  it("allows all keys to be omitted", () => {
    const schema = User.partial();
    expect(schema.parse({}).ok).toBe(true);
    expect(schema.parse({ name: "Alice" }).ok).toBe(true);
    expect(schema.parse({ age: 30 }).ok).toBe(true);
  });

  it("still validates present keys", () => {
    const schema = User.partial();
    const r = schema.parse({ name: 42 });
    expect(r.ok).toBe(false);
  });
});

describe("required", () => {
  it("rejects undefined values", () => {
    const schema = s
      .object({
        name: s.string().optional(),
      })
      .required();
    const r = schema.parse({ name: undefined });
    expect(r.ok).toBe(false);
  });

  it("accepts defined values", () => {
    const schema = s
      .object({
        name: s.string().optional(),
      })
      .required();
    const r = schema.parse({ name: "Alice" });
    expect(r.ok).toBe(true);
  });
});

// ── Refine & Transform ──

describe("refine", () => {
  it("returns ok when predicate passes", () => {
    const schema = s.string().refine((v) => v.length >= 3, "too short");
    const r = schema.parse("hello");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe("hello");
  });

  it("returns err when predicate fails", () => {
    const schema = s.string().refine((v) => v.length >= 3, "too short");
    const r = schema.parse("hi");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.message).toContain("too short");
  });

  it("does not run refine when base schema fails", () => {
    let called = false;
    const schema = s.string().refine(() => {
      called = true;
      return true;
    }, "msg");
    schema.parse(42);
    expect(called).toBe(false);
  });

  it("chains multiple refines", () => {
    const schema = s
      .string()
      .refine((v) => v.length >= 3, "too short")
      .refine((v) => v.length <= 10, "too long");
    expect(schema.parse("hello").ok).toBe(true);
    expect(schema.parse("hi").ok).toBe(false);
    expect(schema.parse("hello world!").ok).toBe(false);
  });

  it("composes with objects", () => {
    const schema = s.object({
      name: s.string().refine((v) => v.length > 0, "name is required"),
      age: s.number().refine((v) => v >= 0, "age must be positive"),
    });
    expect(schema.parse({ name: "Alice", age: 30 }).ok).toBe(true);
    expect(schema.parse({ name: "", age: 30 }).ok).toBe(false);
    expect(schema.parse({ name: "Alice", age: -1 }).ok).toBe(false);
  });
});

describe("transform", () => {
  it("transforms a valid value", () => {
    const schema = s.string().transform((v) => v.trim().toLowerCase());
    const r = schema.parse("  HELLO  ");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe("hello");
  });

  it("does not transform when base schema fails", () => {
    let called = false;
    const schema = s.string().transform((v) => {
      called = true;
      return v;
    });
    schema.parse(42);
    expect(called).toBe(false);
  });

  it("changes the output type", () => {
    const schema = s.string().transform((v) => v.length);
    const r = schema.parse("hello");
    expect(r.ok).toBe(true);
    if (r.ok) {
      // Type should be number
      const n: number = r.value;
      expect(n).toBe(5);
    }
  });

  it("chains transform then refine", () => {
    const schema = s
      .string()
      .transform((v) => v.trim())
      .refine((v) => v.length >= 3, "too short after trim");
    expect(schema.parse("hello").ok).toBe(true);
    expect(schema.parse("  ab  ").ok).toBe(false);
  });
});

// ── Types ──

describe("type inference", () => {
  it("Infer extracts the type from a schema", () => {
    const StringSchema = s.string();
    type T = Infer<typeof StringSchema>;
    // T should be string — this test exists to catch type errors at compile time
    const _val: T = "hello";
    expect(_val).toBe("hello");
  });
});
