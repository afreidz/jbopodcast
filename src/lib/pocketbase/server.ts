import PocketBase from "pocketbase";
import * as pbf from "@nedpals/pbf";
import { ActionError } from "astro:actions";
import { PUBLIC_PB_ENDPOINT } from "astro:env/client";
import { PB_SUPERUSER_TOKEN } from "astro:env/server";
import type { TypedPocketBase } from "@pocketbase/types";

const pb = new PocketBase(PUBLIC_PB_ENDPOINT) as TypedPocketBase;
pb.authStore.save(PB_SUPERUSER_TOKEN);
pb.autoCancellation(false);

export default pb;

export function queryBuilder(...q: Parameters<(typeof pbf)["stringify"]>) {
  return pbf.stringify(...q);
}

export const query = pbf;

export async function refresh(
  client: TypedPocketBase,
  cookie: string | null = ""
) {
  client.authStore.loadFromCookie(cookie ?? "");

  if (!client.authStore.isValid)
    throw new ActionError({
      code: "UNAUTHORIZED",
      message: "Auth state is not valid",
    });

  try {
    await client.collection("users").authRefresh();
  } catch (err: unknown) {
    console.error(err);
    throw new ActionError({
      code: "UNAUTHORIZED",
      message: "Could not refresh auth",
    });
  }

  return client;
}
