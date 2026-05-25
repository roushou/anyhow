import { describe, it, expect } from "vitest";
import { safeActions } from "./safe-actions.js";

describe("safeActions", () => {
  it("passes through successful action results", async () => {
    const actions = safeActions({
      default: async (_event: unknown) => {
        return { ok: true };
      },
    });

    const result = await actions.default({});
    expect(result.ok).toBe(true);
    expect(result._actionError).toBeUndefined();
  });

  it("catches thrown errors and attaches _actionError", async () => {
    const actions = safeActions({
      submit: async (_event: unknown): Promise<{ ok: boolean }> => {
        throw new Error("validation failed");
      },
    });

    const result = await actions.submit({});
    expect(result._actionError).toBeInstanceOf(Error);
    expect(result._actionError!.message).toBe("validation failed");
  });

  it("wraps multiple actions independently", async () => {
    const actions = safeActions({
      ok: async (): Promise<{ success: boolean }> => ({ success: true }),
      fail: async (): Promise<{ ok: boolean }> => {
        throw new Error("fail");
      },
    });

    const okResult = await actions.ok();
    expect(okResult.success).toBe(true);

    const failResult = await actions.fail();
    expect(failResult._actionError!.message).toBe("fail");
  });
});
