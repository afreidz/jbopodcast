<script lang="ts">
  import type { Member } from "$/actions/members";
  import Avatar from "$/components/shared/avatar.svelte";
  import AudioState from "$/components/calls/state/audio.state.svelte";

  type Props = {
    member: Member;
    stream: MediaStream | null;
  };

  let audioState = new AudioState();
  let { member, stream }: Props = $props();

  $effect(() => {
    if (stream) {
      audioState.init(stream);
    }
  });
</script>

<div
  class="rounded border bg-background overflow-clip h-20 aspect-video flex m-1"
>
  {#if stream}
    <div class="border-r w-2 h-full flex flex-col justify-end">
      <div
        class="w-full {audioState.level === 'peaked'
          ? 'bg-red-500'
          : audioState.level === 'loud'
            ? 'bg-yellow-500'
            : 'bg-emerald-500'}"
        style="height: {audioState.percentage}%;"
      ></div>
    </div>
  {/if}
  <div class="flex-1">
    <div class="flex h-full flex-col items-center justify-center">
      <Avatar name={member.handle || member.name} email={member.email} />
    </div>
  </div>
</div>
