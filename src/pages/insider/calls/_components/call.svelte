<script lang="ts">
  import { SceneGrids } from "$/lib/classes";
  import type { Scene } from "$/actions/scenes";
  import { type Member } from "$/actions/members";
  import LocalFeed from "$/components/local.svelte";
  import RemoteFeed from "$/components/remote.svelte";
  import HostTools from "$/components/hostTools.svelte";
  import type { CallWithConnections } from "$/actions/calls";
  import { cache as connections } from "$/lib/connection.svelte";

  const qs = new URLSearchParams(window.location.search);

  type Props = {
    me: App.Locals["user"];
    call: CallWithConnections;
  };

  let switching = $state(false);
  let { call, me }: Props = $props();
  let activeScene = $state(call.scenes[0]);
  let stage: HTMLElement | undefined = $state(undefined);
  let localStream: MediaStream | undefined = $state(undefined);
  let stageBox = $derived(
    !!stage ? (stage as HTMLElement).getClientRects()[0] : undefined
  );

  $inspect(stage ? (stage as HTMLElement).getClientRects() : null);

  let localCamera: string | undefined = $state(
    localStorage.getItem("camera") ?? undefined
  );

  let localMicrophone: string | undefined = $state(
    localStorage.getItem("microphone") ?? undefined
  );

  $effect(() => {
    if (localCamera) localStorage.setItem("camera", localCamera);
    if (localMicrophone) localStorage.setItem("microphone", localMicrophone);
  });

  $effect(() => {
    navigator.mediaDevices
      .getUserMedia({
        audio: {
          deviceId: localMicrophone,
          sampleRate: { ideal: 96000, min: 44100 },
        },
        video: {
          deviceId: localCamera,
          frameRate: { ideal: 60, min: 30 },
          width: { ideal: 2160, min: 1280 },
        },
      })
      .then((device) => {
        localStream = device;
      });
  });

  async function onSceneChange(s: Scene) {
    switching = true;
    await new Promise((r) => setTimeout(r, 400));
    activeScene = s;
    connections.forEach((c) => {
      c.sendSceneChange(s.id);
    });
    switching = false;
  }
</script>

{#snippet Feed(peer: Member | null, area: "A" | "B" | "C" | "D")}
  {#if peer?.id === me.id}
    <LocalFeed
      {me}
      class="flex-1"
      style="grid-area: {area};"
      bind:stream={localStream}
      bind:camera={localCamera}
      bind:microphone={localMicrophone}
    />
  {:else if peer}
    <RemoteFeed {me} {call} {peer} class="flex-1" myStream={localStream!} />
  {/if}
{/snippet}

<nav></nav>

<main
  bind:this={stage}
  class:opacity-0={switching}
  style={SceneGrids[activeScene.type]}
  class:border-8={qs.has("showFrame")}
  class="flex-none grid w-[1920px] aspect-video border-red-500 border-dashed transition-opacity duration-300"
>
  {#if localStream}
    {@render Feed(activeScene.A, "A")}
    {@render Feed(activeScene.B, "B")}
    {@render Feed(activeScene.C, "C")}
    {@render Feed(activeScene.D, "D")}
  {/if}
</main>

<aside class="flex justify-end">
  {#if me.id === call.hostId && localStream}
    <HostTools {stageBox} {localStream} {onSceneChange} scenes={call.scenes} />
  {/if}
</aside>
