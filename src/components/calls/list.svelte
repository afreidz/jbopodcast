<script lang="ts">
  import { onMount } from "svelte";
  import Nav from "$/components/shared/nav.svelte";
  import userState from "$/state/user.state.svelte";
  import type { PaginatedCalls } from "$/actions/calls";
  import Sidebar from "$/components/shared/sidebar.svelte";
  import { columns } from "$/components/calls/table/columns";
  import DataTable from "$/components/calls/table/table.svelte";

  onMount(async () => await userState.refresh());

  type Props = {
    calls: PaginatedCalls;
  };

  let { calls }: Props = $props();
</script>

<Sidebar class="flex-1 flex flex-col items-center justify-center">
  {#snippet sidebarLeft()}
    <Nav />
  {/snippet}
  <div class="size-full flex-1 p-4 max-w-6xl">
    <DataTable data={calls.items} {columns} />
  </div>
</Sidebar>
