/**
 * Reactive SvelteKit view transition state backed by Svelte 5 `$state`.
 *
 * Wraps SvelteKit's `onNavigate` lifecycle hook to expose reactive
 * navigation state: whether a navigation is in progress, the source
 * and destination URLs, and the navigation type.
 *
 * Uses dependency injection — pass `onNavigate` from `$app/navigation`.
 * This keeps the composable free of SvelteKit imports, making it
 * tree-shakeable in non-SvelteKit projects.
 *
 * @param opts.onNavigate - The `onNavigate` hook from `$app/navigation`.
 * @returns `{ navigating, from, to, type }`.
 *
 * @example
 * ```svelte
 * <script>
 *   import { onNavigate } from "$app/navigation";
 *   import { createViewTransition } from "@anyhow/svelte";
 *
 *   const nav = createViewTransition({ onNavigate });
 * </script>
 *
 * {#if nav.navigating}
 *   <div class="progress-bar" />
 * {/if}
 * ```
 */
export function createViewTransition(opts: {
  onNavigate: (
    fn: (nav: {
      from: { url: URL } | null;
      to: { url: URL } | null;
      type: "link" | "popstate" | "goto";
    }) => void,
  ) => () => void;
}) {
  let navigating = $state(false);
  let from = $state<URL | undefined>(undefined);
  let to = $state<URL | undefined>(undefined);
  let type = $state<"link" | "popstate" | "goto" | undefined>(undefined);

  $effect(() => {
    return opts.onNavigate((nav) => {
      from = nav.from?.url;
      to = nav.to?.url;
      type = nav.type;
      navigating = true;
    });
  });

  $effect(() => {
    if (navigating) {
      // Reset navigating after the current tick so templates see the state
      navigating = false;
    }
  });

  return {
    /** `true` during navigation. */
    get navigating() {
      return navigating;
    },
    /** The URL being navigated from, or `undefined`. */
    get from() {
      return from;
    },
    /** The URL being navigated to, or `undefined`. */
    get to() {
      return to;
    },
    /** The navigation type: `"link"`, `"popstate"`, or `"goto"`. */
    get type() {
      return type;
    },
  };
}
