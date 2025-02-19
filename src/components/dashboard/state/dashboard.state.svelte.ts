import { actions } from "astro:actions";
import type { Call } from "$/actions/calls";
import client from "$/lib/pocketbase/client";
import type { CurrentUser } from "$/lib/pocketbase/client";

export default class DashboardState {
  protected currentUser: CurrentUser;
  protected _loading: boolean = $state(true);
  protected _upcomingCalls: Call[] = $state([]);

  constructor(m: CurrentUser) {
    this.currentUser = m;
  }

  get upcomingCalls() {
    return this._upcomingCalls;
  }

  get loading() {
    return this._loading;
  }

  async init() {
    await this.refreshUpcoming();

    client.collection("calls").subscribe("*", async () => {
      await this.refreshUpcoming();
    })
  }

  protected async refreshUpcoming() {
    this._loading = true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const calls = await actions.calls.getUpcoming({ date: today, userId: this.currentUser?.id! });

    if (calls.error) {
      return console.error(calls.error);
    }

    this._upcomingCalls = calls.data satisfies Call[];
    this._loading = false;
  }
}
