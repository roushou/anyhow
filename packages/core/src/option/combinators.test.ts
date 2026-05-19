import { describe, expect, it } from "bun:test";
import {
  andThen,
  expect as expectCombinator,
  map,
  match,
  or,
  orElse,
  unwrapOr,
} from "./combinators.js";
import { none, some } from "./constructors.js";
import type { Option } from "./types.js";

describe("map", () => {
  it("transforms the value on Some", () => {
    const opt: Option<number> = some(5);
    const mapped = map(opt, (v) => v * 2);
    expect(mapped.some).toBe(true);
    if (mapped.some) expect(mapped.value).toBe(10);
  });

  it("passes through None", () => {
    const opt: Option<number> = none();
    const mapped = map(opt, (v) => v * 2);
    expect(mapped.some).toBe(false);
  });
});

describe("andThen", () => {
  it("chains on Some", () => {
    const opt: Option<number> = some(5);
    const chained = andThen(opt, (v) => some(v * 2));
    expect(chained.some).toBe(true);
    if (chained.some) expect(chained.value).toBe(10);
  });

  it("short-circuits on None", () => {
    const opt: Option<number> = none();
    const chained = andThen(opt, (v) => some(v * 2));
    expect(chained.some).toBe(false);
  });

  it("can return None from the chain", () => {
    const opt: Option<number> = some(-1);
    const chained = andThen(opt, (v) => {
      if (v < 0) return none();
      return some(v);
    });
    expect(chained.some).toBe(false);
  });
});

describe("unwrapOr", () => {
  it("returns the value on Some", () => {
    expect(unwrapOr(some(42), 0)).toBe(42);
  });

  it("returns the fallback on None", () => {
    expect(unwrapOr(none(), 0)).toBe(0);
  });
});

describe("match", () => {
  it("calls onSome on Some", () => {
    const result = match(
      some(5),
      (v) => `got ${v}`,
      () => "got nothing",
    );
    expect(result).toBe("got 5");
  });

  it("calls onNone on None", () => {
    const result = match(
      none(),
      (v) => `got ${v}`,
      () => "got nothing",
    );
    expect(result).toBe("got nothing");
  });
});

describe("or", () => {
  it("returns first if Some", () => {
    const result = or(some(1), some(2));
    expect(result.some).toBe(true);
    if (result.some) expect(result.value).toBe(1);
  });

  it("returns second if None", () => {
    const result = or(none(), some(2));
    expect(result.some).toBe(true);
    if (result.some) expect(result.value).toBe(2);
  });

  it("returns None if both are None", () => {
    const result = or(none(), none());
    expect(result.some).toBe(false);
  });
});

describe("orElse", () => {
  it("returns opt if Some", () => {
    const result = orElse(some(1), () => some(2));
    expect(result.some).toBe(true);
    if (result.some) expect(result.value).toBe(1);
  });

  it("calls fn if None", () => {
    const called: string[] = [];
    const result = orElse(none(), () => {
      called.push("fallback");
      return some(2);
    });
    expect(result.some).toBe(true);
    if (result.some) expect(result.value).toBe(2);
    expect(called).toEqual(["fallback"]);
  });

  it("does not call fn if Some", () => {
    const called: string[] = [];
    const result = orElse(some(1), () => {
      called.push("fallback");
      return some(2);
    });
    expect(result.some).toBe(true);
    if (result.some) expect(result.value).toBe(1);
    expect(called).toEqual([]);
  });

  it("returns None if fn returns None", () => {
    const result = orElse(none(), () => none());
    expect(result.some).toBe(false);
  });
});

describe("expect", () => {
  it("returns the value on Some", () => {
    expect(expectCombinator(some(42), "expected a value")).toBe(42);
  });

  it("throws with the message on None", () => {
    expect(() => expectCombinator(none(), "expected a value")).toThrow("expected a value");
  });
});
