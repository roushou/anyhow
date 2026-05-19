import { describe, expect, it } from "bun:test";
import {
  andThen,
  map,
  mapErr,
  match,
  or,
  orElse,
  expect as expectResult,
  unwrap,
  unwrapOr,
} from "./combinators.js";
import { err, ok } from "./constructors.js";
import type { Result } from "./types.js";

describe("map", () => {
  it("transforms the value on ok", () => {
    const r: Result<number> = ok(5);
    const mapped = map(r, (v) => v * 2);
    expect(mapped.ok).toBe(true);
    if (mapped.ok) expect(mapped.value).toBe(10);
  });

  it("passes through on err", () => {
    const r: Result<number> = err(new Error("fail"));
    const mapped = map(r, (v) => v * 2);
    expect(mapped.ok).toBe(false);
    if (!mapped.ok) expect((mapped.error as Error).message).toBe("fail");
  });
});

describe("mapErr", () => {
  it("passes through on ok", () => {
    const r: Result<number, string> = ok(5);
    const mapped = mapErr(r, (e) => `wrapped: ${e}`);
    expect(mapped.ok).toBe(true);
    if (mapped.ok) expect(mapped.value).toBe(5);
  });

  it("transforms the error on err", () => {
    const r: Result<number, string> = err("raw");
    const mapped = mapErr(r, (e) => `wrapped: ${e}`);
    expect(mapped.ok).toBe(false);
    if (!mapped.ok) expect(mapped.error).toBe("wrapped: raw");
  });
});

describe("andThen", () => {
  it("chains on ok", () => {
    const r: Result<number> = ok(5);
    const chained = andThen(r, (v) => ok(v * 2));
    expect(chained.ok).toBe(true);
    if (chained.ok) expect(chained.value).toBe(10);
  });

  it("short-circuits on err", () => {
    const r: Result<number> = err(new Error("fail"));
    const chained = andThen(r, (v) => ok(v * 2));
    expect(chained.ok).toBe(false);
  });

  it("can return err from the chain", () => {
    const r: Result<number, string> = ok(-1);
    const chained = andThen(r, (v) => {
      if (v < 0) return err("negative");
      return ok(v);
    });
    expect(chained.ok).toBe(false);
    if (!chained.ok) expect(chained.error).toBe("negative");
  });
});

describe("unwrap", () => {
  it("returns the value on ok", () => {
    expect(unwrap(ok(42))).toBe(42);
  });

  it("throws the error on err", () => {
    expect(() => unwrap(err(new Error("boom")))).toThrow("boom");
  });
});

describe("unwrapOr", () => {
  it("returns the value on ok", () => {
    expect(unwrapOr(ok(42), 0)).toBe(42);
  });

  it("returns the fallback on err", () => {
    expect(unwrapOr(err("fail"), 0)).toBe(0);
  });
});

describe("match", () => {
  it("calls onOk on success", () => {
    const result = match(
      ok(5),
      (v) => `got ${v}`,
      (e) => `error: ${e}`,
    );
    expect(result).toBe("got 5");
  });

  it("calls onErr on failure", () => {
    const result = match(
      err("oops"),
      (v) => `got ${v}`,
      (e) => `error: ${e}`,
    );
    expect(result).toBe("error: oops");
  });
});

describe("or", () => {
  it("returns the first if Ok", () => {
    const result = or(ok(42), ok(0));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toBe(42);
  });

  it("returns the second if Err", () => {
    const result = or(err("fail"), ok(0));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toBe(0);
  });

  it("returns the second even if both are Err", () => {
    const result = or(err("first"), err("second"));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("second");
  });
});

describe("orElse", () => {
  it("returns the result if Ok", () => {
    const result = orElse(ok(42), (_e) => ok(0));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toBe(42);
  });

  it("calls fn with the error if Err", () => {
    const result = orElse(err("fail"), (e) => ok(`recovered: ${e}`));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toBe("recovered: fail");
  });

  it("does not call fn if Ok", () => {
    let called = false;
    orElse(ok(42), () => {
      called = true;
      return ok(0);
    });
    expect(called).toBe(false);
  });
});

describe("expect", () => {
  it("returns the value on Ok", () => {
    expect(expectResult(ok(42), "should have value")).toBe(42);
  });

  it("throws the message on Err", () => {
    expect(() => expectResult(err("boom"), "should have value")).toThrow("should have value");
  });
});
