# @anyhow/svelte

SvelteKit 5 reactive primitives, composables, and form-action utilities. Builds on Svelte 5 runes (`$state`, `$derived`, `$effect`) with zero external dependencies beyond `svelte` (peer) and `@anyhow/std`.

Tree-shakeable subpath imports — import only what you use:

```bash
bun add @anyhow/svelte
```

```ts
import { createToggle, createAsyncState } from "@anyhow/svelte/primitives";
import { createFormAction, createPagination } from "@anyhow/svelte/composables";
import { createClickOutside, createFocusTrap } from "@anyhow/svelte/actions";
```

## Reactive primitives (42)

Standalone `$state`-based composables. No imports from `@anyhow/std` needed — but composes seamlessly with `@anyhow/std/schema` and `@anyhow/std/result`.

```ts
import {
  // State
  createToggle, // boolean toggle
  createCycle, // cycle through values
  createPrevious, // track previous value
  createResetable, // value with reset
  createDebouncedState, // debounced reactive state
  createThrottledState, // throttled reactive state
  createStore, // localStorage / sessionStorage sync
  createUndoRedo, // undo/redo stack
  createStateMachine, // finite state machine (from @anyhow/std/state)

  // URL / Browser
  createMediaQuery, // reactive media query
  createQueryParams, // URL search params sync
  createHash, // location.hash
  createColorScheme, // prefers-color-scheme
  createReducedMotion, // prefers-reduced-motion
  createVisibility, // page visibility
  isBrowser, // SSR-safe guard

  // DOM / Input
  createMousePosition, // reactive mouse coordinates
  createScrollPosition, // scroll tracking
  createWindowSize, // viewport dimensions
  createBreakpoints, // responsive breakpoints
  createActiveElement, // focus tracking
  createCopyToClipboard, // clipboard access
  createTextSelection, // reactive text selection

  // Async
  createAsyncState, // async operation (loading/data/error)
  createPolling, // async polling
  createInterval, // managed setInterval
  createTimeout, // managed setTimeout
  createRaf, // requestAnimationFrame loop

  // Network
  createOnline, // navigator.onLine
  createWebSocket, // reactive WebSocket connection
  createEventSource, // managed EventSource
  createNetworkInformation, // navigator.connection

  // Browser APIs
  createGeolocation, // navigator.geolocation
  createFullscreen, // Fullscreen API
  createWakeLock, // Screen Wake Lock API
  createPageLeave, // beforeunload guard
  createPreferredLanguages, // navigator.languages
  createNotification, // Notification API
  createSpeechRecognition, // Web Speech API
  createPointerLock, // Pointer Lock API
  createScreenOrientation, // Screen Orientation API
  createBroadcastChannel, // cross-tab messaging
} from "@anyhow/svelte";
```

## Svelte actions (`use:` directives) (14)

```ts
import {
  createClickOutside, // detect clicks outside element
  createFocusTrap, // trap Tab/Shift+Tab within element
  createAutoFocus, // auto-focus on mount
  createKeydown, // keyboard shortcuts
  createPortal, // move element to another DOM container
  createElementSize, // reactive ResizeObserver
  createIntersectionObserver, // IntersectionObserver
  createLazyLoad, // IntersectionObserver with callback
  createLongPress, // long press detection
  createSwipe, // touch swipe detection
  createMutationObserver, // DOM mutation watching
  createHover, // hover state tracking
  createFocus, // focus state tracking
  createDraggable, // pointer-based drag
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

## Data composables

```ts
import {
  createPagination, // page, perPage, total, prev/next
  createFilteredList, // search + sort over a list
  createInfiniteScroll, // page-based loading with sentinel action
} from "@anyhow/svelte";
```

See the [main README](https://github.com/roushou/anyhow#svelte) for full documentation and examples.
