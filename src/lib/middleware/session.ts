import client from "$/lib/pocketbase";
import { defineMiddleware } from "astro/middleware";

const ALLOW_LIST = ["/insider/auth/signin"];

export const onRequest = defineMiddleware(
  async ({ url, redirect, request }, next) => {
    if (
      !url.pathname.startsWith("/insider") ||
      ALLOW_LIST.some((i) => url.pathname.startsWith(i))
    ){
      return next();
    }

    client.authStore.loadFromCookie(request.headers.get("cookie") ?? "");

    if (!client.authStore.isValid) return redirect("/insider/auth/signin", 303);

    await client.collection("users").authRefresh();

    return next();
  }
);
