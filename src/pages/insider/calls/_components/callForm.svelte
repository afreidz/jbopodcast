<script lang="ts">
  import {
    type DateValue,
    parseAbsoluteToLocal,
  } from "@internationalized/date";

  import { toast } from "svelte-sonner";
  import { actions } from "astro:actions";
  import Configure from "./configure.svelte";
  import * as Card from "$/components/ui/card";
  import { Label } from "$/components/ui/label";
  import { Input } from "$/components/ui/input";
  import type { Member } from "$/actions/members";
  import Avatar from "$/components/avatar.svelte";
  import { Calendar } from "$/components/ui/calendar";
  import { scrollShadowClasses } from "$/lib/classes";
  import { navigate } from "astro:transitions/client";
  import { ScrollArea } from "$/components/ui/scroll-area";
  import * as ToggleGroup from "$/components/ui/toggle-group";
  import type { SceneConfiguration } from "./configure.svelte";
  import { now, getLocalTimeZone } from "@internationalized/date";
  import { Button, buttonVariants } from "$/components/ui/button";

  type Props = {
    me: Member;
    id?: string;
    title?: string;
    scheduled: Date;
    guests?: string[];
    availableMembers: Member[];
    scenes?: SceneConfiguration[];
  };

  let {
    me,
    id = $bindable(),
    availableMembers = [],
    title = $bindable(""),
    scenes = $bindable([]),
    guests = $bindable([]),
    scheduled = $bindable(
      now(getLocalTimeZone())
        .add({ hours: 1 })
        .set({ minute: 0, second: 0, millisecond: 0 })
        .toDate()
    ),
  }: Props = $props();

  let timeslotContainer = $state<HTMLElement | null>(null);

  let timeLabel = $derived(
    scheduled.toLocaleTimeString("en-US", {
      hour12: true,
      hour: "numeric",
      minute: "2-digit",
    })
  );

  let callMembersForScenes = $derived([
    ...guests
      .map((id) => availableMembers.find((m) => m.id === id))
      .filter(Boolean),
    me,
  ] as Member[]);

  $effect(() => {
    if (!timeslotContainer || !timeLabel) return;
    const elm = timeslotContainer.querySelector(`[data-value="${timeLabel}"]`);
    if (elm) elm.scrollIntoView({ behavior: "smooth" });
  });

  let timeslots: { value: { h: number; m: number }; label: string }[] =
    $derived.by(() => {
      let slots: { value: { h: number; m: number }; label: string }[] = [];

      slots.push({ label: `12:00 AM`, value: { h: 0, m: 0 } });
      slots.push({ label: `12:30 AM`, value: { h: 0, m: 30 } });
      for (let i = 1; i < 12; i++) {
        slots.push({ label: `${i}:00 AM`, value: { h: i, m: 0 } });
        slots.push({ label: `${i}:30 AM`, value: { h: i, m: 30 } });
      }

      slots.push({ label: `12:00 PM`, value: { h: 12, m: 0 } });
      slots.push({ label: `12:30 PM`, value: { h: 12, m: 30 } });
      for (let i = 1; i < 12; i++) {
        slots.push({ label: `${i}:00 PM`, value: { h: i + 12, m: 0 } });
        slots.push({ label: `${i}:30 PM`, value: { h: i + 12, m: 30 } });
      }
      return slots;
    });

  function updateScheduledTime(label: string) {
    const slot = timeslots.find((s) => s.label === label);
    if (!slot) return toast.error(`Unable to find timeslot for ${label}`);

    const zdt = parseAbsoluteToLocal(scheduled.toISOString());
    scheduled = zdt
      .set({
        hour: slot.value.h,
        minute: slot.value.m,
        second: 0,
        millisecond: 0,
      })
      .toDate();
    return;
  }

  function updateScheduledDate(date?: DateValue) {
    if (!date) return;
    const zdt = parseAbsoluteToLocal(scheduled.toISOString());

    scheduled = zdt
      .set({ year: date.year, month: date.month, day: date.day })
      .toDate();
    return;
  }

  async function handeSubmit(e: SubmitEvent) {
    e.preventDefault();

    const result = await actions.calls.create({
      title,
      guests,
      scenes,
      scheduled,
      hostId: me.id,
    });

    if (result.error) {
      console.error(result.error);
      toast.error("Unable to create call. See console for more.");
      return;
    }

    return navigate("/insider/dashboard");
  }
</script>

<form
  method="POST"
  onsubmit={handeSubmit}
  class="mx-auto grid max-w-screen-xl gap-4 p-4"
>
  <section class="m-4 flex flex-wrap items-start gap-3 flex-1">
    <input type="hidden" bind:value={id} />
    <input type="hidden" bind:value={scheduled} name="scheduled" />
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
        bind:value={title}
        class="max-w-2xl mx-auto"
      />
    </div>
    <div class="flex flex-1 flex-col items-center gap-3">
      <Card.Title class="flex-none">Date</Card.Title>
      <Calendar
        type="single"
        preventDeselect={true}
        onValueChange={updateScheduledDate}
        class="flex-none rounded-md border"
        value={parseAbsoluteToLocal(scheduled.toISOString())}
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
            onValueChange={updateScheduledTime}
            class="flex flex-col gap-3 pb-8"
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
    {#if availableMembers.length}
      <div class="flex flex-1 flex-col items-center gap-3">
        <Card.Title>Members</Card.Title>
        <ScrollArea class={`w-[320px] h-80 ${scrollShadowClasses}`}>
          <div class="hidden">
            <select bind:value={guests} name="guests" multiple>
              {#each availableMembers as member}
                <option value={member.id}>{member.id}</option>
              {/each}
            </select>
          </div>
          <ToggleGroup.Root
            type="multiple"
            variant="outline"
            bind:value={guests}
            class="flex flex-col gap-3 pb-8"
          >
            {#each availableMembers as member}
              <ToggleGroup.Item
                value={member.id}
                class="flex !h-auto w-full justify-start !p-4 text-left first-of-type:z-20"
                aria-label={`Toggle ${member.name} on new call`}
              >
                <div class="flex items-center gap-3">
                  <Avatar name={member.name} email={member.user.email!} />
                  <div class="flex flex-col">
                    <span class="font-medium"
                      >{member.name || member.user.email}</span
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
  <Configure bind:scenes availableMembers={callMembersForScenes} />
  <footer class="flex justify-between mx-auto w-full">
    <a href="/insider/dashboard" class={buttonVariants({ variant: "outline" })}
      >Cancel</a
    >
    <Button type="submit">Create Call</Button>
  </footer>
</form>
