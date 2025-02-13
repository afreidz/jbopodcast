<script lang="ts">
  import { onMount } from "svelte";
  import { Badge } from "$/components/ui/badge";
  import Avatar from "$/components/avatar.svelte";
  import type { Member } from "$/actions/members";
  import { Skeleton } from "$/components/ui/skeleton";
  import PeerConnection from "$/lib/connection.svelte";
  import type { CallWithConnections } from "$/actions/calls";

  type Props = {
    peer: Member;
    class?: string;
    style?: string;
    myStream: MediaStream;
    me: App.Locals["user"];
    call: CallWithConnections;
  };

  let {
    me,
    peer,
    call,
    myStream,
    style = "",
    class: classList = "",
  }: Props = $props();

  let loading = $state(false);
  let video: HTMLVideoElement | null = $state(null);
  let connection: PeerConnection | null = $state(null);

  $effect(() => {
    if (video && connection?.stream) {
      video.srcObject = connection.stream;
    }
  });

  onMount(async () => {
    connection = new PeerConnection(peer.id, call.id, me.id, myStream);

    const existing = call.connections.find(
      (c) => c.fromId === peer.id && c.toId === me.id
    );

    if (existing) {
      await connection.answerOffer(existing);
    } else {
      await connection.createOffer();
    }
  });

  async function cleanup() {
    console.log("disconnecting");
    await connection?.disconnect();
  }
</script>

<svelte:window onbeforeunload={async () => await cleanup()} />

<div class="p-10 flex items-center justify-center {classList}" {style}>
  {#if loading}
    <div class="size-full">
      <Skeleton class="size-12 rounded-full" />
    </div>
  {:else if connection?.stream}
    <div
      class="relative rounded-2xl h-full w-full overflow-hidden border-accent border-8"
    >
      <!-- svelte-ignore a11y_media_has_caption -->
      <video
        autoplay
        playsinline
        bind:this={video}
        class="aspect-video h-full object-cover"
      ></video>
      <Badge class="absolute bottom-5 right-5"
        >{peer.handle || peer.name || peer.user.email}</Badge
      >
    </div>
  {:else}
    <Avatar name={peer.name || peer.user.email} email={peer.user.email!} />
  {/if}
</div>
