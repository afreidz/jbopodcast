<script lang="ts">
  import { onMount } from "svelte";
  import * as Card from "$/components/ui/card";
  import { Badge } from "$/components/ui/badge";
  import * as Select from "$/components/ui/select";
  import { Skeleton } from "$/components/ui/skeleton";
  import ConnectedIcon from "lucide-svelte/icons/dot";
  import ChangeIcon from "lucide-svelte/icons/settings";
  import Button from "./ui/button/button.svelte";

  type Props = {
    class?: string;
    style?: string;
    camera?: string;
    microphone?: string;
    stream?: MediaStream;
    me: App.Locals["user"];
  };

  let {
    me,
    style = "",
    class: classList = "",
    stream = $bindable(undefined),
    camera = $bindable(undefined),
    microphone = $bindable(undefined),
  }: Props = $props();

  let loading = $state(true);
  let changing = $state(false);
  let devices: MediaDeviceInfo[] = $state([]);
  let cameras: MediaDeviceInfo[] = $state([]);
  let microphones: MediaDeviceInfo[] = $state([]);
  let video: HTMLVideoElement | null = $state(null);
  let permission: boolean = $state(!!localStorage.getItem("permission"));

  onMount(async () => {
    if (!permission) {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      if (stream) localStorage.setItem("permission", `${+new Date()}`);
      stream.getTracks().forEach((t) => t.stop());
    }

    devices = await navigator.mediaDevices.enumerateDevices();
    cameras = devices.filter((d) => d.kind === "videoinput");
    microphones = devices.filter((d) => d.kind === "audioinput");
    if (stream) loading = false;
  });

  $effect(() => {
    if (camera && microphone) {
      navigator.mediaDevices
        .getUserMedia({
          audio: {
            deviceId: microphone,
            sampleRate: { ideal: 96000, min: 44100 },
          },
          video: {
            deviceId: camera,
            frameRate: { ideal: 30, min: 20 },
            width: { ideal: 2160, min: 1920 },
          },
        })
        .then((device) => {
          stream = device;
          loading = false;
          changing = false;
        });
    }
  });

  $effect(() => {
    if (stream && video) video.srcObject = stream;
  });
</script>

<svelte:window
  onbeforeunload={() => {
    if (stream) stream.getTracks().forEach((t) => t.stop());
  }}
/>

<div class="p-10 flex items-center justify-center {classList}" {style}>
  {#if (!stream && (!microphone || !camera)) || changing}
    <Card.Root>
      <Card.Header>
        <Card.Title>Please select your devices</Card.Title>
        <Card.Description
          >Choose the camera and microphone you would like to use for this call</Card.Description
        >
      </Card.Header>
      <Card.Content>
        <form onsubmit={() => (changing = false)} class="flex flex-col gap-2">
          {#if microphones}
            <Select.Root
              type="single"
              name="microphone"
              required
              bind:value={microphone}
            >
              <Select.Trigger>
                {devices.find((d) => d.deviceId === microphone)?.label ??
                  "Select a microphone"}
              </Select.Trigger>
              <Select.Content>
                {#each microphones as microphone}
                  <Select.Item
                    value={microphone.deviceId}
                    label={microphone.label}>{microphone.label}</Select.Item
                  >
                {/each}
              </Select.Content>
            </Select.Root>
          {/if}
          {#if cameras}
            <Select.Root
              type="single"
              required
              name="camera"
              bind:value={camera}
            >
              <Select.Trigger>
                {devices.find((d) => d.deviceId === camera)?.label ??
                  "Select a camera"}
              </Select.Trigger>
              <Select.Content>
                {#each cameras as camera}
                  <Select.Item value={camera.deviceId} label={camera.label}
                    >{camera.label}</Select.Item
                  >
                {/each}
              </Select.Content>
            </Select.Root>
          {/if}
          <Button type="submit">Change</Button>
        </form>
      </Card.Content>
    </Card.Root>
  {:else if loading}
    <div class="size-full">
      <Skeleton class="size-12 rounded-full" />
    </div>
  {:else}
    <div
      class="relative rounded-2xl w-full h-full overflow-hidden border-accent border-8"
    >
      <video
        muted
        autoplay
        playsinline
        bind:this={video}
        class="aspect-video h-full object-cover"
      ></video>
      <button
        onclick={() => (changing = true)}
        class="group absolute bottom-5 right-5"
      >
        <Badge class="flex items-center gap-1">
          <ChangeIcon class="hidden group-hover:inline-block size-2" />
          <i class="size-2 rounded-full bg-emerald-500 group-hover:hidden"></i>
          <span>{me.handle || me.name || me.email}</span>
        </Badge>
      </button>
    </div>
  {/if}
</div>
