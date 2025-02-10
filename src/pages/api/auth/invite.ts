import client from "$/lib/supabase";
import type { APIRoute } from "astro";

export const prerender = false;
export const POST: APIRoute = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get("email")?.toString();

  if (!email) {
    return new Response("Email is required to invite", {
      status: 400,
    });
  }

  const response = await client.auth.admin.inviteUserByEmail(email);

  if (response.error) {
    return new Response("Unable to invite user", { status: 400 });
  }

  return new Response(`Invite sent to: ${response.data.user.email}`);
};
