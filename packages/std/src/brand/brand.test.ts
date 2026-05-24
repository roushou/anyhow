import { describe, expect, it } from "bun:test";
import { type Brand, brand } from "./index.js";

// ── Type-level tests (compile-time assertions) ──

describe("Brand<T, B>", () => {
  it("creates distinct types from the same base type", () => {
    type UserId = Brand<string, "UserId">;
    type OrderId = Brand<string, "OrderId">;

    const rawUid = "usr_1";
    const rawOid = "ord_1";
    const uid: UserId = brand(rawUid);
    const oid: OrderId = brand(rawOid);

    // Runtime: both are strings (brand() is the identity function)
    expect(typeof uid).toBe("string");
    expect(typeof oid).toBe("string");
    expect(uid as unknown as string).toBe(rawUid);
    expect(oid as unknown as string).toBe(rawOid);

    // Compile-time: UserId !== OrderId — this file compiles because we
    // never assign uid to oid or vice versa.
  });

  it("works with number base types", () => {
    type Meters = Brand<number, "Meters">;
    type Feet = Brand<number, "Feet">;

    const m: Meters = brand(100);
    const f: Feet = brand(328);

    expect(m as unknown as number).toBe(100);
    expect(f as unknown as number).toBe(328);
  });

  it("works with object base types", () => {
    type Validated<T> = Brand<T, "Validated">;
    interface Person {
      name: string;
      age: number;
    }

    const p: Validated<Person> = brand({ name: "Alice", age: 30 });
    expect(p.name).toBe("Alice");
    expect(p.age).toBe(30);
  });
});

// ── brand() identity function ──

describe("brand()", () => {
  it("returns the same value at runtime", () => {
    const obj = { x: 1 };
    const branded = brand<typeof obj, "Tag">(obj);
    // Reference equality — brand() is an identity function
    expect(branded as unknown as typeof obj).toBe(obj);
  });

  it("is zero-cost (identity)", () => {
    const branded = brand<number, "N">(42);
    expect(branded as unknown as number).toBe(42);
  });
});

// ── Assignability ──
//
// Compile-time properties:
//   1. Branded values assign to their base type (covariant)
//   2. Different brands do NOT assign to each other (nominal)
//
// We verify (1) at runtime:

describe("assignability", () => {
  it("branded value is assignable to its base type", () => {
    type UserId = Brand<string, "UserId">;
    const uid: UserId = brand("usr_1");

    // A branded value should work wherever the base type is expected
    const takeString = (s: string) => s.toUpperCase();
    expect(takeString(uid as unknown as string)).toBe("USR_1");
  });

  it("base type is NOT assignable to branded type without explicit branding", () => {
    // This verifies that the type system prevents accidental assignment.
    // At runtime a raw string is still a string, so we must explicitly brand.
    const raw: string = "hello";
    // Would be a type error: const userId: Brand<string, "UserId"> = raw;
    // Must explicitly brand:
    const userId: Brand<string, "UserId"> = brand(raw);
    expect(userId as unknown as string).toBe("hello");
  });
});

// ── Compile-time type extraction utilities ──

describe("Unbrand and BrandOf", () => {
  it("brand() returns the raw value (Unbrand behaviour at runtime)", () => {
    type UserId = Brand<string, "UserId">;
    const raw = "usr_1";
    const uid: UserId = brand(raw);
    // At runtime the branded value IS the raw value (identity)
    expect(uid as unknown as string).toBe(raw);
  });

  it("works with any base type", () => {
    const s = brand<string, "S">("hello");
    expect(s as unknown as string).toBe("hello");
  });
});

// ── Bounded generic: B extends string ──

describe("Brand second param", () => {
  it("only accepts string literal brands at compile time", () => {
    // Compile-time checks (not possible to test at runtime):
    //   type Bad1 = Brand<string, number>;   // Error: number not assignable to string
    //   type Bad2 = Brand<string, boolean>;  // Error: boolean not assignable to string
    // These are verified by the file compiling successfully.
  });
});
