---
"@anyhow/std": minor
"@anyhow/svelte": minor
---

---

"@anyhow/std": minor
"@anyhow/svelte": minor

---

- **New `color` module** — `Color.fromHex`, `fromRgb`, `fromHsl` constructors; `toHex`, `toRgb`, `toRgbString`, `toHsl` converters; `lighten`, `darken`, `saturate`, `desaturate`, `mix`, `withAlpha` manipulation; `luminance` and `contrast` for WCAG 2.0 accessibility checks. Pure math, zero DOM dependencies.
- **New `Result.zip` and `Result.zipWith`** — combine two independent results into a tuple or apply a function, short-circuiting on the first `Err`.
- **Removed unnecessary type casts** from `Result` and `Option` implementations — cleaner internals, no API change.

### @anyhow/svelte

#### Reactive primitives (46 total)

**New in this release (20):**
`createMousePosition`, `createWebSocket`, `createPageLeave`, `createGeolocation`, `createFullscreen`, `createReducedMotion`, `createTextSelection`, `createPreferredLanguages`, `createWakeLock`, `createNetworkInformation`, `createSpeechRecognition`, `createNotification`, `createPointerLock`, `createScreenOrientation`, `createBroadcastChannel`, `createStateMachine`, `createEventListener`, `createBattery`, `createMediaDevices`, `createPerformanceObserver`

**Previously available (26):**
`createToggle`, `createCycle`, `createPrevious`, `createResetable`, `createDebouncedState`, `createThrottledState`, `createStore`, `createMediaQuery`, `createQueryParams`, `createAsyncState`, `createUndoRedo`, `createOnline`, `createInterval`, `createTimeout`, `createScrollPosition`, `createBreakpoints`, `createCopyToClipboard`, `createActiveElement`, `createPolling`, `createWindowSize`, `createHash`, `createIdle`, `createRaf`, `createEventSource`, `createColorScheme`, `createVisibility`

#### Svelte actions (21 total)

**New in this release (17):**
`createFocusTrap`, `createAutoFocus`, `createKeydown`, `createPortal`, `createSwipe`, `createLazyLoad`, `createMutationObserver`, `createHover`, `createFocus`, `createDraggable`, `createDismissible`, `createTextareaAutosize`, `createTooltip`, `createPaste`, `createCopy`, `createDropZone`, `createPreloadData`

**Previously available (4):**
`createClickOutside`, `createElementSize`, `createIntersectionObserver`, `createLongPress`

#### Composables

- **`createForm`** — unified form builder with per-field reactive state (value, error, touched, dirty), client-side validation on blur/change/submit, and optional SvelteKit `use:enhance` integration via `onSubmit`. **Replaces** `createFormAction` (removed).
- **`createViewTransition`** — reactive SvelteKit `onNavigate` wrapper with navigation type, source/destination URLs, and in-progress flag. Dependency-injected for tree-shakeability.
- **`createSearchParams`** — typed URL search params with per-param parse/serialize coercion. Supports numbers, booleans, arrays, and custom types. Syncs to `window.location` via `history.replaceState`.
- **`createPagination`** — reactive pagination state with prev/next, page clamping, and total pages.
- **`createFilteredList`** — reactive search + sort over a list with configurable search fields.
- **`createInfiniteScroll`** — page-based async loading with sentinel action for IntersectionObserver-based trigger.
- **`safeLoad`** / **`safeActions`** — error-boundary wrappers for SvelteKit load functions and form actions.

#### Internal

- **`listen()` utility** — internal typed event listener helper returning `{ destroy() }`. Used by `createEventListener` and all actions. Refactored 19 primitives and 8 actions to use it instead of hand-rolled `addEventListener`/`removeEventListener` pairs.

#### Fixes

- `createStateMachine` is now exported from the root `@anyhow/svelte` barrel (was only available via `@anyhow/svelte/primitives`).
- Removed stale `createPersistedState` declaration from type definitions (was renamed to `createStore`).
