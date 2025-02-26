<script lang="ts">
  import type { Snippet } from "svelte";
  import * as Sidebar from "$/components/ui/sidebar";

  type Props = {
    class?: string;
    children: Snippet;
    sidebarLeft?: Snippet;
    sidebarRight?: Snippet;
    collapsible?: "offcanvas" | "none";
  };

  let {
    children,
    sidebarLeft,
    sidebarRight,
    class: classList = "",
    collapsible = "offcanvas",
  }: Props = $props();
</script>

<Sidebar.Provider style="--sidebar-width: 19rem;">
  {#if sidebarLeft}
    <Sidebar.Root {collapsible} variant="floating">
      {@render sidebarLeft()}
    </Sidebar.Root>
  {/if}
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
  {#if sidebarRight}
    <Sidebar.Root
      {collapsible}
      side="right"
      variant="floating"
      style="--sidebar-width: 30rem;"
    >
      {@render sidebarRight()}
    </Sidebar.Root>
  {/if}
</Sidebar.Provider>
