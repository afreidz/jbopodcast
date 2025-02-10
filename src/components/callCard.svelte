<script lang="ts" module>
  import type { Call } from "$/actions/calls";
  export type CallWithDetails = {
    call: Call;
    details: {
      disabled?: boolean;
    };
  };
</script>

<script lang="ts">
  import {
    isToday,
    getLocalTimeZone,
    parseAbsoluteToLocal,
  } from "@internationalized/date";

  import * as Card from "$/components/ui/card";
  import Avatar from "$/components/avatar.svelte";

  type Props = {
    call: CallWithDetails;
  };

  let { call: passedCall }: Props = $props();
  let { call, details } = passedCall;

  let localDTZ = $derived(parseAbsoluteToLocal(call.scheduled.toISOString()));
  let localDate = $derived(localDTZ.toDate());
</script>

<Card.Root>
  <a
    class:pointer-events-nont={details.disabled}
    href={`/insider/calls/${call.id}/join`}
  >
    <Card.Header class="text-sm flex !flex-row items-center gap-2">
      {#if isToday(localDTZ, getLocalTimeZone())}
        <i class="size-2 rounded-full bg-red-500"></i>
        Today @ {localDate.toLocaleTimeString("en-US", {
          hour12: true,
          hour: "numeric",
          minute: "2-digit",
        })}
      {:else}
        <i class="size-2 rounded-full bg-emerald-500"></i>
        Upcoming at {localDate.toLocaleString("en-US", {
          timeStyle: "short",
          dateStyle: "medium",
        })}
      {/if}
    </Card.Header>
    <Card.Content>
      <Card.Title class="text-xl">{call.title}</Card.Title>
    </Card.Content>
    <Card.Footer class="flex justify-end gap-4">
      <Avatar
        class="size-6"
        name={call.host.name}
        email={call.host.user.email}
      />
      <div class="flex -space-x-4">
        {#each call.guests as guest}
          <Avatar class="size-6" name={guest.name} email={guest.user.email} />
        {/each}
      </div>
    </Card.Footer>
  </a>
</Card.Root>
