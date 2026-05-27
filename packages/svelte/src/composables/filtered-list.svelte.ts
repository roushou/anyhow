/**
 * Reactive filtered list backed by Svelte 5 `$state`.
 *
 * Combines a source array with search filtering and sorting. The `filtered`
 * property is a derived view: it filters items by a case-insensitive
 * substring match across `searchFields`, then sorts by `sortKey`.
 *
 * @typeParam T - The item type.
 * @param items - The source array.
 * @param opts.searchFields - Keys to search on.
 * @param opts.sortKey - Default sort key.
 * @returns `{ search, sortKey, sortDir, filtered, setSearch, setSort }`.
 *
 * @example
 * ```svelte
 * <script>
 *   import { createFilteredList } from "@anyhow/svelte/composables";
 *   const users = createFilteredList(allUsers, {
 *     searchFields: ["name", "email"],
 *     sortKey: "name",
 *   });
 * </script>
 *
 * <input bind:value={users.search} placeholder="Filter..." />
 * {#each users.filtered as user}
 *   <UserCard {user} />
 * {/each}
 * ```
 */
export function createFilteredList<T extends Record<string, any>>(
  items: T[],
  opts: { searchFields: string[]; sortKey?: string },
) {
  let search = $state("");
  let sortKey = $state(opts.sortKey ?? opts.searchFields[0] ?? "");
  let sortDir = $state<"asc" | "desc">("asc");

  return {
    /** The current search query. */
    get search() {
      return search;
    },
    set search(v: string) {
      search = v;
    },
    /** The current sort key. */
    get sortKey() {
      return sortKey;
    },
    /** Sort direction: `"asc"` or `"desc"`. */
    get sortDir() {
      return sortDir;
    },
    /** Sets the search query. */
    setSearch(q: string) {
      search = q;
    },
    /** Sets the sort key. Toggles direction if the same key is clicked again. */
    setSort(key: string) {
      if (key === sortKey) {
        sortDir = sortDir === "asc" ? "desc" : "asc";
      } else {
        sortKey = key;
        sortDir = "asc";
      }
    },
    /** The filtered and sorted items. */
    get filtered(): T[] {
      let result = items;

      // Filter by search
      if (search) {
        const q = search.toLowerCase();
        result = result.filter((item) =>
          opts.searchFields.some((field) => {
            const val = item[field];
            return typeof val === "string" && val.toLowerCase().includes(q);
          }),
        );
      }

      // Sort
      if (sortKey) {
        result = [...result].sort((a, b) => {
          const av = a[sortKey];
          const bv = b[sortKey];
          if (av < bv) return sortDir === "asc" ? -1 : 1;
          if (av > bv) return sortDir === "asc" ? 1 : -1;
          return 0;
        });
      }

      return result;
    },
  };
}
