<script lang="ts">
  import { onMount } from "svelte";
  import client from "$/lib/pocketbase";
  import UpcomingCalls from "./upcomingCalls.svelte";
  import DashboardState from "./state/dashboard.state.svelte";

  const dashboard = new DashboardState(client.authStore.record!);

  onMount(async () => {
    await dashboard.init();
  });
</script>

<section class="p-4 min-w-96 max-w-screen-sm">
  <UpcomingCalls calls={dashboard.upcomingCalls} loading={dashboard.loading} />
</section>
