<script lang="ts">
  import { Badge } from "$/components/ui/badge";
  import Avatar from "$/components/shared/avatar.svelte";
  import type LocalStreamState from "$/state/local.stream.state.svelte";
  import type RemoteStreamState from "$/state/remote.stream.state.svelte";

  type Props = {
    class?: string;
    style?: string;
    muted?: boolean;
    hideBadge?: boolean;
    hideVideo?: boolean;
    largeBorder?: boolean;
    showAnalyzser?: boolean;
    state: LocalStreamState | RemoteStreamState;
  };

  let {
    style = "",
    hideBadge = false,
    hideVideo = false,
    largeBorder = true,
    state: streamState,
    showAnalyzser = false,
    class: classList = "",
    muted = $bindable(false),
  }: Props = $props();

  let video: HTMLVideoElement | null = $state(null);

  $effect(() => {
    if (video && streamState.stream) {
      video.srcObject = streamState.stream;
      video.oncanplay = () => video?.play();
    }
  });

  $effect(() => {
    if (muted && video) video.muted = true;
    if (!muted && video) video.muted = false;
  });
</script>

<div class="flex items-center gap-1 justify-center {classList}" {style}>
  {#if showAnalyzser}
    <div
      class:w-4={largeBorder}
      class:w-2={!largeBorder}
      class="rounded-lg overflow-clip h-full flex flex-col justify-end"
    >
      <div
        class="w-full transition-colors duration-75 ease-linear rounded-lg {streamState.level ===
        'peaked'
          ? 'bg-red-500'
          : streamState.level === 'loud'
            ? 'bg-yellow-500'
            : 'bg-emerald-500'}"
        style="height: {streamState.percentage}%;"
      ></div>
    </div>
  {/if}
  <div
    class:border={!largeBorder}
    class:border-8={largeBorder}
    class:rounded={!largeBorder}
    class:rounded-2xl={largeBorder}
    class="relative h-full w-full overflow-hidden border-accent flex items-center justify-center bg-background"
  >
    <video
      {muted}
      autoplay
      playsinline
      bind:this={video}
      class:hidden={!streamState.stream || hideVideo}
      class="h-full aspect-video object-cover flex-none"
    ></video>
    {#if !hideBadge}
      <Badge class="absolute bottom-5 right-5 pointer-events-none"
        >{streamState.member.handle ||
          streamState.member.name ||
          streamState.member.email}</Badge
      >
    {/if}
    {#if !streamState.stream || hideVideo}
      <Avatar member={streamState.member} />
    {/if}
  </div>
</div>
