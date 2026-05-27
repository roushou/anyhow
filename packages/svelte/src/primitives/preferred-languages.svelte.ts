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
export function createPreferredLanguages() {
  let languages = $state<string[]>(
    typeof navigator !== "undefined" ? [...navigator.languages] : [],
  );

  $effect(() => {
    if (typeof window === "undefined") return;

    function update() {
      languages = [...navigator.languages];
    }

    window.addEventListener("languagechange", update);
    return () => window.removeEventListener("languagechange", update);
  });

  return {
    /** An array of the user's preferred languages (e.g. `["en-US", "en"]`). */
    get languages() {
      return languages;
    },
  };
}
