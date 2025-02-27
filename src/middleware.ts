import PocketBase from "pocketbase";
import { defineMiddleware } from "astro:middleware";
import { PUBLIC_PB_ENDPOINT } from "astro:env/client";
import type { TypedPocketBase } from "@pocketbase/types";

const allowed = ["/insider/signin"];

export const onRequest = defineMiddleware(
  async ({ url, locals, request, redirect }, next) => {
    const client = new PocketBase(PUBLIC_PB_ENDPOINT) as TypedPocketBase;
    locals.client = client;

    if (!url.pathname.startsWith("/insider")) return next();
    if (allowed.some((a) => url.pathname.startsWith(a))) return next();

    client.authStore.loadFromCookie(request.headers.get("cookie") || "");

    if (!client.authStore.isValid) {
      client.authStore.clear();
      const response = redirect("/insider/signin");
      response.headers.append(
        "set-cookie",
        client.authStore.exportToCookie({ httpOnly: false })
      );
      return response;
    }

    try {
      await client.collection("users").authRefresh();
    } catch (_) {
      client.authStore.clear();
      const response = redirect("/insider/signin");
      response.headers.append(
        "set-cookie",
        client.authStore.exportToCookie({ httpOnly: false })
      );
      return response;
    }

    const response = await next();

    response.headers.append(
      "set-cookie",
      client.authStore.exportToCookie({ httpOnly: false })
    );
    return response;
  }
);
