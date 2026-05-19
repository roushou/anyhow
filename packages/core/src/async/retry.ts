import { sleep } from "./timing.js";

export async function retry<T>(
  fn: () => Promise<T>,
  { attempts = 3, backoff = 300 } = {},
): Promise<T> {
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      if (i === attempts - 1) throw e;
      await sleep(backoff * 2 ** i);
    }
  }
  throw new Error("unreachable");
}
