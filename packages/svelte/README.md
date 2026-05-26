# @anyhow/svelte

SvelteKit 5 reactive primitives, composables, and form-action utilities. Builds on Svelte 5 runes (`$state`, `$derived`, `$effect`) with zero external dependencies beyond `svelte` (peer) and `@anyhow/std`.

Tree-shakeable subpath imports — import only what you use:

```bash
bun add @anyhow/svelte
```

```ts
import { createToggle, createAsyncState } from "@anyhow/svelte/primitives";
import { createFormAction, safeLoad } from "@anyhow/svelte/composables";
import { createClickOutside } from "@anyhow/svelte/actions";
```

## Reactive primitives

26 standalone `$state`-based composables. No imports from `@anyhow/std` needed — but composes seamlessly with `@anyhow/std/schema` and `@anyhow/std/result`.

```ts
import {
  createToggle, // boolean toggle
  createCycle, // cycle through values
  createPrevious, // track previous value
  createResetable, // value with reset
  createDebouncedState, // debounced reactive state
  createThrottledState, // throttled reactive state
  createStore, // localStorage / sessionStorage sync
  createMediaQuery, // reactive media query
  createQueryParams, // URL search params sync
  createAsyncState, // async operation state (loading/data/error)
  createUndoRedo, // undo/redo stack
  createOnline, // navigator.onLine
  createInterval, // managed setInterval
  createTimeout, // managed setTimeout
  createScrollPosition, // scroll tracking
  createBreakpoints, // responsive breakpoints
  createCopyToClipboard, // clipboard access
  createActiveElement, // focus tracking
  createPolling, // async polling
  createWindowSize, // viewport dimensions
  createHash, // location.hash
  createIdle, // user idle detection
  createRaf, // requestAnimationFrame loop
  createEventSource, // managed EventSource
  createColorScheme, // prefers-color-scheme
  createVisibility, // page visibility
  isBrowser, // SSR-safe guard
} from "@anyhow/svelte";
```

## Svelte actions (`use:` directives)

```ts
import {
  createClickOutside, // detect clicks outside element
  createElementSize, // reactive ResizeObserver
  createIntersectionObserver, // IntersectionObserver
  createLongPress, // long press detection
} from "@anyhow/svelte";
```

## Form actions

Four progressive tiers — from bare-bones to full `@anyhow/std` `Result` integration:

```ts
import { createFormAction } from "@anyhow/svelte";

// Path A — simple action (no validation)
const form = createFormAction(async (fd) => {
  const name = fd.get("name");
  return await api.submit(name);
});

// Path D — schema + Result (first-party integration)
import { s } from "@anyhow/std/schema";
import { ok, err } from "@anyhow/std/result";

const loginSchema = s.object({ email: s.string(), password: s.string() });

const form = createFormAction({
  schema: loginSchema,
  action: async (data) => {
    const user = await api.login(data);
    return ok(user);
  },
});
// {#if form.result?.ok}
//   Welcome, {form.result.value.name}
// {/if}
```

## Load / actions safety

```ts
import { safeLoad, safeActions } from "@anyhow/svelte";

export const load = safeLoad(async (event) => {
  const user = await db.user.findUnique({ where: { id: event.params.id } });
  if (!user) throw new Error("Not found");
  return { user };
});
```

See the [main README](https://github.com/roushou/anyhow#svelte) for full documentation and examples.
