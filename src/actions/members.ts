import { z } from "astro:schema";
import { defineAction } from "astro:actions";
import type { UsersRecord } from "@pocketbase/types";
import client, { impersonate } from "$/lib/pocketbase/server";

export const getAll = defineAction({
  handler: async () => {
    const resp = await client.collection("users").getFullList();
    return resp;
  },
});

export const getById = defineAction({
  input: z.string(),
  async handler(id, context) {
    const client = await impersonate(context.cookies);
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
    const client = await impersonate(context.cookies);
    return await client.collection("users").update(client.authStore.record!.id, {
      name,
      handle,
    })
  }
})

export type Member = UsersRecord;
