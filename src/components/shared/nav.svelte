<script lang="ts">
  import type { Icon } from "lucide-svelte";
  import User from "$/components/shared/user.svelte";

  import CallsIcon from "lucide-svelte/icons/phone";
  import MainIcon from "lucide-svelte/icons/podcast";
  import MembersIcon from "lucide-svelte/icons/users";
  import EpisodeIcon from "lucide-svelte/icons/table-of-contents";
</script>

{#snippet navItem(href: string, label: string, icon: typeof Icon)}
  {@const Icon = icon}
  <a class="p-6 border-t last-of-type:border-b flex gap-4 items-center" {href}>
    <Icon class="size-4" />
    <span>{label}</span>
  </a>
{/snippet}

<nav class="flex-1 flex flex-col">
  <a href="/insider" class="flex gap-2 m-4 flex-none">
    <div
      class="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square shadow-sm size-8 items-center justify-center rounded-lg"
    >
      <MainIcon class="size-4" />
    </div>
    <div class="grid flex-1 text-left text-sm leading-tight">
      <span class="truncate font-semibold">Just a Bit Outside</span>
      <span class="truncate text-xs text-muted-foreground">A Podcast</span>
    </div>
  </a>
  <div class="flex-1 flex flex-col">
    {@render navItem("/insider/episodes", "Episodes", EpisodeIcon)}
    {@render navItem("/insider/calls/new", "Calls", CallsIcon)}
    {@render navItem("/insider/members", "Members", MembersIcon)}
  </div>
  <footer class="p-1 border-t">
    <User />
  </footer>
</nav>
