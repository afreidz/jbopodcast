import { actions } from "astro:actions";
import type { CurrentUser } from "$/actions/members";

class UserState {
  protected _user: CurrentUser | null = $state(null);

  async refresh() {
    this._user = (await actions.members.getCurrentUser()).data ?? null;
  }

  get currentUser() {
    return this._user;
  }
}

export default new UserState();
