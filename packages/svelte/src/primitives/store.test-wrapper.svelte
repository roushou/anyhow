<script lang="ts">
  import { createStore } from "./store.svelte.js";

  interface Props {
    onReady: (api: { value: any }) => void;
    key: string;
    initial: any;
    storage?: "local" | "session";
  }

  let { onReady, key, initial, storage }: Props = $props();

  const state = createStore({ key, initial, storage });

  onReady(state);
</script>
