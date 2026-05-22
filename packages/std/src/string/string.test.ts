import { describe, expect, it } from "bun:test";
import {
  camelCase,
  pascalCase,
  snakeCase,
  kebabCase,
  slugify,
  stripIndent,
  template,
  capitalize,
  randomString,
  decapitalize,
  reverse,
  padStart,
  padEnd,
  wrap,
  byteLength,
} from "./string.js";

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

describe("slugify", () => {
  it("lowercases and replaces spaces with hyphens", () =>
    expect(slugify("Hello World")).toBe("hello-world"));
  it("strips special characters", () => expect(slugify("Hello World!")).toBe("hello-world"));
  it("collapses multiple hyphens", () => expect(slugify("a---b")).toBe("a-b"));
  it("trims leading and trailing chars", () => expect(slugify("  Foo & Bar  ")).toBe("foo-bar"));
  it("handles empty string", () => expect(slugify("")).toBe(""));
});

describe("stripIndent", () => {
  it("strips uniform indent", () => expect(stripIndent("  hello\n  world")).toBe("hello\nworld"));
  it("strips common prefix only", () =>
    expect(stripIndent("  hello\n    world")).toBe("hello\n  world"));
  it("leaves no-indent strings unchanged", () =>
    expect(stripIndent("hello\nworld")).toBe("hello\nworld"));
  it("handles empty string", () => expect(stripIndent("")).toBe(""));
  it("handles single line", () => expect(stripIndent("  hello")).toBe("hello"));
  it("ignores blank lines", () => expect(stripIndent("  hello\n\n  world")).toBe("hello\n\nworld"));
});

describe("template", () => {
  it("substitutes a single key", () => {
    const r = template("Hello {{name}}!", { name: "Alice" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe("Hello Alice!");
  });

  it("substitutes multiple keys", () => {
    const r = template("{{greeting}} {{name}}", { greeting: "Hey", name: "Bob" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe("Hey Bob");
  });

  it("accepts number values", () => {
    const r = template("{{a}} + {{b}}", { a: 1, b: 2 });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe("1 + 2");
  });

  it("returns Err when a key is missing", () => {
    const r = template("Hello {{name}}!", {});
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.message).toBe('Missing template key: "name"');
  });

  it("returns unchanged when no placeholders exist", () => {
    const r = template("Hello world!", {});
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe("Hello world!");
  });
});

describe("capitalize", () => {
  it("capitalizes a lowercase word", () => expect(capitalize("hello")).toBe("Hello"));
  it("lowercases the rest of an all-caps word", () => expect(capitalize("HELLO")).toBe("Hello"));
  it("handles already capitalized", () => expect(capitalize("Hello")).toBe("Hello"));
  it("handles empty string", () => expect(capitalize("")).toBe(""));
  it("handles single character", () => expect(capitalize("a")).toBe("A"));
});

describe("randomString", () => {
  it("returns a string of the given length", () => expect(randomString(8).length).toBe(8));
  it("returns a string of length 0 for 0", () => expect(randomString(0).length).toBe(0));
  it("contains only alphanumeric characters", () => {
    for (let i = 0; i < 20; i++) {
      expect(/^[A-Za-z0-9]+$/.test(randomString(32))).toBe(true);
    }
  });
  it("produces different strings on successive calls", () => {
    expect(randomString(16)).not.toBe(randomString(16));
  });
});

describe("decapitalize", () => {
  it("lowercases the first character", () => expect(decapitalize("Hello")).toBe("hello"));
  it("leaves the rest of the string untouched", () => expect(decapitalize("HELLO")).toBe("hELLO"));
  it("handles already-decapitalized input", () => expect(decapitalize("hello")).toBe("hello"));
  it("handles empty string", () => expect(decapitalize("")).toBe(""));
  it("handles single character", () => expect(decapitalize("A")).toBe("a"));
});

describe("reverse", () => {
  it("reverses a string", () => expect(reverse("hello")).toBe("olleh"));
  it("handles empty string", () => expect(reverse("")).toBe(""));
  it("handles single character", () => expect(reverse("a")).toBe("a"));
  it("handles palindrome", () => expect(reverse("racecar")).toBe("racecar"));
  it("handles unicode characters", () => expect(reverse("a😊b")).toBe("b😊a"));
});

describe("padStart", () => {
  it("pads to the given length", () => expect(padStart("42", 5, "0")).toBe("00042"));
  it("defaults to space padding", () => expect(padStart("a", 3)).toBe("  a"));
  it("returns the original when already long enough", () =>
    expect(padStart("hello", 3)).toBe("hello"));
  it("handles empty string", () => expect(padStart("", 3, "*")).toBe("***"));
});

describe("padEnd", () => {
  it("pads to the given length", () => expect(padEnd("42", 5, "-")).toBe("42---"));
  it("defaults to space padding", () => expect(padEnd("a", 3)).toBe("a  "));
  it("returns the original when already long enough", () =>
    expect(padEnd("hello", 3)).toBe("hello"));
  it("handles empty string", () => expect(padEnd("", 3, "*")).toBe("***"));
});

describe("wrap", () => {
  it("wraps text at word boundaries", () =>
    expect(wrap("hello world foo", 9)).toBe("hello\nworld foo"));
  it("does not wrap when text fits", () => expect(wrap("hello world", 15)).toBe("hello world"));
  it("splits long words that exceed width", () =>
    expect(wrap("abcdefghij", 4)).toBe("abcd\nefgh\nij"));
  it("handles multiple spaces between words", () => expect(wrap("a  b  c", 3)).toBe("a b\nc"));
  it("handles empty string", () => expect(wrap("", 10)).toBe(""));
  it("handles whitespace-only string", () => expect(wrap("   ", 10)).toBe(""));
  it("wraps mixed short and long words", () =>
    expect(wrap("short looooongword here", 8)).toBe("short\nlooooong\nword\nhere"));
});

describe("byteLength", () => {
  it("returns the correct byte length for ASCII", () => expect(byteLength("hello")).toBe(5));
  it("returns 0 for empty string", () => expect(byteLength("")).toBe(0));
  it("counts multi-byte UTF-8 characters correctly", () => {
    // 你好 = 6 bytes (3 per Chinese character)
    expect(byteLength("你好")).toBe(6);
  });
  it("handles emoji", () => {
    // 😊 is 4 bytes in UTF-8
    expect(byteLength("😊")).toBe(4);
  });
  it("handles mixed content", () => {
    // "a你" = 1 (ASCII) + 3 (Chinese) = 4
    expect(byteLength("a你")).toBe(4);
  });
});
