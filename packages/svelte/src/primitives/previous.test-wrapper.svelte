<script lang="ts">
  import { createResetable } from "./resetable.svelte.js";
  import { createPrevious } from "./previous.svelte.js";

  interface Props {
    onReady: (api: {
      state: ReturnType<typeof createResetable>;
      prev: ReturnType<typeof createPrevious>;
    }) => void;
    initial?: any;
  }

  let { onReady, initial = 0 }: Props = $props();

  const state = createResetable(initial);
  const prev = createPrevious(() => state.value);

  onReady({ state, prev });
</script>
