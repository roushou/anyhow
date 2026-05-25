import { describe, it, expect } from "vitest";
import { ok, err } from "@anyhow/std/result";
import { s } from "@anyhow/std/schema";
import { createFormAction } from "./form-action.svelte.js";

// Helper to create a minimal SubmitContext for testing
function ctx(
  formData?: FormData,
): Parameters<ReturnType<ReturnType<typeof createFormAction>["enhance"]>>[0] {
  return {
    formData: formData ?? new FormData(),
    formElement: document.createElement("form"),
    action: new URL("http://localhost/test"),
    cancel: () => {},
    submitter: null,
  };
}

describe("createFormAction — Path A (simple action)", () => {
  it("starts with no data or error", () => {
    const form = createFormAction(async () => "ok");
    expect(form.pending).toBe(false);
    expect(form.data).toBeUndefined();
    expect(form.error).toBeUndefined();
  });

  it("updates data after successful submit", async () => {
    const form = createFormAction(async (fd) => fd.get("name") as string);
    const fd = new FormData();
    fd.set("name", "Alice");

    const handler = form.enhance()!;
    await handler(ctx(fd));

    expect(form.data).toBe("Alice");
    expect(form.error).toBeUndefined();
  });

  it("sets pending during submit", async () => {
    let capturedPending = false;
    const form = createFormAction(async () => {
      capturedPending = form.pending;
      return "done";
    });

    const handler = form.enhance()!;
    await handler(ctx());

    expect(capturedPending).toBe(true);
    expect(form.pending).toBe(false);
  });

  it("catches thrown errors", async () => {
    const form = createFormAction(async () => {
      throw new Error("boom");
    });

    const handler = form.enhance()!;
    await handler(ctx());

    expect(form.data).toBeUndefined();
    expect(form.error).toBe("boom");
  });

  it("reset clears state", async () => {
    const form = createFormAction(async () => "done");

    const handler = form.enhance()!;
    await handler(ctx());
    form.reset();

    expect(form.data).toBeUndefined();
    expect(form.error).toBeUndefined();
    expect(form.pending).toBe(false);
  });
});

describe("createFormAction — Path B (validate + action)", () => {
  it("sets validationError when validate returns a string", async () => {
    const form = createFormAction({
      validate: (_fd) => "Name is required",
      action: async (_data) => "ok",
    });

    const handler = form.enhance()!;
    await handler(ctx());

    expect(form.validationError).toBe("Name is required");
    expect(form.data).toBeUndefined();
  });

  it("passes validated data to action on success", async () => {
    const form = createFormAction({
      validate: (fd) => ({ name: fd.get("name") as string }),
      action: async (data) => data.name.toUpperCase(),
    });

    const fd = new FormData();
    fd.set("name", "alice");

    const handler = form.enhance()!;
    await handler(ctx(fd));

    expect(form.data).toBe("ALICE");
    expect(form.validationError).toBeUndefined();
  });
});

describe("createFormAction — Path C (schema)", () => {
  it("sets validationErrors when schema parse fails", async () => {
    const schema = {
      parse: (_value: unknown) => ({
        ok: false,
        error: { path: ["email"], message: "Required" },
      }),
    };

    const form = createFormAction({
      schema,
      action: async (_data: any) => "ok",
    });

    const handler = form.enhance()!;
    await handler(ctx());

    expect(form.validationErrors).toBeDefined();
    expect(form.validationErrors![0]!.path).toEqual(["email"]);
    expect(form.validationErrors![0]!.message).toBe("Required");
  });

  it("passes raw action return value to data (no auto-unwrap)", async () => {
    const schema = {
      parse: (_value: unknown) => ({ ok: true, value: { email: "a@b.com" } }),
    };

    const form = createFormAction({
      schema,
      action: async (_data) => "plain success",
    });

    const handler = form.enhance()!;
    await handler(ctx());

    // data is the raw return value — plain values go to data
    expect(form.data).toBe("plain success");
  });

  it("routes Result-like returns to result when using schema", async () => {
    const schema = {
      parse: (_value: unknown) => ({ ok: true, value: { email: "a@b.com" } }),
    };

    const form = createFormAction({
      schema,
      action: async (_data) => ({ ok: true, value: "success" }),
    });

    const handler = form.enhance()!;
    await handler(ctx());

    // Result-like objects go to result, not data
    expect((form as any).result).toBeDefined();
    expect(form.data).toBeUndefined();
  });

  it("sets error when action throws", async () => {
    const schema = {
      parse: (_value: unknown) => ({ ok: true, value: { email: "a@b.com" } }),
    };

    const form = createFormAction({
      schema,
      action: async (_data) => {
        throw new Error("Server error");
      },
    });

    const handler = form.enhance()!;
    await handler(ctx());

    expect(form.error).toBe("Server error");
  });
});

describe("createFormAction — Path D (schema + Result)", () => {
  const loginSchema = s.object({
    email: s.string(),
    password: s.string(),
  });

  it("stores the Result in form.result", async () => {
    const form = createFormAction({
      schema: loginSchema,
      action: async (_data) => ok({ name: "Alice" }),
    });

    const formData = new FormData();
    formData.set("email", "a@b.com");
    formData.set("password", "12345678");

    const handler = form.enhance()!;
    await handler(ctx(formData));

    expect(form.result).toBeDefined();
    expect(form.result!.ok).toBe(true);
    if (form.result!.ok) {
      expect(form.result!.value).toEqual({ name: "Alice" });
    }
  });

  it("stores an Err Result", async () => {
    const form = createFormAction({
      schema: loginSchema,
      action: async (_data) => err("Unauthorized"),
    });

    const formData = new FormData();
    formData.set("email", "a@b.com");
    formData.set("password", "12345678");

    const handler = form.enhance()!;
    await handler(ctx(formData));

    expect(form.result).toBeDefined();
    expect(form.result!.ok).toBe(false);
    if (!form.result!.ok) {
      expect(form.result!.error).toBe("Unauthorized");
    }
  });

  it("populates validationErrors on schema failure", async () => {
    const form = createFormAction({
      schema: loginSchema,
      action: async (_data) => ok({ name: "nope" }),
    });

    // Submit with no fields — schema will reject
    const handler = form.enhance()!;
    await handler(ctx());

    expect(form.validationErrors).toBeDefined();
    expect(form.validationErrors!.length).toBeGreaterThan(0);
  });

  it("reset clears result and validationErrors", async () => {
    const form = createFormAction({
      schema: loginSchema,
      action: async (_data) => ok({ name: "Alice" }),
    });

    const formData = new FormData();
    formData.set("email", "a@b.com");
    formData.set("password", "12345678");

    const handler = form.enhance()!;
    await handler(ctx(formData));

    form.reset();
    expect(form.result).toBeUndefined();
    expect(form.pending).toBe(false);
  });
});

describe("reset", () => {
  it("clears all reactive state", async () => {
    const form = createFormAction(async () => "ok");
    const handler = form.enhance()!;
    await handler(ctx());

    expect(form.data).toBe("ok");
    form.reset();
    expect(form.data).toBeUndefined();
    expect(form.pending).toBe(false);
  });
});
