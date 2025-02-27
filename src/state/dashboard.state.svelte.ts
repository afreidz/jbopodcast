import { actions } from "astro:actions";
import type { Call } from "$/actions/calls";
import client from "$/lib/pocketbase/client";
import userState from "$/state/user.state.svelte";
import type { CurrentUser } from "$/actions/members";

export default class DashboardState {
  protected _loading: boolean = $state(false);
  protected _upcomingCalls: Call[] = $state([]);

  get upcomingCalls() {
    return this._upcomingCalls;
  }

  get loading() {
    return this._loading;
  }

  async init() {
    await this.refreshUpcoming();

    if (!import.meta.env.SSR)
      client.collection("calls").subscribe("*", async () => {
        await this.refreshUpcoming();
      });
  }

  protected async refreshUpcoming() {
    if (!userState.currentUser) return [];

    this._loading = true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const calls = await actions.calls.getUpcoming({
      date: today,
      userId: userState.currentUser.id,
    });

    if (calls.error) {
      return console.error(calls.error);
    }

    this._upcomingCalls = calls.data satisfies Call[];
    this._loading = false;
  }
}
