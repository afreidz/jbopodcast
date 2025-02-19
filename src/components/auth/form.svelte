<script lang="ts">
  import client from "$/lib/pocketbase/client";
  import { Input } from "$/components/ui/input";
  import { Button } from "$/components/ui/button";

  let email: string = $state("");
  let password: string = $state("");
  let showCredentials: boolean = $state(false);

  async function googleSignin() {
    await client.collection("users").authWithOAuth2({ provider: "google" });
    document.cookie = client.authStore.exportToCookie({ httpOnly: false });
    return (window.location.href = "/insider");
  }

  async function credentialSignin(e: SubmitEvent) {
    e.preventDefault();
    await client.collection("users").authWithPassword(email, password);
    document.cookie = client.authStore.exportToCookie({ httpOnly: false });
    return (window.location.href = "/insider");
  }
</script>

<div class="flex flex-col gap-4 items-center mt-4 flex-1 justify-stretch">
  <Button onclick={googleSignin}>Sign-In With Google</Button>
  <span>or</span>
  <button class="opacity-50 text-xs" onclick={() => (showCredentials = true)}
    >Use Email/Password</button
  >
  {#if showCredentials}
    <form onsubmit={credentialSignin} class="flex flex-col gap-2">
      <Input
        type="email"
        placeholder="email address"
        bind:value={email}
        required
      />
      <Input
        type="password"
        placeholder="password"
        bind:value={password}
        required
      />
      <Button type="submit">Sign-In</Button>
    </form>
  {/if}
</div>
