<script lang="ts">
  import { onMount } from "svelte";
  import { toast } from "svelte-sonner";
  import { Button } from "$/components/ui/button";
  import * as Dialog from "$/components/ui/dialog";
  import * as Select from "$/components/ui/select";
  import Label from "$/components/ui/label/label.svelte";

  type Props = {
    stream?: MediaStream;
  };

  let shown = $state(false);
  let devices: MediaDeviceInfo[] = $state([]);
  let cameras: MediaDeviceInfo[] = $state([]);
  let microphones: MediaDeviceInfo[] = $state([]);
  let permission = $state(localStorage.getItem("permission"));

  let { stream = $bindable() }: Props = $props();

  onMount(async () => {
    if (!permission) {
      const stream = await navigator.mediaDevices
        .getUserMedia({
          audio: true,
          video: true,
        })
        .catch((err) => {
          console.error(err);
          return null;
        });
      if (stream) permission = `${+new Date()}`;
    }

    devices = await navigator.mediaDevices.enumerateDevices().catch((err) => {
      console.error(err);
      return [];
    });

    cameras = devices.filter((d) => d.kind === "videoinput");
    microphones = devices.filter((d) => d.kind === "audioinput");

    if (!permission || !devices.length)
      return toast.error(
        "Unable to join call. Could not connect required devices. See console for more details"
      );
  });

  $effect(() => {
    shown = !stream;
  });

  let camera: string | undefined = $state(
    localStorage.getItem("camera") ?? undefined
  );
  let microphone: string | undefined = $state(
    localStorage.getItem("microphone") ?? undefined
  );

  $effect(() => {
    if (camera) localStorage.setItem("camera", camera);
  });

  $effect(() => {
    if (microphone) localStorage.setItem("microphone", microphone);
  });

  $effect(() => {
    if (permission) localStorage.setItem("permission", permission);
  });

  async function updateStream(e: SubmitEvent) {
    e.preventDefault();
    if (!camera || !microphone) return toast.error("Unable to set mic/camera");
    stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        deviceId: microphone,
        sampleRate: { ideal: 96000, min: 44100 },
      },
      video: {
        deviceId: camera,
        frameRate: { ideal: 30, min: 20 },
        width: { ideal: 2160, min: 1920 },
      },
    });
  }
</script>

{#if devices && shown}
  <Dialog.Root open>
    <Dialog.Content>
      <Dialog.Header class="mb-4">
        <Dialog.Title>Select Devices</Dialog.Title>
      </Dialog.Header>
      <form onsubmit={updateStream} class="flex flex-col gap-6">
        {#if microphones}
          <div class="flex flex-col gap-1.5">
            <Label>Microphone</Label>
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
          </div>
        {/if}
        {#if cameras}
          <div class="flex flex-col gap-2">
            <Label>Camera</Label>
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
          </div>
        {/if}
        <Button type="submit" class="mt-4">Set Devices</Button>
      </form>
    </Dialog.Content>
  </Dialog.Root>
{/if}
