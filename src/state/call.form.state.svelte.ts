import { toast } from "svelte-sonner";
import { actions } from "astro:actions";
import type { Call } from "$/actions/calls";
import client from "$/lib/pocketbase/client";
import type { Member } from "$/actions/members";
import userState from "$/state/user.state.svelte";
import type { SceneConfiguration } from "$/components/calls/scenes.svelte";
import { parseAbsoluteToLocal, type DateValue } from "@internationalized/date";

export type Timeslot = { value: { h: number; m: number }; label: string };

export const timeslots: Timeslot[] = [];
timeslots.push({ label: `12:00 AM`, value: { h: 0, m: 0 } });
timeslots.push({ label: `12:30 AM`, value: { h: 0, m: 30 } });
for (let i = 1; i < 12; i++) {
  timeslots.push({ label: `${i}:00 AM`, value: { h: i, m: 0 } });
  timeslots.push({ label: `${i}:30 AM`, value: { h: i, m: 30 } });
}
timeslots.push({ label: `12:00 PM`, value: { h: 12, m: 0 } });
timeslots.push({ label: `12:30 PM`, value: { h: 12, m: 30 } });
for (let i = 1; i < 12; i++) {
  timeslots.push({ label: `${i}:00 PM`, value: { h: i + 12, m: 0 } });
  timeslots.push({ label: `${i}:30 PM`, value: { h: i + 12, m: 30 } });
}

export default class CallFormState {
  protected _id: string = $state("");
  protected _title: string = $state("");
  protected _guests: string[] = $state([]);
  protected _loading: boolean = $state(true);
  protected _allMembers: Member[] = $state([]);
  protected _scheduled: Date = $state(new Date());
  protected _scenes: SceneConfiguration[] = $state([]);

  constructor() {
    const nextHalfHour = new Date();
    const minutes = nextHalfHour.getMinutes();
    if (minutes < 30) {
      nextHalfHour.setHours(nextHalfHour.getHours(), 30, 0, 0);
    } else {
      nextHalfHour.setHours(nextHalfHour.getHours() + 1, 0, 0, 0);
    }
    this._scheduled = nextHalfHour;

    if (!import.meta.env.SSR)
      client.collection("users").subscribe("*", () => this.refreshAllMembers());
  }

  get loading() {
    return this._loading;
  }

  get scheduled() {
    return this._scheduled;
  }

  get title() {
    return this._title;
  }

  set title(s: string) {
    this._title = s;
  }

  get guests() {
    return this._guests;
  }

  set guests(s: string[]) {
    this._guests = s;
  }

  get availableMembers() {
    return this._allMembers.filter((u) => u.id !== userState.currentUser?.id);
  }

  get participants() {
    return this._allMembers.filter((u) =>
      [userState.currentUser?.id, ...this._guests]
        .filter(Boolean)
        .some((g) => u.id === g)
    );
  }

  get scenes() {
    return this._scenes;
  }

  set scenes(s: SceneConfiguration[]) {
    this._scenes = s;
  }

  protected setFromCall(c: Call) {
    this._id = c.id;
    this._title = c.title;
    this._guests = c.guests;
    this._scheduled = new Date(c.scheduled);
  }

  updateScheduledTime(label: string) {
    const slot = timeslots.find((s) => s.label === label);
    if (!slot) return toast.error(`Unable to find timeslot for ${label}`);

    const zdt = parseAbsoluteToLocal(this.scheduled.toISOString());
    this._scheduled = zdt
      .set({
        hour: slot.value.h,
        minute: slot.value.m,
        second: 0,
        millisecond: 0,
      })
      .toDate();
  }

  updateScheduledDate(date?: DateValue) {
    if (!date) return;
    const zdt = parseAbsoluteToLocal(this._scheduled.toISOString());

    this._scheduled = zdt
      .set({ year: date.year, month: date.month, day: date.day })
      .toDate();
  }

  protected async refreshAllMembers() {
    this._loading = true;
    this._allMembers = (await actions.members.getAll()).data ?? [];
    this._loading = false;
  }

  protected async refreshFromCallId(callId?: string) {
    this._loading = true;
    if (!callId) return (this._loading = false);

    const { data, error } = await actions.calls.getById(callId);

    if (error) {
      console.error(error.message);
      return toast.error("Unable to set call. Check console for more.");
    }
    this._loading = false;
    return this.setFromCall(data);
  }

  async init(callId?: string) {
    await this.refreshAllMembers();
    await this.refreshFromCallId(callId);
  }

  async submit() {
    this._loading = true;

    if (!userState.currentUser)
      return toast.error("Unable to create call without a current user");

    if (this._id) return toast.error("Update not implemented yet");

    const response = await actions.calls.create({
      guests: this._guests,
      scenes: this._scenes,
      scheduled: this._scheduled,
      host: userState.currentUser.id,
      title: this._title.length ? this._title : `Call at ${this.scheduled}`,
    });

    if (response.error) {
      console.error(response.error.message);
      toast.error("Unable to save call. Check console for more.");
      return false;
    }

    this._loading = false;
    return true;
  }
}
