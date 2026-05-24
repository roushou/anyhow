import { describe, expect, it } from "bun:test";
import { camelCase, pascalCase, snakeCase, kebabCase } from "./case.js";
import type { CamelCase, PascalCase, SnakeCase, KebabCase, ScreamingSnakeCase } from "./case.js";

// ── Runtime tests ──

describe("camelCase", () => {
  it("converts hyphenated to camelCase", () => expect(camelCase("hello-world")).toBe("helloWorld"));
  it("returns already camelCase unchanged", () =>
    expect(camelCase("helloWorld")).toBe("helloWorld"));
  it("lowercases the first word of PascalCase input", () =>
    expect(camelCase("HelloWorld")).toBe("helloWorld"));
  it("handles empty string", () => expect(camelCase("")).toBe(""));
});

describe("pascalCase", () => {
  it("converts hyphenated to PascalCase", () =>
    expect(pascalCase("hello-world")).toBe("HelloWorld"));
  it("title-cases already camelCase input", () =>
    expect(pascalCase("helloWorld")).toBe("HelloWorld"));
  it("handles empty string", () => expect(pascalCase("")).toBe(""));
});

describe("snakeCase", () => {
  it("converts camelCase to snake_case", () => expect(snakeCase("helloWorld")).toBe("hello_world"));
  it("converts PascalCase to snake_case", () =>
    expect(snakeCase("HelloWorld")).toBe("hello_world"));
  it("handles empty string", () => expect(snakeCase("")).toBe(""));
});

describe("kebabCase", () => {
  it("converts camelCase to kebab-case", () => expect(kebabCase("helloWorld")).toBe("hello-world"));
  it("converts PascalCase to kebab-case", () =>
    expect(kebabCase("HelloWorld")).toBe("hello-world"));
  it("handles empty string", () => expect(kebabCase("")).toBe(""));
});

// ── Type-level tests ──
//
// Each assigns a value typed with the case type to a variable typed as the
// expected literal.  TypeScript verifies these at compile time — a mismatched
// type would be a compilation error.

describe("SnakeCase", () => {
  it("camelCase", () => {
    const _: SnakeCase<"helloWorld"> = "hello_world";
    expect(_).toBe("hello_world");
  });

  it("PascalCase", () => {
    const _: SnakeCase<"HelloWorld"> = "hello_world";
    expect(_).toBe("hello_world");
  });

  it("consecutive uppercase (XMLParser)", () => {
    const _: SnakeCase<"XMLParser"> = "xml_parser";
    expect(_).toBe("xml_parser");
  });

  it("already snake_case passes through", () => {
    const _: SnakeCase<"already_snake"> = "already_snake";
    expect(_).toBe("already_snake");
  });

  it("single word", () => {
    const _: SnakeCase<"hello"> = "hello";
    expect(_).toBe("hello");
  });

  it("empty string", () => {
    const _: SnakeCase<""> = "";
    expect(_).toBe("");
  });
});

describe("ScreamingSnakeCase", () => {
  it("camelCase", () => {
    const _: ScreamingSnakeCase<"helloWorld"> = "HELLO_WORLD";
    expect(_).toBe("HELLO_WORLD");
  });

  it("PascalCase", () => {
    const _: ScreamingSnakeCase<"HelloWorld"> = "HELLO_WORLD";
    expect(_).toBe("HELLO_WORLD");
  });

  it("consecutive uppercase", () => {
    const _: ScreamingSnakeCase<"XMLParser"> = "XML_PARSER";
    expect(_).toBe("XML_PARSER");
  });

  it("single word", () => {
    const _: ScreamingSnakeCase<"hello"> = "HELLO";
    expect(_).toBe("HELLO");
  });

  it("empty string", () => {
    const _: ScreamingSnakeCase<""> = "";
    expect(_).toBe("");
  });
});

describe("KebabCase", () => {
  it("camelCase", () => {
    const _: KebabCase<"helloWorld"> = "hello-world";
    expect(_).toBe("hello-world");
  });

  it("PascalCase", () => {
    const _: KebabCase<"HelloWorld"> = "hello-world";
    expect(_).toBe("hello-world");
  });

  it("consecutive uppercase", () => {
    const _: KebabCase<"XMLParser"> = "xml-parser";
    expect(_).toBe("xml-parser");
  });

  it("already kebab-case passes through", () => {
    const _: KebabCase<"already-kebab"> = "already-kebab";
    expect(_).toBe("already-kebab");
  });

  it("single word", () => {
    const _: KebabCase<"hello"> = "hello";
    expect(_).toBe("hello");
  });

  it("empty string", () => {
    const _: KebabCase<""> = "";
    expect(_).toBe("");
  });
});

describe("CamelCase", () => {
  it("snake_case", () => {
    const _: CamelCase<"hello_world"> = "helloWorld";
    expect(_).toBe("helloWorld");
  });

  it("kebab-case", () => {
    const _: CamelCase<"kebab-case"> = "kebabCase";
    expect(_).toBe("kebabCase");
  });

  it("SCREAMING_SNAKE_CASE", () => {
    const _: CamelCase<"FOO_BAR_BAZ"> = "fooBarBaz";
    expect(_).toBe("fooBarBaz");
  });

  it("multiple segments", () => {
    const _: CamelCase<"one_two_three"> = "oneTwoThree";
    expect(_).toBe("oneTwoThree");
  });

  it("single word", () => {
    const _: CamelCase<"hello"> = "hello";
    expect(_).toBe("hello");
  });

  it("empty string", () => {
    const _: CamelCase<""> = "";
    expect(_).toBe("");
  });
});

describe("PascalCase", () => {
  it("snake_case", () => {
    const _: PascalCase<"hello_world"> = "HelloWorld";
    expect(_).toBe("HelloWorld");
  });

  it("kebab-case", () => {
    const _: PascalCase<"kebab-case"> = "KebabCase";
    expect(_).toBe("KebabCase");
  });

  it("multiple segments", () => {
    const _: PascalCase<"one_two_three"> = "OneTwoThree";
    expect(_).toBe("OneTwoThree");
  });

  it("single word", () => {
    const _: PascalCase<"hello"> = "Hello";
    expect(_).toBe("Hello");
  });

  it("empty string", () => {
    const _: PascalCase<""> = "";
    expect(_).toBe("");
  });
});
