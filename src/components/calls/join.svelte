<script lang="ts">
  import { SceneGrids } from "$/lib/classes";
  import type { Call } from "$/actions/calls";
  import type { Member } from "$/actions/members";
  import Feed from "$/components/calls/feed.svelte";
  import Tools from "$/components/calls/tools.svelte";
  import { getCurrentUser } from "$/lib/pocketbase/client";
  import Sidebar from "$/components/shared/sidebar.svelte";
  import Devices from "$/components/shared/devices.svelte";
  import RemoteStreamState from "$/state/remote.stream.state.svelte";
  import CallConnectionState from "$/state/call.connect.state.svelte";
  import StreamMonitor from "$/components/calls/streamMonitor.svelte";
  import type LocalStreamState from "$/state/local.stream.state.svelte";
  import Countdown from "./countdown.svelte";

  type Props = {
    call: Call;
  };

  let { call }: Props = $props();
  let currentUser = getCurrentUser();
  let stage: HTMLElement | undefined = $state(undefined);
  let connection: CallConnectionState | null = $state(null);
  let localStreamState: LocalStreamState | undefined = $state(undefined);

  $effect(() => {
    if (localStreamState?.stream && !connection) {
      connection = new CallConnectionState(call, localStreamState);
    }
  });
</script>

<svelte:window onbeforeunload={async () => await connection?.disconnect()} />

{#snippet MainFeed(
  peer: Member | null | undefined,
  area: "A" | "B" | "C" | "D"
)}
  {#if peer?.id === currentUser.id && localStreamState}
    <Feed muted state={localStreamState} style="grid-area: {area};" />
  {:else if peer}
    {@const c = connection?.connections.find((s) => s.peer.id === peer.id)}
    {#if c}
      <Feed state={c.remoteState} style="grid-area: {area};" />
    {/if}
  {/if}
{/snippet}

{#snippet Overflow(streams: (LocalStreamState | RemoteStreamState)[])}
  <div class="flex flex-col justify-evenly" style="grid-area: B">
    {#each streams as stream}
      {#if stream.member.id === currentUser.id && localStreamState}
        <Feed muted class="aspect-square" state={localStreamState} />
      {:else}
        <Feed state={stream} class="aspect-square" />
      {/if}
    {/each}
  </div>
{/snippet}

{#snippet sidebarLeft()}
  {#if connection}
    <Tools class="h-svh" bind:stage state={connection} />
  {/if}
{/snippet}

{#snippet sidebarRight()}
  {#if connection}
    <aside class="flex-1 flex flex-col">
      <StreamMonitor state={connection} />
    </aside>
  {/if}
{/snippet}

{#if connection}
  <Sidebar
    {sidebarLeft}
    collapsible="offcanvas"
    class="size-full flex items-center justify-center"
    sidebarRight={connection.live ? sidebarRight : undefined}
  >
    {#if connection.activeScene}
      <main
        bind:this={stage}
        class:opacity-0={connection.switchingScenes}
        style={SceneGrids[connection.activeScene.type]}
        class="flex-none grid gap-4 w-[1920px] h-[1080px] overflow-clip border-red-500 border-dashed transition-opacity duration-300 px-8"
      >
        {#if connection.activeScene.type === "pull"}
          {@const others = connection.connections
            .filter((c) => c.peer.id !== connection?.activeScene?.A)
            .map((o) => o.remoteState)}

          {@render MainFeed(connection.activeScene.expand?.A, "A")}

          {#if connection.activeScene.A === currentUser.id}
            {@render Overflow(others)}
          {:else if localStreamState}
            {@render Overflow([...others, localStreamState])}
          {/if}
        {:else if connection.activeScene.type === "splash" && connection.activeScene.splashURL}
          <img src={connection.activeScene.splashURL} alt="scene splash" />
        {:else if connection.activeScene.type === "countdown"}
          <Countdown ms={connection.activeScene.countdownMS} />
        {:else}
          {@render MainFeed(connection.activeScene?.expand?.A, "A")}
          {@render MainFeed(connection.activeScene?.expand?.B, "B")}
          {@render MainFeed(connection.activeScene?.expand?.C, "C")}
          {@render MainFeed(connection.activeScene?.expand?.D, "D")}
        {/if}
      </main>
    {/if}
  </Sidebar>
{/if}

<Devices bind:state={localStreamState} />
