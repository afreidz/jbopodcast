<script lang="ts">
  import { SceneGrids } from "$/lib/classes";
  import type { Scene } from "$/actions/calls";
  import type { Member } from "$/actions/members";
  import { getCurrentUser } from "$/lib/pocketbase/client";
  import Sidebar from "$/components/shared/sidebar.svelte";
  import CallState from "./state/callConnect.state.svelte";
  import Devices from "$/components/shared/devices.svelte";
  import HostTools from "$/components/calls/hostTools.svelte";
  import VideoFeed from "$/components/calls/videoFeed.svelte";

  type Props = {
    call: string;
  };

  const currentUser = getCurrentUser();
  const callState = new CallState(currentUser);
  const qs = new URLSearchParams(window.location.search);

  let { call }: Props = $props();
  let stage: HTMLElement | undefined = $state(undefined);
  let localStream: MediaStream | undefined = $state(undefined);

  $effect(() => {
    if (localStream) {
      callState.init(call, localStream);
    }
  });

  async function onSceneChange(s: Scene) {
    if (callState.activeScene?.id === s.id) return;
    await callState.setActiveScene(s);
  }
</script>

<svelte:window onbeforeunload={async () => await callState.disconnect()} />

{#snippet Feed(peer: Member | null | undefined, area: "A" | "B" | "C" | "D")}
  {#if peer?.id === currentUser.id}
    <VideoFeed
      muted
      stream={localStream}
      member={currentUser}
      style="grid-area: {area};"
    />
  {:else if peer}
    {@const p = callState.remoteStreams.find((s) => s.id === peer.id)}
    {#if p}
      <VideoFeed member={peer} stream={p.stream} style="grid-area: {area};" />
    {/if}
  {/if}
{/snippet}

{#snippet Overflow(peers: Member[])}
  <div class="flex flex-col justify-evenly" style="grid-area: B">
    {#each peers as peer}
      {#if peer.id === currentUser.id}
        <VideoFeed
          muted
          member={peer}
          stream={localStream}
          class="aspect-square"
        />
      {:else if peer}
        {@const p = callState.remoteStreams.find((s) => s.id === peer.id)}
        {#if p}
          <VideoFeed member={peer} stream={p.stream} class="aspect-square" />
        {/if}
      {/if}
    {/each}
  </div>
{/snippet}

<Sidebar collapsible="none" class="size-full flex items-center justify-center">
  {#snippet sidebar()}
    {#if callState.hosting}
      <HostTools {onSceneChange} scenes={callState.scenes} class="h-svh" />
    {/if}
  {/snippet}
  {#if callState.activeScene && localStream}
    <main
      bind:this={stage}
      class:border-8={qs.has("showFrame")}
      class:opacity-0={callState.switchingScenes}
      style={SceneGrids[callState.activeScene.type]}
      class="flex-none grid w-[1920px] h-[1080px] overflow-clip border-red-500 border-dashed transition-opacity duration-300 px-8"
    >
      {#if callState.activeScene.type === "pull"}
        {@const others = callState.callMembers.filter(
          (m) => m.id !== callState.activeScene?.A
        )}
        {@render Feed(callState.activeScene?.expand?.A, "A")}
        {@render Overflow(others)}
      {:else}
        {@render Feed(callState.activeScene?.expand?.A, "A")}
        {@render Feed(callState.activeScene?.expand?.B, "B")}
        {@render Feed(callState.activeScene?.expand?.C, "C")}
        {@render Feed(callState.activeScene?.expand?.D, "D")}
      {/if}
    </main>
  {/if}
</Sidebar>

<Devices bind:stream={localStream} />
