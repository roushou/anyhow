<script lang="ts">
  import { createIntersectionObserver } from "../actions/intersection-observer.svelte.js";

  interface Props {
    onReady: (api: ReturnType<typeof createIntersectionObserver>) => void;
  }

  let { onReady }: Props = $props();

  const obs = createIntersectionObserver();

  onReady(obs);
</script>

<div use:obs.action>observed</div>
