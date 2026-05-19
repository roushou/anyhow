export function assert(cond: unknown, msg = "Assertion failed"): asserts cond {
  if (!cond) throw new Error(msg);
}

export function assertDefined<T>(val: T, name = "value"): asserts val is NonNullable<T> {
  if (val === null || val === undefined) throw new Error(`${name} is not defined`);
}

export function assertNever(x: never): never {
  throw new Error(`Unhandled case: ${JSON.stringify(x)}`);
}
