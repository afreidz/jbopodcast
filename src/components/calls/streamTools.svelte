<script lang="ts">
  import { YouTube } from "@embedz/svelte";
  import { Button } from "$/components/ui/button";
  import Loading from "$/components/shared/loading.svelte";

  type Props = {
    videoId?: string;
    onclick?: () => void;
  };

  let loading: boolean = false;
  let { videoId = $bindable(undefined), onclick = () => {} }: Props = $props();

  let chatURL = $derived.by(() => {
    if (!videoId) return undefined;
    const host = window.location.hostname;
    const chat = new URL("live_chat", "https://www.youtube.com");
    chat.searchParams.set("v", videoId);
    chat.searchParams.set("embed_domain", host);
    return chat.href;
  });

  $inspect(videoId, chatURL);
</script>

{#if loading}
  <div class="w-full flex-1 flex items-center justify-center">
    <Loading class="size-5" />
  </div>
{:else if !videoId}
  <div class="w-full flex-1 flex items-center justify-center">
    <Button onclick={() => onclick()}>Refresh YouTube</Button>
  </div>
{:else}
  <Button class="flex-none" onclick={() => onclick()}>Refresh YouTube</Button>
  <div class="flex-none m-1 border rounded overflow-clip">
    <YouTube
      id={videoId}
      params="controls=0&mute=1&disablekb=1&fs=0&autoplay=1"
    />
  </div>
  <iframe class="w-full flex-1" title="live stream chat" src={chatURL}></iframe>
{/if}
