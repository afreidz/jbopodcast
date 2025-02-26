<script lang="ts">
  import { Input } from "$/components/ui/input";
  import * as Dialog from "$/components/ui/dialog";
  import * as Sidebar from "$/components/ui/sidebar";
  import * as Breadcrumb from "$/components/ui/breadcrumb";
  import Participant from "$/components/calls/participant.svelte";
  import type { EQFREQS } from "$/state/local.stream.state.svelte";
  import type LocalStreamState from "$/state/local.stream.state.svelte";

  import LowPassIcon from "lucide-svelte/icons/waves";
  import GainIcon from "lucide-svelte/icons/volume-2";
  import EqIcon from "lucide-svelte/icons/audio-lines";
  import CompressorIcon from "lucide-svelte/icons/ear";

  type Props = {
    open?: boolean;
    local: LocalStreamState;
  };

  const filters = [
    { name: "Gain", icon: GainIcon },
    { name: "Equalizer", icon: EqIcon },
    { name: "Low-Pass", icon: LowPassIcon },
    { name: "Compressor", icon: CompressorIcon },
  ] as const;

  let { open = $bindable(true), local }: Props = $props();
  let active: (typeof filters)[number]["name"] | null = $state(null);

  function handleCompressorUpdate(
    v: string,
    facet: keyof typeof local.compressorValues
  ) {
    const newValues = { ...local.compressorValues };
    newValues[facet] = Number(v);
    local.compressorValues = newValues;
  }

  function handleLowpassUpdate(
    v: string,
    facet: keyof typeof local.lowpassValues
  ) {
    const newValues = { ...local.lowpassValues };
    newValues[facet] = Number(v);
    local.lowpassValues = newValues;
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Content
    class="overflow-hidden p-0 md:max-h-[500px] md:max-w-[700px] lg:max-w-[800px]"
  >
    <Sidebar.Provider class="items-start !min-h-full">
      <Sidebar.Root collapsible="none">
        <Sidebar.Content>
          <Sidebar.Group class="flex-1">
            <Sidebar.GroupContent>
              <div
                class="grid flex-1 text-left text-sm leading-tight m-2 border-b pb-3"
              >
                <span class="font-semibold">Microphone Filters</span>
                <span class="text-xs text-muted-foreground"
                  >Add/customize microphone filters</span
                >
              </div>
              <Sidebar.Menu>
                {#each filters as filter (filter.name)}
                  <Sidebar.MenuItem>
                    <Sidebar.MenuButton isActive={active === filter.name}>
                      {#snippet child({ props })}
                        <button
                          onclick={() => (active = filter.name)}
                          {...props}
                        >
                          <filter.icon />
                          <span>{filter.name}</span>
                        </button>
                      {/snippet}
                    </Sidebar.MenuButton>
                  </Sidebar.MenuItem>
                {/each}
              </Sidebar.Menu>
            </Sidebar.GroupContent>
          </Sidebar.Group>
          <div class="flex-none flex justify-center mb-6">
            <Participant state={local} />
          </div>
        </Sidebar.Content>
      </Sidebar.Root>
      <main class="flex h-[480px] flex-1 flex-col overflow-hidden">
        <header
          class="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12"
        >
          <div class="flex items-center gap-2 px-4">
            <Breadcrumb.Root>
              <Breadcrumb.List>
                <Breadcrumb.Item class="hidden md:block">
                  <Breadcrumb.Link onclick={() => (active = null)}
                    >Filters</Breadcrumb.Link
                  >
                </Breadcrumb.Item>
                <Breadcrumb.Separator class="hidden md:block" />
                <Breadcrumb.Item>
                  <Breadcrumb.Page>{active}</Breadcrumb.Page>
                </Breadcrumb.Item>
              </Breadcrumb.List>
            </Breadcrumb.Root>
          </div>
        </header>
        <div
          class="flex flex-1 items-center justify-center flex-col gap-4 overflow-y-auto p-4 pt-0"
        >
          {#if active === "Gain"}
            {@render GainConfig()}
          {:else if active === "Equalizer"}
            {@render EqualizerConfig()}
          {:else if active === "Compressor"}
            {@render CompressorConfig()}
          {:else if active === "Low-Pass"}
            {@render LowpassConfig()}
          {/if}
        </div>
      </main>
    </Sidebar.Provider>
  </Dialog.Content>
</Dialog.Root>

{#snippet GainConfig()}
  <input
    max={2}
    min={0}
    step={0.1}
    type="range"
    value={local.gain}
    class="slider vertical h-full"
    onchange={(e) => (local.gain = Number(e.currentTarget.value))}
  />
{/snippet}

{#snippet EqualizerConfig()}
  <div class="flex gap-4">
    {#each Object.entries(local.equalizerValues) as [freq, value]}
      <div class="text-center">
        <input
          {value}
          min={-10}
          max={10}
          step={0.1}
          type="range"
          class="slider vertical h-80"
          onchange={(e) => {
            const newValues = { ...local.equalizerValues };
            newValues[Number(freq) as (typeof EQFREQS)[number]] = Number(
              e.currentTarget.value
            );
            local.equalizerValues = newValues;
          }}
        />
        <small>{freq}hz</small>
      </div>
    {/each}
  </div>
{/snippet}

{#snippet CompressorConfig()}
  <div class="flex flex-col gap-8 w-full">
    <div class="flex items-center w-full gap-2">
      <small class="flex-none w-20">Ratio</small>
      <input
        min={1}
        max={32}
        step={0.1}
        type="range"
        class="slider flex-1"
        value={local.compressorValues.ratio}
        onchange={(e) => handleCompressorUpdate(e.currentTarget.value, "ratio")}
      />
      <Input
        min={1}
        max={32}
        step={0.1}
        type="number"
        class="flex-none w-20"
        value={local.compressorValues.ratio}
        onchange={(e) => handleCompressorUpdate(e.currentTarget.value, "ratio")}
      />
      <small class="flex-none w-10">:1</small>
    </div>
    <div class="flex items-center w-full gap-2">
      <small class="flex-none w-20">Threshold</small>
      <input
        max={0}
        min={-60}
        step={0.1}
        type="range"
        class="slider flex-1"
        value={local.compressorValues.threshold}
        onchange={(e) =>
          handleCompressorUpdate(e.currentTarget.value, "threshold")}
      />
      <Input
        max={0}
        min={-60}
        step={0.1}
        type="number"
        class="flex-none w-20"
        value={local.compressorValues.threshold}
        onchange={(e) =>
          handleCompressorUpdate(e.currentTarget.value, "threshold")}
      />
      <small class="flex-none w-10">dB</small>
    </div>
    <div class="flex items-center w-full gap-2">
      <small class="flex-none w-20">Attack</small>
      <input
        min={0}
        max={0.5}
        step={0.001}
        type="range"
        class="slider flex-1"
        value={local.compressorValues.attack}
        onchange={(e) =>
          handleCompressorUpdate(e.currentTarget.value, "attack")}
      />
      <Input
        min={0}
        max={0.5}
        step={0.001}
        type="number"
        class="flex-none w-20"
        value={local.compressorValues.attack}
        onchange={(e) =>
          handleCompressorUpdate(e.currentTarget.value, "attack")}
      />
      <small class="flex-none w-10">sec</small>
    </div>
    <div class="flex items-center w-full gap-2">
      <small class="flex-none w-20">Release</small>
      <input
        min={0}
        max={1}
        step={0.001}
        type="range"
        class="slider flex-1"
        value={local.compressorValues.release}
        onchange={(e) =>
          handleCompressorUpdate(e.currentTarget.value, "release")}
      />
      <Input
        min={0}
        max={1}
        step={0.001}
        type="number"
        class="flex-none w-20"
        value={local.compressorValues.release}
        onchange={(e) =>
          handleCompressorUpdate(e.currentTarget.value, "release")}
      />
      <small class="flex-none w-10">sec</small>
    </div>
    <div class="flex items-center w-full gap-2">
      <small class="flex-none w-20">Knee</small>
      <input
        min={0}
        max={40}
        step={1}
        type="range"
        class="slider flex-1"
        value={local.compressorValues.knee}
        onchange={(e) => handleCompressorUpdate(e.currentTarget.value, "knee")}
      />
      <Input
        min={0}
        max={40}
        step={1}
        type="number"
        class="flex-none w-20"
        value={local.compressorValues.knee}
        onchange={(e) => handleCompressorUpdate(e.currentTarget.value, "knee")}
      />
      <small class="flex-none w-10">dB</small>
    </div>
  </div>
{/snippet}

{#snippet LowpassConfig()}
  <div class="flex flex-col gap-8 w-full">
    <div class="flex items-center w-full gap-2">
      <small class="flex-none w-20">Quality</small>
      <input
        max={1}
        min={0.5}
        step={0.001}
        type="range"
        class="slider flex-1"
        value={local.lowpassValues.Q}
        onchange={(e) => handleLowpassUpdate(e.currentTarget.value, "Q")}
      />
      <Input
        max={1}
        min={0.5}
        step={0.1}
        type="number"
        class="flex-none w-20"
        value={local.lowpassValues.Q}
        onchange={(e) => handleLowpassUpdate(e.currentTarget.value, "Q")}
      />
    </div>
    <div class="flex items-center w-full gap-2">
      <small class="flex-none w-20">Frequency</small>
      <input
        min={10}
        step={10}
        max={20000}
        type="range"
        class="slider flex-1"
        value={local.lowpassValues.frequency}
        onchange={(e) =>
          handleLowpassUpdate(e.currentTarget.value, "frequency")}
      />
      <Input
        min={10}
        step={10}
        max={20000}
        type="number"
        class="flex-none w-20"
        value={local.lowpassValues.frequency}
        onchange={(e) =>
          handleLowpassUpdate(e.currentTarget.value, "frequency")}
      />
    </div>
  </div>
{/snippet}

<style lang="postcss">
  .slider {
    &.vertical {
      direction: rtl;
      writing-mode: vertical-lr;
    }

    @apply border rounded-lg appearance-none w-10 bg-foreground/5;

    &::-webkit-slider-thumb {
      @apply appearance-none w-10 h-10 bg-neutral-50 rounded-sm;
    }
  }
</style>
