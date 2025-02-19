import PocketBase from "pocketbase";
import * as pbf from "@nedpals/pbf";
import type { AstroCookies } from "astro";
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

export async function impersonate(cookies: AstroCookies) {
  const { record } = cookies.get("pb_auth")?.json();

  if (!record?.id)
    throw new ActionError({
      code: "UNAUTHORIZED",
    });

  return await pb.collection("users").impersonate(record.id, 3600) as TypedPocketBase;
}
