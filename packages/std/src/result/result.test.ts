import { describe, expect, it } from "bun:test";
import { ok, err, type Result } from "./result.js";
import { ResultStatic as R } from "./static.js";
import { pipeline } from "./pipeline.js";
import { Stepper } from "./stepper.js";

// ── Constructors ──

describe("ok", () => {
  it("creates a success result", () => {
    const r = ok(42);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(42);
  });

  it("has toJSON", () => {
    expect(JSON.stringify(ok(5))).toBe('{"ok":true,"value":5}');
  });
});

describe("err", () => {
  it("creates an error result", () => {
    const r: Result<number, string> = err("fail");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("fail");
  });

  it("has toJSON", () => {
    expect(JSON.stringify(err("boom"))).toBe('{"ok":false,"error":"boom"}');
  });
});

// ── map ──

describe("map", () => {
  it("transforms the value on ok", () => {
    const r = ok(5).map((v) => v * 2);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(10);
  });

  it("passes through on err", () => {
    const r: Result<number, string> = err("fail").map((v) => (v as number) * 2);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("fail");
  });
});

// ── mapErr ──

describe("mapErr", () => {
  it("passes through on ok", () => {
    const r = ok<number, string>(5).mapErr((e) => `wrapped: ${e}`);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(5);
  });

  it("transforms the error on err", () => {
    const r = err("raw").mapErr((e) => `wrapped: ${e}`);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("wrapped: raw");
  });
});

// ── andThen ──

describe("andThen", () => {
  it("chains on ok", () => {
    const r = ok(5).andThen((v) => ok(v * 2));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(10);
  });

  it("short-circuits on err", () => {
    const r: Result<number, string> = err("fail").andThen((v) => ok(v + 1));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("fail");
  });

  it("can return err from the chain", () => {
    const r = ok<number, string>(-1).andThen((v) => (v < 0 ? err("negative") : ok(v)));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("negative");
  });
});

// ── orElse ──

describe("orElse", () => {
  it("returns the result if Ok", () => {
    const r = ok(42).orElse((_e) => ok(0));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(42);
  });

  it("calls fn with the error if Err", () => {
    const r = err("fail").orElse((e) => ok(`recovered: ${e}`));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe("recovered: fail");
  });
});

// ── or ──

describe("or", () => {
  it("returns first if Ok", () => {
    const r = ok(42).or(ok(0));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(42);
  });

  it("returns second if Err", () => {
    const r = err("fail").or(ok<number, string>(0));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(0);
  });
});

// ── tap / tapErr ──

describe("tap", () => {
  it("calls fn on Ok and returns self", () => {
    let called = 0;
    const r = ok(5).tap((v) => {
      called = v;
    });
    expect(called).toBe(5);
    expect(r.ok).toBe(true);
  });

  it("does not call on Err", () => {
    let called = false;
    err("fail").tap(() => {
      called = true;
    });
    expect(called).toBe(false);
  });
});

describe("tapErr", () => {
  it("calls fn on Err and returns self", () => {
    let called: unknown = "";
    err("boom").tapErr((e) => {
      called = e;
    });
    expect(called).toBe("boom");
  });

  it("does not call on Ok", () => {
    let called = false;
    ok(5).tapErr(() => {
      called = true;
    });
    expect(called).toBe(false);
  });
});

// ── flatten ──

describe("flatten", () => {
  it("flattens nested Ok", () => {
    const r = ok(ok(5)).flatten();
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(5);
  });

  it("returns Err when outer is Ok but inner is Err", () => {
    const r = ok<Result<number, string>, string>(err("inner")).flatten();
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("inner");
  });

  it("returns Err when outer is Err", () => {
    const r: Result<number, string> = err("outer").flatten();
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("outer");
  });
});

// ── Terminal ──

describe("unwrap", () => {
  it("returns the value on ok", () => {
    expect(ok(42).unwrap()).toBe(42);
  });

  it("throws the error on err", () => {
    expect(() => err("boom").unwrap()).toThrow("boom");
  });
});

describe("unwrapOr", () => {
  it("returns the value on ok", () => {
    expect(ok(42).unwrapOr(0)).toBe(42);
  });

  it("returns the fallback on err", () => {
    const r: Result<number, string> = err("fail");
    expect(r.unwrapOr(0)).toBe(0);
  });
});

describe("expect", () => {
  it("returns the value on Ok", () => {
    expect(ok(42).expect("should have value")).toBe(42);
  });

  it("throws the message on Err", () => {
    expect(() => err("boom").expect("should have value")).toThrow("should have value");
  });
});

describe("match", () => {
  it("calls onOk on success", () => {
    const result = ok(5).match(
      (v) => `got ${v}`,
      () => "error",
    );
    expect(result).toBe("got 5");
  });

  it("calls onErr on failure", () => {
    const r: Result<number, string> = err("oops");
    const result = r.match(
      (v) => `got ${v}`,
      (e) => `error: ${e}`,
    );
    expect(result).toBe("error: oops");
  });
});

// ── Static combinators ──

describe("Result.from", () => {
  it("returns ok when the function succeeds", () => {
    const r = R.from(() => JSON.parse('{"name":"Alice"}'));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toEqual({ name: "Alice" });
  });

  it("returns err when the function throws", () => {
    const r = R.from(() => {
      throw new Error("boom");
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.message).toBe("boom");
  });

  it("wraps non-Error throws", () => {
    const r = R.from(() => {
      throw "raw string";
    });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error).toBeInstanceOf(Error);
      expect(r.error.message).toBe("raw string");
    }
  });
});

describe("Result.fromAsync", () => {
  it("returns ok on success", async () => {
    const r = await R.fromAsync(() => Promise.resolve(42));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(42);
  });

  it("returns err on rejection", async () => {
    const r = await R.fromAsync(() => Promise.reject(new Error("fail")));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.message).toBe("fail");
  });
});

describe("Result.fromNullable", () => {
  it("returns ok for non-null values", () => {
    const r = R.fromNullable("hello", new Error("missing"));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe("hello");
  });

  it("returns err for null", () => {
    const r = R.fromNullable(null, new Error("missing"));
    expect(r.ok).toBe(false);
  });

  it("returns err for undefined", () => {
    const r = R.fromNullable(undefined, new Error("missing"));
    expect(r.ok).toBe(false);
  });
});

describe("Result.all", () => {
  it("returns ok with all values", () => {
    const r = R.all([ok(1), ok(2), ok(3)]);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toEqual([1, 2, 3]);
  });

  it("returns first err", () => {
    const r = R.all([ok(1), err("fail"), ok(3)]);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("fail");
  });

  it("returns ok with empty array", () => {
    const r = R.all([]);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toEqual([]);
  });
});

describe("Result.partition", () => {
  it("splits into ok and err", () => {
    const { ok: o, err: e } = R.partition([ok(1), err("a"), ok(2), err("b")]);
    expect(o).toEqual([1, 2]);
    expect(e).toEqual(["a", "b"]);
  });
});

describe("Result.any", () => {
  it("returns first ok", () => {
    const r = R.any([err("a"), ok(42), err("b")]);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(42);
  });

  it("returns all errors when none ok", () => {
    const r: Result<number, string[]> = R.any([err("a"), err("b")]);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toEqual(["a", "b"]);
  });
});

// ── Pipeline ──

describe("Pipeline", () => {
  const pipe = pipeline<string, string>()
    .pipe("parse", (s: string) => {
      const n = parseInt(s);
      return isNaN(n) ? err(`Not a number: ${s}`) : ok(n);
    })
    .pipe("double", (n: number) => ok(n * 2));

  it("runs all stages on success", () => {
    const r = pipe.run("21");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(42);
  });

  it("short-circuits on first error", () => {
    const r = pipe.run("abc");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain("Not a number");
  });

  it("describes stages", () => {
    expect(pipe.describe()).toEqual(["parse", "double"]);
  });

  it("runWithTaps observes each stage", () => {
    const starts: string[] = [];
    const ends: string[] = [];
    pipe.runWithTaps(
      "10",
      (name) => starts.push(name),
      (name, r) => ends.push(`${name}:${r.ok}`),
    );
    expect(starts).toEqual(["parse", "double"]);
    expect(ends).toEqual(["parse:true", "double:true"]);
  });

  it("pipeWithRecovery recovers from error", () => {
    const p = pipeline<string, string>().pipeWithRecovery(
      "lenient-parse",
      (s: string) => {
        const n = parseInt(s);
        return isNaN(n) ? err(`bad: ${s}`) : ok(n);
      },
      (_err, _input) => ok<number, string>(0),
    );
    const r = p.run("abc");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(0);
  });

  it("chain composes two pipelines", () => {
    const a = pipeline<string>().pipe("to-num", (s: string) => ok(parseInt(s)));
    const b = pipeline<number>().pipe("double", (n: number) => ok(n * 2));
    const r = a.chain(b).run("5");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(10);
  });
});

// ── Stepper ──

describe("Stepper", () => {
  const stepper = new Stepper<"a" | "b" | "c", { n: number }, string>()
    .step("a", (d) => ok({ ...d, n: d.n + 1 }))
    .step("b", (d) => ok({ ...d, n: d.n * 2 }))
    .step("c", (d) => (d.n > 0 ? ok(d) : err("non-positive")))
    .after("a", ["b", "c"])
    .after("b", ["c"]);

  it("runs a sequence successfully", () => {
    const r = stepper.run("a", { n: 2 }, ["b", "c"]);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.data.n).toBe(4);
      expect(r.value.step).toBe("c");
      expect(r.value.history.length).toBe(2);
    }
  });

  it("advances one step at a time", () => {
    const s1 = stepper.advance({ step: "a", data: { n: 1 }, history: [] }, "b");
    expect(s1.ok).toBe(true);
    if (s1.ok) {
      expect(s1.value.data.n).toBe(2);
      expect(s1.value.step).toBe("b");
    }
  });

  it("fails on a failing step", () => {
    const r = stepper.run("a", { n: -5 }, ["b", "c"]);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("non-positive");
  });

  it("lists next steps", () => {
    expect(stepper.nextSteps("a")).toEqual(["b", "c"]);
    expect(stepper.nextSteps("c")).toEqual([]);
  });
});
