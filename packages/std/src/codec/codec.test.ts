import { describe, it, expect } from "bun:test";
import { from } from "./codec.js";
import { ok, err } from "../result/result.js";

describe("Codec.from", () => {
  it("creates a working codec from encode/decode", () => {
    const upper = from({
      encode: (s: string) => s.toUpperCase(),
      decode: (s: string) => {
        if (s !== s.toUpperCase()) return err({ code: "not_upper", message: "Expected uppercase" });
        return ok(s.toLowerCase());
      },
    });

    expect(upper.encode("hello")).toBe("HELLO");
    const decoded = upper.decode("HELLO");
    expect(decoded.ok).toBe(true);
    if (decoded.ok) expect(decoded.value).toBe("hello");
  });
});
