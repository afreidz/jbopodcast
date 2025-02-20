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

  import { stream } from "$/lib/stream";
  import type { Scene } from "$/actions/calls";
  import type { Member } from "$/actions/members";
  import MemberIcon from "lucide-svelte/icons/user";
  import Avatar from "$/components/shared/avatar.svelte";
  import { ScrollArea } from "$/components/ui/scroll-area";
  import Button from "$/components/ui/button/button.svelte";

  type Props = {
    class?: string;
    scenes: Scene[];
    stage?: HTMLElement;
    streaming?: boolean;
    streams: (MediaStream | null)[];
    onSceneChange?: (s: Scene) => void;
  };

  let streamStopper: (() => void) | null = $state(null);

  let {
    stage,
    scenes,
    streams,
    class: classList = "",
    onSceneChange = console.log,
    streaming = $bindable(false),
  }: Props = $props();

  async function toggleStream() {
    if (streamStopper) {
      streamStopper();
      streaming = false;
    } else if (stage && streams.length) {
      streamStopper = await stream(stage, streams);
      streaming = true;
    }
  }
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
  <footer class="p-2 flex">
    {#if stage}
      <Button
        class="flex-1"
        onclick={toggleStream}
        variant={streaming ? "destructive" : "default"}
      >
        {streaming ? "End" : "Start"} Stream
      </Button>
    {/if}
  </footer>
</div>
