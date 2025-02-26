<script lang="ts">
  import { onMount, onDestroy } from "svelte";

  type Props = {
    ms: number;
  };

  let { ms }: Props = $props();
  let remainingMs: number = $state(ms);
  let interval: ReturnType<typeof setInterval> | null = $state(null);

  function formatTime(ms: number) {
    const hours = String(Math.floor(ms / 3600000)).padStart(2, "0");
    const minutes = String(Math.floor((ms % 3600000) / 60000)).padStart(2, "0");
    const seconds = String(Math.floor((ms % 60000) / 1000)).padStart(2, "0");
    const milliseconds = String(ms % 1000).padStart(3, "0");
    return `${hours}:${minutes}:${seconds}.${milliseconds}`;
  }

  function startCountdown() {
    if (interval) clearInterval(interval);
    const startTime = Date.now();
    const endTime = startTime + ms;

    interval = setInterval(() => {
      const now = Date.now();
      remainingMs = Math.max(endTime - now, 0);
      if (remainingMs === 0 && interval) clearInterval(interval);
    }, 10);
  }

  onMount(() => {
    startCountdown();
  });

  onDestroy(() => {
    if (interval) clearInterval(interval);
  });
</script>

<div
  class="size-full flex items-center justify-center font-extrabold text-muted text-7xl font-mono"
>
  {formatTime(remainingMs)}
</div>
