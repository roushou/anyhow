<script lang="ts">
  /**
   * Generic test wrapper for Svelte 5 rune-based composables.
   *
   * Instantiates any factory function with the provided arguments inside
   * a Svelte component context, then passes the returned API to `onReady`.
   *
   * Used with `@testing-library/svelte`'s `render` to test composables that
   * rely on `$effect`, `$state`, or other runes that require a component.
   *
   * @example
   * ```ts
   * import { render } from "@testing-library/svelte/svelte5";
   * import TestUtil from "../test-util.svelte";
   * import { createWindowSize } from "./window-size.svelte.js";
   *
   * let api: any;
   * render(TestUtil, { props: { factory: createWindowSize, onReady: (a) => (api = a) } });
   * ```
   */
  interface Props {
    /** The composable factory to instantiate. */
    factory: (...args: any[]) => any;
    /** Arguments to pass to the factory. Defaults to `[]` (no arguments). */
    args?: any[];
    /** Callback that receives the composable's returned API. */
    onReady: (api: any) => void;
  }

  let { factory, args = [], onReady }: Props = $props();

  const api = factory(...args);

  onReady(api);
</script>
