import { z } from "astro:schema";
import { defineAction } from "astro:actions";
import type { AuthRecord } from "pocketbase";
import { refresh } from "$/lib/pocketbase/server";
import type { UsersRecord } from "@pocketbase/types";

export const getCurrentUser = defineAction({
  handler: async (_, context) => {
    const client = await refresh(
      context.locals.client,
      context.request.headers.get("cookie")
    );
    const cookie = context.request.headers.get("cookie");

    client.authStore.loadFromCookie(cookie || "");
    await client.collection("users").authRefresh<CurrentUser>();

    if (!client.authStore.record) return null;
    return client.authStore.record as unknown as CurrentUser | null;
  },
});

export const getAll = defineAction({
  handler: async (_, context) => {
    const client = await refresh(
      context.locals.client,
      context.request.headers.get("cookie")
    );
    const resp = await client.collection("users").getFullList();
    return resp;
  },
});

export const getById = defineAction({
  input: z.string(),
  async handler(id, context) {
    const client = await refresh(
      context.locals.client,
      context.request.headers.get("cookie")
    );
    const resp = await client.collection("users").getOne(id);
    return resp;
  },
});

export const update = defineAction({
  input: z.object({
    name: z.string().min(3).max(140),
    handle: z.string().min(3).max(140),
  }),
  async handler({ name, handle }, context) {
    const client = await refresh(
      context.locals.client,
      context.request.headers.get("cookie")
    );
    return await client
      .collection("users")
      .update(client.authStore.record!.id, {
        name,
        handle,
      });
  },
});

export type Member = UsersRecord;
export type CurrentUser = AuthRecord;
