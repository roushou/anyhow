/**
 * Reactive preferred languages backed by Svelte 5 `$state`.
 *
 * Tracks `navigator.languages` and updates when the user changes their
 * language preferences. SSR-safe — defaults to an empty array.
 *
 * @returns `{ languages }` — the user's preferred language list.
 *
 * @example
 * ```svelte
 * <script>
 *   import { createPreferredLanguages } from "@anyhow/svelte";
 *   const pl = createPreferredLanguages();
 * </script>
 *
 * <p>Your primary language: {pl.languages[0] ?? "unknown"}</p>
 * ```
 */
import { createEventListener } from "./event-listener.svelte.js";

export function createPreferredLanguages() {
  let languages = $state<string[]>(
    typeof navigator !== "undefined" ? [...navigator.languages] : [],
  );

  createEventListener(window, "languagechange", () => {
    languages = [...navigator.languages];
  });

  return {
    /** An array of the user's preferred languages (e.g. `["en-US", "en"]`). */
    get languages() {
      return languages;
    },
  };
}
