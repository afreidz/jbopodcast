<script lang="ts">
  import client from "$/lib/pocketbase";
  import { Button } from "$/components/ui/button";

  async function googleSignin() {
    await client.collection("users").authWithOAuth2({ provider: "google" });
    document.cookie = client.authStore.exportToCookie({ httpOnly: false });
    return (window.location.href = "/insider");
  }
</script>

<Button onclick={googleSignin}>Sign-In With Google</Button>
