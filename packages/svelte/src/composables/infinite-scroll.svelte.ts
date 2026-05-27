/**
 * Reactive infinite scroll composable backed by Svelte 5 `$state`.
 *
 * Loads pages of data via an async fetcher and exposes a `sentinel` action
 * to bind to a trigger element. When the sentinel enters the viewport, the
 * next page is loaded automatically.
 *
 * @typeParam T - The item type.
 * @param fetcher - An async function that receives a page number and returns
 *   an array of items. Return an empty array to signal end-of-data.
 * @returns `{ items, loading, hasMore, error, loadMore, reset, sentinel }`.
 *
 * @example
 * ```svelte
 * <script>
 *   import { createInfiniteScroll } from "@anyhow/svelte/composables";
 *   const feed = createInfiniteScroll(async (page) => {
 *     const res = await fetch(`/api/posts?page=${page}`);
 *     return res.json();
 *   });
 * </script>
 *
 * {#each feed.items as post}
 *   <PostCard {post} />
 * {/each}
 *
 * {#if feed.loading}
 *   <Spinner />
 * {/if}
 *
 * <div use:feed.sentinel></div>
 * ```
 */
export function createInfiniteScroll<T>(fetcher: (page: number) => Promise<T[]>) {
  let items = $state<T[]>([]);
  let loading = $state(false);
  let hasMore = $state(true);
  let error = $state<Error | undefined>(undefined);
  let page = 0;

  async function loadMore() {
    if (loading || !hasMore) return;
    loading = true;
    error = undefined;

    try {
      page++;
      const newItems = await fetcher(page);
      if (newItems.length === 0) {
        hasMore = false;
      } else {
        items = [...items, ...newItems];
      }
    } catch (e) {
      error = e instanceof Error ? e : new Error(String(e));
      page--;
    } finally {
      loading = false;
    }
  }

  // Sentinel action: triggers loadMore when it enters the viewport
  function sentinel(node: HTMLElement) {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        loadMore();
      }
    });
    observer.observe(node);

    return {
      destroy() {
        observer.disconnect();
      },
    };
  }

  // Load first page on init
  loadMore();

  return {
    /** All loaded items. */
    get items() {
      return items;
    },
    /** `true` while a page is being fetched. */
    get loading() {
      return loading;
    },
    /** `false` when the last fetch returned an empty array. */
    get hasMore() {
      return hasMore;
    },
    /** Set when a fetch fails. */
    get error() {
      return error;
    },
    /** Manually triggers the next page load. */
    loadMore,
    /** Resets all state and reloads from page 1. */
    reset() {
      items = [];
      loading = false;
      hasMore = true;
      error = undefined;
      page = 0;
      loadMore();
    },
    /** The action to bind to a sentinel element. */
    sentinel,
  };
}
