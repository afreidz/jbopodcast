<script lang="ts">
  import type { Call } from "$/actions/calls";
  import * as Card from "$/components/ui/card";
  import CallCard from "$/components/callCard.svelte";
  import { buttonVariants } from "$/components/ui/button";

  type Props = {
    calls: Call[];
  };

  let { calls }: Props = $props();
</script>

{#if !calls.length}
  <Card.Root>
    <Card.Header class="text-sm flex !flex-row items-center gap-2">
      <Card.Title>No Upcoming Calls</Card.Title>
    </Card.Header>
    <Card.Content>
      <a class={buttonVariants()} href={`/insider/calls/new`}>
        Schedule a new call
      </a>
    </Card.Content>
  </Card.Root>
{:else}
  {#each calls as call}
    {@const callWithDetails = { call, details: { disabled: false } }}
    <CallCard call={callWithDetails} />
  {/each}
{/if}
