/**
 * Reactive pagination state backed by Svelte 5 `$state`.
 *
 * Manages page, perPage, and total for any paginated list. Provides
 * `prev`, `next`, `setPage`, and derived `totalPages` / `canPrev` / `canNext`.
 *
 * @param opts.total - Total number of items.
 * @param opts.perPage - Items per page (default: `20`).
 * @param opts.page - Starting page (default: `1`).
 * @returns Reactive pagination state.
 *
 * @example
 * ```svelte
 * <script>
 *   import { createPagination } from "@anyhow/svelte/composables";
 *   const pag = createPagination({ total: 250, perPage: 20 });
 * </script>
 *
 * <button onclick={pag.prev} disabled={!pag.canPrev}>Prev</button>
 * <span>Page {pag.page} of {pag.totalPages}</span>
 * <button onclick={pag.next} disabled={!pag.canNext}>Next</button>
 * ```
 */
export function createPagination(opts: { total: number; perPage?: number; page?: number }) {
  let page = $state(opts.page ?? 1);
  let perPage = $state(opts.perPage ?? 20);

  // Compute totalPages locally — it's derived from total / perPage.
  let _total = $state(opts.total);

  return {
    /** The current page (1-based). */
    get page() {
      return page;
    },
    set page(v: number) {
      page = v;
    },
    /** Items per page. */
    get perPage() {
      return perPage;
    },
    set perPage(v: number) {
      perPage = v;
      page = 1;
    },
    /** Total number of items. */
    get total() {
      return _total;
    },
    set total(v: number) {
      _total = v;
    },
    /** Total number of pages. */
    get totalPages() {
      return Math.max(1, Math.ceil(_total / perPage));
    },
    /** `true` when there is a previous page. */
    get canPrev() {
      return page > 1;
    },
    /** `true` when there is a next page. */
    get canNext() {
      return page < this.totalPages;
    },
    /** Goes to the given page (clamped to valid range). */
    setPage(n: number) {
      page = Math.max(1, Math.min(n, this.totalPages));
    },
    /** Goes to the previous page. */
    prev() {
      if (this.canPrev) page--;
    },
    /** Goes to the next page. */
    next() {
      if (this.canNext) page++;
    },
    /** Resets to page 1. */
    reset() {
      page = 1;
    },
  };
}
