import { describe, it, expect } from "vitest";
import { createStateMachine } from "./state-machine.svelte.js";

describe("createStateMachine", () => {
  it("starts at the initial state", () => {
    const m = createStateMachine({
      initial: "idle",
      states: {
        idle: {},
        done: {},
      },
    });
    expect(m.state).toBe("idle");
  });

  it("transitions on valid event", () => {
    const m = createStateMachine({
      initial: "off",
      states: {
        off: { on: { TOGGLE: { target: "on" } } },
        on: { on: { TOGGLE: { target: "off" } } },
      },
    });
    expect(m.send("TOGGLE")).toBe(true);
    expect(m.state).toBe("on");
    expect(m.send("TOGGLE")).toBe(true);
    expect(m.state).toBe("off");
  });

  it("state is reactive after transition", () => {
    const m = createStateMachine({
      initial: "a",
      states: {
        a: { on: { GO: { target: "b" } } },
        b: {},
      },
    });
    m.send("GO");
    expect(m.state).toBe("b");
  });

  it("send returns false for invalid event", () => {
    const m = createStateMachine({
      initial: "idle",
      states: {
        idle: {},
      },
    });
    expect(m.send("NEXT" as any)).toBe(false);
    expect(m.state).toBe("idle");
  });

  it("can checks event validity", () => {
    const m = createStateMachine({
      initial: "idle",
      states: {
        idle: { on: { START: { target: "loading" } } },
        loading: {},
      },
    });
    expect(m.can("START")).toBe(true);
    m.send("START");
    expect(m.can("START")).toBe(false);
  });

  it("history tracks transitions", () => {
    const m = createStateMachine({
      initial: "a",
      states: {
        a: { on: { GO: { target: "b" } } },
        b: { on: { GO: { target: "c" } } },
        c: {},
      },
    });
    m.send("GO");
    m.send("GO");
    const h = m.history();
    expect(h.length).toBe(2);
    expect(h[0]).toEqual({ from: "a", event: "GO", to: "b" });
    expect(h[1]).toEqual({ from: "b", event: "GO", to: "c" });
  });

  it("reset returns to initial state", () => {
    const m = createStateMachine({
      initial: "a",
      states: {
        a: { on: { GO: { target: "b" } } },
        b: { on: { GO: { target: "c" } } },
        c: {},
      },
    });
    m.send("GO");
    m.send("GO");
    expect(m.state).toBe("c");
    m.reset();
    expect(m.state).toBe("a");
    expect(m.history()).toEqual([]);
  });

  it("guards block transitions", () => {
    const m = createStateMachine(
      {
        initial: "pending",
        states: {
          pending: {
            on: {
              CONFIRM: {
                target: "confirmed",
                guard: (ctx: { ready: boolean }) => ctx.ready,
              },
            },
          },
          confirmed: {},
        },
      },
      { ready: false },
    );
    expect(m.send("CONFIRM")).toBe(false);
    expect(m.state).toBe("pending");
  });

  it("passes context to hooks", () => {
    const log: string[] = [];
    const m = createStateMachine(
      {
        initial: "a",
        states: {
          a: {
            on: {
              GO: {
                target: "b",
                action: (ctx: { name: string }) => {
                  log.push(`action:${ctx.name}`);
                },
              },
            },
            exit: (ctx: { name: string }) => {
              log.push(`exit:${ctx.name}`);
            },
          },
          b: {
            entry: (ctx: { name: string }) => {
              log.push(`entry:${ctx.name}`);
            },
          },
        },
      },
      { name: "svelte" },
    );
    m.send("GO");
    expect(log).toEqual(["exit:svelte", "action:svelte", "entry:svelte"]);
  });

  it("works with type parameters", () => {
    type Step = "personal" | "address" | "review";
    const wizard = createStateMachine<Step, "NEXT" | "BACK">({
      initial: "personal",
      states: {
        personal: { on: { NEXT: { target: "address" } } },
        address: { on: { NEXT: { target: "review" }, BACK: { target: "personal" } } },
        review: { on: { BACK: { target: "address" } } },
      },
    });
    wizard.send("NEXT");
    expect(wizard.state).toBe("address");
    wizard.send("BACK");
    expect(wizard.state).toBe("personal");
  });
});
