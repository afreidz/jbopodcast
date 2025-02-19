<script lang="ts">
  import client from "$/lib/pocketbase";
  import { SceneGrids } from "$/lib/classes";
  import type { Scene } from "$/actions/calls";
  import type { Member } from "$/actions/members";
  import CallState from "./state/callConnect.state.svelte";
  import Devices from "$/components/shared/devices.svelte";
  import HostTools from "$/components/calls/hostTools.svelte";
  import VideoFeed from "$/components/calls/videoFeed.svelte";

  type Props = {
    call: string;
  };

  const qs = new URLSearchParams(window.location.search);
  const callState = new CallState(client.authStore.record!);

  let switching = $state(false);
  let { call }: Props = $props();
  let stage: HTMLElement | undefined = $state(undefined);
  let localStream: MediaStream | undefined = $state(undefined);

  // onMount(() => {
  //   supabase.channel("schema-db-changes").on(
  //     "postgres_changes",
  //     {
  //       event: "*",
  //       schema: "public",
  //       table: "call",
  //     },
  //     async (payload: RealtimePostgresChangesPayload<CallWithConnections>) => {
  //       if (payload.eventType !== "UPDATE") return;
  //       if (payload.new.id !== call.id) return;
  //       // TODO change scene
  //     }
  //   );
  // });

  $effect(() => {
    if (localStream) {
      callState.init(call, localStream);
    }
  });

  async function onSceneChange(s: Scene) {
    if (callState.activeScene?.id === s.id) return;
    switching = true;
    await new Promise((r) => setTimeout(r, 400));
    callState.activeScene = s;
    switching = false;
  }
</script>

<svelte:window onbeforeunload={async () => await callState.disconnect()} />

{#snippet Feed(peer: Member | null | undefined, area: "A" | "B" | "C" | "D")}
  {#if peer?.id === client.authStore.record!.id}
    <VideoFeed
      stream={localStream}
      style="grid-area: {area};"
      member={client.authStore.record! as unknown as Member}
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
      {#if peer.id === client.authStore.record!.id}
        <VideoFeed member={peer} stream={localStream} class="aspect-square" />
      {:else if peer}
        {@const p = callState.remoteStreams.find((s) => s.id === peer.id)}
        {#if p}
          <VideoFeed member={peer} stream={p.stream} class="aspect-square" />
        {/if}
      {/if}
    {/each}
  </div>
{/snippet}

<nav></nav>

{#if callState.activeScene && localStream}
  <main
    bind:this={stage}
    class:opacity-0={switching}
    class:border-8={qs.has("showFrame")}
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

<aside class="flex justify-end">
  <HostTools {onSceneChange} scenes={callState.scenes} />
</aside>

<Devices bind:stream={localStream} />
