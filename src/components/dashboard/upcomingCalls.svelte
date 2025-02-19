<script lang="ts">
  import type { Call } from "$/actions/calls";
  import * as Card from "$/components/ui/card";
  import { buttonVariants } from "$/components/ui/button";
  import CallCard from "$/components/shared/callCard.svelte";

  type Props = {
    calls: Call[];
    loading: boolean;
  };

  let { calls, loading }: Props = $props();
</script>

<div class="flex flex-col gap-3 min-w-80">
  <strong>Upcoming Calls</strong>
  {#if loading}
    <CallCard />
  {:else if !calls.length}
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
      <CallCard {call} href={`/insider/calls/${call.id}/join`} />
    {/each}
  {/if}
</div>
