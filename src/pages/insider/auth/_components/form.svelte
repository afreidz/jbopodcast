<script lang="ts">
  import { Input } from "$/components/ui/input";
  import { Label } from "$/components/ui/label";
  import { Button } from "$/components/ui/button";

  type Props = {
    email: string;
    token?: string;
  };

  let password: string = $state("");
  let { email = $bindable(), token }: Props = $props();
</script>

{#if token}<input type="hidden" name="refresh_token" value={token} />{/if}
<div class="flex flex-col gap-2">
  <Input
    type="email"
    name="email"
    readonly={!!email}
    bind:value={email}
    placeholder="name@example.com"
  />
  <Input
    name="password"
    type="password"
    bind:value={password}
    placeholder="password"
    autocomplete="current-password"
  />
  <Button type="submit">{token ? "Set password" : "Sign-In"}</Button>
</div>
