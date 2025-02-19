import { z } from "astro:schema";
import client from "$/lib/pocketbase";
import { defineAction } from "astro:actions";
import type { UsersRecord } from "@pocketbase/types";

export const getAll = defineAction({
  handler: async () => {
    const resp = await client.collection("users").getFullList();
    return resp;
  },
});

export const getById = defineAction({
  input: z.string(),
  async handler(id) {
    const resp = await client.collection("users").getOne(id);
    return resp;
  }
})

export type Member = UsersRecord;
export type CurrentUser = NonNullable<typeof client.authStore.record>;
