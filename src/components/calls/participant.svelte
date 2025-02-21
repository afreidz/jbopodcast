<script lang="ts">
  import colors from "tailwindcss/colors";
  import type { Member } from "$/actions/members";
  import Avatar from "$/components/shared/avatar.svelte";
  import AudioState from "$/components/calls/state/audio.state.svelte";

  type Props = {
    member: Member;
    stream: MediaStream | null;
  };

  let audioAnalyser = new AudioState();
  let { member, stream }: Props = $props();

  $effect(() => {
    if (stream) audioAnalyser.init(stream);
  });
</script>

<div
  class="rounded border bg-background overflow-clip h-28 aspect-video flex m-1"
>
  {#if stream}
    <progress
      max={100}
      value={audioAnalyser.percentage}
      class="flex-none h-28 rounded border-r w-1"
      style="writing-mode: vertical-lr; direction: rtl; --progress-bg: {audioAnalyser.level ===
      'soft'
        ? colors.yellow[500]
        : audioAnalyser.level === 'normal'
          ? colors.emerald[500]
          : colors.red[500]}"
    ></progress>
  {/if}
  <div class="flex-1">
    <div class="flex h-full flex-col items-center justify-center">
      <Avatar name={member.handle || member.name} email={member.email} />
    </div>
    {#if stream}
      <input
        type="range"
        min={-1}
        max={2}
        step={0.1}
        value={audioAnalyser.gain}
        onchange={(e) => audioAnalyser.setGain(+e.currentTarget.value)}
      />
    {/if}
  </div>
</div>

<style>
  progress::-webkit-progress-bar {
    background: transparent;
  }
  progress::-webkit-progress-value {
    background: var(--progress-bg);
  }
</style>
