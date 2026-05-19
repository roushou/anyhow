import { describe, expect, it } from "bun:test";
import {
  camelCase,
  pascalCase,
  snakeCase,
  kebabCase,
  slugify,
  stripIndent,
  template,
} from "./string.js";

// ── camelCase ────────────────────────────────────────────────────

describe("camelCase", () => {
  it("converts hyphenated to camelCase", () => {
    expect(camelCase("hello-world")).toBe("helloWorld");
  });

  it("converts space-separated to camelCase", () => {
    expect(camelCase("hello world")).toBe("helloWorld");
  });

  it("returns already camelCase unchanged", () => {
    expect(camelCase("helloWorld")).toBe("helloWorld");
  });

  it("lowercases the first word of PascalCase input", () => {
    expect(camelCase("HelloWorld")).toBe("helloWorld");
  });

  it("handles empty string", () => {
    expect(camelCase("")).toBe("");
  });

  it("handles letter→digit and digit→letter boundaries", () => {
    expect(camelCase("foo123bar")).toBe("foo123Bar");
  });
});

// ── pascalCase ───────────────────────────────────────────────────

describe("pascalCase", () => {
  it("converts hyphenated to PascalCase", () => {
    expect(pascalCase("hello-world")).toBe("HelloWorld");
  });

  it("title-cases already camelCase input", () => {
    expect(pascalCase("helloWorld")).toBe("HelloWorld");
  });

  it("returns already PascalCase unchanged", () => {
    expect(pascalCase("HelloWorld")).toBe("HelloWorld");
  });

  it("handles empty string", () => {
    expect(pascalCase("")).toBe("");
  });
});

// ── snakeCase ────────────────────────────────────────────────────

describe("snakeCase", () => {
  it("converts camelCase to snake_case", () => {
    expect(snakeCase("helloWorld")).toBe("hello_world");
  });

  it("converts PascalCase to snake_case", () => {
    expect(snakeCase("HelloWorld")).toBe("hello_world");
  });

  it("returns already snake_case unchanged", () => {
    expect(snakeCase("hello_world")).toBe("hello_world");
  });

  it("handles empty string", () => {
    expect(snakeCase("")).toBe("");
  });
});

// ── kebabCase ────────────────────────────────────────────────────

describe("kebabCase", () => {
  it("converts camelCase to kebab-case", () => {
    expect(kebabCase("helloWorld")).toBe("hello-world");
  });

  it("converts PascalCase to kebab-case", () => {
    expect(kebabCase("HelloWorld")).toBe("hello-world");
  });

  it("returns already kebab-case unchanged", () => {
    expect(kebabCase("hello-world")).toBe("hello-world");
  });

  it("handles empty string", () => {
    expect(kebabCase("")).toBe("");
  });
});

// ── slugify ──────────────────────────────────────────────────────

describe("slugify", () => {
  it("lowercases and replaces spaces with hyphens", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("strips special characters", () => {
    expect(slugify("Hello World!")).toBe("hello-world");
  });

  it("collapses multiple spaces and hyphens", () => {
    expect(slugify("a---b")).toBe("a-b");
    expect(slugify("a   b")).toBe("a-b");
  });

  it("trims leading and trailing non-alphanumeric chars", () => {
    expect(slugify("  Foo & Bar  ")).toBe("foo-bar");
  });

  it("handles empty string", () => {
    expect(slugify("")).toBe("");
  });
});

// ── stripIndent ──────────────────────────────────────────────────

describe("stripIndent", () => {
  it("strips uniform indent", () => {
    expect(stripIndent("  hello\n  world")).toBe("hello\nworld");
  });

  it("strips common prefix only (varied indent)", () => {
    expect(stripIndent("  hello\n    world")).toBe("hello\n  world");
  });

  it("leaves no-indent strings unchanged", () => {
    expect(stripIndent("hello\nworld")).toBe("hello\nworld");
  });

  it("handles empty string", () => {
    expect(stripIndent("")).toBe("");
  });

  it("handles single line", () => {
    expect(stripIndent("  hello")).toBe("hello");
  });

  it("ignores blank lines when computing indent", () => {
    expect(stripIndent("  hello\n\n  world")).toBe("hello\n\nworld");
  });
});

// ── template ─────────────────────────────────────────────────────

describe("template", () => {
  it("substitutes a single key", () => {
    expect(template("Hello {{name}}!", { name: "Alice" })).toBe("Hello Alice!");
  });

  it("substitutes multiple keys", () => {
    expect(template("{{greeting}} {{name}}", { greeting: "Hey", name: "Bob" })).toBe("Hey Bob");
  });

  it("accepts number values", () => {
    expect(template("{{a}} + {{b}}", { a: 1, b: 2 })).toBe("1 + 2");
  });

  it("throws when a key is missing", () => {
    expect(() => template("Hello {{name}}!", {})).toThrow('Missing template key: "name"');
  });

  it("returns the string unchanged when no placeholders exist", () => {
    expect(template("Hello world!", {})).toBe("Hello world!");
  });
});
