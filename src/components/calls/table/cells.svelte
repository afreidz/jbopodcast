<script lang="ts" module>
  import type { Member, CurrentUser } from "$/actions/members";

  const dateFormatter = new Intl.DateTimeFormat("en-us", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  export { badgeCell, dateCell, singleAvatarCell, multipleAvatars };
</script>

<script lang="ts">
  import { Badge } from "$/components/ui/badge";
  import Avatar from "$/components/shared/avatar.svelte";
  import AvatarGroup from "$/components/shared/avatarGroup.svelte";
</script>

{#snippet badgeCell(text: string)}
  <Badge>
    {text}
  </Badge>
{/snippet}

{#snippet dateCell(text: string)}
  <span>
    {dateFormatter.format(new Date(text))}
  </span>
{/snippet}

{#snippet singleAvatarCell(m: Member)}
  <Avatar member={m} />
{/snippet}

{#snippet multipleAvatars(m: (Member | NonNullable<CurrentUser>)[])}
  <AvatarGroup members={m} />
{/snippet}
