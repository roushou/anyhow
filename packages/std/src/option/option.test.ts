import { describe, expect, it } from "bun:test";
import { some, none, type Option } from "./option.js";
import { OptionStatic as O } from "./static.js";
import { ok, err } from "../result/result.js";

// ── Constructors ──

describe("some", () => {
  it("creates a Some variant", () => {
    const o = some(42);
    expect(o.some).toBe(true);
    if (o.isSome()) expect(o.value).toBe(42);
  });

  it("has toJSON", () => {
    expect(JSON.stringify(some(5))).toBe('{"some":true,"value":5}');
  });
});

describe("none", () => {
  it("creates a None variant", () => {
    expect(none().some).toBe(false);
  });

  it("is a singleton", () => {
    expect(none()).toBe(none() as any);
  });

  it("has toJSON", () => {
    expect(JSON.stringify(none())).toBe('{"some":false}');
  });
});

// ── map ──

describe("map", () => {
  it("transforms value on Some", () => {
    const o = some(5).map((v) => v * 2);
    expect(o.isSome()).toBe(true);
    if (o.isSome()) expect(o.value).toBe(10);
  });

  it("passes through None", () => {
    const o = none().map((v) => (v as number) * 2);
    expect(o.isNone()).toBe(true);
  });
});

// ── andThen ──

describe("andThen", () => {
  it("chains on Some", () => {
    const o = some(5).andThen((v) => some(v * 2));
    expect(o.isSome()).toBe(true);
    if (o.isSome()) expect(o.value).toBe(10);
  });

  it("short-circuits on None", () => {
    const o = none().andThen((v) => some((v as number) * 2));
    expect(o.isNone()).toBe(true);
  });

  it("can return None from chain", () => {
    const o = some(-1).andThen((v) => (v < 0 ? none() : some(v)));
    expect(o.isNone()).toBe(true);
  });
});

// ── filter ──

describe("filter", () => {
  it("returns Some when predicate passes", () => {
    const o = some(5).filter((v) => v > 0);
    expect(o.isSome()).toBe(true);
    if (o.isSome()) expect(o.value).toBe(5);
  });

  it("returns None when predicate fails", () => {
    const o = some(5).filter((v) => v > 10);
    expect(o.isNone()).toBe(true);
  });

  it("returns None when None", () => {
    expect((none() as Option<any>).filter(() => true).isNone()).toBe(true);
  });
});

// ── or / orElse ──

describe("or", () => {
  it("returns first if Some", () => {
    const o = some(1).or(some(2));
    expect(o.isSome()).toBe(true);
    if (o.isSome()) expect(o.value).toBe(1);
  });

  it("returns second if None", () => {
    const o = (none() as Option<number>).or(some(2));
    expect(o.isSome()).toBe(true);
    if (o.isSome()) expect(o.value).toBe(2);
  });
});

describe("orElse", () => {
  it("returns opt if Some", () => {
    const o = some(1).orElse(() => some(2));
    expect(o.isSome()).toBe(true);
    if (o.isSome()) expect(o.value).toBe(1);
  });

  it("calls fn if None", () => {
    const o = (none() as Option<number>).orElse(() => some(2));
    expect(o.isSome()).toBe(true);
    if (o.isSome()) expect(o.value).toBe(2);
  });
});

// ── tap ──

describe("tap", () => {
  it("calls fn on Some and returns self", () => {
    let called = 0;
    const o = some(5).tap((v) => {
      called = v;
    });
    expect(called).toBe(5);
    expect(o.isSome()).toBe(true);
  });

  it("does not call on None", () => {
    let called = false;
    none().tap(() => {
      called = true;
    });
    expect(called).toBe(false);
  });
});

// ── zip / zipWith ──

describe("zip", () => {
  it("zips two Somes", () => {
    const o = some("a").zip(some(1));
    expect(o.isSome()).toBe(true);
    if (o.isSome()) expect(o.value).toEqual(["a", 1]);
  });

  it("returns None if either is None", () => {
    expect(
      some(1)
        .zip(none() as Option<number>)
        .isNone(),
    ).toBe(true);
    expect((none() as Option<number>).zip(some(1)).isNone()).toBe(true);
  });
});

describe("zipWith", () => {
  it("combines two Somes with a function", () => {
    const o = some(2).zipWith(some(3), (a, b) => a * b);
    expect(o.isSome()).toBe(true);
    if (o.isSome()) expect(o.value).toBe(6);
  });

  it("returns None if either is None", () => {
    expect(
      some(1)
        .zipWith(none() as Option<number>, (a, b) => (a as number) + (b as number))
        .isNone(),
    ).toBe(true);
  });
});

// ── flatten ──

describe("flatten", () => {
  it("flattens nested Some", () => {
    const o = some(some(5)).flatten();
    expect(o.isSome()).toBe(true);
    if (o.isSome()) expect(o.value).toBe(5);
  });

  it("returns None for nested None inside Some", () => {
    const o = some(none()).flatten();
    expect(o.isNone()).toBe(true);
  });

  it("returns None when outer is None", () => {
    expect(none().flatten().isNone()).toBe(true);
  });
});

// ── Terminal ──

describe("unwrap", () => {
  it("returns value on Some", () => {
    expect(some(42).unwrap()).toBe(42);
  });

  it("throws on None", () => {
    expect(() => none().unwrap()).toThrow("Called unwrap on None");
  });
});

describe("unwrapOr", () => {
  it("returns value on Some", () => {
    expect(some(42).unwrapOr(0)).toBe(42);
  });

  it("returns fallback on None", () => {
    expect((none() as Option<number>).unwrapOr(0)).toBe(0);
  });
});

describe("expect", () => {
  it("returns value on Some", () => {
    expect(some(42).expect("missing")).toBe(42);
  });

  it("throws message on None", () => {
    expect(() => none().expect("missing")).toThrow("missing");
  });
});

describe("match", () => {
  it("calls onSome on Some", () => {
    expect(
      some(5).match(
        (v) => `got ${v}`,
        () => "nothing",
      ),
    ).toBe("got 5");
  });

  it("calls onNone on None", () => {
    expect(
      none().match(
        (v) => `got ${v}`,
        () => "nothing",
      ),
    ).toBe("nothing");
  });
});

// ── isSome / isNone ──

describe("isSome / isNone", () => {
  it("isSome narrows to Some", () => {
    const o: Option<number> = some(42);
    if (o.isSome()) {
      const n: number = o.value;
      expect(n).toBe(42);
    }
  });

  it("isNone narrows to None", () => {
    const o: Option<number> = none();
    expect(o.isNone()).toBe(true);
  });
});

// ── Static combinators ──

describe("Option.fromNullable", () => {
  it("returns Some for value", () => {
    const o = O.fromNullable("hello");
    expect(o.isSome()).toBe(true);
    if (o.isSome()) expect(o.value).toBe("hello");
  });

  it("returns None for null", () => {
    expect(O.fromNullable(null).isNone()).toBe(true);
  });

  it("returns None for undefined", () => {
    expect(O.fromNullable(undefined).isNone()).toBe(true);
  });
});

describe("Option.okOr", () => {
  it("returns Ok for Some", () => {
    const r = O.okOr(some(5), "missing");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(5);
  });

  it("returns Err for None", () => {
    const r = O.okOr(none(), "missing");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("missing");
  });
});

describe("Option.okOrElse", () => {
  it("returns Ok for Some", () => {
    const r = O.okOrElse(some(5), () => "missing");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(5);
  });

  it("returns Err for None (lazy)", () => {
    let called = false;
    const r = O.okOrElse(none(), () => {
      called = true;
      return "missing";
    });
    expect(r.ok).toBe(false);
    expect(called).toBe(true);
  });
});

describe("Option.transpose", () => {
  it("Some(Ok) → Ok(Some)", () => {
    const r = O.transpose(some(ok(5)));
    expect(r.ok).toBe(true);
    if (r.ok && r.value.isSome()) expect(r.value.value).toBe(5);
  });

  it("Some(Err) → Err", () => {
    const r = O.transpose(some(err<string>("fail")));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("fail");
  });

  it("None → Ok(None)", () => {
    const r = O.transpose(none());
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.isNone()).toBe(true);
  });
});
