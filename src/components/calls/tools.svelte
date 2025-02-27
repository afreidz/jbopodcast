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
  import Feed from "$/components/calls/feed.svelte";
  import userState from "$/state/user.state.svelte";
  import { navigate } from "astro:transitions/client";
  import Avatar from "$/components/shared/avatar.svelte";
  import { ScrollArea } from "$/components/ui/scroll-area";
  import SettingsIcon from "lucide-svelte/icons/mic-vocal";
  import Button from "$/components/ui/button/button.svelte";
  import MicFilters from "$/components/calls/micFilters.svelte";
  import CallConnectionState from "$/state/call.connect.state.svelte";

  type Props = {
    class?: string;
    stage?: HTMLElement;
    state: CallConnectionState;
  };

  let micFiltersShown: boolean = $state(false);
  let {
    class: classList = "",
    state: connectionState,
    stage = $bindable(),
  }: Props = $props();

  let isHosting = $derived(
    connectionState.call.host === userState.currentUser?.id
  );

  async function disconnect() {
    await connectionState.disconnect();
    return navigate("/insider");
  }
</script>

{#snippet SceneMember(member: Member | null)}
  <div class="size-full flex items-center justify-center">
    {#if member}
      <Avatar {member} />
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
          <div class="flex-1">
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
          {#if connectionState.scenes.some((s) => !!s.label)}
            <strong class="flex-1 truncate">{scene.label}</strong>
          {/if}
        </button>
      {/each}
    </ScrollArea>
  {/if}
  <strong>Participant Audio</strong>
  <ScrollArea class="w-full flex-1">
    <div class="w-full aspect-video mb-2">
      <Feed
        muted
        hideVideo
        hideBadge
        showAnalyzser
        class="size-full"
        largeBorder={false}
        state={connectionState.localStreamState}
      />
    </div>
    {#each connectionState.connections as connection}
      {#key connection.peer.id}
        <div class="w-full aspect-video mb-2">
          <Feed
            muted
            hideBadge
            hideVideo
            showAnalyzser
            class="size-full"
            largeBorder={false}
            state={connection.remoteState}
          />
        </div>
      {/key}
    {/each}
  </ScrollArea>
  <footer class="flex flex-col gap-2 justify-center">
    <Button
      size="icon"
      disabled={connectionState.live}
      onclick={() => (micFiltersShown = true)}
    >
      <SettingsIcon />
    </Button>
    {#if isHosting && stage}
      <Button
        class="flex-1"
        disabled={connectionState.loading}
        variant={connectionState.live ? "destructive" : "default"}
        onclick={async () => {
          connectionState.live
            ? await connectionState.stopStream()
            : await connectionState.startStream(stage);
        }}
      >
        {connectionState.live ? "End" : "Start"} Stream
      </Button>
    {/if}
    <Button onclick={() => disconnect()} variant="destructive"
      >Disconnect</Button
    >
  </footer>
</div>
<MicFilters
  bind:open={micFiltersShown}
  local={connectionState.localStreamState}
/>
