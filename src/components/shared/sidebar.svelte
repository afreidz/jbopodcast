<script lang="ts">
  import type { Snippet } from "svelte";
  import * as Sidebar from "$/components/ui/sidebar";

  type Props = {
    class?: string;
    right?: Snippet;
    sidebar?: Snippet;
    children: Snippet;
    collapsible?: "offcanvas" | "none";
  };

  let {
    sidebar,
    children,
    class: classList = "",
    collapsible = "offcanvas",
  }: Props = $props();
</script>

<Sidebar.Provider style="--sidebar-width: 19rem;">
  <Sidebar.Root {collapsible} variant="floating">
    {@render sidebar?.()}
  </Sidebar.Root>
  <Sidebar.Inset>
    {#if collapsible === "offcanvas"}
      <header class="flex h-16 shrink-0 items-center gap-2 px-4">
        <Sidebar.Trigger class="-ml-1" />
      </header>
    {/if}
    <div class={classList}>
      {@render children()}
    </div>
  </Sidebar.Inset>
</Sidebar.Provider>
