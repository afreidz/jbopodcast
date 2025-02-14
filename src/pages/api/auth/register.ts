import prisma from "$/lib/prisma";
import client from "$/lib/supabase";
import type { APIRoute } from "astro";

export const prerender = false;
export const POST: APIRoute = async ({ request, redirect }) => {
  const formData = await request.formData();
  const password = formData.get("password")?.toString();
  let token = formData.get("refresh_token")?.toString();

  const name = formData.get("name")?.toString();
  const handle = formData.get("handle")?.toString();

  if (!token) {
    const session = await client.auth.getSession();
    token = session.data.session?.refresh_token;
    if (!token) return new Response("Unable to get token", { status: 401 });
  }

  if (!password) {
    return new Response("Password and invite token is required", {
      status: 400,
    });
  }

  await client.auth.refreshSession({ refresh_token: token });

  const { error, data } = await client.auth.updateUser({
    password,
  });

  if (data.user && (name || handle)) {
    await prisma.members.update({
      where: { id: data.user.id },
      data: {
        name,
        handle,
      },
    });
  }

  if (error) {
    return new Response(error.message, { status: 500 });
  }

  return redirect("/insider");
};
