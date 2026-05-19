export function invariant(cond: unknown, msg?: string | (() => string)): asserts cond {
  if (cond) return;
  const m = typeof msg === "function" ? msg() : msg;
  throw new Error(m ? `Invariant: ${m}` : "Invariant failed");
}
