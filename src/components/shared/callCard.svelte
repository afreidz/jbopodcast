<script lang="ts">
  import { type Call } from "$/actions/calls";
  import * as Card from "$/components/ui/card";
  import { Skeleton } from "$/components/ui/skeleton";
  import Avatar from "$/components/shared/avatar.svelte";

  type Props = {
    call?: Call;
    href?: string;
  };

  let { call, href }: Props = $props();

  let scheduled = $derived(
    call?.scheduled ? new Date(call.scheduled) : new Date()
  );

  let isToday = $derived.by(() => {
    if (!call?.scheduled) return false;
    const today = new Date();
    return today.toDateString() === scheduled.toDateString();
  });
</script>

<Card.Root class="group mb-2">
  <a class:pointer-events-none={!href} {href}>
    <Card.Header class="text-sm flex !flex-row items-center gap-2">
      {#if !call}
        <Skeleton class="h-5 w-1/2" />
      {:else if isToday}
        <i class="size-2 rounded-full bg-red-500"></i>
        Today @ {scheduled.toLocaleTimeString("en-US", {
          hour12: true,
          hour: "numeric",
          minute: "2-digit",
        })}
      {:else if call}
        <i class="size-2 rounded-full bg-emerald-500"></i>
        Upcoming at {scheduled.toLocaleString("en-US", {
          timeStyle: "short",
          dateStyle: "medium",
        })}
      {/if}
    </Card.Header>
    <Card.Content>
      {#if !call}
        <Skeleton class="h-7" />
      {:else}
        <Card.Title class="text-xl">{call.title}</Card.Title>
      {/if}
    </Card.Content>
    <Card.Footer class="flex justify-end gap-4">
      <div class="flex flex-row-reverse">
        {#if !call}
          <Skeleton class="size-6 rounded-full" />
        {:else if call.expand}
          {#each [call.expand.host, ...call.expand.guests] as guest}
            <Avatar
              name={guest.name}
              email={guest.email}
              class="size-6 text-xs -mx-[3px]"
            />
          {/each}
        {/if}
      </div>
    </Card.Footer>
  </a>
</Card.Root>
