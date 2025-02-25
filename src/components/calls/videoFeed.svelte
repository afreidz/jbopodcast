<script lang="ts">
  import { Badge } from "$/components/ui/badge";
  import Avatar from "$/components/shared/avatar.svelte";
  import type LocalStreamState from "$/state/local.stream.state.svelte";
  import type RemoteStreamState from "$/state/remote.stream.state.svelte";

  type Props = {
    class?: string;
    style?: string;
    muted?: boolean;
    state: LocalStreamState | RemoteStreamState;
  };

  let {
    style = "",
    muted = false,
    state: streamState,
    class: classList = "",
  }: Props = $props();

  let video: HTMLVideoElement | null = $state(null);

  $effect(() => {
    if (video && streamState.stream) video.srcObject = streamState.stream;
  });
</script>

<div class="py-12 px-8 flex items-center justify-center {classList}" {style}>
  <div
    class="relative rounded-2xl h-full w-full overflow-hidden border-accent border-8 flex items-center justify-center"
  >
    <video
      {muted}
      autoplay
      playsinline
      bind:this={video}
      class:hidden={!streamState.stream}
      class="h-full aspect-video object-cover flex-none"
    ></video>
    <Badge class="absolute bottom-5 right-5 pointer-events-none"
      >{streamState.member.handle ||
        streamState.member.name ||
        streamState.member.email}</Badge
    >
    {#if !streamState.stream}
      <Avatar
        email={streamState.member.email}
        name={streamState.member.name || streamState.member.email}
      />
    {/if}
  </div>
</div>
