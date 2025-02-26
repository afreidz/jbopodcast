<script lang="ts">
  import { actions } from "astro:actions";
  import { Input } from "$/components/ui/input";
  import { Label } from "$/components/ui/label";
  import { Button } from "$/components/ui/button";
  import * as Dialog from "$/components/ui/dialog";
  import * as Sidebar from "$/components/ui/sidebar";
  import Avatar from "$/components/shared/avatar.svelte";
  import * as DropdownMenu from "$/components/ui/dropdown-menu";
  import { getCurrentUser, refreshAuth } from "$/lib/pocketbase/client";

  import LogOut from "lucide-svelte/icons/log-out";
  import BadgeCheck from "lucide-svelte/icons/badge-check";
  import ChevronsUpDown from "lucide-svelte/icons/chevrons-up-down";

  const sidebar = Sidebar.useSidebar();

  let user = $state(getCurrentUser());
  let editingUserDetails: boolean = $state(false);
  let name: string = $state(getCurrentUser()?.name ?? "");
  let handle: string = $state(getCurrentUser()?.handle ?? "");

  async function updateUser(e: SubmitEvent) {
    e.preventDefault();
    await actions.members.update({
      name,
      handle,
    });
    await refreshAuth();
    user = getCurrentUser();
    editingUserDetails = false;
  }
</script>

{#if user}
  <Sidebar.Menu>
    <Sidebar.MenuItem>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          {#snippet child({ props })}
            <Sidebar.MenuButton
              {...props}
              size="lg"
              class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              {#if user}
                <Avatar
                  class="size-8"
                  name={user.handle || user.name}
                  email={user.email}
                />
                <div class="grid flex-1 text-left text-sm leading-tight">
                  <span class="truncate font-semibold">{user.name}</span>
                  <span class="truncate text-xs">{user.email}</span>
                </div>
                <ChevronsUpDown class="ml-auto size-4" />
              {/if}
            </Sidebar.MenuButton>
          {/snippet}
        </DropdownMenu.Trigger>
        <DropdownMenu.Content
          class="w-[--bits-dropdown-menu-anchor-width] min-w-56 rounded-lg"
          side={sidebar.isMobile ? "bottom" : "right"}
          align="end"
          sideOffset={4}
        >
          <DropdownMenu.Label class="p-0 font-normal">
            <div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <Avatar
                class="size-8"
                name={user.handle || user.name}
                email={user.email}
              />
              <div class="grid flex-1 text-left text-sm leading-tight">
                <span class="truncate font-semibold">{user.name}</span>
                <span class="truncate text-xs">{user.email}</span>
              </div>
            </div>
          </DropdownMenu.Label>
          <DropdownMenu.Separator />
          <DropdownMenu.Group>
            <DropdownMenu.Item onclick={() => (editingUserDetails = true)}>
              <BadgeCheck />
              Change Details
            </DropdownMenu.Item>
          </DropdownMenu.Group>
          <DropdownMenu.Separator />
          <DropdownMenu.Item>
            <LogOut />
            Log out
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </Sidebar.MenuItem>
  </Sidebar.Menu>

  <Dialog.Root
    open={editingUserDetails}
    onOpenChange={(e) => (editingUserDetails = e)}
  >
    <Dialog.Content>
      <Dialog.Header class="mb-4">
        <Dialog.Title>Update your information</Dialog.Title>
      </Dialog.Header>
      <form onsubmit={updateUser} class="flex flex-col gap-6">
        <div class="flex flex-col gap-1">
          <Label>Full Name</Label>
          <Input required type="text" bind:value={name} />
        </div>
        <div class="flex flex-col gap-1">
          <Label>Handle/Display-Name</Label>
          <Input
            required
            type="text"
            bind:value={handle}
            placeholder="Handle/Display-Name"
          />
        </div>
        <Button type="submit" class="mt-4">Update</Button>
      </form>
    </Dialog.Content>
  </Dialog.Root>
{/if}
