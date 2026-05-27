/**
 * Reactive Notification API wrapper backed by Svelte 5 `$state`.
 *
 * Manages notification permission state and provides a `show` method for
 * firing desktop notifications. SSR-safe.
 *
 * @returns `{ permission, isSupported, show }`.
 *
 * @example
 * ```svelte
 * <script>
 *   import { createNotification } from "@anyhow/svelte";
 *   const notif = createNotification();
 * </script>
 *
 * <button onclick={() => notif.show("Hello!", { body: "World" })}>
 *   Notify
 * </button>
 * ```
 */
export function createNotification() {
  let permission = $state<NotificationPermission>(
    typeof Notification !== "undefined" ? Notification.permission : "denied",
  );
  const isSupported = typeof Notification !== "undefined";

  $effect(() => {
    if (!isSupported) return;

    function update() {
      permission = Notification.permission;
    }

    // Permission can change via browser settings; watch with a timer as a fallback
    if ("permissions" in navigator) {
      navigator.permissions.query({ name: "notifications" }).then((status) => {
        status.addEventListener("change", update);
      });
    }
  });

  return {
    /** The current notification permission: `"default"`, `"granted"`, or `"denied"`. */
    get permission() {
      return permission;
    },
    /** Whether the Notification API is supported. */
    get isSupported() {
      return isSupported;
    },
    /** Shows a notification. Returns `true` if permission is granted. */
    show(title: string, opts?: NotificationOptions) {
      if (!isSupported || permission !== "granted") return false;
      new Notification(title, opts);
      return true;
    },
  };
}
