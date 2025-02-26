import PocketBase from "pocketbase";
import { defineMiddleware } from "astro:middleware";
import { PUBLIC_PB_ENDPOINT } from "astro:env/client";
import type { TypedPocketBase } from "@pocketbase/types";

export const onRequest = defineMiddleware(
  async ({ url, locals, request, redirect }, next) => {
    const allowed = ["/insider/signin"];

    if (!url.pathname.startsWith("/insider")) return next();
    if (allowed.some((a) => url.pathname.startsWith(a))) return next();

    const client = ((locals as { client: TypedPocketBase }).client =
      new PocketBase(PUBLIC_PB_ENDPOINT) as TypedPocketBase);

    client.authStore.loadFromCookie(request.headers.get("cookie") || "");

    try {
      client.authStore.isValid &&
        (await client.collection("users").authRefresh());
    } catch (_) {
      client.authStore.clear();
      return redirect("/insider/signin");
    }

    const response = await next();

    response.headers.append("set-cookie", client.authStore.exportToCookie());
    return response;
  }
);
