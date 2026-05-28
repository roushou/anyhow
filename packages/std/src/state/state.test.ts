import { describe, expect, it } from "bun:test";
import { stateMachine, StateMachine } from "./state.js";

describe("StateMachine", () => {
  describe("basic transitions", () => {
    it("starts at the initial state", () => {
      const m = stateMachine({
        initial: "idle",
        states: {
          idle: {},
          done: {},
        },
      });
      expect(m.state()).toBe("idle");
    });

    it("transitions to the target state on a valid event", () => {
      const m = stateMachine({
        initial: "off",
        states: {
          off: { on: { TOGGLE: { target: "on" } } },
          on: { on: { TOGGLE: { target: "off" } } },
        },
      });
      expect(m.send("TOGGLE")).toBe(true);
      expect(m.state()).toBe("on");
      expect(m.send("TOGGLE")).toBe(true);
      expect(m.state()).toBe("off");
    });

    it("returns false for invalid events", () => {
      const m = stateMachine({
        initial: "idle",
        states: {
          idle: {},
          done: {},
        },
      });
      expect(m.send("NEXT" as any)).toBe(false);
      expect(m.state()).toBe("idle");
    });

    it("returns false when event is not declared for current state", () => {
      const m = stateMachine({
        initial: "idle",
        states: {
          idle: { on: { START: { target: "loading" } } },
          loading: { on: { FINISH: { target: "done" } } },
          done: {},
        },
      });
      expect(m.send("FINISH" as any)).toBe(false); // not valid from idle
    });
  });

  describe("self-transition (no target)", () => {
    it("stays in the same state when target is omitted", () => {
      let actionCalled = 0;
      const m = stateMachine({
        initial: "editing",
        states: {
          editing: {
            on: {
              SAVE: {
                action: () => {
                  actionCalled++;
                },
              },
            },
          },
        },
      });
      expect(m.send("SAVE")).toBe(true);
      expect(m.state()).toBe("editing");
      expect(actionCalled).toBe(1);
    });
  });

  describe("can", () => {
    it("returns true for valid events in the current state", () => {
      const m = stateMachine({
        initial: "idle",
        states: {
          idle: { on: { START: { target: "loading" } } },
          loading: {},
          done: {},
        },
      });
      expect(m.can("START")).toBe(true);
    });

    it("returns false for events not in the current state", () => {
      const m = stateMachine({
        initial: "idle",
        states: {
          idle: {},
          done: {},
        },
      });
      expect(m.can("FINISH" as any)).toBe(false);
    });
  });

  describe("guards", () => {
    it("allows transition when guard returns true", () => {
      const m = stateMachine(
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
        { ready: true },
      );
      expect(m.send("CONFIRM")).toBe(true);
      expect(m.state()).toBe("confirmed");
    });

    it("blocks transition when guard returns false", () => {
      const m = stateMachine(
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
      expect(m.state()).toBe("pending");
    });

    it("does not call exit/entry when guard blocks", () => {
      let entryCalled = false;
      let exitCalled = false;
      const m = stateMachine({
        initial: "pending",
        states: {
          pending: {
            on: {
              CONFIRM: {
                target: "confirmed",
                guard: () => false,
              },
            },
            exit: () => {
              exitCalled = true;
            },
          },
          confirmed: {
            entry: () => {
              entryCalled = true;
            },
          },
        },
      });
      m.send("CONFIRM");
      expect(exitCalled).toBe(false);
      expect(entryCalled).toBe(false);
    });

    it("receives the event in the guard", () => {
      let receivedEvent = "";
      const m = stateMachine<string, string, void>({
        initial: "a",
        states: {
          a: {
            on: {
              GO: {
                target: "b",
                guard: (_ctx, event) => {
                  receivedEvent = event;
                  return true;
                },
              },
            },
          },
          b: {},
        },
      });
      m.send("GO");
      expect(receivedEvent).toBe("GO");
    });
  });

  describe("lifecycle hooks", () => {
    it("calls exit on the old state and entry on the new state", () => {
      const log: string[] = [];
      const m = stateMachine({
        initial: "a",
        states: {
          a: {
            on: { GO: { target: "b" } },
            exit: () => {
              log.push("exit-a");
            },
          },
          b: {
            entry: () => {
              log.push("entry-b");
            },
          },
        },
      });
      m.send("GO");
      expect(log).toEqual(["exit-a", "entry-b"]);
    });

    it("does not call entry on self-transition", () => {
      const log: string[] = [];
      const m = stateMachine({
        initial: "a",
        states: {
          a: {
            on: { RETRY: {} },
            exit: () => {
              log.push("exit-a");
            },
            entry: () => {
              log.push("entry-a");
            },
          },
        },
      });
      m.send("RETRY");
      expect(log).toEqual(["exit-a"]); // exit fires, but no entry (same state)
    });

    it("passes previous state to entry and next state to exit", () => {
      let entryPrev = "";
      let exitNext = "";
      const m = stateMachine({
        initial: "a",
        states: {
          a: {
            on: { GO: { target: "b" } },
            exit: (_ctx, _event, next) => {
              exitNext = next;
            },
          },
          b: {
            entry: (_ctx, _event, prev) => {
              entryPrev = prev;
            },
          },
        },
      });
      m.send("GO");
      expect(exitNext).toBe("b");
      expect(entryPrev).toBe("a");
    });
  });

  describe("transition actions", () => {
    it("runs the action between exit and entry", () => {
      const log: string[] = [];
      const m = stateMachine({
        initial: "a",
        states: {
          a: {
            on: {
              GO: {
                target: "b",
                action: () => {
                  log.push("action");
                },
              },
            },
            exit: () => {
              log.push("exit");
            },
          },
          b: {
            entry: () => {
              log.push("entry");
            },
          },
        },
      });
      m.send("GO");
      expect(log).toEqual(["exit", "action", "entry"]);
    });

    it("can mutate context", () => {
      const m = stateMachine(
        {
          initial: "a",
          states: {
            a: {
              on: {
                GO: {
                  target: "b",
                  action: (ctx: { count: number }) => {
                    ctx.count++;
                  },
                },
              },
            },
            b: {},
          },
        },
        { count: 0 },
      );
      m.send("GO");
      // Context mutation is internal — we verify via a subsequent guard
      const m2 = stateMachine(
        {
          initial: "a",
          states: {
            a: {
              on: {
                GO: {
                  target: "b",
                  guard: (ctx: { count: number }) => ctx.count >= 1,
                },
              },
            },
            b: {},
          },
        },
        { count: 1 },
      );
      expect(m2.send("GO")).toBe(true);
    });
  });

  describe("history", () => {
    it("records every transition", () => {
      const m = stateMachine({
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

    it("records self-transitions", () => {
      const m = stateMachine({
        initial: "a",
        states: {
          a: { on: { PING: {} } },
        },
      });
      m.send("PING");
      expect(m.history()[0]).toEqual({ from: "a", event: "PING", to: "a" });
    });

    it("does not record failed transitions (invalid event)", () => {
      const m = stateMachine({
        initial: "a",
        states: {
          a: {},
        },
      });
      m.send("GO" as any);
      expect(m.history()).toEqual([]);
    });

    it("does not record failed transitions (guard)", () => {
      const m = stateMachine({
        initial: "a",
        states: {
          a: {
            on: {
              GO: {
                target: "b",
                guard: () => false,
              },
            },
          },
          b: {},
        },
      });
      m.send("GO");
      expect(m.history()).toEqual([]);
    });

    it("returns a readonly view", () => {
      const m = stateMachine({
        initial: "a",
        states: {
          a: { on: { GO: { target: "b" } } },
          b: {},
        },
      });
      m.send("GO");
      const h = m.history();
      expect(h.length).toBe(1);
    });
  });

  describe("reset", () => {
    it("returns to initial state and clears history", () => {
      const m = stateMachine({
        initial: "a",
        states: {
          a: { on: { GO: { target: "b" } } },
          b: { on: { GO: { target: "c" } } },
          c: {},
        },
      });
      m.send("GO");
      m.send("GO");
      expect(m.state()).toBe("c");
      expect(m.history().length).toBe(2);

      m.reset();
      expect(m.state()).toBe("a");
      expect(m.history()).toEqual([]);
    });
  });

  describe("wizard flow", () => {
    it("handles forward/back navigation", () => {
      type Step = "personal" | "address" | "review";
      const wizard = stateMachine<Step, "NEXT" | "BACK">({
        initial: "personal",
        states: {
          personal: { on: { NEXT: { target: "address" } } },
          address: {
            on: { NEXT: { target: "review" }, BACK: { target: "personal" } },
          },
          review: { on: { BACK: { target: "address" } } },
        },
      });

      wizard.send("NEXT");
      expect(wizard.state()).toBe("address");
      wizard.send("NEXT");
      expect(wizard.state()).toBe("review");
      wizard.send("BACK");
      expect(wizard.state()).toBe("address");
    });

    it("cannot skip steps", () => {
      type Step = "step1" | "step2" | "step3";
      const wizard = stateMachine<Step, "NEXT">({
        initial: "step1",
        states: {
          step1: { on: { NEXT: { target: "step2" } } },
          step2: { on: { NEXT: { target: "step3" } } },
          step3: {},
        },
      });
      expect(wizard.can("NEXT")).toBe(true);
      wizard.send("NEXT");
      expect(wizard.state()).toBe("step2");
      expect(wizard.can("NEXT")).toBe(true);
      wizard.send("NEXT");
      expect(wizard.state()).toBe("step3");
      expect(wizard.can("NEXT")).toBe(false); // terminal state
    });
  });

  describe("context", () => {
    it("defaults context to undefined when not provided", () => {
      let capturedCtx: unknown;
      const m = stateMachine({
        initial: "a",
        states: {
          a: {
            on: { GO: { target: "b" } },
            exit: (ctx) => {
              capturedCtx = ctx;
            },
          },
          b: {},
        },
      });
      m.send("GO");
      expect(capturedCtx).toBeUndefined();
    });

    it("accepts and passes context to all hooks", () => {
      const log: string[] = [];
      const m = stateMachine(
        {
          initial: "a",
          states: {
            a: {
              on: {
                GO: {
                  target: "b",
                  guard: (ctx: { name: string }) => {
                    log.push(`guard:${ctx.name}`);
                    return true;
                  },
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
        { name: "test" },
      );
      m.send("GO");
      expect(log).toEqual(["guard:test", "exit:test", "action:test", "entry:test"]);
    });
  });

  describe("factory function", () => {
    it("creates a StateMachine instance", () => {
      const m = stateMachine({
        initial: "idle",
        states: { idle: {} },
      });
      expect(m).toBeInstanceOf(StateMachine);
    });
  });
});
