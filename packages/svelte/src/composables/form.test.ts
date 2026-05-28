import { describe, it, expect, vi } from "vitest";
import { createForm } from "./form.svelte.js";
import { ok, err } from "@anyhow/std/result";

describe("createForm (client-only)", () => {
  it("initializes fields from opts.initial", () => {
    const form = createForm({ initial: { name: "Alice", age: 30 } });

    expect(form.fields.name.value).toBe("Alice");
    expect(form.fields.age.value).toBe(30);
  });

  it("exposes per-field error, touched, dirty as empty/false initially", () => {
    const form = createForm({ initial: { email: "" } });

    expect(form.fields.email.error).toBe("");
    expect(form.fields.email.touched).toBe(false);
    expect(form.fields.email.dirty).toBe(false);
  });

  it("onChange updates value and marks dirty", () => {
    const form = createForm({ initial: { email: "" } });

    form.fields.email.onChange("a@b.com");

    expect(form.fields.email.value).toBe("a@b.com");
    expect(form.fields.email.dirty).toBe(true);
  });

  it("onChange back to initial clears dirty", () => {
    const form = createForm({ initial: { email: "a@b.com" } });

    form.fields.email.onChange("other");
    expect(form.fields.email.dirty).toBe(true);

    form.fields.email.onChange("a@b.com");
    expect(form.fields.email.dirty).toBe(false);
  });

  it("onBlur marks touched and validates (default validateOn: blur)", () => {
    const form = createForm({
      initial: { email: "" },
      validate: (v) => ({ email: v.email ? "" : "Required" }),
    });

    expect(form.fields.email.touched).toBe(false);
    expect(form.fields.email.error).toBe("");

    form.fields.email.onBlur();

    expect(form.fields.email.touched).toBe(true);
    expect(form.fields.email.error).toBe("Required");
  });

  it("validateOn: change validates on onChange", () => {
    const form = createForm({
      initial: { email: "" },
      validate: (v) => ({ email: v.email ? "" : "Required" }),
      validateOn: "change",
    });

    expect(form.fields.email.error).toBe("");

    form.fields.email.onChange("");

    expect(form.fields.email.error).toBe("Required");
  });

  it("validateOn: submit does NOT validate on blur or change", () => {
    const form = createForm({
      initial: { email: "" },
      validate: (v) => ({ email: v.email ? "" : "Required" }),
      validateOn: "submit",
    });

    form.fields.email.onChange("");
    expect(form.fields.email.error).toBe("");

    form.fields.email.onBlur();
    expect(form.fields.email.error).toBe("");

    const v = form.validate();
    expect(v).toBe(false);
    expect(form.fields.email.error).toBe("Required");
  });

  it("validate() marks all fields touched and runs validation", () => {
    const form = createForm({
      initial: { email: "", name: "" },
      validate: (v) => ({
        email: v.email ? "" : "Required",
        name: v.name ? "" : "Required",
      }),
      validateOn: "submit",
    });

    const valid = form.validate();

    expect(valid).toBe(false);
    expect(form.fields.email.touched).toBe(true);
    expect(form.fields.email.error).toBe("Required");
    expect(form.fields.name.touched).toBe(true);
    expect(form.fields.name.error).toBe("Required");
  });

  it("valid is derived from all field errors", () => {
    const form = createForm({
      initial: { email: "", name: "" },
      validate: (v) => ({
        email: v.email ? "" : "Required",
        name: v.name ? "" : "Required",
      }),
    });

    expect(form.valid).toBe(true); // not touched yet, no validation run

    form.validate();
    expect(form.valid).toBe(false);

    form.fields.email.onChange("a@b.com");
    form.fields.name.onChange("Alice");
    form.validate();
    expect(form.valid).toBe(true);
  });

  it("dirty is derived from any field being dirty", () => {
    const form = createForm({ initial: { a: "", b: "" } });

    expect(form.dirty).toBe(false);

    form.fields.a.onChange("x");
    expect(form.dirty).toBe(true);

    form.fields.a.onChange("");
    expect(form.dirty).toBe(false);
  });

  it("setErrors merges external errors into fields", () => {
    const form = createForm({ initial: { email: "" } });

    form.setErrors({ email: "Already taken" });

    expect(form.fields.email.error).toBe("Already taken");
  });

  it("setErrors ignores unknown keys", () => {
    const form = createForm({ initial: { email: "" } });

    // Should not throw for nonexistent fields
    expect(() => form.setErrors({ unknown: "oops" } as any)).not.toThrow();
  });

  it("reset clears all state back to initial", () => {
    const form = createForm({
      initial: { email: "a@b.com" },
      validate: (v) => ({ email: v.email.includes("@") ? "" : "Invalid" }),
    });

    form.fields.email.onChange("bad");
    form.fields.email.onBlur();
    expect(form.fields.email.dirty).toBe(true);
    expect(form.fields.email.touched).toBe(true);
    expect(form.fields.email.error).toBe("Invalid");

    form.reset();

    expect(form.fields.email.value).toBe("a@b.com");
    expect(form.fields.email.error).toBe("");
    expect(form.fields.email.touched).toBe(false);
    expect(form.fields.email.dirty).toBe(false);
  });

  it("getValues returns a snapshot of current values", () => {
    const form = createForm({ initial: { x: 1, y: 2 } });

    form.fields.x.onChange(10);

    expect(form.getValues()).toEqual({ x: 10, y: 2 });
  });
});

describe("createForm (with onSubmit)", () => {
  it("exposes pending, result, enhance, submit when onSubmit is provided", () => {
    const form = createForm({
      initial: { email: "" },
      onSubmit: async () => ok("done"),
    });

    expect(form.pending).toBe(false);
    expect(form.result).toBeUndefined();
    expect(form).toHaveProperty("enhance");
    expect(form).toHaveProperty("submit");
  });

  it("runs validation before submit and stops if invalid", async () => {
    const onSubmit = vi.fn().mockResolvedValue(ok("ok"));

    const form = createForm({
      initial: { email: "" },
      validate: (v) => ({ email: v.email ? "" : "Required" }),
      onSubmit,
    });

    await form.submit();

    expect(onSubmit).not.toHaveBeenCalled();
    expect(form.pending).toBe(false);
  });

  it("calls onSubmit with current values when valid", async () => {
    const onSubmit = vi.fn().mockResolvedValue(ok("ok"));

    const form = createForm({
      initial: { email: "a@b.com" },
      onSubmit,
    });

    await form.submit();

    expect(onSubmit).toHaveBeenCalledWith({ email: "a@b.com" });
  });

  it("sets pending true during submit and false after", async () => {
    let capturedPending = false;

    const form = createForm({
      initial: { email: "" },
      onSubmit: async () => {
        capturedPending = form.pending;
        return ok("ok");
      },
    });

    expect(form.pending).toBe(false);

    await form.submit();

    expect(capturedPending).toBe(true);
    expect(form.pending).toBe(false);
  });

  it("stores ok result in form.result", async () => {
    const form = createForm({
      initial: { email: "" },
      onSubmit: async () => ok("success"),
    });

    await form.submit();

    expect(form.result).toEqual(ok("success"));
  });

  it("stores err result in form.result", async () => {
    const form = createForm({
      initial: { email: "" },
      onSubmit: async () => err(new Error("boom")),
    });

    await form.submit();

    expect(form.result?.ok).toBe(false);
  });

  it("stores thrown error in formError", async () => {
    const form = createForm({
      initial: { email: "" },
      onSubmit: async () => {
        throw new Error("network failure");
      },
    });

    await form.submit();

    expect(form.formError).toBe("network failure");
    expect(form.result).toBeUndefined();
  });
});
