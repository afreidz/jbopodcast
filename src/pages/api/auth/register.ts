import client from "$/lib/client";
import type { APIRoute } from "astro";

export const prerender = false;
export const POST: APIRoute = async ({ request, redirect }) => {
  const formData = await request.formData();
  const password = formData.get("password")?.toString();
  const token = formData.get("refresh_token")?.toString();

  if (!password || !token) {
    return new Response("Password and invite token is required", {
      status: 400,
    });
  }

  await client.auth.refreshSession({ refresh_token: token });

  const { error } = await client.auth.updateUser({
    password,
  });

  if (error) {
    return new Response(error.message, { status: 500 });
  }

  return redirect("/insider/auth/signin");
};
