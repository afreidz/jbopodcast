<script lang="ts">
  import gravatar from "gravatar";
  import * as Avatar from "$/components/ui/avatar";
  import type { CurrentUser, Member } from "$/actions/members";

  type Props = {
    class?: string;
    member: Member | NonNullable<CurrentUser>;
  };

  let { member, class: classlist = "" }: Props = $props();
  let avatarURL = $derived(gravatar.url(member.email, { s: "100", d: "404" }));

  let fallback = $derived.by(() => {
    const w = member.name?.split(" ") ?? "?";
    return `${w[0].charAt(0) ?? ""}${w.at(-1)?.charAt(0) ?? ""}`;
  });
</script>

<Avatar.Root class={classlist}>
  <Avatar.Image src={avatarURL} alt={member.email} />
  <Avatar.Fallback>{fallback}</Avatar.Fallback>
</Avatar.Root>
