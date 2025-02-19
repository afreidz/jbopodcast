import { PUBLIC_PB_ENDPOINT } from "astro:env/client";
import PocketBase, { type AuthRecord } from "pocketbase";
import type { TypedPocketBase, UsersRecord } from "@pocketbase/types";

const pb = new PocketBase(PUBLIC_PB_ENDPOINT) as TypedPocketBase;
export default pb;

export type CurrentUser = {
  [A in keyof Omit<AuthRecord, "expand">]: AuthRecord[A];
} & {
  [K in keyof UsersRecord]: UsersRecord[K];
};

export function getCurrentUser() {
  if (!pb.authStore.isValid) {
    window.location.href = "/insider/signin";
    return null as unknown as CurrentUser;
  }

  const user = pb.authStore.record!
  return user as unknown as CurrentUser;
}

export async function refreshAuth() {
  await pb.collection("users").authRefresh();
}
