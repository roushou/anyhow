/**
 * Reactive state machine backed by Svelte 5 `$state`.
 *
 * Wraps `@anyhow/std/state` so that `machine.state` is a reactive getter
 * that auto-updates templates on every transition. All other methods
 * (`send`, `can`, `history`, `reset`) delegate to the underlying machine.
 *
 * @typeParam S - The state type (string union).
 * @typeParam E - The event type (string union).
 * @typeParam C - The context type (defaults to `void`).
 * @param def - The state machine definition.
 * @param ctx - Optional shared context passed to guards, actions,
 *              entry, and exit hooks.
 * @returns A reactive state machine object.
 *
 * @example
 * ```svelte
 * <script>
 *   import { createStateMachine } from "@anyhow/svelte";
 *
 *   type Step = "personal" | "address" | "review";
 *
 *   const wizard = createStateMachine<Step, "NEXT" | "BACK">({
 *     initial: "personal",
 *     states: {
 *       personal: { on: { NEXT: { target: "address" } } },
 *       address:  { on: { NEXT: { target: "review" }, BACK: { target: "personal" } } },
 *       review:   { on: { BACK: { target: "address" } } },
 *     },
 *   });
 * </script>
 *
 * {#if wizard.state === "personal"}
 *   <PersonalForm onNext={() => wizard.send("NEXT")} />
 * {:else if wizard.state === "address"}
 *   <AddressForm onNext={() => wizard.send("NEXT")} onBack={() => wizard.send("BACK")} />
 * {:else}
 *   <ReviewForm onBack={() => wizard.send("BACK")} />
 * {/if}
 * ```
 */
import { stateMachine, type StateMachineDef } from "@anyhow/std/state";

export function createStateMachine<S extends string, E extends string, C = void>(
  def: StateMachineDef<S, E, C>,
  ctx?: C,
) {
  const machine = stateMachine(def, ctx);
  let current = $state(machine.state());

  return {
    /** The current reactive state. Templates re-render on every transition. */
    get state(): S {
      return current;
    },

    /**
     * Sends an event. If the transition succeeds, `state` updates reactively.
     *
     * @param event - The event to send.
     * @returns `true` if a transition occurred.
     */
    send(event: E): boolean {
      const ok = machine.send(event);
      if (ok) current = machine.state();
      return ok;
    },

    /**
     * Checks whether an event is valid for the current state.
     *
     * @param event - The event to check.
     * @returns `true` if the event is declared for the current state.
     */
    can(event: E): boolean {
      return machine.can(event);
    },

    /**
     * Returns the transition history, oldest first.
     *
     * @returns A readonly array of transition records.
     */
    history() {
      return machine.history();
    },

    /**
     * Resets the machine to its initial state and clears history.
     * `state` updates reactively.
     */
    reset() {
      machine.reset();
      current = machine.state();
    },
  };
}
