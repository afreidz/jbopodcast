<script lang="ts">
  import type { Call } from "$/actions/calls";
  import CallCard from "$/components/callCard.svelte";

  type Props = {
    calls: Call[];
  };

  let { calls }: Props = $props();
</script>

{#each calls as call}
  {@const callWithDetails = { call, details: { disabled: false } }}
  <CallCard call={callWithDetails} />
{/each}
