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

  import { onMount } from "svelte";
  import { actions } from "astro:actions";
  import type { Scene } from "$/actions/calls";
  import type { Member } from "$/actions/members";
  import MemberIcon from "lucide-svelte/icons/user";
  import Avatar from "$/components/shared/avatar.svelte";
  import { ScrollArea } from "$/components/ui/scroll-area";
  import Button from "$/components/ui/button/button.svelte";
  import StreamingState from "./state/streaming.state.svelte";
  import Participant from "$/components/calls/participant.svelte";

  type Props = {
    class?: string;
    scenes: Scene[];
    stage?: HTMLElement;
    state: StreamingState;
    streams: {
      id: string;
      stream: MediaStream | null;
    }[];
    onSceneChange?: (s: Scene) => void;
  };

  let allMembers: Member[] = $state([]);

  let {
    stage,
    scenes,
    streams,
    state: streamingState,
    class: classList = "",
    onSceneChange = console.log,
  }: Props = $props();

  onMount(async () => {
    const resp = await actions.members.getAll();
    if (resp.data) allMembers = resp.data;
  });

  $effect(() => {
    if (streams.length && stage) {
      streamingState.init(
        streams.filter((s) => !!s.stream).map((s) => s.stream) as MediaStream[],
        stage
      );
    }
  });
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
  <strong>Scene Switch</strong>
  <ScrollArea class="w-full flex-1">
    {#each scenes as scene}
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
        onclick={() => onSceneChange(scene)}
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
  <strong>Participant Audio</strong>
  <ScrollArea class="w-full flex-1">
    {#each streams as { id, stream }}
      {@const member = allMembers.find((m) => m.id === id)}
      {#if member}
        {#key member.id}
          <Participant {member} {stream} />
        {/key}
      {/if}
    {/each}
  </ScrollArea>
  <footer class="p-2 flex">
    {#if streamingState.ready}
      <Button
        disabled={streamingState.loading}
        class="flex-1"
        onclick={() =>
          streamingState.live
            ? streamingState.stopStream()
            : streamingState.startStream()}
        variant={streamingState.live ? "destructive" : "default"}
      >
        {streamingState.live ? "End" : "Start"} Stream
      </Button>
    {/if}
  </footer>
</div>
