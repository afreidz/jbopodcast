<script lang="ts">
  import { YouTube } from "@embedz/svelte";
  import { Button } from "$/components/ui/button";
  import Loading from "$/components/shared/loading.svelte";
  import type CallState from "$/state/call.connect.state.svelte";

  type Props = {
    state: CallState;
  };

  let initialized: boolean = $state(false);
  let { state: connection }: Props = $props();
  let interval: ReturnType<typeof setInterval> | null = $state(null);

  let chatURL = $derived.by(() => {
    if (!connection.videoId) return undefined;
    const host = window.location.hostname;
    const chat = new URL("live_chat", "https://www.youtube.com");
    chat.searchParams.set("v", connection.videoId);
    chat.searchParams.set("embed_domain", host);
    return chat.href;
  });

  $effect(() => {
    if (connection.videoId) {
      if (interval) clearInterval(interval);
      initialized = true;
      console.log(
        "Video ID found initializing",
        !!interval,
        connection.videoId,
        initialized
      );
    }
  });

  $effect(() => {
    if (!initialized && !interval && connection.live) {
      console.log("Setting interval", initialized, !!interval, connection.live);
      interval = setInterval(() => {
        connection.refreshYoutube();
      }, 3000);
    }
  });

  $effect(() => {
    if (!connection.live && interval) {
      clearInterval(interval);
      console.log("Livestream ended", connection.live, interval);
    }
  });

  $inspect(connection.videoId, chatURL);
</script>

{#if !connection.videoId}
  <div class="w-full flex-1 flex items-center justify-center">
    <Loading class="size-5" />
  </div>
{:else}
  <Button class="flex-none" onclick={() => connection.refreshYoutube()}
    >Refresh YouTube</Button
  >
  <div class="flex-none m-1 border rounded overflow-clip">
    <YouTube
      id={connection.videoId}
      params="controls=0&mute=1&disablekb=1&fs=0&autoplay=1"
    />
  </div>
  <iframe class="w-full flex-1" title="live stream chat" src={chatURL}></iframe>
{/if}
