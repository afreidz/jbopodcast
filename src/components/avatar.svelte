<script lang="ts">
  import gravatar from "gravatar";
  import * as Avatar from "$/components/ui/avatar";

  type Props = {
    class?: string;
    name?: string | null;
    email?: string | null;
  };

  let { email, name, class: classlist = "" }: Props = $props();
  let avatarURL = $derived(gravatar.url(email, { s: "100", d: "404" }));

  let fallback = $derived.by(() => {
    const w = name?.split(" ") ?? "?";
    return `${w[0].charAt(0) ?? ""}${w.at(-1)?.charAt(0) ?? ""}`;
  });
</script>

<Avatar.Root class={classlist}>
  <Avatar.Image src={avatarURL} alt={email} />
  <Avatar.Fallback>{fallback}</Avatar.Fallback>
</Avatar.Root>
