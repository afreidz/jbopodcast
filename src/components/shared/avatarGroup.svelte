<script lang="ts">
  import gravatar from "gravatar";
  import * as AvatarGroup from "$/components/ui/avatar-group";
  import type { CurrentUser, Member } from "$/actions/members";

  type Props = {
    class?: string;
    members: (Member | NonNullable<CurrentUser>)[];
  };

  let { members, class: classlist = "" }: Props = $props();

  function getPic(m: (typeof members)[number]) {
    return gravatar.url(m.email, { s: "100", d: "404" });
  }

  function getFallback(name: string) {
    const w = name?.split(" ") ?? "?";
    return `${w[0].charAt(0) ?? ""}${w.at(-1)?.charAt(0) ?? ""}`;
  }
</script>

<AvatarGroup.Root>
  {#each members as member}
    <AvatarGroup.Member class={classlist}>
      <AvatarGroup.MemberImage src={getPic(member)} />
      <AvatarGroup.MemberFallback
        >{getFallback(member.name)}</AvatarGroup.MemberFallback
      >
    </AvatarGroup.Member>
  {/each}
</AvatarGroup.Root>
