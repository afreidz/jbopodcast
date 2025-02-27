<script lang="ts">
  import { onMount } from "svelte";
  import { toast } from "svelte-sonner";
  import { Switch } from "$/components/ui/switch";
  import { Button } from "$/components/ui/button";
  import * as Dialog from "$/components/ui/dialog";
  import * as Select from "$/components/ui/select";
  import userState from "$/state/user.state.svelte";
  import Label from "$/components/ui/label/label.svelte";
  import LocalStreamState from "$/state/local.stream.state.svelte";

  type Props = {
    state?: LocalStreamState;
  };

  let shown = $state(false);
  let devices: MediaDeviceInfo[] = $state([]);
  let cameras: MediaDeviceInfo[] = $state([]);
  let microphones: MediaDeviceInfo[] = $state([]);
  let permission = $state(localStorage.getItem("permission"));
  let noiseSuppression: boolean = $state(
    !!localStorage.getItem("noiseSuppression")
  );

  let { state: localStreamState = $bindable() }: Props = $props();

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
    shown = !localStreamState;
  });

  let camera: string | undefined = $state(
    localStorage.getItem("camera") ?? undefined
  );
  let microphone: string | undefined = $state(
    localStorage.getItem("microphone") ?? undefined
  );

  $effect(() => {
    if (!noiseSuppression) localStorage.removeItem("noiseSuppression");
    if (noiseSuppression) localStorage.setItem("noiseSuppression", "yes");
  });

  $effect(() => {
    if (camera) localStorage.setItem("camera", camera);
  });

  $effect(() => {
    if (microphone) localStorage.setItem("microphone", microphone);
  });

  $effect(() => {
    if (permission) localStorage.setItem("permission", permission);
  });

  async function updateStream(e?: SubmitEvent) {
    e?.preventDefault();
    if (!camera || !microphone) return toast.error("Unable to set mic/camera");
    const baseStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        noiseSuppression,
        deviceId: microphone,
        autoGainControl: false,
        channelCount: { ideal: 2 },
        sampleRate: { min: 44100 },
      },
      video: {
        deviceId: camera,
        width: { ideal: 1920 },
        frameRate: { ideal: 30, min: 20 },
      },
    });
    localStreamState = new LocalStreamState(userState.currentUser!, baseStream);
  }
</script>

{#if devices && shown}
  <Dialog.Root
    open
    onOpenChange={(open) => {
      if (!open && (!microphone || !camera)) {
        open = true;
        shown = true;
      } else {
        updateStream();
      }
    }}
  >
    <Dialog.Content
      escapeKeydownBehavior="ignore"
      interactOutsideBehavior="ignore"
    >
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
        <div class="flex items-center justify-end space-x-2">
          <Switch bind:checked={noiseSuppression} id="noiseSuppression" />
          <Label for="noiseSuppression">Request Noise Suppression?</Label>
        </div>
        <Button type="submit" class="mt-4">Set Devices</Button>
      </form>
    </Dialog.Content>
  </Dialog.Root>
{/if}
