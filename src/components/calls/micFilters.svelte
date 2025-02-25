<script lang="ts">
  import * as Dialog from "$/components/ui/dialog";
  import * as Sidebar from "$/components/ui/sidebar";
  import * as Breadcrumb from "$/components/ui/breadcrumb";
  import Participant from "$/components/calls/participant.svelte";

  import LowPassIcon from "lucide-svelte/icons/waves";
  import GainIcon from "lucide-svelte/icons/volume-2";
  import EqIcon from "lucide-svelte/icons/audio-lines";
  import CompressorIcon from "lucide-svelte/icons/ear";
  import type LocalStreamState from "$/state/local.stream.state.svelte";

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
</script>

<Dialog.Root bind:open>
  <Dialog.Content
    class="overflow-hidden p-0 md:max-h-[500px] md:max-w-[700px] lg:max-w-[800px]"
  >
    <Sidebar.Provider class="items-start">
      <Sidebar.Root collapsible="none">
        <Sidebar.Content>
          <Sidebar.Group>
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
          <Participant state={local} />
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
    class="w-full accent-neutral-700 h-4"
    value={local.gain}
    onchange={(e) => (local.gain = Number(e.currentTarget.value))}
  />
{/snippet}

<style lang="postcss">
  .slider {
    /* @apply w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer; */
  }
</style>
