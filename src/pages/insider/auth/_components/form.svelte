<script lang="ts">
  import { Input } from "$/components/ui/input";
  import { Button } from "$/components/ui/button";

  type Props = {
    email: string;
    name?: string;
    token?: string;
    handle?: string;
    showMemberFields?: boolean;
  };

  let {
    token,
    email = $bindable(),
    showMemberFields = false,
  }: Props = $props();

  let name: string = $state("");
  let handle: string = $state("");
  let password: string = $state("");
</script>

{#if token}<input type="hidden" name="refresh_token" value={token} />{/if}
<div class="flex flex-col gap-3">
  <Input
    type="email"
    name="email"
    readonly={!!email}
    bind:value={email}
    autocomplete="email"
    placeholder="name@example.com"
  />
  <Input
    name="password"
    type="password"
    bind:value={password}
    placeholder="password"
    autocomplete="current-password"
  />
  {#if showMemberFields}
    <Input
      name="name"
      type="text"
      bind:value={name}
      placeholder="full name"
      autocomplete="family-name"
    />
    <Input
      type="text"
      name="handle"
      bind:value={handle}
      placeholder="handle"
      autocomplete="username"
    />
  {/if}
  <Button type="submit">{showMemberFields ? "Update" : "Sign-In"}</Button>
</div>
