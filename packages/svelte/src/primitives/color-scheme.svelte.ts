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
import { listen } from "../listen.js";

export function createColorScheme() {
  let scheme = $state<"light" | "dark">("light");

  $effect(() => {
    if (typeof window === "undefined") return;

    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    scheme = mql.matches ? "dark" : "light";
    return listen(mql, "change", () => {
      scheme = mql.matches ? "dark" : "light";
    }).destroy;
  });

  return {
    /** The current OS color scheme: `"light"` or `"dark"`. */
    get scheme() {
      return scheme;
    },
  };
}
