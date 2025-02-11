<script lang="ts">
  import LocalFeed from "$/components/local.svelte";
  import RemoteFeed from "$/components/remote.svelte";
  import type { CallWithConnections } from "$/actions/calls";

  type Props = {
    me: App.Locals["user"];
    call: CallWithConnections;
  };

  let { call, me }: Props = $props();
  let localStream: MediaStream | undefined = $state(undefined);

  let localCamera: string | undefined = $state(
    localStorage.getItem("camera") ?? undefined
  );

  let localMicrophone: string | undefined = $state(
    localStorage.getItem("microphone") ?? undefined
  );

  let peers = $derived.by(() => {
    let peers = [];

    if (call.hostId !== me.id) peers.push(call.host);
    call.guests.forEach((g) => {
      if (g.id !== me.id) peers.push(g);
    });

    return peers;
  });

  $effect(() => {
    if (localCamera) localStorage.setItem("camera", localCamera);
    if (localMicrophone) localStorage.setItem("microphone", localMicrophone);
  });
</script>

<main class="flex flex-1 items-stretch">
  <LocalFeed
    {me}
    class="flex-1"
    bind:stream={localStream}
    bind:camera={localCamera}
    bind:microphone={localMicrophone}
  />
  {#if localStream}
    {#each peers as peer}
      <RemoteFeed {call} {peer} {me} myStream={localStream} class="flex-1" />
    {/each}
  {/if}
</main>
