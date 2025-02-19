<script lang="ts">
  import { Badge } from "$/components/ui/badge";
  import type { Member } from "$/actions/members";
  import Avatar from "$/components/shared/avatar.svelte";

  type Props = {
    member: Member;
    class?: string;
    style?: string;
    stream?: MediaStream | null;
  };

  let {
    member,
    style = "",
    stream = null,
    class: classList = "",
  }: Props = $props();
  let video: HTMLVideoElement | null = $state(null);

  $effect(() => {
    if (video && stream) video.srcObject = stream;
  });
</script>

<div class="py-12 px-8 flex items-center justify-center {classList}" {style}>
  <div
    class="relative rounded-2xl h-full w-full overflow-hidden border-accent border-8 flex items-center justify-center"
  >
    <!-- svelte-ignore a11y_media_has_caption -->
    <video
      autoplay
      playsinline
      bind:this={video}
      class:hidden={!stream}
      class="h-full aspect-video object-cover flex-none"
    ></video>
    <Badge class="absolute bottom-5 right-5 pointer-events-none"
      >{member.handle || member.name || member.email}</Badge
    >
    {#if !stream}
      <Avatar name={member.name || member.email} email={member.email} />
    {/if}
  </div>
</div>
