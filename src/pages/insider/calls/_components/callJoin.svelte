<script lang="ts">
  import { SceneGrids } from "$/lib/classes";
  import { type Member } from "$/actions/members";
  import LocalFeed from "$/components/local.svelte";
  import RemoteFeed from "$/components/remote.svelte";
  import type { CallWithConnections } from "$/actions/calls";

  type Props = {
    me: App.Locals["user"];
    call: CallWithConnections;
  };

  let { call, me }: Props = $props();
  let localStream: MediaStream | undefined = $state(undefined);
  let activeScene = $state(call.scenes.at(-1) ?? call.scenes[0]);

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

<main
  style={SceneGrids[activeScene.type]}
  class="flex-1 grid w-[1920px] aspect-video"
>
  {#if localStream}
    {@render Feed(activeScene.A, "A")}
    {@render Feed(activeScene.B, "B")}
    {@render Feed(activeScene.C, "C")}
    {@render Feed(activeScene.D, "D")}
  {/if}
</main>
