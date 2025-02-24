<script lang="ts">
  import { onMount } from "svelte";
  import Nav from "$/components/shared/nav.svelte";
  import UpcomingCalls from "./upcomingCalls.svelte";
  import { getCurrentUser } from "$/lib/pocketbase/client";
  import Sidebar from "$/components/shared/sidebar.svelte";
  import DashboardState from "./state/dashboard.state.svelte";

  const dashboard = new DashboardState(getCurrentUser());

  onMount(async () => {
    await dashboard.init();
  });
</script>

<Sidebar class="size-full flex items-center justify-center">
  {#snippet sidebarLeft()}
    <Nav />
  {/snippet}
  <UpcomingCalls calls={dashboard.upcomingCalls} loading={dashboard.loading} />
</Sidebar>
