<script lang="ts">
  import {
    Pull,
    TwoUp,
    FourUp,
    Splash,
    ThreeUp,
    Spotlight,
    Countdown,
  } from "$/pages/insider/calls/_components/configure.svelte";

  import stream from "$/lib/stream";
  import type { Scene } from "$/actions/scenes";
  import { Button } from "$/components/ui/button";
  import type { Member } from "$/actions/members";
  import Avatar from "$/components/avatar.svelte";
  import MemberIcon from "lucide-svelte/icons/user";
  import { ScrollArea } from "$/components/ui/scroll-area";

  type Props = {
    scenes: Scene[];
    stageBox?: DOMRect;
    localStream: MediaStream;
    setScene?: (s: Scene) => void;
  };

  let streaming = $state(false);
  let {
    stageBox,
    localStream,
    scenes,
    setScene = console.log,
  }: Props = $props();

  async function handleStartStream() {
    if (!stageBox) throw new Error("Cannot record without a target area");
    streaming = true;
    await stream(stageBox, localStream.getAudioTracks()[0]);
    streaming = false;
  }

  $inspect(stageBox);
</script>

{#snippet SceneMember(member: Member | null)}
  <div class="size-full flex items-center justify-center">
    {#if member}
      <Avatar
        class="size-6 text-xs"
        name={member.handle || member.name}
        email={member.user.email!}
      />
    {:else}
      <MemberIcon class="text-muted" />
    {/if}
  </div>
{/snippet}

<div class="flex-1 m-2 rounded-2xl bg-muted max-w-xs p-4 flex flex-col gap-2">
  <Button onclick={handleStartStream} class="flex-none" disabled={streaming}
    >Stream</Button
  >
  <strong class="mt-8">Scene Switch</strong>
  <ScrollArea class="w-full flex-1">
    {#each scenes as scene}
      {#snippet AMember()}
        {@render SceneMember(scene.A)}
      {/snippet}
      {#snippet BMember()}
        {@render SceneMember(scene.B)}
      {/snippet}
      {#snippet CMember()}
        {@render SceneMember(scene.C)}
      {/snippet}
      {#snippet DMember()}
        {@render SceneMember(scene.D)}
      {/snippet}
      <button
        onclick={() => setScene(scene)}
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
</div>
