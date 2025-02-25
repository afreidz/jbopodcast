<script lang="ts">
  import Avatar from "$/components/shared/avatar.svelte";
  import type LocalStreamState from "$/state/local.stream.state.svelte";
  import type RemoteStreamState from "$/state/remote.stream.state.svelte";

  type Props = {
    state: LocalStreamState | RemoteStreamState;
  };

  let { state: streamState }: Props = $props();
</script>

<div
  class="rounded border bg-background overflow-clip h-20 aspect-video flex m-1"
>
  <div class="border-r w-2 h-full flex flex-col justify-end">
    <div
      class="w-full {streamState.level === 'peaked'
        ? 'bg-red-500'
        : streamState.level === 'loud'
          ? 'bg-yellow-500'
          : 'bg-emerald-500'}"
      style="height: {streamState.percentage}%;"
    ></div>
  </div>
  <div class="flex-1">
    <div class="flex h-full flex-col items-center justify-center">
      <Avatar
        name={streamState.member.handle || streamState.member.name}
        email={streamState.member.email}
      />
    </div>
  </div>
</div>
