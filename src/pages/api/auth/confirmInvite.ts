import client from "$/lib/supabase";
import type { APIRoute } from "astro";

export const prerender = false;
export const GET: APIRoute = async ({ url, redirect }) => {
  const token_hash = url.searchParams.get("token_hash")?.toString();

  if (!token_hash) {
    return new Response("Unable to confirm invite", { status: 400 });
  }

  const { error, data } = await client.auth.verifyOtp({
    token_hash,
    type: "email",
  });

  console.log(client);

  if (error || !data.session) {
    console.log(error);
    return new Response("Unable to confirm invite", { status: 400 });
  }

  return redirect(
    `/insider/auth/register?refresh_token=${data.session.refresh_token}&email=${data.session.user.email}`
  );
};
