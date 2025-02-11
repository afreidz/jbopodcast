import client from "$/lib/supabase";
import prismaClient from "$/lib/prisma";
import { defineMiddleware } from "astro:middleware";

const ALLOW_LIST = ["/insider/auth/signin", "/insider/auth/register"];

export const onRequest = defineMiddleware(
  async ({ locals, cookies, url, redirect }, next) => {
    if (
      !url.pathname.startsWith("/insider") ||
      ALLOW_LIST.some((i) => url.pathname.startsWith(i))
    )
      return next();

    const access_token = cookies.get("sb-access-token")?.value;
    const refresh_token = cookies.get("sb-refresh-token")?.value;

    if (!access_token || !refresh_token)
      return redirect("/insider/auth/signin");

    const { data } = await client.auth.setSession({
      refresh_token,
      access_token,
    });

    if (!data.user) return redirect("/insider/auth/signin");

    const member = await prismaClient.members.findFirst({
      where: { id: data.user.id },
    });

    if (!member) return redirect("/404");

    locals.user = {
      id: data.user.id,
      role: member.role,
      name: member.name,
      handle: member.handle,
      email: data.user.email!,
    };

    return next();
  }
);
