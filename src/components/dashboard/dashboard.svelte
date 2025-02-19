<script lang="ts">
  import { onMount } from "svelte";
  import client from "$/lib/pocketbase";
  import UpcomingCalls from "./upcomingCalls.svelte";
  import Sidebar from "$/components/shared/sidebar.svelte";
  import DashboardState from "./state/dashboard.state.svelte";

  const dashboard = new DashboardState(client.authStore.record!);

  onMount(async () => {
    await dashboard.init();
  });
</script>

<Sidebar class="size-full flex items-center justify-center">
  {#snippet sidebar()}
    <nav>Insider Nav</nav>
  {/snippet}
  <UpcomingCalls calls={dashboard.upcomingCalls} loading={dashboard.loading} />
</Sidebar>
