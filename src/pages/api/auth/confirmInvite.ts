import client from "$/lib/client";
import type { APIRoute } from "astro";

export const prerender = false;
export const GET: APIRoute = async ({ url, redirect }) => {
  const token_hash = url.searchParams.get("token_hash")?.toString();

  if (!token_hash) {
    return new Response("Unable to confirm invite", { status: 400 });
  }

  const {
    error,
    data: { session },
  } = await client.auth.verifyOtp({ token_hash, type: "invite" });

  if (error || !session) {
    console.log(error);
    return new Response("Unable to confirm invite", { status: 400 });
  }

  return redirect(
    `/insider/auth/register?refresh_token=${session?.refresh_token}&email=${session?.user.email}`
  );
};
