/**
 * Reactive OS color scheme backed by Svelte 5 `$state`.
 *
 * Tracks `prefers-color-scheme` media query and returns `"light"` or
 * `"dark"`. Updates reactively when the user changes their OS setting.
 * SSR-safe — defaults to `"light"`.
 *
 * @returns `{ scheme }` — `"light"` or `"dark"`.
 *
 * @example
 * ```svelte
 * <script>
 *   import { createColorScheme } from "@anyhow/svelte";
 *   const cs = createColorScheme();
 * </script>
 *
 * <body class:dark={cs.scheme === "dark"}>
 * ```
 */
export function createColorScheme() {
  let scheme = $state<"light" | "dark">("light");

  $effect(() => {
    if (typeof window === "undefined") return;

    const mql = window.matchMedia("(prefers-color-scheme: dark)");

    function update(e?: MediaQueryListEvent) {
      scheme = (e ?? mql).matches ? "dark" : "light";
    }

    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  });

  return {
    /** The current OS color scheme: `"light"` or `"dark"`. */
    get scheme() {
      return scheme;
    },
  };
}
