<script lang="ts">
  import {
    Pull,
    TwoUp,
    FourUp,
    Splash,
    ThreeUp,
    Spotlight,
    Countdown,
  } from "$/components/calls/scenes.svelte";

  import type { Member } from "$/actions/members";
  import MemberIcon from "lucide-svelte/icons/user";
  import Avatar from "$/components/shared/avatar.svelte";
  import { getCurrentUser } from "$/lib/pocketbase/client";
  import { ScrollArea } from "$/components/ui/scroll-area";
  import Button from "$/components/ui/button/button.svelte";
  import MicFilters from "$/components/calls/micFilters.svelte";
  import Participant from "$/components/calls/participant.svelte";
  import SettingsIcon from "lucide-svelte/icons/sliders-horizontal";
  import CallConnectionState from "$/state/call.connect.state.svelte";

  type Props = {
    class?: string;
    state: CallConnectionState;
  };

  let currentUser = getCurrentUser();
  let micFiltersShown: boolean = $state(false);
  let { class: classList = "", state: connectionState }: Props = $props();
  let isHosting = $derived(connectionState.call.host === currentUser.id);
</script>

{#snippet SceneMember(member: Member | null)}
  <div class="size-full flex items-center justify-center">
    {#if member}
      <Avatar
        email={member.email}
        class="size-6 text-xs"
        name={member.handle || member.name}
      />
    {:else}
      <MemberIcon class="text-muted" />
    {/if}
  </div>
{/snippet}

<div class="p-4 flex flex-col gap-2 {classList}">
  {#if isHosting}
    <strong>Scene Switch</strong>
    <ScrollArea class="w-full flex-1">
      {#each connectionState.scenes as scene}
        {#snippet AMember()}
          {@render SceneMember(scene.expand?.A ?? null)}
        {/snippet}
        {#snippet BMember()}
          {@render SceneMember(scene.expand?.B ?? null)}
        {/snippet}
        {#snippet CMember()}
          {@render SceneMember(scene.expand?.C ?? null)}
        {/snippet}
        {#snippet DMember()}
          {@render SceneMember(scene.expand?.D ?? null)}
        {/snippet}
        <button
          onclick={async () => await connectionState.setActiveScene(scene)}
          class="flex w-full items-center gap-4 hover:bg-white/5 rounded-md"
        >
          <div class="h-20">
            {#if scene.type === "spotlight"}
              {@render Spotlight(AMember)}
            {:else if scene.type === "twoUp"}
              {@render TwoUp(AMember, BMember)}
            {:else if scene.type === "threeUp"}
              {@render ThreeUp(AMember, BMember, CMember)}
            {:else if scene.type === "fourUp"}
              {@render FourUp(AMember, BMember, CMember, DMember)}
            {:else if scene.type === "pull"}
              {@render Pull(AMember)}
            {:else if scene.type === "splash"}
              {@render Splash()}
            {:else if scene.type === "countdown"}
              {@render Countdown()}
            {/if}
          </div>
          <strong>{scene.label}</strong>
        </button>
      {/each}
    </ScrollArea>
  {/if}
  <strong>Participant Audio</strong>
  <ScrollArea class="w-full flex-1">
    <Participant state={connectionState.localStreamState} />
    {#each connectionState.connections as connection}
      {#key connection.peer.id}
        <Participant state={connection.remoteState} />
      {/key}
    {/each}
  </ScrollArea>
  <footer class="flex gap-2 justify-center">
    <Button
      size="icon"
      disabled={connectionState.live}
      onclick={() => (micFiltersShown = true)}
    >
      <SettingsIcon />
    </Button>
    {#if connectionState.ready && isHosting}
      <Button
        class="flex-1"
        disabled={connectionState.loading}
        variant={connectionState.live ? "destructive" : "default"}
      >
        {connectionState.live ? "End" : "Start"} Stream
      </Button>
    {/if}
  </footer>
</div>
<MicFilters
  bind:open={micFiltersShown}
  local={connectionState.localStreamState}
/>
