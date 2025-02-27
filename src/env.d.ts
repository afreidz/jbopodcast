interface Window {
  declare JBO_PODCAST_CONNECTION: import ("$/state/call.connect.state.svelte").default | null;
}

declare namespace App {
  interface Locals {
    client: import("../pocketbase/types").TypedPocketBase;
  }
}
