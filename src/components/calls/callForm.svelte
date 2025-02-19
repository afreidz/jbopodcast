<script lang="ts">
  import { onMount } from "svelte";
  import client from "$/lib/pocketbase";
  import * as Card from "$/components/ui/card";
  import { Label } from "$/components/ui/label";
  import { Input } from "$/components/ui/input";
  import { Calendar } from "$/components/ui/calendar";
  import { navigate } from "astro:transitions/client";
  import { scrollShadowClasses } from "$/lib/classes";
  import Avatar from "$/components/shared/avatar.svelte";
  import { ScrollArea } from "$/components/ui/scroll-area";
  import * as ToggleGroup from "$/components/ui/toggle-group";
  import { parseAbsoluteToLocal } from "@internationalized/date";
  import { Button, buttonVariants } from "$/components/ui/button";
  import CallFormState, { timeslots } from "./callForm.state.svelte";
  import Configure, { type SceneConfiguration } from "./configure.svelte";

  const callForm = new CallFormState(client.authStore.record!);

  type Props = {
    id?: string;
  };

  onMount(async () => {
    await callForm.init(id);
  });

  let { id }: Props = $props();
  let scenes: SceneConfiguration[] = $state([]);
  let timeslotContainer = $state<HTMLElement | null>(null);

  let timeLabel = $derived(
    callForm.scheduled.toLocaleTimeString("en-US", {
      hour12: true,
      hour: "numeric",
      minute: "2-digit",
    })
  );

  $effect(() => {
    if (!timeslotContainer || !timeLabel) return;
    const elm = timeslotContainer.querySelector(`[data-value="${timeLabel}"]`);
    if (elm) elm.scrollIntoView({ behavior: "smooth" });
  });

  $inspect(
    callForm.scheduled,
    callForm.title,
    callForm.availableMembers,
    scenes
  );

  async function handeSubmit(e: SubmitEvent) {
    e.preventDefault();
    const success = await callForm.submit();
    if (success) return navigate("/insider/dashboard");
  }
</script>

<form
  method="POST"
  onsubmit={handeSubmit}
  class="mx-auto grid max-w-screen-xl gap-4 p-4"
>
  <section class="m-4 flex flex-wrap items-start gap-3 flex-1">
    <input type="hidden" bind:value={id} />
    <input type="hidden" bind:value={callForm.scheduled} name="scheduled" />
    <div class="my-4 grid w-full text-center">
      <Label for="title" class="mb-3 max-w-2xl mx-auto">
        <Card.Title>Title for this call</Card.Title>
      </Label>
      <Input
        min="3"
        max="75"
        required
        id="title"
        type="text"
        name="title"
        class="max-w-2xl mx-auto"
        bind:value={callForm.title}
      />
    </div>
    <div class="flex flex-1 flex-col items-center gap-3">
      <Card.Title class="flex-none">Date</Card.Title>
      <Calendar
        type="single"
        preventDeselect={true}
        class="flex-none rounded-md border"
        onValueChange={(v) => callForm.updateScheduledDate(v)}
        value={parseAbsoluteToLocal(callForm.scheduled.toISOString())}
      />
    </div>
    <div class="flex flex-1 flex-col items-center gap-3">
      <Card.Title>Time</Card.Title>
      <ScrollArea class={`w-[320px] h-80 ${scrollShadowClasses}`}>
        <div class="flex flex-col gap-3 pb-8">
          <ToggleGroup.Root
            type="single"
            variant="outline"
            value={timeLabel}
            bind:ref={timeslotContainer}
            class="flex flex-col gap-3 pb-8"
            onValueChange={(v) => callForm.updateScheduledTime(v)}
          >
            {#each timeslots as slot}
              <ToggleGroup.Item
                value={slot.label}
                class="w-full first-of-type:z-20">{slot.label}</ToggleGroup.Item
              >
            {/each}
          </ToggleGroup.Root>
        </div>
      </ScrollArea>
    </div>
    {#if callForm.availableMembers.length}
      <div class="flex flex-1 flex-col items-center gap-3">
        <Card.Title>Members</Card.Title>
        <ScrollArea class={`w-[320px] h-80 ${scrollShadowClasses}`}>
          <div class="hidden">
            <select bind:value={callForm.guests} name="guests" multiple>
              {#each callForm.availableMembers as member}
                <option value={member.id}>{member.id}</option>
              {/each}
            </select>
          </div>
          <ToggleGroup.Root
            type="multiple"
            variant="outline"
            bind:value={callForm.guests}
            class="flex flex-col gap-3 pb-8"
          >
            {#each callForm.availableMembers as member}
              <ToggleGroup.Item
                value={member.id}
                class="flex !h-auto w-full justify-start !p-4 text-left first-of-type:z-20"
                aria-label={`Toggle ${member.name} on new call`}
              >
                <div class="flex items-center gap-3">
                  <Avatar name={member.name} email={member.email!} />
                  <div class="flex flex-col">
                    <span class="font-medium"
                      >{member.name || member.email}</span
                    >
                    <span class="text-sm text-muted-foreground"
                      >{member.handle}</span
                    >
                  </div>
                </div>
              </ToggleGroup.Item>
            {/each}
          </ToggleGroup.Root>
        </ScrollArea>
      </div>
    {/if}
  </section>
  <Card.Title class="mt-8 m-4 text-center">Scenes</Card.Title>
  <Configure
    bind:scenes={callForm.scenes}
    availableMembers={callForm.participants}
  />
  <footer class="flex justify-between mx-auto w-full">
    <a href="/insider/dashboard" class={buttonVariants({ variant: "outline" })}
      >Cancel</a
    >
    <Button type="submit">Create Call</Button>
  </footer>
</form>
