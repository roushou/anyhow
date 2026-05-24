import { describe, it, expect } from "bun:test";
import { fromSchema } from "./pipeline.js";
import { Codec } from "./codec.js";
import { json } from "./json.js";
import { s } from "../schema/index.js";

describe("Codec.fromSchema", () => {
  const User = s.object({ name: s.string(), age: s.number() });

  it("decodes via schema validation", () => {
    const codec = fromSchema(User);
    const result = codec.decode('{"name":"Alice","age":30}');
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toEqual({ name: "Alice", age: 30 });
  });

  it("fails on invalid data", () => {
    const codec = fromSchema(User);
    const result = codec.decode('{"name":123}');
    expect(result.ok).toBe(false);
  });
});

describe("Codec.pipeline", () => {
  const User = s.object({ name: s.string(), age: s.number() });

  it("chains json decode with schema validation", () => {
    const UserCodec = Codec.pipeline(json, User);
    const result = UserCodec.decode('{"name":"Alice","age":30}');
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toEqual({ name: "Alice", age: 30 });
  });

  it("returns error from first failing step", () => {
    const UserCodec = Codec.pipeline(json, User);
    const result = UserCodec.decode("{invalid");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("parse_error");
  });

  it("returns validation error from schema step", () => {
    const UserCodec = Codec.pipeline(json, User);
    const result = UserCodec.decode('{"name":123,"age":30}');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("validation_error");
  });

  it("throws on encode", () => {
    const UserCodec = Codec.pipeline(json, User);
    expect(() => UserCodec.encode({} as any)).toThrow("Pipeline");
  });
});
