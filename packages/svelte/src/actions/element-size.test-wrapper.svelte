<script lang="ts">
  import { createElementSize } from "../actions/element-size.svelte.js";

  interface Props {
    onReady: (api: ReturnType<typeof createElementSize>) => void;
  }

  let { onReady }: Props = $props();

  const size = createElementSize();

  onReady(size);
</script>

<div use:size.action style="width: 200px; height: 100px;">resize me</div>
