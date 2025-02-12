<script lang="ts" module>
  export { Spotlight, TwoUp, ThreeUp, FourUp, Pull, Splash, Countdown };
  export type SceneConfiguration = Omit<SceneCreateSchema, "callId">;
</script>

<script lang="ts">
  import type { Snippet } from "svelte";
  import { CALL_SCENE } from "@prisma/client";
  import { Input } from "$/components/ui/input";
  import type { Member } from "$/actions/members";
  import { Button } from "$/components/ui/button";
  import Avatar from "$/components/avatar.svelte";
  import * as Dialog from "$/components/ui/dialog";
  import MemberIcon from "lucide-svelte/icons/user";
  import SplashIcon from "lucide-svelte/icons/image";
  import { scrollShadowClasses } from "$/lib/classes";
  import { ScrollArea } from "$/components/ui/scroll-area";
  import type { SceneCreateSchema } from "$/actions/scenes";

  type Props = {
    availableMembers: Member[];
    scenes?: SceneConfiguration[];
  };

  let { scenes = $bindable([]), availableMembers = [] }: Props = $props();

  function addScene(type: CALL_SCENE) {
    scenes.push({
      type,
      label: "",
    });
  }
</script>

{#snippet empty()}
  <div class="flex size-full items-center justify-center text-muted">
    <MemberIcon size={20} strokeWidth={1} />
  </div>
{/snippet}

{#snippet emptySidebar()}
  <MemberIcon size={12} strokeWidth={1} class="text-muted" />
  <MemberIcon size={12} strokeWidth={1} class="text-muted" />
  <MemberIcon size={12} strokeWidth={1} class="text-muted" />
{/snippet}

{#snippet Spotlight(A: Snippet = empty)}
  <div class="p-1 aspect-video h-full">
    <div
      class="size-full grid border rounded-md overflow-clip gap-px bg-input"
      style="grid-template-areas: 'A';"
    >
      <i class="bg-background">{@render A()}</i>
    </div>
  </div>
{/snippet}

{#snippet TwoUp(A: Snippet = empty, B: Snippet = empty)}
  <div class="p-1 aspect-video h-full">
    <div
      class="size-full grid border rounded-md overflow-clip gap-px bg-input grid-cols-2"
      style="grid-template-areas: 'A B';"
    >
      <i class="bg-background">{@render A()}</i>
      <i class="bg-background">{@render B()}</i>
    </div>
  </div>
{/snippet}

{#snippet ThreeUp(A: Snippet = empty, B: Snippet = empty, C: Snippet = empty)}
  <div class="p-1 aspect-video h-full">
    <div
      class="size-full grid border rounded-md overflow-clip gap-px bg-input grid-cols-3"
      style="grid-template-areas: 'A B C';"
    >
      <i class="bg-background">{@render A()}</i>
      <i class="bg-background">{@render B()}</i>
      <i class="bg-background">{@render C()}</i>
    </div>
  </div>
{/snippet}

{#snippet FourUp(
  A: Snippet = empty,
  B: Snippet = empty,
  C: Snippet = empty,
  D: Snippet = empty
)}
  <div class="p-1 aspect-video h-full">
    <div
      class="size-full grid border rounded-md overflow-clip gap-px bg-input grid-cols-2 grid-rows-2"
      style="grid-template-areas: 'A B' 'C D';"
    >
      <i class="bg-background">{@render A()}</i>
      <i class="bg-background">{@render B()}</i>
      <i class="bg-background">{@render C()}</i>
      <i class="bg-background">{@render D()}</i>
    </div>
  </div>
{/snippet}

{#snippet Pull(A: Snippet = empty, REST: Snippet = emptySidebar)}
  <div class="p-1 aspect-video h-full">
    <div
      class="size-full grid border rounded-md overflow-clip gap-px bg-input grid-cols-4"
      style="grid-template-areas: 'A A A B';"
    >
      <i class="bg-background" style="grid-area: A;">{@render A()}</i>
      <div
        class="bg-background p-1 flex flex-col gap-1 items-center justify-evenly"
      >
        {@render REST()}
      </div>
    </div>
  </div>
{/snippet}

{#snippet Countdown()}
  <div class="p-1 aspect-video h-full">
    <div
      class="size-full grid border rounded-md overflow-clip gap-px bg-input"
      style="grid-template-areas: 'A';"
    >
      <i
        class="bg-background flex items-center justify-center text-xs font-bold text-input"
        >00:10</i
      >
    </div>
  </div>
{/snippet}

{#snippet Splash()}
  <div class="p-1 aspect-video h-full">
    <div
      class="size-full grid border rounded-md overflow-clip gap-px bg-input"
      style="grid-template-areas: 'A';"
    >
      <i
        class="bg-background flex items-center justify-center text-xs font-bold text-input"
      >
        <SplashIcon size={30} strokeWidth={1} />
      </i>
    </div>
  </div>
{/snippet}

{#snippet SceneSelectButton(
  icon: Snippet,
  label: string,
  e: CALL_SCENE,
  onclick?: (s: CALL_SCENE) => void
)}
  <button
    type="button"
    onclick={() => onclick?.(e)}
    class="h-20 flex gap-6 items-center hover:bg-input ring-input w-full p-1 rounded-md overflow-clip"
  >
    {@render icon()}
    <strong>{label}</strong>
  </button>
{/snippet}

{#snippet SceneMemberButton(
  scene: SceneConfiguration,
  position: "AID" | "BID" | "CID" | "DID"
)}
  {@const member = availableMembers.find((m) => m.id === scene[position])}
  <input
    required
    type="text"
    bind:value={scene[position]}
    class="h-px w-px absolute text-[0px]"
    name={`pos_${+new Date()}_${position}`}
    oninvalid={(e) =>
      e.currentTarget.setCustomValidity(
        "Please choose a member for this scene location"
      )}
  />
  <Dialog.Root>
    <Dialog.Trigger
      type="button"
      class="size-full flex items-center justify-center"
    >
      {#if member}
        <Avatar
          name={member.handle || member.name}
          email={member.user.email!}
        />
      {:else}
        <MemberIcon class="text-muted" />
      {/if}
    </Dialog.Trigger>
    <Dialog.Content class="sm:max-w-[425px]">
      <Dialog.Header>
        <Dialog.Title>Add Member to Scene Location</Dialog.Title>
      </Dialog.Header>
      {#each availableMembers as member}
        <Button
          variant="outline"
          onclick={() => (scene[position] = member.id)}
          class="flex justify-start gap-3 p-4 h-auto mb-2"
        >
          <Avatar
            email={member.user.email!}
            name={member.handle || member.name}
          />
          <div class="flex flex-col">
            <span class="font-medium">{member.name || member.user.email}</span>
            <span class="text-sm text-muted-foreground">{member.handle}</span>
          </div>
        </Button>
      {/each}
    </Dialog.Content>
  </Dialog.Root>
{/snippet}

<div class="rounded-md border flex">
  <div class="flex-1 border-r flex flex-col">
    <strong class="text-center mt-3 text-xs font-semibold uppercase text-muted"
      >Select a Scene Type</strong
    >
    <ScrollArea class="p-4 flex-none flex flex-col h-96 {scrollShadowClasses}">
      {@render SceneSelectButton(
        Spotlight,
        "Spotlight",
        CALL_SCENE["spotlight"],
        addScene
      )}
      {@render SceneSelectButton(
        TwoUp,
        "Two Up",
        CALL_SCENE["twoUp"],
        addScene
      )}
      {@render SceneSelectButton(
        ThreeUp,
        "Three Up",
        CALL_SCENE["threeUp"],
        addScene
      )}
      {@render SceneSelectButton(
        FourUp,
        "Four Up",
        CALL_SCENE["fourUp"],
        addScene
      )}
      {@render SceneSelectButton(
        Pull,
        "Pull One",
        CALL_SCENE["pull"],
        addScene
      )}
      {@render SceneSelectButton(
        Countdown,
        "Countdown",
        CALL_SCENE["countdown"],
        addScene
      )}
      {@render SceneSelectButton(
        Splash,
        "Splash Screen",
        CALL_SCENE["splash"],
        addScene
      )}
    </ScrollArea>
  </div>
  <div class="flex-1 flex flex-col">
    <strong class="text-center mt-3 text-xs font-semibold uppercase text-muted"
      >Configure Scene Members and Labels</strong
    >
    <ScrollArea
      class="w-full flex flex-wrap gap-2 m-2 h-96 {scrollShadowClasses}"
    >
      {#each scenes as scene}
        {#snippet AMember()}
          {@render SceneMemberButton(scene, "AID")}
        {/snippet}
        {#snippet BMember()}
          {@render SceneMemberButton(scene, "BID")}
        {/snippet}
        {#snippet CMember()}
          {@render SceneMemberButton(scene, "CID")}
        {/snippet}
        {#snippet DMember()}
          {@render SceneMemberButton(scene, "DID")}
        {/snippet}
        <div class="flex items-center gap-4">
          <div class="h-28">
            {#if scene.type === "spotlight"}
              {@render Spotlight(AMember)}
            {:else if scene.type === "twoUp"}
              {@render TwoUp(AMember, BMember)}
            {:else if scene.type === "threeUp"}
              {@render ThreeUp(AMember, BMember, CMember)}
            {:else if scene.type === "fourUp"}
              {@render FourUp(AMember, BMember, CMember, DMember)}
            {:else if scene.type === "pull"}
              {@render Pull(AMember)}
            {:else if scene.type === "splash"}
              {@render Splash()}
            {:else if scene.type === "countdown"}
              {@render Countdown()}
            {/if}
          </div>
          <div class="flex flex-1 flex-col gap-2 justify-center">
            <Input
              required
              class="w-[300px]"
              bind:value={scene.label}
              placeholder="Scene Label"
            />
            {#if scene.type === "countdown"}
              <Input
                step={1}
                required
                min={1000}
                type="number"
                class="w-[300px]"
                placeholder="Countdown in MS"
                bind:value={scene.countdownMS}
              />
            {/if}
            {#if scene.type === "splash"}
              <Input
                required
                type="url"
                class="w-[300px]"
                bind:value={scene.countdownMS}
                placeholder="URL for splash image"
              />
            {/if}
          </div>
        </div>
      {/each}
    </ScrollArea>
  </div>
</div>
